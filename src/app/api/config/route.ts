import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CompetitionConfig } from '@/models/CompetitionConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const preferredRegion = 'auto';

export async function GET() {
  await connectToDatabase();

  const config = await CompetitionConfig.findOne();
  return NextResponse.json({
    challenges: config?.challenges ?? [],
    interventionPenalty: config?.interventionPenalty ?? -3,
  });
}
