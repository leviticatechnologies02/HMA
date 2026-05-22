import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSupervisorNotice,
  deleteSupervisorNotice,
  fetchSupervisorMessMenu,
  fetchSupervisorNotice,
  fetchSupervisorNotices,
  fetchSupervisorNoticesPaginated,
  toggleSupervisorNoticePublish,
  updateSupervisorNotice,
  type SupervisorNoticePayload,
  type SupervisorNotice,
} from "../api/supervisor.api";

export function useSupervisorNotices(userId: string | null) {
  return useQuery({
    queryKey: ["supervisor-notices", userId],
    queryFn: () => fetchSupervisorNotices(userId!),
    enabled: Boolean(userId),
  });
}

export function useSupervisorNoticesPaginated(
  userId: string | null,
  page: number,
  limit: number
) {
  return useQuery({
    queryKey: ["supervisor-notices", userId, page, limit],
    queryFn: () => fetchSupervisorNoticesPaginated(userId!, page, limit),
    enabled: Boolean(userId),
  });
}

export function useSupervisorNotice(userId: string | null, noticeId: string | null) {
  return useQuery({
    queryKey: ["supervisor-notice", userId, noticeId],
    queryFn: () => fetchSupervisorNotice(userId!, noticeId!),
    enabled: Boolean(userId && noticeId),
  });
}

export function useCreateSupervisorNotice(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SupervisorNoticePayload) => createSupervisorNotice(userId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["supervisor-notices", userId] });
    },
  });
}

export function useUpdateSupervisorNotice(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noticeId, payload }: { noticeId: string; payload: Partial<SupervisorNoticePayload> }) =>
      updateSupervisorNotice(userId!, noticeId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["supervisor-notices", userId] });
      await queryClient.invalidateQueries({ queryKey: ["supervisor-notice", userId, variables.noticeId] });
    },
  });
}

export function useToggleSupervisorNoticePublish(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noticeId: string) => toggleSupervisorNoticePublish(userId!, noticeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["supervisor-notices", userId] });
    },
  });
}

export function useDeleteSupervisorNotice(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noticeId: string) => deleteSupervisorNotice(userId!, noticeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["supervisor-notices", userId] });
    },
  });
}

export function useSupervisorMessMenu(userId: string | null) {
  return useQuery({
    queryKey: ["supervisor-mess-menu", userId],
    queryFn: () => fetchSupervisorMessMenu(userId!),
    enabled: Boolean(userId),
  });
}
