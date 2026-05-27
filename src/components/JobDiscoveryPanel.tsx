"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, ChevronDown, ChevronUp,
  Briefcase, X, MapPin, Filter,
} from "lucide-react";
import type {
  JobListing, JobSearchResult, ParsedResume,
  SavedJob, SavedJobStatus, JobSource,
} from "@/lib/types";
import { discoverJobs, ApiError } from "@/lib/api";
import { JobCard } from "./JobCard";
import { SavedJobs } from "./SavedJobs";

interface JobDiscoveryPanelProps {
  resume: ParsedResume;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; data: JobSearchResult }
  | { kind: "error"; message: string };

const SOURCES: { value: JobSource; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "remotive", label: "Remotive" },
  { value: "indeed", label: "Indeed" },
];

const FILTER_OPTIONS = ["all", "strong", "moderate", "weak"] as const;
type Filter = typeof FILTER_OPTIONS[number];

function extractSuggestedKeywords(resume: ParsedResume): string[] {
  const skills = resume.skills;
  const keywords: string[] = [];
  keywords.push(...skills.technical.slice(0, 3));
  keywords.push(...skills.tools.slice(0, 2));
  if (resume.experience[0]?.title) keywords.unshift(resume.experience[0].title);
  return [...new Set(keywords)].slice(0, 5);
}

export function JobDiscoveryPanel({ resume }: JobDiscoveryPanelProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [location, setLocation] = useState("");
  const [selectedSources, setSelectedSources] = useState<JobSource[]>(["linkedin", "remotive"]);
  const [filter, setFilter] = useState<Filter>("all");
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [customKeyword, setCustomKeyword] = useState("");
  const [extraKeywords, setExtraKeywords] = useState<string[]>([]);

  const suggestedKeywords = extractSuggestedKeywords(resume);

  // Load saved jobs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("savedJobs");
      if (stored) setSavedJobs(JSON.parse(stored));
    } catch {}
  }, []);

  const persistSaved = (jobs: SavedJob[]) => {
    setSavedJobs(jobs);
    try {
      localStorage.setItem("savedJobs", JSON.stringify(jobs));
    } catch {}
  };

  const toggleSource = (source: JobSource) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const addKeyword = () => {
    const kw = customKeyword.trim();
    if (kw && !extraKeywords.includes(kw)) {
      setExtraKeywords((prev) => [...prev, kw]);
    }
    setCustomKeyword("");
  };

  const removeKeyword = (kw: string) => {
    setExtraKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const runDiscover = async () => {
    if (selectedSources.length === 0) return;
    setState({ kind: "loading" });
    try {
      const allKeywords = extraKeywords.length > 0
        ? extraKeywords
        : undefined; // let backend auto-extract

      const data = await discoverJobs({
        resume,
        keywords: allKeywords,
        location: location.trim() || null,
        sources: selectedSources,
        max_results_per_source: 10,
        auto_match: true,
      });
      setState({ kind: "result", data });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof ApiError ? err.message : "Job discovery failed. Please try again.",
      });
    }
  };

  const handleSave = (job: JobListing) => {
    const saved: SavedJob = {
      job,
      saved_at: new Date().toISOString(),
      notes: null,
      status: "saved",
    };
    persistSaved([...savedJobs, saved]);
  };

  const handleUnsave = (jobId: string) => {
    persistSaved(savedJobs.filter((s) => s.job.id !== jobId));
  };

  const handleStatusChange = (jobId: string, status: SavedJobStatus) => {
    persistSaved(savedJobs.map((s) =>
      s.job.id === jobId ? { ...s, status } : s
    ));
  };

  const getSavedJob = (jobId: string) =>
    savedJobs.find((s) => s.job.id === jobId) || null;

  const filteredJobs =
    state.kind === "result"
      ? state.data.jobs.filter(
          (j) => filter === "all" || j.match_verdict === filter
        )
      : [];

  return (
    <section className="border-t-2 border-zinc-100 pt-16 mt-16">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 mb-6 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors">
              Discover Jobs
            </h2>
            <p className="text-sm text-zinc-400">
              Auto-matched to your résumé from LinkedIn, Indeed & Remotive
            </p>
          </div>
        </div>
        <span className="text-zinc-400 group-hover:text-zinc-600 transition-colors">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {/* Saved jobs tracker */}
            {savedJobs.length > 0 && (
              <div className="mb-6">
                <SavedJobs
                  savedJobs={savedJobs}
                  onUnsave={handleUnsave}
                  onStatusChange={handleStatusChange}
                />
              </div>
            )}

            {/* Config card */}
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 mb-6 space-y-5">

              {/* Auto-suggested keywords */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                  Keywords from your résumé
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-sm bg-white border border-zinc-300 text-zinc-700 px-3 py-1 rounded-lg font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  These are used automatically. Add more below to narrow the search.
                </p>
              </div>

              {/* Extra keywords */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                  Add keywords (optional)
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                    placeholder="e.g. LangChain, RAG, Islamabad..."
                    className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:border-zinc-400 outline-none transition-colors"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {extraKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {extraKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1.5 text-sm bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-lg"
                      >
                        {kw}
                        <button onClick={() => removeKeyword(kw)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                  Location (optional)
                </p>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Pakistan, Remote, London..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:border-zinc-400 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Sources */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                  Sources
                </p>
                <div className="flex gap-2">
                  {SOURCES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => toggleSource(s.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedSources.includes(s.value)
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search button */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={runDiscover}
                disabled={state.kind === "loading" || selectedSources.length === 0}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  state.kind === "loading" || selectedSources.length === 0
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    : "bg-zinc-900 text-white hover:bg-zinc-700"
                }`}
              >
                {state.kind === "loading" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Discovering jobs…</>
                ) : (
                  <><Search className="w-4 h-4" />Discover jobs</>
                )}
              </button>
              {state.kind === "loading" && (
                <p className="text-xs text-zinc-400 italic">
                  Querying {selectedSources.length} source{selectedSources.length > 1 ? "s" : ""} concurrently — usually 5–15 seconds.
                </p>
              )}
            </div>

            {/* Error */}
            {state.kind === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
              >
                {state.message}
              </motion.div>
            )}

            {/* Results */}
            {state.kind === "result" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Results header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-lg font-bold text-zinc-900">
                      {state.data.total_found} jobs found
                    </p>
                    <p className="text-sm text-zinc-400">
                      Keywords: {state.data.keywords_used.join(", ")}
                      {state.data.location_used && ` · ${state.data.location_used}`}
                    </p>
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-zinc-400" />
                    <div className="flex gap-1">
                      {FILTER_OPTIONS.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                            filter === f
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Job grid */}
                {filteredJobs.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredJobs.map((job, i) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        savedJob={getSavedJob(job.id)}
                        onSave={handleSave}
                        onUnsave={handleUnsave}
                        index={i}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-400">
                    <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No {filter !== "all" ? filter : ""} match jobs found.</p>
                    <button
                      onClick={() => setFilter("all")}
                      className="text-sm text-blue-500 hover:text-blue-700 mt-1 transition-colors"
                    >
                      Show all results
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
