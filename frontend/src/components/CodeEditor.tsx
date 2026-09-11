import Editor from "@monaco-editor/react";
import { Copy, Trash2 } from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language: string;
}

export function CodeEditor({ code, onChange, language }: CodeEditorProps) {
  const monacoLanguage = getMonacoLanguage(language);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
        <span className="text-xs font-mono text-zinc-400">main.{getFileExtension(language)}</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
            title="Copy Code"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={handleClear}
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
            title="Clear Editor"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={monacoLanguage}
          theme="vs-dark"
          value={code}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            lineHeight: 24,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
          }}
          loading={
            <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
              Loading editor...
            </div>
          }
        />
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

function getFileExtension(lang: string): string {
  const map: Record<string, string> = {
    "Python": "py",
    "JavaScript": "js",
    "TypeScript": "ts",
    "Java": "java",
    "C": "c",
    "C++": "cpp",
    "C#": "cs",
    "Go": "go",
    "Rust": "rs",
    "MATLAB": "m",
    "Verilog": "v",
    "Arduino C++": "ino"
  };
  return map[lang] || "txt";
}
