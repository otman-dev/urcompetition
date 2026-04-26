'use client';

import { useEffect, useState } from 'react';

interface ChallengeConfigItem {
  id: string;
  name: string;
  points: number;
}

const ALL_IDS = ['defi1', 'defi2', 'defi3', 'defi4', 'defi5', 'defi6'];

export default function AdminConfigPage() {
  const [challenges, setChallenges] = useState<ChallengeConfigItem[]>([]);
  const [interventionPenalty, setInterventionPenalty] = useState(-3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/config');
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Failed to load configuration');
          return;
        }
        setChallenges(
          (data.challenges || []).map((challenge: any) => ({
            id: String(challenge.id || ''),
            name: String(challenge.name || ''),
            points: Number(challenge.points ?? 0),
          }))
        );
        setInterventionPenalty(typeof data.interventionPenalty === 'number' ? data.interventionPenalty : -3);
      } catch (err) {
        console.error(err);
        setError('Unable to load configuration');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const addChallenge = () => {
    const usedIds = new Set(challenges.map((item) => item.id));
    const nextId = ALL_IDS.find((id) => !usedIds.has(id));
    if (!nextId) return;
    setChallenges((current) => [...current, { id: nextId, name: '', points: 20 }]);
  };

  const removeChallenge = (index: number) => {
    setChallenges((current) => current.filter((_, i) => i !== index));
  };

  const updateChallenge = (index: number, field: keyof ChallengeConfigItem, value: string | number) => {
    setChallenges((current) =>
      current.map((challenge, i) =>
        i === index ? { ...challenge, [field]: value } : challenge
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const normalizedChallenges = challenges.map((challenge) => ({
        id: challenge.id,
        name: String(challenge.name || '').trim(),
        points: Number(challenge.points),
      }));

      const invalidChallenge = normalizedChallenges.find(
        (challenge) =>
          !challenge.id ||
          !challenge.name ||
          !Number.isFinite(challenge.points) ||
          challenge.points < 0
      );

      if (invalidChallenge) {
        setError(`Invalid configuration for challenge ${invalidChallenge.id || 'unknown'}`);
        setSaving(false);
        return;
      }

      const ids = normalizedChallenges.map((challenge) => challenge.id);
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== ids.length) {
        setError('Duplicate challenge IDs are not allowed');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenges: normalizedChallenges, interventionPenalty: Number(interventionPenalty) }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to save configuration');
        return;
      }
      setMessage('Configuration saved successfully.');
    } catch (err) {
      console.error(err);
      setError('Unable to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const availableIds = ALL_IDS.filter((id) => !challenges.some((challenge) => challenge.id === id));

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Competition Settings</h1>
              <p className="text-slate-600 mt-2">
                Configure your challenge list and intervention penalty from the web interface.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>

          {loading ? (
            <div className="mt-8 text-slate-500">Loading settings...</div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
          ) : (
            <>
              {message && (
                <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">{message}</div>
              )}

              <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-100 p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Défis</h2>
                    <p className="text-sm text-slate-600">Use the buttons below to add, remove or edit each challenge.</p>
                  </div>
                  <button
                    onClick={addChallenge}
                    disabled={availableIds.length === 0}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    Ajouter un défi
                  </button>
                </div>

                <div className="space-y-4">
                  {challenges.map((challenge, index) => (
                    <div key={challenge.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 sm:grid-cols-[160px_minmax(0,1fr)_140px_80px] sm:items-center">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Challenge ID</label>
                        <input
                          type="text"
                          value={challenge.id}
                          disabled
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={challenge.name}
                          onChange={(e) => updateChallenge(index, 'name', e.target.value)}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Points</label>
                        <input
                          type="number"
                          min={0}
                          value={challenge.points}
                          onChange={(e) => updateChallenge(index, 'points', Number(e.target.value))}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                        />
                      </div>
                      <div className="flex items-end justify-end">
                        <button
                          onClick={() => removeChallenge(index)}
                          className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Intervention penalty</h3>
                      <p className="text-sm text-slate-600">Configure how many points are subtracted for each intervention.</p>
                    </div>
                    <div className="w-full max-w-xs">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Penalty value</label>
                      <input
                        type="number"
                        value={interventionPenalty}
                        onChange={(e) => setInterventionPenalty(Number(e.target.value))}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
