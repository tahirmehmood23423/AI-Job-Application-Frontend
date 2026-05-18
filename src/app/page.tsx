"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
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
    <main className="relative min-h-screen px-6 md:px-12 py-10 md:py-16 max-w-6xl mx-auto">
      {/* Top bar */}
      <header className="flex items-center justify-between mb-20 md:mb-28">
        <div className="rise" style={{ animationDelay: "0.05s" }}>
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-graphite">
            An AI Field Study
          </p>
          <p className="text-[11px] font-mono text-graphite mt-0.5">
            № 01 · The Résumé Parser
          </p>
        </div>
        <a
          href="https://github.com/tahirmehmood23423/AI-Job-Application-Tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-graphite hover:text-ink transition-colors rise"
          style={{ animationDelay: "0.1s" }}
        >
          <Github className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Source</span>
        </a>
      </header>

      {/* Hero — only show when idle or loading */}
      {stage.kind !== "results" && (
        <section className="mb-16 md:mb-24">
          <h1
            className="font-serif text-6xl md:text-8xl lg:text-9xl text-ink leading-[0.88] tracking-tightest mb-8 rise"
            style={{ animationDelay: "0.15s" }}
          >
            Résumés,
            <br />
            <span className="italic text-accent">structured.</span>
          </h1>
          <div
            className="max-w-2xl rise"
            style={{ animationDelay: "0.3s" }}
          >
            <p className="text-lg md:text-xl text-graphite leading-relaxed">
              Upload a PDF or DOCX résumé. In a few seconds, the parser returns
              clean, structured data — name, contact, skills, every job, every
              project — ready for downstream use. Built as Module 01 of an AI
              job-application toolkit.
            </p>
          </div>

          {/* Tech credits in fine print */}
          <div
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-mono uppercase tracking-wider text-graphite rise"
            style={{ animationDelay: "0.45s" }}
          >
            <span>FastAPI</span>
            <span className="text-rule">/</span>
            <span>Gemini</span>
            <span className="text-rule">/</span>
            <span>pdfplumber</span>
            <span className="text-rule">/</span>
            <span>Next.js</span>
          </div>
        </section>
      )}

      {/* Stage content */}
      <AnimatePresence mode="wait">
        {stage.kind === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="rise"
            style={{ animationDelay: "0.6s" }}
          >
            <UploadZone onFile={handleFile} />

            <div className="mt-12 grid md:grid-cols-3 gap-8 text-sm">
              <Step num="01" title="Upload" body="Drag a PDF or DOCX file, or click to browse." />
              <Step num="02" title="Parse" body="The model reads sections, extracts fields, validates." />
              <Step num="03" title="Use" body="Copy JSON, download it, or feed it to the next module." />
            </div>
          </motion.div>
        )}

        {stage.kind === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LoadingState filename={stage.filename} />
          </motion.div>
        )}

        {stage.kind === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="border border-rule bg-cream px-10 py-16 text-center"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-accentDark mb-4">
              An error occurred
            </p>
            <p className="font-serif text-2xl text-ink mb-2">{stage.message}</p>
            <p className="font-mono text-xs text-graphite mb-8">{stage.filename}</p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream hover:bg-graphite text-sm transition-colors"
            >
              Try again
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {stage.kind === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Results data={stage.data} onReset={reset} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-32 pt-8 border-t border-rule">
        <div className="flex flex-wrap justify-between gap-4 text-[11px] font-mono uppercase tracking-wider text-graphite">
          <span>Built by Tahir Mehmood · 2026</span>
          <span>Module 01 / 10</span>
        </div>
      </footer>
    </main>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-mono text-xs text-graphite">{num}</span>
        <h3 className="font-serif text-xl text-ink tracking-tight">{title}</h3>
      </div>
      <p className="text-graphite text-[13px] leading-relaxed pl-8">{body}</p>
    </div>
  );
}
