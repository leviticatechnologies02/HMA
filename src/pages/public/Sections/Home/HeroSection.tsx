import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { ModernDatePicker } from "../../../../components/common/ModernDatePicker";

const HeroSection = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [quickSearch, setQuickSearch] = useState("");
  const [quickCheckIn, setQuickCheckIn] = useState("");
  const [quickCheckOut, setQuickCheckOut] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const getNextDay = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const handleQuickBooking = () => {
    const params = new URLSearchParams();

    if (quickSearch.trim()) params.set("city", quickSearch.trim());
    if (quickCheckIn) params.set("checkIn", quickCheckIn);
    if (quickCheckOut) params.set("checkOut", quickCheckOut);
    navigate(`/hostels${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#f7faf9] px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pt-10">
      <div className="pointer-events-none absolute -left-48 top-12 -z-10 h-96 w-96 rounded-full bg-primary/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -right-56 top-0 -z-10 h-[32rem] w-[32rem] rounded-full bg-[#d8efeb]/60 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3.5 py-2 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Smarter operations. Better stays.
          </div>

          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.06] tracking-[-0.04em] text-dark sm:text-5xl lg:text-[3.9rem]">
            One elegant workspace for your{" "}
            <span className="text-primary">entire hostel.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Bring bookings, residents, payments, attendance, and everyday
            operations together without the complexity of disconnected tools.
          </p>

          <div className="mt-7 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {["Automated workflows", "Live visibility", "Secure access"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => navigate("/register")}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:bg-[#09454a]"
            >
              Get started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary"
            >
              View demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-2xl lg:max-w-none"
        >
          <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] border border-primary/10 bg-primary/[0.07]" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-2.5 shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
            <div className="relative overflow-hidden rounded-[1.55rem]">
              <img
                src="/img/Heroo.png"
                alt="Modern hostel reception managed with Levitica Nestora"
                className="h-[390px] w-full object-cover sm:h-[500px] lg:h-[550px]"
              />
              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/65 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-white backdrop-blur-md">
                <div>
                  <p className="text-xs text-white/70">Unified management</p>
                  <p className="mt-0.5 text-sm font-semibold">Every workflow, always in sync</p>
                </div>
                <ShieldCheck className="h-6 w-6 text-[#a9e2d9]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-14 max-w-7xl rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-5"
      >
        <div className="relative mb-4 text-center">
          <div>
            <p className="text-sm font-semibold text-dark">Find your next stay</p>
            <p className="mt-1 text-sm text-slate-500">Search available rooms by location and date.</p>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-400 sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2">Quick booking</p>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[2.2fr_1fr_1fr_auto]">
          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Where to</span>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 transition-colors focus-within:border-primary/40 focus-within:bg-white">
                <MapPin className="h-4.5 w-4.5 shrink-0 text-primary" />
                <input
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Area, landmark or property"
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-400"
                />
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Check-in</span>
            <ModernDatePicker
              value={quickCheckIn}
              min={today}
              onChange={(e) => {
                const value = e.target.value;
                setQuickCheckIn(value);
                if (quickCheckOut && quickCheckOut <= value) setQuickCheckOut("");
              }}
              className="bg-slate-50/70 py-3.5 text-sm font-medium"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Check-out</span>
            <ModernDatePicker
              value={quickCheckOut}
              onChange={(e) => setQuickCheckOut(e.target.value)}
              min={quickCheckIn ? getNextDay(quickCheckIn) : getNextDay(today)}
              className="bg-slate-50/70 py-3.5 text-sm font-medium"
            />
          </div>

          <button
            onClick={handleQuickBooking}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#09454a] xl:self-end"
          >
            Search rooms
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
