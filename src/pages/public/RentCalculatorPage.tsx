import { useState } from "react";
import { Calculator, Calendar, IndianRupee, Info } from "lucide-react";
import { useHostels } from "../../hooks/useHostels";
import { Link } from "react-router-dom";

export function RentCalculatorPage() {
  const [mode, setMode] = useState<"daily"|"monthly">("monthly");
  const [duration, setDuration] = useState(3);
  const [rent, setRent] = useState(5000);
  const [deposit, setDeposit] = useState(10000);

  const total = mode === "monthly" ? rent * duration + deposit : rent * duration + deposit;
  const advance = Math.ceil(total * 0.25);
  const remaining = total - advance;

  const { data } = useHostels({ per_page: 6, is_featured: true });
  const hostels = data?.items ?? [];

  return (
    <div className="min-h-screen bg-neutral py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-dark">Rent Calculator</h1>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto">
            Estimate your total hostel cost before booking. No surprises.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5">
            <h2 className="font-heading font-bold text-dark text-lg">Configure Your Stay</h2>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Booking Mode</label>
              <div className="grid grid-cols-2 gap-3">
                {(["monthly","daily"] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${mode === m ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-600 hover:border-primary/40"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Duration ({mode === "monthly" ? "months" : "nights"})
              </label>
              <div className="flex items-center gap-3">
                <button onClick={() => setDuration(d => Math.max(1, d-1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 font-bold text-dark hover:bg-slate-50 transition-colors"></button>
                <span className="flex-1 text-center text-2xl font-bold font-mono text-dark">{duration}</span>
                <button onClick={() => setDuration(d => Math.min(mode === "monthly" ? 12 : 30, d+1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 font-bold text-dark hover:bg-slate-50 transition-colors">+</button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(mode === "monthly" ? [1,2,3,6,12] : [1,3,7,14,30]).map(n => (
                  <button key={n} onClick={() => setDuration(n)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${duration === n ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-primary/10"}`}>
                    {n} {mode === "monthly" ? "mo" : "d"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Rent per {mode === "monthly" ? "month" : "night"} (₹)
              </label>
              <input type="number" value={rent} onChange={e => setRent(Number(e.target.value))}
                className="input-field font-mono" min={0} step={500} />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Security Deposit (₹)</label>
              <input type="number" value={deposit} onChange={e => setDeposit(Number(e.target.value))}
                className="input-field font-mono" min={0} step={1000} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-white">
              <p className="text-white/80 text-sm font-medium mb-1">Total Cost Estimate</p>
              <p className="text-5xl font-bold font-mono">₹{total.toLocaleString()}</p>
              <p className="text-white/70 text-sm mt-2">
                {duration} {mode === "monthly" ? "month(s)" : "night(s)"} + ₹{deposit.toLocaleString()} deposit
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <h3 className="font-bold text-dark">Payment Breakdown</h3>
              {[
                { label: `Rent (${duration}  ₹${rent.toLocaleString()})`, value: rent * duration, color: "text-dark" },
                { label: "Security Deposit",                                 value: deposit,         color: "text-dark" },
                { label: "Advance (25% — pay now)",                          value: advance,         color: "text-primary font-bold" },
                { label: "Remaining (pay on check-in)",                      value: remaining,       color: "text-slate-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className={`font-mono ${color}`}>₹{value.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold">
                <span className="text-dark">Total</span>
                <span className="font-mono text-primary text-lg">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                Security deposit is fully refundable within 2-3 business days after check-out, subject to no damages.
              </p>
            </div>

            <Link to="/hostels" className="btn-primary w-full justify-center flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Find Hostels & Book
            </Link>
          </div>
        </div>

        {hostels.length > 0 && (
          <div>
            <h2 className="font-heading font-bold text-dark text-xl mb-4">
              Hostels in your budget range
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hostels.filter((h: any) => (h.starting_monthly_price ?? h.starting_price ?? 0) <= rent + 1000).slice(0,3).map((h: any) => (
                <Link key={h.id} to={`/hostels/${h.slug}`}
                  className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-primary/30 hover:shadow-card-hover transition-all group">
                  <p className="font-semibold text-dark group-hover:text-primary transition-colors">{h.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{h.city}, {h.state}</p>
                  <p className="text-primary font-bold font-mono mt-2">
                    ₹{(h.starting_monthly_price ?? h.starting_price ?? 0).toLocaleString()}/mo
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}