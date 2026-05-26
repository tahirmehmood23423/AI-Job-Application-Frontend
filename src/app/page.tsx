"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, FileText, Zap, AlertTriangle } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { LoadingState } from "@/components/LoadingState";
import { Results } from "@/components/Results";
import { parseResume, ApiError } from "@/lib/api";
import type { ParsedResume } from "@/lib/types";

type Stage =
  | { kind: "idle" }
  | { kind: "loading"; filename: string }
  | { kind: "results"; data: ParsedResume }
  | { kind: "error"; message: string; filename: string };

export default function Home() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });

  const handleFile = async (file: File) => {
    setStage({ kind: "loading", filename: file.name });
    try {
      const data = await parseResume(file);
      setStage({ kind: "results", data });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.";
      setStage({ kind: "error", message: msg, filename: file.name });
    }
  };

  const reset = () => setStage({ kind: "idle" });

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Navigation ── */}
      <nav className="bg-navy sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-base">ResumeAI</span>
            <span className="hidden sm:inline text-white/30 text-xs font-mono border border-white/20 px-2 py-0.5 rounded-full ml-1">
              Module 01
            </span>
          </div>
          <a
            href="https://github.com/tahirmehmood23423/AI-Job-Application-Tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.72-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.05.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
            <span className="hidden sm:inline">View Source</span>
          </a>
        </div>
      </nav>

      {/* ── Hero (hidden in results view) ── */}
      {stage.kind !== "results" && (
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)" }}>
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-200 text-sm font-medium">AI-Powered Resume Parser</span>
              </div>

              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-[1.05] tracking-tight mb-6">
                Turn résumés into
                <span className="block text-blue-400">structured data</span>
              </h1>

              <p className="text-white/65 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
                Upload a PDF or DOCX résumé and receive clean, structured JSON in seconds.
                Extract contact info, skills, experience, education, and more — powered by Gemini AI.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {["FastAPI", "Google Gemini", "pdfplumber", "Next.js"].map((tech) => (
                  <span
                    key={tech}
                    className="bg-white/10 border border-white/20 text-white/70 px-3 py-1 rounded-full text-xs font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {stage.kind === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              <UploadZone onFile={handleFile} />

              <div className="mt-14 grid md:grid-cols-3 gap-6">
                <FeatureCard
                  icon={FileText}
                  num="01"
                  title="Upload"
                  body="Drag and drop a PDF or DOCX résumé, or click to browse. Files up to 10 MB supported."
                />
                <FeatureCard
                  icon={Sparkles}
                  num="02"
                  title="Parse"
                  body="Gemini AI reads every section, extracts all fields, and validates the structured output."
                />
                <FeatureCard
                  icon={Zap}
                  num="03"
                  title="Use"
                  body="Copy the JSON, download it, or run it through the Match, Tailor, and Cover Letter modules."
                />
              </div>
            </motion.div>
          )}

          {stage.kind === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <LoadingState filename={stage.filename} />
            </motion.div>
          )}

          {stage.kind === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="card p-10 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 bg-error-light rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-error" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">Something went wrong</h3>
                <p className="text-muted text-base mb-2 leading-relaxed">{stage.message}</p>
                <p className="text-sm font-mono text-muted-light mb-8 truncate">{stage.filename}</p>
                <button onClick={reset} className="btn-primary mx-auto">
                  Try again
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {stage.kind === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Results data={stage.data} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-4 text-sm text-muted">
          <span>Built by Tahir Mehmood · 2026</span>
          <span className="font-mono text-xs">Module 01 / 10</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  num,
  title,
  body,
}: {
  icon: React.ElementType;
  num: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card card-hover p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="font-mono text-xs text-muted-light">{num}</span>
      </div>
      <h3 className="font-bold text-ink text-lg mb-2">{title}</h3>
      <p className="text-muted text-base leading-relaxed">{body}</p>
    </div>
  );
}
