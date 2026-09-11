"use client";

import { ExecutionResult } from "@/types/execution";
import { CheckCircle2, XCircle, Circle, TerminalSquare } from "lucide-react";

interface TestResultsProps {
  result: ExecutionResult | null;
}

export function TestResults({ result }: TestResultsProps) {
  // ── Empty / not-run state ──────────────────────────────────────
  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-600 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
          <TerminalSquare className="h-5 w-5 text-zinc-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-400">No tests have been run yet.</p>
          <p className="text-xs text-zinc-600 mt-1">
            Click <span className="font-mono text-zinc-500">Run</span> to execute your code against the test suite.
          </p>
        </div>

        {/* Placeholder test case rows */}
        <div className="w-full max-w-sm mt-2 space-y-2">
          {["Test Case 1", "Test Case 2", "Test Case 3"].map((label) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-sm"
            >
              <span className="text-zinc-400">{label}</span>
              <span className="flex items-center gap-1.5 text-zinc-600">
                <Circle className="h-3.5 w-3.5" />
                <span className="text-xs">Not Run</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (result.error && result.testCases.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <div className="max-w-sm w-full bg-red-950/30 border border-red-900/50 rounded-xl p-5 text-center">
          <XCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-red-200 mb-1">Execution Failed</p>
          <p className="text-xs text-red-400/80 font-mono whitespace-pre-wrap">{result.error}</p>
        </div>
      </div>
    );
  }

  // ── Results state ──────────────────────────────────────────────
  const passed = result.testCases.filter((tc) => tc.passed).length;
  const total  = result.testCases.length;
  const allPassed = passed === total;

  return (
    <div className="flex flex-col p-4 gap-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-100">Test Results</h3>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            allPassed
              ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"
          }`}
        >
          {passed} / {total} Passed
        </span>
      </div>

      {/* Individual test cases */}
      <div className="space-y-3">
        {result.testCases.map((tc, idx) => {
          const isError  = tc.status === "error";
          const isPassed = tc.passed && !isError;

          return (
            <div
              key={tc.id}
              className={`rounded-lg border overflow-hidden ${
                isError   ? "border-red-900/50 bg-red-950/10"
                : isPassed ? "border-emerald-900/50 bg-emerald-950/10"
                : "border-rose-900/50 bg-rose-950/10"
              }`}
            >
              {/* Case header */}
              <div
                className={`flex items-center justify-between px-4 py-2 border-b text-sm font-medium ${
                  isError   ? "border-red-900/30 bg-red-950/30 text-red-400"
                  : isPassed ? "border-emerald-900/30 bg-emerald-950/30 text-emerald-400"
                  : "border-rose-900/30 bg-rose-950/30 text-rose-400"
                }`}
              >
                <span>Test Case {idx + 1}</span>
                <span className="flex items-center gap-1.5">
                  {isError ? (
                    <XCircle className="h-4 w-4" />
                  ) : isPassed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {isError ? "Error" : isPassed ? "Passed" : "Failed"}
                </span>
              </div>

              {/* Case details */}
              <div className="p-3 space-y-2 font-mono text-xs">
                <Row label="Input" value={tc.input} />
                <Row label="Expected" value={tc.expectedOutput} />
                {tc.actualOutput && (
                  <Row
                    label="Actual"
                    value={tc.actualOutput}
                    valueClass={isPassed ? "text-emerald-400" : "text-rose-400"}
                  />
                )}
                {tc.errorMessage && (
                  <Row label="Error" value={tc.errorMessage} valueClass="text-red-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Runtime / memory footer */}
      {!result.error && result.runtime && result.memory && (
        <div className="flex gap-6 pt-3 border-t border-zinc-800 text-xs text-zinc-500">
          <span>Runtime: <span className="text-zinc-300 font-mono">{result.runtime}</span></span>
          <span>Memory:  <span className="text-zinc-300 font-mono">{result.memory}</span></span>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-zinc-300",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-zinc-600 mb-0.5">{label}:</div>
      <div className={`bg-zinc-900/60 px-2.5 py-1.5 rounded border border-zinc-800 ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}
