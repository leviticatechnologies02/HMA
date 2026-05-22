const COLOR: Record<string, string> = {
  active:           "badge-success",
  approved:         "badge-success",
  resolved:         "badge-success",
  checked_in:       "badge-primary",
  in_progress:      "badge-primary",
  pending_approval: "badge-warning",
  payment_pending:  "badge-warning",
  waiting:          "badge-warning",
  notified:         "badge-warning",
  open:             "badge-warning",
  rejected:         "badge-error",
  cancelled:        "badge-error",
  urgent:           "badge-error",
  suspended:        "badge-error",
  checked_out:      "badge-slate",
  closed:           "badge-slate",
  expired:          "badge-slate",
  inactive:         "badge-slate",
};

interface Props { status: string; size?: "sm" | "md" | "lg"; }

export default function StatusBadge({ status, size = "md" }: Props) {
  const cls = COLOR[status?.toLowerCase()] ?? "badge-slate";
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : size === "lg" ? "px-4 py-1.5 text-sm" : "";
  return (
    <span className={`badge ${cls} capitalize ${pad}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}