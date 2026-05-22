import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveAdminBooking,
  cancelAdminBooking,
  checkInAdminBooking,
  checkOutAdminBooking,
  createAdminBed,
  createAdminMessMenu,
  updateAdminMessMenu,
  deleteAdminMessMenu,
  // Notice apis
  fetchAdminNoticesPaginated,
  fetchAdminNoticeReadStats,
  createAdminNotice,
  updateAdminNotice,
  deleteAdminNotice,
  toggleAdminNoticePublish,
  createAdminPlatformNotice,
  fetchAdminPlatformNotices,

  createAdminRoom,
  fetchAdminDashboard,
  fetchAdminHostelProfile,
  fetchAdminMyHostels,
  fetchAdminBeds,
  fetchAdminAttendance,
  fetchAdminAttendanceSummary,
  fetchAdminBookings,
  fetchAdminComplaints,
  fetchAdminMaintenance,
  fetchAdminMessMenu,

  fetchAdminPayments,
  fetchAdminRooms,
  fetchAdminSupervisors,
  fetchAdminSupervisorById,
  updateAdminSupervisor,
  deleteAdminSupervisor,
  fetchAdminStudents,
  fetchAdminStudentDetails,
  rejectAdminBooking,
  updateAdminHostelProfile,
  updateAdminComplaint,
  updateAdminRoom,
  updateAdminBed,
  createAdminSupervisor,
  addAdminStudentDirect,
  updateAdminStudent,
  syncAdminStudentRecord,
  fetchAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  validateAdminPassword,
  type BedCreatePayload,
  type AdminHostelProfilePayload,
  type RejectBookingPayload,
  type AdminComplaintPayload,
  type AdminMessMenuPayload,
  type AdminNoticePayload,
  type RoomCreatePayload,
  type RoomUpdatePayload,
  type SupervisorCreatePayload,
  type DirectStudentPayload,
  type AdminProfile,
  deleteAdminRoom,



} from "../api/admin.api";

export function useAdminBookings(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-bookings", userId, hostelId, hostelIds],
    queryFn: () => fetchAdminBookings(userId!, hostelId!, hostelIds),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}

export function useAdminMyHostels(userId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-my-hostels", userId, hostelIds],
    queryFn: () => fetchAdminMyHostels(userId!, hostelIds),
    enabled: Boolean(userId && hostelIds.length)
  });
}

export function useAdminDashboard(userId: string | null, hostelIds: string[], hostelId?: string | null) {
  return useQuery({
    queryKey: ["admin-dashboard", userId, hostelId ?? hostelIds],
    queryFn: () => fetchAdminDashboard(userId!, hostelIds, hostelId ?? undefined),
    enabled: Boolean(userId && hostelIds.length)
  });
}

export function useAdminRooms(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-rooms", userId, hostelId, hostelIds],
    queryFn: () => fetchAdminRooms(userId!, hostelId!, hostelIds),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}

export function useDeleteAdminRoom(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => deleteAdminRoom(userId!, roomId, hostelIds),
    onSuccess: async () => {
      // Invalidate rooms query to refresh the list
      await queryClient.invalidateQueries({
        queryKey: ["admin-rooms", userId, hostelId, hostelIds]
      });
      // Also invalidate beds if needed (in case any beds were in the deleted room)
      await queryClient.invalidateQueries({
        queryKey: ["admin-beds"]
      });
      // Optionally invalidate dashboard stats
      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard", userId, hostelId ?? hostelIds]
      });
    }
  });
}

export function useAdminHostelProfile(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-hostel-profile", userId, hostelId, hostelIds],
    queryFn: () => fetchAdminHostelProfile(userId!, hostelId!, hostelIds),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}

export function useCreateAdminRoom(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RoomCreatePayload) => createAdminRoom(userId!, hostelId!, hostelIds, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-rooms", userId, hostelId, hostelIds]
      });
    }
  });
}

