"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { MatchResult, ParsedResume } from "@/lib/types";
import { matchJob, ApiError } from "@/lib/api";
import { MatchResults } from "./MatchResults";

interface MatchPanelProps {
  resume: ParsedResume;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; data: MatchResult }
  | { kind: "error"; message: string };

export function MatchPanel({ resume }: MatchPanelProps) {
  const [open, setOpen] = useState(false);
  const [jd, setJd] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const canSubmit = jd.trim().length >= 50 && state.kind !== "loading";

  const runMatch = async () => {
    setState({ kind: "loading" });
    try {
      const data = await matchJob({
        resume,
        job_description: jd.trim(),
        job_title: jobTitle.trim() || null,
        company: company.trim() || null,
      });
      setState({ kind: "result", data });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof ApiError ? err.message : "Match failed. Please try again.",
      });
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-6 hover:bg-bg transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-bold text-ink text-lg group-hover:text-primary transition-colors">
              Match against a job
            </p>
            <p className="text-sm text-muted mt-0.5">
              Score your résumé against a job description
            </p>
          </div>
        </div>
        <span className="text-muted-light group-hover:text-muted transition-colors flex-shrink-0">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8 border-t border-border pt-6 space-y-5">
              <p className="text-muted text-base leading-relaxed max-w-2xl">
                Paste a job description below. The matcher scores it against your résumé using
                semantic similarity and a requirement-by-requirement check — and tells you exactly
                what's missing.
              </p>

              {/* Optional fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Job title <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior ML Engineer"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Company <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Anthropic"
                    className="input"
                  />
                </div>
              </div>

              {/* JD textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-ink">
                    Job description
                  </label>
                  <span className={`text-xs font-mono ${jd.length < 50 ? "text-muted-light" : "text-success"}`}>
                    {jd.length < 50 ? `${50 - jd.length} more chars needed` : `${jd.length} chars · ready`}
                  </span>
                </div>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the full job description here. The more detail, the better the match score."
                  rows={9}
                  className="input font-sans"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <button onClick={runMatch} disabled={!canSubmit} className="btn-primary">
                  {state.kind === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Matching…
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      Run match
                    </>
                  )}
                </button>
                {state.kind === "loading" && (
                  <p className="text-sm text-muted italic">
                    Embedding + requirement extraction — usually 8–15 seconds.
                  </p>
                )}
              </div>

              {/* Error */}
              {state.kind === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-error-light border border-error-border text-error px-4 py-3 rounded-xl text-sm font-medium"
                >
                  {state.message}
                </motion.div>
              )}

              {/* Result */}
              {state.kind === "result" && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4"
                >
                  <MatchResults data={state.data} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
