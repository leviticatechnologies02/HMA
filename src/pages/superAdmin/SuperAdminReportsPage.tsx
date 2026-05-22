import { useState } from "react";
import { BarChart2, Download, TrendingUp, Users, BookOpen, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useSuperAdminHostels } from "../../hooks/useSuperAdminData";

export function SuperAdminReportsPage() {
  const userId = useAuthStore((s) => s.userId);
  const [reportType, setReportType] = useState<"financial" | "occupancy" | "bookings">("financial");
  const hostelsQ = useSuperAdminHostels(userId);
  const hostels = hostelsQ.data ?? [];

  const dashQ = useQuery({
    queryKey: ["super-admin-dashboard-report", userId],
    queryFn: () => api.get("/super-admin/dashboard", {
      headers: { "x-user-id": userId!, "x-user-role": "super_admin" }
    }).then(r => r.data),
    enabled: Boolean(userId),
  });

  const dash = dashQ.data;

  const exportCSV = () => {
    const rows = hostels.map(h => `"${h.name}","${h.city}","${h.hostel_type}","${h.status}","${h.email}"`);
    const csv = ["Name,City,Type,Status,Email", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "platform-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!userId) return <div className="p-8 text-slate-500">Please login as super admin.</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark">Platform Reports & Analytics</h1>
          <p className="mt-1 text-slate-500">Platform-wide performance overview.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 btn-outline text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Report type tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: "financial", label: "Financial", icon: <CreditCard className="w-4 h-4" /> },
          // { id: "occupancy", label: "Occupancy", icon: <TrendingUp className="w-4 h-4" /> },
          // { id: "bookings", label: "Bookings", icon: <BookOpen className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.id} onClick={() => setReportType(t.id as any)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${reportType === t.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-dark"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Platform metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Hostels", value: dash?.total_hostels ?? dash?.hostels ?? 0, icon: <BarChart2 className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
          { label: "Active Hostels", value: dash?.active_hostels ?? 0, icon: <TrendingUp className="w-5 h-5" />, color: "bg-success/10 text-success" },
          { label: "Total Students", value: dash?.total_students ?? 0, icon: <Users className="w-5 h-5" />, color: "bg-secondary/10 text-secondary" },
          { label: "Pending Approval", value: dash?.pending_approval_count ?? 0, icon: <BookOpen className="w-5 h-5" />, color: "bg-warning/10 text-warning" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-2 text-2xl font-heading font-bold text-dark">
                  {dashQ.isLoading ? <span className="skeleton inline-block w-12 h-8" /> : s.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Hostel breakdown table */}
     <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">

  {/* Header */}
  <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    <h2 className="font-bold text-dark dark:text-white text-sm sm:text-base">
      Hostel Breakdown
    </h2>

    <span className="badge badge-slate text-xs w-fit">
      {hostels.length} hostels
    </span>
  </div>

  {hostelsQ.isLoading ? (
    <div className="p-6 sm:p-8">
      <div className="skeleton h-32 rounded-xl" />
    </div>
  ) : (
    <div className="w-full overflow-x-auto">

      <table className="min-w-[650px] w-full text-sm">

        {/* HEAD */}
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {["Hostel", "City", "Type", "Status", "Email"].map((h) => (
              <th
                key={h}
                className="text-left px-4 sm:px-5 py-3 text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {hostels.map((h) => (
            <tr
              key={h.id}
              className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              
              <td className="px-4 sm:px-5 py-3 font-medium text-dark dark:text-white whitespace-nowrap">
                {h.name}
              </td>

              <td className="px-4 sm:px-5 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {h.city}, {h.state}
              </td>

              <td className="px-4 sm:px-5 py-3 capitalize text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {h.hostel_type}
              </td>

              <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                <span
                  className={`badge text-xs capitalize ${
                    h.status === "active"
                      ? "badge-success"
                      : h.status === "pending_approval"
                      ? "badge-warning"
                      : "badge-error"
                  }`}
                >
                  {h.status.replace(/_/g, " ")}
                </span>
              </td>

              <td className="px-4 sm:px-5 py-3 text-slate-500 dark:text-slate-400 text-xs break-all">
                {h.email}
              </td>

            </tr>
          ))}

          {hostels.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 sm:px-5 py-8 text-center text-slate-400"
              >
                No hostels found.
              </td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  )}
</div>
    </div>
  );
}
