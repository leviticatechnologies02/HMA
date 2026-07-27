import React, { useState } from "react";
import { Download, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { 
  useAdminSubscription, 
  useAdminPlans, 
  useAdminBillingHistory, 
  useCreateAdminCheckout 
} from "../../hooks/useAdminData";
import toast from "react-hot-toast";
import { type AdminPlan } from "../../api/admin.api";

export function AdminBillingsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;

  const { data: subscription, isLoading: subLoading } = useAdminSubscription(userId, hostelIds, activeHostelId);
  const { data: plans = [], isLoading: plansLoading } = useAdminPlans(userId, hostelIds);
  const { data: history = [], isLoading: historyLoading } = useAdminBillingHistory(userId, hostelIds, activeHostelId);
  
  const checkoutMutation = useCreateAdminCheckout(userId, hostelIds, activeHostelId);

  const [selectedPlan, setSelectedPlan] = useState<AdminPlan | null>(null);

  const handleSelectPlan = (plan: AdminPlan) => {
    setSelectedPlan(plan);
  };

  const handleCheckout = () => {
    if (!selectedPlan) return;
    checkoutMutation.mutate(
      { plan_id: selectedPlan.id, duration: selectedPlan.duration_days },
      {
        onSuccess: () => {
          toast.success("Checkout initiated successfully");
        },
        onError: () => {
          toast.error("Failed to initiate checkout");
        }
      }
    );
  };

  const isLoading = subLoading || plansLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="p-8 text-center flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const activePlanCode = subscription?.plan_code;
  const currentSelectedPlan = selectedPlan || plans.find(p => p.code === activePlanCode) || plans[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-800">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-dark">Payment Settings</h1>
        <p className="text-sm text-slate-500">Manage your plan, payment, and invoices.</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 border border-slate-200">
          <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-2">CURRENT PLAN</p>
          <p className="text-2xl font-bold text-dark">{subscription?.plan_name || "N/A"}</p>
          <p className="text-xs text-slate-500 mt-1">{subscription?.cycle || "N/A"}</p>
        </div>
        <div className="card p-6 border border-slate-200">
          <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-2">AMOUNT DUE</p>
          <p className="text-2xl font-bold text-dark">₹{subscription?.amount_due?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500 mt-1">No upgrade selected</p>
        </div>
        <div className="card p-6 border border-slate-200">
          <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-2">LAST PAYMENT</p>
          <p className="text-2xl font-bold text-dark">{subscription?.last_payment_date || "N/A"}</p>
          <p className="text-xs text-slate-500 mt-1">{subscription?.last_payment_status || "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Available Plans */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-1">
            <div>
              <h2 className="font-bold text-lg text-dark">Available Plans</h2>
              <p className="text-sm text-slate-500">Choose a plan, then confirm payment.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-medium mt-2 sm:mt-0 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              Razorpay ready
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.code === activePlanCode;
              const isSelected = currentSelectedPlan?.id === plan.id;
              
              return (
                <div 
                  key={plan.id}
                  className={`card p-5 transition-all duration-200 cursor-pointer relative ${
                    isSelected ? "border-primary border shadow-sm" : "border-slate-200 border"
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  <div className="flex justify-between items-start mb-6">
  <div>
    {isCurrent && (
      <span className="inline-flex items-center mb-2 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold uppercase">
        Active
      </span>
    )}

    <h3 className="text-[17px] font-bold text-dark">{plan.name}</h3>
    <p className="text-[13px] text-slate-500 mt-0.5">
      {plan.duration_days}-day cycle
    </p>
  </div>

  <div className="text-right">
    <p className="text-xl font-bold text-dark">
      ₹{plan.price_monthly.toLocaleString()}
    </p>
  </div>
</div>

                 <div className="flex justify-end">
  {isCurrent ? (
    <button
      className="bg-green-600 text-white px-5 py-2 rounded-md text-xs font-medium cursor-default"
      disabled
    >
      Current Plan
    </button>
  ) : (
    <button
      className={`px-6 py-2 rounded-md text-xs font-medium border transition ${
        isSelected
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
      }`}
    >
      Select
    </button>
  )}
</div>

                  
                  {plan.name === "Premium" && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Checkout Sidebar */}
        <div className="xl:col-span-1 card p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-dark text-lg">Checkout</h2>
              <p className="text-[13px] text-slate-500">Review before payment.</p>
            </div>
          </div>

          <div className="space-y-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-500">Selected plan</span>
              <span className="font-bold text-dark">{currentSelectedPlan?.name || "-"}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-500">Duration</span>
              <span className="font-bold text-dark">{currentSelectedPlan?.duration_days ? `${currentSelectedPlan.duration_days} days` : "-"}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-[13px] text-slate-500">Amount due</span>
            <span className="text-2xl font-bold text-dark">
              ₹{currentSelectedPlan?.price_monthly.toLocaleString() || 0}
            </span>
          </div>

          {currentSelectedPlan?.code === activePlanCode ? (
            <button className="w-full py-2.5 bg-blue-300 text-white font-medium rounded-lg text-sm cursor-not-allowed">
              Current Plan Active
            </button>
          ) : (
            <button 
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white flex justify-center items-center gap-2 rounded-lg text-sm font-medium"
            >
              {checkoutMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Pay Now
            </button>
          )}

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            Payment verification refreshes your plan and invoice list automatically.
          </p>
        </div>
      </div>

      {/* Payment History */}
      <div className="card border border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-lg text-dark">Payment History</h2>
          <p className="text-[13px] text-slate-500">Recent payments and downloadable invoices.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-[10px] text-slate-400 font-bold tracking-widest uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">PAYMENT ID</th>
                <th className="px-6 py-4">PLAN</th>
                <th className="px-6 py-4">DATE</th>
                <th className="px-6 py-4">AMOUNT</th>
                <th className="px-6 py-4">PROVIDER</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">INVOICE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[13px] text-slate-500">
                    No payment history found
                  </td>
                </tr>
              ) : (
                history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-600 text-[13px]">{h.payment_id}</td>
                    <td className="px-6 py-4 font-bold text-dark text-[13px]">{h.plan_name}</td>
                    <td className="px-6 py-4 text-slate-500 text-[13px]">{h.date}</td>
                    <td className="px-6 py-4 font-bold text-dark text-[13px]">₹{h.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500 text-[13px]">{h.provider}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-[11px] font-bold border border-green-200/50">
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href={h.invoice_url} className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 font-bold text-[12px] transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
