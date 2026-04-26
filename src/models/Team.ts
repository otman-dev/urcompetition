// src/models/Team.ts
import mongoose, { Schema, Model } from 'mongoose';

interface ITeam {
  teamName: string;
  globalScore: number;
  interventions: number;
  detailedScores: Record<string, number>;
  timerScore: number;
}

const TeamSchema = new Schema<ITeam>({
  teamName: { type: String, required: true },
  globalScore: { type: Number, default: 0 },
  interventions: { type: Number, default: 0 },
  detailedScores: {
    type: Schema.Types.Mixed,
    default: { timer: 0 },
  },
  timerScore: { type: Number, default: 0 },
});

// Ensure the model is only created once
const Team = mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export { Team };