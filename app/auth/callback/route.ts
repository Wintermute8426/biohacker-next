import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: onboarding } = await supabase
        .from('user_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // If no onboarding record, redirect to onboarding
      if (!onboarding) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  // Redirect to app if onboarding completed
  return NextResponse.redirect(new URL('/app', request.url))
}
