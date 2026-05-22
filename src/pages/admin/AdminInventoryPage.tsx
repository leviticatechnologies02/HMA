import { useState, useEffect } from "react";
import { Pencil, X, Check, Trash } from "lucide-react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import {
  useAdminBeds, useAdminMyHostels, useAdminRooms,
  useCreateAdminBed, useCreateAdminRoom,
  useUpdateAdminRoom, useUpdateAdminBed,
  useDeleteAdminRoom
} from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import type { Room } from "../../api/public.api";
import type { Bed } from "../../api/admin.api";

const defaultRoomForm = {
  room_number: "", floor: 0, room_type: "single", total_beds: 1,
  daily_rent: 0, monthly_rent: 0, security_deposit: 0, dimensions: "", is_active: true
};
const defaultBedForm = { bed_number: "", status: "available" };

// Room types array
const roomTypes = [
  { value: "single", label: "Single (1 bed)", beds: 1 },
  { value: "double", label: "Double (2 beds)", beds: 2 },
  { value: "triple", label: "Triple (3 beds)", beds: 3 },
  { value: "quadruple", label: "Quadruple (4 beds)", beds: 4 },
  { value: "five-bed", label: "Five Bed (5 beds)", beds: 5 },
  { value: "dormitory", label: "Dormitory (6 beds)", beds: 6 }
];

// Map room type to default number of beds
const getDefaultTotalBeds = (roomType: string): number => {
  const roomTypeObj = roomTypes.find(rt => rt.value === roomType);
  return roomTypeObj ? roomTypeObj.beds : 1;
};

