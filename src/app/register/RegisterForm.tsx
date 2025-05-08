'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

interface Team {
  _id: string;
  teamName: string;
  globalScore: number;
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

interface RegisterFormProps {
  initialTeams: Team[];
}

export default function RegisterForm({ initialTeams }: RegisterFormProps) {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!teamName.trim()) {
      setError('Team name is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register team');
      }

      setTeamName('');
      showSuccess('Team registered successfully!');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to register team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.teamName);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/team/${editingTeam._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update team');
      }

      setEditingTeam(null);
      setTeamName('');
      showSuccess('Team updated successfully!');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/team/${teamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete team');
      }

      showSuccess('Team deleted successfully!');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete team');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingTeam(null);
    setTeamName('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Team Registration</h1>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              <svg
                className="w-5 h-5 text-gray-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Go back home
            </Link>
          </div>

          <form
            onSubmit={editingTeam ? handleUpdate : handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="teamName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Team Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 placeholder-gray-400"
                  placeholder="Enter team name"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : editingTeam ? (
                    <>
                      <FiSave className="w-5 h-5 mr-2" />
                      Update
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-5 h-5 mr-2" />
                      Register
                    </>
                  )}
                </button>
                {editingTeam && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    <FiX className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div
                className="rounded-lg bg-red-50 p-4 text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            {successMessage && (
              <div
                className="rounded-lg bg-green-50 p-4 text-green-700"
                role="alert"
              >
                {successMessage}
              </div>
            )}
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Registered Teams
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team._id}
                className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/team/${team._id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
                  >
                    {team.teamName}
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(team)}
                      className="p-1 text-gray-600 hover:text-indigo-600 transition-colors"
                      title="Edit team"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(team._id)}
                      className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete team"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Score: {team.globalScore}
                </div>
              </div>
            ))}
          </div>
          {teams.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No teams registered yet. Be the first one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}