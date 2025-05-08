import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Team } from '@/models/Team';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const preferredRegion = 'auto';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { action } = await request.json();

    if (!action || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action' },
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

    // Update interventions count
    if (action === 'add') {
      team.interventions = (team.interventions || 0) + 1;
    } else if (action === 'remove' && team.interventions > 0) {
      team.interventions -= 1;
    }

    // Calculate total score (excluding timer)
    const challengeScores = Object.entries(team.detailedScores)
      .filter(([key]) => key !== 'timer')
      .reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);

    // Calculate intervention penalty
    const interventionPenalty = team.interventions * -3;

    // Update global score (excluding timer)
    team.globalScore = challengeScores + interventionPenalty;

    await team.save();
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating interventions:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
