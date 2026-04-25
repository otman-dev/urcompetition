import mongoose, { Schema } from 'mongoose';

interface ChallengeConfig {
  id: string;
  name: string;
  points: number;
}

export interface ICompetitionConfig {
  challenges: ChallengeConfig[];
  interventionPenalty: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeConfigSchema = new Schema<ChallengeConfig>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    points: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CompetitionConfigSchema = new Schema<ICompetitionConfig>(
  {
    challenges: { type: [ChallengeConfigSchema], default: [] },
    interventionPenalty: { type: Number, default: -3 },
  },
  { timestamps: true }
);

const CompetitionConfig =
  mongoose.models.CompetitionConfig ||
  mongoose.model<ICompetitionConfig>('CompetitionConfig', CompetitionConfigSchema);

export { CompetitionConfig };
