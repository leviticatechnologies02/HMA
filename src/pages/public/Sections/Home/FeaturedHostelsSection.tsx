import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useHostels } from "../../../../hooks/useHostels";
import HostelCard from "../../../../components/public/HostelCard";

export function FeaturedHostelsSection() {
  const { data: hostelsData, isLoading: hostelsLoading } = useHostels({ per_page: 6, is_featured: true });
  const featuredHostels = hostelsData?.items ?? [];

  return (
    <section className="py-16 relative overflow-hidden bg-primary">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-[100px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Handpicked</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">Top-Rated Hostels ✨</h2>
          <p className="mt-3 text-lg text-slate-300 max-w-xl mx-auto">Verified properties with real student reviews</p>
        </div>
        {hostelsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                <div className="skeleton h-52 rounded-none" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <div className="skeleton h-4 w-1/2" style={{ background: "rgba(255,255,255,0.08)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredHostels.slice(0, 6).map((hostel, i) => (
              <HostelCard key={hostel.id} hostel={hostel} index={i} />
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link to="/hostels" className="btn-primary inline-flex items-center gap-2">
            Browse All Hostels <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
