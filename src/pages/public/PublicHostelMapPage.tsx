import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Building2, Star, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";

interface MapPin {
  id: string; name: string; slug: string; city: string;
  lat: number; lng: number; type: string;
}

export function PublicHostelMapPage() {
  const [selected, setSelected] = useState<MapPin | null>(null);
  const [city, setCity] = useState("");

  const pinsQ = useQuery({
    queryKey: ["hostel-map-pins", city],
    queryFn: () => api.get<MapPin[]>(`/public/hostels/map${city ? `?city=${city}` : ""}`).then(r => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const pins = pinsQ.data ?? [];

  return (
    <div className="min-h-screen bg-neutral">
      <div className="bg-dark py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-heading font-bold text-white">Hostel Map</h1>
          <p className="mt-1 text-slate-400">Find hostels near you on the map</p>
          <div className="mt-4 flex gap-3 max-w-sm">
            <input value={city} onChange={e => setCity(e.target.value)}
              placeholder="Filter by city..." className="input-field text-sm flex-1" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Map */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ minHeight: 500 }}>
            {pinsQ.isLoading ? (
              <div className="skeleton h-full w-full" />
            ) : (
              <iframe
                title="Hostel map"
                src={`https://maps.google.com/maps?q=${city || "Hyderabad,India"}&z=12&output=embed`}
                width="100%" height="500" loading="lazy"
                className="border-0"
              />
            )}
          </div>

          {/* Pins list */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-500 uppercase">{pins.length} hostels</p>
            {pins.length === 0 && !pinsQ.isLoading && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No hostels found.</p>
              </div>
            )}
            {pins.map(pin => (
              <div key={pin.id}
                className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all ${selected?.id === pin.id ? "border-primary shadow-card" : "border-slate-100 hover:border-primary/30"}`}
                onClick={() => setSelected(selected?.id === pin.id ? null : pin)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-dark text-sm">{pin.name}</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" /> {pin.city}
                    </div>
                    <span className="badge badge-slate capitalize text-xs mt-1">{pin.type}</span>
                  </div>
                  {selected?.id === pin.id && (
                    <button onClick={e => { e.stopPropagation(); setSelected(null); }}
                      className="p-1 rounded-lg hover:bg-slate-100">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
                {selected?.id === pin.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                    <Link to={`/hostels/${pin.slug}`} className="btn-primary text-xs px-3 py-1.5 flex-1 text-center">
                      View Details
                    </Link>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn-outline text-xs px-3 py-1.5">
                      Directions
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
