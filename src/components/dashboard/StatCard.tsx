interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: { value: number; label: string };
}

export default function StatCard({ label, value, sub, icon, color = "bg-primary/10 text-primary", trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-heading font-bold text-dark truncate">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-semibold ${trend.value >= 0 ? "text-success" : "text-error"}`}>
              {trend.value >= 0 ? "" : ""} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0 ml-3`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}