export function useUpdateAdminHostelProfile(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminHostelProfilePayload) =>
      updateAdminHostelProfile(userId!, hostelId!, hostelIds, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-hostel-profile", userId, hostelId, hostelIds]
      });
    }
  });
}

export function useAdminBeds(userId: string | null, roomId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-beds", userId, roomId, hostelIds],
    queryFn: () => fetchAdminBeds(userId!, roomId!, hostelIds),
    enabled: Boolean(userId && roomId && hostelIds.length)
  });
}

export function useCreateAdminBed(userId: string | null, roomId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BedCreatePayload) => createAdminBed(userId!, roomId!, hostelIds, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-beds", userId, roomId, hostelIds]
      });
    }
  });
}

export function useAdminStudents(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-students", userId, hostelId, hostelIds],

    queryFn: () => fetchAdminStudents(userId!, hostelId!, hostelIds),

    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}
export function useAdminStudentDetails(userId: string | null, hostelIds: string[], studentId: string | null) {
  return useQuery({
    queryKey: ["admin-student-details", userId, hostelIds, studentId],
    queryFn: () => fetchAdminStudentDetails(userId!, hostelIds, studentId!),
    enabled: Boolean(userId && hostelIds.length && studentId)
  });
}

export function useUpdateAdminStudent(userId: string | null, hostelId: string | null, hostelIds: string[], studentId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, payload }: { studentId: string; payload: Partial<DirectStudentPayload> }) =>
      updateAdminStudent(userId!, hostelIds, studentId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-students", userId, hostelId]
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-student-details", userId, hostelIds, variables.studentId]
      });

    }
  });
}
export function useAdminSupervisors(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-supervisors", userId, hostelId, hostelIds],
    queryFn: () => fetchAdminSupervisors(userId!, hostelId!, hostelIds),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}
export function useAdminSupervisorById(
  userId: string | null,
  supervisorId: string | null,
  hostelIds: string[]
) {
  return useQuery({
    queryKey: ["admin-supervisor", userId, supervisorId, hostelIds],
    queryFn: () =>
      fetchAdminSupervisorById(userId!, supervisorId!, hostelIds),
    enabled: Boolean(userId && supervisorId && hostelIds.length),
  });
}


export function useCreateAdminSupervisor(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SupervisorCreatePayload) =>
      createAdminSupervisor(userId!, hostelId!, hostelIds, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-supervisors", userId, hostelId, hostelIds]
      });
    }
  });
}

export function useUpdateAdminSupervisor(
  userId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      supervisorId,
      payload,
    }: {
      supervisorId: string;
      payload: Partial<SupervisorCreatePayload>;
    }) =>
      updateAdminSupervisor(userId!, supervisorId, hostelIds, payload),

    onSuccess: async (_, variables) => {
      const { supervisorId } = variables;
      await queryClient.invalidateQueries({
        queryKey: ["admin-supervisors", userId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-supervisor", userId, supervisorId],
      });
    },
  });
}
export function useDeleteAdminSupervisor(
  userId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supervisorId: string) =>
      deleteAdminSupervisor(userId!, supervisorId, hostelIds),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-supervisors", userId],
      });
    },
  });
}

