"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { MatchResult, RequirementMatchStatus } from "@/lib/types";

interface Props {
  data: MatchResult;
}

export function MatchResults({ data }: Props) {
  const verdictStyle = {
    strong: { bar: "bg-success", text: "text-success", bg: "bg-success-light", border: "border-success-border" },
    moderate: { bar: "bg-primary", text: "text-primary", bg: "bg-primary-light", border: "border-primary-border" },
    weak: { bar: "bg-warning", text: "text-warning", bg: "bg-warning-light", border: "border-warning-border" },
  }[data.verdict];

  return (
    <div className="space-y-8">
      {/* Score header */}
      <div className={`rounded-2xl border ${verdictStyle.bg} ${verdictStyle.border} p-6 md:p-8`}>
        <div className="flex flex-wrap items-start gap-6 md:gap-10">
          <div className="flex-shrink-0">
            <div className={`font-serif text-8xl md:text-9xl font-bold leading-none tracking-tight ${verdictStyle.text}`}>
              {data.overall_score}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted font-mono">/100</span>
              <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${verdictStyle.bg} ${verdictStyle.text} ${verdictStyle.border}`}>
                {data.verdict} match
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-2">
            <p className="text-ink text-lg md:text-xl leading-relaxed font-medium mb-6 max-w-xl">
              {data.summary}
            </p>
            <div className="grid sm:grid-cols-2 gap-5 max-w-md">
              <SubScore
                label="Semantic similarity"
                value={data.semantic_similarity}
                barColor={verdictStyle.bar}
              />
              <SubScore
                label="Requirement coverage"
                value={data.requirement_coverage}
                barColor={verdictStyle.bar}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Matched skills */}
      {data.matched_skills.length > 0 && (
        <ResultSection title="Skills you have" num="01">
          <div className="flex flex-wrap gap-2">
            {data.matched_skills.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-success-light text-success border border-success-border"
              >
                <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                {s}
              </motion.span>
            ))}
          </div>
        </ResultSection>
      )}

      {/* Missing skills */}
      {data.missing_skills.length > 0 && (
        <ResultSection title="Skills the job wants that you didn't list" num="02">
          <div className="flex flex-wrap gap-2 mb-3">
            {data.missing_skills.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-bg text-muted border border-border"
              >
                <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                {s}
              </motion.span>
            ))}
          </div>
          <p className="text-sm text-muted italic">
            If you have any of these, add them to your résumé — the matcher only sees what's written.
          </p>
        </ResultSection>
      )}

      {/* Requirement breakdown */}
      {data.matched_requirements.length > 0 && (
        <ResultSection title="Every requirement, one by one" num="03">
          <div className="space-y-2">
            {data.matched_requirements.map((req, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[auto_1fr_auto] gap-3 items-start py-3 border-b border-border/60 last:border-0"
              >
                <StatusPill status={req.status} />
                <div>
                  <p className="text-ink text-sm leading-relaxed">{req.text}</p>
                  {req.evidence && (
                    <p className="text-xs text-muted italic mt-1">"{req.evidence}"</p>
                  )}
                </div>
                <ImportancePill importance={req.importance} />
              </motion.div>
            ))}
          </div>
        </ResultSection>
      )}
    </div>
  );
}

// ── Helpers ──

function ResultSection({
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
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-mono text-xs text-muted-light">{num}</span>
        <h3 className="text-lg font-bold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SubScore({
  label,
  value,
  barColor,
}: {
  label: string;
  value: number;
  barColor: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</span>
        <span className="font-mono text-sm font-bold text-ink">{pct}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: RequirementMatchStatus }) {
  const cfg = {
    match: {
      Icon: CheckCircle,
      label: "Match",
      cls: "bg-success-light text-success border-success-border",
    },
    partial: {
      Icon: AlertCircle,
      label: "Partial",
      cls: "bg-warning-light text-warning border-warning-border",
    },
    missing: {
      Icon: XCircle,
      label: "Missing",
      cls: "bg-bg text-muted border-border",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.cls} whitespace-nowrap`}
    >
      <cfg.Icon className="w-3 h-3" strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function ImportancePill({
  importance,
}: {
  importance: "required" | "preferred" | "nice_to_have";
}) {
  const labels = { required: "Required", preferred: "Preferred", nice_to_have: "Nice to have" };
  const opacity = importance === "required" ? "" : "opacity-50";
  return (
    <span className={`font-mono text-[11px] text-muted whitespace-nowrap ${opacity}`}>
      {labels[importance]}
    </span>
  );
}
