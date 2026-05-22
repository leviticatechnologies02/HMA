import { Building2, Users, Star, TrendingUp, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSuperAdminDashboard, useSuperAdminHostels, useSuperAdminSubscriptions } from "../../hooks/useSuperAdminData";
import { useAuthStore } from "../../store/authStore";

export function SuperAdminDashboardPage() {
  const userId = useAuthStore((s) => s.userId);
  const { data, isLoading } = useSuperAdminDashboard(userId);
  const hostelsQ = useSuperAdminHostels(userId);
  const subscriptionsQ = useSuperAdminSubscriptions(userId);

  const recentHostels = (hostelsQ.data ?? []).slice(0, 5);

  // Calculate monthly revenue from active subscriptions
  const subscriptions = subscriptionsQ.data ?? [];
  const monthlyRevenue = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.price_monthly, 0);

  const stats = [
    { label: "Total Hostels", value: data?.total_hostels ?? data?.hostels ?? 0, icon: <Building2 className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
    { label: "Pending Approval", value: data?.pending_approval_count ?? 0, icon: <Clock className="w-5 h-5" />, color: "bg-accent/20 text-warning" },
    { label: "Active Hostels", value: data?.active_hostels ?? 0, icon: <CheckCircle className="w-5 h-5" />, color: "bg-success/10 text-success" },
    { label: "Revenue (Month)", value: `₹${Math.round(monthlyRevenue).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "bg-secondary/10 text-secondary" },
  ];

  const statusIcon = (s: string) => {
    if (s === "active") return <CheckCircle className="w-4 h-4 text-success" />;
    if (s === "pending_approval") return <Clock className="w-4 h-4 text-warning" />;
    return <XCircle className="w-4 h-4 text-error" />;
  };

  const statusBadge = (s: string) => {
    if (s === "active") return "badge-success";
    if (s === "pending_approval") return "badge-warning";
    return "badge-error";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark">Platform Overview</h1>
        <p className="mt-1 text-slate-500">Super Admin · StayEase Platform</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-2 text-3xl font-heading font-bold text-dark">
                  {isLoading ? <span className="skeleton inline-block w-12 h-8" /> : s.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Hostels — real data */}
 <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">

  {/* Header */}
  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700">
    <h2 className="font-bold text-dark dark:text-white text-sm sm:text-base">
      Recent Hostels
    </h2>

    <Link
      to="/super-admin/hostels"
      className="flex items-center gap-1 text-xs sm:text-sm text-primary font-medium hover:underline"
    >
      View all <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  </div>

  {/* Table */}
  <div className="w-full overflow-x-auto">
    <table className="min-w-[600px] w-full text-sm">
      
      {/* Head */}
      <thead className="bg-slate-50 dark:bg-slate-800">
        <tr>
          {["Hostel", "City", "Type", "Status", "Email"].map((h) => (
            <th
              key={h}
              className="text-left px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      {/* Body */}
      <tbody>
        {hostelsQ.isLoading ? (
          <tr>
            <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-slate-400">
              Loading...
            </td>
          </tr>
        ) : recentHostels.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-slate-400">
              No hostels yet.
            </td>
          </tr>
        ) : (
          recentHostels.map((h: any) => (
            <tr
              key={h.id}
              className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <td className="px-4 sm:px-6 py-4 font-medium text-dark dark:text-white whitespace-nowrap">
                {h.name}
              </td>

              <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {h.city}
              </td>

              <td className="px-4 sm:px-6 py-4 capitalize text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {h.hostel_type}
              </td>

              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span
                  className={`badge ${statusBadge(h.status)} flex items-center gap-1 w-fit text-xs`}
                >
                  {statusIcon(h.status)}
                  {h.status?.replace(/_/g, " ")}
                </span>
              </td>

              <td className="px-4 sm:px-6 py-4 text-slate-500 dark:text-slate-400 text-xs break-all">
                {h.email}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Approve Hostels", desc: "Review pending hostel applications", to: "/super-admin/hostels", color: "border-primary/20 hover:border-primary" },
          { label: "Create Admin", desc: "Add a new hostel admin account", to: "/super-admin/admins", color: "border-secondary/20 hover:border-secondary" },
          { label: "Subscriptions", desc: "Manage hostel subscription plans", to: "/super-admin/subscriptions", color: "border-accent/30 hover:border-warning" },
        ].map((a) => (
          <Link key={a.label} to={a.to} className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 ${a.color} transition-all duration-200 group`}>
            <h3 className="font-bold text-dark dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">{a.label}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{a.desc}</p>
            <ArrowRight className="w-4 h-4 text-primary mt-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
}
