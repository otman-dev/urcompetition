'use client';

export default function PendingAdminsPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">User Management Moved</h1>
          <p className="text-slate-600 mb-6">
            The full user management interface is now available at the updated page.
          </p>
          <a
            href="/admin/users"
            className="inline-flex items-center rounded-2xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition"
          >
            Go to Manage Users
          </a>
        </div>
      </div>
    </main>
  );
}
