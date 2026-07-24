import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Building2, Users, BookOpen, CreditCard, MessageSquare,
  ClipboardList, Wrench, Bell, UtensilsCrossed, UserCheck,
  LayoutDashboard, ChevronLeft, ChevronRight, LogOut, Menu,
  ShieldCheck, Star, ListOrdered, Sun, Moon, BarChart2, ChevronDown
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useLogout } from "../hooks/useAuth";
import { useUIStore } from "../store/uiStore";
import { useAdminMyHostels } from "../hooks/useAdminData";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { HostelSwitcher } from "../components/admin/HostelSwitcher";

type NavItem = { label: string; to: string; icon: React.ReactNode };

const SUPER_ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", to: "/super-admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Hostels", to: "/super-admin/hostels", icon: <Building2 className="w-4 h-4" /> },
  { label: "Hostels List", to: "/super-admin/hostels-list", icon: <ListOrdered className="w-4 h-4" /> },
  { label: "Admins", to: "/super-admin/admins", icon: <Users className="w-4 h-4" /> },
  { label: "Plans", to: "/super-admin/plans", icon: <BookOpen className="w-4 h-4" /> },
  { label: "Subscriptions", to: "/super-admin/subscriptions", icon: <Star className="w-4 h-4" /> },
  { label: "Payments", to: "/super-admin/payments", icon: <CreditCard className="w-4 h-4" /> },
  { label: "Reports", to: "/super-admin/reports", icon: <BarChart2 className="w-4 h-4" /> },
  { label: "Settings", to: "/super-admin/settings", icon: <ShieldCheck className="w-4 h-4" /> },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "My Hostels", to: "/admin/my-hostels", icon: <Building2 className="w-4 h-4" /> },
  { label: "Inventory", to: "/admin/inventory", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "Bookings", to: "/admin/bookings", icon: <BookOpen className="w-4 h-4" /> },
  // { label: "Students", to: "/admin/students", icon: <Users className="w-4 h-4" /> },
  { label: "Payments", to: "/admin/payments", icon: <CreditCard className="w-4 h-4" /> },
  { label: "Complaints", to: "/admin/complaints", icon: <MessageSquare className="w-4 h-4" /> },
  // { label: "Attendance", to: "/admin/attendance", icon: <UserCheck className="w-4 h-4" /> },
  { label: "Maintenance", to: "/admin/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Notices", to: "/admin/notices", icon: <Bell className="w-4 h-4" /> },
  { label: "Mess Menu", to: "/admin/mess-menu", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { label: "Supervisors", to: "/admin/supervisors", icon: <ShieldCheck className="w-4 h-4" /> },
  { label: "Reports", to: "/admin/reports", icon: <BarChart2 className="w-4 h-4" /> },
  { label: "Settings", to: "/admin/settings", icon: <ShieldCheck className="w-4 h-4" /> },
];

