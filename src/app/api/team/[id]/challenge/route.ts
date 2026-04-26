import { connectToDatabase } from '@/lib/db';
import { CompetitionConfig } from '@/models/CompetitionConfig';
import { Team } from '@/models/Team';
import { NextResponse } from 'next/server';
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
    const { challengeId, success } = await request.json();

    if (!challengeId || typeof success !== 'boolean') {
      return NextResponse.json(
        { message: 'Invalid challenge data' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const config = await CompetitionConfig.findOne();
    const activeChallengeIds = config?.challenges.map((item: { id: string }) => item.id) ?? [];
    const challenge = config?.challenges.find((item: { id: string }) => item.id === challengeId);

    if (!challenge) {
      return NextResponse.json(
        { message: 'Invalid challenge ID' },
        { status: 400 }
      );
    }

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
    }

    team.detailedScores[challengeId as keyof typeof team.detailedScores] = success
      ? challenge.points
      : 0;
    team.markModified('detailedScores');

    const challengeScores = Object.entries(team.detailedScores)
      .filter(([key]) => key !== 'timer' && activeChallengeIds.includes(key))
      .reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);

    const interventionPenalty = (team.interventions || 0) * (config?.interventionPenalty ?? -3);
    team.globalScore = challengeScores + interventionPenalty;

    await team.save();
    return NextResponse.json(team.toObject());
  } catch (error) {
    console.error('Error updating challenge:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
