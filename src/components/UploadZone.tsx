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
    if (!ACCEPTED.includes(ext)) {
      return `Unsupported file. Use PDF or DOCX.`;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return `File too large. Max ${MAX_MB} MB.`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
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

  const onClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`
          relative border border-rule bg-cream
          ${isDragging ? "border-accent" : "border-rule"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-ink"}
          transition-colors duration-300
        `}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={onClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            // reset so same file can be picked again
            e.target.value = "";
          }}
          disabled={disabled}
        />

        <div className="px-10 py-16 md:py-20 text-center">
          <motion.div
            animate={{ y: isDragging ? -4 : 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center justify-center w-14 h-14 mb-7 border border-rule bg-paper"
          >
            {isDragging ? (
              <FileText className="w-6 h-6 text-accent" strokeWidth={1.5} />
            ) : (
              <Upload className="w-6 h-6 text-ink" strokeWidth={1.5} />
            )}
          </motion.div>

          <p className="font-serif text-2xl md:text-3xl text-ink mb-3 tracking-tight">
            {isDragging ? "Release to begin" : "Drop your résumé here"}
          </p>
          <p className="text-graphite text-sm">
            or{" "}
            <span className="underline decoration-rule underline-offset-4 hover:text-accent transition-colors">
              browse a file
            </span>
            {" — PDF or DOCX, up to 10 MB"}
          </p>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-2 text-sm text-accentDark"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}
