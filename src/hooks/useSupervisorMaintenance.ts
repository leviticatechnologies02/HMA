import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSupervisorMaintenance,
  fetchSupervisorMaintenance,
  updateSupervisorMaintenance,
  MaintenanceCreatePayload
} from "../api/supervisor.api";

export function useSupervisorMaintenance(userId: string | null) {
  return useQuery({
    queryKey: ["supervisor-maintenance", userId],
    queryFn: () => fetchSupervisorMaintenance(userId!),
    enabled: Boolean(userId)
  });
}

export function useCreateSupervisorMaintenance(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MaintenanceCreatePayload) => {
      if (!userId) {
        throw new Error("Supervisor login required.");
      }
      return createSupervisorMaintenance(userId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-maintenance", userId] });
    }
  });
}

export function useUpdateSupervisorMaintenance(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, payload }: { requestId: string; payload: Partial<MaintenanceCreatePayload> & { status?: string; assigned_vendor_name?: string; vendor_contact?: string; actual_cost?: number } }) => {
      if (!userId) throw new Error("Supervisor login required.");
      return updateSupervisorMaintenance(userId, requestId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-maintenance", userId] });
    }
  });
}
