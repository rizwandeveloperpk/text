import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/auth/adminSession';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // This route sits under /api/, not /admin/, so it isn't covered by the
  // proxy matcher — verify the session cookie here explicitly instead
  // of assuming proxy.ts already protected it.
  const token = req.cookies.get('admin_session')?.value;
  const valid = await verifyAdminSessionToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing user id.' }, { status: 400 });
  }

  try {
    const adminDb = getAdminDb();

    // Delete the user's Firestore data.
    await adminDb.collection('users').doc(id).delete();
    await adminDb.collection('profiles').doc(id).delete().catch(() => {});

    const conversionsSnap = await adminDb.collection('conversions').where('userId', '==', id).get();
    await Promise.all(conversionsSnap.docs.map((d) => d.ref.delete()));

    // Also remove the actual Firebase Auth account so they can't just log
    // back in — deleting only the Firestore doc would leave a "ghost" user.
    await getAdminAuth().deleteUser(id).catch((err) => {
      console.error('Could not delete Firebase Auth user (Firestore data was still removed):', err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete user error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
