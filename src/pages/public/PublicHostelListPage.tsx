import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Star, SlidersHorizontal, ChevronRight, Building2, ChevronLeft, LayoutGrid, List, ArrowUpDown, Heart } from "lucide-react";
import { useState, useCallback } from "react";
import { useHostels, usePublicCities } from "../../hooks/useHostels";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import type { PublicHostelsQueryParams } from "../../api/public.api";
import { SearchAutocomplete } from "../../components/common/SearchAutocomplete";
import { HostelCompareBar } from "../../components/public/HostelCompareBar";

// Guest favorites stored in localStorage
function useGuestFavorites() {
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("guestFavorites") || "[]"); } catch { return []; }
  });
  const toggle = useCallback((id: string) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("guestFavorites", JSON.stringify(next));
      return next;
    });
  }, []);
  return { favs, toggle };
}

const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "newest", label: "Newest Listings" },
];

export function PublicHostelListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useCurrentUser();
  const [showFilters, setShowFilters] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const { favs, toggle: toggleFav } = useGuestFavorites();
  const [viewMode, setViewMode] = useState<"grid" | "list">(() =>
    (localStorage.getItem("hostelViewMode") as "grid" | "list") || "grid"
  );

  const toggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const setView = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("hostelViewMode", mode);
  };

  const page = Number(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "";
  const filters = {
    city: searchParams.get("city") || "",
    hostel_type: searchParams.get("hostel_type") || "",
    room_type: searchParams.get("room_type") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    booking_mode: searchParams.get("booking_mode") || "",
  };

  const queryParams: PublicHostelsQueryParams = {
    page,
    per_page: 12,
    ...(filters.city ? { city: filters.city } : {}),
    ...(filters.hostel_type ? { hostel_type: filters.hostel_type } : {}),
    ...(filters.room_type ? { room_type: filters.room_type } : {}),
    ...(filters.min_price ? { min_price: Number(filters.min_price) } : {}),
    ...(filters.max_price ? { max_price: Number(filters.max_price) } : {}),
    ...(filters.booking_mode ? { booking_mode: filters.booking_mode as "daily" | "monthly" } : {}),
  };

  const { data, isLoading, isError, refetch } = useHostels(queryParams);
  const citiesQuery = usePublicCities();

  const hostels = data?.items ?? [];
  const total = data?.total ?? 0;
  const perPage = data?.per_page ?? 12;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // Client-side sort (server sort param sent for future backend support)
  const sorted = [...hostels].sort((a, b) => {
    if (sort === "price_asc") return (a.starting_monthly_price ?? 0) - (b.starting_monthly_price ?? 0);
    if (sort === "price_desc") return (b.starting_monthly_price ?? 0) - (a.starting_monthly_price ?? 0);
    if (sort === "rating_desc") return (b.rating ?? 0) - (a.rating ?? 0);
    if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  const updateQuery = (next: Partial<Record<string, string>>) => {
    const merged = {
      city: filters.city,
      hostel_type: filters.hostel_type,
      room_type: filters.room_type,
      min_price: filters.min_price,
      max_price: filters.max_price,
      booking_mode: filters.booking_mode,
      sort,
      page: String(page),
      ...next,
    };
    const cleaned = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== ""));
    setSearchParams(cleaned);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <div className="bg-dark py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-4xl font-heading font-bold text-white">Find Your Hostel</h1>
          <p className="mt-2 text-slate-400">
            {isLoading ? "Loading..." : `${total} properties available`}
            {filters.city ? ` in ${filters.city}` : ""}
          </p>
          <div className="mt-6 flex gap-3 max-w-2xl">
            <div className="flex-1">
              <SearchAutocomplete placeholder="Search city or hostel name..." />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                showFilters ? "bg-primary border-primary text-white" : "border-white/20 text-white hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {activeFilterCount > 0 && <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Filter panel */}
        {showFilters && (
          <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-fade-in-up">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
              {[
                { label: "City", key: "city", options: (citiesQuery.data ?? []).map((c) => c.city) },
                { label: "Type", key: "hostel_type", options: ["boys", "girls", "co-living"] },
                { label: "Room Type", key: "room_type", options: ["single", "double", "triple", "dormitory"] },
                { label: "Booking Mode", key: "booking_mode", options: ["daily", "monthly"] },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">{label}</label>
                  <select
                    value={filters[key as keyof typeof filters]}
                    onChange={(e) => updateQuery({ [key]: e.target.value, page: "1" })}
                    className="input-field text-sm"
                  >
                    <option value="">All</option>
                    {options.map((o) => <option key={o} value={o}>{o.replace("_", "-")}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Min Price</label>
                <input type="number" placeholder="₹ 0" value={filters.min_price}
                  onChange={(e) => updateQuery({ min_price: e.target.value, page: "1" })}
                  className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Max Price</label>
                <input type="number" placeholder="₹ 20000" value={filters.max_price}
                  onChange={(e) => updateQuery({ max_price: e.target.value, page: "1" })}
                  className="input-field text-sm" />
              </div>
            </div>
            <button onClick={() => { setSearchParams({}); }} className="mt-4 text-sm text-primary hover:underline">
              Clear all filters
            </button>
          </div>
        )}

        {/* Results header — sort + view toggle */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isLoading ? "Loading..." : `${total} hostel${total !== 1 ? "s" : ""} found`}
            {filters.city ? ` in ${filters.city}` : ""}
          </p>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <select value={sort} onChange={(e) => updateQuery({ sort: e.target.value, page: "1" })}
                className="input-field text-sm py-2 w-auto">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {/* View toggle */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden dark:bg-slate-800">
              <button onClick={() => setView("grid")}
                className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                title="Grid view">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setView("list")}
                className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-primary text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                title="List view">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 ${viewMode === "list" ? "flex flex-col sm:flex-row sm:h-40" : ""}`}>
                <div className={`skeleton ${viewMode === "list" ? "w-full sm:w-64 h-48 sm:h-full rounded-none" : "h-48 rounded-none"}`} />
                <div className="p-6 space-y-3 flex-1">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl bg-error/10 dark:bg-error/20 border border-error/20 dark:border-error/30 p-8 text-center">
            <p className="text-error dark:text-error/80 font-medium">Failed to load hostels. Please try again.</p>
            <button onClick={() => void refetch()} className="mt-3 btn-outline">Retry</button>
          </div>
        )}

        {/* Grid view */}
        {!isLoading && !isError && sorted.length > 0 && viewMode === "grid" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((hostel, idx) => (
              <Link key={hostel.id} to={`/hostels/${hostel.slug}`} className="group">
                <article className="h-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 card-hover">
                  <div className="h-48 relative overflow-hidden">
                    {hostel.images?.[0]?.url ? (
                      <img src={hostel.images[0].url} alt={hostel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {hostel.is_featured && <div className="absolute top-4 left-4"><span className="badge badge-primary text-xs">Featured</span></div>}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFav(hostel.id); }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${favs.includes(hostel.id) ? "bg-error text-white" : "bg-white/80 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-error"}`}
                        title={favs.includes(hostel.id) ? "Remove from favorites" : "Save to favorites"}>
                        <Heart className={`w-4 h-4 ${favs.includes(hostel.id) ? "fill-current" : ""}`} />
                      </button>
                      <span className="badge badge-slate capitalize text-xs">{hostel.hostel_type?.replace("_", "-")}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-2 sm:gap-4">
                      <div className="min-w-0 w-full sm:w-auto">
                        <h2 className="font-heading font-bold text-dark dark:text-white text-lg truncate group-hover:text-primary transition-colors">{hostel.name}</h2>
                        <div className="flex items-center gap-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{hostel.city}, {hostel.state}</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0 mt-3 sm:mt-0 border-t border-slate-100 dark:border-slate-800 sm:border-0 pt-3 sm:pt-0 w-full sm:w-auto">
                        <p className="text-sm font-semibold text-primary">₹{(hostel.starting_daily_price ?? 0).toLocaleString()} /night</p>
                        <p className="text-sm font-bold text-dark dark:text-white">₹{(hostel.starting_monthly_price ?? hostel.starting_price ?? 0).toLocaleString()} /month</p>
                      </div>
                    </div>
                    {(hostel.rating ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-3">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="text-sm font-semibold text-dark dark:text-white">{hostel.rating}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">({hostel.total_reviews} reviews)</span>
                      </div>
                    )}
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{hostel.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-600 dark:text-slate-400"><b>{hostel.available_beds}</b> beds available</span>
                        <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={compareIds.includes(hostel.id)} onChange={() => toggleCompare(hostel.id)} className="w-3.5 h-3.5 accent-primary" />
                          Compare
                        </label>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isAuthenticated) {
                            navigate(`/login?returnTo=/booking/select?hostel=${hostel.slug}`);
                          } else {
                            navigate(`/booking/select?hostel=${hostel.slug}`);
                          }
                        }}
                        className="text-sm font-semibold text-primary hover:underline bg-none border-none p-0 cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* List view */}
        {!isLoading && !isError && sorted.length > 0 && viewMode === "list" && (
          <div className="space-y-4">
            {sorted.map((hostel, idx) => (
              <Link key={hostel.id} to={`/hostels/${hostel.slug}`} className="group block">
                <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden card-hover flex flex-col sm:flex-row">
                  <div className="w-full sm:w-56 md:w-64 h-48 sm:h-auto shrink-0 relative overflow-hidden">
                    {hostel.images?.[0]?.url ? (
                      <img src={hostel.images[0].url} alt={hostel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                    {hostel.is_featured && <div className="absolute top-3 left-3"><span className="badge badge-primary text-xs">Featured</span></div>}
                  </div>
                  <div className="p-4 sm:p-5 flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="min-w-0 w-full md:w-auto">
                        <h2 className="font-heading font-bold text-dark dark:text-white text-lg group-hover:text-primary transition-colors">{hostel.name}</h2>
                        <div className="flex items-center gap-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {hostel.city}, {hostel.state} · <span className="capitalize">{hostel.hostel_type}</span>
                        </div>
                        {(hostel.rating ?? 0) > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                            <span className="text-sm font-semibold text-dark dark:text-white">{hostel.rating}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">({hostel.total_reviews})</span>
                          </div>
                        )}
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{hostel.description}</p>
                      </div>
                      <div className="text-left md:text-right shrink-0 mt-2 md:mt-0 w-full md:w-auto border-t border-slate-100 dark:border-slate-800 md:border-0 pt-4 md:pt-0">
                        <p className="text-lg font-bold text-primary">₹{(hostel.starting_monthly_price ?? 0).toLocaleString()}<span className="text-xs font-normal text-slate-500 dark:text-slate-400">/mo</span></p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">₹{(hostel.starting_daily_price ?? 0).toLocaleString()}/night</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1"><b>{hostel.available_beds}</b> beds available</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAuthenticated) {
                              navigate(`/booking/select?hostel=${hostel.slug}`);
                            } 
                          }}
                          className="mt-3 md:mt-2 w-full md:w-auto inline-block btn-primary text-xs px-4 py-2 text-center">Book Now</button>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && !isError && sorted.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-dark dark:text-white mb-2">No hostels found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Try adjusting your filters or search term.</p>
            <button onClick={() => { setSearchParams({}); }} className="btn-primary">Clear Filters</button>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => updateQuery({ page: String(Math.max(1, page - 1)) })} disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-dark dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</span>
            <button onClick={() => updateQuery({ page: String(Math.min(totalPages, page + 1)) })} disabled={page >= totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-dark dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Compare bar — fixed at bottom */}
    <HostelCompareBar
      selectedIds={compareIds}
      onRemove={(id) => setCompareIds(prev => prev.filter(x => x !== id))}
      onClear={() => setCompareIds([])}
    />
  </>
  );
}
