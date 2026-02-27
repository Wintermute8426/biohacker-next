// app/api/extract-lab-data/route.ts
// WORKING VERSION - Bypasses TypeScript document type check

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read PDF as buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Pdf = buffer.toString('base64');

    console.log('Processing PDF, size:', buffer.length);

    // Extract data with Claude
    // @ts-ignore - SDK doesn't have document type in TypeScript yet, but API supports it
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Pdf,
              },
            },
            {
              type: 'text',
              text: `Extract ALL lab test markers from this medical lab report PDF. For each marker, extract:
- marker_name: The test name (e.g., "Testosterone", "Glucose", "Cholesterol")
- value: The numeric value
- unit: The unit of measurement (e.g., "ng/dL", "mg/dL", "pg/mL")
- reference_min: Lower bound of reference range (if available)
- reference_max: Upper bound of reference range (if available)
- category: One of: hormone, metabolic, cardiovascular, inflammatory, liver, kidney, thyroid, vitamin, general

Also extract:
- test_date: The date of the test (YYYY-MM-DD format)
- lab_name: The name of the laboratory (if visible)

Return ONLY valid JSON in this exact format:
{
  "test_date": "YYYY-MM-DD",
  "lab_name": "Lab Name",
  "markers": [
    {
      "marker_name": "Testosterone",
      "value": 450,
      "unit": "ng/dL",
      "reference_min": 300,
      "reference_max": 1000,
      "category": "hormone",
      "is_flagged": false
    }
  ]
}

Set is_flagged to true if the value is outside the reference range.
If you can't determine a field, use null.
Extract ALL markers you can find in the document.`,
            },
          ] as any, // Type assertion to bypass TypeScript check
        },
      ],
    });

    console.log('Claude response received');

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not find JSON in response:', responseText);
      throw new Error('Could not parse JSON from Claude response');
    }

    const extractedData = JSON.parse(jsonMatch[0]);
    console.log('Successfully extracted data, markers:', extractedData.markers?.length || 0);

    return NextResponse.json(extractedData);
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract lab data' },
      { status: 500 }
    );
  }
}
