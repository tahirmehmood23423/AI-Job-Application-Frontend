"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Copy,
  Download,
  RotateCcw,
  Check,
} from "lucide-react";
import { useState } from "react";
import type { ParsedResume } from "@/lib/types";
import { MatchPanel } from "./MatchPanel";

interface ResultsProps {
  data: ParsedResume;
  onReset: () => void;
}

export function Results({ data, onReset }: ResultsProps) {
  const [copied, setCopied] = useState(false);

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${data.request_id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.07 } },
  };
  const item = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const skillCount =
    data.skills.technical.length +
    data.skills.tools.length +
    data.skills.soft.length +
    data.skills.languages.length;

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-16"
    >
      {/* Action bar */}
      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-rule"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-graphite mb-1">
            Parse Complete
          </p>
          <p className="font-mono text-[11px] text-graphite">
            ID {data.request_id.slice(0, 8)} ·{" "}
            {data.raw_text_length.toLocaleString()} chars
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyJson}
            className="inline-flex items-center gap-2 px-4 py-2 border border-rule bg-cream hover:bg-paper text-sm transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-accent" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied" : "Copy JSON"}
          </button>
          <button
            onClick={downloadJson}
            className="inline-flex items-center gap-2 px-4 py-2 border border-rule bg-cream hover:bg-paper text-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-cream hover:bg-graphite text-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Parse another
          </button>
        </div>
      </motion.div>

      {/* Masthead / Personal */}
      <motion.section variants={item}>
        {data.personal.full_name && (
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-ink tracking-tightest leading-[0.9] mb-8">
            {data.personal.full_name}
          </h1>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-graphite">
          {data.personal.email && (
            <ContactItem icon={Mail} text={data.personal.email} href={`mailto:${data.personal.email}`} />
          )}
          {data.personal.phone && (
            <ContactItem icon={Phone} text={data.personal.phone} />
          )}
          {data.personal.location && (
            <ContactItem icon={MapPin} text={data.personal.location} />
          )}
          {data.personal.linkedin_url && (
            <ContactItem icon={Linkedin} text="LinkedIn" href={data.personal.linkedin_url} />
          )}
          {data.personal.github_url && (
            <ContactItem icon={Github} text="GitHub" href={data.personal.github_url} />
          )}
          {data.personal.portfolio_url && (
            <ContactItem icon={Globe} text="Portfolio" href={data.personal.portfolio_url} />
          )}
        </div>
      </motion.section>

      {/* Summary */}
      {data.summary && (
        <motion.section variants={item}>
          <SectionLabel num="01" label="Summary" />
          <p className="drop-cap font-serif text-xl md:text-2xl leading-relaxed text-ink max-w-3xl">
            {data.summary}
          </p>
        </motion.section>
      )}

      {/* Skills */}
      {skillCount > 0 && (
        <motion.section variants={item}>
          <SectionLabel num="02" label="Skills" icon={Code2} />
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {data.skills.technical.length > 0 && (
              <SkillGroup title="Technical" items={data.skills.technical} />
            )}
            {data.skills.tools.length > 0 && (
              <SkillGroup title="Tools" items={data.skills.tools} />
            )}
            {data.skills.soft.length > 0 && (
              <SkillGroup title="Soft" items={data.skills.soft} />
            )}
            {data.skills.languages.length > 0 && (
              <SkillGroup title="Languages" items={data.skills.languages} />
            )}
          </div>
        </motion.section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <motion.section variants={item}>
          <SectionLabel num="03" label="Experience" icon={Briefcase} />
          <div className="space-y-12">
            {data.experience.map((exp, i) => (
              <article key={i} className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-12">
                <div className="font-mono text-xs text-graphite uppercase tracking-wider">
                  <div>{formatDate(exp.start_date)}</div>
                  <div>— {exp.is_current ? "Present" : formatDate(exp.end_date)}</div>
                  {exp.location && (
                    <div className="mt-2 text-rule normal-case tracking-normal font-sans">
                      {exp.location}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl text-ink tracking-tight mb-1">
                    {exp.title}
                  </h3>
                  <p className="text-sm text-accent mb-4 italic">{exp.company}</p>
                  {exp.responsibilities.length > 0 && (
                    <ul className="space-y-2 text-ink text-[15px] leading-relaxed max-w-2xl">
                      {exp.responsibilities.map((r, j) => (
                        <li key={j} className="flex gap-3">
                          <span className="text-rule flex-shrink-0 mt-2">—</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {exp.technologies.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-mono text-graphite border border-rule px-2 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </motion.section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <motion.section variants={item}>
          <SectionLabel num="04" label="Education" icon={GraduationCap} />
          <div className="space-y-8">
            {data.education.map((edu, i) => (
              <article key={i} className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-12">
                <div className="font-mono text-xs text-graphite uppercase tracking-wider">
                  <div>{formatDate(edu.start_date)}</div>
                  <div>— {formatDate(edu.end_date)}</div>
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-ink tracking-tight mb-1">
                    {edu.degree || "Degree"}
                    {edu.field_of_study && (
                      <span className="text-graphite">, {edu.field_of_study}</span>
                    )}
                  </h3>
                  <p className="text-sm text-accent italic">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="text-xs text-graphite mt-2 font-mono">GPA · {edu.gpa}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </motion.section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <motion.section variants={item}>
          <SectionLabel num="05" label="Projects" />
          <div className="grid md:grid-cols-2 gap-8">
            {data.projects.map((proj, i) => (
              <article key={i} className="border-t border-rule pt-5">
                <h3 className="font-serif text-xl text-ink tracking-tight mb-2">
                  {proj.url ? (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent transition-colors"
                    >
                      {proj.name}
                    </a>
                  ) : (
                    proj.name
                  )}
                </h3>
                {proj.description && (
                  <p className="text-sm text-graphite leading-relaxed mb-3">
                    {proj.description}
                  </p>
                )}
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-mono text-graphite border border-rule px-2 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </motion.section>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <motion.section variants={item}>
          <SectionLabel num="06" label="Certifications" icon={Award} />
          <ul className="space-y-3">
            {data.certifications.map((cert, i) => (
              <li key={i} className="flex justify-between items-baseline gap-4 border-b border-rule pb-3">
                <div>
                  <span className="font-serif text-lg text-ink">{cert.name}</span>
                  {cert.issuer && (
                    <span className="text-sm text-graphite italic"> · {cert.issuer}</span>
                  )}
                </div>
                {cert.date_obtained && (
                  <span className="font-mono text-xs text-graphite">{cert.date_obtained}</span>
                )}
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* Warnings */}
      {data.extraction_warnings.length > 0 && (
        <motion.section variants={item} className="border-t border-rule pt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-accentDark mb-3">
            Notes from the parser
          </p>
          <ul className="space-y-1 text-sm text-graphite italic">
            {data.extraction_warnings.map((w, i) => (
              <li key={i}>— {w}</li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* ============================================ */}
      {/* MODULE 2 — MATCH AGAINST A JOB DESCRIPTION   */}
      {/* ============================================ */}
      <motion.div variants={item}>
        <MatchPanel resume={data} />
      </motion.div>
    </motion.div>
  );
}

// ---------- Small helper components ----------

function ContactItem({
  icon: Icon,
  text,
  href,
}: {
  icon: React.ElementType;
  text: string;
  href?: string;
}) {
  const inner = (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
      <span>{text}</span>
    </span>
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

function SectionLabel({
  num,
  label,
  icon: Icon,
}: {
  num: string;
  label: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-baseline gap-4 mb-8 border-b border-rule pb-4">
      <span className="font-mono text-xs text-graphite">{num}</span>
      <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-ink">
        {label}
      </h2>
      {Icon && <Icon className="w-4 h-4 text-rule ml-auto" strokeWidth={1.5} />}
    </div>
  );
}

function SkillGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-graphite mb-3">{title}</p>
      <div className="flex flex-wrap gap-x-2 gap-y-1">
        {items.map((s, i) => (
          <span key={s} className="text-ink">
            {s}
            {i < items.length - 1 && <span className="text-rule ml-2">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return d;
}
