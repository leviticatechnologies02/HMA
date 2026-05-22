import { api } from "./axiosInstance";

export interface BookingInitiatePayload {
  hostel_id: string;
  room_id: string;
  bed_id?: string;
  booking_mode: "daily" | "monthly";
  check_in_date: string;
  check_out_date: string;
  base_rent_amount: number;
  security_deposit: number;
  booking_advance: number;
  grand_total: number;
}

export interface BookingApplicantPayload {
  full_name: string;
  date_of_birth?: string;
  gender?: "M" | "F" | "Other";
  occupation?: string;
  institution?: string;
  current_address?: string;
  id_type?: string;
  id_document_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  guardian_name?: string;
  guardian_phone?: string;
  special_requirements?: string;
}

export interface BookingInitiateResponse {
  booking_id: string;
  booking_number: string;
  status: string;
  pricing: {
    base_rent_amount: number;
    security_deposit: number;
    booking_advance: number;
    grand_total: number;
  };
}

export interface Booking {
  id: string;
  booking_number: string;
  visitor_id: string;
  status: string;
  booking_mode: "daily" | "monthly";
  hostel_id: string;
  room_id: string;
  bed_id?: string | null;
  check_in_date: string;
  check_out_date: string;
  base_rent_amount: number;
  security_deposit: number;
  booking_advance: number;
  grand_total: number;
  full_name?: string | null;
  gender?: string | null;
  occupation?: string | null;
  institution?: string | null;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingPaymentOrder {
  payment: {
    id: string;
    hostel_id: string;
    booking_id?: string | null;
    amount: number;
    payment_type: string;
    payment_method: string;
    gateway_order_id?: string | null;
    status: string;
    due_date?: string | null;
    paid_at?: string | null;
    created_at: string;
    updated_at: string;
  };
  razorpay_order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    key_id: string;
    notes?: Record<string, string>;
  };
}

export interface BookingStatusHistoryItem {
  id: string;
  booking_id: string;
  old_status?: string | null;
  new_status: string;
  changed_by?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaitlistJoinPayload {
  hostel_id: string;
  room_id: string;
  bed_id?: string;
  booking_mode: "daily" | "monthly";
  check_in_date: string;
  check_out_date: string;
}

export interface WaitlistEntry {
  id: string;
  visitor_id: string;
  hostel_id: string;
  room_id: string;
  bed_id?: string | null;
  booking_mode: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export async function initiateBooking(payload: BookingInitiatePayload) {
  const response = await api.post<BookingInitiateResponse>("/bookings/initiate", payload);
  return response.data;
}

export async function patchBookingApplicant(bookingId: string, payload: BookingApplicantPayload) {
  const response = await api.patch<Booking>(`/bookings/${bookingId}`, payload);
  return response.data;
}

export async function fetchBookingById(bookingId: string) {
  const response = await api.get<Booking>(`/bookings/${bookingId}`);
  return response.data;
}

export async function fetchBookingHistory(bookingId: string) {
  const response = await api.get<BookingStatusHistoryItem[]>(`/bookings/${bookingId}/history`);
  return response.data;
}

export async function joinWaitlist(payload: WaitlistJoinPayload) {
  const response = await api.post<WaitlistEntry>("/bookings/waitlist/join", payload);
  return response.data;
}

export async function fetchMyWaitlist() {
  const response = await api.get<WaitlistEntry[]>("/bookings/waitlist/my");
  return response.data;
}

export async function leaveWaitlistEntry(entryId: string) {
  await api.delete(`/bookings/waitlist/${entryId}`);
}

export async function cancelBookingById(bookingId: string, reason?: string) {
  const response = await api.post<Booking>(`/bookings/${bookingId}/cancel`, { reason: reason ?? null });
  return response.data;
}

export async function fetchMyBookings() {
  const response = await api.get<Booking[]>("/visitor/bookings");
  return response.data;
}

export async function createBookingPayment(
  bookingId: string,
  bookingAdvance: number
) {
  const response = await api.post<BookingPaymentOrder>(
    `/bookings/${bookingId}/payment`,
    { booking_advance: bookingAdvance, payment_method: "razorpay" },
  );
  return response.data;
}
