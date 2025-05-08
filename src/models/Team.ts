// src/models/Team.ts
import mongoose, { Schema, Model } from 'mongoose';

interface ITeam {
  teamName: string;
  globalScore: number;
  interventions: number;
  detailedScores: {
    defi1: number;
    defi2: number;
    defi3: number;
    defi4: number;
    defi5: number;
    defi6: number;
    timer: number;
  };
  timerScore: number;
}

const TeamSchema = new Schema<ITeam>({
  teamName: { type: String, required: true },
  globalScore: { type: Number, default: 0 },
  interventions: { type: Number, default: 0 },
  detailedScores: {
    defi1: { type: Number, default: 0 },
    defi2: { type: Number, default: 0 },
    defi3: { type: Number, default: 0 },
    defi4: { type: Number, default: 0 },
    defi5: { type: Number, default: 0 },
    defi6: { type: Number, default: 0 },
    timer: { type: Number, default: 0 },
  },
  timerScore: { type: Number, default: 0 },
});

// Ensure the model is only created once
const Team = mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export { Team };