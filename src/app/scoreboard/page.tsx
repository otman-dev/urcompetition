import { connectToDatabase } from '@/lib/mongodb';
import { Team } from '@/models/Team';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default async function ScoreboardPage() {
  await connectToDatabase();
  const teams = await Team.find().sort({ globalScore: -1 });

  return (    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link
            href="/"
            className="group px-4 py-2 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
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
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Competition Scoreboard
          </h1>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-12 gap-4 p-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <div className="col-span-1 text-center font-medium">Rank</div>
            <div className="col-span-5 font-medium">Team</div>
            <div className="col-span-3 text-center font-medium">Time</div>
            <div className="col-span-3 text-right font-medium">Score</div>
          </div>
          <ul className="divide-y divide-gray-100">
            {teams.map((team: any, index: number) => (              <li
                key={team._id}
                className="grid grid-cols-12 gap-4 p-6 hover:bg-blue-50/50 transition-all duration-200 group"
              >
                <div className="col-span-1 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full 
                    ${index < 3 ? 'bg-gradient-to-br text-white font-semibold' : 'bg-gray-100 text-gray-600'} 
                    ${index === 0 ? 'from-yellow-400 to-yellow-500' : ''}
                    ${index === 1 ? 'from-gray-300 to-gray-400' : ''}
                    ${index === 2 ? 'from-amber-600 to-amber-700' : ''}`}>
                    {index + 1}
                  </span>
                </div>
                <div className="col-span-5">
                  <Link
                    href={`/team/${team._id}`}
                    className="inline-block font-medium text-gray-900 group-hover:text-blue-600 transition-colors"
                  >
                    {team.teamName}
                  </Link>
                </div>
                <div className="col-span-3 text-center">
                  <span className="inline-flex items-center gap-2 font-medium text-gray-700">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(team.detailedScores.timer)}
                  </span>
                </div>
                <div className="col-span-3 text-right">
                  <span className="inline-flex items-center gap-2 text-lg font-semibold text-blue-600">
                    {team.globalScore}
                    <span className="text-sm font-normal text-gray-500">pts</span>
                  </span>
                </div>
              </li>))}
          </ul>
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