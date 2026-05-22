import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, AlertCircle, ChevronLeft, CreditCard, Clock, Shield, Loader2 } from "lucide-react";
import { useInitiateBooking, usePatchBookingApplicant } from "../../hooks/useBooking";
import { useCreateBookingPayment } from "../../hooks/useBookingPayment";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../api/axiosInstance";
import { useBookingStore } from "../../store/bookingStore";
import loadRazorpayScript from "../../utils/loadRazorpaySDK";
import { formatDate } from "../../utils/formatters";


export function BookingCheckoutPage() {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.userId);
  const [error, setError] = useState<string | null>(null);
  // "preparing" = pre-creating booking on mount, "ready" = ready to pay, "paying" = Razorpay open, "done" = complete
  const [step, setStep] = useState<"preparing" | "ready" | "paying" | "done">("preparing");
  const preparedRef = useRef(false);

  const bookingStore = useBookingStore();
  const initiateBookingMutation = useInitiateBooking();
  const patchApplicantMutation = usePatchBookingApplicant();
  const createPaymentMutation = useCreateBookingPayment();

  const pricing = {
    nights: bookingStore.duration ?? 0,
    baseAmount: Math.max(0, (bookingStore.grandTotal || 0) - (bookingStore.securityDeposit || 0)),
    deposit: bookingStore.securityDeposit || 0,
    advance: bookingStore.bookingAdvance || 0,
  };

  // Guard: redirect if store is empty (and not done)
  useEffect(() => {
    if (step === "done") return;
    if (!bookingStore.hostelId || !bookingStore.roomId || !bookingStore.applicant) {
      navigate("/booking/select");
    }
  }, [bookingStore.hostelId, bookingStore.roomId, bookingStore.applicant, navigate, step]);

  // Pre-load Razorpay SDK so it's ready instantly when the user clicks 'Pay'
  useEffect(() => {
    loadRazorpayScript().catch(() => { });
  }, []);

  // Booking is pre-created in BookingDetailsPage onSubmit.
  // If bookingId already exists, go straight to ready. Otherwise do it here as fallback.
  useEffect(() => {
    if (preparedRef.current) return;
    if (!bookingStore.hostelId || !bookingStore.roomId || !bookingStore.bookingMode ||
      !bookingStore.checkInDate || !bookingStore.checkOutDate || !bookingStore.applicant || !userId) return;

    preparedRef.current = true;
    let cancelled = false;

    async function prepare() {
      try {
        // If booking already initiated (from details page), skip straight to ready
        if (bookingStore.bookingId) {
          if (!cancelled) setStep("ready");
          return;
        }

        // Fallback: initiate + patch here if somehow not done yet
        const initiated = await initiateBookingMutation.mutateAsync({
          hostel_id: bookingStore.hostelId!,
          room_id: bookingStore.roomId!,
          booking_mode: bookingStore.bookingMode!,
          check_in_date: bookingStore.checkInDate!,
          check_out_date: bookingStore.checkOutDate!,
          base_rent_amount: pricing.baseAmount,
          security_deposit: pricing.deposit,
          booking_advance: pricing.advance,
          grand_total: bookingStore.grandTotal,
        });
        if (cancelled) return;
        bookingStore.setDraftBooking(initiated.booking_id, initiated.booking_number);

        await patchApplicantMutation.mutateAsync({
          bookingId: initiated.booking_id,
          payload: bookingStore.applicant as any,
        });

        if (!cancelled) setStep("ready");
      } catch (err: any) {
        if (cancelled) return;
        preparedRef.current = false;
        setError(err?.response?.data?.detail ?? err?.message ?? "Failed to prepare booking. Please try again.");
        setStep("ready");
      }
    }

    void prepare();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handlePay = async () => {
    const bookingId = bookingStore.bookingId;
    const bookingNumber = bookingStore.bookingNumber;

    if (!bookingId || !bookingNumber) {
      setError("Booking not ready yet. Please wait a moment and try again.");
      return;
    }

    setStep("paying");
    setError(null);

    try {
      // ✅ LOAD SDK FIRST
      const isLoaded = await loadRazorpayScript();

      if (!isLoaded) {
        setError("Failed to load payment SDK. Please check your internet.");
        setStep("ready");
        return;
      }

      const paymentOrder = await createPaymentMutation.mutateAsync({
        bookingId,
        bookingAdvance: pricing.advance,
      });

      const rzpOrder = paymentOrder.razorpay_order;
      console.log(rzpOrder, 'from backend after cretae order')
      const rzp = new (window as any).Razorpay({
        key: rzpOrder.key_id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        order_id: rzpOrder.id,
        name: "StayEase",
        description: `Booking Advance - ${bookingNumber}`,

        handler: async () => {
          try {
            await api.post(`/bookings/${bookingId}/payment/verify`);
          } catch { }

          setStep("done");
          navigate("/booking/confirmation", {
            state: { bookingId, bookingNumber, status: "pending_approval" },
          });

          bookingStore.clearBooking();
        },

        modal: {
          ondismiss: () => {
            setError("Payment cancelled. Try again.");
            setStep("ready");
          },
        },

        prefill: {
          name: String((bookingStore.applicant as any)?.full_name ?? ""),
          contact: String((bookingStore.applicant as any)?.emergency_contact_phone ?? ""),
          email: String(useAuthStore.getState().user?.email ?? ""),
        },

        theme: { color: "#02934fff" },
      });

      rzp.open();

    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? "Payment failed. Please try again.");
      setStep("ready");
    }
  };

  if (!bookingStore.hostelId || !bookingStore.applicant) return null;

  const isPreparing = step === "preparing";
  const isPaying = step === "paying";

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark">Review & Pay</h1>
          <p className="mt-1 text-slate-500">Confirm your booking details before payment.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i < 2 ? "bg-success text-white" : "bg-primary text-white"
                }`}>
                {i < 2 ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {i < 2 && <div className="flex-1 h-1 bg-success rounded" />}
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Booking summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h2 className="font-bold text-dark">Booking Summary</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: "Guest", value: String((bookingStore.applicant as any).full_name ?? "") },
                { label: "Check-in", value: bookingStore.checkInDate ? formatDate(bookingStore.checkInDate) : "" },
                { label: "Check-out", value: bookingStore.checkOutDate ? formatDate(bookingStore.checkOutDate) : "" },
                { label: "Duration", value: `${pricing.nights} ${bookingStore.bookingMode === "monthly" ? "month(s)" : "night(s)"}` },
                { label: "Mode", value: bookingStore.bookingMode ?? "" },
                { label: "Emergency", value: String((bookingStore.applicant as any).emergency_contact_phone ?? "") },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-dark capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-bold text-dark flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Price Breakdown
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Room Rent ({pricing.nights} {bookingStore.bookingMode === "monthly" ? "month(s)" : "night(s)"})
                </span>
                <span className="font-medium">₹{pricing.baseAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Deposit</span>
                <span className="font-medium">₹{pricing.deposit.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-300 pt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Advance (25%)</span>
                  <span className="font-bold text-primary text-lg">₹{pricing.advance.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Remaining ₹{(pricing.baseAmount - pricing.advance).toLocaleString()} due on check-in.
                </p>
              </div>
              <div className="bg-white rounded-xl border-2 border-primary p-3">
                <div className="flex justify-between font-bold text-dark">
                  <span>Pay Now</span>
                  <span className="text-primary text-xl">₹{pricing.advance.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              Booking draft is held for 30 minutes. Complete payment to confirm.
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-warning/5 border border-warning/20 rounded-2xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold mb-1">Important</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Cancellation 24h before check-in — full refund</li>
                <li>Late cancellations attract 50% penalty</li>
                <li>Check-in from 11 AM. Early check-in subject to availability</li>
                <li>By confirming, you accept our terms and conditions</li>
              </ul>
            </div>
          </div>
        </div>

        {isPreparing && (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Preparing your booking...
          </div>
        )}

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-2xl p-4 flex gap-3 text-sm text-error">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            disabled={isPaying}
            className="btn-outline flex items-center gap-2 flex-1 justify-center disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handlePay}
            disabled={isPreparing || isPaying || !userId}
            className="btn-primary flex items-center gap-2 flex-1 justify-center disabled:opacity-50"
          >
            {isPreparing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</>
            ) : isPaying ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Opening Razorpay...</>
            ) : (
              <><Shield className="w-4 h-4" /> Pay ₹{pricing.advance.toLocaleString()}</>
            )}
          </button>
        </div>

        {!userId && (
          <p className="text-center text-sm text-warning">You must be logged in to complete booking.</p>
        )}
      </div>
    </div>
  );
}
