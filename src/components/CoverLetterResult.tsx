"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, CheckCheck } from "lucide-react";
import type { CoverLetterResult } from "@/lib/types";

interface Props {
  data: CoverLetterResult;
}

export function CoverLetterResult({ data }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Meta row */}
      <div className="bg-bg border border-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-6 md:gap-10">
          <div className="flex-shrink-0">
            <div className="font-serif text-8xl font-bold leading-none text-ink">
              {data.word_count}
            </div>
            <p className="text-sm text-muted mt-2">words written</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-primary-light text-primary border border-primary-border">
                {data.tone_applied}
              </span>
              {data.match_score_used !== null && (
                <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-success-light text-success border border-success-border">
                  Score {data.match_score_used}/100
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 pt-2 space-y-5">
            {/* Matched skills used */}
            {data.talking_points.matched_skills.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">
                  Skills highlighted
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.talking_points.matched_skills.map((skill, i) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-success-light text-success border border-success-border"
                    >
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Standout achievement */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">
                Standout achievement used
              </p>
              <p className="text-base text-ink italic leading-relaxed max-w-xl">
                "{data.talking_points.standout_achievement}"
              </p>
            </div>

            {/* Gap addressed */}
            {data.talking_points.gap_to_address && (
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">
                  Gap reframed
                </p>
                <p className="text-sm text-muted italic max-w-xl leading-relaxed">
                  {data.talking_points.gap_to_address}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strongest experiences */}
      {data.talking_points.strongest_experiences.length > 0 && (
        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-mono text-xs text-muted-light">01</span>
            <h3 className="text-lg font-bold text-ink">Experiences highlighted</h3>
          </div>
          <div className="divide-y divide-border">
            {data.talking_points.strongest_experiences.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[auto_1fr] gap-4 items-baseline py-4 first:pt-0 last:pb-0"
              >
                <span className="font-mono text-xs text-muted-light">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-ink text-base leading-relaxed">{exp}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* The letter */}
      <div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-mono text-xs text-muted-light">02</span>
          <h3 className="text-lg font-bold text-ink">Your cover letter</h3>
        </div>

        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-semibold text-muted hover:text-ink hover:border-border-strong transition-colors"
          >
            {copied ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-success" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="bg-surface border border-border rounded-2xl px-8 py-10 pr-24"
          >
            <div className="text-ink text-base leading-[1.9] whitespace-pre-wrap max-w-2xl font-serif">
              {data.cover_letter}
            </div>
          </motion.div>
        </div>

        <p className="text-sm text-muted italic mt-3 max-w-xl">
          Every claim in this letter comes directly from your résumé — nothing was invented.
          Edit freely before sending.
        </p>
      </div>
    </div>
  );
}
