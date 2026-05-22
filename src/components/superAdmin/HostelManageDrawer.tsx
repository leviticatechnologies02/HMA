import { useState } from "react";
import { X, Plus, ImagePlus, Bed, Building2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";
import type { SuperAdminHostel } from "../../api/superAdmin.api";
import { addSuperAdminHostelImages, type SuperAdminHostelPayload } from "../../api/superAdmin.api";
import { HOSTEL_IMAGES } from "../../utils/images";

// ── Types ─────────────────────────────────────────────────────────────────────
type Room = { id: string; room_number: string; floor: number; room_type: string; total_beds: number; daily_rent: number; monthly_rent: number; security_deposit: number; available_beds: number };
type Bed  = { id: string; bed_number: string; status: string };

// ── Super-admin can call admin endpoints (super_admin bypasses tenancy) ────────
async function saFetchRooms(hostelId: string) {
  const r = await api.get<Room[]>(`/admin/hostels/${hostelId}/rooms`);
  return r.data;
}
async function saCreateRoom(hostelId: string, payload: object) {
  const r = await api.post<Room>(`/admin/hostels/${hostelId}/rooms`, payload);
  return r.data;
}
async function saFetchBeds(roomId: string) {
  const r = await api.get<Bed[]>(`/admin/rooms/${roomId}/beds`);
  return r.data;
}
async function saCreateBed(roomId: string, payload: object) {
  const r = await api.post<Bed>(`/admin/rooms/${roomId}/beds`, payload);
  return r.data;
}
async function saUpdateHostel(hostelId: string, payload: Partial<SuperAdminHostelPayload>) {
  const r = await api.patch(`/admin/hostels/${hostelId}`, payload);
  return r.data;
}

// ── Tab type ──────────────────────────────────────────────────────────────────
type Tab = "rooms" | "images" | "details";

interface Props {
  hostel: SuperAdminHostel;
  userId: string;
  onClose: () => void;
}

export function HostelManageDrawer({ hostel, userId, onClose }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("rooms");
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  // ── Rooms ──────────────────────────────────────────────────────────────────
  const roomsQ = useQuery({ queryKey: ["sa-rooms", hostel.id], queryFn: () => saFetchRooms(hostel.id) });
  const [roomForm, setRoomForm] = useState({ room_number: "", floor: 0, room_type: "single", total_beds: 1, daily_rent: 0, monthly_rent: 0, security_deposit: 0 });
  const createRoomM = useMutation({
    mutationFn: () => saCreateRoom(hostel.id, roomForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sa-rooms", hostel.id] }); toast.success("Room created"); setRoomForm({ room_number: "", floor: 0, room_type: "single", total_beds: 1, daily_rent: 0, monthly_rent: 0, security_deposit: 0 }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to create room"),
  });

  // ── Beds ───────────────────────────────────────────────────────────────────
  const bedsQ = useQuery({ queryKey: ["sa-beds", expandedRoom], queryFn: () => saFetchBeds(expandedRoom!), enabled: !!expandedRoom });
  const [bedForm, setBedForm] = useState({ bed_number: "", status: "available" });
  const createBedM = useMutation({
    mutationFn: () => saCreateBed(expandedRoom!, bedForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sa-beds", expandedRoom] }); toast.success("Bed added"); setBedForm({ bed_number: "", status: "available" }); },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to add bed"),
  });

  // ── Images ─────────────────────────────────────────────────────────────────
  const [imageUrls, setImageUrls] = useState<string[]>(["", ""]);
  const addImagesM = useMutation({
    mutationFn: () => addSuperAdminHostelImages(userId, hostel.id, imageUrls.filter(u => u.trim()).map((url, i) => ({ url, is_primary: i === 0 }))),
    onSuccess: () => { toast.success("Images saved"); setImageUrls(["", ""]); },
    onError: () => toast.error("Failed to save images"),
  });

  // ── Details edit ───────────────────────────────────────────────────────────
  const [detailForm, setDetailForm] = useState<Partial<SuperAdminHostelPayload>>({
    name: hostel.name, description: hostel.description, rules_and_regulations: hostel.rules_and_regulations ?? "",
    phone: hostel.phone, email: hostel.email, website: hostel.website ?? "",
  });
  const updateM = useMutation({
    mutationFn: () => saUpdateHostel(hostel.id, { ...detailForm, website: detailForm.website || undefined, rules_and_regulations: detailForm.rules_and_regulations || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["super-admin-hostels-paginated"] }); toast.success("Hostel updated"); },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to update"),
  });

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "rooms",  label: "Rooms & Beds", icon: <Bed className="w-4 h-4" /> },
    { id: "images", label: "Images",       icon: <ImagePlus className="w-4 h-4" /> },
    { id: "details",label: "Edit Details", icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl animate-fade-in-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-heading font-bold text-dark text-lg">{hostel.name}</h2>
            <p className="text-xs text-slate-500">{hostel.city}, {hostel.state} · {hostel.hostel_type}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0 px-4">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-dark"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── ROOMS & BEDS ── */}
          {tab === "rooms" && (
            <>
              {/* Add room form */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
                <h3 className="font-semibold text-dark text-sm">Add New Room</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Room Number *</label>
                    <input className="input-field text-sm" placeholder="e.g. 101" value={roomForm.room_number} onChange={e => setRoomForm(f => ({ ...f, room_number: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Floor</label>
                    <input className="input-field text-sm" placeholder="0" type="number" value={roomForm.floor} onChange={e => setRoomForm(f => ({ ...f, floor: +e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Room Type</label>
                    <select className="input-field text-sm" value={roomForm.room_type} onChange={e => setRoomForm(f => ({ ...f, room_type: e.target.value }))}>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                      <option value="dormitory">Dormitory</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Total Beds</label>
                    <input className="input-field text-sm" placeholder="1" type="number" value={roomForm.total_beds} onChange={e => setRoomForm(f => ({ ...f, total_beds: +e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Daily Rent (₹)</label>
                    <input className="input-field text-sm" placeholder="0" type="number" value={roomForm.daily_rent} onChange={e => setRoomForm(f => ({ ...f, daily_rent: +e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monthly Rent (₹)</label>
                    <input className="input-field text-sm" placeholder="0" type="number" value={roomForm.monthly_rent} onChange={e => setRoomForm(f => ({ ...f, monthly_rent: +e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Security Deposit (₹)</label>
                    <input className="input-field text-sm" placeholder="0" type="number" value={roomForm.security_deposit} onChange={e => setRoomForm(f => ({ ...f, security_deposit: +e.target.value }))} />
                  </div>
                </div>
                <button className="btn-primary text-sm w-full disabled:opacity-50" disabled={createRoomM.isPending || !roomForm.room_number.trim()} onClick={() => createRoomM.mutate()}>
                  {createRoomM.isPending ? "Creating..." : "Create Room"}
                </button>
              </div>

              {/* Rooms list */}
              {roomsQ.isLoading && <div className="space-y-2">{[1,2].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>}
              {(roomsQ.data ?? []).length === 0 && !roomsQ.isLoading && (
                <p className="text-sm text-slate-400 text-center py-4">No rooms yet. Add one above.</p>
              )}
              {(roomsQ.data ?? []).map(room => (
                <div key={room.id} className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}>
                    <div>
                      <p className="font-semibold text-dark text-sm">Room {room.room_number} <span className="text-slate-400 font-normal capitalize">· {room.room_type}</span></p>
                      <p className="text-xs text-slate-500">Floor {room.floor} · {room.total_beds} beds · ₹{room.monthly_rent}/mo</p>
                    </div>
                    <span className="text-xs text-primary font-semibold">{expandedRoom === room.id ? "Hide beds ▲" : "Manage beds ▼"}</span>
                  </div>

                  {expandedRoom === room.id && (
                    <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-3">
                      {/* Existing beds */}
                      {bedsQ.isLoading && <div className="skeleton h-8 rounded-lg" />}
                      <div className="flex flex-wrap gap-2">
                        {(bedsQ.data ?? []).map(bed => (
                          <span key={bed.id} className={`badge text-xs capitalize ${bed.status === "available" ? "badge-success" : bed.status === "occupied" ? "badge-error" : "badge-warning"}`}>
                            {bed.bed_number} · {bed.status}
                          </span>
                        ))}
                        {(bedsQ.data ?? []).length === 0 && !bedsQ.isLoading && <p className="text-xs text-slate-400">No beds yet.</p>}
                      </div>
                      {/* Add bed */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Add Bed</p>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs text-slate-400 mb-1">Bed Number *</label>
                            <input className="input-field text-sm" placeholder="e.g. A1" value={bedForm.bed_number} onChange={e => setBedForm(f => ({ ...f, bed_number: e.target.value }))} />
                          </div>
                          <div className="w-36">
                            <label className="block text-xs text-slate-400 mb-1">Status</label>
                            <select className="input-field text-sm" value={bedForm.status} onChange={e => setBedForm(f => ({ ...f, status: e.target.value }))}>
                              <option value="available">Available</option>
                              <option value="maintenance">Maintenance</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button className="btn-primary text-sm px-3 py-2.5 disabled:opacity-50" disabled={createBedM.isPending || !bedForm.bed_number.trim()} onClick={() => createBedM.mutate()}>
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── IMAGES ── */}
          {tab === "images" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Add image URLs for this hostel. First URL becomes the primary cover photo.</p>
              {imageUrls.map((url, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <input className="input-field text-sm pr-10" placeholder={i === 0 ? "Primary image URL *" : `Image ${i + 1} URL (optional)`}
                      value={url} onChange={e => setImageUrls(u => u.map((v, j) => j === i ? e.target.value : v))} />
                    {url && <img src={url} alt="" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded object-cover border border-slate-200" onError={e => { e.currentTarget.style.display = "none"; }} />}
                  </div>
                  {imageUrls.length > 1 && (
                    <button type="button" onClick={() => setImageUrls(u => u.filter((_, j) => j !== i))} className="p-1.5 rounded-lg hover:bg-error/10 text-slate-400 hover:text-error">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {imageUrls.length < 8 && (
                <button type="button" onClick={() => setImageUrls(u => [...u, ""])} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add more
                </button>
              )}
              {/* Quick fill */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Quick fill with sample images:</p>
                <div className="flex gap-2 flex-wrap">
                  {HOSTEL_IMAGES.map((src, i) => (
                    <button key={i} type="button" onClick={() => setImageUrls(u => { const next = [...u]; const idx = next.findIndex(v => !v.trim()); if (idx !== -1) next[idx] = src; else next.push(src); return next; })}
                      className="w-14 h-10 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary w-full disabled:opacity-50" disabled={addImagesM.isPending || !imageUrls.some(u => u.trim())} onClick={() => addImagesM.mutate()}>
                {addImagesM.isPending ? "Saving..." : "Save Images"}
              </button>
            </div>
          )}

          {/* ── EDIT DETAILS ── */}
          {tab === "details" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                <input className="input-field" value={detailForm.name ?? ""} onChange={e => setDetailForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                <textarea className="input-field min-h-24" value={detailForm.description ?? ""} onChange={e => setDetailForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Rules & Regulations</label>
                <textarea className="input-field min-h-20" value={detailForm.rules_and_regulations ?? ""} onChange={e => setDetailForm(f => ({ ...f, rules_and_regulations: e.target.value }))} placeholder="House rules, curfew, policies..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone</label>
                  <input className="input-field" value={detailForm.phone ?? ""} onChange={e => setDetailForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                  <input className="input-field" value={detailForm.email ?? ""} onChange={e => setDetailForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Website</label>
                  <input className="input-field" value={detailForm.website ?? ""} onChange={e => setDetailForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <button className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2" disabled={updateM.isPending} onClick={() => updateM.mutate()}>
                <Check className="w-4 h-4" /> {updateM.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
