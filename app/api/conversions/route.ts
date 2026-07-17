import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId.' }, { status: 400 });
  }

  try {
    const snapshot = await getAdminDb()
      .collection('conversions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const conversions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ conversions });
  } catch (error) {
    console.error('Conversions GET error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  }
  try {
    await getAdminDb().collection('conversions').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversions DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
