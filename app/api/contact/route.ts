import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { isValidEmail } from '@/lib/utils/validators';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email, message } = (await req.json()) as { email?: string; message?: string };

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Please enter a message.' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
    }

    await getAdminDb()
      .collection('queries')
      .add({
        email: email.trim(),
        message: message.trim(),
        read: false,
        createdAt: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact route error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
