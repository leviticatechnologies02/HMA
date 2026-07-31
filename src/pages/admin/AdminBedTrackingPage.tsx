import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAdminBedTracking } from "../../hooks/useAdminData";
import { Bed, AlertTriangle, CheckCircle, X, Phone, User, CheckSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";

function MetricCard({ title, count, colorClass, icon }: any) {
  return (
    <div className={`p-4 rounded-xl border ${colorClass} bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider opacity-70 mb-1">{title}</p>
        <p className="text-2xl font-bold">{count}</p>
      </div>
      <div className="p-3 rounded-full bg-current opacity-20">
        {icon}
      </div>
    </div>
  );
}

function getBedColor(status: string) {
  switch (status) {
    case "vacant":
      return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    case "occupied":
      return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    case "maintenance":
      return "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  }
}

export function AdminBedTrackingPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId);
  const navigate = useNavigate();

  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(
    activeHostelId ?? hostelIds[0] ?? null
  );

  useEffect(() => {
    if (activeHostelId && activeHostelId !== selectedHostelId) {
      setSelectedHostelId(activeHostelId);
    }
  }, [activeHostelId, selectedHostelId]);

  const [filter, setFilter] = useState<'ALL' | 'vacant' | 'occupied' | 'maintenance'>('ALL');
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);

  const { data, isLoading, isError, refetch } = useAdminBedTracking(userId, hostelIds, selectedHostelId);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState message="Failed to load bed tracking data" onRetry={refetch} />;
  if (!data) return <div className="p-6 text-center text-slate-500">No data available.</div>;

  const { total_beds, occupied, vacant, maintenance } = data.stats;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white">Bed Tracking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track bed allocations for {data.hostel_name}</p>
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Beds" count={total_beds} colorClass="border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200" icon={<Bed className="w-5 h-5 text-slate-500" />} />
        <MetricCard title="Occupied" count={occupied} colorClass="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400" icon={<User className="w-5 h-5 text-blue-500" />} />
        <MetricCard title="Vacant" count={vacant} colorClass="border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" icon={<CheckCircle className="w-5 h-5 text-green-500" />} />
        <MetricCard title="Maintenance" count={maintenance} colorClass="border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400" icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} />
      </div>


      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {['ALL', 'vacant', 'occupied', 'maintenance'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors whitespace-nowrap ${filter === f
                  ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {data.rooms.map((room) => {
          const filteredBeds = room.beds.filter(bed => filter === 'ALL' || bed.status === filter);
          if (filter !== 'ALL' && filteredBeds.length === 0) return null;

          return (
            <div key={room.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-dark dark:text-white flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" /> {room.room_number}
                </h3>
                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full capitalize">
                  {room.room_type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredBeds.map(bed => (
                  <button
                    key={bed.id}
                    onClick={() => {
                      if (bed.status === 'vacant') {
                        navigate(`/admin/students?action=add&room_id=${room.id}&bed_id=${bed.id}`);
                      } else if (bed.status === 'occupied' && bed.student) {
                        setSelectedTenant({ ...bed.student, room_number: room.room_number, bed_number: bed.bed_number });
                      }
                    }}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-transform active:scale-95 ${getBedColor(bed.status)} ${bed.status === 'vacant' || bed.status === 'occupied' ? 'hover:shadow-sm cursor-pointer' : 'cursor-default opacity-80'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold">{bed.bed_number}</span>
                      {bed.status === 'vacant' && <CheckSquare className="w-4 h-4 opacity-50" />}
                      {bed.status === 'occupied' && <User className="w-4 h-4 opacity-50" />}
                      {bed.status === 'maintenance' && <AlertTriangle className="w-4 h-4 opacity-50" />}
                    </div>
                    {bed.status === 'occupied' && bed.student ? (
                      <div className="text-xs truncate w-full opacity-90 font-medium">
                        {bed.student.full_name}
                      </div>
                    ) : (
                      <div className="text-xs capitalize opacity-80">
                        {bed.status}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {filteredBeds.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-sm italic">
                  No beds match the filter
                </div>
              )}
            </div>
          );
        })}
      </div>


      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm h-full shadow-2xl animate-in slide-in-from-right flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-lg text-dark dark:text-white">Tenant Details</h2>
              <button onClick={() => setSelectedTenant(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl uppercase">
                  {selectedTenant.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-dark dark:text-white">{selectedTenant.full_name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Phone className="w-3.5 h-3.5" /> {selectedTenant.phone}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-sm text-slate-500">Room</span>
                  <span className="text-sm font-semibold">{selectedTenant.room_number}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-sm text-slate-500">Bed</span>
                  <span className="text-sm font-semibold">{selectedTenant.bed_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Student ID</span>
                  <span className="text-sm font-semibold">{selectedTenant.student_id}</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Link
                  to={`/admin/students`}
                  className="flex-1 btn-primary justify-center text-sm flex items-center"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
