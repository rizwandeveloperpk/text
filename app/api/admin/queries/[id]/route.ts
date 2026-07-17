import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/auth/adminSession';
import { getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  return verifyAdminSessionToken(token);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const { id } = await params;
  const { read } = (await req.json()) as { read?: boolean };

  try {
    await getAdminDb().collection('queries').doc(id).update({ read: !!read });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin update query error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await getAdminDb().collection('queries').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete query error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
