import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSupervisorAttendance,
  fetchSupervisorAttendance,
  type SupervisorAttendancePayload
} from "../api/supervisor.api";

export function useSupervisorAttendance(userId: string | null) {
  return useQuery({
    queryKey: ["supervisor-attendance", userId],
    queryFn: () => fetchSupervisorAttendance(userId!),
    enabled: Boolean(userId)
  });
}

export function useCreateSupervisorAttendance(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SupervisorAttendancePayload) => createSupervisorAttendance(userId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["supervisor-attendance", userId]
      });
    }
  });
}
