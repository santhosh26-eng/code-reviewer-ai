"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { LanguageSelector } from "./LanguageSelector";
import { ReviewControls } from "./ReviewControls";
import { CodeEditor } from "./CodeEditor";
import { TestResults } from "./TestResults";
import { ReviewResults } from "./ReviewResults";
import { CodeComparison } from "./CodeComparison";
import { Code2, TerminalSquare, Search, Sparkles } from "lucide-react";

import { executeCode, submitCodeReview } from "@/lib/api";
import { ExecutionResult } from "@/types/execution";
import { ReviewResponse } from "@/types/review";

interface CodeWorkspaceProps {
  currentCode: string;
  setCurrentCode: (code: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

type TabType = "editor" | "tests" | "review" | "refactor";

export function CodeWorkspace({
  currentCode,
  setCurrentCode,
  selectedLanguage,
  setSelectedLanguage
}: CodeWorkspaceProps) {
  const { getToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>("editor");
  
  const [reviewDepth, setReviewDepth] = useState<"quick" | "deep">("quick");
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResponse | null>(null);

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab("tests");
    try {
      // Mock test cases for execution
      const mockTestCases = [
        { id: "1", input: "test case 1", expectedOutput: "success", status: "idle" as const },
        { id: "2", input: "edge case", expectedOutput: "handled", status: "idle" as const }
      ];
      
      const res = await executeCode(currentCode, selectedLanguage, mockTestCases);
      setExecutionResult(res);
    } catch (error) {
      setExecutionResult({
        success: false,
        testCases: [],
        error: "Failed to connect to execution service."
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReviewCode = async () => {
    setIsReviewing(true);
    setActiveTab("review");
    try {
      const token = await getToken();
      const res = await submitCodeReview({
        code: currentCode,
        depth: reviewDepth
      }, token);
      
      setReviewResult(res);
    } catch (error) {
      setReviewResult({
        success: false,
        error: "Failed to connect to review service."
      });
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Workspace Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-6">
          <LanguageSelector 
            selectedLanguage={selectedLanguage} 
            setSelectedLanguage={setSelectedLanguage} 
          />
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-md border border-zinc-800/50">
          <TabButton 
            active={activeTab === "editor"} 
            onClick={() => setActiveTab("editor")}
            icon={<Code2 className="h-3.5 w-3.5" />}
            label="Editor"
          />
          <TabButton 
            active={activeTab === "tests"} 
            onClick={() => setActiveTab("tests")}
            icon={<TerminalSquare className="h-3.5 w-3.5" />}
            label="Execution"
            badge={executionResult?.success === false ? "!" : undefined}
            badgeColor="bg-red-500"
          />
          <TabButton 
            active={activeTab === "review"} 
            onClick={() => setActiveTab("review")}
            icon={<Search className="h-3.5 w-3.5" />}
            label="AI Review"
            badge={reviewResult?.success ? "✓" : undefined}
            badgeColor="bg-emerald-500"
          />
          <TabButton 
            active={activeTab === "refactor"} 
            onClick={() => setActiveTab("refactor")}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="Refactored"
            disabled={!reviewResult?.refactored_code}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-zinc-950 relative">
        <div className={`absolute inset-0 ${activeTab === "editor" ? "block" : "hidden"}`}>
          <CodeEditor 
            code={currentCode} 
            onChange={(val) => setCurrentCode(val || "")} 
            language={selectedLanguage}
          />
        </div>
        
        <div className={`absolute inset-0 ${activeTab === "tests" ? "block" : "hidden"}`}>
          {executionResult ? (
            <TestResults result={executionResult} />
          ) : (
            <EmptyState icon={<TerminalSquare className="h-10 w-10" />} title="No Execution Results" description="Click 'Run Code' to execute your code against the test suite." />
          )}
        </div>
        
        <div className={`absolute inset-0 ${activeTab === "review" ? "block" : "hidden"}`}>
          {reviewResult ? (
            <ReviewResults review={reviewResult} />
          ) : (
            <EmptyState icon={<Search className="h-10 w-10" />} title="No Review Data" description="Click 'Review Code' to get an AI analysis of your current code." />
          )}
        </div>
        
        <div className={`absolute inset-0 ${activeTab === "refactor" ? "block" : "hidden"}`}>
          {reviewResult?.refactored_code ? (
            <CodeComparison 
              originalCode={currentCode} 
              refactoredCode={reviewResult.refactored_code} 
              language={selectedLanguage}
            />
          ) : (
            <EmptyState icon={<Sparkles className="h-10 w-10" />} title="No Refactored Code" description="Run an AI Code Review first to generate refactored code." />
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <ReviewControls 
        onRunCode={handleRunCode}
        onReviewCode={handleReviewCode}
        reviewDepth={reviewDepth}
        setReviewDepth={setReviewDepth}
        isRunning={isRunning}
        isReviewing={isReviewing}
      />
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge, badgeColor, disabled }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: string; badgeColor?: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all ${
        active 
          ? "bg-zinc-800 text-zinc-100 shadow-sm" 
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {icon}
      {label}
      {badge && (
        <span className={`absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] text-white ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-6">
      <div className="text-zinc-600 mb-4 bg-zinc-900/50 p-4 rounded-full border border-zinc-800/50">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-300 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-sm">{description}</p>
    </div>
  );
}