export function useAdminMaintenance(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  return useQuery({
    queryKey: ["admin-maintenance", userId, hostelId, hostelIds],
    queryFn: () => fetchAdminMaintenance(userId!, hostelId!, hostelIds),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}

export function useAdminAttendance(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-attendance", userId, hostelId, hostelIds],
    queryFn: () => fetchAdminAttendance(userId!, hostelId!, hostelIds),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}

export function useAdminAttendanceSummary(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[],
  year: number,
  month: number
) {
  return useQuery({
    queryKey: ["admin-attendance-summary", userId, hostelId, hostelIds, year, month],
    queryFn: () => fetchAdminAttendanceSummary(userId!, hostelId!, hostelIds, year, month),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}

export function useAdminPayments(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-payments", userId, hostelId, hostelIds],
    queryFn: () => fetchAdminPayments(userId!, hostelId!, hostelIds),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}

export function useAdminMessMenu(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-mess-menu", userId, hostelId, hostelIds],
    queryFn: () => fetchAdminMessMenu(userId!, hostelId!, hostelIds),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}
export function useCreateAdminMessMenu(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminMessMenuPayload) => createAdminMessMenu(userId!, hostelId!, hostelIds, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-mess-menu", userId, hostelId, hostelIds]
      });
    }
  });
}
export function useUpdateAdminMessMenu(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: Partial<AdminMessMenuPayload>;
    }) =>
      updateAdminMessMenu(userId!, itemId, hostelIds, payload),

    onSuccess: async (_, variables) => {
      const { itemId } = variables;

      // invalidate list
      await queryClient.invalidateQueries({
        queryKey: ["admin-mess-menu", userId, hostelId, hostelIds],
      });

      // optional: if you later add detail query
      await queryClient.invalidateQueries({
        queryKey: ["admin-mess-menu-item", userId, itemId],
      });
    },
    onError: (error: any) => {
      console.log(error.response?.data);
    }
  });
}
export function useDeleteAdminMessMenu(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      deleteAdminMessMenu(userId!, itemId, hostelIds),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-mess-menu", userId, hostelId, hostelIds],
      });
    },
  });
}

export function useApproveAdminBooking(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, bedId }: { bookingId: string; bedId: string }) =>
      approveAdminBooking(userId!, hostelIds, bookingId, bedId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-bookings", userId, hostelId, hostelIds]
      });
    }
  });
}

export function useRejectAdminBooking(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      payload
    }: {
      bookingId: string;
      payload: RejectBookingPayload;
    }) => rejectAdminBooking(userId!, hostelIds, bookingId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-bookings", userId, hostelId, hostelIds]
      });
    }
  });
}

export function useCheckInAdminBooking(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId }: { bookingId: string }) => checkInAdminBooking(userId!, hostelIds, bookingId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-bookings", userId, hostelId, hostelIds]
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-students", userId, hostelId, hostelIds]
        })
      ]);
    }
  });
}

export function useAdminComplaints(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-complaints", userId, hostelId, hostelIds],
    queryFn: () => fetchAdminComplaints(userId!, hostelId!, hostelIds),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}


// notices hooks
export function useAdminNoticesPaginated(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[],
  page: number,
  limit: number
) {
  return useQuery({
    queryKey: ["admin-notices", userId, hostelId, hostelIds, page, limit],
    queryFn: () =>
      fetchAdminNoticesPaginated(
        userId!,
        hostelId!,
        hostelIds,
        page,
        limit
      ),
    enabled: Boolean(userId && hostelId && hostelIds.length),
  });
}
export function useAdminNoticeReadStats(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-notice-read-stats", userId, hostelId, hostelIds],
    queryFn: () => fetchAdminNoticeReadStats(userId!, hostelId!, hostelIds),
    enabled: Boolean(userId && hostelId && hostelIds.length)
  });
}

export function useCreateAdminNotice(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminNoticePayload) => createAdminNotice(userId!, hostelId!, hostelIds, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-notices", userId, hostelId, hostelIds]
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-notice-read-stats", userId, hostelId, hostelIds]
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-platform-notices", userId, hostelIds],
      });
    }
  });
}

