import { useQuery } from "@tanstack/react-query";

import { fetchSupervisorDashboard, fetchSupervisorNoticesPaginated } from "../api/supervisor.api";

export function useSupervisorDashboard(userId: string | null) {
  const dashboardQuery = useQuery({
    queryKey: ["supervisor-dashboard", userId],
    queryFn: () => fetchSupervisorDashboard(userId!),
    enabled: Boolean(userId)
  });

  const noticesQuery = useQuery({
    queryKey: ["supervisor-notices-paginated", userId],
    queryFn: () => fetchSupervisorNoticesPaginated(userId!, 1, 1),
    enabled: Boolean(userId)
  });

  return {
    data: dashboardQuery.data && noticesQuery.data ? {
      ...dashboardQuery.data,
      notices: noticesQuery.data.total,
    } : dashboardQuery.data,
    isLoading: dashboardQuery.isLoading || noticesQuery.isLoading,
  };
}
