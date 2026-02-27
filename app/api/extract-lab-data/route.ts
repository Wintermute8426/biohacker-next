// app/api/extract-lab-data/route.ts
// Simple version: pdf-parse + Haiku (like AI Insights uses Sonnet for text)

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// Simple PDF text extraction using pdfjs-dist (no system dependencies)
async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid build issues
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
  
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('Processing PDF, size:', buffer.length);

    // Extract text from PDF
    console.log('Extracting text from PDF...');
    const pdfText = await extractPdfText(buffer);
    console.log('Extracted text length:', pdfText.length);

    if (!pdfText || pdfText.length < 50) {
      throw new Error('Could not extract sufficient text from PDF');
    }

    // Send to Claude Haiku (same pattern as AI Insights uses Sonnet)
    console.log('Sending to Claude Haiku for analysis...');
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Extract ALL lab test markers from this medical lab report text. For each marker, extract:
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
Extract ALL markers you can find in the document.

Here is the lab report text:

${pdfText}`
        }
      ]
    });

    console.log('Claude response received');

    // Parse response (same as AI Insights)
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
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
