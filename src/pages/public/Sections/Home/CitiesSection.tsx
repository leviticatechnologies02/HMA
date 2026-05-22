import { Link } from "react-router-dom";
import { usePublicCities } from "../../../../hooks/useHostels";
import { CITY_IMAGES } from "../../../../utils/images";

const FALLBACK_CITIES = ["Hyderabad", "Bangalore", "Pune", "Mumbai", "Chennai", "Delhi"];

export function CitiesSection() {
  const citiesQuery = usePublicCities();
  const topCities = FALLBACK_CITIES;

  return (
    <section className="py-20 bg-neutral">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Explore</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark">Top Cities</h2>
          <p className="mt-3 text-lg text-slate-600 max-w-xl mx-auto">Find your stay in India's top student cities</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {topCities.slice(0, 6).map((c, i) => {
            const img = CITY_IMAGES[c] ?? CITY_IMAGES[FALLBACK_CITIES[i % FALLBACK_CITIES.length]];
            const count = citiesQuery.data?.find((x) => x.city === c)?.hostel_count;
            return (
              <Link key={c} to={`/hostels?city=${c}`}
                className="group relative rounded-2xl overflow-hidden h-36 card-hover"
                style={{ animationDelay: `${i * 80}ms` }}>
                <img
                  src={img}
                  alt={c}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop&auto=format&q=80`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-bold text-sm">{c}</p>
                  {count !== undefined && (
                    <p className="text-white/70 text-xs">{count} hostel{count !== 1 ? "s" : ""}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
