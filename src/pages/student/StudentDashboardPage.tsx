import { Link } from "react-router-dom";
import { BookOpen, CreditCard, MessageSquare, UserCheck, Bell, UtensilsCrossed, ArrowRight, User, ListOrdered } from "lucide-react";
import {
  useStudentBookings,
  useStudentComplaints,
  useStudentAttendance,
  useStudentNotices,
  useStudentPayments,
  useStudentWaitlist,
} from "../../hooks/useStudentComplaints";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../utils/formatters";

export function StudentDashboardPage() {
  const userId = useAuthStore((s) => s.userId);
  const bookingsQ = useStudentBookings(userId);
  const complaintsQ = useStudentComplaints(userId);
  const attendanceQ = useStudentAttendance(userId);
  const noticesQ = useStudentNotices(userId);
  const paymentsQ = useStudentPayments(userId);
  const waitlistQ = useStudentWaitlist(userId);

  // Compute next rent due date from active booking
  const activeBooking = bookingsQ.data?.find((b: any) => b.status === "checked_in" || b.status === "approved");
  const rentDueDate = activeBooking?.check_out_date
    ? formatDate(activeBooking.check_out_date)
    : null;
  const pendingPayment = paymentsQ.data?.find((p: any) => p.status === "created" || p.status === "pending");

  const stats = [
    { label: "Bookings", value: bookingsQ.data?.length ?? 0, icon: <BookOpen className="w-5 h-5" />, color: "bg-primary/10 text-primary", to: "/student/bookings" },
    { label: "Payments", value: paymentsQ.data?.length ?? 0, icon: <CreditCard className="w-5 h-5" />, color: "bg-success/10 text-success", to: "/student/payments" },
    { label: "Complaints", value: complaintsQ.data?.length ?? 0, icon: <MessageSquare className="w-5 h-5" />, color: "bg-error/10 text-error", to: "/student/complaints" },
    { label: "Attendance", value: attendanceQ.data?.length ?? 0, icon: <UserCheck className="w-5 h-5" />, color: "bg-secondary/10 text-secondary", to: "/student/attendance" },
    { label: "Waitlist", value: waitlistQ.data?.length ?? 0, icon: <ListOrdered className="w-5 h-5" />, color: "bg-accent/20 text-dark", to: "/student/waitlist" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark">My Dashboard</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">Track your bookings, payments, and hostel activity.</p>
        </div>
        <Link to="/student/profile" className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-dark hover:border-primary hover:text-primary transition-all w-full sm:w-auto">
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </Link>
      </div>

      {/* Rent due alert */}
      {(rentDueDate || pendingPayment) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-warning/10 border border-warning/20 rounded-2xl p-3 sm:p-4">
          <CreditCard className="w-5 h-5 text-warning shrink-0" />
          <div className="flex-1 min-w-0">
            {pendingPayment && (
              <p className="font-medium text-dark text-xs sm:text-sm">Payment pending: <span className="text-primary font-bold">₹{Number(pendingPayment.amount).toLocaleString()}</span></p>
            )}
            {rentDueDate && <p className="text-xs sm:text-sm text-slate-500">Booking ends: {rentDueDate}</p>}
          </div>
          <Link to="/student/payments" className="btn-primary text-xs sm:text-sm shrink-0 w-full sm:w-auto text-center">View Payments</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="stat-card group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-2 text-3xl font-heading font-bold text-dark">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
              View <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-dark">Recent Bookings</h2>
            <Link to="/student/bookings" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {bookingsQ.data?.length ? (
              bookingsQ.data.slice(0, 3).map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="font-medium text-dark text-sm">{b.booking_number}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{b.check_in_date} → {b.check_out_date}</p>
                  </div>
                  <span className="badge badge-secondary capitalize text-xs">{b.status}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No bookings yet.</p>
                <Link to="/hostels" className="mt-3 inline-block text-sm text-primary font-medium hover:underline">
                  Browse Hostels
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-dark">My Complaints</h2>
            <Link to="/student/complaints" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {complaintsQ.data?.length ? (
              complaintsQ.data.slice(0, 3).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="font-medium text-dark text-sm">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{c.category}</p>
                  </div>
                  <span className="badge badge-warning capitalize text-xs">{c.status}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No complaints filed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-dark">Notices</h2>
            <Link to="/student/notices" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4">
            {noticesQ.data?.length ? (
              <div className="space-y-3">
                {noticesQ.data.slice(0, 3).map((n: any) => (
                  <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <Bell className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-dark text-sm">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.notice_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No notices yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-bold text-dark mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Mess Menu", to: "/student/mess-menu", icon: <UtensilsCrossed className="w-5 h-5 text-secondary" /> },
              { label: "Attendance", to: "/student/attendance", icon: <UserCheck className="w-5 h-5 text-success" /> },
              { label: "Payments", to: "/student/payments", icon: <CreditCard className="w-5 h-5 text-primary" /> },
              { label: "Profile", to: "/student/profile", icon: <User className="w-5 h-5 text-slate-600" /> },
            ].map((l) => (
              <Link key={l.label} to={l.to} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-primary/5 hover:text-primary transition-all group">
                {l.icon}
                <span className="text-sm font-medium text-dark group-hover:text-primary transition-colors">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