const SUPERVISOR_NAV: NavItem[] = [
  { label: "Dashboard", to: "/supervisor/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Students", to: "/supervisor/students", icon: <Users className="w-4 h-4" /> },
  { label: "Complaints", to: "/supervisor/complaints", icon: <MessageSquare className="w-4 h-4" /> },
  // { label: "Attendance", to: "/supervisor/attendance", icon: <UserCheck className="w-4 h-4" /> },
  { label: "Maintenance", to: "/supervisor/maintenance", icon: <Wrench className="w-4 h-4" /> },
  { label: "Notices", to: "/supervisor/notices", icon: <Bell className="w-4 h-4" /> },
  { label: "Mess Menu", to: "/supervisor/mess-menu", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { label: "Settings", to: "/supervisor/settings", icon: <ShieldCheck className="w-4 h-4" /> },
];

const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", to: "/student/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Profile", to: "/student/profile", icon: <Users className="w-4 h-4" /> },
  { label: "Bookings", to: "/student/bookings", icon: <BookOpen className="w-4 h-4" /> },
  { label: "Payments", to: "/student/payments", icon: <CreditCard className="w-4 h-4" /> },
  { label: "Complaints", to: "/student/complaints", icon: <MessageSquare className="w-4 h-4" /> },
  // { label: "Attendance", to: "/student/attendance", icon: <UserCheck className="w-4 h-4" /> },
  { label: "Notices", to: "/student/notices", icon: <Bell className="w-4 h-4" /> },
  { label: "Mess Menu", to: "/student/mess-menu", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { label: "Waitlist", to: "/student/waitlist", icon: <ListOrdered className="w-4 h-4" /> },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  hostel_admin: "Hostel Admin",
  supervisor: "Supervisor",
  student: "Student",
};

function getNav(role: string | null): NavItem[] {
  if (role === "super_admin") return SUPER_ADMIN_NAV;
  if (role === "hostel_admin") return ADMIN_NAV;
  if (role === "supervisor") return SUPERVISOR_NAV;
  return STUDENT_NAV;
}

// ── Hostel Switcher for multi-hostel admins ───────────────────────────────
// export function HostelSwitcher({ userId, hostelIds }: { userId: string | null; hostelIds: string[] }) {
//   const [open, setOpen] = useState(false);
//   const hostelsQ = useAdminMyHostels(userId, hostelIds);
//   const hostels = hostelsQ.data ?? [];
//   const activeHostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? "";
//   const setActiveHostelId = useAuthStore((s) => s.setActiveHostelId);
//   const active = hostels.find(h => h.id === activeHostelId);

//   if (hostels.length <= 1) return null;

//   return (
//     <div className="relative">
//       <button onClick={() => setOpen(!open)}
//         className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-dark dark:text-slate-200 hover:border-primary/40 dark:hover:border-primary/60 transition-all">
//         <Building2 className="w-3.5 h-3.5 text-primary" />
//         <span className="max-w-32 truncate">{active?.name ?? "Select Hostel"}</span>
//         <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
//       </button>
//       {open && (
//         <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-2xl z-50 min-w-48 overflow-hidden">
//           <p className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-700">Switch Hostel</p>
//           {hostels.map(h => (
//             <button key={h.id} onClick={() => { setActiveHostelId(h.id); setOpen(false); }}
//               className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${h.id === activeHostelId ? "text-primary font-semibold dark:text-primary" : "text-dark dark:text-slate-300"}`}>
//               <Building2 className="w-3.5 h-3.5 shrink-0" />
//               <div className="min-w-0">
//                 <p className="truncate">{h.name}</p>
//                 <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{h.city}</p>
//               </div>
//               {h.id === activeHostelId && <span className="ml-auto w-2 h-2 rounded-full bg-primary shrink-0" />}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  useScrollToTop();
  const role = useAuthStore((s) => s.role);
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const logoutMutation = useLogout();
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!accessToken || !userId) {
      navigate("/login", { replace: true });
    }
  }, [accessToken, userId, navigate]);

  // If visitor navigates to /student/* routes, refresh token to pick up promoted role
  useEffect(() => {
    if (role === "visitor" && location.pathname.startsWith("/student")) {
      import("../api/auth.api").then(({ refreshToken }) => {
        refreshToken()
          .then((data) => setUser(data.user_id, data.role, data.access_token, data.hostel_ids))
          .catch(() => { });
      });
    }
  }, [location.pathname, role, setUser]);

  const nav = getNav(role);
  const currentNavLabel = nav.find((n) => n.to === location.pathname)?.label ?? "Dashboard";

  useEffect(() => {
    document.title = `${currentNavLabel} | Levitica Nestora`;
  }, [currentNavLabel]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`flex flex-col bg-dark text-white transition-all duration-300 ${mobile ? "w-72" : collapsed ? "w-16" : "w-64"
        } h-screen overflow-hidden`}
    >

      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed && !mobile ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Home className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <span className="text-lg font-heading font-bold">
            Stay<span className="text-primary">Ease</span>
          </span>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4 text-slate-400" />
              : <ChevronLeft className="w-4 h-4 text-slate-400" />
            }
          </button>
        )}
      </div>


      {(!collapsed || mobile) && (
        <div className="px-4 py-3 border-b border-white/10">
          <span className="badge badge-primary text-xs">
            {ROLE_LABELS[role ?? ""] ?? "User"}
          </span>
        </div>
      )}


      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {nav.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              title={collapsed && !mobile ? item.label : undefined}
              className={`nav-item ${active ? "active" : ""} ${collapsed && !mobile ? "justify-center px-2" : ""}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>


      <div className="px-2 py-4 border-t border-white/10 space-y-1">
        <Link
          to="/"
          className={`nav-item ${collapsed && !mobile ? "justify-center px-2" : ""}`}
        >
          <Home className="w-4 h-4 shrink-0" />
          {(!collapsed || mobile) && <span>Back to Site</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`nav-item w-full text-left hover:text-error hover:bg-error/10 ${collapsed && !mobile ? "justify-center px-2" : ""}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="flex h-screen bg-neutral">

        <div className="hidden md:flex shrink-0">
          <Sidebar />
        </div>


        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="relative z-10 animate-fade-in-left">
              <Sidebar mobile />
            </div>
          </div>
        )}


        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
            <button
              className="md:hidden p-1.5 sm:p-2 -ml-1.5 sm:-ml-0 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>


            <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
              <p className="text-sm font-medium text-dark capitalize truncate hidden sm:block">
                {currentNavLabel}
              </p>

              {role === "hostel_admin" && (
                <div className="shrink-0 min-w-0">
                  <HostelSwitcher />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === "dark"
                  ? <Sun className="w-4 h-4 text-accent" />
                  : <Moon className="w-4 h-4 text-slate-500" />}
              </button>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {ROLE_LABELS[role ?? ""]?.[0] ?? "U"}
                </span>
              </div>
            </div>
          </header>


          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
