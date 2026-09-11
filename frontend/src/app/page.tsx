"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { CodeWorkspace } from "@/components/CodeWorkspace";
import { CodeChat } from "@/components/CodeChat";
import { useState } from "react";

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const IS_CLERK_CONFIGURED =
  CLERK_KEY.startsWith("pk_live_") || CLERK_KEY.startsWith("pk_test_");

// If Clerk is not configured, render workspace directly
function WorkspaceLayout() {
  const [currentCode, setCurrentCode] = useState<string>(
    "def hello_world():\n    print('Hello World!')"
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Python");

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-zinc-100">Code Reviewer &amp; Explainer</h1>
          <span className="hidden sm:inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 ring-1 ring-indigo-500/20">
            AI-powered coding workspace
          </span>
        </div>
        <div className="flex items-center gap-2">
          {IS_CLERK_CONFIGURED && <UserButton />}
        </div>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-96 flex shrink-0 flex-col border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950/30">
          <CodeChat currentCode={currentCode} selectedLanguage={selectedLanguage} />
        </aside>
        <section className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
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

// When Clerk IS configured, gate behind authentication
function AuthenticatedHome() {
  const { isLoaded, isSignedIn } = useUser();
  const [currentCode, setCurrentCode] = useState<string>(
    "def hello_world():\n    print('Hello World!')"
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Python");

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-zinc-950 text-zinc-300">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold text-white">Code Reviewer &amp; Explainer</h1>
          <p className="text-zinc-400">AI-powered coding workspace — sign in to get started.</p>
        </div>
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-zinc-100">Code Reviewer &amp; Explainer</h1>
          <span className="hidden sm:inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 ring-1 ring-indigo-500/20">
            AI-powered coding workspace
          </span>
        </div>
        <div className="flex items-center gap-4">
          <UserButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-96 flex shrink-0 flex-col border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950/30">
          <CodeChat currentCode={currentCode} selectedLanguage={selectedLanguage} />
        </aside>
        <section className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
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

export default function Home() {
  if (!IS_CLERK_CONFIGURED) {
    return <WorkspaceLayout />;
  }
  return <AuthenticatedHome />;
}
