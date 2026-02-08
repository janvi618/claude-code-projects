"use client";

import { useState, useRef, useCallback } from "react";

// ---------- Types ----------

interface Receipt {
  page: number;
  snippet: string;
}

interface Analysis {
  title: string;
  thesis: string;
  key_takeaways: string[];
  so_what: string[];
  now_what: string[];
  receipts: Receipt[];
}

// ---------- Component ----------

export default function Home() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setAnalysis(null);
    setFileName(file.name);
    setLoading(true);

    try {
      // --- Step 1: Extract text from PDF using pdf.js ---
      setProgress("Extracting text from PDF...");

      // Dynamic import — pdfjs-dist needs browser APIs (DOMMatrix, etc.)
      // so we can't import it at the top level (Next.js pre-renders on the server)
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const pages: { page: number; text: string }[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .filter((item) => "str" in item)
          .map((item) => ("str" in item ? (item as { str: string }).str : ""))
          .join(" ");
        pages.push({ page: i, text });
      }

      if (pages.every((p) => p.text.trim() === "")) {
        throw new Error(
          "No text found in this PDF. It may be a scanned image—try a text-based PDF."
        );
      }

      // --- Step 2: Send to API for LLM analysis ---
      setProgress("Analyzing with AI (this may take 15-30 seconds)...");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }

      const result: Analysis = await res.json();
      setAnalysis(result);
      setProgress("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setProgress("");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.type === "application/pdf") handleFile(file);
      else setError("Please drop a PDF file.");
    },
    [handleFile]
  );

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* ---------- Header ---------- */}
        <header className="mb-8 text-center no-print">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            PDF Analyzer
          </h1>
          <p className="mt-2 text-zinc-500">
            Upload a PDF and get an AI-powered executive brief in seconds.
          </p>
        </header>

        {/* ---------- Upload Area ---------- */}
        <div
          className="no-print mb-10 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white p-10 transition hover:border-zinc-400"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <svg
            className="mb-3 h-10 w-10 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
            />
          </svg>
          <p className="mb-3 text-sm text-zinc-500">
            Drag & drop a PDF here, or
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Choose PDF"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {fileName && (
            <p className="mt-3 text-xs text-zinc-400">Selected: {fileName}</p>
          )}
        </div>

        {/* ---------- Progress ---------- */}
        {loading && (
          <div className="no-print mb-8 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
            <p className="mt-2 text-sm text-zinc-500">{progress}</p>
          </div>
        )}

        {/* ---------- Error ---------- */}
        {error && (
          <div className="no-print mb-8 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ---------- Results ---------- */}
        {analysis && <AnalysisView analysis={analysis} />}
      </div>
    </div>
  );
}

// ---------- Results Component ----------

function AnalysisView({ analysis }: { analysis: Analysis }) {
  return (
    <div>
      {/* Print button */}
      <div className="no-print mb-6 flex justify-end">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print
        </button>
      </div>

      {/* Title & Thesis */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900">{analysis.title}</h2>
        <p className="mt-3 text-lg leading-relaxed text-zinc-600">
          {analysis.thesis}
        </p>
      </section>

      <hr className="mb-8 border-zinc-200" />

      {/* Key Takeaways */}
      <Section title="Key Takeaways" color="blue">
        <ul className="space-y-2">
          {analysis.key_takeaways.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {i + 1}
              </span>
              <span className="text-zinc-700">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* So What */}
      <Section title="So What?" color="amber">
        <ul className="space-y-2">
          {analysis.so_what.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
              <span className="text-zinc-700">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Now What */}
      <Section title="Now What?" color="green">
        <ul className="space-y-2">
          {analysis.now_what.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rotate-45 bg-green-500" />
              <span className="text-zinc-700">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Receipts */}
      <Section title="Receipts" color="zinc">
        <div className="space-y-3">
          {analysis.receipts.map((r, i) => (
            <blockquote
              key={i}
              className="rounded-lg border-l-4 border-zinc-300 bg-zinc-50 py-3 pl-4 pr-3"
            >
              <p className="text-sm italic text-zinc-600">
                &ldquo;{r.snippet}&rdquo;
              </p>
              <cite className="mt-1 block text-xs font-medium text-zinc-400">
                Page {r.page}
              </cite>
            </blockquote>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ---------- Section wrapper ----------

const colorMap: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50/40",
  amber: "border-amber-200 bg-amber-50/40",
  green: "border-green-200 bg-green-50/40",
  zinc: "border-zinc-200 bg-zinc-50/40",
};

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`mb-6 rounded-xl border p-5 ${colorMap[color] ?? ""}`}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h3>
      {children}
    </section>
  );
}
