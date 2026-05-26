"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const STAGES = [
  { label: "Reading the document", desc: "Extracting raw text from your file" },
  { label: "Identifying sections", desc: "Locating experience, education, skills..." },
  { label: "Extracting structured data", desc: "Parsing every field with Gemini AI" },
  { label: "Validating output", desc: "Checking completeness and quality" },
];

export function LoadingState({ filename }: { filename: string }) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="card p-10 text-center">
        <div className="w-18 h-18 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ width: 72, height: 72 }}>
          <Loader2 className="w-9 h-9 text-primary animate-spin" />
        </div>

        <h3 className="text-2xl font-bold text-ink mb-2">Parsing your résumé</h3>
        <p className="font-mono text-sm text-muted-light mb-10 truncate max-w-xs mx-auto">
          {filename}
        </p>

        <div className="space-y-5 text-left mb-10">
          {STAGES.map((stage, i) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0.25 }}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.55, ease: "easeInOut" }}
              className="flex items-start gap-4"
            >
              <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold font-mono">{i + 1}</span>
              </div>
              <div>
                <p className="text-ink text-base font-semibold leading-snug">{stage.label}</p>
                <p className="text-muted text-sm mt-0.5">{stage.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-sm text-muted-light italic">
          First request may take 30–60 s while the server wakes up.
        </p>
      </div>
    </div>
  );
}
