import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Bed, Zap } from "lucide-react";
import type { HostelListItem } from "../../api/public.api";
import { getHostelImage } from "../../utils/images";

interface HostelCardProps {
  hostel: HostelListItem;
  index?: number;
}

export default function HostelCard({ hostel, index = 0 }: HostelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glare: { x: 50, y: 50 } });
  const [hovered, setHovered] = useState(false);

  const imageUrl = hostel.images?.[0]?.url ?? getHostelImage(hostel.id);

  const bedsLeft = hostel.available_beds ?? 0;
  const bedColor =
    bedsLeft === 0 ? "bg-slate-400" :
    bedsLeft <= 2  ? "bg-error pulse-glow" :
    bedsLeft <= 5  ? "bg-warning" :
                     "bg-success";

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    const gx = ((e.clientX - rect.left) / rect.width) * 100;
    const gy = ((e.clientY - rect.top) / rect.height) * 100;
    setTilt({ x, y, glare: { x: gx, y: gy } });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0, glare: { x: 50, y: 50 } });
    setHovered(false);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link
        to={`/hostels/${hostel.slug}`}
        className="block animate-fade-in-up"
        style={{
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transition: hovered ? "transform 0.1s ease" : "transform 0.4s ease",
          transformStyle: "preserve-3d",
        }}
      >
        <article className="relative rounded-3xl overflow-hidden bg-white border border-slate-100 cursor-pointer"
          style={{ boxShadow: hovered ? "0 25px 60px rgba(255,107,53,0.18)" : "0 2px 15px rgba(0,0,0,0.06)" }}>

          {/* Glare overlay */}
          {hovered && (
            <div
              className="absolute inset-0 z-10 pointer-events-none rounded-3xl"
              style={{
                background: `radial-gradient(circle at ${tilt.glare.x}% ${tilt.glare.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              }}
            />
          )}

          {/* Image */}
          <div className="relative h-52 overflow-hidden">
            <img
              src={imageUrl}
              alt={hostel.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500"
              style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="badge badge-slate capitalize text-xs backdrop-blur-sm bg-white/80">
                {hostel.hostel_type?.replace("_", "-")}
              </span>
              {hostel.is_featured && (
                <span className="badge badge-primary text-xs backdrop-blur-sm">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Beds badge */}
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white ${bedColor}`}>
                <Bed className="w-3 h-3" />
                {bedsLeft === 0 ? "Full" : `${bedsLeft} left`}
              </span>
            </div>

            {/* Bottom overlay: rating */}
            {(hostel.rating ?? 0) > 0 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                  <span className="text-white text-xs font-bold">{hostel.rating}</span>
                  <span className="text-white/70 text-xs">({hostel.total_reviews})</span>
                </div>
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-dark text-base leading-tight truncate
                  transition-colors duration-200 group-hover:text-primary">
                  {hostel.name}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{hostel.city}, {hostel.state}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-primary font-mono">
                  ₹{(hostel.starting_monthly_price ?? hostel.starting_price ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">/month</p>
                {(hostel.starting_daily_price ?? 0) > 0 && (
                  <p className="text-xs text-slate-500 font-mono">
                    ₹{hostel.starting_daily_price?.toLocaleString()}/day
                  </p>
                )}
              </div>
            </div>

            {/* Hover CTA */}
            <div
              className="mt-4 overflow-hidden transition-all duration-300"
              style={{ maxHeight: hovered ? "48px" : "0px", opacity: hovered ? 1 : 0 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" /> Instant booking
                </span>
                <span className="text-sm font-semibold text-primary">
                  View Details →
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
