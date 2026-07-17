import { NextRequest, NextResponse } from 'next/server';
import { transcribeHandwriting } from '@/lib/gemini/ocr';
import { getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, imageUrl, userId, languageHint, temperature } = body as {
      imageBase64: string;
      mimeType: string;
      imageUrl: string;
      userId?: string;
      languageHint?: string;
      temperature?: number;
    };

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Missing image data.' }, { status: 400 });
    }

    const result = await transcribeHandwriting(imageBase64, mimeType, { languageHint, temperature });

    // Only persist a history row for logged-in users. Guests get the
    // result back directly and it is never written to the database — so
    // this is also the only branch that needs the Admin SDK to be configured.
    if (userId) {
      const adminDb = getAdminDb();

      await adminDb.collection('conversions').add({
        userId,
        imageUrl: imageUrl ?? null,
        extractedText: result.text,
        words: result.words,
        characters: result.characters,
        favorite: false,
        createdAt: new Date().toISOString(),
      });

      const profileRef = adminDb.collection('profiles').doc(userId);
      const profileSnap = await profileRef.get();
      if (profileSnap.exists) {
        const data = profileSnap.data();
        await profileRef.update({ credits: Math.max(0, (data?.credits ?? 0) - 1) });
      }
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('OCR route error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Something went wrong while reading that image: ${message}` },
      { status: 500 }
    );
  }
}
