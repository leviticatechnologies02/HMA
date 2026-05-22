import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar, Bed, ArrowRight, ChevronLeft, CheckCircle } from "lucide-react";
import { useHostelDetail } from "../../hooks/useHostels";
import { fetchHostelRooms, type Room } from "../../api/public.api";
import { useBookingStore } from "../../store/bookingStore";
import { formatDate } from "../../utils/formatters";

export function BookingSelectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hostelSlug = searchParams.get("hostel") ?? "";

  const { data: hostel, isLoading, isError } = useHostelDetail(hostelSlug);

  const [bookingMode, setBookingMode] = useState<"daily" | "monthly">("monthly");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const setSelection = useBookingStore((s) => s.setSelection);

  const today = new Date().toISOString().split("T")[0];

  // Minimum check-out: next day for daily, 1 month ahead for monthly
  const minCheckOut = (() => {
    if (!checkInDate) return today;
    const d = new Date(checkInDate);
    if (bookingMode === "monthly") {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 1);
    }
    return d.toISOString().split("T")[0];
  })();

  // Reset check-out when mode changes or check-in changes to an invalid state
  useEffect(() => {
    if (checkOutDate && checkOutDate < minCheckOut) {
      setCheckOutDate("");
    }
  }, [bookingMode, checkInDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const datesSelected = Boolean(checkInDate && checkOutDate && checkOutDate >= minCheckOut);

  useEffect(() => {
    if (hostel?.id) {
      setRoomsLoading(true);
      fetchHostelRooms(hostel.id)
        .then(setRooms)
        .catch(() => setRooms([]))
        .finally(() => setRoomsLoading(false));
    }
  }, [hostel?.id]);

  const handleSelectRoom = (room: Room) => {
    if (!datesSelected || !hostel) return;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000));
    const months = Math.max(1, Math.ceil(nights / 30));
    const duration = bookingMode === "daily" ? nights : months;
    const rentTotal = bookingMode === "daily" ? room.daily_rent * nights : room.monthly_rent * months;
    const securityDeposit = room.security_deposit ?? 0;
    const bookingAdvance = Math.ceil(rentTotal * 0.25);
    const grandTotal = rentTotal + securityDeposit;
    setSelection({
      hostelId: hostel.id,
      roomId: room.id,
      bookingMode,
      checkInDate,
      checkOutDate,
      duration,
      dailyRent: room.daily_rent,
      monthlyRent: room.monthly_rent,
      securityDeposit,
      bookingAdvance,
      grandTotal,
    });
    navigate("/booking/details");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading hostel...</p>
        </div>
      </div>
    );
  }

  if (isError || !hostel) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">Hostel not found.</p>
          <button onClick={() => navigate("/hostels")} className="btn-primary">Browse Hostels</button>
        </div>
      </div>
    );
  }

  const nights = datesSelected
    ? Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000))
    : 0;
  const months = datesSelected ? Math.max(1, Math.ceil(nights / 30)) : 0;

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div>
          <button onClick={() => navigate(`/hostels/${hostel.slug}`)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-3 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to {hostel.name}
          </button>
          <h1 className="text-3xl font-heading font-bold text-dark">Select Your Stay</h1>
          <p className="mt-1 text-slate-500">{hostel.name} · {hostel.city}, {hostel.state}</p>
        </div>

        {/* Step 1 — Booking type & dates */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="font-bold text-dark flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
            Choose type & dates
          </h2>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-3">
            {(["monthly", "daily"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBookingMode(mode)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  bookingMode === mode ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/40"
                }`}
              >
                <p className="font-semibold text-dark capitalize">{mode}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mode === "monthly" ? "Best value · pay per month" : "Flexible · pay per night"}
                </p>
              </button>
            ))}
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                <Calendar className="w-4 h-4 inline mr-1 text-primary" />Check-in
              </label>
              <input
                type="date"
                value={checkInDate}
                min={today}
                onChange={(e) => { setCheckInDate(e.target.value); setCheckOutDate(""); }}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                <Calendar className="w-4 h-4 inline mr-1 text-slate-400" />Check-out
              </label>
              <input
                type="date"
                value={checkOutDate}
                min={minCheckOut}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="input-field"
                disabled={!checkInDate}
              />
            </div>
          </div>

          {datesSelected && (
            <div className="flex items-center gap-2 text-sm text-success bg-success/5 border border-success/20 rounded-xl px-4 py-2.5">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {bookingMode === "daily"
                ? `${nights} night${nights !== 1 ? "s" : ""} selected`
                : `${months} month${months !== 1 ? "s" : ""} selected`
              } · {formatDate(checkInDate)} → {formatDate(checkOutDate)}
            </div>
          )}
        </div>

        {/* Step 2 — Room selection */}
        <div className={`bg-white rounded-2xl border p-6 space-y-4 transition-all ${datesSelected ? "border-slate-100" : "border-slate-100 opacity-60 pointer-events-none"}`}>
          <h2 className="font-bold text-dark flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold ${datesSelected ? "bg-primary" : "bg-slate-300"}`}>2</span>
            Select a room
            {!datesSelected && <span className="text-xs text-slate-400 font-normal">(select dates first)</span>}
          </h2>

          {roomsLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}

          {!roomsLoading && rooms.length === 0 && (
            <div className="text-center py-8">
              <Bed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No rooms available at this hostel.</p>
            </div>
          )}

          {!roomsLoading && rooms.length > 0 && (
            <div className="space-y-3">
              {rooms.map((room) => {
                const price = bookingMode === "daily" ? room.daily_rent : room.monthly_rent;
                const unit = bookingMode === "daily" ? "night" : "month";
                const total = bookingMode === "daily"
                  ? room.daily_rent * nights
                  : room.monthly_rent * months;
                const hasAvailability = (room.available_beds ?? 0) > 0;

                return (
                  <div
                    key={room.id}
                    className={`rounded-xl border p-4 transition-all ${hasAvailability ? "border-slate-200 hover:border-primary/40 hover:bg-primary/5" : "border-slate-100 bg-slate-50 opacity-60"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-dark">Room {room.room_number}</h3>
                          <span className="badge badge-secondary capitalize text-xs">{room.room_type}</span>
                          {!hasAvailability && <span className="badge badge-error text-xs">Full</span>}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          Floor {room.floor} · {room.total_beds} beds · {room.available_beds ?? 0} available
                        </p>
                        {room.dimensions && <p className="text-xs text-slate-400 mt-0.5">{room.dimensions}</p>}
                        {datesSelected && nights > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            Est. total: <span className="font-semibold text-dark">₹{total.toLocaleString()}</span>
                            {bookingMode === "daily" ? ` for ${nights} night${nights !== 1 ? "s" : ""}` : ` for ${months} month${months !== 1 ? "s" : ""}`}
                            {" "}+ ₹{room.security_deposit.toLocaleString()} deposit
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-primary">₹{price.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">/{unit}</p>
                        <button
                          onClick={() => handleSelectRoom(room)}
                          disabled={!hasAvailability || !datesSelected}
                          className="mt-2 flex items-center gap-1 text-sm font-semibold text-primary hover:text-white hover:bg-primary px-3 py-1.5 rounded-lg border border-primary/30 hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Select <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
