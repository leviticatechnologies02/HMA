import { User, Mail, Phone, CheckCircle, Clock } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useSupervisorProfile } from "../../hooks/useSupervisorData";
import { formatDate } from "../../utils/formatters";

export function SupervisorSettingsPage() {
  const userId = useAuthStore((state) => state.userId);

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError,
  } = useSupervisorProfile(userId);

  // Loading state
  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 font-medium">
          Failed to load profile. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          
            <User className="w-10 h-10 text-primary" />
        
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark">
            {profile.full_name}
          </h1>

          <p className="text-sm text-slate-500 mt-1 capitalize">
            {profile.role}
          </p>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="badge badge-primary capitalize text-xs">
              Supervisor
            </span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-slate-400 uppercase">
              Email
            </p>
          </div>

          <p className="font-medium text-sm text-dark break-all">
            {profile.email}
          </p>

          <div className="flex items-center gap-1.5 mt-2">
            {profile.is_email_verified ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                <p className="text-xs text-success">Verified</p>
              </>
            ) : (
              <p className="text-xs text-warning">
                Pending verification
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-secondary" />
            <p className="text-xs font-semibold text-slate-400 uppercase">
              Phone
            </p>
          </div>

          <p className="font-medium text-sm text-dark">
            {profile.phone}
          </p>

          <div className="flex items-center gap-1.5 mt-2">
            {profile.is_phone_verified ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                <p className="text-xs text-success">Verified</p>
              </>
            ) : (
              <p className="text-xs text-warning">
                Pending verification
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-slate-400 uppercase">
              Created At
            </p>
          </div>

          <p className="font-medium text-sm text-dark">
            {profile.created_at
              ? formatDate(profile.created_at)
              : "N/A"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-slate-400 uppercase">
              Last Updated
            </p>
          </div>

          <p className="font-medium text-sm text-dark">
            {profile.updated_at
              ? formatDate(profile.updated_at)
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 p-5">
        <h2 className="font-bold text-base text-dark mb-3">
          Profile Summary
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase">Role</p>
            <p className="font-semibold text-sm text-primary capitalize mt-1">
              {profile.role}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase">
              Email Status
            </p>

            <p className="font-semibold text-sm mt-1">
              {profile.is_email_verified ? (
                <span className="text-success">✓ Verified</span>
              ) : (
                <span className="text-warning">Pending</span>
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase">
              Phone Status
            </p>

            <p className="font-semibold text-sm mt-1">
              {profile.is_phone_verified ? (
                <span className="text-success">✓ Verified</span>
              ) : (
                <span className="text-warning">Pending</span>
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase">
              Account Type
            </p>

            <p className="font-semibold text-sm text-primary mt-1">
              Supervisor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}