export function AdminInventoryPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(
    activeHostelId ?? hostelIds[0] ?? null
  );
  useEffect(() => {
    if (activeHostelId && activeHostelId !== selectedHostelId) setSelectedHostelId(activeHostelId);
  }, [activeHostelId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ show: boolean; room: Room | null }>({ show: false, room: null });

  const hostelsQuery = useAdminMyHostels(userId, hostelIds);
  console.log(hostelsQuery.data)
  const roomsQuery = useAdminRooms(userId, selectedHostelId, hostelIds);
  const bedsQuery = useAdminBeds(userId, selectedRoomId, hostelIds);
  const createRoomMutation = useCreateAdminRoom(userId, selectedHostelId, hostelIds);
  const createBedMutation = useCreateAdminBed(userId, selectedRoomId, hostelIds);
  const updateRoomMutation = useUpdateAdminRoom(userId, selectedHostelId, hostelIds);
  const updateBedMutation = useUpdateAdminBed(userId, selectedRoomId, hostelIds);
  const deleteRoomMutation = useDeleteAdminRoom(userId, selectedHostelId, hostelIds);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [editRoomForm, setEditRoomForm] = useState<Partial<typeof defaultRoomForm>>({});
  const [editBedStatus, setEditBedStatus] = useState("");

  // Formik for Create Room
  const roomFormik = useFormik({
    initialValues: defaultRoomForm,
    onSubmit: (values, { resetForm }) => {
      createRoomMutation.mutate({ ...values, dimensions: values.dimensions || undefined }, {
        onSuccess: () => resetForm()
      });
    },
  });

  // Auto update total beds when room type changes
  useEffect(() => {
    const defaultBeds = getDefaultTotalBeds(roomFormik.values.room_type);
    roomFormik.setFieldValue("total_beds", defaultBeds);
  }, [roomFormik.values.room_type]);

  // Formik for Create Bed
  const bedFormik = useFormik({
    initialValues: defaultBedForm,
    onSubmit: (values, { resetForm }) => {
      createBedMutation.mutate(values, {
        onSuccess: () => resetForm()
      });
    },
  });

  const handleDeleteRoom = async (room: Room) => {
    try {
      await deleteRoomMutation.mutateAsync(room.id);
      toast.success(`Room ${room.room_number} deleted successfully`);
      setShowDeleteConfirm({ show: false, room: null });
      // If the deleted room was selected, clear selection
      if (selectedRoomId === room.id) {
        setSelectedRoomId(null);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || "Failed to delete room";
      toast.error(errorMessage);
    }
  };

  if (!userId || !hostelIds.length) {
    return <div>Please login as an admin with assigned hostels to manage inventory.</div>;
  }

  const startEditRoom = (room: Room) => {
    setEditingRoom(room);
    setEditRoomForm({
      room_number: room.room_number, floor: room.floor, room_type: room.room_type,
      total_beds: room.total_beds, daily_rent: room.daily_rent,
      monthly_rent: room.monthly_rent, security_deposit: room.security_deposit,
      dimensions: room.dimensions ?? "", is_active: room.is_active
    });
  };

  const startEditBed = (bed: Bed) => {
    setEditingBed(bed);
    setEditBedStatus(bed.status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white">Admin Inventory</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Create and manage rooms and beds for your hostel.</p>
      </div>

      <section className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 md:p-6 shadow-sm dark:shadow-md border border-slate-100 dark:border-slate-800">
        <label className="mb-2 block text-xs sm:text-sm font-medium text-dark dark:text-slate-200">Current Hostel</label>
        <select
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-800 text-dark dark:text-slate-200 text-sm sm:text-base min-h-12 sm:min-h-10"
          value={selectedHostelId ?? ""}
          onChange={(e) => { setSelectedHostelId(e.target.value); setSelectedRoomId(null); }}
          style={{ fontSize: '16px' }}
        >
          {(hostelsQuery.data ?? []).map((h: any) => (
            <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
          ))}
          {!(hostelsQuery.data ?? []).length && hostelIds.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr] xl:grid-cols-[420px_1fr]">
        {/* Left: Create forms */}
        <section className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 md:p-6 shadow-sm dark:shadow-md border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-dark dark:text-white">Create Room</h2>
            <form onSubmit={roomFormik.handleSubmit}>
              <div className="grid gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Room Number *</label>
                  <input
                    className="input-field text-sm sm:text-base"
                    type="number"
                    min={0}
                    placeholder="e.g. 101"
                    name="room_number"
                    value={roomFormik.values.room_number}
                    onChange={(e) => roomFormik.setFieldValue("room_number", e.target.value)}
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Floor *</label>
                    <input
                      className="input-field text-sm sm:text-base"
                      type="number"
                      min={0}
                      placeholder="0"
                      name="floor"
                      value={roomFormik.values.floor}
                      onChange={(e) => roomFormik.setFieldValue("floor", Number(e.target.value))}
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Room Type *</label>
                    <select
                      className="input-field text-sm sm:text-base min-h-12 sm:min-h-10"
                      name="room_type"
                      value={roomFormik.values.room_type}
                      onChange={roomFormik.handleChange}
                      style={{ fontSize: '16px' }}
                    >
                      {roomTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Total Beds *</label>
                  <input
                    className="input-field text-sm sm:text-base"
                    type="number"
                    min={1}
                    placeholder="1"
                    name="total_beds"
                    value={roomFormik.values.total_beds}
                    onChange={(e) => roomFormik.setFieldValue("total_beds", Number(e.target.value))}
                    style={{ fontSize: '16px' }}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Auto-updates based on room type, but you can manually change it</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Daily Rent (₹)</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      placeholder="0"
                      name="daily_rent"
                      value={roomFormik.values.daily_rent}
                      onChange={(e) => roomFormik.setFieldValue("daily_rent", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Monthly Rent (₹) *</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      placeholder="0"
                      name="monthly_rent"
                      value={roomFormik.values.monthly_rent}
                      onChange={(e) => roomFormik.setFieldValue("monthly_rent", Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Security Deposit (₹)</label>
                  <input
                    className="input-field"
                    type="number"
                    min={0}
                    placeholder="0"
                    name="security_deposit"
                    value={roomFormik.values.security_deposit}
                    onChange={(e) => roomFormik.setFieldValue("security_deposit", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Dimensions (optional)</label>
                  <input
                    className="input-field"
                    placeholder="e.g. 12x10 ft"
                    name="dimensions"
                    value={roomFormik.values.dimensions}
                    onChange={roomFormik.handleChange}
                  />
                </div>
                <button
                  className="btn-primary disabled:opacity-60 text-sm sm:text-base"
                  disabled={createRoomMutation.isPending || !selectedHostelId || !roomFormik.values.room_number.trim()}
                  type="submit"
                >
                  {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 md:p-6 shadow-sm dark:shadow-md border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-dark dark:text-white">Create Bed</h2>
            <form onSubmit={bedFormik.handleSubmit}>
              <div className="grid gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Select Room *</label>
                  <select
                    className="input-field text-sm sm:text-base min-h-12 sm:min-h-10"
                    value={selectedRoomId ?? ""}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    style={{ fontSize: '16px' }}
                  >
                    <option value="">Select a room...</option>
                    {roomsQuery.data?.map((room) => (
                      <option key={room.id} value={room.id}>Room {room.room_number} ({room.room_type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Bed Number *</label>
                  <input
                    className="input-field text-sm sm:text-base"
                    placeholder="e.g. B1, B2"
                    name="bed_number"
                    value={bedFormik.values.bed_number}
                    onChange={bedFormik.handleChange}
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Status</label>
                  <select
                    className="input-field text-sm sm:text-base min-h-12 sm:min-h-10"
                    name="status"
                    value={bedFormik.values.status}
                    onChange={bedFormik.handleChange}
                    style={{ fontSize: '16px' }}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <button
                  className="btn-primary disabled:opacity-60 text-sm sm:text-base"
                  disabled={createBedMutation.isPending || !selectedRoomId || !bedFormik.values.bed_number.trim()}
                  type="submit"
                >
                  {createBedMutation.isPending ? "Creating..." : "Create Bed"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Right: Rooms list */}
        <section className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 md:p-6 shadow-sm dark:shadow-md border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-dark dark:text-white">Rooms and Beds</h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {roomsQuery.data?.length ?? 0} rooms
            </span>
          </div>
          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
            {roomsQuery.isLoading && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Loading rooms...</p>}
            {roomsQuery.data?.map((room) => (
              <article key={room.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50">
                {editingRoom?.id === room.id ? (
                  <div className="grid gap-2 sm:gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Room Number</label>
                        <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-700 text-dark dark:text-slate-200" type="number" min={0} placeholder="Room number" value={editRoomForm.room_number ?? ""} onChange={(e) => setEditRoomForm((c) => ({ ...c, room_number: e.target.value }))} style={{ fontSize: '16px' }} />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Floor</label>
                        <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-700 text-dark dark:text-slate-200" placeholder="Floor" type="number" value={editRoomForm.floor ?? 0} onChange={(e) => setEditRoomForm((c) => ({ ...c, floor: Number(e.target.value) }))} style={{ fontSize: '16px' }} />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Daily Rent</label>
                        <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-700 text-dark dark:text-slate-200" placeholder="Daily rent" type="number" value={editRoomForm.daily_rent ?? 0} onChange={(e) => setEditRoomForm((c) => ({ ...c, daily_rent: Number(e.target.value) }))} style={{ fontSize: '16px' }} />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Monthly Rent</label>
                        <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-700 text-dark dark:text-slate-200" placeholder="Monthly rent" type="number" value={editRoomForm.monthly_rent ?? 0} onChange={(e) => setEditRoomForm((c) => ({ ...c, monthly_rent: Number(e.target.value) }))} style={{ fontSize: '16px' }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="flex items-center gap-1 rounded-xl bg-primary dark:bg-primary/80 hover:dark:bg-primary px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white disabled:opacity-60"
                        disabled={updateRoomMutation.isPending}
                        onClick={() => updateRoomMutation.mutate({ roomId: room.id, payload: editRoomForm }, { onSuccess: () => setEditingRoom(null) })}
                        type="button"
                      >
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button className="flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-dark dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setEditingRoom(null)} type="button">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-dark dark:text-white">Room {room.room_number} · {room.room_type}</h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Floor {room.floor} · {room.total_beds} beds · ₹{room.monthly_rent}/month</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <button className="rounded-xl border bg-accent dark:bg-amber-700 border-slate-300 dark:border-amber-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-dark dark:text-white hover:bg-accent/80 dark:hover:bg-amber-600" onClick={() => startEditRoom(room)} type="button">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="rounded-xl bg-red-600 dark:bg-red-700 border-red-600 dark:border-red-700 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-red-700 dark:hover:bg-red-600 transition-colors text-white"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete Room ${room.room_number}?`)) {
                            handleDeleteRoom(room);
                          }
                        }}
                        type="button"
                      >
                        <Trash className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button className="rounded-xl border bg-primary dark:bg-primary/80 border-slate-300 dark:border-primary/50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white hover:bg-primary/90 dark:hover:bg-primary" onClick={() => setSelectedRoomId(selectedRoomId === room.id ? null : room.id)} type="button">
                        {selectedRoomId === room.id ? "Hide Beds" : "View Beds"}
                      </button>
                    </div>
                  </div>
                )}

                {selectedRoomId === room.id && editingRoom?.id !== room.id && (
                  <div className="mt-3 sm:mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
                    {bedsQuery.isLoading && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Loading beds...</p>}
                    {bedsQuery.data?.length ? (
                      <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                        {bedsQuery.data.map((bed) => (
                          <div key={bed.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 sm:p-3">
                            {editingBed?.id === bed.id ? (
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <select className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs sm:text-sm bg-white dark:bg-slate-700 text-dark dark:text-slate-200" value={editBedStatus} onChange={(e) => setEditBedStatus(e.target.value)} style={{ fontSize: '16px' }}>
                                  <option value="available">Available</option>
                                  <option value="reserved">Reserved</option>
                                  <option value="occupied">Occupied</option>
                                  <option value="maintenance">Maintenance</option>
                                </select>
                                <button
                                  className="rounded-lg bg-primary dark:bg-primary/80 p-1 sm:p-1.5 text-white disabled:opacity-60 hover:bg-primary/90 dark:hover:bg-primary"
                                  disabled={updateBedMutation.isPending}
                                  onClick={() => updateBedMutation.mutate({ bedId: bed.id, payload: { status: editBedStatus } }, { onSuccess: () => setEditingBed(null) })}
                                  type="button"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button className="rounded-lg border border-slate-300 dark:border-slate-600 p-1 sm:p-1.5 text-dark dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setEditingBed(null)} type="button">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-xs sm:text-sm text-dark dark:text-white">{bed.bed_number}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{bed.status}</p>
                                </div>
                                <button className="rounded-lg border border-slate-200 dark:border-slate-700 p-1 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400" onClick={() => startEditBed(bed)} type="button">
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : bedsQuery.isLoading ? null : (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">No beds for this room yet.</p>
                    )}
                  </div>
                )}
              </article>
            ))}
            {!roomsQuery.isLoading && !roomsQuery.data?.length && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">No rooms available for this hostel yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}