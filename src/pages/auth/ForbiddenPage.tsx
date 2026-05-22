import { Link } from "react-router-dom";
import { ShieldX, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function ForbiddenPage() {
  const role = useAuthStore((s) => s.role);
  const dashboardPath = role === "super_admin" ? "/super-admin/dashboard"
    : role === "hostel_admin" ? "/admin/dashboard"
    : role === "supervisor" ? "/supervisor/dashboard"
    : role === "student" ? "/student/dashboard"
    : "/hostels";

  return (
    <div className="min-h-screen bg-neutral flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-error" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-dark mb-2">403</h1>
        <h2 className="text-xl font-semibold text-dark mb-3">Access Denied</h2>
        <p className="text-slate-500 mb-8">
          You don't have permission to access this page. This area is restricted to authorized users only.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={dashboardPath} className="btn-primary flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go to Dashboard
          </Link>
          <Link to="/" className="btn-outline flex items-center justify-center gap-2">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
