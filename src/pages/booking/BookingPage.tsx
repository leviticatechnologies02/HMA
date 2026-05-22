import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useInitiateBooking } from "../../hooks/useBooking";
import { useCreateBookingPayment } from "../../hooks/useBookingPayment";
import { useAuthStore } from "../../store/authStore";

const bookingSchema = z.object({
  hostel_id: z.string().min(1, "Hostel ID is required"),
  room_id: z.string().min(1, "Room ID is required"),
  bed_id: z.string().optional(),
  booking_mode: z.enum(["daily", "monthly"]),
  check_in_date: z.string().min(1, "Check-in date is required"),
  check_out_date: z.string().min(1, "Check-out date is required"),
  full_name: z.string().min(2, "Full name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["M", "F", "Other"]),
  occupation: z.string().min(1, "Occupation is required"),
  institution: z.string().min(1, "Institution is required"),
  current_address: z.string().min(1, "Address is required"),
  id_type: z.string().min(1, "ID type is required"),
  id_document_url: z.string().optional(),
  emergency_contact_name: z.string().min(1, "Emergency contact name is required"),
  emergency_contact_phone: z.string().min(1, "Emergency contact phone is required"),
  emergency_contact_relationship: z.string().min(1, "Relationship is required"),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  special_requirements: z.string().optional(),
  booking_advance: z.coerce.number().min(0)
});

type BookingFormValues = z.input<typeof bookingSchema>;
export function BookingPage() {
  const userId = useAuthStore((state) => state.userId);
  const mutation = useInitiateBooking();
  const paymentMutation = useCreateBookingPayment();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      booking_mode: "monthly",
      booking_advance: "1000"
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload = bookingSchema.parse(values);
    const checkIn = new Date(payload.check_in_date);
    const checkOut = new Date(payload.check_out_date);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000));
    const base = 800 * nights;
    const deposit = 2000;
    await mutation.mutateAsync({
      hostel_id: payload.hostel_id,
      room_id: payload.room_id,
      bed_id: payload.bed_id,
      booking_mode: payload.booking_mode,
      check_in_date: payload.check_in_date,
      check_out_date: payload.check_out_date,
      base_rent_amount: base,
      security_deposit: deposit,
      booking_advance: payload.booking_advance,
      grand_total: base + deposit,
    });
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Booking Flow</h1>
      <form className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium">Hostel ID</label>
          <input {...register("hostel_id")} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
          {errors.hostel_id ? <p className="mt-1 text-sm text-error">{errors.hostel_id.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Room ID</label>
          <input {...register("room_id")} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
          {errors.room_id ? <p className="mt-1 text-sm text-error">{errors.room_id.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Booking Mode</label>
          <select {...register("booking_mode")} className="w-full rounded-xl border border-slate-300 px-4 py-3">
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name</label>
          <input {...register("full_name")} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Check-in Date</label>
          <input type="date" {...register("check_in_date")} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Check-out Date</label>
          <input type="date" {...register("check_out_date")} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Booking Advance</label>
          <input type="number" {...register("booking_advance")} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
        </div>
        <div className="md:col-span-2">
          {!userId ? (
            <p className="text-sm text-warning">Login first to submit a booking.</p>
          ) : null}
          {mutation.isSuccess ? (
            <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-ink">
              <p className="font-semibold text-success">Booking submitted successfully.</p>
              <p className="mt-1">Booking Number: {mutation.data.booking_number}</p>
              <p>Status: {mutation.data.status}</p>
              <button
                type="button"
                className="mt-4 rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60"
                disabled={paymentMutation.isPending}
                onClick={() =>
                  paymentMutation.mutate({
                    bookingId: mutation.data.booking_id,
                    bookingAdvance: bookingSchema.parse({
                      ...mutation.variables
                    }).booking_advance
                  })
                }
              >
                {paymentMutation.isPending ? "Creating Payment..." : "Create Advance Payment Order"}
              </button>
              {paymentMutation.isSuccess ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-slate-700">
                  <p className="font-medium">Payment Order Ready</p>
                  <p className="mt-1">Order ID: {paymentMutation.data.razorpay_order.id}</p>
                  <p>Amount: ₹{(paymentMutation.data.razorpay_order.amount / 100).toFixed(2)}</p>
                </div>
              ) : null}
              {paymentMutation.isError ? (
                <p className="mt-3 text-sm text-error">
                  {paymentMutation.error instanceof Error
                    ? paymentMutation.error.message
                    : "Payment order creation failed."}
                </p>
              ) : null}
            </div>
          ) : null}
          {mutation.isError ? (
            <p className="text-sm text-error">
              {mutation.error instanceof Error ? mutation.error.message : "Booking failed."}
            </p>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {mutation.isPending ? "Submitting..." : "Submit Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
