import { ReviewResponse } from "@/types/review";
import { AlertTriangle, ShieldAlert, Cpu, Type, FileCode2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function ReviewResults({ review }: { review: ReviewResponse | null }) {
  if (!review) return null;

  if (review.error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="max-w-md bg-red-950/30 border border-red-900/50 p-6 rounded-xl">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-100 mb-2">Review Failed</h3>
          <p className="text-red-400/80 text-sm">{review.error}</p>
        </div>
      </div>
    );
  }

  const handleDownloadMarkdown = () => {
    if (!review.markdown_report) return;
    const blob = new Blob([review.markdown_report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code-review-report.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">AI Code Review</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Language: <span className="text-indigo-400 font-medium">{review.language || "Unknown"}</span> • 
            Depth: <span className="text-indigo-400 font-medium ml-1 capitalize">{review.depth}</span>
          </p>
        </div>
        {review.markdown_report && (
          <button 
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded transition-colors border border-zinc-700"
          >
            <Download className="h-3.5 w-3.5" />
            Export Markdown
          </button>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* Explanation */}
        {review.explanation && (
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-200 uppercase tracking-wider">
              <FileCode2 className="h-4 w-4 text-indigo-400" /> Plain-English Explanation
            </h4>
            <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 text-sm leading-relaxed text-zinc-300 prose prose-invert max-w-none">
              <ReactMarkdown>{review.explanation}</ReactMarkdown>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bugs */}
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-200 uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Bugs Detected
            </h4>
            {review.bugs && review.bugs.length > 0 ? (
              <ul className="space-y-3">
                {review.bugs.map((bug, i) => (
                  <li key={i} className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-4 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold rounded">
                        {bug.severity || "Warning"}
                      </span>
                      {bug.line_number && (
                        <span className="text-zinc-500 text-xs font-mono">Line {bug.line_number}</span>
                      )}
                    </div>
                    <p className="text-amber-100/90">{bug.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-zinc-900/50 rounded-lg p-4 text-sm text-zinc-500 border border-zinc-800">
                No major bugs were identified.
              </div>
            )}
          </section>

          {/* Security */}
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-200 uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4 text-rose-400" /> Security Vulnerabilities
            </h4>
            {review.security_issues && review.security_issues.length > 0 ? (
              <ul className="space-y-3">
                {review.security_issues.map((issue, i) => (
                  <li key={i} className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-4 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] uppercase font-bold rounded">
                        {issue.severity || "Critical"}
                      </span>
                      {issue.line_number && (
                        <span className="text-zinc-500 text-xs font-mono">Line {issue.line_number}</span>
                      )}
                    </div>
                    <p className="text-rose-100/90">{issue.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-zinc-900/50 rounded-lg p-4 text-sm text-zinc-500 border border-zinc-800">
                No security vulnerabilities were identified.
              </div>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Complexity */}
          {review.complexity && (
            <section className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                <Cpu className="h-4 w-4 text-emerald-400" /> Complexity Analysis
              </h4>
              <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 space-y-4">
                {(review.complexity as { time?: string }).time && (
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Time Complexity</div>
                    <div className="font-mono text-emerald-400 bg-emerald-950/30 inline-block px-2 py-1 rounded text-sm">
                      {(review.complexity as { time?: string }).time}
                    </div>
                  </div>
                )}
                {(review.complexity as { space?: string }).space && (
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Space Complexity</div>
                    <div className="font-mono text-emerald-400 bg-emerald-950/30 inline-block px-2 py-1 rounded text-sm">
                      {(review.complexity as { space?: string }).space}
                    </div>
                  </div>
                )}
                {(review.complexity as { details?: string }).details && (
                  <div className="text-sm text-zinc-300 mt-2">
                    {(review.complexity as { details?: string }).details}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Readability */}
          {review.readability && (
            <section className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                <Type className="h-4 w-4 text-blue-400" /> Readability Assessment
              </h4>
              <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 space-y-4 text-sm text-zinc-300">
                <p>{(review.readability as { assessment?: string }).assessment ?? JSON.stringify(review.readability)}</p>
                {Array.isArray((review.readability as { suggestions?: string[] }).suggestions) && (
                  <ul className="list-disc pl-4 space-y-1 mt-2 text-zinc-400">
                    {((review.readability as { suggestions?: string[] }).suggestions ?? []).map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
