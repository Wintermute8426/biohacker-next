import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Load user's cycles
    const { data: cycles } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true });

    // Load user's lab reports with markers
    const { data: labReports } = await supabase
      .from('lab_reports')
      .select(`
        *,
        lab_markers (*)
      `)
      .eq('user_id', user.id)
      .order('test_date', { ascending: true });

    if (!cycles || !labReports || cycles.length === 0 || labReports.length === 0) {
      return NextResponse.json({
        error: 'Insufficient data. Need at least 1 cycle and 1 lab report.'
      }, { status: 400 });
    }

    // Build analysis prompt
    const cyclesSummary = cycles.map((c: any) =>
      `${c.peptide_name} (${c.dose_amount}): ${c.start_date} to ${c.end_date}, status: ${c.status}, adherence: ${((c.doses_logged / c.total_expected_doses) * 100).toFixed(0)}%`
    ).join('\n');

    const labsSummary = labReports.map((r: any) => {
      const keyMarkers = r.lab_markers?.filter((m: any) =>
        ['Testosterone Total', 'IGF-1', 'CRP (High Sensitivity)', 'HDL Cholesterol'].includes(m.marker_name)
      ) || [];
      return `${r.test_date} (${r.lab_name}): ${keyMarkers.map((m: any) => `${m.marker_name}: ${m.value} ${m.unit}`).join(', ')}`;
    }).join('\n');

    const prompt = `You are an expert peptide therapy analyst. Analyze this user's cycle and lab data to provide actionable insights.

**CYCLES:**
${cyclesSummary}

**LAB RESULTS:**
${labsSummary}

Provide 3-5 insights in this EXACT JSON format:
{
  "insights": [
    {
      "type": "positive" | "neutral" | "caution",
      "title": "Short title (5-8 words)",
      "insight": "Detailed observation (2-3 sentences)",
      "recommendation": "Actionable next step (1-2 sentences)"
    }
  ]
}

Focus on:
1. Correlations between specific cycles and lab improvements
2. Patterns in adherence and outcomes
3. Timing relationships (cycles 3 months before lab improvements)
4. Stacking synergies (peptides used together)
5. Safety considerations (any concerning trends)

Return ONLY the JSON, no markdown formatting.`;

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not parse insights from Claude response');
    }

    const insights = JSON.parse(jsonMatch[0]);

    return NextResponse.json(insights);
  } catch (error: any) {
    console.error('AI insights error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
