import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
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
    <section className="bg-neutral px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.2] tracking-tight text-dark">
            Streamline Your <br />
            Hostel Operations <br />
            with the{" "}
            <span className="bg-gradient-to-r from-[#0d5c63] to-[#1b7f8e] bg-clip-text text-transparent">
              Intelligent Concierge
            </span>
          </h1>

          
          <p className="mt-8 max-w-xl text-[18px] leading-[1.8] text-slate-600">
            A sophisticated, subscription-based management ecosystem designed
            for the modern hostel. Automate everything from KYC to mess
            schedules with architectural precision.
          </p>

          
          <div className="mt-10 flex flex-wrap gap-5">
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 rounded-lg bg-[#0d5c63] px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-[#09454a] hover:-translate-y-0.5"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => navigate("/contact")}
              className="rounded-lg bg-[#9dd9d2] px-8 py-4 text-lg font-semibold text-[#0d5c63] transition hover:bg-[#86cfc6] hover:-translate-y-0.5"
            >
              View Demo
            </button>
          </div>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[2rem] border border-[#d7e7e4] bg-white p-3 shadow-[0_24px_60px_rgba(13,92,99,0.12)]">
            <img
              src="/img/Heroo.png"
              alt="Hostel interior"
              className="h-[420px] w-full rounded-[1.5rem] object-cover sm:h-[500px] lg:h-[560px]"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mx-auto mt-14 max-w-6xl rounded-[2rem] border border-[#d7e7e4] bg-white/95 p-5 shadow-[0_18px_45px_rgba(13,92,99,0.1)] backdrop-blur-sm sm:mt-16 dark:border-[#2D2D4A] dark:bg-[#1A1A2E]/95"
      >
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1b7f8e] dark:text-[#0d5c63]">
              Quick Booking
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-[#B0B8C8]">
              Search by area, select dates, and move to available rooms faster.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.2fr_1fr_1fr]">
            <label className="relative rounded-2xl border border-[#d7e7e4] bg-[#f8fbfb] px-5 py-4 dark:border-[#2D2D4A] dark:bg-[#252540]">
              <span className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-slate-500 dark:bg-[#1A1A2E] dark:text-[#B0B8C8]">
                Where to
              </span>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#0d5c63]" />
                <input
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="e.g. Area, Landmark or Property Name"
                  className="w-full bg-transparent text-lg font-semibold text-slate-700 outline-none placeholder:text-slate-400 dark:text-[#E2E8F0] dark:placeholder:text-[#64748B]"
                />
              </div>
            </label>

            <label className="relative rounded-2xl border border-[#d7e7e4] bg-[#f8fbfb] px-5 py-4 dark:border-[#2D2D4A] dark:bg-[#252540]">
              <span className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-slate-500 dark:bg-[#1A1A2E] dark:text-[#B0B8C8]">
                Check-in
              </span>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-[#0d5c63]" />
                <input
                  type="date"
                  value={quickCheckIn}
                  min={today}
                  onChange={(e) => {
                    const v = e.target.value;
                    setQuickCheckIn(v);
                    // clear checkout if it's not after the new check-in
                    if (quickCheckOut && quickCheckOut <= v) setQuickCheckOut("");
                  }}
                  className="w-full bg-transparent text-lg font-semibold text-slate-700 outline-none dark:text-[#E2E8F0]"
                />
              </div>
            </label>

            <label className="relative rounded-2xl border border-[#d7e7e4] bg-[#f8fbfb] px-5 py-4 dark:border-[#2D2D4A] dark:bg-[#252540]">
              <span className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-slate-500 dark:bg-[#1A1A2E] dark:text-[#B0B8C8]">
                Check-out
              </span>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-[#c79a3b]" />
                <input
                  type="date"
                  value={quickCheckOut}
                  onChange={(e) => setQuickCheckOut(e.target.value)}
                  min={quickCheckIn ? getNextDay(quickCheckIn) : getNextDay(today)}
                  className="w-full bg-transparent text-lg font-semibold text-slate-700 outline-none dark:text-[#E2E8F0]"
                />
              </div>
            </label>

          </div>

          <div className="flex justify-center">
            <button
              onClick={handleQuickBooking}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0d5c63] to-[#1b7f8e] px-10 py-3 text-lg font-black tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-[#09454a] hover:to-[#166774]"
            >
              SEARCH ROOMS
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
