import { useBookingStore } from "../../store/bookingStore";

export function useBookingFlow() {
  const hostelId = useBookingStore((s) => s.hostelId);
  const roomId = useBookingStore((s) => s.roomId);
  const setSelection = useBookingStore((s) => s.setSelection);

  return { hostelId, roomId, setSelection };
}
