"use client";

import { motion } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";
import type { MatchResult, RequirementMatchStatus } from "@/lib/types";

interface Props {
  data: MatchResult;
}

export function MatchResults({ data }: Props) {
  const scoreColor =
    data.verdict === "strong"
      ? "text-accent"
      : data.verdict === "moderate"
      ? "text-ink"
      : "text-graphite";

  return (
    <div className="space-y-12">
      {/* The headline number */}
      <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start pb-8 border-b border-rule">
        <div>
          <div className={`font-serif text-8xl md:text-9xl leading-none tracking-tightest ${scoreColor}`}>
            {data.overall_score}
            <span className="text-2xl text-graphite">/100</span>
          </div>
          <div className="mt-3 text-xs uppercase tracking-[0.2em] text-graphite">
            {data.verdict} match
          </div>
        </div>

        <div className="md:pt-6">
          <p className="font-serif text-xl md:text-2xl leading-relaxed text-ink mb-6 max-w-xl">
            {data.summary}
          </p>

          {/* Sub-scores */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-md">
            <SubScore
              label="Semantic similarity"
              value={data.semantic_similarity}
              hint="How close the documents are in meaning"
            />
            <SubScore
              label="Requirement coverage"
              value={data.requirement_coverage}
              hint="Weighted by importance"
            />
          </div>
        </div>
      </div>

      {/* Matched skills */}
      {data.matched_skills.length > 0 && (
        <Section title="Skills you have" num="01">
          <div className="flex flex-wrap gap-2">
            {data.matched_skills.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 border border-accent text-sm"
                style={{ color: "#B8472F" }}
              >
                <Check className="w-3 h-3" strokeWidth={2} />
                {s}
              </motion.span>
            ))}
          </div>
        </Section>
      )}

      {/* Missing skills */}
      {data.missing_skills.length > 0 && (
        <Section title="Skills the job wants that you didn't list" num="02">
          <div className="flex flex-wrap gap-2">
            {data.missing_skills.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 border border-rule text-sm text-graphite"
              >
                <X className="w-3 h-3" strokeWidth={2} />
                {s}
              </motion.span>
            ))}
          </div>
          <p className="text-xs text-graphite italic mt-4 max-w-2xl">
            If you actually have any of these, add them to your résumé. The matcher
            only sees what's written.
          </p>
        </Section>
      )}

      {/* Full requirement breakdown */}
      {data.matched_requirements.length > 0 && (
        <Section title="Every requirement, one by one" num="03">
          <div className="space-y-3">
            {data.matched_requirements.map((req, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[auto_1fr_auto] gap-4 items-baseline pb-3 border-b border-rule/60"
              >
                <StatusBadge status={req.status} />
                <div>
                  <div className="text-ink">{req.text}</div>
                  {req.evidence && (
                    <div className="text-xs text-graphite italic mt-1 max-w-xl">
                      "{req.evidence}"
                    </div>
                  )}
                </div>
                <ImportanceBadge importance={req.importance} />
              </motion.div>
            ))}
          </div>
        </Section>
      )}
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

function SubScore({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs uppercase tracking-[0.15em] text-graphite">
          {label}
        </span>
        <span className="font-mono text-sm text-ink">{pct}%</span>
      </div>
      <div className="h-px bg-rule relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 bg-accent"
          style={{ height: "1px" }}
        />
      </div>
      <p className="text-[11px] text-graphite italic mt-1.5">{hint}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: RequirementMatchStatus }) {
  const config = {
    match: {
      Icon: Check,
      label: "match",
      color: "text-accent border-accent",
    },
    partial: {
      Icon: AlertCircle,
      label: "partial",
      color: "text-graphite border-rule",
    },
    missing: {
      Icon: X,
      label: "missing",
      color: "text-graphite border-rule opacity-60",
    },
  }[status];

  const { Icon, label, color } = config;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] uppercase tracking-wider ${color}`}
    >
      <Icon className="w-2.5 h-2.5" strokeWidth={2} />
      {label}
    </span>
  );
}

function ImportanceBadge({
  importance,
}: {
  importance: "required" | "preferred" | "nice_to_have";
}) {
  const label = importance.replace("_", " ");
  const opacity = importance === "required" ? "" : "opacity-60";
  return (
    <span className={`font-mono text-[10px] uppercase tracking-wider text-graphite ${opacity}`}>
      {label}
    </span>
  );
}
