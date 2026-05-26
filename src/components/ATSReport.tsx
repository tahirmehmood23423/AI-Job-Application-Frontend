"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, XCircle, CheckCircle } from "lucide-react";
import type { ATSReport as ATSReportType, ATSSeverity } from "@/lib/types";

interface Props {
  report: ATSReportType;
}

export function ATSReport({ report }: Props) {
  const scoreStyle =
    report.score >= 80
      ? { text: "text-success", bg: "bg-success-light", border: "border-success-border", bar: "bg-success" }
      : report.score >= 60
      ? { text: "text-primary", bg: "bg-primary-light", border: "border-primary-border", bar: "bg-primary" }
      : { text: "text-warning", bg: "bg-warning-light", border: "border-warning-border", bar: "bg-warning" };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-bg rounded-lg flex items-center justify-center border border-border">
          <CheckCircle className="w-5 h-5 text-muted" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-ink">ATS Compatibility</h2>
      </div>

      {/* Score + stats */}
      <div className={`rounded-2xl border ${scoreStyle.bg} ${scoreStyle.border} p-6 md:p-8 mb-6`}>
        <div className="flex flex-wrap items-start gap-6 md:gap-10">
          <div className="flex-shrink-0">
            <div className={`font-serif text-8xl font-bold leading-none ${scoreStyle.text}`}>
              {report.score}
            </div>
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mt-2">ATS Score / 100</p>
          </div>
          <div className="flex-1 pt-2 space-y-4">
            <div className="grid sm:grid-cols-2 gap-5 max-w-sm">
              <Stat label="Keyword coverage" value={`${Math.round(report.keyword_coverage * 100)}%`} />
              <Stat label="Issues found" value={String(report.issues.length)} />
            </div>
            <p className="text-sm text-muted italic max-w-xl leading-relaxed">
              ATS systems index your résumé as plain text. This score reflects how cleanly the
              tailored version parses and how many of the job&apos;s keywords appear.
            </p>
          </div>
        </div>
      </div>

      {/* Issues */}
      {report.issues.length > 0 && (
        <div className="mb-8">
          <h3 className="text-base font-bold text-ink mb-4">Issues to address</h3>
          <div className="space-y-2">
            {groupBySeverity(report.issues).flatMap(({ severity, items }) =>
              items.map((issue, i) => (
                <IssueRow key={`${severity}-${i}`} severity={severity} message={issue.message} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Keywords */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-base font-bold text-ink mb-3">Keywords matched</h3>
          {report.keyword_matches.length === 0 ? (
            <p className="text-sm text-muted italic">None matched.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {report.keyword_matches.map((k, i) => (
                <motion.span
                  key={k}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="inline-flex items-center gap-1 text-sm font-medium px-2.5 py-0.5 rounded-full bg-success-light text-success border border-success-border"
                >
                  {k}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold text-ink mb-3">Keywords missed</h3>
          {report.keyword_misses.length === 0 ? (
            <p className="text-sm text-muted italic">All keywords covered.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {report.keyword_misses.map((k, i) => (
                  <motion.span
                    key={k}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-bg text-muted border border-border"
                  >
                    {k}
                  </motion.span>
                ))}
              </div>
              <p className="text-xs text-muted italic">
                Consider weaving these in — but only where you actually have the experience.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink font-serif">{value}</p>
    </div>
  );
}

function IssueRow({ severity, message }: { severity: ATSSeverity; message: string }) {
  const cfg = {
    error: { Icon: XCircle, cls: "text-error bg-error-light border-error-border", label: "Error" },
    warning: { Icon: AlertTriangle, cls: "text-warning bg-warning-light border-warning-border", label: "Warning" },
    info: { Icon: Info, cls: "text-primary bg-primary-light border-primary-border", label: "Info" },
  }[severity];

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.cls}`}>
      <cfg.Icon className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
      <div>
        <span className="text-xs font-bold uppercase tracking-wide mr-2">{cfg.label}</span>
        <span className="text-sm leading-relaxed">{message}</span>
      </div>
    </div>
  );
}

function groupBySeverity(issues: ATSReportType["issues"]) {
  const order: ATSSeverity[] = ["error", "warning", "info"];
  return order
    .map((severity) => ({ severity, items: issues.filter((i) => i.severity === severity) }))
    .filter((g) => g.items.length > 0);
}
