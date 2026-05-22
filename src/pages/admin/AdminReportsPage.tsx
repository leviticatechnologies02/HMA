import { useMemo } from "react";
import { TrendingUp, Users, CreditCard, BookOpen, Download } from "lucide-react";
import { useAdminPayments, useAdminStudents, useAdminBookings, useAdminAttendanceSummary } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";

export function AdminReportsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;
  const now = new Date();

  const paymentsQ = useAdminPayments(userId, hostelId, hostelIds);
  const studentsQ = useAdminStudents(userId, hostelId, hostelIds);
  const bookingsQ = useAdminBookings(userId, hostelId, hostelIds);
  const summaryQ = useAdminAttendanceSummary(userId, hostelId, hostelIds, now.getFullYear(), now.getMonth() + 1);

  const payments = paymentsQ.data ?? [];
  const students = studentsQ.data ?? [];
  const bookings = bookingsQ.data ?? [];

  const financials = useMemo(() => {
    const captured = payments.filter(p => p.status === "captured");
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonth = captured.filter(p => new Date(p.created_at) >= monthStart).reduce((s, p) => s + Number(p.amount), 0);
    const lastMonth = captured.filter(p => {
      const d = new Date(p.created_at);
      return d >= lastMonthStart && d < monthStart;
    }).reduce((s, p) => s + Number(p.amount), 0);
    const total = captured.reduce((s, p) => s + Number(p.amount), 0);
    const pending = payments.filter(p => p.status === "created").reduce((s, p) => s + Number(p.amount), 0);
    const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;
    return { thisMonth, lastMonth, total, pending, growth };
  }, [payments]);

  const bookingStats = useMemo(() => {
    const total = bookings.length;
    const checkedIn = bookings.filter(b => b.status === "checked_in").length;
    const pending = bookings.filter(b => b.status === "pending_approval" || b.status === "payment_pending").length;
    const cancelled = bookings.filter(b => b.status === "cancelled" || b.status === "rejected").length;
    const conversionRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return { total, checkedIn, pending, cancelled, conversionRate };
  }, [bookings]);

  const exportPaymentsCSV = () => {
    const csv = ["Date,Type,Method,Amount,Status"].concat(
      payments.map(p => `"${p.created_at?.slice(0,10)}","${p.payment_type}","${p.payment_method}","${p.amount}","${p.status}"`)
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "payments-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!userId || !hostelIds.length) return <div className="p-8 text-slate-500">Login as admin with assigned hostels.</div>;

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-dark">Reports & Analytics</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">Financial, occupancy, and booking performance overview.</p>
        </div>
        <button onClick={exportPaymentsCSV} className="flex items-center justify-center gap-2 btn-outline text-sm w-full md:w-auto">
          <Download className="w-4 h-4" /> Export Payments CSV
        </button>
      </div>

      {/* Financial Summary */}
      <div>
        <h2 className="text-lg md:text-base font-bold text-dark mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Financial Summary</h2>
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "This Month", value: `₹${financials.thisMonth.toLocaleString()}`, sub: financials.growth >= 0 ? `+${financials.growth}% vs last month` : `${financials.growth}% vs last month`, color: financials.growth >= 0 ? "text-success" : "text-error" },
            { label: "Last Month", value: `₹${financials.lastMonth.toLocaleString()}`, sub: "Previous month revenue", color: "text-slate-500" },
            { label: "Total Collected", value: `₹${financials.total.toLocaleString()}`, sub: "All time captured", color: "text-slate-500" },
            { label: "Pending", value: `₹${financials.pending.toLocaleString()}`, sub: "Awaiting payment", color: "text-warning" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-3 md:p-5">
              <p className="text-xs md:text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 text-xl md:text-2xl font-heading font-bold text-dark">{s.value}</p>
              <p className={`text-xs mt-1 ${s.color}`}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Stats */}
      <div>
        <h2 className="text-lg md:text-base font-bold text-dark mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-secondary" /> Booking Performance</h2>
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Bookings", value: bookingStats.total, color: "bg-primary/10 text-primary" },
            { label: "Checked In", value: bookingStats.checkedIn, color: "bg-success/10 text-success" },
            { label: "Pending Approval", value: bookingStats.pending, color: "bg-warning/10 text-warning" },
            { label: "Conversion Rate", value: `${bookingStats.conversionRate}%`, color: "bg-secondary/10 text-secondary" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-3 md:p-5">
              <p className="text-xs md:text-sm text-slate-500">{s.label}</p>
              <p className={`mt-2 text-xl md:text-2xl font-heading font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Summary */}
      <div>
        <h2 className="text-lg md:text-base font-bold text-dark mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-accent" /> Attendance — {now.toLocaleString("default", { month: "long", year: "numeric" })}</h2>
        {summaryQ.isLoading ? <div className="skeleton h-32 rounded-2xl" /> : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-slate-50">
                  <tr>{["Student", "Number", "Present", "Days Marked", "Rate"].map(h => (
                    <th key={h} className="text-left px-2 md:px-5 py-2 md:py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {(summaryQ.data ?? []).length === 0 && (
                    <tr><td colSpan={5} className="px-2 md:px-5 py-6 md:py-8 text-center text-slate-400">No attendance data for this month.</td></tr>
                  )}
                  {(summaryQ.data ?? []).map(row => (
                    <tr key={row.student_id} className="border-t border-slate-100">
                      <td className="px-2 md:px-5 py-2 md:py-3 font-medium text-dark truncate">{row.full_name}</td>
                      <td className="px-2 md:px-5 py-2 md:py-3 font-mono text-xs text-slate-500">{row.student_number}</td>
                      <td className="px-2 md:px-5 py-2 md:py-3">{row.present_count}</td>
                      <td className="px-2 md:px-5 py-2 md:py-3">{row.total_marked}</td>
                      <td className={`px-2 md:px-5 py-2 md:py-3 font-semibold ${row.attendance_rate_percent >= 80 ? "text-success" : row.attendance_rate_percent >= 60 ? "text-warning" : "text-error"}`}>
                        {row.attendance_rate_percent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Students */}
      <div>
        <h2 className="text-lg md:text-base font-bold text-dark mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Student Overview</h2>
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
          {[
            { label: "Total Students", value: students.length },
            { label: "Active", value: students.filter((s: any) => s.status === "active").length },
            { label: "Checked Out", value: students.filter((s: any) => s.status === "checked_out").length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-3 md:p-5">
              <p className="text-xs md:text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 text-xl md:text-2xl font-heading font-bold text-dark">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
