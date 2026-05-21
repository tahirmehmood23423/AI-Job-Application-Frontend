"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, XCircle, CheckCircle } from "lucide-react";
import type { ATSReport as ATSReportType, ATSSeverity } from "@/lib/types";

interface Props {
  report: ATSReportType;
}

export function ATSReport({ report }: Props) {
  const scoreColor =
    report.score >= 80 ? "text-accent" :
    report.score >= 60 ? "text-ink" :
    "text-graphite";

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-mono text-xs text-graphite">09</span>
        <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-ink">
          ATS compatibility
        </h2>
      </div>

      {/* Score and headline */}
      <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start mb-10 pb-8 border-b border-rule">
        <div>
          <div className={`font-serif text-7xl leading-none tracking-tightest ${scoreColor}`}>
            {report.score}
            <span className="text-xl text-graphite">/100</span>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-graphite mt-3">
            ATS score
          </p>
        </div>
        <div className="md:pt-4">
          <div className="grid sm:grid-cols-2 gap-4 max-w-md">
            <Stat
              label="Keyword coverage"
              value={`${Math.round(report.keyword_coverage * 100)}%`}
            />
            <Stat
              label="Issues found"
              value={String(report.issues.length)}
            />
          </div>
          <p className="text-sm text-graphite mt-4 italic max-w-xl">
            ATS systems index your résumé as plain text. This score reflects how
            cleanly your tailored version would parse and how many of the job&apos;s
            keywords appear.
          </p>
        </div>
      </div>

      {/* Issues */}
      {report.issues.length > 0 && (
        <div className="mb-10">
          <h3 className="font-serif text-xl text-ink mb-5">Issues to address</h3>
          <div className="space-y-3">
            {groupBySeverity(report.issues).map(({ severity, items }) =>
              items.map((issue, i) => (
                <IssueRow key={`${severity}-${i}`} severity={severity} message={issue.message} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Keyword matches and misses */}
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="font-serif text-lg text-ink mb-3">Keywords matched</h3>
          {report.keyword_matches.length === 0 ? (
            <p className="text-sm text-graphite italic">None matched.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {report.keyword_matches.map((k, i) => (
                <motion.span
                  key={k}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 border border-accent text-xs"
                  style={{ color: "#B8472F" }}
                >
                  {k}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-serif text-lg text-ink mb-3">Keywords missed</h3>
          {report.keyword_misses.length === 0 ? (
            <p className="text-sm text-graphite italic">All keywords covered.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {report.keyword_misses.map((k, i) => (
                  <motion.span
                    key={k}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 border border-rule text-xs text-graphite"
                  >
                    {k}
                  </motion.span>
                ))}
              </div>
              <p className="text-[11px] text-graphite italic mt-3">
                Consider weaving these in — but only where you actually have the experience.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- helpers ----------

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-graphite mb-1">{label}</p>
      <p className="font-serif text-2xl text-ink">{value}</p>
    </div>
  );
}

function IssueRow({ severity, message }: { severity: ATSSeverity; message: string }) {
  const { Icon, color, label } = severityStyle(severity);
  return (
    <div className="flex items-start gap-3 py-2 border-b border-rule/60">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} strokeWidth={1.5} />
      <div className="flex-1">
        <span className={`font-mono text-[10px] uppercase tracking-wider ${color}`}>
          {label}
        </span>
        <p className="text-sm text-ink mt-0.5">{message}</p>
      </div>
    </div>
  );
}

function severityStyle(s: ATSSeverity) {
  switch (s) {
    case "error":
      return { Icon: XCircle, color: "text-accent", label: "error" };
    case "warning":
      return { Icon: AlertTriangle, color: "text-ink", label: "warning" };
    case "info":
      return { Icon: Info, color: "text-graphite", label: "info" };
  }
}

function groupBySeverity(issues: ATSReportType["issues"]) {
  const order: ATSSeverity[] = ["error", "warning", "info"];
  return order
    .map((severity) => ({
      severity,
      items: issues.filter((i) => i.severity === severity),
    }))
    .filter((g) => g.items.length > 0);
}
