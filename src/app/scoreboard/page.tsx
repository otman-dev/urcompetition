import { connectToDatabase } from '@/lib/mongodb';
import { Team } from '@/models/Team';
import { CompetitionConfig } from '@/models/CompetitionConfig';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const calculateGlobalScore = (team: any, activeChallengeIds: string[], penalty: number) => {
  const challengeScores = Object.entries(team.detailedScores)
    .filter(([key]) => key !== 'timer' && activeChallengeIds.includes(key))
    .reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);
  return challengeScores + (team.interventions || 0) * penalty;
};

export default async function ScoreboardPage() {
  await connectToDatabase();
  const teams = await Team.find();
  const config = await CompetitionConfig.findOne();
  const penalty = config?.interventionPenalty ?? -3;

  const activeChallengeIds = config?.challenges.map((challenge: { id: string }) => challenge.id) ?? [];
  const rankedTeams = teams
    .map((team: any) => ({
      ...team.toObject(),
      totalScore: calculateGlobalScore(team, activeChallengeIds, penalty),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-12">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="group px-4 py-2 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors rounded-2xl border border-gray-200 bg-white/80 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Competition Scoreboard
          </h1>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">Défis Complétés</th>
                  <th className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">Interventions</th>
                  <th className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">Pénalité</th>
                  <th className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-right text-sm font-medium uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rankedTeams.map((team: any, index: number) => {
                  const completedCount = Object.entries(team.detailedScores)
                    .filter(([key, value]) => key !== 'timer' && activeChallengeIds.includes(key) && typeof value === 'number' && value > 0)
                    .length;
                  const interventionCount = team.interventions || 0;
                  const penaltyValue = interventionCount * penalty;
                  return (
                    <tr key={team._id} className="hover:bg-blue-50/50">
                      <td className="whitespace-nowrap px-6 py-5 text-center text-sm text-gray-900 font-medium">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full 
                          ${index < 3 ? 'bg-gradient-to-br text-white font-semibold' : 'bg-gray-100 text-gray-600'} 
                          ${index === 0 ? 'from-yellow-400 to-yellow-500' : ''}
                          ${index === 1 ? 'from-gray-300 to-gray-400' : ''}
                          ${index === 2 ? 'from-amber-600 to-amber-700' : ''}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900">
                        <Link href={`/team/${team._id}`} className="hover:text-blue-600">
                          {team.teamName}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-center text-sm text-gray-900">
                        {completedCount}/{activeChallengeIds.length}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-center text-sm text-gray-900">
                        {interventionCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-center text-sm text-red-600 font-medium">
                        {penaltyValue}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-center text-sm text-gray-700">
                        {formatTime(team.detailedScores.timer)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-right text-lg font-semibold text-blue-600">
                        {team.totalScore}
                        <span className="ml-1 text-sm font-normal text-gray-500">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pb-4 text-center">
          <p className="text-gray-600 text-sm">
            Créé par{' '}
            <span className="font-semibold text-gray-800">MOUHIB Otman</span>
            <span className="mx-2">•</span>
            <span className="text-gray-500">{new Date().getFullYear()}</span>
          </p>
        </footer>
      </div>
    </main>
  );
}