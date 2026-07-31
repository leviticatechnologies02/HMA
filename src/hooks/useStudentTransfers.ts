import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStudentTransfers,
  createStudentTransfer,
  cancelStudentTransfer,
  CreateTransferPayload,
} from "../api/student.api";
import { useAuthStore } from "../store/authStore";

export function useStudentTransfers() {
  const userId = useAuthStore((s) => s.userId);

  return useQuery({
    queryKey: ["student-transfers", userId],
    queryFn: () => fetchStudentTransfers(userId!),
    enabled: Boolean(userId),
  });
}

export function useCreateStudentTransfer() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (payload: CreateTransferPayload) =>
      createStudentTransfer(userId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-transfers"] });
    },
  });
}

export function useCancelStudentTransfer() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (transferId: string) => cancelStudentTransfer(userId!, transferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-transfers"] });
    },
  });
}
