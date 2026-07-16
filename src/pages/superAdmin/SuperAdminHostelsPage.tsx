import { useState } from "react";
import { ImagePlus, X, Plus, Settings } from "lucide-react";
import toast from "react-hot-toast";
import {
  useCreateSuperAdminHostel,
  useSuperAdminHostelsPaginated,
  useUpdateSuperAdminHostelStatus,
  useDeleteSuperAdminHostel,
} from "../../hooks/useSuperAdminData";

import { addSuperAdminHostelImages } from "../../api/superAdmin.api";
import { useAuthStore } from "../../store/authStore";
import { HostelManageDrawer } from "../../components/superAdmin/HostelManageDrawer";
import type { SuperAdminHostel } from "../../api/superAdmin.api";
import { email } from "zod";

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  hostel_type: "boys",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  latitude: 0,
  longitude: 0,
  phone: "",
  email:"",
  website: "",
  is_featured: false,
  is_public: true,
  rules_and_regulations: ""
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending_approval: "bg-warning/10 text-warning",
  rejected: "bg-error/10 text-error",
  suspended: "bg-slate-100 text-slate-500",
};

export function SuperAdminHostelsPage() {
  const userId = useAuthStore((state) => state.userId);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rejectingHostelId, setRejectingHostelId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [managingHostel, setManagingHostel] = useState<SuperAdminHostel | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  const hostelsQuery = useSuperAdminHostelsPaginated(userId, { status: statusFilter || undefined, page, per_page: 10 });
  const createMutation = useCreateSuperAdminHostel(userId);
  const statusMutation = useUpdateSuperAdminHostelStatus(userId);
  const deleteMutation = useDeleteSuperAdminHostel(userId);
  const [form, setForm] = useState(defaultForm);

  if (!userId) {
    return <div>Please login as a super admin to manage hostels.</div>;
  }

  // City data: city → { state, lat, lng }
  const CITY_DATA: Record<string, { state: string; lat: number; lng: number }> = {
    "Hyderabad":      { state: "Telangana",       lat: 17.3850, lng: 78.4867 },
    "Bangalore":      { state: "Karnataka",        lat: 12.9716, lng: 77.5946 },
    "Bengaluru":      { state: "Karnataka",        lat: 12.9716, lng: 77.5946 },
    "Mumbai":         { state: "Maharashtra",      lat: 19.0760, lng: 72.8777 },
    "Pune":           { state: "Maharashtra",      lat: 18.5204, lng: 73.8567 },
    "Delhi":          { state: "Delhi",            lat: 28.6139, lng: 77.2090 },
    "New Delhi":      { state: "Delhi",            lat: 28.6139, lng: 77.2090 },
    "Chennai":        { state: "Tamil Nadu",       lat: 13.0827, lng: 80.2707 },
    "Kolkata":        { state: "West Bengal",      lat: 22.5726, lng: 88.3639 },
    "Ahmedabad":      { state: "Gujarat",          lat: 23.0225, lng: 72.5714 },
    "Jaipur":         { state: "Rajasthan",        lat: 26.9124, lng: 75.7873 },
    "Surat":          { state: "Gujarat",          lat: 21.1702, lng: 72.8311 },
    "Lucknow":        { state: "Uttar Pradesh",    lat: 26.8467, lng: 80.9462 },
    "Nagpur":         { state: "Maharashtra",      lat: 21.1458, lng: 79.0882 },
    "Indore":         { state: "Madhya Pradesh",   lat: 22.7196, lng: 75.8577 },
    "Bhopal":         { state: "Madhya Pradesh",   lat: 23.2599, lng: 77.4126 },
    "Visakhapatnam":  { state: "Andhra Pradesh",   lat: 17.6868, lng: 83.2185 },
    "Patna":          { state: "Bihar",            lat: 25.5941, lng: 85.1376 },
    "Vadodara":       { state: "Gujarat",          lat: 22.3072, lng: 73.1812 },
    "Coimbatore":     { state: "Tamil Nadu",       lat: 11.0168, lng: 76.9558 },
    "Kochi":          { state: "Kerala",           lat:  9.9312, lng: 76.2673 },
    "Thiruvananthapuram": { state: "Kerala",       lat:  8.5241, lng: 76.9366 },
    "Chandigarh":     { state: "Chandigarh",       lat: 30.7333, lng: 76.7794 },
    "Guwahati":       { state: "Assam",            lat: 26.1445, lng: 91.7362 },
    "Bhubaneswar":    { state: "Odisha",           lat: 20.2961, lng: 85.8245 },
    "Dehradun":       { state: "Uttarakhand",      lat: 30.3165, lng: 78.0322 },
    "Ranchi":         { state: "Jharkhand",        lat: 23.3441, lng: 85.3096 },
    "Mysuru":         { state: "Karnataka",        lat: 12.2958, lng: 76.6394 },
    "Mysore":         { state: "Karnataka",        lat: 12.2958, lng: 76.6394 },
    "Goa":            { state: "Goa",              lat: 15.2993, lng: 74.1240 },
    "Panaji":         { state: "Goa",              lat: 15.4909, lng: 73.8278 },
  };

  const allCities = Object.keys(CITY_DATA);

  const handleCitySelect = (city: string) => {
    const data = CITY_DATA[city];
    setForm((c) => ({
      ...c,
      city,
      ...(data ? { state: data.state, latitude: data.lat, longitude: data.lng } : {}),
    }));
    setCitySearch(city);
    setShowCitySuggestions(false);
  };

  const handlePincodeChange = async (value: string) => {
    setForm((c) => ({ ...c, pincode: value }));
    setPincodeError(null);
    if (value.length !== 6 || !/^\d{6}$/.test(value)) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const district = po.District;
        const state = po.State;
        // Try to get coordinates from CITY_DATA
        const cityEntry = Object.entries(CITY_DATA).find(
          ([city]) => city.toLowerCase() === district.toLowerCase()
        );
        const coords = cityEntry ? cityEntry[1] : null;
        setCitySearch(district);
        setForm((c) => ({
          ...c,
          city: district,
          state,
          ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
        }));
        setPincodeError(null);
      } else {
        setPincodeError("Pincode not found");
      }
    } catch {
      setPincodeError("Could not fetch pincode data");
    } finally {
      setPincodeLoading(false);
    }
  };

  const filteredCities = citySearch.length >= 1
    ? allCities.filter(c => c.toLowerCase().startsWith(citySearch.toLowerCase())).slice(0, 8)
    : [];

  const handleCreate = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;

    // Client-side validation matching backend schema
    const errors: string[] = [];
    if (form.description.trim().length < 10) errors.push("Description must be at least 10 characters");
  const address = form.address_line1.trim();

