"use client";

import { motion } from "framer-motion";

const STAGES = [
  "Reading the document",
  "Identifying sections",
  "Extracting structured data",
  "Validating output",
];

export function LoadingState({ filename }: { filename: string }) {
  return (
    <div className="border border-rule bg-cream px-10 py-16 md:py-20 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-graphite mb-6">
        In progress
      </p>
      <p className="font-serif text-3xl md:text-4xl text-ink mb-2 tracking-tight">
        Parsing
      </p>
      <p className="font-mono text-xs text-graphite mb-10 truncate max-w-md mx-auto">
        {filename}
      </p>

      <div className="max-w-sm mx-auto space-y-3">
        {STAGES.map((stage, i) => (
          <motion.div
            key={stage}
            initial={{ opacity: 0.3, x: -4 }}
            animate={{
              opacity: [0.3, 1, 0.3],
              x: [-4, 0, -4],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
            className="text-left text-sm text-graphite flex items-center gap-3"
          >
            <span className="font-mono text-[10px] text-rule">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{stage}</span>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-graphite mt-10 italic">
        First request may take 30–60 seconds while the server wakes up.
      </p>
    </div>
  );
}
