import { create } from "zustand";

type BookingState = {
  bookingId: string | null;
  bookingNumber: string | null;
  hostelId: string | null;
  roomId: string | null;
  bookingMode: "daily" | "monthly" | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  duration: number | null;
  dailyRent: number;
  monthlyRent: number;
  securityDeposit: number;
  bookingAdvance: number;
  grandTotal: number;
  applicant: Record<string, unknown> | null;
  setSelection: (payload: {
    hostelId: string;
    roomId: string;
    bookingMode: "daily" | "monthly";
    checkInDate: string;
    checkOutDate: string;
    duration: number;
    dailyRent: number;
    monthlyRent: number;
    securityDeposit: number;
    bookingAdvance: number;
    grandTotal: number;
  }) => void;
  setDraftBooking: (bookingId: string, bookingNumber: string) => void;
  setApplicant: (applicant: Record<string, unknown>) => void;
  clearBooking: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  bookingId: null,
  bookingNumber: null,
  hostelId: null,
  roomId: null,
  bookingMode: null,
  checkInDate: null,
  checkOutDate: null,
  duration: null,
  dailyRent: 0,
  monthlyRent: 0,
  securityDeposit: 0,
  bookingAdvance: 0,
  grandTotal: 0,
  applicant: null,
  setSelection: (payload) =>
    set({
      hostelId: payload.hostelId,
      roomId: payload.roomId,
      bookingMode: payload.bookingMode,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      duration: payload.duration,
      dailyRent: payload.dailyRent,
      monthlyRent: payload.monthlyRent,
      securityDeposit: payload.securityDeposit,
      bookingAdvance: payload.bookingAdvance,
      grandTotal: payload.grandTotal,
    }),
  setDraftBooking: (bookingId, bookingNumber) => set({ bookingId, bookingNumber }),
  setApplicant: (applicant) => set({ applicant }),
  clearBooking: () =>
    set({
      bookingId: null,
      bookingNumber: null,
      hostelId: null,
      roomId: null,
      bookingMode: null,
      checkInDate: null,
      checkOutDate: null,
      duration: null,
      dailyRent: 0,
      monthlyRent: 0,
      securityDeposit: 0,
      bookingAdvance: 0,
      grandTotal: 0,
      applicant: null,
    }),
}));
