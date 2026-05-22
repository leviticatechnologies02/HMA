import { api } from "./axiosInstance";
import type { WaitlistEntry } from "./booking.api";

export type Complaint = {
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

export type ComplaintCreatePayload = {
  category: string;
  title: string;
  description: string;
  priority: string;
};

export type StudentBooking = {
  id: string;
  booking_number: string;
  status: string;
  booking_mode: string;
  hostel_id: string;
  room_id: string;
  bed_id?: string | null;
  check_in_date: string;
  check_out_date: string;
  booking_advance?: number;
  grand_total?: number;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceRecord = {
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

export type Notice = {
  id: string;
  hostel_id?: string | null;
  title: string;
  content: string;
  notice_type: string;
  priority: string;
  is_published: boolean;
  publish_at?: string | null;
  expires_at?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  per_page: number;
};

export type MessMenu = {
  id: string;
  hostel_id: string;
  week_start_date: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Flattened item fields
  day_of_week?: string | null;
  meal_type?: string | null;
  item_name?: string | null;
  is_veg?: boolean | null;
  special_note?: string | null;
};

export type StudentPayment = {
  id: string;
  hostel_id: string;
  student_id?: string | null;
  booking_id?: string | null;
  amount: number;
  payment_type: string;
  payment_method: string;
  gateway_order_id?: string | null;
  gateway_payment_id?: string | null;
  gateway_signature?: string | null;
  status: string;
  receipt_url?: string | null;
  due_date?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentProfile = {
  id: string;
  user_id: string;
  hostel_id: string;
  room_id: string;
  bed_id: string;
  booking_id: string;
  booking_mode: string;
  hostel_name: string;
  hostel_city: string;
  hostel_type: string;
  student_number: string;
  check_in_date: string;
  check_out_date?: string | null;
  status: string;
  full_name: string;
  email: string;
  phone: string;
  profile_picture_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type PresignedUploadRequest = {
  file_name: string;
  content_type: string;
  file_size: number;
};

export type PresignedUploadResponse = {
  upload_url: string;
  file_url: string;
  filename: string;
};

function buildStudentHeaders(userId: string) {
  return {
    "x-user-id": userId,
    "x-user-role": "student"
  };
}

export async function fetchStudentComplaints(userId: string) {
  const response = await api.get<Complaint[]>("/student/complaints", {
    headers: buildStudentHeaders(userId)
  });
  return response.data;
}

export async function createStudentComplaint(userId: string, payload: ComplaintCreatePayload) {
  const response = await api.post<Complaint>("/student/complaints", payload, {
    headers: buildStudentHeaders(userId)
  });
  return response.data;
}

export async function deleteStudentComplaint(userId: string, complaintId: string) {
  await api.delete(`/student/complaints/${complaintId}`, {
    headers: buildStudentHeaders(userId)
  });
}

export async function fetchStudentProfile(userId: string) {
  const response = await api.get<StudentProfile>("/student/profile", {
    headers: buildStudentHeaders(userId)
  });
  return response.data;
}

export async function fetchStudentBookings(userId: string) {
  const response = await api.get<StudentBooking[]>("/student/bookings", {
    headers: buildStudentHeaders(userId)
  });
  return response.data;
}

export async function fetchStudentPayments(userId: string) {
  const response = await api.get<StudentPayment[]>("/student/payments", {
    headers: buildStudentHeaders(userId)
  });
  return response.data;
}

export async function fetchStudentAttendance(userId: string) {
  const response = await api.get<AttendanceRecord[]>("/student/attendance", {
    headers: buildStudentHeaders(userId)
  });
  return response.data;
}

export async function fetchStudentNotices(userId: string) {
  const response = await api.get<Notice[]>("/student/notices", {
    headers: buildStudentHeaders(userId)
  });
  return response.data;
}

export async function fetchStudentNoticesPaginated(
  userId: string,
  page = 1,
  limit = 10
) {
  const response = await api.get<PaginatedResponse<Notice>>("/student/notices/paginated", {
    headers: buildStudentHeaders(userId),
    params: { page, limit },
  });
  return response.data;
}

export async function fetchStudentNotice(userId: string, noticeId: string) {
  const response = await api.get<Notice>(`/student/notices/${noticeId}`, {
    headers: buildStudentHeaders(userId),
  });
  return response.data;
}

export async function markStudentNoticeRead(userId: string, noticeId: string) {
  const response = await api.post<{ notice_id: string; is_read: boolean }>(
    `/student/notices/${noticeId}/read`,
    {},
    { headers: buildStudentHeaders(userId) }
  );
  return response.data;
}

export async function fetchStudentNoticeReadStatus(userId: string) {
  const response = await api.get<string[]>("/student/notices/read-status", {
    headers: buildStudentHeaders(userId)
  });
  return response.data;
}

export async function fetchStudentMessMenu(userId: string) {
  const response = await api.get<MessMenu[]>("/student/mess-menu", {
    headers: buildStudentHeaders(userId)
  });
  return response.data;
}

export async function fetchStudentWaitlist(userId: string) {
  const response = await api.get<WaitlistEntry[]>("/student/waitlist", {
    headers: buildStudentHeaders(userId)
  });
  return response.data;
}

export async function leaveStudentWaitlist(userId: string, entryId: string) {
  await api.delete(`/student/waitlist/${entryId}`, {
    headers: buildStudentHeaders(userId)
  });
}

export function validateStudentUploadFile(file: File): string | null {
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
  if (!allowedTypes.has(file.type)) {
    return "Unsupported file type. Allowed: JPG, PNG, WEBP, PDF.";
  }
  if (file.size > 10 * 1024 * 1024) {
    return "File size exceeds 10MB limit.";
  }
  return null;
}

export async function createStudentPresignedUploadUrl(userId: string, payload: PresignedUploadRequest) {
  const response = await api.post<PresignedUploadResponse>("/student/uploads/presigned-url", payload, {
    headers: buildStudentHeaders(userId),
    timeout: 8000, // 8 second timeout — don't hang forever
  });
  return response.data;
}

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File, contentType: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Upload failed.");
  } finally {
    clearTimeout(timeout);
  }
}
