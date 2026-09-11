import { Play, Search, Loader2 } from "lucide-react";

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
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-950 p-4 border-b border-zinc-800 shrink-0">
      <div className="flex items-center gap-2 mr-auto">
        <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Review Depth</span>
        <div className="flex items-center bg-zinc-900 rounded-md p-1 border border-zinc-800">
          <button
            onClick={() => setReviewDepth("quick")}
            disabled={isReviewing}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              reviewDepth === "quick"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Quick Scan
          </button>
          <button
            onClick={() => setReviewDepth("deep")}
            disabled={isReviewing}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              reviewDepth === "deep"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Deep Review
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRunCode}
          disabled={isRunning || isReviewing}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded-md transition-colors disabled:opacity-50 border border-zinc-700"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Code
        </button>
        
        <button
          onClick={onReviewCode}
          disabled={isRunning || isReviewing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-colors shadow-sm shadow-indigo-900/20 disabled:opacity-50"
        >
          {isReviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Review Code
        </button>
      </div>
    </div>
  );
}
