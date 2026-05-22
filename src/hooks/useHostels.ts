import { useQuery } from "@tanstack/react-query";

import { fetchPublicHostels, fetchPublicHostel, fetchPublicCities, type PublicHostelsQueryParams } from "../api/public.api";

// ============ LIST HOSTELS HOOK ============
export function useHostels(params?: PublicHostelsQueryParams) {
  return useQuery({
    queryKey: ["public-hostels", params],
    queryFn: () => fetchPublicHostels(params),
    staleTime: 1000 * 60 * 5
  });
}

// ============ GET HOSTEL DETAIL HOOK ============
export function useHostelDetail(slug: string) {
  return useQuery({
    queryKey: ["hostel-detail", slug],
    queryFn: () => fetchPublicHostel(slug),
    staleTime: 1000 * 60 * 10,
    enabled: !!slug
  });
}

export function usePublicCities() {
  return useQuery({
    queryKey: ["public-cities"],
    queryFn: fetchPublicCities,
    staleTime: 1000 * 60 * 30
  });
}
