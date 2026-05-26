"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import type { Change, ChangeImpact, TailorResult } from "@/lib/types";
import { ATSReport } from "./ATSReport";

interface Props {
  data: TailorResult;
}

export function TailorResults({ data }: Props) {
  const isStrict = data.mode === "strict";
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(
    () => (isStrict ? new Set() : new Set(data.changes.map((c) => c.id)))
  );

  const toggle = (id: string) => {
    setAcceptedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const accepted = acceptedIds.size;
  const total = data.changes.length;

  const grouped = useMemo(() => {
    const groups: Record<string, Change[]> = {};
    for (const c of data.changes) {
      const key = c.section.split(".")[0];
      (groups[key] ||= []).push(c);
    }
    return groups;
  }, [data.changes]);

  const SECTION_ORDER = ["summary", "skills", "experience", "projects"];
  const orderedSections = SECTION_ORDER.filter((s) => grouped[s]);

  return (
    <div className="space-y-8">
      {/* Summary card */}
      <div className="bg-bg border border-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-6 md:gap-10">
          <div className="flex-shrink-0">
            <div className="font-serif text-8xl font-bold leading-none text-ink">{total}</div>
            <p className="text-sm text-muted mt-2 font-medium">
              {total === 1 ? "change proposed" : "changes proposed"}
            </p>
          </div>
          <div className="flex-1 pt-2">
            <p className="text-ink text-lg font-medium mb-3 max-w-xl">
              {data.high_impact_changes > 0
                ? `${data.high_impact_changes} high-impact change${data.high_impact_changes > 1 ? "s" : ""}, ${total - data.high_impact_changes} smaller refinements.`
                : `${total} small refinements to better fit the job.`}
            </p>
            {isStrict ? (
              <p className="text-sm text-muted">
                <span className="font-mono font-bold text-ink">{accepted}</span> of {total} accepted
                {accepted < total && " · click each change to accept"}
              </p>
            ) : (
              <p className="text-sm text-muted italic">Auto-accept — all changes applied. Review them below.</p>
            )}
          </div>
        </div>
      </div>

      {/* Source-bound warnings */}
      {data.tailored.extraction_warnings.length > data.original.extraction_warnings.length && (
        <div className="bg-warning-light border border-warning-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="font-semibold text-warning text-sm">Source-bound checks caught these</p>
          </div>
          <ul className="space-y-1">
            {data.tailored.extraction_warnings
              .slice(data.original.extraction_warnings.length)
              .map((w, i) => (
                <li key={i} className="text-sm text-muted">• {w}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Grouped changes */}
      {orderedSections.map((section) => (
        <ChangeGroup
          key={section}
          title={section.charAt(0).toUpperCase() + section.slice(1)}
          changes={grouped[section]}
          acceptedIds={acceptedIds}
          onToggle={toggle}
          isStrict={isStrict}
        />
      ))}

      {total === 0 && (
        <div className="card p-10 text-center">
          <p className="text-xl font-bold text-ink mb-2">No changes proposed</p>
          <p className="text-muted text-base max-w-md mx-auto leading-relaxed">
            The AI didn&apos;t see meaningful opportunities to tailor for this job. Your résumé may
            already be well-aligned, or the job description may be too vague.
          </p>
        </div>
      )}

      {/* ATS Report */}
      <div className="border-t border-border pt-8">
        <ATSReport report={data.ats_report} />
      </div>
    </div>
  );
}

function ChangeGroup({
  title,
  changes,
  acceptedIds,
  onToggle,
  isStrict,
}: {
  title: string;
  changes: Change[];
  acceptedIds: Set<string>;
  onToggle: (id: string) => void;
  isStrict: boolean;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <span className="text-sm text-muted font-mono">
          {changes.length} {changes.length === 1 ? "change" : "changes"}
        </span>
      </div>
      <div className="space-y-4">
        {changes.map((c, i) => (
          <ChangeRow
            key={c.id}
            change={c}
            accepted={acceptedIds.has(c.id)}
            onToggle={() => onToggle(c.id)}
            isStrict={isStrict}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

function ChangeRow({
  change,
  accepted,
  onToggle,
  isStrict,
  index,
}: {
  change: Change;
  accepted: boolean;
  onToggle: () => void;
  isStrict: boolean;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className={[
        "rounded-xl border-l-4 bg-surface border border-border p-5 transition-colors",
        accepted ? "border-l-success" : "border-l-border-strong",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <ImpactBadge impact={change.impact} />
          <span className="text-xs font-mono text-muted bg-bg border border-border px-2 py-0.5 rounded-lg">
            {change.type.replace(/_/g, " ")}
          </span>
        </div>
        {isStrict && (
          <button
            onClick={onToggle}
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all",
              accepted
                ? "border-success bg-success-light text-success"
                : "border-border text-muted hover:border-border-strong hover:text-ink",
            ].join(" ")}
          >
            {accepted && <Check className="w-3 h-3" strokeWidth={2.5} />}
            {accepted ? "Accepted" : "Accept"}
          </button>
        )}
      </div>

      {/* Rationale */}
      <p className="text-sm text-muted italic mb-4 leading-relaxed">{change.rationale}</p>

      {/* Diff */}
      {change.before_list && change.after_list ? (
        <div className="grid md:grid-cols-2 gap-3">
          <ListBox title="Before" items={change.before_list} variant="before" />
          <ListBox title="After" items={change.after_list} variant="after" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          <TextBox title="Before" text={change.before} variant="before" />
          <TextBox title="After" text={change.after} variant="after" />
        </div>
      )}
    </motion.article>
  );
}

function TextBox({
  title,
  text,
  variant,
}: {
  title: string;
  text: string | null;
  variant: "before" | "after";
}) {
  const isAfter = variant === "after";
  return (
    <div>
      <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">{title}</p>
      <div
        className={[
          "p-3.5 text-sm leading-relaxed rounded-xl border",
          isAfter
            ? "bg-success-light border-success-border text-ink"
            : "bg-bg border-border text-muted line-through decoration-muted/40",
        ].join(" ")}
      >
        {text ?? <span className="italic text-muted-light">(empty)</span>}
      </div>
    </div>
  );
}

function ListBox({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "before" | "after";
}) {
  const isAfter = variant === "after";
  return (
    <div>
      <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">{title}</p>
      <ol
        className={[
          "p-3.5 text-sm rounded-xl border space-y-2",
          isAfter
            ? "bg-success-light border-success-border text-ink"
            : "bg-bg border-border text-muted",
        ].join(" ")}
      >
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 leading-relaxed">
            <span className="font-mono text-[10px] text-muted-light mt-0.5 flex-shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ImpactBadge({ impact }: { impact: ChangeImpact }) {
  const cfg = {
    high: "bg-error-light text-error border-error-border",
    medium: "bg-warning-light text-warning border-warning-border",
    low: "bg-bg text-muted border-border",
  }[impact];
  return (
    <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${cfg}`}>
      {impact}
    </span>
  );
}
