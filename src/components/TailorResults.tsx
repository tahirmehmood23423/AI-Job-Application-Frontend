"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X, ChevronRight, FileText, Sparkles } from "lucide-react";
import type { Change, ChangeImpact, TailorResult } from "@/lib/types";
import { ATSReport } from "./ATSReport";

interface Props {
  data: TailorResult;
}

export function TailorResults({ data }: Props) {
  // In strict mode we track which changes the user has accepted.
  // In auto mode all changes are pre-accepted.
  const isStrict = data.mode === "strict";
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(
    () => isStrict ? new Set() : new Set(data.changes.map((c) => c.id))
  );

  const toggle = (id: string) => {
    setAcceptedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const accepted = acceptedIds.size;
  const total = data.changes.length;

  // Group changes by section for readability
  const grouped = useMemo(() => {
    const groups: Record<string, Change[]> = {};
    for (const c of data.changes) {
      const key = c.section.split(".")[0];
      (groups[key] ||= []).push(c);
    }
    return groups;
  }, [data.changes]);

  const sectionOrder = ["summary", "skills", "experience", "projects"];
  const orderedSections = sectionOrder.filter((s) => grouped[s]);

  return (
    <div className="space-y-12">
      {/* Header summary */}
      <div className="pb-8 border-b border-rule">
        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-baseline">
          <div>
            <div className="font-serif text-7xl md:text-8xl leading-none tracking-tightest text-ink">
              {total}
            </div>
            <div className="mt-3 text-xs uppercase tracking-[0.2em] text-graphite">
              {total === 1 ? "change proposed" : "changes proposed"}
            </div>
          </div>
          <div className="md:pt-6">
            <p className="font-serif text-xl md:text-2xl leading-relaxed text-ink mb-3 max-w-xl">
              {data.high_impact_changes > 0
                ? `${data.high_impact_changes} high-impact, ${total - data.high_impact_changes} smaller refinements.`
                : `${total} small refinements to better fit the job.`}
            </p>
            {isStrict && (
              <p className="text-sm text-graphite">
                <span className="font-mono">{accepted}</span> of {total} accepted ·{" "}
                {accepted === total ? "all changes selected" : "click to accept individual changes"}
              </p>
            )}
            {!isStrict && (
              <p className="text-sm text-graphite italic">
                Auto-accept mode — all changes are applied. Review them below.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Source-bound warnings */}
      {data.tailored.extraction_warnings.length > data.original.extraction_warnings.length && (
        <SourceBoundWarnings
          warnings={data.tailored.extraction_warnings.slice(data.original.extraction_warnings.length)}
        />
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

      {/* No changes case */}
      {total === 0 && (
        <div className="border border-rule bg-cream px-10 py-12 text-center">
          <p className="font-serif text-xl text-ink mb-2">No changes proposed</p>
          <p className="text-sm text-graphite italic max-w-md mx-auto">
            The AI didn&apos;t see meaningful opportunities to tailor for this job.
            Your résumé may already be well-aligned, or the job description may be too vague.
          </p>
        </div>
      )}

      {/* ATS Report */}
      <div className="border-t border-rule pt-12">
        <ATSReport report={data.ats_report} />
      </div>
    </div>
  );
}

// ---------- Source-bound warnings ----------

function SourceBoundWarnings({ warnings }: { warnings: string[] }) {
  return (
    <div className="border border-accent/40 bg-cream p-6">
      <div className="flex items-baseline gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        <h3 className="font-serif text-lg text-ink">Source-bound checks caught these</h3>
      </div>
      <ul className="space-y-1 text-sm text-graphite italic">
        {warnings.map((w, i) => (
          <li key={i}>— {w}</li>
        ))}
      </ul>
      <p className="text-xs text-graphite mt-3 italic">
        The AI tried to invent content; we corrected it automatically before showing you the diff.
      </p>
    </div>
  );
}

// ---------- Change group ----------

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
      <div className="flex items-baseline justify-between mb-6 border-b border-rule pb-3">
        <h3 className="font-serif text-2xl tracking-tight text-ink">{title}</h3>
        <span className="font-mono text-xs text-graphite">
          {changes.length} {changes.length === 1 ? "change" : "changes"}
        </span>
      </div>
      <div className="space-y-6">
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

// ---------- Single change row ----------

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
  const impactColor = impactStyle(change.impact);

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className={`
        border-l-2 pl-6 py-2 transition-colors
        ${accepted ? "border-accent" : "border-rule"}
      `}
    >
      {/* Header */}
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${impactColor}`}>
            {change.impact}
          </span>
          <span className="font-mono text-[10px] text-graphite uppercase tracking-wider">
            {prettyType(change.type)}
          </span>
        </div>
        {isStrict && (
          <button
            onClick={onToggle}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1 border text-xs transition-colors
              ${accepted
                ? "border-accent text-accent hover:bg-accent/5"
                : "border-rule text-graphite hover:border-ink hover:text-ink"}
            `}
          >
            {accepted ? (
              <>
                <Check className="w-3 h-3" /> Accepted
              </>
            ) : (
              "Accept"
            )}
          </button>
        )}
      </div>

      {/* Rationale */}
      <p className="text-sm text-graphite italic mb-4">{change.rationale}</p>

      {/* Before / After */}
      <DiffBody change={change} />
    </motion.article>
  );
}

// ---------- Diff body — handles text-vs-list ----------

function DiffBody({ change }: { change: Change }) {
  if (change.before_list && change.after_list) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <ListBox title="Before" items={change.before_list} variant="before" />
        <ListBox title="After" items={change.after_list} variant="after" />
      </div>
    );
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <TextBox title="Before" text={change.before} variant="before" />
      <TextBox title="After" text={change.after} variant="after" />
    </div>
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
      <p className="text-[10px] uppercase tracking-[0.2em] text-graphite mb-2">{title}</p>
      <div
        className={`
          p-3 text-sm leading-relaxed font-serif border
          ${isAfter
            ? "bg-cream border-accent/30 text-ink"
            : "bg-paper/50 border-rule text-graphite line-through decoration-graphite/40"}
        `}
      >
        {text || <span className="italic text-rule">(empty)</span>}
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
      <p className="text-[10px] uppercase tracking-[0.2em] text-graphite mb-2">{title}</p>
      <ol
        className={`
          p-3 text-sm font-serif border space-y-1.5
          ${isAfter
            ? "bg-cream border-accent/30 text-ink"
            : "bg-paper/50 border-rule text-graphite"}
        `}
      >
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-mono text-[10px] text-rule mt-1">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------- helpers ----------

function impactStyle(impact: ChangeImpact): string {
  switch (impact) {
    case "high":
      return "text-accent border-accent";
    case "medium":
      return "text-ink border-rule";
    case "low":
      return "text-graphite border-rule opacity-70";
  }
}

function prettyType(type: string): string {
  return type.replace(/_/g, " ");
}
