import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Search, LogIn, UserPlus, BookOpen, LogOut, ChevronDown, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useLogout } from "../hooks/useAuth";
import { useUIStore } from "../store/uiStore";

function _DarkToggle() {
    const theme = useUIStore((s) => s.theme);
    const setTheme = useUIStore((s) => s.setTheme);

    const tooltipText = theme === "dark" ? "Light Mode" : "Dark Mode";

    return (
        <div className="relative group">
            <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center min-h-10 sm:min-h-9 min-w-10 sm:min-w-9"
                aria-label={tooltipText}
            >
                {theme === "dark"
                    ? <Sun className="w-4 h-4 text-accent" />
                    : <Moon className="w-4 h-4 text-slate-500" />}
            </button>
            <div className="absolute top-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap dark:bg-white dark:text-slate-900">
                {tooltipText}
            </div>
        </div>
    );
}

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    const userId = useAuthStore((s) => s.userId);
    const role = useAuthStore((s) => s.role);
    const logoutMutation = useLogout();

    const theme = useUIStore((s) => s.theme);
    const setTheme = useUIStore((s) => s.setTheme);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const dashboardPath =
        role === "super_admin"
            ? "/super-admin/dashboard"
            : role === "hostel_admin"
                ? "/admin/dashboard"
                : role === "supervisor"
                    ? "/supervisor/dashboard"
                    : role === "student"
                        ? "/student/dashboard" : "/my-bookings"

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "glass shadow-lg shadow-black/5 py-3 dark:bg-[#0D0D1A]/80 dark:shadow-black/10"
                : "bg-transparent py-5"
                }`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Home className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-heading font-bold text-dark dark:text-[#E2E8F0]">
                        Hostel<span className="text-primary">Hub</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    <NavLink to="/" label="Home" current={location.pathname === "/"} />
                    <NavLink to="/hostels" label="Find Hostels" current={location.pathname.startsWith("/hostels") && !location.pathname.includes("/map")} />
                    <NavLink to="/calculator" label="Rent Calculator" current={location.pathname === "/calculator"} />
                    <NavLink to="/aboutus" label="About Us" current={location.pathname === "/aboutus"} />
                    <NavLink to="/contact" label="Contact" current={location.pathname === "/contact"} />
                </nav>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center gap-3">
                    <_DarkToggle />
                    {userId ? (
                        <>
                            <Link
                                to={dashboardPath}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-dark hover:text-primary transition-colors dark:text-[#E2E8F0] dark:hover:text-primary"
                            >
                                Dashboard
                                <ChevronDown className="w-4 h-4" />
                            </Link>
                            {/* Show My Profile + My Bookings for visitor role */}
                            {role === "visitor" && (
                                <>
                                    <Link to="/profile" className="px-4 py-2 text-sm font-medium text-dark hover:text-primary transition-colors dark:text-[#E2E8F0] dark:hover:text-primary">
                                        My Profile
                                    </Link>
                                    <Link to="/my-bookings" className="px-4 py-2 text-sm font-medium text-dark hover:text-primary transition-colors dark:text-[#E2E8F0] dark:hover:text-primary">
                                        My Bookings
                                    </Link>
                                </>
                            )}
                            <button
                                onClick={() => logoutMutation.mutate()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-error transition-colors dark:text-[#B0B8C8] dark:hover:text-error"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-dark hover:text-primary transition-colors dark:text-[#E2E8F0] dark:hover:text-primary"
                            >
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="btn-primary flex items-center gap-2 text-sm"
                            >
                                <UserPlus className="w-4 h-4" />
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors dark:text-[#E2E8F0]"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileOpen && (
                <div className="md:hidden glass border-t border-white/20 animate-slide-up dark:bg-[#0D0D1A]/80 dark:border-white/10">
                    <div className="px-4 py-4 space-y-1">
                        <MobileNavLink to="/" label="Home" icon={<Home className="w-4 h-4" />} />
                        <MobileNavLink to="/hostels" label="Find Hostels" icon={<Search className="w-4 h-4" />} />
                        <MobileNavLink to="/calculator" label="Rent Calculator" icon={<span className="w-4 h-4 text-center text-xs font-bold">₹</span>} />
                        <MobileNavLink to="/aboutus" label="About Us" icon={<span className="w-4 h-4 text-center text-xs font-bold">ℹ</span>} />
                        <MobileNavLink to="/contact" label="Contact" icon={<span className="w-4 h-4 text-center text-xs font-bold">✉</span>} />
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-dark hover:bg-slate-100 hover:text-primary rounded-xl transition-colors dark:text-[#E2E8F0] dark:hover:bg-white/5 dark:hover:text-primary"
                            aria-label="Toggle dark mode"
                        >
                            {theme === "dark"
                                ? <Sun className="w-4 h-4 text-accent" />
                                : <Moon className="w-4 h-4 text-slate-500" />}
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </button>
                        {userId ? (
                            <>
                                <MobileNavLink to={dashboardPath} label="Dashboard" icon={<BookOpen className="w-4 h-4" />} />
                                <button
                                    onClick={() => logoutMutation.mutate()}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error/5 rounded-xl transition-colors dark:hover:bg-error/10"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <MobileNavLink to="/login" label="Login" icon={<LogIn className="w-4 h-4" />} />
                                <Link
                                    to="/register"
                                    className="block w-full text-center btn-primary mt-2"
                                >
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

function NavLink({ to, label, current }: { to: string; label: string; current: boolean }) {
    return (
        <Link
            to={to}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${current
                ? "bg-primary/10 text-primary dark:bg-primary/20"
                : "text-dark hover:bg-slate-100 hover:text-primary dark:text-[#E2E8F0] dark:hover:bg-white/5 dark:hover:text-primary"
                }`}
        >
            {label}
        </Link>
    );
}

function MobileNavLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-dark hover:bg-primary/5 hover:text-primary rounded-xl transition-colors dark:text-[#E2E8F0] dark:hover:bg-primary/10 dark:hover:text-primary"
        >
            {icon}
            {label}
        </Link>
    );
}
