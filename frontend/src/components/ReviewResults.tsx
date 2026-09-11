"use client";

import { ReviewResponse } from "@/types/review";
import {
  AlertTriangle,
  ShieldAlert,
  Cpu,
  Type,
  FileCode2,
  Download,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ReviewResultsProps {
  review: ReviewResponse | null;
}

export function ReviewResults({ review }: ReviewResultsProps) {
  // ── Empty state ───────────────────────────────────────────────
  if (!review) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
          <Sparkles className="h-5 w-5 text-zinc-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-400">No review available yet.</p>
          <p className="text-xs text-zinc-600 mt-1">
            Click <span className="font-mono text-zinc-500">Review</span> to get an AI analysis.
          </p>
        </div>

        {/* Preview of sections that will appear */}
        <div className="w-full max-w-sm mt-2 space-y-1.5 text-left">
          {["Language & Overview", "Explanation", "Bugs", "Security", "Complexity", "Readability"].map((s) => (
            <div key={s} className="flex items-center gap-2 rounded px-3 py-2 bg-zinc-900/40 border border-zinc-800">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              <span className="text-xs text-zinc-600">{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (!review.success || review.error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-red-100 mb-2">Review Failed</h3>
          <p className="text-sm text-red-400/80">{review.error ?? "An unknown error occurred."}</p>
        </div>
      </div>
    );
  }

  // ── Download handler ───────────────────────────────────────────
  const handleDownload = () => {
    if (!review.markdown_report) return;
    const blob = new Blob([review.markdown_report], { type: "text/markdown" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "code-review.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Complexity & Readability are now properly typed — no casts needed
  const complexity  = review.complexity;
  const readability = review.readability;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">AI Code Review</h3>
          {(review.language || review.depth) && (
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {review.language && (
                <>Language: <span className="text-indigo-400">{review.language}</span></>
              )}
              {review.language && review.depth && <span className="mx-1.5">·</span>}
              {review.depth && (
                <>Depth: <span className="text-indigo-400 capitalize">{review.depth}</span></>
              )}
            </p>
          )}
        </div>
        {review.markdown_report && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded border border-zinc-700 transition-colors"
            aria-label="Export review as Markdown"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Explanation */}
        {review.explanation && (
          <Section icon={<FileCode2 className="h-4 w-4 text-indigo-400" />} title="Explanation">
            <div className="prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed">
              <ReactMarkdown>{review.explanation}</ReactMarkdown>
            </div>
          </Section>
        )}

        {/* Bugs + Security — side by side on wide screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bugs */}
          <Section icon={<AlertTriangle className="h-4 w-4 text-amber-400" />} title="Bugs Detected">
            {review.bugs && review.bugs.length > 0 ? (
              <ul className="space-y-2.5">
                {review.bugs.map((bug, i) => (
                  <li key={i} className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <SeverityBadge severity={bug.severity} color="amber" />
                      {bug.line_number && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Line {bug.line_number}
                        </span>
                      )}
                    </div>
                    <p className="text-amber-100/90 text-xs leading-relaxed">{bug.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyListNote text="No bugs identified." />
            )}
          </Section>

          {/* Security */}
          <Section icon={<ShieldAlert className="h-4 w-4 text-rose-400" />} title="Security">
            {review.security_issues && review.security_issues.length > 0 ? (
              <ul className="space-y-2.5">
                {review.security_issues.map((issue, i) => (
                  <li key={i} className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <SeverityBadge severity={issue.severity} color="rose" />
                      {issue.line_number && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Line {issue.line_number}
                        </span>
                      )}
                    </div>
                    <p className="text-rose-100/90 text-xs leading-relaxed">{issue.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyListNote text="No vulnerabilities identified." />
            )}
          </Section>
        </div>

        {/* Complexity + Readability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Complexity */}
          {complexity && (
            <Section icon={<Cpu className="h-4 w-4 text-emerald-400" />} title="Complexity">
              <div className="space-y-3">
          {complexity && complexity.time_complexity && (
                  <Metric label="Time" value={complexity.time_complexity} color="emerald" />
                )}
                {complexity && complexity.space_complexity && (
                  <Metric label="Space" value={complexity.space_complexity} color="emerald" />
                )}
                {complexity && complexity.explanation && (
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    {complexity.explanation}
                  </p>
                )}
              </div>
            </Section>
          )}

          {/* Readability */}
          {readability && (
            <Section icon={<Type className="h-4 w-4 text-blue-400" />} title="Readability">
              <div className="space-y-3">
                {readability.score !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-blue-400">
                      {readability.score}
                      <span className="text-sm font-normal text-zinc-500">/10</span>
                    </div>
                    <ScoreBar score={readability.score} />
                  </div>
                )}
                {readability.explanation && (
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {readability.explanation}
                  </p>
                )}
                {readability.suggestions && readability.suggestions.length > 0 && (
                  <ul className="space-y-1 mt-1">
                    {readability.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-xs text-zinc-400">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h4 className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
        {icon}
        {title}
      </h4>
      <div>{children}</div>
    </section>
  );
}

function SeverityBadge({
  severity,
  color,
}: {
  severity: string;
  color: "amber" | "rose";
}) {
  const styles = {
    amber: "bg-amber-500/20 text-amber-300",
    rose:  "bg-rose-500/20 text-rose-300",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${styles[color]}`}>
      {severity}
    </span>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: "emerald" }) {
  return (
    <div>
      <div className="text-[10px] text-zinc-500 mb-1">{label} Complexity</div>
      <div className={`font-mono text-${color}-400 bg-${color}-950/30 inline-block px-2.5 py-1 rounded text-sm border border-${color}-900/30`}>
        {value}
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(10, score)) * 10;
  const color = score >= 7 ? "bg-emerald-500" : score >= 4 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function EmptyListNote({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-500">
      {text}
    </div>
  );
}
