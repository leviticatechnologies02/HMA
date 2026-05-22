import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden noise"
        style={{ background: "linear-gradient(135deg, #2D6A4F 0%,  #7be1b3 50%, #27664a 100%)", backgroundSize: "200% 200%", animation: "gradient-shift 6s ease infinite" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-black/10 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">
            Ready to Find Your New Home?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join 15,000+ students already staying with StayEase
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-primary font-bold hover:bg-white/90 transition-all shadow-lg">
              Register Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/hostels"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white text-white font-bold hover:bg-white/10 transition-all">
              Browse Hostels
            </Link>
          </div>
        </div>
      </section>
 
  );
}
