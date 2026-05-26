"use client";

import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Linkedin, Globe,
  Briefcase, GraduationCap, Code2, Award, FolderOpen,
  Copy, Download, RotateCcw, Check, AlertTriangle, ExternalLink,
} from "lucide-react";
import { useState } from "react";
import type { ParsedResume } from "@/lib/types";
import { CoverLetterPanel } from "./CoverLetterPanel";
import { MatchPanel } from "./MatchPanel";
import { TailorPanel } from "./TailorPanel";

interface ResultsProps {
  data: ParsedResume;
  onReset: () => void;
}

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Results({ data, onReset }: ResultsProps) {
  const [copied, setCopied] = useState(false);

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${data.request_id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const skillCount =
    data.skills.technical.length + data.skills.tools.length +
    data.skills.soft.length + data.skills.languages.length;

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

      {/* ── Action bar ── */}
      <motion.div variants={fadeUp} className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-success-light rounded-xl flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-success" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold text-ink text-base">Parse Complete</p>
              <p className="text-sm text-muted font-mono mt-0.5">
                ID {data.request_id.slice(0, 8)} · {data.raw_text_length.toLocaleString()} chars extracted
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyJson} className="btn-secondary text-sm">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button onClick={downloadJson} className="btn-secondary text-sm">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button onClick={onReset} className="btn-primary text-sm">
              <RotateCcw className="w-4 h-4" />
              Parse another
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Personal info ── */}
      <motion.div variants={fadeUp} className="card p-8">
        {data.personal.full_name && (
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-ink leading-tight tracking-tight mb-6">
            {data.personal.full_name}
          </h1>
        )}
        <div className="flex flex-wrap gap-3">
          {data.personal.email && (
            <ContactChip icon={Mail} text={data.personal.email} href={`mailto:${data.personal.email}`} />
          )}
          {data.personal.phone && <ContactChip icon={Phone} text={data.personal.phone} />}
          {data.personal.location && <ContactChip icon={MapPin} text={data.personal.location} />}
          {data.personal.linkedin_url && (
            <ContactChip icon={Linkedin} text="LinkedIn" href={data.personal.linkedin_url} />
          )}
          {data.personal.github_url && (
            <ContactChip
              icon={() => (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.72-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.05.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              text="GitHub"
              href={data.personal.github_url}
            />
          )}
          {data.personal.portfolio_url && (
            <ContactChip icon={Globe} text="Portfolio" href={data.personal.portfolio_url} />
          )}
        </div>
      </motion.div>

      {/* ── Summary ── */}
      {data.summary && (
        <motion.div variants={fadeUp} className="card p-8">
          <SectionHeader label="Summary" num="01" />
          <p className="text-ink text-lg leading-relaxed max-w-3xl">{data.summary}</p>
        </motion.div>
      )}

      {/* ── Skills ── */}
      {skillCount > 0 && (
        <motion.div variants={fadeUp} className="card p-8">
          <SectionHeader label="Skills" num="02" icon={Code2} />
          <div className="grid sm:grid-cols-2 gap-8">
            {data.skills.technical.length > 0 && (
              <SkillGroup title="Technical" items={data.skills.technical} variant="blue" />
            )}
            {data.skills.tools.length > 0 && (
              <SkillGroup title="Tools & Frameworks" items={data.skills.tools} variant="violet" />
            )}
            {data.skills.soft.length > 0 && (
              <SkillGroup title="Soft Skills" items={data.skills.soft} variant="neutral" />
            )}
            {data.skills.languages.length > 0 && (
              <SkillGroup title="Languages" items={data.skills.languages} variant="green" />
            )}
          </div>
        </motion.div>
      )}

      {/* ── Experience ── */}
      {data.experience.length > 0 && (
        <motion.div variants={fadeUp} className="card p-8">
          <SectionHeader label="Experience" num="03" icon={Briefcase} />
          <div className="space-y-8">
            {data.experience.map((exp, i) => (
              <article
                key={i}
                className={i < data.experience.length - 1 ? "pb-8 border-b border-border" : ""}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-ink">{exp.title}</h3>
                    <p className="text-primary font-semibold text-base mt-0.5">{exp.company}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-ink">
                      {exp.start_date ?? "—"} — {exp.is_current ? "Present" : (exp.end_date ?? "—")}
                    </p>
                    {exp.location && (
                      <p className="text-sm text-muted mt-0.5">{exp.location}</p>
                    )}
                  </div>
                </div>

                {exp.responsibilities.length > 0 && (
                  <ul className="space-y-2.5 mt-4">
                    {exp.responsibilities.map((r, j) => (
                      <li key={j} className="flex gap-3 items-start text-base text-ink leading-relaxed">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2.5 block" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {exp.technologies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {exp.technologies.map((t) => (
                      <span
                        key={t}
                        className="text-sm font-mono text-muted bg-bg border border-border px-2.5 py-0.5 rounded-lg"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Education ── */}
      {data.education.length > 0 && (
        <motion.div variants={fadeUp} className="card p-8">
          <SectionHeader label="Education" num="04" icon={GraduationCap} />
          <div className="space-y-6">
            {data.education.map((edu, i) => (
              <article
                key={i}
                className={
                  i < data.education.length - 1
                    ? "pb-6 border-b border-border flex flex-wrap items-start justify-between gap-4"
                    : "flex flex-wrap items-start justify-between gap-4"
                }
              >
                <div>
                  <h3 className="text-xl font-bold text-ink">
                    {edu.degree ?? "Degree"}
                    {edu.field_of_study && (
                      <span className="font-normal text-muted">, {edu.field_of_study}</span>
                    )}
                  </h3>
                  <p className="text-primary font-semibold text-base mt-0.5">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="text-sm text-muted mt-1 font-mono">GPA: {edu.gpa}</p>
                  )}
                </div>
                <div className="text-sm font-semibold text-ink flex-shrink-0">
                  {edu.start_date ?? "—"} — {edu.end_date ?? "—"}
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Projects ── */}
      {data.projects.length > 0 && (
        <motion.div variants={fadeUp} className="card p-8">
          <SectionHeader label="Projects" num="05" icon={FolderOpen} />
          <div className="grid sm:grid-cols-2 gap-5">
            {data.projects.map((proj, i) => (
              <article
                key={i}
                className="bg-bg border border-border rounded-xl p-5 hover:border-primary-border hover:bg-primary-light/30 transition-colors"
              >
                <h3 className="text-base font-bold text-ink mb-2">
                  {proj.url ? (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      {proj.name}
                      <ExternalLink className="w-3.5 h-3.5 text-muted" />
                    </a>
                  ) : (
                    proj.name
                  )}
                </h3>
                {proj.description && (
                  <p className="text-muted text-sm leading-relaxed mb-3">{proj.description}</p>
                )}
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono text-muted bg-surface border border-border px-2 py-0.5 rounded-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Certifications ── */}
      {data.certifications.length > 0 && (
        <motion.div variants={fadeUp} className="card p-8">
          <SectionHeader label="Certifications" num="06" icon={Award} />
          <div className="divide-y divide-border">
            {data.certifications.map((cert, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-semibold text-ink text-base">{cert.name}</p>
                  {cert.issuer && <p className="text-sm text-muted mt-0.5">{cert.issuer}</p>}
                </div>
                {cert.date_obtained && (
                  <span className="text-sm font-mono text-muted bg-bg border border-border px-3 py-1 rounded-lg flex-shrink-0">
                    {cert.date_obtained}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Parser warnings ── */}
      {data.extraction_warnings.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="bg-warning-light border border-warning-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="font-semibold text-warning text-base">Parser Notes</p>
          </div>
          <ul className="space-y-1.5">
            {data.extraction_warnings.map((w, i) => (
              <li key={i} className="text-sm text-muted">• {w}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* ── AI Modules ── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4 mt-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-light uppercase tracking-widest px-3">
            AI Modules
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="space-y-4">
          <MatchPanel resume={data} />
          <TailorPanel resume={data} />
          <CoverLetterPanel resume={data} matchResult={null} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Helpers ──

function ContactChip({
  icon: Icon,
  text,
  href,
}: {
  icon: React.ElementType;
  text: string;
  href?: string;
}) {
  const inner = (
    <span className="inline-flex items-center gap-2 bg-bg border border-border px-3.5 py-2 rounded-xl text-sm font-medium text-ink hover:border-primary-border hover:text-primary transition-colors">
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
      {text}
    </span>
  );
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  return inner;
}

function SectionHeader({
  num,
  label,
  icon: Icon,
}: {
  num: string;
  label: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
      {Icon && (
        <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
      )}
      <h2 className="text-2xl font-bold text-ink">{label}</h2>
      <span className="ml-auto font-mono text-xs text-muted-light">{num}</span>
    </div>
  );
}

const SKILL_STYLES = {
  blue: "bg-primary-light text-primary border-primary-border",
  violet: "bg-violet-light text-violet border-violet-border",
  green: "bg-success-light text-success border-success-border",
  neutral: "bg-bg text-ink border-border",
};

function SkillGroup({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: keyof typeof SKILL_STYLES;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <span
            key={s}
            className={`text-sm font-medium px-3 py-1 rounded-full border ${SKILL_STYLES[variant]}`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
