import { CreditCard, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { useStudentPayments } from "../../hooks/useStudentComplaints";
import { useAuthStore } from "../../store/authStore";
import { StudentNotCheckedInBanner } from "../../components/student/StudentNotCheckedInBanner";
import { formatDate } from "../../utils/formatters";

export function StudentPaymentsPage() {
  const userId = useAuthStore((s) => s.userId);
  const { data, isLoading, isError } = useStudentPayments(userId);

  const payments = data ?? [];
  const totalPaid = payments.filter(p => p.status === "captured").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === "created").reduce((s, p) => s + Number(p.amount), 0);

  if (!userId) return <div className="p-8 text-slate-500">Please login to view payments.</div>;

  return (
    <div className="space-y-6">
      <StudentNotCheckedInBanner />
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark">My Payments</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">Track all your payment transactions.</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          { label: "Total Paid", value: `₹${totalPaid.toLocaleString()}`, icon: <CheckCircle className="w-5 h-5" />, color: "bg-success/10 text-success" },
          { label: "Pending", value: `₹${totalPending.toLocaleString()}`, icon: <Clock className="w-5 h-5" />, color: "bg-warning/10 text-warning" },
          { label: "Transactions", value: payments.length, icon: <CreditCard className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-2 text-2xl font-heading font-bold text-dark">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>}

      {!isLoading && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Type", "Method", "Amount", "Balance", "Status", "Due Date", "Paid At", "Receipt", "Action"].map(h => (
                    <th key={h} className="text-left px-3 sm:px-5 py-2 sm:py-3 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr><td colSpan={9} className="px-3 sm:px-5 py-8 sm:py-12 text-center text-slate-500 text-xs sm:text-sm">No payments yet.</td></tr>
                )}
                {payments.map((p: any) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-3 sm:px-5 py-3 sm:py-4 capitalize text-dark truncate text-xs sm:text-sm">{p.payment_type?.replace(/_/g, " ")}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 capitalize text-slate-600 truncate text-xs sm:text-sm">{p.payment_method}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-dark whitespace-nowrap text-xs sm:text-sm">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 font-medium text-slate-600 whitespace-nowrap text-xs sm:text-sm">
                      {p.remaining_balance !== undefined && p.remaining_balance !== null ? `₹${Number(p.remaining_balance).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <span className={`badge ${p.status === "captured" || p.status === "success" || p.status === "paid" ? "badge-success" : p.status === "failed" ? "badge-error" : "badge-warning"} capitalize text-xs`}>
                        {p.status === "success" || p.status === "paid" ? "Captured" : p.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-slate-500 text-xs truncate">{p.due_date ? formatDate(p.due_date) : "—"}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-slate-500 text-xs truncate">{p.paid_at ? formatDate(p.paid_at) : "—"}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      {p.receipt_url ? (
                        <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary text-xs hover:underline whitespace-nowrap">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      {(p.status === "pending" || p.status === "created" || (p.remaining_balance && p.remaining_balance > 0)) ? (
                        <button
                          className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                          onClick={() => alert("Payment integration to be implemented")}
                        >
                          Pay Now
                        </button>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
