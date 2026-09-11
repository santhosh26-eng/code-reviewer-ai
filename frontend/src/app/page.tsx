"use client";

import { useState } from "react";
import { CodeChat } from "@/components/CodeChat";
import { CodeWorkspace } from "@/components/CodeWorkspace";
import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";

const DEFAULT_CODE = `def two_sum(nums, target):
    """
    Given an array of integers nums and an integer target,
    return indices of the two numbers that add up to target.
    """
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
`;

export default function Home() {
  const { isSignedIn } = useAuth();
  const [currentCode, setCurrentCode] = useState<string>(DEFAULT_CODE);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Python");

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 lg:px-6 z-10">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 shadow-sm shadow-indigo-900/50">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-zinc-100 tracking-tight">
              Code Reviewer
            </span>
            <span className="hidden sm:block text-xs text-zinc-500">AI-powered workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-800/50 bg-emerald-950/30 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-400 tracking-wide uppercase">Live</span>
          </div>
          <div className="ml-2">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="text-xs font-semibold px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">Sign In</button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* ── Main two-column layout ────────────────────────────────── */}
      <main className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-0">
        {/* LEFT — AI Chat panel (30%) */}
        <aside
          className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950 overflow-hidden"
          aria-label="AI Code Assistant"
        >
          <CodeChat currentCode={currentCode} selectedLanguage={selectedLanguage} />
        </aside>

        {/* RIGHT — Code workspace (70%) */}
        <section
          className="flex flex-1 flex-col overflow-hidden min-w-0 bg-zinc-950"
          aria-label="Code Workspace"
        >
          <CodeWorkspace
            currentCode={currentCode}
            setCurrentCode={setCurrentCode}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
        </section>
      </main>
    </div>
  );
}
