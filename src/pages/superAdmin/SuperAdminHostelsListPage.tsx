import React from "react";
import { useSuperAdminHostels } from "../../hooks/useSuperAdminData";
import { useAuthStore } from "../../store/authStore";
import { Building2, Mail, Phone, User } from "lucide-react";

export function SuperAdminHostelsListPage() {
  const userId = useAuthStore((state) => state.userId);
  const { data, isLoading, isError } = useSuperAdminHostels(userId);

  const items = data || [];

  if (!userId) {
    return <div className="p-8 text-slate-500">Please login as a super admin.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark">Hostels List</h1>
        <p className="text-slate-600">View all hostels and their assigned admins.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading && <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>}
        {isError && <div className="p-8 text-center text-error">Failed to load data.</div>}
        
        {!isLoading && !isError && items.length === 0 && (
          <div className="p-8 text-center text-slate-500">No data found.</div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">Admin Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Contact Details</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Hostel Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any, i: number) => {
                  // Fallbacks for various possible field names
                  const adminName = item.hostel_admin_name || "—";
                  const adminEmail = item.hostel_admin_email || "—";
                  const phone = item.hostel_admin_phone || "—";
                  const hostelName = item.name || "—";

                  return (
                    <tr key={item.id || i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-dark text-base">{adminName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{adminEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 inline-flex">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          {hostelName}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
