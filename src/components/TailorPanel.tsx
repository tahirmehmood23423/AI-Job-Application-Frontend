"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, ChevronDown, ChevronUp, Shield, Zap } from "lucide-react";
import type { ParsedResume, TailorMode, TailorResult } from "@/lib/types";
import { tailorResume, ApiError } from "@/lib/api";
import { TailorResults } from "./TailorResults";

interface TailorPanelProps {
  resume: ParsedResume;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; data: TailorResult }
  | { kind: "error"; message: string };

export function TailorPanel({ resume }: TailorPanelProps) {
  const [open, setOpen] = useState(false);
  const [jd, setJd] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [mode, setMode] = useState<TailorMode>("strict");
  const [state, setState] = useState<State>({ kind: "idle" });

  const canSubmit = jd.trim().length >= 50 && state.kind !== "loading";

  const run = async () => {
    setState({ kind: "loading" });
    try {
      const data = await tailorResume({
        resume,
        job_description: jd.trim(),
        job_title: jobTitle.trim() || null,
        company: company.trim() || null,
        mode,
      });
      setState({ kind: "result", data });
    } catch (err) {
      setState({
        kind: "error",
        message:
          err instanceof ApiError
            ? err.message
            : "Tailor failed. Please try again.",
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
          <span className="font-mono text-xs text-graphite">08</span>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-ink group-hover:text-accent transition-colors">
            Tailor for this job
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
              Generate a tailored version of your résumé for this specific job.
              The AI rewrites, reorders, and emphasises — but is source-bound:
              it can never invent skills or experience you don&apos;t have.
            </p>

            {/* Mode selector */}
            <div className="mb-8">
              <label className="block text-xs uppercase tracking-[0.2em] text-graphite mb-3">
                Mode
              </label>
              <div className="flex gap-3">
                <ModeOption
                  active={mode === "strict"}
                  onClick={() => setMode("strict")}
                  icon={Shield}
                  label="Strict review"
                  hint="Inspect each change before accepting"
                />
                <ModeOption
                  active={mode === "auto"}
                  onClick={() => setMode("auto")}
                  icon={Zap}
                  label="Auto-accept"
                  hint="Apply all changes, review the diff after"
                />
              </div>
            </div>

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
                placeholder="Paste the full job description here. The richer the detail, the better the tailoring."
                rows={10}
                className="w-full px-4 py-3 bg-cream border border-rule text-ink focus:border-ink outline-none transition-colors font-serif text-base leading-relaxed resize-y"
              />
              <p className="text-xs text-graphite mt-2">
                {jd.length} characters · {jd.length < 50 ? "Need at least 50" : "Ready to tailor"}
              </p>
            </div>

            {/* Action */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={run}
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
                    Tailoring…
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Tailor my résumé
                  </>
                )}
              </button>
              {state.kind === "loading" && (
                <p className="text-xs text-graphite italic">
                  Rewriting + diff + ATS check — usually 15–30 seconds.
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
                <TailorResults data={state.data} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ModeOption({
  active,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  hint: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 text-left px-4 py-3 border transition-colors
        ${active
          ? "border-ink bg-ink text-cream"
          : "border-rule bg-cream text-ink hover:border-ink"}
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span className="font-mono text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-xs italic ${active ? "text-cream/70" : "text-graphite"}`}>
        {hint}
      </div>
    </button>
  );
}
