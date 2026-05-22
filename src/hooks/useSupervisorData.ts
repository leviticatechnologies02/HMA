import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchSupervisorProfile,
  updateSupervisorProfile,
  changeSupervisorPassword,
  validateSupervisorPassword,
  type SupervisorProfile,
  type ChangePasswordPayload,
} from "../api/supervisor.api";

export function useSupervisorProfile(userId: string | null) {
  return useQuery({
    queryKey: ["supervisor-profile", userId],
    queryFn: () => fetchSupervisorProfile(userId!),
    enabled: Boolean(userId),
  });
}

export function useUpdateSupervisorProfile(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<SupervisorProfile>) =>
      updateSupervisorProfile(userId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["supervisor-profile", userId],
      });
    },
  });
}

export function useChangeSupervisorPassword(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      changeSupervisorPassword(userId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["supervisor-profile", userId],
      });
    },
  });
}

export function useValidateSupervisorPassword(userId: string | null) {
  return useMutation({
    mutationFn: (password: string) =>
      validateSupervisorPassword(userId!, password),
  });
}
