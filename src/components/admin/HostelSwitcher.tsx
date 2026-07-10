import React, { useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { useHostelSwitcher } from "./useHostelSwitcher";

export const HostelSwitcher = () => {
  const [open, setOpen] = useState(false);

  const {
    hostels,
    active,
    activeHostelId,
    setActiveHostelId,
  } = useHostelSwitcher();

  if (hostels.length <= 1) return null;
console.log("HostelSwitcher hostels:", hostels);
console.log("HostelSwitcher activeHostelId:", activeHostelId);
console.log("HostelSwitcher active:", active);
  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-dark dark:text-slate-200 hover:border-primary/40 transition-all min-w-0 w-full"
      >
        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="max-w-[80px] sm:max-w-32 truncate">
          {active?.name ?? "Select Hostel"}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 sm:left-0 -translate-x-1/4 sm:translate-x-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 min-w-[12rem] sm:min-w-48 overflow-hidden">
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase border-b">
            Switch Hostel
          </p>

          {hostels.map((h) => (
            <button
              key={h.id}
              onClick={() => {
                setActiveHostelId(h.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                h.id === activeHostelId
                  ? "text-primary font-semibold"
                  : "text-dark dark:text-slate-300"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />

              <div className="min-w-0">
                <p className="truncate">{h.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {h.city}
                </p>
              </div>

              {h.id === activeHostelId && (
                <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};