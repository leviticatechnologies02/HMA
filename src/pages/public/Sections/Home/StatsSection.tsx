import { useState, useEffect, useRef } from "react";

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCounter({ value, suffix, label, inView }: {
  value: number; suffix: string; label: string; inView: boolean;
}) {
  const count = useCountUp(value, 1800, inView);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-heading font-bold text-white font-mono">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-sm text-white/70 font-medium">{label}</div>
    </div>
  );
}

export function StatsSection() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsInView(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={statsRef} className="bg-primary py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20">
          <StatCounter value={2400} suffix="+" label="Active Beds" inView={statsInView} />
          <StatCounter value={120} suffix="+" label="Verified Hostels" inView={statsInView} />
          <StatCounter value={15000} suffix="+" label="Happy Students" inView={statsInView} />
          <StatCounter value={4} suffix="/5" label="Average Rating" inView={statsInView} />
        </div>
      </div>
    </section>
  );
}
