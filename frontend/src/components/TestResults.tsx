import { ExecutionResult } from "@/types/execution";
import { CheckCircle2, XCircle } from "lucide-react";

export function TestResults({ result }: { result: ExecutionResult | null }) {
  if (!result) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-semibold text-zinc-100">Test Results</h3>
        {result.error ? (
          <span className="px-3 py-1 bg-red-500/10 text-red-400 text-sm font-medium rounded-full ring-1 ring-red-500/20">
            Execution Failed
          </span>
        ) : (
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-full">
            {result.testCases.filter((tc) => tc.passed).length} / {result.testCases.length} Passed
          </span>
        )}
      </div>

      {result.error && (
        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm font-mono whitespace-pre-wrap">
          {result.error}
        </div>
      )}

      <div className="space-y-4">
        {result.testCases.map((tc, index) => (
          <div 
            key={tc.id} 
            className={`border rounded-lg overflow-hidden ${
              tc.status === 'error' ? 'border-red-900/50 bg-red-950/10' :
              tc.passed ? 'border-emerald-900/50 bg-emerald-950/10' : 
              'border-rose-900/50 bg-rose-950/10'
            }`}
          >
            <div className={`flex items-center justify-between px-4 py-2 border-b ${
              tc.status === 'error' ? 'border-red-900/30 bg-red-950/30 text-red-400' :
              tc.passed ? 'border-emerald-900/30 bg-emerald-950/30 text-emerald-400' : 
              'border-rose-900/30 bg-rose-950/30 text-rose-400'
            }`}>
              <span className="font-semibold text-sm">Test Case {index + 1}</span>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                {tc.status === 'error' ? <XCircle className="h-4 w-4" /> : tc.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {tc.status === 'error' ? 'Error' : tc.passed ? 'Passed' : 'Failed'}
              </div>
            </div>
            <div className="p-4 space-y-3 font-mono text-sm">
              <div>
                <div className="text-zinc-500 text-xs mb-1">Input:</div>
                <div className="text-zinc-300 bg-zinc-900/50 px-3 py-2 rounded border border-zinc-800">{tc.input}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-xs mb-1">Expected Output:</div>
                <div className="text-zinc-300 bg-zinc-900/50 px-3 py-2 rounded border border-zinc-800">{tc.expectedOutput}</div>
              </div>
              {tc.actualOutput && (
                <div>
                  <div className="text-zinc-500 text-xs mb-1">Actual Output:</div>
                  <div className={`${tc.passed ? 'text-emerald-400' : 'text-rose-400'} bg-zinc-900/50 px-3 py-2 rounded border border-zinc-800`}>
                    {tc.actualOutput}
                  </div>
                </div>
              )}
              {tc.errorMessage && (
                <div>
                  <div className="text-zinc-500 text-xs mb-1">Error:</div>
                  <div className="text-red-400 bg-red-950/20 px-3 py-2 rounded border border-red-900/30">
                    {tc.errorMessage}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!result.error && result.runtime && result.memory && (
        <div className="flex gap-4 pt-4 border-t border-zinc-800 text-sm text-zinc-400">
          <div>Runtime: <span className="text-zinc-200 font-mono">{result.runtime}</span></div>
          <div>Memory: <span className="text-zinc-200 font-mono">{result.memory}</span></div>
        </div>
      )}
    </div>
  );
}
