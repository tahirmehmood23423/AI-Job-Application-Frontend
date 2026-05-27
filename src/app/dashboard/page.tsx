"use client";

import { useEffect, useState, useCallback } from "react";
import { listApplications, getDashboardStats, updateApplication, deleteApplication } from "@/lib/api";
import type { Application, ApplicationStatus, DashboardStats } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS, STATUS_ORDER } from "@/lib/types";

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color = "text-indigo-600",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

// ── Score Badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score, label }: { score: number | null; label: string }) {
  if (score === null) return <span className="text-gray-300">—</span>;
  const color =
    score >= 75 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-500";
  return (
    <span className={`font-semibold ${color}`} title={label}>
      {score}
    </span>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Application Row ───────────────────────────────────────────────────────────

function ApplicationRow({
  app,
  onStatusChange,
  onDelete,
  onSelect,
}: {
  app: Application;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
  onSelect: (app: Application) => void;
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Company + Title */}
      <td className="px-4 py-3">
        <button
          onClick={() => onSelect(app)}
          className="text-left group"
        >
          <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
            {app.job_title}
          </div>
          <div className="text-sm text-gray-500">{app.company}</div>
        </button>
      </td>

      {/* Scores */}
      <td className="px-4 py-3 text-center text-sm">
        <ScoreBadge score={app.match_score} label="Match score" />
      </td>
      <td className="px-4 py-3 text-center text-sm">
        <ScoreBadge score={app.ats_score} label="ATS score" />
      </td>

      {/* Status dropdown */}
      <td className="px-4 py-3">
        <select
          value={app.status}
          onChange={(e) =>
            onStatusChange(app.id, e.target.value as ApplicationStatus)
          }
          className="text-xs border-0 bg-transparent focus:ring-0 cursor-pointer"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-xs text-gray-400">
        {new Date(app.created_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        {app.job_url && (
          <a
            href={app.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:underline mr-3"
          >
            View
          </a>
        )}
        <button
          onClick={() => onDelete(app.id)}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────

function DetailDrawer({
  app,
  userId,
  onClose,
  onUpdated,
}: {
  app: Application;
  userId: string;
  onClose: () => void;
  onUpdated: (a: Application) => void;
}) {
  const [notes, setNotes] = useState(app.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function saveNotes() {
    setSaving(true);
    try {
      const updated = await updateApplication(userId, app.id, { notes });
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{app.job_title}</h2>
            <p className="text-sm text-gray-500">{app.company}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <div className="text-xs text-indigo-400 mb-1">Match Score</div>
              <div className="text-2xl font-bold text-indigo-600">
                {app.match_score ?? "—"}
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-xs text-emerald-400 mb-1">ATS Score</div>
              <div className="text-2xl font-bold text-emerald-600">
                {app.ats_score ?? "—"}
              </div>
            </div>
          </div>

          {/* Status timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Status Timeline
            </h3>
            <ol className="relative border-l border-gray-200 ml-3 space-y-3">
              {app.events.map((ev) => (
                <li key={ev.id} className="ml-4">
                  <div className="absolute -left-1.5 w-3 h-3 bg-indigo-500 rounded-full" />
                  <div className="text-xs text-gray-500">
                    {new Date(ev.created_at).toLocaleString("en-GB", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {ev.from_status
                      ? `${STATUS_LABELS[ev.from_status as ApplicationStatus]} → ${STATUS_LABELS[ev.to_status as ApplicationStatus]}`
                      : `Saved as ${STATUS_LABELS[ev.to_status as ApplicationStatus]}`}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Cover letter preview */}
          {app.cover_letter && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Cover Letter
              </h3>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                {app.cover_letter}
              </pre>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              placeholder="Add notes about this application..."
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="mt-2 px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────

const USER_ID = "demo-user"; // Replace with real auth in production

export default function DashboardPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsData, statsData] = await Promise.all([
        listApplications(USER_ID, {
          status: statusFilter || undefined,
          search: search || undefined,
        }),
        getDashboardStats(USER_ID),
      ]);
      setApps(appsData);
      setStats(statsData);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    const updated = await updateApplication(USER_ID, id, { status });
    setApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
    if (selected?.id === id) setSelected(updated);
    // Refresh stats
    getDashboardStats(USER_ID).then(setStats);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this application?")) return;
    await deleteApplication(USER_ID, id);
    setApps((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
    getDashboardStats(USER_ID).then(setStats);
  }

  function handleUpdated(updated: Application) {
    setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelected(updated);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            AI
          </div>
          <span className="font-semibold text-gray-900">Job Application Tracker</span>
        </div>
        <span className="text-sm text-gray-400">Dashboard</span>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Applications"
              value={stats.total_applications}
              sub={`${stats.applications_this_week} this week`}
            />
            <StatCard
              label="Avg Match Score"
              value={stats.avg_match_score ?? "—"}
              color="text-indigo-600"
            />
            <StatCard
              label="Avg ATS Score"
              value={stats.avg_ats_score ?? "—"}
              color="text-emerald-600"
            />
            <StatCard
              label="Active Pipeline"
              value={
                stats.status_breakdown.find((s) => s.status === "interview")
                  ?.count ?? 0
              }
              sub="in interview stage"
              color="text-purple-600"
            />
          </div>
        )}

        {/* Status Pills */}
        {stats && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("")}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === ""
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400"
              }`}
            >
              All ({stats.total_applications})
            </button>
            {stats.status_breakdown.map((s) => (
              <button
                key={s.status}
                onClick={() =>
                  setStatusFilter(
                    statusFilter === s.status ? "" : (s.status as ApplicationStatus)
                  )
                }
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === s.status
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400"
                }`}
              >
                {STATUS_LABELS[s.status as ApplicationStatus]} ({s.count})
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search job title or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : apps.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No applications yet. Start by matching a job on the main page.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3">Job / Company</th>
                  <th className="px-4 py-3 text-center">Match</th>
                  <th className="px-4 py-3 text-center">ATS</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Saved</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apps.map((app) => (
                  <ApplicationRow
                    key={app.id}
                    app={app}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onSelect={setSelected}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Detail Drawer */}
      {selected && (
        <DetailDrawer
          app={selected}
          userId={USER_ID}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