export function useUpdateAdminNotice(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noticeId,
      payload,
    }: {
      noticeId: string;
      payload: Partial<AdminNoticePayload>;
    }) =>
      updateAdminNotice(userId!, noticeId, hostelIds, payload),

    onSuccess: async (_, variables) => {
      const { noticeId } = variables;

      await queryClient.invalidateQueries({
        queryKey: ["admin-notices", userId, hostelId, hostelIds],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-platform-notices", userId, hostelIds],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-notice", userId, noticeId, hostelIds],
      });
    },
  });
}
export function useDeleteAdminNotice(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noticeId: string) =>
      deleteAdminNotice(userId!, noticeId, hostelIds),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-notices", userId, hostelId, hostelIds],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-platform-notices", userId, hostelIds],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-notice-read-stats", userId, hostelId, hostelIds],
      });
    },
  });
}
export function useToggleAdminNoticePublish(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noticeId: string) =>
      toggleAdminNoticePublish(userId!, noticeId, hostelIds),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-notices", userId, hostelId, hostelIds],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-platform-notices", userId, hostelIds],
      });
    },
  });
}
export function useAdminPlatformNotices(
  userId: string | null,
  hostelIds: string[]
) {
  return useQuery({
    queryKey: ["admin-platform-notices", userId, hostelIds],
    queryFn: () =>
      fetchAdminPlatformNotices(userId!, hostelIds),
    enabled: Boolean(userId && hostelIds.length),
  });
}
export function useCreateAdminPlatformNotice(
  userId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminNoticePayload) =>
      createAdminPlatformNotice(userId!, hostelIds, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-platform-notices", userId, hostelIds],
      });
    },
  });
}




export function useUpdateAdminComplaint(
  userId: string | null,
  hostelId: string | null,
  hostelIds: string[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      complaintId,
      payload
    }: {
      complaintId: string;
      payload: AdminComplaintPayload;
    }) => updateAdminComplaint(userId!, hostelId!, hostelIds, complaintId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-complaints", userId, hostelId, hostelIds]
      });
    }
  });
}

export function useCheckOutAdminBooking(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId }: { bookingId: string }) => checkOutAdminBooking(userId!, hostelIds, bookingId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-bookings", userId, hostelId, hostelIds] }),
        queryClient.invalidateQueries({ queryKey: ["admin-students", userId, hostelId, hostelIds] })
      ]);
    }
  });
}

export function useCancelAdminBooking(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) => cancelAdminBooking(userId!, hostelIds, bookingId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings", userId, hostelId, hostelIds] });
    }
  });
}

export function useUpdateAdminRoom(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, payload }: { roomId: string; payload: RoomUpdatePayload }) =>
      updateAdminRoom(userId!, hostelIds, roomId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-rooms", userId, hostelId, hostelIds] });
    }
  });
}

export function useUpdateAdminBed(userId: string | null, roomId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bedId, payload }: { bedId: string; payload: Partial<BedCreatePayload> }) =>
      updateAdminBed(userId!, hostelIds, bedId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-beds", userId, roomId, hostelIds] });
    }
  });
}

export function useAddAdminStudentDirect(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DirectStudentPayload) =>
      addAdminStudentDirect(userId!, hostelId!, hostelIds, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-students", userId, hostelId, hostelIds] });
    },
  });
}



export function useSyncAdminStudentRecord(userId: string | null, hostelId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => syncAdminStudentRecord(userId!, hostelIds, bookingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-students", userId, hostelId, hostelIds] });
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings", userId, hostelId, hostelIds] });
    },
  });
}

// Admin Profile Hooks
export function useAdminProfile(userId: string | null, hostelIds: string[]) {
  return useQuery({
    queryKey: ["admin-profile", userId, hostelIds],
    queryFn: () => fetchAdminProfile(userId!, hostelIds),
    enabled: Boolean(userId && hostelIds.length)
  });
}

export function useUpdateAdminProfile(userId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<AdminProfile>) => updateAdminProfile(userId!, hostelIds, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-profile", userId, hostelIds] });
    }
  });
}

export function useChangeAdminPassword(userId: string | null, hostelIds: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { old_password: string; new_password: string; confirm_password: string }) =>
      changeAdminPassword(userId!, hostelIds, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-profile", userId, hostelIds] });
    }
  });
}

export function useValidateAdminPassword(userId: string | null, hostelIds: string[]) {
  return useMutation({
    mutationFn: (password: string) => validateAdminPassword(userId!, hostelIds, password),
  });
}
