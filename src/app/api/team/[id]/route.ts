import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Team } from '@/models/Team';
import { CompetitionConfig } from '@/models/CompetitionConfig';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const preferredRegion = 'auto';

const calculateGlobalScore = (team: any, activeChallengeIds: string[], penalty: number) => {
  const challengeScores = Object.entries(team.detailedScores)
    .filter(([key]) => activeChallengeIds.includes(key))
    .reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);
  return challengeScores + (team.interventions || 0) * penalty;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    await connectToDatabase();

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const config = await CompetitionConfig.findOne();
    const penalty = config?.interventionPenalty ?? -3;
    const activeChallengeIds = config?.challenges.map((challenge: { id: string }) => challenge.id) ?? [];
    const recalculatedScore = calculateGlobalScore(team, activeChallengeIds, penalty);

    if (team.globalScore !== recalculatedScore) {
      team.globalScore = recalculatedScore;
      await team.save();
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const { teamName } = await request.json();
    if (!teamName || typeof teamName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid team name' },
        { status: 400 }
      );
    }

    const team = await Team.findByIdAndUpdate(
      id,
      { teamName },
      { new: true }
    );

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const team = await Team.findByIdAndDelete(id);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}