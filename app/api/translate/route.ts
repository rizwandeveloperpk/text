import { NextRequest, NextResponse } from 'next/server';
import { translateToEnglish } from '@/lib/gemini/translate';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text?: string };

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Nothing to translate.' }, { status: 400 });
    }

    const { translatedText } = await translateToEnglish(text);
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translate route error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
