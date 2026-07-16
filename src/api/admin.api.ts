import { api } from "./axiosInstance";
import type { Booking } from "./booking.api";
import type { HostelDetail, HostelListItem, Room } from "./public.api";
import type { Complaint } from "./student.api";
import type { MessMenu } from "./student.api";
import type { Notice } from "./student.api";
import type { StudentPayment } from "./student.api";
import type { MaintenanceRequest } from "./supervisor.api";
import type { SupervisorAttendanceRecord } from "./supervisor.api";

export type Student = {
  id: string;
  user_id: string;
  hostel_id: string;
  room_id: string;
  bed_id: string;
  booking_id: string;
  student_number: string;
  check_in_date: string;
  check_out_date?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export interface StudentDetails {
  id: string;
  student_number: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  gender: "M" | "F" | "O";
  date_of_birth: string;
  profile_picture_url: string | null;
  status: "active" | "inactive" | "left";
  check_in_date: string;
  check_out_date: string | null;
  room_id: string;
  room_number: string;
  room_type: string;
  floor: number;
  bed_id: string;
  bed_number: string;
  monthly_rent: number;
  daily_rent: number;
  booking_id: string;
  booking_number: string;
  booking_mode: "monthly" | "daily";
  hostel_id: string;
  hostel_name: string;
  hostel_city: string;
  hostel_type: "boys" | "girls" | "co-living";
  payment_status: "paid" | "pending" | "partial";
  total_paid: number;
  advance_paid: number;
  last_payment_date: string;
  next_payment_due: string;
  occupation: string;
  institution: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  created_at: string;
  updated_at: string;
}

export type AdminDashboard = {
  hostels: number;
  rooms: number;
  students: number;
  complaints: number;
  maintenance_items: number;
  payments: number;
};

export type Supervisor = {
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

export type Bed = {
  id: string;
  hostel_id: string;
  room_id: string;
  bed_number: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type RoomCreatePayload = {
  room_number: string;
  floor: number;
  room_type: string;
  total_beds: number;
  daily_rent: number;
  monthly_rent: number;
  security_deposit: number;
  dimensions?: string;
  is_active?: boolean;
};

export type BedCreatePayload = {
  bed_number: string;
  status: string;
};

export type SupervisorCreatePayload = {
  email: string;
  phone: string;
  full_name: string;
  password: string;
  is_active: boolean;
};

export type AdminMessMenuPayload = {
  week_start_date: string;
  is_active?: boolean;
  meal_type: string;
  item_name: string;
  day_of_week: string;
  is_veg?: boolean;
  special_note?: string;
};

export type AdminHostelProfilePayload = {
  name?: string;
  description?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_featured?: boolean;
  is_public?: boolean;
  rules_and_regulations?: string;
};

type AdminHeaders = {
  "x-user-id": string;
  "x-user-role": string;
  "x-hostel-ids": string;
};

function buildAdminHeaders(userId: string, hostelIds: string[]): AdminHeaders {
  return {
    "x-user-id": userId,
    "x-user-role": "hostel_admin",
    "x-hostel-ids": hostelIds.join(",")
  };
}

export async function fetchAdminMyHostels(userId: string, hostelIds: string[]) {
  const response = await api.get<HostelListItem[]>("/admin/my-hostels", {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function fetchAdminDashboard(userId: string, hostelIds: string[], hostelId?: string) {
  const response = await api.get<AdminDashboard>("/admin/dashboard", {
    headers: buildAdminHeaders(userId, hostelIds),
    params: hostelId ? { hostel_id: hostelId } : undefined,
  });
  return response.data;
}

export async function fetchAdminRooms(userId: string, hostelId: string, hostelIds: string[]) {
  const response = await api.get<Room[]>(`/admin/hostels/${hostelId}/rooms`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function fetchAdminHostelProfile(userId: string, hostelId: string, hostelIds: string[]) {
  const response = await api.get<HostelDetail>(`/admin/hostels/${hostelId}`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function updateAdminHostelProfile(
  userId: string,
  hostelId: string,
  hostelIds: string[],
  payload: AdminHostelProfilePayload
) {
  const response = await api.patch<HostelDetail>(`/admin/hostels/${hostelId}`, payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function uploadAdminHostelImages(
  userId: string,
  hostelId: string,
  hostelIds: string[],
  formData: FormData
) {
  const response = await api.post(`/uploads/hostel-image/${hostelId}`, formData, {
    headers: {
      ...buildAdminHeaders(userId, hostelIds),
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
}

export async function createAdminRoom(
  userId: string,
  hostelId: string,
  hostelIds: string[],
  payload: RoomCreatePayload
) {
  const response = await api.post<Room>(`/admin/hostels/${hostelId}/rooms`, payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function fetchAdminBeds(userId: string, roomId: string, hostelIds: string[]) {
  const response = await api.get<Bed[]>(`/admin/rooms/${roomId}/beds`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}


export async function deleteAdminRoom(
  userId: string,
  roomId: string,
  hostelIds: string[]
) {
  const response = await api.delete(`/admin/rooms/${roomId}`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function createAdminBed(
  userId: string,
  roomId: string,
  hostelIds: string[],
  payload: BedCreatePayload
) {
  const response = await api.post<Bed>(`/admin/rooms/${roomId}/beds`, payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export type RejectBookingPayload = {
  reason?: string;
};

export async function fetchAdminBookings(userId: string, hostelId: string, hostelIds: string[]) {
  const response = await api.get<Booking[]>(`/admin/hostels/${hostelId}/bookings`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function fetchAdminBookingDocument(
  userId: string,
  hostelIds: string[],
  bookingId: string
) {
  const response = await api.get(`/admin/bookings/${bookingId}/document`, {
    headers: buildAdminHeaders(userId, hostelIds),
    responseType: "blob"
  });
  return response.data;
}

export async function approveAdminBooking(
  userId: string,
  hostelIds: string[],
  bookingId: string,
  bedId: string
) {
  const response = await api.patch<Booking>(
    `/admin/bookings/${bookingId}/approve`,
    { bed_id: bedId },
    { headers: buildAdminHeaders(userId, hostelIds) }
  );
  return response.data;
}

export async function rejectAdminBooking(
  userId: string,
  hostelIds: string[],
  bookingId: string,
  payload: RejectBookingPayload
) {
  const response = await api.patch<Booking>(`/admin/bookings/${bookingId}/reject`, payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function checkInAdminBooking(userId: string, hostelIds: string[], bookingId: string) {
  const response = await api.post(
    `/admin/students/${bookingId}/check-in`,
    {},
    { headers: buildAdminHeaders(userId, hostelIds) }
  );
  return response.data;
}

export async function checkOutAdminBooking(userId: string, hostelIds: string[], bookingId: string) {
  const response = await api.post(
    `/admin/students/${bookingId}/check-out`,
    {},
    { headers: buildAdminHeaders(userId, hostelIds) }
  );
  return response.data;
}

export async function cancelAdminBooking(userId: string, hostelIds: string[], bookingId: string, reason?: string) {
  const response = await api.patch(
    `/admin/bookings/${bookingId}/cancel`,
    { reason: reason ?? null },
    { headers: buildAdminHeaders(userId, hostelIds) }
  );
  return response.data;
}

export async function syncAdminStudentRecord(userId: string, hostelIds: string[], bookingId: string) {
  const response = await api.post(
    `/admin/students/${bookingId}/sync-student-record`,
    {},
    { headers: buildAdminHeaders(userId, hostelIds) }
  );
  return response.data;
}

export type RoomUpdatePayload = Partial<RoomCreatePayload>;

export async function updateAdminRoom(
  userId: string,
  hostelIds: string[],
  roomId: string,
  payload: RoomUpdatePayload
) {
  const response = await api.patch<Room>(`/admin/rooms/${roomId}`, payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function updateAdminBed(
  userId: string,
  hostelIds: string[],
  bedId: string,
  payload: Partial<BedCreatePayload>
) {
  const response = await api.patch<Bed>(`/admin/beds/${bedId}`, payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function fetchAdminStudents(userId: string, hostelId: string, hostelIds: string[]) {
  const response = await api.get<Student[]>(`/admin/hostels/${hostelId}/students`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}
export async function fetchAdminStudentDetails(userId: string, hostelIds: string[], studentId: string) {
  const response = await api.get<StudentDetails>(`/admin/students/${studentId}/complete`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function fetchAdminSupervisors(userId: string, hostelId: string, hostelIds: string[]) {
  const response = await api.get<Supervisor[]>(`/admin/hostels/${hostelId}/supervisors`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function fetchAdminSupervisorById(
  userId: string,
  supervisorId: string,
  hostelIds: string[]
) {
  const response = await api.get<Supervisor>(
    `/admin/supervisors/${supervisorId}`,
    {
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}
export async function createAdminSupervisor(
  userId: string,
  hostelId: string,
  hostelIds: string[],
  payload: SupervisorCreatePayload
) {
  const response = await api.post<Supervisor>(`/admin/hostels/${hostelId}/supervisors`, payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}
export async function updateAdminSupervisor(
  userId: string,
  supervisorId: string,
  hostelIds: string[],
  payload: Partial<SupervisorCreatePayload> // partial for patch
) {
  const response = await api.patch<Supervisor>(
    `/admin/supervisors/${supervisorId}`,
    payload,
    {
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}
export async function deleteAdminSupervisor(
  userId: string,
  supervisorId: string,
  hostelIds: string[]
) {
  const response = await api.delete(
    `/admin/supervisors/${supervisorId}`,
    {
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}

export type DirectStudentPayload = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  room_id: string;
  bed_id: string;
  check_in_date: string;
  check_out_date: string;
  booking_mode: "daily" | "monthly";
};

export type DirectStudentResponse = {
  student_id: string;
  student_number: string;
  user_id: string;
  booking_id: string;
  booking_number: string;
  full_name: string;
  email: string;
  room_id: string;
  bed_id: string;
  check_in_date: string;
};

export async function addAdminStudentDirect(
  userId: string,
  hostelId: string,
  hostelIds: string[],
  payload: DirectStudentPayload
) {
  const response = await api.post<DirectStudentResponse>(
    `/admin/hostels/${hostelId}/students/direct`,
    payload,
    { headers: buildAdminHeaders(userId, hostelIds) }
  );
  return response.data;
}
export async function updateAdminStudent(
  userId: string,
  hostelIds: string[],
  studentId: string,
  payload: Partial<DirectStudentPayload>
) {
  const response = await api.patch<DirectStudentResponse>(
    `/admin/students/${studentId}`,
    payload,
    { headers: buildAdminHeaders(userId, hostelIds) }
  );
  return response.data;
}
export async function deleteAdminStudent(
  userId: string,
  hostelIds: string[],
  studentId: string
) {
  const response = await api.delete(`/admin/students/${studentId}`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function fetchAdminMaintenance(userId: string, hostelId: string, hostelIds: string[]) {
  const response = await api.get<MaintenanceRequest[]>(`/admin/hostels/${hostelId}/maintenance`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function fetchAdminAttendance(userId: string, hostelId: string, hostelIds: string[]) {
  const response = await api.get<SupervisorAttendanceRecord[]>(`/admin/hostels/${hostelId}/attendance`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export type AttendanceMonthlySummaryRow = {
  student_id: string;
  student_number: string;
  full_name: string;
  present_count: number;
  total_marked: number;
  attendance_rate_percent: number;
};

export async function fetchAdminAttendanceSummary(
  userId: string,
  hostelId: string,
  hostelIds: string[],
  year: number,
  month: number
) {
  const response = await api.get<AttendanceMonthlySummaryRow[]>(
    `/admin/hostels/${hostelId}/attendance/summary`,
    { params: { year, month }, headers: buildAdminHeaders(userId, hostelIds) }
  );
  return response.data;
}

export async function fetchAdminPayments(userId: string, hostelId: string, hostelIds: string[]): Promise<StudentPayment[]> {
  const response = await api.get<any>(`/payments/admin/hostels/${hostelId}/payments`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.payments && Array.isArray(data.payments)) return data.payments;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
}

export async function fetchAdminMessMenu(userId: string, hostelId: string, hostelIds: string[]) {
  const response = await api.get<MessMenu[]>(`/admin/hostels/${hostelId}/mess-menu`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function createAdminMessMenu(
  userId: string,
  hostelId: string,
  hostelIds: string[],
  payload: AdminMessMenuPayload
) {
  const response = await api.post<MessMenu>(`/admin/hostels/${hostelId}/mess-menu`, payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}
export async function updateAdminMessMenu(
  userId: string,
  itemId: string,
  hostelIds: string[],
  payload: Partial<AdminMessMenuPayload>
) {
  const response = await api.patch<MessMenu>(
    `/admin/mess-menu/${itemId}`,
    payload,
    {
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}
export async function deleteAdminMessMenu(
  userId: string,
  itemId: string,
  hostelIds: string[]
) {
  const response = await api.delete(
    `/admin/mess-menu/${itemId}`,
    {
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}

export type AdminComplaintPayload = {
  status?: string;
  assigned_to?: string;
  resolution_notes?: string;
};

export async function fetchAdminComplaints(userId: string, hostelId: string, hostelIds: string[]) {
  const response = await api.get<Complaint[]>(`/admin/hostels/${hostelId}/complaints`, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function updateAdminComplaint(
  userId: string,
  hostelId: string,
  hostelIds: string[],
  complaintId: string,
  payload: AdminComplaintPayload
) {
  const response = await api.patch<Complaint>(
    `/admin/hostels/${hostelId}/complaints/${complaintId}`,
    payload,
    {
      headers: buildAdminHeaders(userId, hostelIds)
    }
  );
  return response.data;
}

export type AdminNoticePayload = {
   title: string;
  content: string;
  notice_type: string;
  priority: string;
  is_published: boolean;
  publish_at?: string;
  expires_at?: string;
};

export async function fetchAdminNoticesPaginated(
  userId: string,
  hostelId: string,
  hostelIds: string[],
  page = 1,
  limit = 10
) {
  const response = await api.get(
    `/admin/hostels/${hostelId}/notices/paginated`,
    {
      params: { page, limit },
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}

export type NoticeReadStatsItem = {
  notice_id: string;
  read_count: number;
  total_students: number;
};

export async function fetchAdminNoticeReadStats(userId: string, hostelId: string, hostelIds: string[]) {
  const response = await api.get<NoticeReadStatsItem[]>(
    `/admin/hostels/${hostelId}/notices/read-stats`,
    { headers: buildAdminHeaders(userId, hostelIds) }
  );
  return response.data;
}

export async function createAdminNotice(
  userId: string,
  hostelId: string,
  hostelIds: string[],
  payload: AdminNoticePayload
) {
  const response = await api.post<Notice>(`/admin/hostels/${hostelId}/notices`, payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function updateAdminNotice(
  userId: string,
  noticeId: string,
  hostelIds: string[],
  payload: Partial<AdminNoticePayload>
) {
  const response = await api.patch<Notice>(
    `/admin/notices/${noticeId}`,
    payload,
    {
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}

export async function deleteAdminNotice(
  userId: string,
  noticeId: string,
  hostelIds: string[]
) {
  const response = await api.delete(
    `/admin/notices/${noticeId}`,
    {
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}
export async function toggleAdminNoticePublish(
  userId: string,
  noticeId: string,
  hostelIds: string[]
) {
  const response = await api.patch<Notice>(
    `/admin/notices/${noticeId}/toggle-publish`,
    {},
    {
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}

export async function fetchAdminPlatformNotices(
  userId: string,
  hostelIds: string[]
) {
  const response = await api.get<{ items: Notice[] }>(
    `/admin/notices/platform`,
    {
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}

export async function createAdminPlatformNotice(
  userId: string,
  hostelIds: string[],
  payload: AdminNoticePayload
) {
  const response = await api.post<Notice>(
    `/admin/notices/platform`,
    payload,
    {
      headers: buildAdminHeaders(userId, hostelIds),
    }
  );
  return response.data;
}

// Admin Profile APIs
export type AdminProfile = {
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

export async function fetchAdminProfile(userId: string, hostelIds: string[]) {
  const response = await api.get<AdminProfile>("/admin/profile", {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function updateAdminProfile(
  userId: string,
  hostelIds: string[],
  payload: Partial<AdminProfile>
) {
  const response = await api.patch<AdminProfile>("/admin/profile", payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function changeAdminPassword(
  userId: string,
  hostelIds: string[],
  payload: { old_password: string; new_password: string; confirm_password: string }
) {
  const response = await api.post("/admin/change-password", payload, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}

export async function validateAdminPassword(
  userId: string,
  hostelIds: string[],
  password: string
) {
  const response = await api.post("/admin/validate-password", { password }, {
    headers: buildAdminHeaders(userId, hostelIds)
  });
  return response.data;
}