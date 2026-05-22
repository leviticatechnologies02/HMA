import { useState } from "react";
import { X, GitCompare, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";

interface Props {
  selectedIds: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function HostelCompareBar({ selectedIds, onRemove, onClear }: Props) {
  const [expanded, setExpanded] = useState(false);

  const compareQ = useQuery({
    queryKey: ["hostel-compare", selectedIds],
    queryFn: () => api.get(`/public/hostels/compare?ids=${selectedIds.join(",")}`).then(r => r.data),
    enabled: expanded && selectedIds.length >= 2,
  });

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
      <div className="bg-dark rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Bar header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <GitCompare className="w-4 h-4 text-primary shrink-0" />
          <span className="text-white text-sm font-semibold flex-1">
            {selectedIds.length} hostel{selectedIds.length > 1 ? "s" : ""} selected for comparison
          </span>
          {selectedIds.length >= 2 && (
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
              {expanded ? <><ChevronDown className="w-3.5 h-3.5" /> Hide</> : <><ChevronUp className="w-3.5 h-3.5" /> Compare</>}
            </button>
          )}
          <button onClick={onClear} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected hostel chips */}
        <div className="flex gap-2 px-4 pb-3 flex-wrap">
          {selectedIds.map(id => (
            <span key={id} className="flex items-center gap-1.5 bg-white/10 text-white text-xs px-3 py-1.5 rounded-full">
              <span className="font-mono">{id.slice(0, 8)}...</span>
              <button onClick={() => onRemove(id)} className="hover:text-error transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>

        {/* Comparison table */}
        {expanded && (
          <div className="border-t border-white/10 p-4">
            {compareQ.isLoading && <div className="text-center text-slate-400 text-sm py-4">Loading comparison...</div>}
            {compareQ.data && compareQ.data.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-white">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-slate-400 uppercase pb-2 pr-4">Feature</th>
                      {compareQ.data.map((h: any) => (
                        <th key={h.id} className="text-left text-xs text-primary uppercase pb-2 pr-4">{h.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { label: "City", key: "city" },
                      { label: "Type", key: "hostel_type" },
                      { label: "Amenities", key: (h: any) => h.amenities?.slice(0, 3).join(", ") || "—" },
                    ].map(({ label, key }) => (
                      <tr key={label}>
                        <td className="py-2 pr-4 text-slate-400 text-xs">{label}</td>
                        {compareQ.data.map((h: any) => (
                          <td key={h.id} className="py-2 pr-4 text-xs capitalize">
                            {typeof key === "function" ? key(h) : (h[key] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
