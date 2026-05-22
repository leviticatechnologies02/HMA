import { useQuery } from "@tanstack/react-query";

import { fetchSupervisorStudents } from "../api/supervisor.api";

export function useSupervisorStudents(userId: string | null) {
  return useQuery({
    queryKey: ["supervisor-students", userId],
    queryFn: () => fetchSupervisorStudents(userId!),
    enabled: Boolean(userId)
  });
}
