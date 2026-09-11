"use client";

import { useState } from "react";
import { LanguageSelector } from "./LanguageSelector";
import { ReviewControls } from "./ReviewControls";
import { CodeEditor } from "./CodeEditor";
import { TestResults } from "./TestResults";
import { ReviewResults } from "./ReviewResults";
import { CodeComparison } from "./CodeComparison";
import { TerminalSquare, Sparkles, GitCompare, ChevronDown, ChevronUp } from "lucide-react";

import { executeCode, submitCodeReview } from "@/lib/api";
import { ExecutionResult } from "@/types/execution";
import { ReviewResponse } from "@/types/review";

interface CodeWorkspaceProps {
  currentCode: string;
  setCurrentCode: (code: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

type ResultTab = "execution" | "review" | "refactor";

export function CodeWorkspace({
  currentCode,
  setCurrentCode,
  selectedLanguage,
  setSelectedLanguage,
}: CodeWorkspaceProps) {
  const [reviewDepth, setReviewDepth] = useState<"quick" | "deep">("quick");
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResponse | null>(null);

  // Bottom panel: collapsed or expanded, and which tab
  const [bottomOpen, setBottomOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>("execution");

  const handleRunCode = async () => {
    setIsRunning(true);
    setBottomOpen(true);
    setActiveTab("execution");
    try {
      const mockTestCases = [
        { id: "1", input: "nums=[2,7,11,15], target=9", expectedOutput: "[0,1]", status: "idle" as const },
        { id: "2", input: "nums=[3,2,4], target=6",     expectedOutput: "[1,2]", status: "idle" as const },
        { id: "3", input: "nums=[3,3], target=6",        expectedOutput: "[0,1]", status: "idle" as const },
      ];
      const res = await executeCode(currentCode, selectedLanguage, mockTestCases);
      setExecutionResult(res);
    } catch {
      setExecutionResult({
        success: false,
        testCases: [],
        error: "Failed to connect to the execution service.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReviewCode = async () => {
    setIsReviewing(true);
    setBottomOpen(true);
    setActiveTab("review");
    try {
      const res = await submitCodeReview({ code: currentCode, depth: reviewDepth }, null);
      setReviewResult(res);
      // Auto-switch to refactor tab if refactored code came back
      if (res.refactored_code) {
        // stay on review tab — user can click Refactor themselves
      }
    } catch {
      setReviewResult({
        success: false,
        error: "Failed to connect to the review service.",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const hasResults = executionResult !== null || reviewResult !== null;

  return (
    <div className="flex h-full flex-col min-h-0">

      {/* ── Workspace toolbar ──────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900/40 px-4 py-2">
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />
        <ReviewControls
          onRunCode={handleRunCode}
          onReviewCode={handleReviewCode}
          reviewDepth={reviewDepth}
          setReviewDepth={setReviewDepth}
          isRunning={isRunning}
          isReviewing={isReviewing}
        />
      </div>

      {/* ── Code Editor (fills remaining space) ───────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeEditor
          code={currentCode}
          onChange={(val) => setCurrentCode(val || "")}
          language={selectedLanguage}
        />
      </div>

      {/* ── Results panel (collapsible bottom drawer) ─────────── */}
      <div
        className={`shrink-0 flex flex-col border-t border-zinc-800 bg-zinc-900/30 transition-all duration-200 ${
          bottomOpen ? "h-72 lg:h-80" : "h-10"
        }`}
      >
        {/* Results panel header / tab bar */}
        <div className="flex shrink-0 items-center border-b border-zinc-800 bg-zinc-900/50 h-10">
          {/* Tab buttons */}
          <div className="flex items-center gap-0.5 px-2 flex-1 min-w-0 overflow-x-auto">
            <TabBtn
              id="tab-execution"
              active={activeTab === "execution"}
              onClick={() => { setActiveTab("execution"); setBottomOpen(true); }}
              icon={<TerminalSquare className="h-3.5 w-3.5" />}
              label="Execution"
              badge={executionResult ? (executionResult.success ? "✓" : "✗") : undefined}
              badgeColor={executionResult?.success ? "bg-emerald-500" : "bg-rose-500"}
            />
            <TabBtn
              id="tab-review"
              active={activeTab === "review"}
              onClick={() => { setActiveTab("review"); setBottomOpen(true); }}
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="AI Review"
              badge={reviewResult?.success ? "✓" : undefined}
              badgeColor="bg-indigo-500"
            />
            <TabBtn
              id="tab-refactor"
              active={activeTab === "refactor"}
              onClick={() => { setActiveTab("refactor"); setBottomOpen(true); }}
              icon={<GitCompare className="h-3.5 w-3.5" />}
              label="Refactored"
              disabled={!reviewResult?.refactored_code}
            />
          </div>

          {/* Collapse / expand toggle */}
          <button
            onClick={() => setBottomOpen((o) => !o)}
            className="shrink-0 flex items-center gap-1 px-3 py-1 text-zinc-500 hover:text-zinc-300 text-[11px] transition-colors"
            aria-label={bottomOpen ? "Collapse results panel" : "Expand results panel"}
            aria-expanded={bottomOpen}
          >
            {hasResults && !bottomOpen && (
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse mr-1" />
            )}
            {bottomOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Tab content */}
        {bottomOpen && (
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === "execution" && (
              <div className="h-full overflow-y-auto scrollbar-thin">
                <TestResults result={executionResult} />
              </div>
            )}
            {activeTab === "review" && (
              <div className="h-full overflow-y-auto scrollbar-thin">
                <ReviewResults review={reviewResult} />
              </div>
            )}
            {activeTab === "refactor" && (
              <div className="h-full overflow-hidden">
                {reviewResult?.refactored_code ? (
                  <CodeComparison
                    originalCode={currentCode}
                    refactoredCode={reviewResult.refactored_code}
                    language={selectedLanguage}
                  />
                ) : (
                  <EmptyState
                    icon={<GitCompare className="h-8 w-8" />}
                    message="Run an AI Review first to generate refactored code."
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function TabBtn({
  id,
  active,
  onClick,
  icon,
  label,
  badge,
  badgeColor = "bg-zinc-500",
  disabled = false,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={active}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded transition-colors ${
        active
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {icon}
      {label}
      {badge && (
        <span
          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-600">
      <div className="text-zinc-700">{icon}</div>
      <p className="text-sm text-zinc-500 text-center max-w-xs">{message}</p>
    </div>
  );
}
