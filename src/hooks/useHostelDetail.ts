import { useMutation, useQuery } from "@tanstack/react-query";

import { fetchHostelReviews, fetchHostelRooms, fetchPublicHostel, submitInquiry, type InquiryPayload } from "../api/public.api";

export function useHostelDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-hostel", slug],
    queryFn: () => fetchPublicHostel(slug!),
    enabled: Boolean(slug)
  });
}

export function useHostelRooms(hostelId: string | undefined) {
  return useQuery({
    queryKey: ["hostel-rooms", hostelId],
    queryFn: () => fetchHostelRooms(hostelId!),
    enabled: Boolean(hostelId)
  });
}

export function useHostelReviews(hostelId: string | undefined) {
  return useQuery({
    queryKey: ["hostel-reviews", hostelId],
    queryFn: () => fetchHostelReviews(hostelId!),
    enabled: Boolean(hostelId)
  });
}

export function useSubmitInquiry() {
  return useMutation({
    mutationFn: (payload: InquiryPayload) => submitInquiry(payload)
  });
}
