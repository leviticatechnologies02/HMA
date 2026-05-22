import { useQuery } from "@tanstack/react-query";

import { fetchMyBookings } from "../api/booking.api";

export function useMyBookings(userId: string | null) {
  return useQuery({
    queryKey: ["my-bookings", userId],
    queryFn: () => fetchMyBookings(),
    enabled: Boolean(userId)
  });
}
