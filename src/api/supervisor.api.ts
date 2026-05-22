import { api } from "./axiosInstance";

export type MaintenanceRequest = {
  id: string;
  hostel_id: string;
  room_id?: string | null;
  reported_by: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  assigned_vendor_name?: string | null;
  vendor_contact?: string | null;
  requires_admin_approval: boolean;
  approved_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type MaintenanceCreatePayload = {
  room_id?: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  estimated_cost?: number;
};

export type SupervisorAttendanceRecord = {
  id: string;
  student_id: string;
  hostel_id: string;
  date: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status: string;
  marked_by: string;
  method: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
};

export type SupervisorAttendancePayload = {
  student_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: string;
  method: string;
  remarks?: string;
};

export type SupervisorComplaint = {
  id: string;
  complaint_number: string;
  student_id: string;
  hostel_id: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  sla_deadline: string;
  sla_breached: boolean;
  created_at: string;
  updated_at: string;
};

export type SupervisorComplaintUpdatePayload = {
  status?: string;
  assigned_to?: string;
  resolution_notes?: string;
};

export type SupervisorNotice = {
  id: string;
  hostel_id?: string | null;
  title: string;
  content: string;
  notice_type: string;
  priority: string;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SupervisorNoticePayload = {
  title: string;
  content: string;
  notice_type: string;
  priority: string;
  is_published: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  per_page: number;
};

export type SupervisorMessMenu = {
  id: string;
  hostel_id: string;
  week_start_date: string;
  is_active: boolean;
  day_of_week: string;
  meal_type: string;
  item_name: string;
  is_veg: boolean;
  special_note?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SupervisorStudent = {
  id: string;
  user_id: string;
  hostel_id: string;
  room_id: string;
  bed_id: string;
  booking_id: string;
  student_number: string;
  full_name?: string | null;
  check_in_date: string;
  check_out_date?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SupervisorDashboard = {
  students: number;
  complaints: number;
  attendance_records: number;
  maintenance_requests: number;
  notices: number;
  hostels: number;
};

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export type SupervisorProfile = {
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

function buildSupervisorHeaders(userId: string) {
  return {
    "x-user-id": userId,
    "x-user-role": "supervisor"
  };
}

export async function fetchSupervisorMaintenance(userId: string) {
  const response = await api.get<MaintenanceRequest[]>("/supervisor/maintenance", {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function createSupervisorMaintenance(userId: string, payload: MaintenanceCreatePayload) {
  const response = await api.post<MaintenanceRequest>("/supervisor/maintenance", payload, {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function fetchSupervisorAttendance(userId: string) {
  const response = await api.get<SupervisorAttendanceRecord[]>("/supervisor/attendance", {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function createSupervisorAttendance(userId: string, payload: SupervisorAttendancePayload) {
  const response = await api.post<SupervisorAttendanceRecord>("/supervisor/attendance", payload, {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function fetchSupervisorComplaints(userId: string) {
  const response = await api.get<SupervisorComplaint[]>("/supervisor/complaints", {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function updateSupervisorComplaint(
  userId: string,
  complaintId: string,
  payload: SupervisorComplaintUpdatePayload
) {
  const response = await api.patch<SupervisorComplaint>(`/supervisor/complaints/${complaintId}`, payload, {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function fetchSupervisorNotices(userId: string) {
  const response = await api.get<SupervisorNotice[]>("/supervisor/notices", {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function fetchSupervisorNoticesPaginated(
  userId: string,
  page = 1,
  limit = 10
) {
  const response = await api.get<PaginatedResponse<SupervisorNotice>>("/supervisor/notices/paginated", {
    headers: buildSupervisorHeaders(userId),
    params: { page, limit },
  });
  return response.data;
}

export async function fetchSupervisorNotice(userId: string, noticeId: string) {
  const response = await api.get<SupervisorNotice>(`/supervisor/notices/${noticeId}`, {
    headers: buildSupervisorHeaders(userId),
  });
  return response.data;
}

export async function createSupervisorNotice(userId: string, payload: SupervisorNoticePayload) {
  const response = await api.post<SupervisorNotice>("/supervisor/notices", payload, {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function updateSupervisorNotice(
  userId: string,
  noticeId: string,
  payload: Partial<SupervisorNoticePayload>
) {
  const response = await api.patch<SupervisorNotice>(`/supervisor/notices/${noticeId}`, payload, {
    headers: buildSupervisorHeaders(userId),
  });
  return response.data;
}

export async function toggleSupervisorNoticePublish(userId: string, noticeId: string) {
  const response = await api.patch<SupervisorNotice>(`/supervisor/notices/${noticeId}/toggle-publish`, {}, {
    headers: buildSupervisorHeaders(userId),
  });
  return response.data;
}

export async function deleteSupervisorNotice(userId: string, noticeId: string) {
  const response = await api.delete(`/supervisor/notices/${noticeId}`, {
    headers: buildSupervisorHeaders(userId),
  });
  return response.data;
}

export async function fetchSupervisorMessMenu(userId: string) {
  const response = await api.get<SupervisorMessMenu[]>("/supervisor/mess-menu", {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function fetchSupervisorStudents(userId: string) {
  const response = await api.get<SupervisorStudent[]>("/supervisor/students", {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function fetchSupervisorDashboard(userId: string) {
  const response = await api.get<SupervisorDashboard>("/supervisor/dashboard", {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function updateSupervisorMaintenance(
  userId: string,
  requestId: string,
  payload: Partial<MaintenanceCreatePayload> & {
    status?: string;
    assigned_vendor_name?: string;
    vendor_contact?: string;
    actual_cost?: number;
  }
) {
  const response = await api.patch<MaintenanceRequest>(`/supervisor/maintenance/${requestId}`, payload, {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function fetchSupervisorProfile(userId: string) {
  const response = await api.get<SupervisorProfile>("/supervisor/profile", {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function updateSupervisorProfile(userId: string, payload: Partial<SupervisorProfile>) {
  const response = await api.patch<SupervisorProfile>("/supervisor/profile", payload, {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function changeSupervisorPassword(userId: string, payload: ChangePasswordPayload) {
  const response = await api.post<{ message: string }>("/supervisor/change-password", payload, {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}

export async function validateSupervisorPassword(userId: string, password: string) {
  const response = await api.post("/supervisor/validate-password", { password }, {
    headers: buildSupervisorHeaders(userId)
  });
  return response.data;
}
