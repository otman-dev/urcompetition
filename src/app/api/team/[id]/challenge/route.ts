import { connectToDatabase } from '@/lib/db';
import { Team } from '@/models/Team';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const preferredRegion = 'auto';

const CHALLENGE_POINTS = {
  defi1: 20,
  defi2: 20,
  defi3: 20,
  defi4: 20,
  defi5: 20,
  defi6: 20,
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { challengeId, success } = await request.json();
    
    if (!challengeId || typeof success !== 'boolean') {
      return NextResponse.json(
        { message: 'Invalid challenge data' },
        { status: 400 }
      );
    }

    if (!(challengeId in CHALLENGE_POINTS)) {
      return NextResponse.json(
        { message: 'Invalid challenge ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const team = await Team.findById(id);
    
    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
    }

    // Update challenge score
    team.detailedScores[challengeId as keyof typeof CHALLENGE_POINTS] = success
      ? CHALLENGE_POINTS[challengeId as keyof typeof CHALLENGE_POINTS]
      : 0;

    // Calculate total score excluding timer
    const challengeScores = Object.entries(team.detailedScores)
      .filter(([key]) => key !== 'timer')
      .reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);

    // Calculate intervention penalty
    const interventionPenalty = (team.interventions || 0) * -3;

    // Update global score
    team.globalScore = challengeScores + interventionPenalty;

    await team.save();
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating challenge:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
