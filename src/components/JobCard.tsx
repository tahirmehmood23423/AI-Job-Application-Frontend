"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Building2, Clock, DollarSign,
  ExternalLink, Bookmark, BookmarkCheck,
  Linkedin, Globe, Search,
} from "lucide-react";
import type { JobListing, JobSource, SavedJob, SavedJobStatus } from "@/lib/types";

interface JobCardProps {
  job: JobListing;
  savedJob?: SavedJob | null;
  onSave: (job: JobListing) => void;
  onUnsave: (jobId: string) => void;
  index: number;
}

const SOURCE_ICONS: Record<JobSource, React.ElementType> = {
  linkedin: Linkedin,
  indeed: Search,
  remotive: Globe,
};

const SOURCE_LABELS: Record<JobSource, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  remotive: "Remotive",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  remote: "Remote",
  internship: "Internship",
  unknown: "",
};

const STATUS_COLORS: Record<SavedJobStatus, string> = {
  saved: "bg-zinc-100 text-zinc-600",
  applied: "bg-blue-100 text-blue-700",
  interviewing: "bg-violet-100 text-violet-700",
  rejected: "bg-red-100 text-red-600",
  offer: "bg-emerald-100 text-emerald-700",
};

export function JobCard({ job, savedJob, onSave, onUnsave, index }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isSaved = !!savedJob;
  const SourceIcon = SOURCE_ICONS[job.source];

  const verdictColor =
    job.match_verdict === "strong"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : job.match_verdict === "moderate"
      ? "text-blue-600 bg-blue-50 border-blue-200"
      : "text-zinc-500 bg-zinc-50 border-zinc-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all overflow-hidden"
    >
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Source badge */}
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400 font-mono">
                <SourceIcon className="w-3 h-3" />
                {SOURCE_LABELS[job.source]}
              </span>
              {job.job_type !== "unknown" && (
                <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                  {JOB_TYPE_LABELS[job.job_type]}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-zinc-900 leading-tight truncate">
              {job.title}
            </h3>
            <p className="text-blue-600 font-semibold text-sm mt-0.5">{job.company}</p>
          </div>

          {/* Match score */}
          {job.match_score !== null && (
            <div className={`shrink-0 text-center px-3 py-2 rounded-xl border ${verdictColor}`}>
              <div className="text-2xl font-bold leading-none">{Math.round(job.match_score)}</div>
              <div className="text-[10px] uppercase tracking-wider mt-0.5 font-medium">match</div>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {job.location}
          </span>
          {job.salary && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {job.salary}
            </span>
          )}
          {job.posted_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {job.posted_at}
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
          {job.description_snippet}
        </p>

        {/* Expand/collapse */}
        {job.description_snippet.length > 100 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-blue-500 hover:text-blue-700 mt-2 transition-colors"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {expanded && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-zinc-500 leading-relaxed mt-2"
          >
            {job.description_snippet}
          </motion.p>
        )}

        {/* Saved status badge */}
        {savedJob && (
          <div className="mt-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[savedJob.status]}`}>
              {savedJob.status.charAt(0).toUpperCase() + savedJob.status.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-6 py-3 bg-zinc-50 border-t border-zinc-100">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Apply
        </a>
        <button
          onClick={() => isSaved ? onUnsave(job.id) : onSave(job)}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
            isSaved
              ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
          }`}
        >
          {isSaved
            ? <><BookmarkCheck className="w-3.5 h-3.5" />Saved</>
            : <><Bookmark className="w-3.5 h-3.5" />Save</>
          }
        </button>
      </div>
    </motion.div>
  );
}
