import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSuperAdminHostels,
  updateSuperAdminHostelStatus,
  type SuperAdminHostelPayload,
  createSuperAdminHostel,
} from "../../api/superAdmin.api";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export function useSuperAdminHostels() {
  const { userId } = useCurrentUser();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["super-admin", "hostels"],
    queryFn: () => fetchSuperAdminHostels(userId!),
    enabled: !!userId,
  });

  const updateStatus = useMutation({
    mutationFn: ({ hostelId, action }: { hostelId: string; action: "approve" | "reject" | "suspend" }) =>
      updateSuperAdminHostelStatus(userId!, hostelId, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin", "hostels"] }),
  });

  const create = useMutation({
    mutationFn: (payload: SuperAdminHostelPayload) => createSuperAdminHostel(userId!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-admin", "hostels"] }),
  });

  return { ...query, updateStatus, create };
}
