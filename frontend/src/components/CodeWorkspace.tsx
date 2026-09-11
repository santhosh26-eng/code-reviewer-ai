"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { LanguageSelector } from "./LanguageSelector";
import { ReviewControls } from "./ReviewControls";
import { CodeEditor } from "./CodeEditor";
import { TestResults } from "./TestResults";
import { ReviewResults } from "./ReviewResults";
import { CodeComparison } from "./CodeComparison";
import { TerminalSquare, Sparkles, GitCompare, ChevronDown, ChevronUp, Plus, Trash2, ListChecks } from "lucide-react";

import { executeCode, submitCodeReview } from "@/lib/api";
import { ExecutionResult, TestCase } from "@/types/execution";
import { ReviewResponse } from "@/types/review";

interface CodeWorkspaceProps {
  currentCode: string;
  setCurrentCode: (code: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

type ResultTab = "testcases" | "execution" | "review" | "refactor";

const DEFAULT_TEST_CASES: TestCase[] = [
  { id: "1", input: "nums=[2,7,11,15], target=9", expectedOutput: "[0,1]", status: "idle" },
  { id: "2", input: "nums=[3,2,4], target=6", expectedOutput: "[1,2]", status: "idle" },
];

export function CodeWorkspace({
  currentCode,
  setCurrentCode,
  selectedLanguage,
  setSelectedLanguage,
}: CodeWorkspaceProps) {
  const { getToken } = useAuth();
  
  const [reviewDepth, setReviewDepth] = useState<"quick" | "deep">("quick");
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const [testCases, setTestCases] = useState<TestCase[]>(DEFAULT_TEST_CASES);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResponse | null>(null);

  const [bottomOpen, setBottomOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>("testcases");

  const handleRunCode = async () => {
    setIsRunning(true);
    setBottomOpen(true);
    setActiveTab("execution");
    try {
      const token = await getToken();
      // Set all tests to running state
      setTestCases(tc => tc.map(t => ({ ...t, status: "running" })));
      
      const res = await executeCode(currentCode, selectedLanguage, testCases, token);
      setExecutionResult(res);
      
      // Update our testCases state to reflect the execution outcome
      if (res.testCases) {
         setTestCases(res.testCases);
      }
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
      const token = await getToken();
      const res = await submitCodeReview({ code: currentCode, depth: reviewDepth }, token);
      setReviewResult(res);
    } catch {
      setReviewResult({
        success: false,
        error: "Failed to connect to the review service.",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const addTestCase = () => {
    if (testCases.length >= 10) return;
    setTestCases([...testCases, { 
      id: crypto.randomUUID(), 
      input: "", 
      expectedOutput: "", 
      status: "idle" 
    }]);
  };

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter(t => t.id !== id));
  };

  const updateTestCase = (id: string, field: keyof TestCase, value: string) => {
    setTestCases(testCases.map(t => t.id === id ? { ...t, [field]: value, status: "idle" } : t));
  };

  const resetTestCases = () => {
    setTestCases(DEFAULT_TEST_CASES);
    setExecutionResult(null);
  };

  return (
    <div className="flex h-full flex-col min-h-0">
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

      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeEditor
          code={currentCode}
          onChange={(val) => setCurrentCode(val || "")}
          language={selectedLanguage}
        />
      </div>

      <div
        className={`shrink-0 flex flex-col border-t border-zinc-800 bg-zinc-900/30 transition-all duration-200 ${
          bottomOpen ? "h-72 lg:h-80" : "h-10"
        }`}
      >
        <div className="flex shrink-0 items-center border-b border-zinc-800 bg-zinc-900/50 h-10">
          <div className="flex items-center gap-0.5 px-2 flex-1 min-w-0 overflow-x-auto">
            <TabBtn
              id="tab-testcases"
              active={activeTab === "testcases"}
              onClick={() => { setActiveTab("testcases"); setBottomOpen(true); }}
              icon={<ListChecks className="h-3.5 w-3.5" />}
              label="Test Cases"
            />
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

          <button
            onClick={() => setBottomOpen((o) => !o)}
            className="shrink-0 flex items-center gap-1 px-3 py-1 text-zinc-500 hover:text-zinc-300 text-[11px] transition-colors"
          >
            {bottomOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>

        {bottomOpen && (
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === "testcases" && (
              <div className="h-full overflow-y-auto scrollbar-thin p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-100">Manage Test Cases</h3>
                  <div className="flex gap-2">
                     <button onClick={resetTestCases} className="text-xs px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Reset</button>
                     <button onClick={addTestCase} disabled={testCases.length >= 10} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 disabled:opacity-50">
                        <Plus className="h-3.5 w-3.5"/> Add Case
                     </button>
                  </div>
                </div>
                <div className="space-y-3 pb-6">
                   {testCases.map((tc, idx) => (
                      <div key={tc.id} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-2 relative group">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-zinc-400">Test Case {idx + 1}</span>
                            <button onClick={() => removeTestCase(tc.id)} className="text-zinc-600 hover:text-rose-400 transition-colors">
                               <Trash2 className="h-3.5 w-3.5"/>
                            </button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                               <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Input</label>
                               <input 
                                  type="text" 
                                  value={tc.input} 
                                  onChange={e => updateTestCase(tc.id, "input", e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-indigo-500"
                                  placeholder="nums=[2,7,11,15], target=9"
                               />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Expected Output</label>
                               <input 
                                  type="text" 
                                  value={tc.expectedOutput} 
                                  onChange={e => updateTestCase(tc.id, "expectedOutput", e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-indigo-500"
                                  placeholder="[0,1]"
                               />
                            </div>
                         </div>
                      </div>
                   ))}
                   {testCases.length === 0 && (
                     <div className="text-center py-6 text-zinc-500 text-sm">No test cases. Add one to run your code!</div>
                   )}
                </div>
              </div>
            )}
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
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-600">
                    <GitCompare className="h-8 w-8 text-zinc-700" />
                    <p className="text-sm text-zinc-500 text-center max-w-xs">Run an AI Review first to generate refactored code.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
