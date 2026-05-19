"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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
        message:
          err instanceof ApiError
            ? err.message
            : "Match failed. Please try again.",
      });
    }
  };

  return (
    <section className="border-t border-rule pt-16 mt-16">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-baseline justify-between gap-4 mb-6 group"
      >
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-xs text-graphite">07</span>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-ink group-hover:text-accent transition-colors">
            Match against a job
          </h2>
        </div>
        <span className="text-graphite group-hover:text-ink transition-colors">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
            <p className="text-graphite max-w-2xl mb-8 leading-relaxed">
              Paste a job description below. The matcher will score it against
              your résumé using semantic similarity and a requirement-by-requirement
              check — and tell you what you're missing.
            </p>

            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-graphite mb-2">
                  Job title (optional)
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior ML Engineer"
                  className="w-full px-4 py-3 bg-cream border border-rule text-ink focus:border-ink outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-graphite mb-2">
                  Company (optional)
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Anthropic"
                  className="w-full px-4 py-3 bg-cream border border-rule text-ink focus:border-ink outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-graphite mb-2">
                Job description
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here. The more detail, the better the match score."
                rows={10}
                className="w-full px-4 py-3 bg-cream border border-rule text-ink focus:border-ink outline-none transition-colors font-serif text-base leading-relaxed resize-y"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-graphite">
                  {jd.length} characters · {jd.length < 50 ? "Need at least 50" : "Ready to match"}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={runMatch}
                disabled={!canSubmit}
                className={`
                  inline-flex items-center gap-2 px-6 py-3 text-sm transition-colors
                  ${canSubmit
                    ? "bg-ink text-cream hover:bg-graphite"
                    : "bg-rule text-graphite cursor-not-allowed"}
                `}
              >
                {state.kind === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Matching…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run match
                  </>
                )}
              </button>
              {state.kind === "loading" && (
                <p className="text-xs text-graphite italic">
                  Embedding + requirement extraction — usually 8–15 seconds.
                </p>
              )}
            </div>

            {/* Error */}
            {state.kind === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 border border-rule bg-cream text-sm text-accentDark"
              >
                {state.message}
              </motion.div>
            )}

            {/* Result */}
            {state.kind === "result" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-12"
              >
                <MatchResults data={state.data} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
