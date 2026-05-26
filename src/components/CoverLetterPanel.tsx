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
          err instanceof ApiError
            ? err.message
            : "Cover letter generation failed. Please try again.",
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
            Generate a cover letter
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
              Paste a job description and pick a tone. The generator extracts your
              strongest talking points first, then writes a structured cover letter
              — source-bound, nothing invented.
              {matchResult && (
                <span className="text-accent">
                  {" "}Using your match score ({matchResult.overall_score}/100) to prioritise what to highlight.
                </span>
              )}
            </p>

            {/* Inputs row 1 */}
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

            {/* Tone selector */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-[0.2em] text-graphite mb-3">
                Tone
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`
                      px-4 py-3 text-left border transition-colors
                      ${tone === t.value
                        ? "border-ink bg-ink text-cream"
                        : "border-rule bg-cream text-ink hover:border-ink"
                      }
                    `}
                  >
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className={`text-xs mt-0.5 ${tone === t.value ? "text-cream/70" : "text-graphite"}`}>
                      {t.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* JD textarea */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-graphite mb-2">
                Job description
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here. The more detail, the stronger the talking points."
                rows={10}
                className="w-full px-4 py-3 bg-cream border border-rule text-ink focus:border-ink outline-none transition-colors font-serif text-base leading-relaxed resize-y"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-graphite">
                  {jd.length} characters · {jd.length < 50 ? "Need at least 50" : "Ready to generate"}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={runGenerate}
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
                <p className="text-xs text-graphite italic">
                  Extracting talking points, then writing — usually 20–40 seconds.
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
                <CoverLetterResultComponent data={state.data} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
