import { BookOpen, Users, CreditCard, TrendingUp, Clock, CheckCircle, ArrowRight, AlertCircle, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminBookings, useAdminDashboard, useAdminMyHostels, useAdminPayments } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import { useMemo } from "react";
import { formatDate } from "../../utils/formatters";

const STATUS_STYLE: Record<string, string> = {
  payment_pending: "badge-warning",
  pending_approval: "badge-warning",
  approved: "badge-success",
  checked_in: "badge-primary",
  checked_out: "badge-slate",
  rejected: "badge-error",
  cancelled: "badge-error",
};

export function AdminDashboardPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;
  const { data, isLoading } = useAdminDashboard(userId, hostelIds, hostelId);
  const bookingsQ = useAdminBookings(userId, hostelId, hostelIds);
  const paymentsQ = useAdminPayments(userId, hostelId, hostelIds);
  const hostelsQ = useAdminMyHostels(userId, hostelIds);
  const activeHostel = (hostelsQ.data ?? []).find((h: any) => h.id === hostelId);
  const hostelLabel = activeHostel?.name ?? "Your Hostel";

  const recentBookings = (bookingsQ.data ?? []).slice(0, 5);

  // Revenue calculations
  const revenue = useMemo(() => {
    const payments = paymentsQ.data ?? [];
    const captured = payments.filter(p => p.status === "captured");
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthRevenue = captured.filter(p => new Date(p.created_at) >= monthStart).reduce((s, p) => s + Number(p.amount), 0);
    const totalRevenue = captured.reduce((s, p) => s + Number(p.amount), 0);
    const pending = payments.filter(p => p.status === "created").reduce((s, p) => s + Number(p.amount), 0);
    return { monthRevenue, totalRevenue, pending };
  }, [paymentsQ.data]);

  const stats = [
    { label: "Total Rooms", value: data?.rooms ?? 0, icon: <BookOpen className="w-5 h-5" />, color: "bg-primary/10 text-primary", sub: hostelLabel },
    { label: "Active Students", value: data?.students ?? 0, icon: <Users className="w-5 h-5" />, color: "bg-secondary/10 text-secondary", sub: "Currently checked in" },
    { label: "Occupancy Rate", value: data?.rooms ? `${Math.round((data.students / (data.rooms * 4)) * 100)}%` : "—", icon: <TrendingUp className="w-5 h-5" />, color: "bg-accent/20 text-warning", sub: "Beds occupied" },
    { label: "Revenue (Month)", value: `₹${revenue.monthRevenue.toLocaleString()}`, icon: <IndianRupee className="w-5 h-5" />, color: "bg-success/10 text-success", sub: `₹${revenue.totalRevenue.toLocaleString()} total` },
    { label: "Complaints", value: data?.complaints ?? 0, icon: <Clock className="w-5 h-5" />, color: "bg-warning/10 text-warning", sub: "Open complaints" },
    { label: "Maintenance", value: data?.maintenance_items ?? 0, icon: <CheckCircle className="w-5 h-5" />, color: "bg-success/10 text-success", sub: "Pending requests" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark">Admin Dashboard</h1>
        <p className="mt-1 text-slate-500">
          {activeHostel ? (
            <>Showing data for <span className="font-semibold text-dark">{hostelLabel}</span></>
          ) : "Welcome back! Here's your hostel overview."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-2 text-3xl font-heading font-bold text-dark">
                  {isLoading ? <span className="skeleton inline-block w-16 h-8" /> : s.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {(data?.complaints ?? 0) > 0 && (
        <div className="flex items-center gap-4 bg-warning/10 border border-warning/20 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-warning shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-dark">{data?.complaints ?? 0} open complaints need attention</p>
            <p className="text-sm text-slate-500">Review and resolve student complaints.</p>
          </div>
          <Link to="/admin/complaints" className="btn-primary text-sm shrink-0">
            Review Now
          </Link>
        </div>
      )}

      {/* Recent bookings — real data */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-dark">Recent Bookings</h2>
          <Link to="/admin/bookings" className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Booking #", "Guest", "Mode", "Check-in", "Status", "Advance"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookingsQ.isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : recentBookings.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No bookings yet.</td></tr>
              ) : recentBookings.map((b: any) => (
                <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{b.booking_number}</td>
                  <td className="px-6 py-4 font-medium text-dark">{b.full_name ?? "—"}</td>
                  <td className="px-6 py-4 capitalize text-slate-600">{b.booking_mode}</td>
                  <td className="px-6 py-4 text-slate-600">{b.check_in_date ? formatDate(b.check_in_date) : "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${STATUS_STYLE[b.status] ?? "badge-slate"} capitalize text-xs`}>
                      {b.status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-dark">₹{Number(b.booking_advance).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Manage Rooms", desc: "Add, edit or remove rooms and beds", to: "/admin/inventory" },
          { label: "Post Notice", desc: "Send announcements to all students", to: "/admin/notices" },
          { label: "View Payments", desc: "Track revenue and pending dues", to: "/admin/payments" },
        ].map((a) => (
          <Link key={a.label} to={a.to} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 group">
            <h3 className="font-bold text-dark group-hover:text-primary transition-colors">{a.label}</h3>
            <p className="mt-1 text-sm text-slate-500">{a.desc}</p>
            <ArrowRight className="w-4 h-4 text-primary mt-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
}
