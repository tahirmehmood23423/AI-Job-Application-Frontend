"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = [".pdf", ".docx"];
const MAX_MB = 10;

export function UploadZone({ onFile, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) return "Unsupported file type. Please use PDF or DOCX.";
    if (file.size > MAX_MB * 1024 * 1024) return `File too large. Maximum size is ${MAX_MB} MB.`;
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) { setError(err); return; }
      setError(null);
      onFile(file);
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={[
          "relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer select-none",
          isDragging
            ? "border-primary bg-primary-light scale-[1.01]"
            : "border-border hover:border-primary hover:bg-primary-light/40 bg-surface",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
        style={isDragging ? { boxShadow: "0 0 0 5px rgba(37,99,235,0.12)" } : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
          disabled={disabled}
        />

        <div className="px-8 py-16 md:py-20 text-center">
          <motion.div
            animate={{ y: isDragging ? -8 : 0, scale: isDragging ? 1.08 : 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={[
              "inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-7 mx-auto",
              isDragging ? "bg-primary shadow-lg" : "bg-primary-light",
            ].join(" ")}
          >
            {isDragging
              ? <FileText className="w-9 h-9 text-white" strokeWidth={1.5} />
              : <Upload className="w-9 h-9 text-primary" strokeWidth={1.5} />
            }
          </motion.div>

          <h3 className="text-2xl font-bold text-ink mb-3">
            {isDragging ? "Release to upload" : "Drop your résumé here"}
          </h3>
          <p className="text-muted text-base mb-7">
            or{" "}
            <span className="text-primary font-semibold underline underline-offset-2">
              browse a file
            </span>{" "}
            from your computer
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[".PDF", ".DOCX"].map((ext) => (
              <span
                key={ext}
                className="inline-flex items-center gap-1.5 bg-bg border border-border text-muted text-sm font-mono px-3 py-1 rounded-full"
              >
                <FileText className="w-3.5 h-3.5" />
                {ext}
              </span>
            ))}
            <span className="text-muted-light text-sm">·</span>
            <span className="text-muted text-sm">Up to 10 MB</span>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-3 bg-error-light border border-error-border text-error px-4 py-3 rounded-xl text-sm font-medium"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}
