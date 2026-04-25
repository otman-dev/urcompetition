'use client';

import { useEffect, useState } from 'react';

interface UserItem {
  _id: string;
  email: string;
  role: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/users');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to load user list');
        return;
      }

      setUsers(data.users || []);
    } catch (err) {
      setError('Unable to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (response.ok && data.userId) {
          setCurrentUserId(data.userId);
        }
      } catch {
        setCurrentUserId(null);
      }
    };

    fetchCurrentUser();
    loadUsers();
  }, []);

  const updateApproval = async (userId: string, approve: boolean) => {
    setActiveId(userId);
    setError(null);

    try {
      const response = await fetch(approve ? '/api/auth/approve' : '/api/auth/disapprove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to update approval state');
        return;
      }

      setUsers((current) =>
        current.map((user) =>
          user._id === userId ? { ...user, approved: approve } : user
        )
      );
    } catch {
      setError('Unable to update approval state');
    } finally {
      setActiveId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">User Management</h1>
          <p className="text-slate-600 mb-6">
            Approve or disapprove users and review their current access state.
          </p>
          {loading ? (
            <div className="text-slate-500">Loading users...</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-100">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Approved</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Requested</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 text-sm text-slate-900">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{user.role}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={
                          `inline-flex rounded-full px-3 py-1 text-sm font-semibold ${user.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`
                        }>
                          {user.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        {currentUserId === user._id ? (
                          <span className="inline-flex rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                            Your account
                          </span>
                        ) : user.approved ? (
                          <button
                            onClick={() => updateApproval(user._id, false)}
                            disabled={activeId === user._id}
                            className="inline-flex items-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                          >
                            {activeId === user._id ? 'Processing...' : 'Disapprove'}
                          </button>
                        ) : (
                          <button
                            onClick={() => updateApproval(user._id, true)}
                            disabled={activeId === user._id}
                            className="inline-flex items-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                          >
                            {activeId === user._id ? 'Processing...' : 'Approve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
