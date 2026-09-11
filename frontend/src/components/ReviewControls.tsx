"use client";

import { Play, Sparkles, Loader2 } from "lucide-react";

interface ReviewControlsProps {
  onRunCode: () => void;
  onReviewCode: () => void;
  reviewDepth: "quick" | "deep";
  setReviewDepth: (depth: "quick" | "deep") => void;
  isRunning: boolean;
  isReviewing: boolean;
}

export function ReviewControls({
  onRunCode,
  onReviewCode,
  reviewDepth,
  setReviewDepth,
  isRunning,
  isReviewing,
}: ReviewControlsProps) {
  const busy = isRunning || isReviewing;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Depth selector */}
      <div
        className="flex items-center bg-zinc-900 rounded p-0.5 border border-zinc-800"
        role="group"
        aria-label="Review depth"
      >
        <button
          id="depth-quick"
          onClick={() => setReviewDepth("quick")}
          disabled={busy}
          aria-pressed={reviewDepth === "quick"}
          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            reviewDepth === "quick"
              ? "bg-zinc-700 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200"
          } disabled:opacity-50`}
        >
          Quick
        </button>
        <button
          id="depth-deep"
          onClick={() => setReviewDepth("deep")}
          disabled={busy}
          aria-pressed={reviewDepth === "deep"}
          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            reviewDepth === "deep"
              ? "bg-zinc-700 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200"
          } disabled:opacity-50`}
        >
          Deep
        </button>
      </div>

      {/* Run Code */}
      <button
        id="btn-run-code"
        onClick={onRunCode}
        disabled={busy}
        aria-label="Run code against test cases"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded border border-zinc-700 transition-colors disabled:opacity-50"
      >
        {isRunning ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
        Run
      </button>

      {/* Review Code */}
      <button
        id="btn-review-code"
        onClick={onReviewCode}
        disabled={busy}
        aria-label="Submit code for AI review"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded transition-colors shadow-sm shadow-indigo-900/30 disabled:opacity-50"
      >
        {isReviewing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        Review
      </button>
    </div>
  );
}
