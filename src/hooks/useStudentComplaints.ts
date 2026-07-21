import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ComplaintCreatePayload,
  createStudentComplaint,
  deleteStudentComplaint,
  fetchStudentAttendance,
  fetchStudentBookings,
  fetchStudentComplaints,
  fetchStudentMessMenu,
  fetchStudentNotice,
  fetchStudentNoticeReadStatus,
  fetchStudentNotices,
  fetchStudentNoticesPaginated,
  fetchStudentPayments,
  fetchStudentProfile,
  fetchStudentWaitlist,
  markStudentNoticeRead,
  payRemainingStudentPayment,
} from "../api/student.api";

// retry: false prevents React Query from retrying 404s
// (student not checked in yet — no student record exists)
const NO_RETRY = { retry: false } as const;

export function useStudentProfile(userId: string | null) {
  return useQuery({
    queryKey: ["student-profile", userId],
    queryFn: () => fetchStudentProfile(userId!),
    enabled: Boolean(userId),
    ...NO_RETRY,
  });
}

export function useStudentBookings(userId: string | null) {
  return useQuery({
    queryKey: ["student-bookings", userId],
    queryFn: () => fetchStudentBookings(userId!),
    enabled: Boolean(userId),
    ...NO_RETRY,
  });
}

export function useStudentPayments(userId: string | null) {
  return useQuery({
    queryKey: ["student-payments", userId],
    queryFn: () => fetchStudentPayments(userId!),
    enabled: Boolean(userId),
    ...NO_RETRY,
  });
}

export function useStudentAttendance(userId: string | null) {
  return useQuery({
    queryKey: ["student-attendance", userId],
    queryFn: () => fetchStudentAttendance(userId!),
    enabled: Boolean(userId),
    ...NO_RETRY,
  });
}

export function useStudentNotices(userId: string | null) {
  return useQuery({
    queryKey: ["student-notices", userId],
    queryFn: () => fetchStudentNotices(userId!),
    enabled: Boolean(userId),
    ...NO_RETRY,
  });
}

export function useStudentNoticesPaginated(userId: string | null, page: number, limit: number) {
  return useQuery({
    queryKey: ["student-notices", userId, page, limit],
    queryFn: () => fetchStudentNoticesPaginated(userId!, page, limit),
    enabled: Boolean(userId),
    ...NO_RETRY,
  });
}

export function useStudentNotice(userId: string | null, noticeId: string | null) {
  return useQuery({
    queryKey: ["student-notice", userId, noticeId],
    queryFn: () => fetchStudentNotice(userId!, noticeId!),
    enabled: Boolean(userId && noticeId),
    ...NO_RETRY,
  });
}

export function useStudentNoticeReadStatus(userId: string | null) {
  return useQuery({
    queryKey: ["student-notice-read-status", userId],
    queryFn: () => fetchStudentNoticeReadStatus(userId!),
    enabled: Boolean(userId),
    ...NO_RETRY,
  });
}

export function useMarkStudentNoticeRead(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noticeId: string) => markStudentNoticeRead(userId!, noticeId),
    onSuccess: (_data, noticeId) => {
      queryClient.setQueryData<string[] | undefined>(
        ["student-notice-read-status", userId],
        (prev = []) => (prev && prev.includes(noticeId) ? prev : [...(prev ?? []), noticeId])
      );
    },
  });
}

export function useStudentMessMenu(userId: string | null) {
  return useQuery({
    queryKey: ["student-mess-menu", userId],
    queryFn: () => fetchStudentMessMenu(userId!),
    enabled: Boolean(userId),
    ...NO_RETRY,
  });
}

export function useStudentWaitlist(userId: string | null) {
  return useQuery({
    queryKey: ["student-waitlist", userId],
    queryFn: () => fetchStudentWaitlist(userId!),
    enabled: Boolean(userId),
    ...NO_RETRY,
  });
}

export function useStudentComplaints(userId: string | null) {
  return useQuery({
    queryKey: ["student-complaints", userId],
    queryFn: () => fetchStudentComplaints(userId!),
    enabled: Boolean(userId),
    ...NO_RETRY,
  });
}

export function useCreateStudentComplaint(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ComplaintCreatePayload) => {
      if (!userId) throw new Error("Student login required.");
      return createStudentComplaint(userId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-complaints", userId] });
    },
  });
}

export function useDeleteStudentComplaint(userId: string | null) { 
   const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (complaintId: string) => {
      if (!userId) throw new Error("Student login required.");
      return deleteStudentComplaint(userId, complaintId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-complaints", userId] });
    },
  }); 
}

export function usePayRemainingPayment(userId: string | null) {
  return useMutation({
    mutationFn: (payload: { booking_id: string }) => {
      if (!userId) throw new Error("Student login required.");
      return payRemainingStudentPayment(userId, payload);
    },
  });
}