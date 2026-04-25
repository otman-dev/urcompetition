import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { requireApprovedUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireApprovedUser(request);
    await connectToDatabase();

    const pendingUsers = await User.find({ approved: false }).select('email role createdAt');

    return NextResponse.json({ pending: pendingUsers });
  } catch (error) {
    console.error('Pending users error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
