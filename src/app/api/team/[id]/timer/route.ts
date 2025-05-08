import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Team } from '@/models/Team';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await connectToDatabase();

    // Parse and validate the time
    const { time } = await request.json();
    const timeValue = Number(time);

    if (isNaN(timeValue) || timeValue < 0) {
      return NextResponse.json(
        { error: 'Invalid time value' },
        { status: 400 }
      );
    }

    // Find the team
    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Only store the time value (completely separate from score calculation)
    team.detailedScores.timer = timeValue;

    // Ensure timer is excluded from global score calculation
    // Get the existing scores and recalculate the total (excluding timer)
    const challengeScores = Object.entries(team.detailedScores)
      .filter(([key]) => key !== 'timer') // Exclude timer from score calculation
      .reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);

    // Calculate intervention penalty
    const interventionPenalty = (team.interventions || 0) * -3;

    // Update global score (timer is not included)
    team.globalScore = challengeScores + interventionPenalty;

    // Save changes
    await team.save();

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating timer:', error);
    return NextResponse.json(
      { error: 'Failed to update timer' },
      { status: 500 }
    );
  }
}