if (!address) {
  errors.push("Full address is required");
} else {
  const hasNumber = /\d/.test(address);

  const words = address.match(/[A-Za-z]+/g) || [];

  if (!hasNumber || words.length < 2) {
    errors.push(
      "Enter a valid address like 'Plot 18 Jubilee Hills'"
    );
  }
}
    if (!form.city.trim()) errors.push("City is required");
    if (!form.state.trim()) errors.push("State is required");
    if (form.pincode.trim().length < 3) errors.push("Pincode must be at least 3 characters");
   const phone = form.phone.trim();

if (!/^\d{10}$/.test(phone)) {
  errors.push("Phone number must contain exactly 10 digits");
}
    if (form.email.trim().length < 5 || !form.email.includes("@")) errors.push("Valid email is required");
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    // Clean optional string fields — send undefined instead of empty string
    const payload = {
      ...form,
      address_line2: form.address_line2.trim() || undefined,
      website: form.website.trim() || undefined,
      rules_and_regulations: form.rules_and_regulations.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const hostel = await createMutation.mutateAsync(payload);
      // Upload images if any URLs provided
      const validImages = imageUrls
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url, i) => ({ url, is_primary: i === 0 }));
      if (validImages.length > 0) {
        await addSuperAdminHostelImages(userId, hostel.id, validImages);
      }
      toast.success(`Hostel "${hostel.name}" created${validImages.length ? ` with ${validImages.length} image(s)` : ""}`);
      setForm(defaultForm);
      setImageUrls(["", "", ""]);
    } catch (err: any) {
      // Show the actual backend validation error
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0];
        const field = first?.loc?.slice(-1)[0] ?? "";
        const msg = first?.msg ?? "Validation error";
        toast.error(field ? `${field}: ${msg}` : msg);
      } else if (typeof detail === "string") {
        toast.error(detail);
      } else {
        toast.error("Failed to create hostel. Check all required fields.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark">Super Admin Hostels</h1>
        <p className="text-slate-600">Create hostels and control approval or suspension status.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
        {/* ── Create Form ── */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-xl font-semibold text-dark">Create Hostel</h2>
          <p className="text-xs text-slate-400">Fields marked * are required</p>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hostel Name *</label>
            <input className="input-field" placeholder="e.g. Green Valley Boys Hostel" value={form.name}
              onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Slug * <span className="normal-case font-normal text-slate-400">(URL-friendly ID)</span></label>
            <input className="input-field" placeholder="e.g. green-valley-boys-hostel" value={form.slug}
              onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description * <span className="normal-case font-normal text-slate-400">(min 10 chars)</span></label>
            <textarea className="input-field min-h-20" placeholder="Describe the hostel facilities, location, highlights..." value={form.description}
              onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hostel Type *</label>
            <select className="input-field" value={form.hostel_type}
              onChange={(e) => setForm((c) => ({ ...c, hostel_type: e.target.value }))}>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="co-living">Co-living</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">FULL  Address *</label>
              <input className="input-field" placeholder="Street / Area" value={form.address_line1}
                onChange={(e) => setForm((c) => ({ ...c, address_line1: e.target.value }))} />
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">City *</label>
              <input
                className="input-field"
                placeholder="Type city name..."
                value={citySearch || form.city}
                autoComplete="off"
                onChange={(e) => {
                  setCitySearch(e.target.value);
                  setForm((c) => ({ ...c, city: e.target.value }));
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
              />
              {showCitySuggestions && filteredCities.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {filteredCities.map((city) => (
                    <li key={city}
                      className="px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/5 hover:text-primary flex items-center justify-between"
                      onMouseDown={() => handleCitySelect(city)}>
                      <span>{city}</span>
                      <span className="text-xs text-slate-400">{CITY_DATA[city]?.state}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">State * <span className="normal-case font-normal text-slate-400">(auto-filled)</span></label>
              <input className="input-field bg-slate-50" placeholder="Auto-filled from city" value={form.state}
                onChange={(e) => setForm((c) => ({ ...c, state: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Pincode *
                {pincodeLoading && <span className="ml-2 normal-case font-normal text-slate-400">Looking up...</span>}
                {pincodeError && <span className="ml-2 normal-case font-normal text-error">{pincodeError}</span>}
              </label>
              <input
                className="input-field"
                placeholder="e.g. 500001"
                value={form.pincode}
                maxLength={6}
                onChange={(e) => handlePincodeChange(e.target.value)}
              />
              {!pincodeError && !pincodeLoading && form.pincode.length === 6 && form.city && (
                <p className="mt-1 text-xs text-success">✓ City and State auto-filled from pincode</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone *</label>
              <input
  className="input-field"
  placeholder="9876543210"
  type="tel"
  inputMode="numeric"
  maxLength={10}
  value={form.phone}
  onChange={(e) => {
    const phone = e.target.value.replace(/\D/g, "").slice(0, 10);

    setForm((c) => ({
      ...c,
      phone,
    }));
  }}
/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email *</label>
              <input className="input-field" placeholder="hostel@email.com" value={form.email}
                onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} />
</div>
            {/* Map location picker — replaces lat/lng text inputs */}
            
          </div>

         


          

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_public}
                onChange={(e) => setForm((c) => ({ ...c, is_public: e.target.checked }))}
                className="w-4 h-4 accent-primary" />
              Public listing
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_featured}
                onChange={(e) => setForm((c) => ({ ...c, is_featured: e.target.checked }))}
                className="w-4 h-4 accent-primary" />
              Featured
            </label>
          </div>

          <button
            className="btn-primary w-full disabled:opacity-60"
            disabled={submitting || !form.name.trim() || !form.slug.trim()}
            type="button"
            onClick={handleCreate}
          >
            {submitting ? "Creating..." : "Create Hostel"}
          </button>
        </section>

        {/* ── Registry ── */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-dark">Hostel Registry</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {hostelsQuery.data?.total ?? 0} hostels
            </span>
          </div>
          <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">Status:</label>
              <select value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="input-field w-auto text-sm py-2">
                <option value="">All</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            {/* Export CSV */}
            <button
              onClick={() => {
                const items = hostelsQuery.data?.items ?? [];
                if (!items.length) return;
                const csv = ["Name,City,State,Type,Status,Email,Phone"].concat(
                  items.map(h => `"${h.name}","${h.city}","${h.state}","${h.hostel_type}","${h.status}","${h.email}","${h.phone}"`)
                ).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "hostels.csv"; a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              ⬇ Export CSV
            </button>
          </div>
          <div className="space-y-4">
            {hostelsQuery.isLoading && [1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
            {hostelsQuery.data?.items.map((hostel) => (
              <article key={hostel.id} className="rounded-xl border border-slate-200 overflow-hidden">
                {/* Image strip if available */}
                <div className="h-28 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                  {hostel.images?.[0]?.url && (
                    <img
                      src={hostel.images[0].url}
                      alt={hostel.name}
                      className="w-full h-full object-cover opacity-60"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{hostel.name}</h3>
                      <p className="text-white/70 text-xs mt-0.5">{hostel.city}, {hostel.state} · {hostel.hostel_type}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_BADGE[hostel.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {hostel.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-600 line-clamp-2">{hostel.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">

  {hostel.status === "pending_approval" && (
    <>
      <button
        className="btn-primary text-xs px-3 py-1.5"
        type="button"
        disabled={statusMutation.isPending}
        onClick={() =>
          statusMutation.mutate(
            { hostelId: hostel.id, action: "approve" },
            {
              onSuccess: () => toast.success("Hostel approved"),
              onError: () => toast.error("Failed to approve"),
            }
          )
        }
      >
        Approve
      </button>

      <button
        className="rounded-xl border border-error/30 text-error text-xs px-3 py-1.5 hover:bg-error/5 transition-colors"
        type="button"
        disabled={statusMutation.isPending}
        onClick={() => {
          setRejectingHostelId(hostel.id);
          setRejectReason("");
        }}
      >
        Reject
      </button>

      <button
        className="rounded-xl border border-slate-300 text-slate-600 text-xs px-3 py-1.5 hover:bg-slate-50 transition-colors"
        type="button"
        disabled={statusMutation.isPending}
        onClick={() =>
          statusMutation.mutate(
            { hostelId: hostel.id, action: "suspend" },
            {
              onSuccess: () => toast.success("Hostel suspended"),
              onError: () => toast.error("Failed to suspend"),
            }
          )
        }
      >
        Suspend
      </button>
    </>
  )}
  <button
  className="rounded-xl border border-red-500 text-red-600 text-xs px-3 py-1.5 hover:bg-red-50 transition-colors"
  type="button"
  disabled={deleteMutation.isPending}
  onClick={() => {
    
deleteMutation.mutate(hostel.id, {
      onSuccess: () => {
        toast.success("Hostel deleted");
      },
      onError: () => {
        toast.error("Failed to delete hostel");
      },
    });
  }}
>
  Delete
</button>

  {hostel.status === "active" && (
    <button
      className="rounded-xl border border-slate-300 text-slate-600 text-xs px-3 py-1.5 hover:bg-slate-50 transition-colors"
      type="button"
      disabled={statusMutation.isPending}
      onClick={() =>
        statusMutation.mutate(
          { hostelId: hostel.id, action: "suspend" },
          {
            onSuccess: () => toast.success("Hostel suspended"),
            onError: () => toast.error("Failed to suspend"),
          }
        )
      }
    >
      Suspend
    </button>
  )}

  {hostel.status === "rejected" && (
    <span className="text-xs font-medium text-error">
      Hostel Rejected
    </span>
  )}

  {hostel.status === "suspended" && (
    <span className="text-xs font-medium text-slate-500">
      Hostel Suspended
    </span>
  )}

</div>
                </div>
              </article>
            ))}
            {!hostelsQuery.isLoading && (hostelsQuery.data?.items.length ?? 0) === 0 && (
              <p className="text-sm text-slate-500 py-8 text-center">No hostels found.</p>
            )}
            {(hostelsQuery.data?.total ?? 0) > 10 && (
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                <span className="text-sm text-slate-500">Page {page}</span>
                <button type="button" className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
                  onClick={() => setPage((p) => p + 1)} disabled={page * 10 >= (hostelsQuery.data?.total ?? 0)}>Next</button>
              </div>
            )}
          </div>
        </section>
      </div>

      {rejectingHostelId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-dark">Reject Hostel</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason"
              className="input-field min-h-24" />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setRejectingHostelId(null)}>Cancel</button>
              <button type="button" className="btn-primary disabled:opacity-50" disabled={!rejectReason.trim()}
                onClick={() => {
                  statusMutation.mutate(
                    { hostelId: rejectingHostelId, action: "reject", reason: rejectReason.trim() },
                    { onSuccess: () => toast.success("Hostel rejected"), onError: () => toast.error("Failed to reject") }
                  );
                  setRejectingHostelId(null);
                }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {managingHostel && userId && (
        <HostelManageDrawer
          hostel={managingHostel}
          userId={userId}
          onClose={() => setManagingHostel(null)}
        />
      )}
    </div>
  );
}
