import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  assignSuperAdminAdminHostel,
  assignSuperAdminAdminHostels,
  cancelSuperAdminSubscription,
  createSuperAdminAdmin,
  createSuperAdminHostel,
  createSuperAdminSubscription,
  createSubscriptionFromPlan,
  deleteSuperAdminSubscription,
  fetchSuperAdminAdmins,
  fetchSuperAdminDashboard,
  fetchSuperAdminHostels,
  fetchSuperAdminHostelsPaginated,
  fetchSuperAdminSubscription,
  fetchSuperAdminSubscriptions,
  fetchPlanAutoFill,
  updateSuperAdminHostelStatus,
  updateSuperAdminSubscription,
  fetchSuperAdminProfile,
  updateSuperAdminProfile,
  changeSuperAdminPassword,
  validateSuperAdminPassword,
  fetchSuperAdminPlans,
  fetchSuperAdminPlan,
  createSuperAdminPlan,
  updateSuperAdminPlan,
  deleteSuperAdminPlan,
  toggleSuperAdminPlanStatus,
  type SuperAdminAdminPayload,
  type SuperAdminHostelPayload,
  type CreateSubscriptionFromPlanPayload,
} from "../api/superAdmin.api";

export function useSuperAdminProfile(userId: string | null) {
  return useQuery({
    queryKey: ["super-admin-profile", userId],
    queryFn: () => fetchSuperAdminProfile(userId!),
    enabled: Boolean(userId)
  });
}
export function useUpdateSuperAdminProfile(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => updateSuperAdminProfile(userId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-profile", userId] });
    }
  });
}
export function useChangePasswordSuperAdmin(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { old_password: string; new_password: string; confirm_password: string }) =>
      changeSuperAdminPassword(userId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-profile", userId] });
    }
  });
}
export function useValidatePasswordSuperAdmin(userId: string | null) {
  return useMutation({
    mutationFn: (password: string) => validateSuperAdminPassword(userId!, password),
  });
}
export function useSuperAdminDashboard(userId: string | null) {
  return useQuery({
    queryKey: ["super-admin-dashboard", userId],
    queryFn: () => fetchSuperAdminDashboard(userId!),
    enabled: Boolean(userId)
  });
}

export function useSuperAdminHostels(userId: string | null) {
  return useQuery({
    queryKey: ["super-admin-hostels", userId],
    queryFn: () => fetchSuperAdminHostels(userId!),
    enabled: Boolean(userId)
  });
}

export function useSuperAdminHostelsPaginated(
  userId: string | null,
  params: { status?: string; page?: number; per_page?: number }
) {
  return useQuery({
    queryKey: ["super-admin-hostels-paginated", userId, params],
    queryFn: () => fetchSuperAdminHostelsPaginated(userId!, params),
    enabled: Boolean(userId)
  });
}

export function useCreateSuperAdminHostel(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SuperAdminHostelPayload) => createSuperAdminHostel(userId!, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["super-admin-hostels", userId] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard", userId] })
      ]);
    }
  });
}

export function useUpdateSuperAdminHostelStatus(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hostelId,
      action,
      reason,
    }: { hostelId: string; action: "approve" | "reject" | "suspend"; reason?: string }) =>
      updateSuperAdminHostelStatus(userId!, hostelId, action, reason ? { reason } : undefined),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["super-admin-hostels", userId] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-hostels-paginated", userId] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard", userId] })
      ]);
    }
  });
}

export function useSuperAdminAdmins(userId: string | null) {
  return useQuery({
    queryKey: ["super-admin-admins", userId],
    queryFn: () => fetchSuperAdminAdmins(userId!),
    enabled: Boolean(userId)
  });
}

export function useCreateSuperAdminAdmin(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SuperAdminAdminPayload) => createSuperAdminAdmin(userId!, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["super-admin-admins", userId] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard", userId] })
      ]);
    }
  });
}

export function useAssignSuperAdminAdminHostels(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adminId, hostelIds }: { adminId: string; hostelIds: string[] }) =>
      assignSuperAdminAdminHostels(userId!, adminId, hostelIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-admins", userId] });
    }
  });
}

export function useAssignSuperAdminAdminHostel(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, hostelId, isPrimary }: { adminId: string; hostelId: string; isPrimary: boolean }) =>
      assignSuperAdminAdminHostel(userId!, adminId, { hostel_id: hostelId, is_primary: isPrimary }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-admins", userId] });
    }
  });
}

export function useSuperAdminSubscriptions(
  userId: string | null,
  params?: { status?: string; tier?: string; hostel_name?: string; start_date?: string; end_date?: string }
) {
  return useQuery({
    queryKey: ["super-admin-subscriptions", userId, params],
    queryFn: () => fetchSuperAdminSubscriptions(userId!, params),
    enabled: Boolean(userId)
  });
}

export function useSuperAdminSubscription(userId: string | null, id: string | null) {
  return useQuery({
    queryKey: ["super-admin-subscription", userId, id],
    queryFn: () => fetchSuperAdminSubscription(userId!, id!),
    enabled: Boolean(userId) && Boolean(id)
  });
}

export function useCreateSuperAdminSubscription(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => createSuperAdminSubscription(userId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-subscriptions", userId] });
    }
  });
}

export function useUpdateSuperAdminSubscription(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateSuperAdminSubscription(userId!, id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-subscriptions", userId] });
    }
  });
}

export function useCancelSuperAdminSubscription(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelSuperAdminSubscription(userId!, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-subscriptions", userId] });
    }
  });
}

export function useDeleteSuperAdminSubscription(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSuperAdminSubscription(userId!, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-subscriptions", userId] });
    }
  });
}

// ==================== PLAN-BASED SUBSCRIPTION HOOKS ====================

export function usePlanAutoFill(userId: string | null, planId: string | null) {
  return useQuery({
    queryKey: ["plan-auto-fill", userId, planId],
    queryFn: () => fetchPlanAutoFill(userId!, planId!),
    enabled: Boolean(userId && planId)
  });
}

export function useCreateSubscriptionFromPlan(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => 
      createSubscriptionFromPlan(userId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-subscriptions", userId] });
    }
  });
}

// ==================== PLAN HOOKS ====================

export function useSuperAdminPlans(
  userId: string | null,
  filters?: { status?: string; page?: number; per_page?: number }
) {
  return useQuery({
    queryKey: ["super-admin-plans", userId, filters],
    queryFn: () => fetchSuperAdminPlans(userId!, filters),
    enabled: Boolean(userId)
  });
}

export function useSuperAdminPlan(userId: string | null, planId: string | null) {
  return useQuery({
    queryKey: ["super-admin-plan", userId, planId],
    queryFn: () => fetchSuperAdminPlan(userId!, planId!),
    enabled: Boolean(userId && planId)
  });
}

export function useCreateSuperAdminPlan(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => createSuperAdminPlan(userId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-plans", userId] });
    }
  });
}

export function useUpdateSuperAdminPlan(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateSuperAdminPlan(userId!, id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-plans", userId] });
    }
  });
}

export function useDeleteSuperAdminPlan(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSuperAdminPlan(userId!, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-plans", userId] });
    }
  });
}

export function useToggleSuperAdminPlanStatus(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => toggleSuperAdminPlanStatus(userId!, planId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["super-admin-plans", userId] });
      await queryClient.invalidateQueries({ queryKey: ["super-admin-plan"] });
    }
  });
}
