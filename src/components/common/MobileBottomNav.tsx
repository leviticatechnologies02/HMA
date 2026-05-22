import { Link, useLocation } from "react-router-dom";
import { Home, Search, BookOpen, User } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const TABS = [
  { label: "Home",     href: "/",         icon: Home },
  { label: "Search",   href: "/hostels",  icon: Search },
  { label: "Bookings", href: "/my-bookings", icon: BookOpen },
  { label: "Profile",  href: "/login",    icon: User },
];

export function MobileBottomNav() {
  const location = useLocation();
  const userId = useAuthStore((s) => s.userId);
  const role = useAuthStore((s) => s.role);

  const profileHref = userId
    ? role === "student" ? "/student/profile"
    : role === "hostel_admin" ? "/admin/dashboard"
    : role === "supervisor" ? "/supervisor/dashboard"
    : role === "super_admin" ? "/super-admin/dashboard"
    : "/my-bookings"
    : "/login";

  const tabs = TABS.map(t => t.label === "Profile" ? { ...t, href: profileHref } : t);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-white/20 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = location.pathname === href || (href !== "/" && location.pathname.startsWith(href));
          return (
            <Link key={label} to={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 min-w-[60px] ${active ? "text-primary" : "text-slate-500"}`}>
              <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-semibold transition-all duration-200 ${active ? "opacity-100" : "opacity-70"}`}>{label}</span>
              {active && <span className="w-1 h-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}