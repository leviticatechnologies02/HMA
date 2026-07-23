import { Users, MessageSquare, UserCheck, Wrench, Bell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSupervisorDashboard } from "../../hooks/useSupervisorDashboard";
import { useAuthStore } from "../../store/authStore";

export function SupervisorDashboardPage() {
  const userId = useAuthStore((s) => s.userId);
  const { data, isLoading } = useSupervisorDashboard(userId);

  const stats = [
    { label: "Students", value: data?.students ?? 0, icon: <Users className="w-5 h-5" />, color: "bg-primary/10 text-primary", to: "/supervisor/students" },
    { label: "Open Complaints", value: data?.complaints ?? 0, icon: <MessageSquare className="w-5 h-5" />, color: "bg-error/10 text-error", to: "/supervisor/complaints" },
    // { label: "Attendance Today", value: data?.attendance_records ?? 0, icon: <UserCheck className="w-5 h-5" />, color: "bg-success/10 text-success", to: "/supervisor/attendance" },
    { label: "Maintenance", value: data?.maintenance_requests ?? 0, icon: <Wrench className="w-5 h-5" />, color: "bg-warning/10 text-warning", to: "/supervisor/maintenance" },
    { label: "Notices", value: data?.notices ?? 0, icon: <Bell className="w-5 h-5" />, color: "bg-secondary/10 text-secondary", to: "/supervisor/notices" },
  ];

  const quickActions = [
    { label: "Mark Attendance", desc: "Record today's student attendance", to: "/supervisor/attendance", icon: <UserCheck className="w-5 h-5 text-success" /> },
    { label: "Handle Complaints", desc: "Review and resolve open complaints", to: "/supervisor/complaints", icon: <MessageSquare className="w-5 h-5 text-error" /> },
    { label: "Log Maintenance", desc: "Report a new maintenance issue", to: "/supervisor/maintenance", icon: <Wrench className="w-5 h-5 text-warning" /> },
    { label: "Post Notice", desc: "Create a notice for students", to: "/supervisor/notices", icon: <Bell className="w-5 h-5 text-primary" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        {data?.hostel_names && data.hostel_names.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.hostel_names.map((name: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-lg border border-primary/20">
                {name}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-heading font-bold text-dark">Supervisor Dashboard</h1>

        </div>
        <p className="text-slate-500">Monitor students, complaints, attendance, and maintenance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[180px]"
          >
            {/* Top Content */}
            <div>

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color} group-hover:scale-105 transition-transform duration-300`}
              >
                {s.icon}
              </div>

              {/* Heading */}
              <h3 className=" font-semibold text-slate-700 leading-snug">
                {s.label}
              </h3>

              {/* Value */}
              <p className="mt-3 text-4xl font-bold text-slate-900 leading-none">
                {isLoading ? (
                  <span className="skeleton inline-block w-12 h-7 rounded-md" />
                ) : (
                  s.value
                )}
              </p>
            </div>

            {/* Bottom */}
            <div className="pt-4 flex items-center text-sm font-semibold text-primary">
              <span>View Details</span>

              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-bold text-dark mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {a.icon}
              </div>
              <h3 className="font-bold text-dark group-hover:text-primary transition-colors">{a.label}</h3>
              <p className="mt-1 text-sm text-slate-500">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
