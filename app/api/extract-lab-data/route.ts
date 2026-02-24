import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const PDFParser = (await import('pdf2json')).default;
    const pdfParser = new PDFParser();
    
    const extractedText = await new Promise<string>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        let text = '';
        pdfData.Pages?.forEach((page: any) => {
          page.Texts?.forEach((textItem: any) => {
            try {
              text += decodeURIComponent(textItem.R[0].T) + ' ';
            } catch (e) {
              text += textItem.R[0].T + ' ';
            }
          });
        });
        resolve(text);
      });
      pdfParser.parseBuffer(buffer);
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Extract ALL lab test markers from this medical lab report text. Return ONLY valid JSON in this format:
{
  "test_date": "YYYY-MM-DD",
  "lab_name": "Lab Name",
  "markers": [{
    "marker_name": "Testosterone",
    "value": 450,
    "unit": "ng/dL",
    "reference_min": 300,
    "reference_max": 1000,
    "category": "hormone",
    "is_flagged": false
  }]
}

LAB REPORT TEXT:
${extractedText}`,
      }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse JSON');

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
