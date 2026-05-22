import { useState, useRef, useEffect } from "react";
import { Mail } from "lucide-react";

const DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
  "icloud.com", "rediffmail.com", "ymail.com", "protonmail.com",
  "levitica.in", "stayease.com",
];

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
};

export function EmailInput({ value, onChange, placeholder = "you@example.com", className = "", error }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setActiveIdx(-1);

    const atIdx = val.indexOf("@");
    if (atIdx !== -1) {
      const typed = val.slice(atIdx + 1).toLowerCase();
      const local = val.slice(0, atIdx);
      if (local.length > 0) {
        const filtered = typed
          ? DOMAINS.filter((d) => d.startsWith(typed) && d !== typed)
          : DOMAINS;
        setSuggestions(filtered.slice(0, 6).map((d) => `${local}@${d}`));
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const pick = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (activeIdx >= 0) {
        e.preventDefault();
        pick(suggestions[activeIdx]);
      } else if (suggestions.length === 1) {
        e.preventDefault();
        pick(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 dark:text-[#64748B] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition dark:bg-[#252540] dark:text-[#E2E8F0] dark:placeholder:text-[#64748B] ${
          error ? "border-error dark:border-error" : "border-slate-200 dark:border-[#2D2D4A]"
        } ${className}`}
      />
      {/* {suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden dark:bg-[#1A1A2E] dark:border-[#2D2D4A]">
          {suggestions.map((s, i) => {
            const atIdx = s.indexOf("@");
            const local = s.slice(0, atIdx + 1);
            const domain = s.slice(atIdx + 1);
            return (
              <li
                key={s}
                onMouseDown={() => pick(s)}
                className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                  i === activeIdx ? "bg-primary/10 text-primary dark:bg-primary/20" : "hover:bg-slate-50 text-dark dark:hover:bg-white/5 dark:text-[#E2E8F0]"
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-[#64748B] shrink-0" />
                <span>
                  <span className="text-slate-400 dark:text-[#64748B]">{local}</span>
                  <span className="font-medium dark:text-[#E2E8F0]">{domain}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )} */}
    </div>
  );
}
