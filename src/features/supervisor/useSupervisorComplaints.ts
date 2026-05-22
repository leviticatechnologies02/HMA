import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSupervisorComplaints,
  updateSupervisorComplaint,
  type SupervisorComplaintUpdatePayload,
} from "../../api/supervisor.api";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function useSupervisorComplaints() {
  const { userId } = useCurrentUser();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["supervisor", "complaints"],
    queryFn: () => fetchSupervisorComplaints(userId!),
    enabled: !!userId,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SupervisorComplaintUpdatePayload }) =>
      updateSupervisorComplaint(userId!, id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supervisor", "complaints"] }),
  });

  return { ...query, update };
}
