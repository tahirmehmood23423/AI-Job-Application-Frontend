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
        message: err instanceof ApiError ? err.message : "Tailor failed. Please try again.",
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
          <div className="w-11 h-11 bg-violet-light rounded-xl flex items-center justify-center flex-shrink-0">
            <Wand2 className="w-5 h-5 text-violet" />
          </div>
          <div className="text-left">
            <p className="font-bold text-ink text-lg group-hover:text-violet transition-colors">
              Tailor for this job
            </p>
            <p className="text-sm text-muted mt-0.5">
              Rewrite and optimise your résumé for a specific role
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
                Generate a tailored version of your résumé for this specific job. The AI rewrites,
                reorders, and emphasises — but is source-bound: it will never invent skills or
                experience you don&apos;t have.
              </p>

              {/* Mode picker */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Mode</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <ModeOption
                    active={mode === "strict"}
                    onClick={() => setMode("strict")}
                    icon={Shield}
                    label="Strict review"
                    hint="Inspect and accept each change individually"
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
                  <label className="block text-sm font-semibold text-ink">Job description</label>
                  <span className={`text-xs font-mono ${jd.length < 50 ? "text-muted-light" : "text-success"}`}>
                    {jd.length < 50 ? `${50 - jd.length} more chars needed` : `${jd.length} chars · ready`}
                  </span>
                </div>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the full job description here. The richer the detail, the better the tailoring."
                  rows={9}
                  className="input font-sans"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <button onClick={run} disabled={!canSubmit} className="btn-primary">
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
                  <p className="text-sm text-muted italic">
                    Rewriting + diff + ATS check — usually 15–30 seconds.
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
                  <TailorResults data={state.data} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
      className={[
        "flex items-start gap-3 text-left px-4 py-3.5 rounded-xl border transition-all",
        active
          ? "bg-navy border-navy text-white"
          : "bg-surface border-border text-ink hover:border-border-strong",
      ].join(" ")}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${active ? "text-blue-400" : "text-muted"}`} strokeWidth={1.5} />
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className={`text-xs mt-0.5 ${active ? "text-white/60" : "text-muted"}`}>{hint}</p>
      </div>
    </button>
  );
}
