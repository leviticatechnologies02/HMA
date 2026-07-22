import { api } from "./axiosInstance";
import { StudentPayment } from "./student.api";

type SuperAdminHeaders = {
  "x-user-id": string;
  "x-user-role": string;
};

function buildSuperAdminHeaders(userId: string): SuperAdminHeaders {
  return {
    "x-user-id": userId,
    "x-user-role": "super_admin"
  };
}

export type SuperAdminDashboard = {
  total_hostels?: number;
  pending_approval_count?: number;
  active_hostels?: number;
  total_students?: number;
  total_revenue_month?: number;
  hostels: number;
  admins: number;
  subscriptions: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  per_page: number;
};

export type SuperAdminHostel = {
  id: string;
  name: string;
  slug: string;
  description: string;
  hostel_type: string;
  status: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string | null;
  is_featured: boolean;
  is_public: boolean;
  rules_and_regulations?: string | null;
  created_at: string;
  updated_at: string;
};

export type SuperAdminHostelPayload = {
  name: string;
  slug: string;
  description: string;
  hostel_type: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string | null;
  is_featured?: boolean;
  is_public?: boolean;
  rules_and_regulations?: string | null;
};

export type SuperAdminAdmin = {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type SuperAdminAdminPayload = {
  email: string;
  phone: string;
  full_name: string;
  password: string;
};

export type SuperAdminSubscription = {
  id: string;
  hostel_id: string;
  hostel_name: string;
  tier: string;
  price_monthly: number;
  start_date: string;
  end_date: string;
  status: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
};

export async function fetchSuperAdminProfile(userId: string) {
  const response = await api.get<SuperAdminAdmin>("/super-admin/profile", {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function updateSuperAdminProfile(userId: string, payload: Partial<SuperAdminAdmin>) {
  const response = await api.patch<SuperAdminAdmin>("/super-admin/profile", payload, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}
export async function changeSuperAdminPassword(userId: string, payload: { old_password: string; confirm_password: string }) {
  const response = await api.post("/super-admin/change-password", payload, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}
export async function validateSuperAdminPassword(userId: string, password: string) {
  const response = await api.post("/super-admin/validate-password", { password }, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function fetchSuperAdminDashboard(userId: string) {
  const response = await api.get<SuperAdminDashboard>("/super-admin/dashboard", {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function fetchSuperAdminHostels(userId: string) {
  const response = await api.get<SuperAdminHostel[]>("/super-admin/hostels", {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function fetchSuperAdminHostelsPaginated(
  userId: string,
  params: { status?: string; page?: number; per_page?: number } = {}
) {
  const response = await api.get<PaginatedResponse<SuperAdminHostel>>("/super-admin/hostels/paginated", {
    headers: buildSuperAdminHeaders(userId),
    params,
  });
  return response.data;
}

export async function createSuperAdminHostel(userId: string, payload: SuperAdminHostelPayload) {
  const response = await api.post<SuperAdminHostel>("/super-admin/hostels", payload, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function updateSuperAdminHostelStatus(
  userId: string,
  hostelId: string,
  action: "approve" | "reject" | "suspend",
  payload?: { reason?: string }
) {
  const response = await api.post<SuperAdminHostel>(
    `/super-admin/hostels/${hostelId}/${action}`,
    payload ?? {},
    { headers: buildSuperAdminHeaders(userId) }
  );
  return response.data;
}

export async function fetchSuperAdminAdmins(userId: string) {
  const response = await api.get<SuperAdminAdmin[]>("/super-admin/admins", {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function createSuperAdminAdmin(userId: string, payload: SuperAdminAdminPayload) {
  const response = await api.post<SuperAdminAdmin>("/super-admin/admins", payload, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function assignSuperAdminAdminHostels(userId: string, adminId: string, hostelIds: string[]) {
  const response = await api.post<{ admin_id: string; hostel_ids: string[] }>(
    `/super-admin/admins/${adminId}/assign-hostels`,
    { hostel_ids: hostelIds },
    { headers: buildSuperAdminHeaders(userId) }
  );
  return response.data;
}

export async function assignSuperAdminAdminHostel(
  userId: string,
  adminId: string,
  payload: { hostel_id: string; is_primary: boolean }
) {
  const response = await api.post<{ admin_id: string; hostel_id: string; is_primary: boolean }>(
    `/super-admin/admins/${adminId}/assign-hostel`,
    payload,
    { headers: buildSuperAdminHeaders(userId) }
  );
  return response.data;
}

export async function unassignSuperAdminAdminHostel(
  userId: string,
  adminId: string,
  hostelId: string
) {
  const response = await api.delete<{ message: string }>(
    `/super-admin/admins/${adminId}/hostels/${hostelId}`,
    { headers: buildSuperAdminHeaders(userId) }
  );
  return response.data;
}

export async function fetchSuperAdminSubscriptions(
  userId: string,
  params?: { status?: string; tier?: string; hostel_name?: string; start_date?: string; end_date?: string }
) {
  const response = await api.get<SuperAdminSubscription[]>("/super-admin/subscriptions", {
    headers: buildSuperAdminHeaders(userId),
    params
  });
  return response.data;
}

export async function fetchSuperAdminSubscription(userId: string, id: string) {
  const response = await api.get<SuperAdminSubscription>(`/super-admin/subscriptions/${id}`, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function createSuperAdminSubscription(
  userId: string,
  payload: { hostel_id: string; tier: string; price_monthly: number; start_date: string; end_date: string; status?: string; auto_renew?: boolean; }
) {
  const response = await api.post<SuperAdminSubscription>("/super-admin/subscriptions", payload, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function updateSuperAdminSubscription(
  userId: string,
  id: string,
  payload: Partial<{ tier: string; price_monthly: number; status: string; auto_renew: boolean; end_date: string; start_date: string; }>
) {
  const response = await api.patch<SuperAdminSubscription>(`/super-admin/subscriptions/${id}`, payload, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function cancelSuperAdminSubscription(userId: string, id: string) {
  const response = await api.post<SuperAdminSubscription>(
    `/super-admin/subscriptions/${id}/cancel`,
    {},
    { headers: buildSuperAdminHeaders(userId) }
  );
  return response.data;
}

export async function deleteSuperAdminSubscription(userId: string, id: string) {
  const response = await api.delete<{ message: string }>(`/super-admin/subscriptions/${id}`, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

// ==================== PLAN-BASED SUBSCRIPTION ====================

export type PlanAutoFillData = {
  tier: string;
  price_monthly: number;
  duration_days: number;
};

export type CreateSubscriptionFromPlanPayload = {
  hostel_id: string;
  plan_id: string;
  start_date: string;
  auto_renew: boolean;
};

export async function fetchPlanAutoFill(userId: string, planId: string) {
  const response = await api.get<PlanAutoFillData>(
    `/plans/${planId}/auto-fill`,
    { headers: buildSuperAdminHeaders(userId) }
  );
  return response.data;
}

export async function createSubscriptionFromPlan(
  userId: string,
  payload: {
    hostel_id: string;
    plan_id: string;
    start_date: string;
    auto_renew: boolean;
    tier: string;
    price_monthly: number;
    end_date: string;
    status: string;
  }
) {
  // Remove plan_id as it's not part of the backend schema
  const { plan_id, ...backendPayload } = payload;
  
  const response = await api.post<SuperAdminSubscription>(
    `/super-admin/subscriptions`,
    backendPayload,
    { headers: buildSuperAdminHeaders(userId) }
  );
  return response.data;
}

export async function addSuperAdminHostelImages(
  userId: string,
  hostelId: string,
  images: Array<{ url: string; is_primary?: boolean; caption?: string }>
) {
  const response = await api.post(
    `/super-admin/hostels/${hostelId}/images`,
    images,
    { headers: buildSuperAdminHeaders(userId) }
  );
  return response.data;
}

// ==================== PLAN FUNCTIONS ====================

export type PlanFeature = {
  feature_name: string;
  feature_value: string;
  is_included: boolean;
  sort_order: number;
};

export type SuperAdminPlan = {
  id: string;
  name: string;
  code: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  duration_type: string;
  duration_days: number;
  hostel_limit: number;
  admin_limit: number;
  auto_renew_allowed: boolean;
  status: string;
  sort_order: number;
  features: PlanFeature[];
  created_at: string;
  updated_at: string;
};

export async function fetchSuperAdminPlans(
  userId: string,
  filters?: { status?: string; page?: number; per_page?: number }
) {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.per_page) params.append("per_page", String(filters.per_page));

  const response = await api.get<PaginatedResponse<SuperAdminPlan>>(
    `/plans/plans?${params.toString()}`,
    { headers: buildSuperAdminHeaders(userId) }
  );
  return response.data;
}

export async function fetchSuperAdminPlan(userId: string, planId: string) {
  const response = await api.get<SuperAdminPlan>(`/plans/plans/${planId}`, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function createSuperAdminPlan(
  userId: string,
  payload: Partial<SuperAdminPlan>
) {
  const response = await api.post<SuperAdminPlan>("/plans/plans", payload, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function updateSuperAdminPlan(
  userId: string,
  planId: string,
  payload: Partial<SuperAdminPlan>
) {
  const response = await api.patch<SuperAdminPlan>(`/plans/plans/${planId}`, payload, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function deleteSuperAdminPlan(userId: string, planId: string) {
  const response = await api.delete<{ message: string }>(`/plans/plans/${planId}`, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function toggleSuperAdminPlanStatus(userId: string, planId: string) {
  const response = await api.patch<SuperAdminPlan>(`/plans/plans/${planId}/toggle-status`, {}, {
    headers: buildSuperAdminHeaders(userId)
  });
  return response.data;
}

export async function fetchSuperAdminPayments(userId: string): Promise<StudentPayment[]> {
  const response = await api.get<any>("/super-admin/payments", {
    headers: buildSuperAdminHeaders(userId)
  });
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.payments && Array.isArray(data.payments)) return data.payments;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
}

export async function deleteSuperAdminHostel(
  userId: string,
  hostelId: string
) {
  const response = await api.delete(
    `/super-admin/hostels/${hostelId}`,
    {
      headers: {
        "x-user-id": userId,
        "x-user-role": "super_admin",
      },
    }
  );

  return response.data;
}
