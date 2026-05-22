import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAdminBooking,
  fetchAdminBookings,
  rejectAdminBooking,
} from "../../api/admin.api";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function useAdminBookings(hostelId: string) {
  const { userId, hostelIds } = useCurrentUser();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "bookings", hostelId],
    queryFn: () => fetchAdminBookings(userId!, hostelId, hostelIds),
    enabled: !!userId && !!hostelId,
  });

  const approve = useMutation({
    mutationFn: ({ bookingId, bedId }: { bookingId: string; bedId: string }) =>
      approveAdminBooking(userId!, hostelIds, bookingId, bedId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "bookings", hostelId] }),
  });

  const reject = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      rejectAdminBooking(userId!, hostelIds, bookingId, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "bookings", hostelId] }),
  });

  return { ...query, approve, reject };
}
