import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchSupervisorComplaints,
  updateSupervisorComplaint,
  type SupervisorComplaintUpdatePayload
} from "../api/supervisor.api";
import toast from "react-hot-toast";

export function useSupervisorComplaints(userId: string | null) {
  return useQuery({
    queryKey: ["supervisor-complaints", userId],
    queryFn: () => fetchSupervisorComplaints(userId!),
    enabled: Boolean(userId)
  });
}

export function useUpdateSupervisorComplaint(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      complaintId,
      payload
    }: {
      complaintId: string;
      payload: SupervisorComplaintUpdatePayload;
    }) => updateSupervisorComplaint(userId!, complaintId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["supervisor-complaints", userId]
      });
      toast.success("Complaint updated successfully");
    }
  });
}
