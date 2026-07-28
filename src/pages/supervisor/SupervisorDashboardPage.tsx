import {
  Users,
  MessageSquare,
  UserCheck,
  Wrench,
  Bell,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSupervisorDashboard } from "../../hooks/useSupervisorDashboard";
import { useAuthStore } from "../../store/authStore";

export function SupervisorDashboardPage() {
  const userId = useAuthStore((s) => s.userId);
  const { data, isLoading } = useSupervisorDashboard(userId);

  const stats = [
    {
      label: "Students",
      value: data?.students ?? 0,
      icon: <Users className="w-5 h-5" />,
      color: "bg-primary/10 text-primary",
      to: "/supervisor/students",
    },
    {
      label: "Open Complaints",
      value: data?.complaints ?? 0,
      icon: <MessageSquare className="w-5 h-5" />,
      color: "bg-error/10 text-error",
      to: "/supervisor/complaints",
    },
    // { label: "Attendance Today", value: data?.attendance_records ?? 0, icon: <UserCheck className="w-5 h-5" />, color: "bg-success/10 text-success", to: "/supervisor/attendance" },
    {
      label: "Maintenance",
      value: data?.maintenance_requests ?? 0,
      icon: <Wrench className="w-5 h-5" />,
      color: "bg-warning/10 text-warning",
      to: "/supervisor/maintenance",
    },
    {
      label: "Notices",
      value: data?.notices ?? 0,
      icon: <Bell className="w-5 h-5" />,
      color: "bg-secondary/10 text-secondary",
      to: "/supervisor/notices",
    },
  ];

  const quickActions = [
    {
      label: "Mark Attendance",
      desc: "Record today's student attendance",
      to: "/supervisor/attendance",
      icon: <UserCheck className="w-5 h-5 text-success" />,
    },
    {
      label: "Handle Complaints",
      desc: "Review and resolve open complaints",
      to: "/supervisor/complaints",
      icon: <MessageSquare className="w-5 h-5 text-error" />,
    },
    {
      label: "Log Maintenance",
      desc: "Report a new maintenance issue",
      to: "/supervisor/maintenance",
      icon: <Wrench className="w-5 h-5 text-warning" />,
    },
    {
      label: "Post Notice",
      desc: "Create a notice for students",
      to: "/supervisor/notices",
      icon: <Bell className="w-5 h-5 text-primary" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-900 px-8 py-8">
        {/* Background circles */}
        <div className="absolute -right-24 -top-20 w-96 h-96 rounded-full border border-white/10"></div>

        <div className="absolute right-24 top-8 w-72 h-72 rounded-full border border-white/10"></div>

        <div className="relative flex flex-col lg:flex-row items-center justify-between">
          {/* Left */}
          <div>
            <h1 className="text-4xl font-bold text-white">
              Welcome back, {data?.supervisor_name ?? "Supervisor"}
            </h1>

            <p className="mt-3 text-cyan-100 text-lg">
              Monitor students, complaints, attendance and maintenance
              {data?.hostel_names?.length ? (
                <>
                  {" "}
                  for{" "}
                  <span className="font-semibold text-white">
                    {data.hostel_names.join(", ")}
                  </span>
                </>
              ) : null}
              .
            </p>

            <Link
              to="/supervisor/students"
              className="inline-flex items-center mt-8 rounded-xl bg-white px-6 py-3 font-semibold text-cyan-700 shadow hover:bg-cyan-100 transition"
            >
              View Students
            </Link>
          </div>

          {/* Right Hostel SVG */}
          <div className="hidden lg:flex">
            <svg width="300" height="180" viewBox="0 0 300 180">
              <rect
                x="95"
                y="35"
                width="110"
                height="110"
                rx="6"
                fill="#ffffff"
              />

              <polygon points="150,8 95,35 205,35" fill="#D6E4F0" />

              <rect x="135" y="95" width="30" height="50" fill="#94A3B8" />

              <rect x="108" y="52" width="18" height="18" fill="#38BDF8" />
              <rect x="132" y="52" width="18" height="18" fill="#38BDF8" />
              <rect x="156" y="52" width="18" height="18" fill="#38BDF8" />
              <rect x="180" y="52" width="18" height="18" fill="#38BDF8" />

              <rect x="108" y="77" width="18" height="18" fill="#38BDF8" />
              <rect x="132" y="77" width="18" height="18" fill="#38BDF8" />
              <rect x="156" y="77" width="18" height="18" fill="#38BDF8" />
              <rect x="180" y="77" width="18" height="18" fill="#38BDF8" />

              <circle cx="255" cy="125" r="18" fill="#14B8A6" />

              <path
                d="M249 125L254 130L262 118"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle cx="55" cy="128" r="16" fill="#0F766E" />

              <rect x="52" y="104" width="6" height="24" fill="#374151" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[180px]"
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
            <Link
              key={a.label}
              to={a.to}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {a.icon}
              </div>
              <h3 className="font-bold text-dark group-hover:text-primary transition-colors">
                {a.label}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
