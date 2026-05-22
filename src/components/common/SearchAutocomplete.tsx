import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Building2 } from "lucide-react";
import { api } from "../../api/axiosInstance";

interface Result { type: "city" | "hostel"; label: string; sub: string; href: string; }

function useDebounce(value: string, ms: number) {
  const [dv, setDv] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDv(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return dv;
}

export function SearchAutocomplete({ placeholder = "Search city or hostel..." }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(-1);
  const dq = useDebounce(query, 300);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (dq.length < 2) { setResults([]); return; }
    let cancelled = false;
    async function fetch() {
      try {
        // Use the dedicated autocomplete endpoint
        const autocomplete = await api.get("/public/hostels/search/autocomplete", { params: { q: dq } })
          .then(r => r.data).catch(() => []);
        if (cancelled) return;
        const r: Result[] = autocomplete.map((item: any) => ({
          type: item.slug ? "hostel" as const : "city" as const,
          label: item.name ?? item.city,
          sub: item.slug ? `${item.city}, ${item.state}` : `${item.state}`,
          href: item.slug ? `/hostels/${item.slug}` : `/hostels?city=${encodeURIComponent(item.city ?? item.name)}`,
        }));
        setResults(r);
        setOpen(r.length > 0);
        setIdx(-1);
      } catch {}
    }
    fetch();
    return () => { cancelled = true; };
  }, [dq]);

  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter") { if (idx >= 0) { navigate(results[idx].href); setOpen(false); setQuery(""); } else if (query) { navigate(`/hostels?search=${encodeURIComponent(query)}`); setOpen(false); } }
    else if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); if (e.target.value.length >= 2) setOpen(true); }}
          onKeyDown={handleKey}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="input-field pl-9 pr-4"
          aria-label="Search hostels"
          aria-autocomplete="list"
          aria-expanded={open}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {results.map((r, i) => (
            <button key={r.href} onClick={() => { navigate(r.href); setOpen(false); setQuery(""); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${i === idx ? "bg-primary/5" : ""}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.type === "city" ? "bg-secondary/10" : "bg-primary/10"}`}>
                {r.type === "city" ? <MapPin className="w-4 h-4 text-secondary" /> : <Building2 className="w-4 h-4 text-primary" />}
              </div>
              <div>
                <p className="text-sm font-medium text-dark">{r.label}</p>
                <p className="text-xs text-slate-500">{r.sub}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}