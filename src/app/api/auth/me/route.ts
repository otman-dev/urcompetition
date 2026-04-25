import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = await getUserFromSession(request);
  if (!auth) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    email: auth.user.email,
    userId: auth.user._id.toString(),
    approved: auth.user.approved,
    role: auth.user.role,
  });
}
