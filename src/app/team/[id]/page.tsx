'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Team {
  _id: string;
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

interface ChallengeConfigItem {
  id: string;
  name: string;
  points: number;
}


export default function TeamPage() {
  const params = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [challenges, setChallenges] = useState<ChallengeConfigItem[]>([]);
  const [interventionPenalty, setInterventionPenalty] = useState(-3);

  useEffect(() => {
    fetchTeam();
    // Cleanup any existing timer when component unmounts or ID changes
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [params.id]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        if (response.ok) {
          if (Array.isArray(data.challenges) && data.challenges.length > 0) {
            setChallenges(data.challenges);
          }
          if (typeof data.interventionPenalty === 'number') {
            setInterventionPenalty(data.interventionPenalty);
          }
        }
      } catch (error) {
        console.error('Error loading competition config:', error);
      }
    };

    loadConfig();
  }, []);

  // Save timer state to localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem(`timer_${params.id}`);
    const savedIsRunning = localStorage.getItem(`timerRunning_${params.id}`);
    
    if (savedTime) {
      setTime(parseInt(savedTime, 10));
    }
    
    if (savedIsRunning === 'true') {
      startTimer();
    }
  }, [params.id]);

  // Save timer state when it changes
  useEffect(() => {
    localStorage.setItem(`timer_${params.id}`, time.toString());
    localStorage.setItem(`timerRunning_${params.id}`, isRunning.toString());
  }, [time, isRunning, params.id]);

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/team/${params.id}`);
      const data = await response.json();
      setTeam({ ...data, globalScore: data.globalScore ?? 0 });
      // Only set the timer if it hasn't been started yet
      if (!isRunning && time === 0 && data.detailedScores.timer > 0) {
        setTime(data.detailedScores.timer);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const calculateGlobalScore = (teamData: Team, activeChallengeIds: string[]) => {
    const challengeScores = Object.entries(teamData.detailedScores)
      .filter(([key]) => activeChallengeIds.includes(key))
      .reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);
    return challengeScores + teamData.interventions * interventionPenalty;
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      const interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          return newTime;
        });
      }, 1000);
      setTimerInterval(interval);
    }
  };
  const pauseTimer = () => {
    if (isRunning && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setIsRunning(false);
      // Save current time state
      localStorage.setItem(`timer_${params.id}`, time.toString());
    }
  };

  const resetTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTime(0);
    setIsRunning(false);
    // Clear saved timer state
    localStorage.removeItem(`timer_${params.id}`);
    localStorage.removeItem(`timerRunning_${params.id}`);
  };
  const stopTimer = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsRunning(false);
    
    try {
      const response = await fetch(`/api/team/${params.id}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save timer');
      }
      
      const updatedTeam = await response.json();
      setTeam(updatedTeam);
      setTime(time); // Keep the current time
      
      // Clear saved timer state after successful save
      localStorage.removeItem(`timer_${params.id}`);
      localStorage.removeItem(`timerRunning_${params.id}`);
    } catch (error) {
      console.error('Error saving timer:', error);
      // Optionally show an error message to the user
    }
  };

  const updateChallenge = async (challengeId: string, success: boolean) => {
    try {
      await fetch(`/api/team/${params.id}/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, success }),
      });
      await fetchTeam(); // Refresh team data
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  const handleIntervention = async (action: 'add' | 'remove') => {
    if (!team) return;
    try {
      const response = await fetch(`/api/team/${params.id}/intervention`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      const updatedTeam = await response.json();
      setTeam(updatedTeam);
    } catch (error) {
      console.error('Error updating interventions:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getChallengeStatus = (challengeId: string) => {
    if (!team) return null;
    const score = team.detailedScores[challengeId as keyof typeof team.detailedScores];
    return score > 0 ? 'success' : score === 0 ? 'fail' : null;
  };
  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-lg shadow-sm">
          <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-600 border-t-transparent"></div>
          <span className="text-gray-600 font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  const activeChallengeIds = challenges.map((challenge) => challenge.id);
  const totalScore = calculateGlobalScore(team, activeChallengeIds);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-gray-900 flex items-center gap-3">
                {team.teamName}
                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Team #{team._id.slice(-4)}
                </span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {totalScore}
                </div>
                <span className="text-gray-500 font-medium">points</span>
              </div>
            </div>
            <Link
              href="/scoreboard"
              className="group flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Retour au tableau des scores
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Défis Complétés</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Object.entries(team.detailedScores).filter(([key, score]) => key !== 'timer' && score > 0 && challenges.some((challenge) => challenge.id === key)).length}/{challenges.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Temps Total</div>
                <div className="text-2xl font-bold text-gray-900">{formatTime(team.detailedScores.timer)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Interventions</div>
                <div className="text-2xl font-bold text-gray-900">{team.interventions}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interventions Section */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Interventions</h2>
              <p className="text-sm text-gray-500 mt-1">Chaque intervention entraîne une pénalité de {interventionPenalty} points</p>
            </div>
            <div className="px-4 py-2 bg-red-50 rounded-lg">
              <span className="text-lg font-semibold text-red-600">{team.interventions * interventionPenalty} points</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleIntervention('add')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ajouter une intervention
            </button>
            <button
              onClick={() => handleIntervention('remove')}
              disabled={!team.interventions}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
              Retirer une intervention
            </button>
          </div>
        </div>

        {/* Timer Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 mb-6">
              <div className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {formatTime(time)}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={startTimer}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Démarrer
              </button>

              <button
                onClick={pauseTimer}
                disabled={!isRunning}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pause
              </button>

              <button
                onClick={resetTimer}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>

              <button
                onClick={stopTimer}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Stop
              </button>
            </div>
          </div>
        </div>

        {/* Challenges Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Défis
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {challenges.map((challenge) => {
              const status = getChallengeStatus(challenge.id);
              return (
                <div key={challenge.id} className="p-6 transition-colors hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {challenge.name}
                      </h3>
                      {challenge.id !== 'timer' && (
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {challenge.points} points
                          </span>
                          {status && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium
                              ${status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {status === 'success' ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Réussi
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Échoué
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {challenge.id !== 'timer' ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateChallenge(challenge.id, true)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            status === 'success'
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm'
                              : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Réussi
                        </button>
                        <button
                          onClick={() => updateChallenge(challenge.id, false)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            status === 'fail'
                              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                              : 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-50'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Échoué
                        </button>
                      </div>
                    ) : (
                      <div className="text-lg font-medium text-gray-900">
                        {formatTime(time)}
                      </div>
                    )}
                  </div>

                  {challenge.id !== 'timer' && status === 'success' && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Score : {team.detailedScores[challenge.id as keyof typeof team.detailedScores]} points
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-lg">
            <div>
              <h2 className="text-lg text-gray-400 mb-1">Score Total</h2>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                {totalScore} points
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 pb-4 text-center">
          <p className="text-gray-600 text-sm">
            Créé par{' '}
            <span className="font-semibold text-gray-800">MOUHIB Otman</span>
            <span className="mx-2">•</span>
            <span className="text-gray-500">{new Date().getFullYear()}</span>
          </p>
        </footer>
      </div>
    </div>
  );
}