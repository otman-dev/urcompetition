import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { requireApprovedUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireApprovedUser(request);
    await connectToDatabase();

    const users = await User.find().select('email role approved createdAt');

    return NextResponse.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
