import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaAction?: string | (() => void);
}

export default function EmptyState({
  icon,
  title = "No data found",
  description = "Nothing to show here yet.",
  ctaText,
  ctaAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {icon ? (
        <div className="mb-4 text-slate-300">{icon}</div>
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <p className="text-lg font-heading font-bold text-dark">{title}</p>
      <p className="mt-2 text-sm text-slate-500 max-w-xs">{description}</p>
      {ctaText && ctaAction && (
        typeof ctaAction === "string" ? (
          <Link to={ctaAction} className="mt-4 btn-primary text-sm">{ctaText}</Link>
        ) : (
          <button onClick={ctaAction} className="mt-4 btn-primary text-sm">{ctaText}</button>
        )
      )}
    </div>
  );
}