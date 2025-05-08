import { connectToDatabase } from '@/lib/mongodb';
import { Team } from '@/models/Team';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { teamName } = await req.json();
    
    if (!teamName || typeof teamName !== 'string') {
      return NextResponse.json(
        { message: 'Team name is required and must be a string' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const existing = await Team.findOne({ teamName });
    if (existing) {
      return NextResponse.json(
        { message: 'Team already exists' },
        { status: 400 }
      );
    }

    const team = new Team({ teamName });
    await team.save();
    
    return NextResponse.json(
      { message: 'Team registered successfully', team },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { 
        message: 'Server error', 
        error: err instanceof Error ? err.message : 'Unknown error',
        details: err instanceof Error ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}