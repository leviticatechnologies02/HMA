import { Building2, MapPin, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminMyHostels } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import { useHostelSwitcher } from "../../components/admin/useHostelSwitcher";



const STATUS_BADGE: Record<string, string> = {
  active: "badge-success",
  pending_approval: "badge-warning",
  inactive: "badge-slate",
  suspended: "badge-error",
  rejected: "badge-error",
};

export function AdminMyHostelsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const { data, isLoading, isError } = useAdminMyHostels(userId, hostelIds)
  const { setActiveHostelId } = useHostelSwitcher()
  const navigate = useNavigate()

  if (!userId || !hostelIds.length) return <div className="p-8 text-slate-500">Login as admin with assigned hostels.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark">My Hostels</h1>
        <p className="mt-1 text-slate-500">Hostels assigned to your admin account.</p>
      </div>

      {isLoading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>}
      {isError && <div className="p-8 text-center text-error">Failed to load hostels.</div>}

      {!isLoading && !isError && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No hostels assigned yet.</p>
            </div>
          )}
          {(data ?? []).map((h: any) => (
            <div key={h.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden card-hover">
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 flex items-center justify-center">
                {h.images?.[0]?.url ? (
                  <img
                    src={h.images[0].url}
                    alt={h.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-primary/30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-bold text-dark">{h.name}</h3>
                  <span className={`badge ${STATUS_BADGE[h.status] ?? "badge-slate"} capitalize text-xs shrink-0`}>
                    {h.status?.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {h.city}, {h.state}
                </div>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{h.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => {console.log("Setting active hostel to:", h.id);
                    setActiveHostelId(h.id)
                    navigate("/admin/hostel-profile")
                  }} className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
                    Manage <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
