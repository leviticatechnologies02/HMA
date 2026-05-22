import { useMutation } from "@tanstack/react-query";
import {
  initiateBooking,
  patchBookingApplicant,
  type BookingApplicantPayload,
  type BookingInitiatePayload
} from "../api/booking.api";

export function useInitiateBooking() {
  return useMutation({
    mutationFn: (payload: BookingInitiatePayload) => initiateBooking(payload),
  });
}

export function usePatchBookingApplicant() {
  return useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: string; payload: BookingApplicantPayload }) =>
      patchBookingApplicant(bookingId, payload),
  });
}
