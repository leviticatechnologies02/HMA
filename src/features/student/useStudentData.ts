import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudentComplaint,
  fetchStudentAttendance,
  fetchStudentBookings,
  fetchStudentComplaints,
  fetchStudentMessMenu,
  fetchStudentNotices,
  fetchStudentPayments,
  fetchStudentProfile,
  type ComplaintCreatePayload,
} from "../../api/student.api";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function useStudentProfile() {
  const { userId } = useCurrentUser();
  return useQuery({
    queryKey: ["student", "profile"],
    queryFn: () => fetchStudentProfile(userId!),
    enabled: !!userId,
  });
}

export function useStudentComplaints() {
  const { userId } = useCurrentUser();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["student", "complaints"],
    queryFn: () => fetchStudentComplaints(userId!),
    enabled: !!userId,
  });

  const create = useMutation({
    mutationFn: (payload: ComplaintCreatePayload) => createStudentComplaint(userId!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student", "complaints"] }),
  });

  return { ...query, create };
}

export function useStudentBookings() {
  const { userId } = useCurrentUser();
  return useQuery({
    queryKey: ["student", "bookings"],
    queryFn: () => fetchStudentBookings(userId!),
    enabled: !!userId,
  });
}

export function useStudentPayments() {
  const { userId } = useCurrentUser();
  return useQuery({
    queryKey: ["student", "payments"],
    queryFn: () => fetchStudentPayments(userId!),
    enabled: !!userId,
  });
}

export function useStudentAttendance() {
  const { userId } = useCurrentUser();
  return useQuery({
    queryKey: ["student", "attendance"],
    queryFn: () => fetchStudentAttendance(userId!),
    enabled: !!userId,
  });
}

export function useStudentNotices() {
  const { userId } = useCurrentUser();
  return useQuery({
    queryKey: ["student", "notices"],
    queryFn: () => fetchStudentNotices(userId!),
    enabled: !!userId,
  });
}

export function useStudentMessMenu() {
  const { userId } = useCurrentUser();
  return useQuery({
    queryKey: ["student", "mess-menu"],
    queryFn: () => fetchStudentMessMenu(userId!),
    enabled: !!userId,
  });
}
