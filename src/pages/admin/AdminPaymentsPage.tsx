import { useMemo, useState } from "react";
import { CreditCard, TrendingUp, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminPayments } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../utils/formatters";

export function AdminPaymentsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;
  const { data, isLoading, isError } = useAdminPayments(userId, hostelId, hostelIds);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const payments = data ?? [];
  console.log("Payments data from API:", payments);
  const filtered = payments.filter(p => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending") return p.status === "pending" || p.status === "created";
    if (statusFilter === "success") return p.status === "success" || p.status === "paid" || p.status === "captured";
    return p.status === statusFilter;
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedPayments = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total: payments.reduce((s, p) => s + Number(p.amount), 0),
    paid: payments.filter(p => p.status === "captured" || p.status === "success" || p.status === "paid").reduce((s, p) => s + Number(p.amount), 0),
    pending: payments.filter(p => p.status === "created" || p.status === "pending").length,
  }), [payments]);

  if (!userId || !hostelIds.length) return <div className="p-8 text-slate-500">Login as admin with assigned hostels.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark dark:text-white">Payments</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Track all payment transactions for your hostel.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Collected", value: `₹${stats.total.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "bg-success/10 text-success" },
          { label: "Confirmed Payments", value: `₹${stats.paid.toLocaleString()}`, icon: <CheckCircle className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
          { label: "Pending", value: stats.pending, icon: <Clock className="w-5 h-5" />, color: "bg-warning/10 text-warning" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="mt-2 text-2xl font-heading font-bold text-dark dark:text-white">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-dark dark:text-white">Transactions</h2>
          <select value={statusFilter} onChange={handleFilterChange} className="input-field w-auto text-sm">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="success">Captured / Success</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        {isLoading && <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>}
        {isError && <div className="p-8 text-center text-error">Failed to load payments.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {["Payer", "Type", "Method", "Amount", "Balance", "Status", "Paid At"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map(p => (
                  <tr key={p.payment_id || p.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-dark dark:text-white">{p.payer_name || "—"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{p.payer_email || ""}</div>
                    </td>
                    <td className="px-5 py-4 capitalize text-dark dark:text-slate-200">{p.payment_type?.replace(/_/g, " ")}</td>
                    <td className="px-5 py-4 capitalize text-slate-600 dark:text-slate-400">{p.payment_method}</td>
                    <td className="px-5 py-4 font-semibold text-dark dark:text-white">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-400">
                      {p.remaining_balance !== undefined && p.remaining_balance !== null ? `₹${Number(p.remaining_balance).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${p.status === "captured" || p.status === "paid" || p.status === "success" ? "badge-success" : p.status === "failed" ? "badge-error" : "badge-warning"} capitalize text-xs`}>
                        {p.status === "success" || p.status === "paid" ? "Captured" : p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{formatDate(p.paid_at ?? "—")}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">No payments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
