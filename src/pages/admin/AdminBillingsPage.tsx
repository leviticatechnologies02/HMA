import React, { useState } from "react";
import { Download, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  useAdminSubscription,
  useAdminPlans,
  useAdminBillingHistory,
  useCreateAdminCheckout,
  useSelectAdminPlan,
  useVerifyAdminPayment,
  useDownloadAdminInvoice,
} from "../../hooks/useAdminData";
import toast from "react-hot-toast";
import { type AdminPlan } from "../../api/admin.api";
 
export function AdminBillingsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;
 
  const getPlanPrice = (plan: AdminPlan | null | undefined) => {
    if (!plan) return 0;
    return plan.duration_days >= 365 ? (plan.price_yearly || plan.price) : plan.price;
  };
 
  const { data: subscription, isLoading: subLoading } = useAdminSubscription(userId, hostelIds, activeHostelId);
  const { data: plans = [], isLoading: plansLoading } = useAdminPlans(userId, hostelIds);
  const { data: history = [], isLoading: historyLoading } = useAdminBillingHistory(userId, hostelIds, activeHostelId);
 
  const checkoutMutation = useCreateAdminCheckout(userId, hostelIds, activeHostelId);
  const selectPlanMutation = useSelectAdminPlan(userId, hostelIds, activeHostelId);
  const downloadInvoiceMutation = useDownloadAdminInvoice(userId, hostelIds);
  const verifyPaymentMutation = useVerifyAdminPayment(
  userId,
  hostelIds
);
 
  const [selectedPlan, setSelectedPlan] = useState<AdminPlan | null>(null);
 
  const handleSelectPlan = (plan: AdminPlan) => {
    setSelectedPlan(plan);
    selectPlanMutation.mutate({
      plan_id: plan.id,
      plan_name: plan.name,
      duration_days: plan.duration_days,
      duration_type: plan.duration_type || "days",
      amount_due: getPlanPrice(plan),
      currency: "INR",
      features: []
    });
  };
 
 const handleCheckout = () => {
  console.log("Pay clicked");

  console.log({
    selectedPlan,
    activeHostelId,
    userId,
    hostelIds,
  });

  if (!selectedPlan) {
    console.log("No plan selected");
    toast.error("Select a plan first");
    return;
  }

  if (!activeHostelId) {
    console.log("No hostel id");
    toast.error("No hostel selected");
    return;
  }

  checkoutMutation.mutate(
    {
      plan_id: selectedPlan.id,
      hostel_id: activeHostelId,
    },
    {
     onSuccess: (data) => {
  console.log("Create Order Response:", data);

  const options = {
    key: data.key,
    amount: data.amount,
    currency: data.currency,
    order_id: data.order_id,

    name: "Hostel Management",
    description: selectedPlan.name,

    handler: function (response: any) {
      console.log("Razorpay Handler Called");
      console.log(response);

      verifyPaymentMutation.mutate(
        {
          billing_payment_id: data.billing_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        },
        {
          onSuccess: (verifyRes) => {
            console.log("Verify Success", verifyRes);
            toast.success(verifyRes.message);
          },
          onError: (error: any) => {
            console.log("Verify Error", error.response?.data);
            toast.error(
              error.response?.data?.detail ||
              error.response?.data?.message ||
              "Payment verification failed"
            );
          },
        }
      );
    },

    modal: {
      ondismiss: function () {
        console.log("Checkout closed");
      },
    },

    theme: {
      color: "#2563EB",
    },

    retry: {
      enabled: false,
    },
  };

  console.log("Opening Razorpay");

  const rzp = new (window as any).Razorpay(options);

  rzp.on("payment.failed", function (response: any) {
    console.log("Payment Failed");
    console.log(response.error);
  });

  rzp.open();
},

      onError: (err: any) => {
        console.log("ERROR", err);
        console.log(err?.response?.data);
      },
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
 
  const activePlanId = subscription?.plan_id;
  const currentSelectedPlan = selectedPlan || plans.find(p => p.id === activePlanId) || plans[0];
 
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
          <p className="text-xs text-slate-500 mt-1">{subscription?.billing_cycle || "N/A"}</p>
        </div>
        <div className="card p-6 border border-slate-200">
          <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-2">AMOUNT DUE</p>
          <p className="text-2xl font-bold text-dark">₹{subscription?.amount?.toLocaleString() || 0}</p>
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
              const isCurrent = plan.id === activePlanId;
              const isSelected = currentSelectedPlan?.id === plan.id;
 
              return (
                <div
                  key={plan.id}
                  className={`card p-5 transition-all duration-200 relative ${isSelected ? "border-primary border shadow-sm" : "border-slate-200 border"
                    }`}
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
                        ₹{getPlanPrice(plan).toLocaleString()}
                      </p>
                    </div>
                  </div>
 
                  <div className="flex justify-end">
                    {isCurrent ? (
                      <button
                        className="bg-green-600 text-white px-5 py-2 rounded-md text-xs font-medium cursor-default"
                        disabled
                        onClick={(e) => e.stopPropagation()}
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlan(plan);
                        }}
                        className={`px-6 py-2 rounded-md text-xs font-medium border transition ${isSelected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                          }`}
                      >
                        {isSelected ? "Selected" : "Select"}
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
              ₹{getPlanPrice(currentSelectedPlan).toLocaleString()}
            </span>
          </div>
 
          {currentSelectedPlan?.id === activePlanId ? (
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
                    <td className="px-6 py-4 text-slate-500 text-[13px]">{h.paid_at}</td>
                    <td className="px-6 py-4 font-bold text-dark text-[13px]">₹{h.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500 text-[13px]">{h.payment_provider}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-[11px] font-bold border border-green-200/50">
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(h.invoice_id || h.invoice_url) ? (
                        <button
                          onClick={() => {
                            if (h.invoice_id) {
                              downloadInvoiceMutation.mutate(h.invoice_id, {
                                onSuccess: async (data: any) => {
                                  // If the API returns JSON, Axios with responseType: 'blob' wraps it in a Blob
                                  // with type application/json
                                  if (data instanceof Blob && data.type.includes('application/json')) {
                                    const text = await data.text();
                                    const json = JSON.parse(text);
                                    if (json.invoice_html) {
                                      const newWindow = window.open('', '_blank');
                                      if (newWindow) {
                                        newWindow.document.write(json.invoice_html);
                                        newWindow.document.close();
                                        // Optional: Automatically trigger print dialog
                                        // newWindow.print();
                                      } else {
                                        toast.error("Please allow popups to view the invoice");
                                      }
                                    } else if (json.invoice_url || json.url) {
                                      window.open(json.invoice_url || json.url, '_blank');
                                    } else {
                                      toast.error("Invoice data not found in response");
                                    }
                                    return;
                                  }

                                  // Otherwise, treat it as a PDF blob
                                  const blob = new Blob([data], { type: 'application/pdf' });
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.setAttribute('download', `invoice-${h.invoice_number || h.invoice_id}.pdf`);
                                  document.body.appendChild(link);
                                  link.click();
                                  link.parentNode?.removeChild(link);
                                  setTimeout(() => window.URL.revokeObjectURL(url), 100);
                                },
                                onError: () => toast.error("Failed to fetch invoice")
                              });
                            } else {
                              window.open(h.invoice_url, '_blank');
                            }
                          }}
                          className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 font-bold text-[12px] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[13px]">-</span>
                      )}
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