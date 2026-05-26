"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { CoverLetterResult, MatchResult, ParsedResume, TonePreference } from "@/lib/types";
import { generateCoverLetter, ApiError } from "@/lib/api";
import { CoverLetterResult as CoverLetterResultComponent } from "./CoverLetterResult";

interface CoverLetterPanelProps {
  resume: ParsedResume;
  matchResult?: MatchResult | null;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; data: CoverLetterResult }
  | { kind: "error"; message: string };

const TONES: { value: TonePreference; label: string; hint: string }[] = [
  { value: "professional", label: "Professional", hint: "Polished and formal" },
  { value: "conversational", label: "Conversational", hint: "Natural and warm" },
  { value: "confident", label: "Confident", hint: "Direct and bold" },
  { value: "enthusiastic", label: "Enthusiastic", hint: "Energetic and eager" },
];

export function CoverLetterPanel({ resume, matchResult }: CoverLetterPanelProps) {
  const [open, setOpen] = useState(false);
  const [jd, setJd] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [tone, setTone] = useState<TonePreference>("professional");
  const [state, setState] = useState<State>({ kind: "idle" });

  const canSubmit = jd.trim().length >= 50 && state.kind !== "loading";

  const runGenerate = async () => {
    setState({ kind: "loading" });
    try {
      const data = await generateCoverLetter({
        resume,
        match_result: matchResult ?? null,
        job_description: jd.trim(),
        tone,
        job_title: jobTitle.trim() || null,
        company_name: company.trim() || null,
      });
      setState({ kind: "result", data });
    } catch (err) {
      setState({
        kind: "error",
        message:
          err instanceof ApiError ? err.message : "Cover letter generation failed. Please try again.",
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
          <div className="w-11 h-11 bg-success-light rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-success" />
          </div>
          <div className="text-left">
            <p className="font-bold text-ink text-lg group-hover:text-success transition-colors">
              Generate a cover letter
            </p>
            <p className="text-sm text-muted mt-0.5">
              AI-written, source-bound — nothing invented
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
                Paste a job description and pick a tone. The generator extracts your strongest
                talking points first, then writes a structured cover letter — source-bound, nothing
                invented.
                {matchResult && (
                  <span className="text-success font-medium">
                    {" "}Using your match score ({matchResult.overall_score}/100) to prioritise
                    what to highlight.
                  </span>
                )}
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

              {/* Tone selector */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Tone</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={[
                        "px-4 py-3 text-left rounded-xl border transition-all",
                        tone === t.value
                          ? "bg-navy border-navy text-white"
                          : "bg-surface border-border text-ink hover:border-border-strong",
                      ].join(" ")}
                    >
                      <div className="text-sm font-semibold">{t.label}</div>
                      <div className={`text-xs mt-0.5 ${tone === t.value ? "text-white/60" : "text-muted"}`}>
                        {t.hint}
                      </div>
                    </button>
                  ))}
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
                  placeholder="Paste the full job description here. The more detail, the stronger the talking points."
                  rows={9}
                  className="input font-sans"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <button onClick={runGenerate} disabled={!canSubmit} className="btn-primary">
                  {state.kind === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate cover letter
                    </>
                  )}
                </button>
                {state.kind === "loading" && (
                  <p className="text-sm text-muted italic">
                    Extracting talking points, then writing — usually 20–40 seconds.
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
                  <CoverLetterResultComponent data={state.data} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
