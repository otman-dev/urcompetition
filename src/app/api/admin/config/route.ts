import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CompetitionConfig } from '@/models/CompetitionConfig';
import { requireApprovedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const preferredRegion = 'auto';

const VALID_IDS = ['defi1', 'defi2', 'defi3', 'defi4', 'defi5', 'defi6'];

export async function GET(request: Request) {
  try {
    await requireApprovedUser(request);
    await connectToDatabase();

    const config = await CompetitionConfig.findOne();
    if (!config) {
      return NextResponse.json({ challenges: [], interventionPenalty: -3 });
    }

    return NextResponse.json({ challenges: config.challenges, interventionPenalty: config.interventionPenalty });
  } catch (error) {
    console.error('Config GET error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireApprovedUser(request);
    await connectToDatabase();

    const { challenges, interventionPenalty } = await request.json();

    if (!Array.isArray(challenges)) {
      return NextResponse.json({ error: 'Challenges must be an array' }, { status: 400 });
    }

    const validated = challenges.map((challenge: any, index: number) => {
      const id = typeof challenge.id === 'string' ? challenge.id : String(challenge.id ?? '');
      const name = typeof challenge.name === 'string' ? challenge.name.trim() : String(challenge.name ?? '').trim();
      const points = Number(challenge.points);

      if (
        !id ||
        !VALID_IDS.includes(id) ||
        !name ||
        !Number.isFinite(points) ||
        points < 0
      ) {
        throw new Error(`Invalid challenge configuration for index ${index} (${id || 'unknown'})`);
      }
      return {
        id,
        name,
        points,
      };
    });

    const uniqueIds = [...new Set(validated.map((item) => item.id))];
    if (uniqueIds.length !== validated.length) {
      return NextResponse.json({ error: 'Duplicate challenge ids are not allowed' }, { status: 400 });
    }

    const penaltyValue = Number(interventionPenalty);
    if (!Number.isFinite(penaltyValue)) {
      return NextResponse.json({ error: 'Intervention penalty must be a valid number' }, { status: 400 });
    }

    const config = await CompetitionConfig.findOneAndUpdate(
      {},
      { challenges: validated, interventionPenalty: penaltyValue },
      { upsert: true, new: true }
    );
      {},
      { challenges: validated, interventionPenalty },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Configuration saved', config });
  } catch (error) {
    console.error('Config POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save config' },
      { status: 400 }
    );
  }
}
