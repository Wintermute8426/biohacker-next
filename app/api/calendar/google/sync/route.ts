import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get calendar connection
    const { data: connection, error: connError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single()

    if (connError || !connection) {
      return NextResponse.json({ error: 'No calendar connection found' }, { status: 404 })
    }

    // Check if token is expired and refresh if needed
    let accessToken = connection.access_token
    const tokenExpiry = new Date(connection.token_expiry)
    
    if (tokenExpiry <= new Date()) {
      // Token expired, refresh it
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID!,
          client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      if (!refreshResponse.ok) {
        return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 })
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token
      const newExpiry = new Date(Date.now() + refreshData.expires_in * 1000)

      // Update stored token
      await supabase
        .from('calendar_connections')
        .update({
          access_token: accessToken,
          token_expiry: newExpiry.toISOString(),
          last_sync: new Date().toISOString(),
          sync_status: 'syncing'
        })
        .eq('user_id', user.id)
        .eq('provider', 'google')
    }

    // Get user's active cycles
    const { data: cycles, error: cyclesError } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (cyclesError || !cycles || cycles.length === 0) {
      await supabase
        .from('calendar_connections')
        .update({ sync_status: 'success', last_sync: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('provider', 'google')
      
      return NextResponse.json({ 
        message: 'No active cycles to sync',
        eventCount: 0 
      })
    }

    // Get all doses for active cycles
    const cycleIds = cycles.map(c => c.id)
    const { data: doses, error: dosesError } = await supabase
      .from('doses')
      .select('*')
      .in('cycle_id', cycleIds)
      .gte('scheduled_date', new Date().toISOString().split('T')[0]) // Only future doses
      .order('scheduled_date', { ascending: true })

    if (dosesError || !doses) {
      return NextResponse.json({ error: 'Failed to fetch doses' }, { status: 500 })
    }

    // Create Google Calendar events
    let eventCount = 0
    const errors: string[] = []

    for (const dose of doses) {
      const cycle = cycles.find(c => c.id === dose.cycle_id)
      if (!cycle) continue

      // Create event
      const event = {
        summary: `💉 ${cycle.peptide_name} - ${dose.dose_amount}${dose.dose_unit}`,
        description: `Cycle: ${cycle.name}\nPeptide: ${cycle.peptide_name}\nDose: ${dose.dose_amount}${dose.dose_unit}\n\nLogged via Biohacker Protocol Tracker`,
        start: {
          date: dose.scheduled_date, // All-day event
        },
        end: {
          date: dose.scheduled_date,
        },
        colorId: '9', // Blue color for medical/health
      }

      try {
        const response = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          }
        )

        if (response.ok) {
          eventCount++
        } else {
          const errorData = await response.json()
          errors.push(`${cycle.peptide_name} on ${dose.scheduled_date}: ${errorData.error?.message || 'Unknown error'}`)
        }
      } catch (error) {
        errors.push(`${cycle.peptide_name} on ${dose.scheduled_date}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Update sync status
    await supabase
      .from('calendar_connections')
      .update({
        sync_status: errors.length > 0 ? 'error' : 'success',
        last_sync: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('provider', 'google')

    return NextResponse.json({
      message: `Synced ${eventCount} events to Google Calendar`,
      eventCount,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
