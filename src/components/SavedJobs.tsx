"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { SavedJob, SavedJobStatus } from "@/lib/types";

interface SavedJobsProps {
  savedJobs: SavedJob[];
  onUnsave: (jobId: string) => void;
  onStatusChange: (jobId: string, status: SavedJobStatus) => void;
}

const STATUSES: SavedJobStatus[] = [
  "saved", "applied", "interviewing", "rejected", "offer",
];

const STATUS_STYLES: Record<SavedJobStatus, string> = {
  saved: "bg-zinc-100 text-zinc-700 border-zinc-200",
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  interviewing: "bg-violet-50 text-violet-700 border-violet-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function SavedJobs({ savedJobs, onUnsave, onStatusChange }: SavedJobsProps) {
  const [open, setOpen] = useState(false);

  if (savedJobs.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-zinc-900 text-sm">Saved Jobs</p>
            <p className="text-xs text-zinc-400">{savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved</p>
          </div>
        </div>
        <span className="text-zinc-400">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2 px-6 pb-4">
        {STATUSES.map((status) => {
          const count = savedJobs.filter((j) => j.status === status).length;
          if (count === 0) return null;
          return (
            <span
              key={status}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[status]}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} · {count}
            </span>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-zinc-100"
          >
            <div className="divide-y divide-zinc-100">
              {savedJobs.map((saved) => (
                <div key={saved.job.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 text-sm truncate">
                      {saved.job.title}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">{saved.job.company} · {saved.job.location}</p>
                  </div>

                  {/* Status selector */}
                  <select
                    value={saved.status}
                    onChange={(e) => onStatusChange(saved.job.id, e.target.value as SavedJobStatus)}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border cursor-pointer outline-none ${STATUS_STYLES[saved.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <a
                      href={saved.job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onUnsave(saved.job.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
