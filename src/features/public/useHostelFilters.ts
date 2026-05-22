import { useState } from "react";

export interface HostelFilters {
  city?: string;
  hostel_type?: string;
  room_type?: string;
  min_price?: number;
  max_price?: number;
  booking_mode?: string;
  available_from?: string;
  sort?: string;
  page: number;
  page_size: number;
}

export function useHostelFilters(defaults: Partial<HostelFilters> = {}) {
  const [filters, setFilters] = useState<HostelFilters>({
    page: 1,
    page_size: 20,
    ...defaults,
  });

  function updateFilter<K extends keyof HostelFilters>(key: K, value: HostelFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === "page" ? (value as number) : 1 }));
  }

  function resetFilters() {
    setFilters({ page: 1, page_size: 20 });
  }

  return { filters, updateFilter, resetFilters };
}
