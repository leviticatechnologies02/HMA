import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBookingPayment } from "../api/booking.api";

export function useCreateBookingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, bookingAdvance }: { bookingId: string; bookingAdvance: number }) =>
      createBookingPayment(bookingId, bookingAdvance),
    onSuccess: async (_, { bookingId }) => {
      // Invalidate booking details so the UI updates to show payment success
      await queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      // Invalidate bookings list if the user is on that page
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
