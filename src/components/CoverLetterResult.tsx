"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, CheckCheck } from "lucide-react";
import type { CoverLetterResult, TonePreference } from "@/lib/types";

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
    <div className="space-y-12">
      {/* Meta row */}
      <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start pb-8 border-b border-rule">
        <div>
          <div className="font-serif text-8xl md:text-9xl leading-none tracking-tightest text-ink">
            {data.word_count}
            <span className="text-2xl text-graphite"> words</span>
          </div>
          <div className="mt-3 text-xs uppercase tracking-[0.2em] text-graphite">
            {data.tone_applied} tone
            {data.match_score_used !== null && (
              <span className="ml-3 text-accent">
                · based on {data.match_score_used}/100 match
              </span>
            )}
          </div>
        </div>

        <div className="md:pt-6 space-y-4">
          {/* Talking points used */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-graphite mb-3">
              Talking points extracted
            </p>
            <div className="flex flex-wrap gap-2">
              {data.talking_points.matched_skills.map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 border border-accent text-sm"
                  style={{ color: "#B8472F" }}
                >
                  <Check className="w-3 h-3" strokeWidth={2} />
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Standout achievement */}
          <div className="pt-2">
            <p className="text-xs uppercase tracking-[0.2em] text-graphite mb-2">
              Standout achievement used
            </p>
            <p className="font-serif text-base text-ink italic leading-relaxed max-w-xl">
              "{data.talking_points.standout_achievement}"
            </p>
          </div>

          {/* Gap addressed */}
          {data.talking_points.gap_to_address && (
            <div className="pt-2">
              <p className="text-xs uppercase tracking-[0.2em] text-graphite mb-2">
                Gap reframed
              </p>
              <p className="text-sm text-graphite italic max-w-xl">
                {data.talking_points.gap_to_address}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Strongest experiences used */}
      {data.talking_points.strongest_experiences.length > 0 && (
        <Section title="Experiences highlighted" num="01">
          <div className="space-y-3">
            {data.talking_points.strongest_experiences.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[auto_1fr] gap-4 items-baseline pb-3 border-b border-rule/60"
              >
                <span className="font-mono text-[10px] text-graphite">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-ink leading-relaxed">{exp}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* The letter itself */}
      <Section title="Your cover letter" num="02">
        <div className="relative">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 border border-rule bg-cream text-xs text-graphite hover:border-ink hover:text-ink transition-colors"
          >
            {copied ? (
              <>
                <CheckCheck className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>

          {/* Letter body */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-cream border border-rule px-8 py-10 pr-24"
          >
            <div className="font-serif text-base leading-[1.9] text-ink whitespace-pre-wrap max-w-2xl">
              {data.cover_letter}
            </div>
          </motion.div>
        </div>

        <p className="text-xs text-graphite italic mt-4 max-w-2xl">
          Every claim in this letter comes directly from your résumé — nothing was invented.
          Edit freely before sending.
        </p>
      </Section>
    </div>
  );
}

// ---------- Helpers ----------

function Section({
  title,
  num,
  children,
}: {
  title: string;
  num: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-mono text-[10px] text-graphite">{num}</span>
        <h3 className="font-serif text-xl text-ink tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}
