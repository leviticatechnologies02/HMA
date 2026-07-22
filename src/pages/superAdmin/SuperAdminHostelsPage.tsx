import { useState } from "react";
import {
  Building2,
  Check,
  Download,
  Filter,
  MapPin,
  Pause,
  Trash2,
  XCircle,
} from "lucide-react";
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
  email: "",
  website: "",
  is_featured: false,
  is_public: true,
  rules_and_regulations: "",
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
  const [rejectingHostelId, setRejectingHostelId] = useState<string | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    hostel: SuperAdminHostel | null;
  }>({
    show: false,
    hostel: null,
  });
  const [imageUrls, setImageUrls] = useState<string[]>(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [managingHostel, setManagingHostel] = useState<SuperAdminHostel | null>(
    null,
  );
  const [citySearch, setCitySearch] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  const hostelsQuery = useSuperAdminHostelsPaginated(userId, {
    status: statusFilter || undefined,
    page,
    per_page: 10,
  });
  const createMutation = useCreateSuperAdminHostel(userId);
  const statusMutation = useUpdateSuperAdminHostelStatus(userId);
  const deleteMutation = useDeleteSuperAdminHostel(userId);
  const [form, setForm] = useState(defaultForm);

  if (!userId) {
    return <div>Please login as a super admin to manage hostels.</div>;
  }

  // City data: city → { state, lat, lng }
  const CITY_DATA: Record<string, { state: string; lat: number; lng: number }> =
    {
      Hyderabad: { state: "Telangana", lat: 17.385, lng: 78.4867 },
      Bangalore: { state: "Karnataka", lat: 12.9716, lng: 77.5946 },
      Bengaluru: { state: "Karnataka", lat: 12.9716, lng: 77.5946 },
      Mumbai: { state: "Maharashtra", lat: 19.076, lng: 72.8777 },
      Pune: { state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
      Delhi: { state: "Delhi", lat: 28.6139, lng: 77.209 },
      "New Delhi": { state: "Delhi", lat: 28.6139, lng: 77.209 },
      Chennai: { state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
      Kolkata: { state: "West Bengal", lat: 22.5726, lng: 88.3639 },
      Ahmedabad: { state: "Gujarat", lat: 23.0225, lng: 72.5714 },
      Jaipur: { state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
      Surat: { state: "Gujarat", lat: 21.1702, lng: 72.8311 },
      Lucknow: { state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
      Nagpur: { state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
      Indore: { state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
      Bhopal: { state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
      Visakhapatnam: { state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
      Patna: { state: "Bihar", lat: 25.5941, lng: 85.1376 },
      Vadodara: { state: "Gujarat", lat: 22.3072, lng: 73.1812 },
      Coimbatore: { state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
      Kochi: { state: "Kerala", lat: 9.9312, lng: 76.2673 },
      Thiruvananthapuram: { state: "Kerala", lat: 8.5241, lng: 76.9366 },
      Chandigarh: { state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
      Guwahati: { state: "Assam", lat: 26.1445, lng: 91.7362 },
      Bhubaneswar: { state: "Odisha", lat: 20.2961, lng: 85.8245 },
      Dehradun: { state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
      Ranchi: { state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
      Mysuru: { state: "Karnataka", lat: 12.2958, lng: 76.6394 },
      Mysore: { state: "Karnataka", lat: 12.2958, lng: 76.6394 },
      Goa: { state: "Goa", lat: 15.2993, lng: 74.124 },
      Panaji: { state: "Goa", lat: 15.4909, lng: 73.8278 },
    };

  const allCities = Object.keys(CITY_DATA);

  const handleCitySelect = (city: string) => {
    const data = CITY_DATA[city];
    setForm((c) => ({
      ...c,
      city,
      ...(data
        ? { state: data.state, latitude: data.lat, longitude: data.lng }
        : {}),
    }));
    setCitySearch(city);
    setShowCitySuggestions(false);
  };

  const handlePincodeChange = async (value: string) => {
    // Keep only digits and max 6 characters
    value = value.replace(/\D/g, "").slice(0, 6);

    setForm((c) => ({
      ...c,
      pincode: value,
    }));

    setPincodeError(null);

    if (value.length !== 6) return;

    setPincodeLoading(true);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);

      const data = await res.json();

      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const district = po.District;
        const state = po.State;

        const cityEntry = Object.entries(CITY_DATA).find(
          ([city]) => city.toLowerCase() === district.toLowerCase(),
        );

        const coords = cityEntry ? cityEntry[1] : null;

        setCitySearch(district);

        setForm((c) => ({
          ...c,
          city: district,
          state,
          ...(coords
            ? {
                latitude: coords.lat,
                longitude: coords.lng,
              }
            : {}),
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

  const filteredCities =
    citySearch.length >= 1
      ? allCities
          .filter((c) => c.toLowerCase().startsWith(citySearch.toLowerCase()))
          .slice(0, 8)
      : [];

  const handleCreate = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;

    const errors: string[] = [];
    if (form.description.trim().length < 10)
      errors.push("Description must be at least 10 characters");
    const address = form.address_line1.trim();

    if (!address) {
      errors.push("Full address is required");
    } else {
      const hasNumber = /\d/.test(address);

      const words = address.match(/[A-Za-z]+/g) || [];

      if (!hasNumber || words.length < 2) {
        errors.push("Enter a valid address like 'Plot 18 Jubilee Hills'");
      }
    }
    if (!form.city.trim()) errors.push("City is required");
    if (!form.state.trim()) errors.push("State is required");
    if (form.pincode.trim().length < 3)
      errors.push("Pincode must be at least 3 characters");
    const phone = form.phone.trim();

    if (!/^\d{10}$/.test(phone)) {
      errors.push("Phone number must contain exactly 10 digits");
    }
    if (form.email.trim().length < 5 || !form.email.includes("@"))
      errors.push("Valid email is required");
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
      toast.success(
        `Hostel "${hostel.name}" created${validImages.length ? ` with ${validImages.length} image(s)` : ""}`,
      );
      setForm(defaultForm);
      setImageUrls(["", "", ""]);
      setShowCreateForm(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark">
            Super Admin Hostels
          </h1>
          <p className="text-slate-600">
            Create hostels and control approval or suspension status.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
          onClick={() => setShowCreateForm(true)}
        >
          <Building2 size={16} /> Create Hostel
        </button>
      </div>
      <div className="space-y-6">
        {/* ── Create Form Modal ── */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-3xl my-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowCreateForm(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
              <h2 className="text-center text-xl font-semibold text-dark">
                Create Hostel
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Hostel name *
                  </label>
                  <input
                    className="input-field"
                    placeholder="e.g. Green Valley Boys Hostel"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;

                      const slug = name
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, "") // remove special characters
                        .replace(/\s+/g, "-") // spaces → hyphen
                        .replace(/-+/g, "-"); // remove duplicate hyphens

                      setForm((c) => ({
                        ...c,
                        name,
                        slug,
                      }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Slug *{" "}
                    <span className="font-normal text-slate-400">
                      (URL-friendly ID)
                    </span>
                  </label>
                  <input
                    className="input-field bg-slate-50"
                    placeholder="e.g. green-valley-boys-hostel"
                    value={form.slug}
                    readOnly
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Description *{" "}
                    <span className="font-normal text-slate-400">
                      (min 10 chars)
                    </span>
                  </label>
                  <textarea
                    className="input-field min-h-20"
                    placeholder="Describe the hostel facilities, location, highlights..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, description: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Hostel type *
                  </label>
                  <select
                    className="input-field"
                    value={form.hostel_type}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, hostel_type: e.target.value }))
                    }
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="co-living">Co-living</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Email *
                  </label>
                  <input
                    className="input-field"
                    placeholder="hostel@email.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, email: e.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Full address *
                  </label>
                  <input
                    className="input-field"
                    placeholder="Street / Area"
                    value={form.address_line1}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, address_line1: e.target.value }))
                    }
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    City *
                  </label>
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
                    onBlur={() =>
                      setTimeout(() => setShowCitySuggestions(false), 150)
                    }
                  />
                  {showCitySuggestions && filteredCities.length > 0 && (
                    <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      {filteredCities.map((city) => (
                        <li
                          key={city}
                          className="px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/5 hover:text-primary flex items-center justify-between"
                          onMouseDown={() => handleCitySelect(city)}
                        >
                          <span>{city}</span>
                          <span className="text-xs text-slate-400">
                            {CITY_DATA[city]?.state}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    State *{" "}
                    <span className="font-normal text-slate-400">
                      (auto-filled)
                    </span>
                  </label>
                  <input
                    className="input-field bg-slate-50"
                    placeholder="Auto-filled from city"
                    value={form.state}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, state: e.target.value }))
                    }
                  />
                </div>
                <div>
                  {" "}
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {" "}
                    Pincode *{" "}
                    {pincodeLoading && (
                      <span className="ml-2 normal-case font-normal text-slate-400">
                        Looking up...
                      </span>
                    )}{" "}
                    {pincodeError && (
                      <span className="ml-2 normal-case font-normal text-error">
                        {pincodeError}
                      </span>
                    )}{" "}
                  </label>{" "}
                  <input
                    className="input-field"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 500001"
                    value={form.pincode}
                    maxLength={6}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();

                      const value = e.clipboardData
                        .getData("text")
                        .replace(/\D/g, "")
                        .slice(0, 6);

                      handlePincodeChange(value);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Phone *
                  </label>
                  <input
                    className="input-field"
                    placeholder="9876543210"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => {
                      const phone = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setForm((c) => ({
                        ...c,
                        phone,
                      }));
                    }}
                  />
                </div>
                {/* Map location picker — replaces lat/lng text inputs */}
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, is_public: e.target.checked }))
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  Public listing
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, is_featured: e.target.checked }))
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  Featured
                </label>
              </div>

              <div className="flex justify-center pt-4 gap-3">
                <button
                  className="btn-outline min-w-32 justify-center"
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary min-w-48 justify-center disabled:opacity-60"
                  disabled={
                    submitting || !form.name.trim() || !form.slug.trim()
                  }
                  type="button"
                  onClick={handleCreate}
                >
                  {submitting ? "Creating..." : "Create Hostel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Registry ── */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="grid grid-cols-1 items-center gap-4 border-b border-slate-100 p-5 sm:grid-cols-[1fr_auto_1fr] sm:p-6">
            <div className="text-center sm:col-start-2">
              <h2 className="text-xl font-semibold text-dark">
                Hostel Registry
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Review and manage all registered hostels.
              </p>
            </div>
            <span className="mx-auto w-fit rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary sm:col-start-3 sm:row-start-1 sm:mr-0">
              {hostelsQuery.data?.total ?? 0} hostels
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Filter size={16} className="shrink-0 text-slate-400" />
                <label
                  htmlFor="hostel-status-filter"
                  className="text-sm font-medium text-slate-600"
                >
                  Status
                </label>
                <select
                  id="hostel-status-filter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="input-field min-w-0 flex-1 bg-white py-2 text-sm sm:w-48 sm:flex-none"
                >
                  <option value="">All hostels</option>
                  <option value="pending_approval">Pending approval</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <button
                type="button"
                disabled={(hostelsQuery.data?.items.length ?? 0) === 0}
                onClick={() => {
                  const items = hostelsQuery.data?.items ?? [];
                  if (!items.length) return;
                  const csv = ["Name,City,State,Type,Status,Email,Phone"]
                    .concat(
                      items.map(
                        (h) =>
                          `"${h.name}","${h.city}","${h.state}","${h.hostel_type}","${h.status}","${h.email}","${h.phone}"`,
                      ),
                    )
                    .join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "hostels.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {hostelsQuery.isLoading &&
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-80 rounded-2xl" />
                ))}
              {hostelsQuery.data?.items.map((hostel) => (
                <article
                  key={hostel.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-slate-200/60"
                >
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/15 to-secondary/15">
                    {hostel.images?.[0]?.url ? (
                      <img
                        src={hostel.images[0].url}
                        alt={hostel.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary/30">
                        <Building2 size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/15 to-transparent" />
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold capitalize shadow-sm ${STATUS_BADGE[hostel.status] ?? "bg-slate-100 text-slate-500"}`}
                    >
                      {hostel.status.replace(/_/g, " ")}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4 min-w-0">
                      <h3 className="truncate text-lg font-semibold text-white">
                        {hostel.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-white/80">
                        <MapPin size={14} className="shrink-0" />
                        {hostel.city}, {hostel.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium capitalize text-slate-600">
                        {hostel.hostel_type.replace(/-/g, " ")}
                      </span>
                      {hostel.email && (
                        <span className="max-w-full truncate text-slate-500">
                          {hostel.email}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                      {hostel.description}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                      {hostel.status === "pending_approval" && (
                        <>
                          <button
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() =>
                              statusMutation.mutate(
                                { hostelId: hostel.id, action: "approve" },
                                {
                                  onSuccess: () =>
                                    toast.success("Hostel approved"),
                                  onError: () =>
                                    toast.error("Failed to approve"),
                                },
                              )
                            }
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="inline-flex items-center gap-1.5 rounded-lg border border-error/30 px-3 py-2 text-xs font-medium text-error transition-colors hover:bg-error/5 disabled:opacity-50"
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => {
                              setRejectingHostelId(hostel.id);
                              setRejectReason("");
                            }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}

                      {(hostel.status === "pending_approval" ||
                        hostel.status === "active") && (
                        <button
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate(
                              { hostelId: hostel.id, action: "suspend" },
                              {
                                onSuccess: () =>
                                  toast.success("Hostel suspended"),
                                onError: () => toast.error("Failed to suspend"),
                              },
                            )
                          }
                        >
                          <Pause size={14} /> Suspend
                        </button>
                      )}

                      {hostel.status === "rejected" && (
                        <span className="mr-auto text-xs font-medium text-error">
                          Hostel rejected
                        </span>
                      )}
                      {hostel.status === "suspended" && (
                        <span className="mr-auto text-xs font-medium text-slate-500">
                          Hostel suspended
                        </span>
                      )}

                      <button
                        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                        type="button"
                        onClick={() =>
                          setShowDeleteConfirm({ show: true, hostel })
                        }
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!hostelsQuery.isLoading &&
              (hostelsQuery.data?.items.length ?? 0) === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-14 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Building2 size={22} />
                  </div>
                  <p className="font-medium text-slate-700">No hostels found</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try selecting a different status filter.
                  </p>
                </div>
              )}

            {(hostelsQuery.data?.total ?? 0) > 10 && (
              <div className="mt-5 flex items-center justify-center gap-3 border-t border-slate-100 pt-5 sm:justify-end">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-slate-500">
                  Page {page}
                </span>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 10 >= (hostelsQuery.data?.total ?? 0)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {rejectingHostelId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-dark">Reject Hostel</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason"
              className="input-field min-h-24"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setRejectingHostelId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary disabled:opacity-50"
                disabled={!rejectReason.trim()}
                onClick={() => {
                  statusMutation.mutate(
                    {
                      hostelId: rejectingHostelId,
                      action: "reject",
                      reason: rejectReason.trim(),
                    },
                    {
                      onSuccess: () => toast.success("Hostel rejected"),
                      onError: () => toast.error("Failed to reject"),
                    },
                  );
                  setRejectingHostelId(null);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[90%] max-w-[400px] rounded-2xl bg-white shadow-2xl">
            <div className="px-8 pt-8">
              <h2 className="text-[22px] font-bold text-slate-900">
                Delete Hostel
              </h2>

              <p className="mt-3 text-[16px] text-slate-600">
                Are you sure you want to delete Hostel{" "}
                <span className="font-semibold text-[#182238]">
                  {showDeleteConfirm.hostel?.name}
                </span>
                ?
              </p>
            </div>

            <div className="flex justify-end gap-3 px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8">
              <button
                onClick={() =>
                  setShowDeleteConfirm({
                    show: false,
                    hostel: null,
                  })
                }
                className="h-11 w-28 sm:h-12 sm:w-32 rounded-xl border border-[#D5DCE8] bg-white text-sm sm:text-base font-medium text-[#42526B]"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!showDeleteConfirm.hostel) return;

                  deleteMutation.mutate(showDeleteConfirm.hostel.id, {
                    onSuccess: () => {
                      toast.success("Hostel deleted");

                      setShowDeleteConfirm({
                        show: false,
                        hostel: null,
                      });
                    },
                    onError: () => {
                      toast.error("Failed to delete hostel");
                    },
                  });
                }}
                className="h-11 w-28 sm:h-12 sm:w-32 rounded-xl bg-[#EB2424] text-sm sm:text-base font-semibold text-white"
              >
                Delete
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
