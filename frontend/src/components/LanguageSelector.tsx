import { ChevronDown } from "lucide-react";

const languages = [
  "Python", "JavaScript", "TypeScript", "Java", "C", "C++", 
  "C#", "Go", "Rust", "MATLAB", "Verilog", "Arduino C++"
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

export function LanguageSelector({ selectedLanguage, setSelectedLanguage }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Language</span>
      <div className="relative">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="appearance-none bg-zinc-800/50 hover:bg-zinc-800 text-sm font-medium text-zinc-100 rounded-md pl-3 pr-8 py-1.5 border border-zinc-700/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  );
}
