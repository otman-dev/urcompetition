import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Team } from '@/models/Team';


export async function GET() {
  try {
    await connectToDatabase();
    const teams = await Team.find().sort({ teamName: 1 });
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
} 