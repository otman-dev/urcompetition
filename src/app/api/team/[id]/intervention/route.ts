import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CompetitionConfig } from '@/models/CompetitionConfig';
import { Team } from '@/models/Team';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const preferredRegion = 'auto';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const { action } = await request.json();

    if (!action || !['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const config = await CompetitionConfig.findOne();
    const penalty = config?.interventionPenalty ?? -3;
    const activeChallengeIds = config?.challenges.map((item: { id: string }) => item.id) ?? [];

    const team = await Team.findById(id);

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      team.interventions = (team.interventions || 0) + 1;
    } else if (action === 'remove' && team.interventions > 0) {
      team.interventions -= 1;
    }

    const challengeScores = Object.entries(team.detailedScores)
      .filter(([key]) => activeChallengeIds.includes(key))
      .reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);

    team.globalScore = challengeScores + team.interventions * penalty;

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
