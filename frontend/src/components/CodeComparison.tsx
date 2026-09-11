import Editor from "@monaco-editor/react";
import { Copy } from "lucide-react";

interface CodeComparisonProps {
  originalCode: string;
  refactoredCode: string;
  language: string;
}

export function CodeComparison({ originalCode, refactoredCode, language }: CodeComparisonProps) {
  const monacoLanguage = getMonacoLanguage(language);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0 border-b border-zinc-800">
        
        {/* Original */}
        <div className="flex flex-col border-b md:border-b-0 md:border-r border-zinc-800 h-full">
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
            <span className="text-xs font-semibold text-zinc-300">Original Code</span>
            <button 
              onClick={() => handleCopy(originalCode)}
              className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium rounded transition-colors"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={monacoLanguage}
              theme="vs-dark"
              value={originalCode}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                lineHeight: 22,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>
        </div>

        {/* Refactored */}
        <div className="flex flex-col h-full bg-zinc-950/50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-indigo-950/20">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              Refactored Code
            </span>
            <button 
              onClick={() => handleCopy(refactoredCode)}
              className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-medium rounded transition-colors shadow-sm"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={monacoLanguage}
              theme="vs-dark"
              value={refactoredCode}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                lineHeight: 22,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function getMonacoLanguage(lang: string): string {
  const map: Record<string, string> = {
    "Python": "python",
    "JavaScript": "javascript",
    "TypeScript": "typescript",
    "Java": "java",
    "C": "c",
    "C++": "cpp",
    "C#": "csharp",
    "Go": "go",
    "Rust": "rust",
    "MATLAB": "matlab",
    "Verilog": "verilog",
    "Arduino C++": "cpp"
  };
  return map[lang] || "plaintext";
}
