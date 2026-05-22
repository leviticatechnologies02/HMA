import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { MapPin, Star, Phone, Mail, Globe, Shield, ArrowRight, Building2, Bed, MessageSquare, Send, UtensilsCrossed, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { useHostelDetail, useHostelReviews, useHostelRooms, useSubmitInquiry } from "../../hooks/useHostelDetail";
import { joinWaitlist } from "../../api/booking.api";
import { submitReview } from "../../api/public.api";
import { api } from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { FOOD_IMAGES, getFoodImage } from "../../utils/images";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatters";

const MEAL_TIMES: Record<string, string> = {
  breakfast: "7:30 – 9:30 AM",
  lunch: "12:30 – 2:30 PM",
  snacks: "5:00 – 6:00 PM",
  dinner: "7:30 – 9:30 PM",
};
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DETAIL_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
];

export function PublicHostelDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useCurrentUser();
  const detailQuery = useHostelDetail(slug!);
  const roomsQuery = useHostelRooms(detailQuery.data?.id);
  const reviewsQuery = useHostelReviews(detailQuery.data?.id);
  const inquiryMutation = useSubmitInquiry();
  const userId = useAuthStore((s) => s.userId);
  const waitlistMutation = useMutation({
    mutationFn: joinWaitlist
  });

  const favoriteMutation = useMutation({
    mutationFn: (hostelId: string) =>
      userId ? api.post(`/visitor/favorites/${hostelId}`) : Promise.reject("Login required"),
    onSuccess: () => toast.success("Added to favorites"),
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Login to save favorites"),
  });

  const [inquiryForm, setInquiryForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [inquirySent, setInquirySent] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [waitlistMessageByRoom, setWaitlistMessageByRoom] = useState<Record<string, string>>({});
  const [reviewForm, setReviewForm] = useState({ title: "", content: "", overall_rating: 5, cleanliness_rating: 5, food_rating: 5, security_rating: 5, value_rating: 5 });
  const [reviewSent, setReviewSent] = useState(false);
  const reviewMutation = useMutation({
    mutationFn: (hostelId: string) => submitReview({ hostel_id: hostelId, ...reviewForm } as any),
    onSuccess: () => { setReviewSent(true); toast.success("Review submitted!"); },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Could not submit review"),
  });

  // Mess menu for public hostel detail
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return DAYS[d === 0 ? 6 : d - 1];
  });
  const messMenuQ = useQuery({
    queryKey: ["public-mess-menu", detailQuery.data?.id],
    queryFn: () => api.get(`/admin/hostels/${detailQuery.data!.id}/mess-menu`).then(r => r.data).catch(() => []),
    enabled: Boolean(detailQuery.data?.id) && Boolean(userId), // Only fetch if user is logged in
  });
  console.log(messMenuQ.data, "from public")
  // ── useMemo hooks must be before any early returns (Rules of Hooks) ──
  const reviews = reviewsQuery.data ?? [];
  const starBreakdown = useMemo(() => {
    const total = reviews.length || 1;
    const counts = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => Math.round(r.overall_rating) === star).length,
    }));
    return counts.map((row) => ({ ...row, pct: (row.count / total) * 100 }));
  }, [reviews]);

  const hostelAmenities = detailQuery.data?.amenities ?? [];
  const groupedAmenities = useMemo(() => {
    const groups: Record<string, string[]> = { Essential: [], Safety: [], Lifestyle: [], Other: [] };
    const safetyKeys = ["cctv", "guard", "security", "fire", "safe"];
    const lifestyleKeys = ["gym", "wifi", "mess", "food", "laundry", "tv", "ac", "parking"];
    const essentialKeys = ["water", "power", "cleaning", "housekeeping", "bed", "study", "lift"];
    hostelAmenities.forEach((amenity) => {
      const key = amenity.toLowerCase();
      if (safetyKeys.some((k) => key.includes(k))) groups.Safety.push(amenity);
      else if (lifestyleKeys.some((k) => key.includes(k))) groups.Lifestyle.push(amenity);
      else if (essentialKeys.some((k) => key.includes(k))) groups.Essential.push(amenity);
      else groups.Other.push(amenity);
    });
    return groups;
  }, [hostelAmenities]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailQuery.data) return;
    await inquiryMutation.mutateAsync({ hostel_id: detailQuery.data.id, ...inquiryForm });
    setInquirySent(true);
    setInquiryForm({ name: "", email: "", phone: "", message: "" });
  };

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-screen bg-neutral">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <div className="skeleton h-72 rounded-3xl" />
              <div className="skeleton h-8 w-2/3" />
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-32 rounded-2xl" />
            </div>
            <div className="skeleton h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">Hostel not found</h2>
          <Link to="/hostels" className="btn-primary inline-flex items-center gap-2 mt-4">
            Browse All Hostels
          </Link>
        </div>
      </div>
    );
  }

  const hostel = detailQuery.data;
  const rooms = roomsQuery.data ?? [];
  const minMonthly = rooms.length > 0 ? Math.min(...rooms.map((r) => r.monthly_rent)) : null;
  const galleryImages = hostel.images?.length
    ? hostel.images.map((img) => img.url)
    : [DETAIL_IMAGES[hostel.name.charCodeAt(0) % DETAIL_IMAGES.length], ...DETAIL_IMAGES];
  const heroImage = selectedImage ?? galleryImages[0];

  return (
    <div className="min-h-screen bg-neutral">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Hero image + thumbnails */}
            <div className="rounded-3xl relative overflow-hidden">
              <div className="h-72 relative overflow-hidden rounded-3xl">
                <img src={heroImage} alt={hostel.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {hostel.is_featured && <span className="badge badge-primary">Featured</span>}
                  <span className="badge badge-slate capitalize">{hostel.hostel_type?.replace("_", "-")}</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {galleryImages.slice(0, 8).map((img) => (
                  <button
                    key={img}
                    onClick={() => setSelectedImage(img)}
                    className={`h-16 rounded-xl overflow-hidden border ${heroImage === img ? "border-primary" : "border-slate-200"}`}
                  >
                    <img src={img} alt="Hostel preview" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Hostel Detail</p>
              <h1 className="text-3xl font-heading font-bold text-dark">{hostel.name}</h1>
              <div className="flex items-center gap-2 mt-2 text-slate-500">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{hostel.address_line1}, {hostel.city}, {hostel.state} — {hostel.pincode}</span>
              </div>
              {(hostel.rating ?? 0) > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(hostel.rating) ? "text-accent fill-accent" : "text-slate-300"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-dark">{hostel.rating}</span>
                  <span className="text-sm text-slate-500">({hostel.total_reviews} reviews)</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h2 className="text-lg font-bold text-dark mb-3">Overview</h2>
              <p className="text-slate-600 leading-relaxed">{hostel.description}</p>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h2 className="text-lg font-bold text-dark mb-4">Contact</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {hostel.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    {hostel.phone}
                  </div>
                )}
                {hostel.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    {hostel.email}
                  </div>
                )}
                {hostel.website && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    {hostel.website}
                  </div>
                )}
              </div>
            </div>

            {/* Rooms */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h2 className="text-lg font-bold text-dark mb-4">Available Rooms</h2>
              {roomsQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
                </div>
              ) : rooms.length > 0 ? (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div key={room.id} className="rounded-2xl border border-slate-200 p-4 hover:border-primary/30 hover:bg-primary/5 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-dark">Room {room.room_number}</h3>
                            <span className="badge badge-secondary capitalize text-xs">{room.room_type}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            Floor {room.floor} · {room.total_beds} beds total
                            {room.available_beds !== undefined && ` · ${room.available_beds} available`}
                          </p>
                          {room.dimensions && <p className="text-xs text-slate-400 mt-1">{room.dimensions}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-xs text-slate-500">Daily</p>
                              <p className="font-bold text-primary">₹{room.daily_rent}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Monthly</p>
                              <p className="font-bold text-dark">₹{room.monthly_rent}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (!isAuthenticated) {
                                navigate("/login", { state: { from: location.pathname } });
                              } else {
                                navigate(`/booking/select?hostel=${hostel.slug}&room=${room.id}`);
                              }
                            }}
                            className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline bg-none border-none p-0 cursor-pointer"
                          >
                            Book
                          </button>
                          {room.available_beds !== undefined && room.available_beds <= 0 && (
                            <button
                              type="button"
                              className="mt-2 block text-xs font-semibold text-warning hover:underline disabled:opacity-60"
                              disabled={!userId || waitlistMutation.isPending}
                              onClick={async () => {
                                if (!userId) {
                                  navigate("/login", { state: { from: location.pathname } });
                                  return;
                                }
                                try {
                                  const today = new Date();
                                  const checkIn = new Date(today);
                                  checkIn.setDate(today.getDate() + 1);
                                  const checkOut = new Date(today);
                                  checkOut.setDate(today.getDate() + 31);
                                  const result = await waitlistMutation.mutateAsync({
                                    hostel_id: hostel.id,
                                    room_id: room.id,
                                    booking_mode: "monthly",
                                    check_in_date: checkIn.toISOString().slice(0, 10),
                                    check_out_date: checkOut.toISOString().slice(0, 10)
                                  });
                                  setWaitlistMessageByRoom((prev) => ({
                                    ...prev,
                                    [room.id]: `Waitlist joined. Position #${result.position}`
                                  }));
                                } catch {
                                  setWaitlistMessageByRoom((prev) => ({
                                    ...prev,
                                    [room.id]: "Unable to join waitlist right now."
                                  }));
                                }
                              }}
                            >
                              {userId ? "Join Waitlist" : "Login to Join Waitlist"}
                            </button>
                          )}
                          {waitlistMessageByRoom[room.id] && (
                            <p className="mt-1 text-xs text-slate-500">{waitlistMessageByRoom[room.id]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <Bed className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-slate-500 text-sm">No rooms listed yet.</p>
                  <a href={`mailto:${hostel.email}`}
                    className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
                    <Send className="w-3.5 h-3.5" /> Contact hostel for availability
                  </a>
                </div>
              )}
            </div>

            {/* Mess Menu */}
            {(() => {
              const menus: any[] = messMenuQ.data ?? [];
              const menuMap: Record<string, Record<string, string[]>> = {};
              menus.forEach((m: any) => {
                const day = m.day_of_week ?? "";
                const meal = m.meal_type ?? "";
                if (!menuMap[day]) menuMap[day] = {};
                if (!menuMap[day][meal]) menuMap[day][meal] = [];
                if (m.item_name) menuMap[day][meal].push(m.item_name);
              });
              const hasMenu = menus.length > 0;
              return (
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <UtensilsCrossed className="w-5 h-5 text-secondary" />
                    <h2 className="text-lg font-bold text-dark">Daily Mess Menu</h2>
                    <span className="ml-auto flex items-center gap-1.5 text-xs text-success font-semibold">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live
                    </span>
                  </div>
                  {/* Day tabs */}
                  <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
                    {DAYS.map(day => (
                      <button key={day} onClick={() => setActiveDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeDay === day ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  {hasMenu ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(["breakfast", "lunch", "snacks", "dinner"] as const).map(meal => {
                        const items = menuMap[activeDay]?.[meal] ?? [];
                        const img = getFoodImage(meal, items) ?? FOOD_IMAGES[meal];
                        return (
                          <div key={meal} className="rounded-xl overflow-hidden border border-slate-100">
                            <div className="h-20 relative overflow-hidden">
                              <img src={img} alt={meal} className="w-full h-full object-cover" loading="lazy" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <span className="absolute bottom-2 left-2 text-white text-xs font-bold capitalize">{meal}</span>
                            </div>
                            <div className="p-2">
                              <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                <Clock className="w-3 h-3" />{MEAL_TIMES[meal]}
                              </p>
                              {items.length > 0 ? (
                                <ul className="space-y-0.5">
                                  {items.slice(0, 3).map((item, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-primary shrink-0" />{item}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-slate-400 italic">Not available</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Mess menu not published yet.</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Rules */}
            {hostel.rules_and_regulations && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-dark">Rules & Regulations</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">{hostel.rules_and_regulations}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold text-dark">Reviews</h2>
                {reviews.length > 0 && (
                  <span className="ml-auto text-sm text-slate-500">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                )}
              </div>
              {reviews.length > 0 && (
                <div className="mb-4 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-dark mb-2">Star breakdown</p>
                  <div className="space-y-2">
                    {starBreakdown.map((row) => (
                      <div key={row.star} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-6">{row.star}★</span>
                        <div className="h-2 flex-1 rounded bg-slate-100 overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${row.pct}%` }} />
                        </div>
                        <span>{row.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {reviewsQuery.isLoading ? (
                <div className="space-y-3">{[1, 2].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.overall_rating ? "text-accent fill-accent" : "text-slate-300"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 ml-auto">{review.created_at?formatDate(review.created_at):""}</span>
                        {review.is_verified && <span className="badge badge-success text-xs">Verified</span>}
                      </div>
                      {review.title && <p className="font-semibold text-sm text-dark mb-1">{review.title}</p>}
                      <p className="text-sm text-slate-600">{review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No reviews yet.</p>
                </div>
              )}
            </div>

            {/* Write a Review */}
            {userId && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-bold text-dark">Write a Review</h2>
                </div>
                {reviewSent ? (
                  <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
                    <p className="text-success font-semibold">Thank you for your review!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Title</label>
                      <input className="input-field text-sm" placeholder="Summarize your experience" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {(["overall_rating", "cleanliness_rating", "food_rating", "security_rating", "value_rating"] as const).map(key => (
                        <div key={key}>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{key.replace("_rating", "").replace("overall", "Overall")}</label>
                          <select className="input-field text-sm" value={reviewForm[key]} onChange={e => setReviewForm(f => ({ ...f, [key]: Number(e.target.value) }))}>
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}★</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Your Review</label>
                      <textarea className="input-field text-sm min-h-20" placeholder="Share your experience (min 10 characters)..." value={reviewForm.content} onChange={e => setReviewForm(f => ({ ...f, content: e.target.value }))} />
                    </div>
                    <button
                      onClick={() => hostel && reviewMutation.mutate(hostel.id)}
                      disabled={reviewMutation.isPending || reviewForm.title.length < 3 || reviewForm.content.length < 10}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50">
                      <Star className="w-4 h-4" />
                      {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Inquiry Form */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-dark">Send an Inquiry</h2>
              </div>
              {inquirySent ? (
                <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
                  <p className="text-success font-semibold">Inquiry sent! The hostel will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleInquiry} className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Your Name</label>
                    <input required value={inquiryForm.name} onChange={(e) => setInquiryForm((c) => ({ ...c, name: e.target.value }))} className="input-field text-sm" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                    <input required type="email" value={inquiryForm.email} onChange={(e) => setInquiryForm((c) => ({ ...c, email: e.target.value }))} className="input-field text-sm" placeholder="you@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone</label>
                    <input required value={inquiryForm.phone} onChange={(e) => setInquiryForm((c) => ({ ...c, phone: e.target.value }))} className="input-field text-sm" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Message</label>
                    <textarea required rows={3} value={inquiryForm.message} onChange={(e) => setInquiryForm((c) => ({ ...c, message: e.target.value }))} className="input-field text-sm" placeholder="Ask about availability, pricing, facilities..." />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={inquiryMutation.isPending} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                      <Send className="w-4 h-4" />
                      {inquiryMutation.isPending ? "Sending..." : "Send Inquiry"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Maps */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h2 className="text-lg font-bold text-dark mb-3">Location & Nearby</h2>
              <div className="rounded-2xl overflow-hidden border border-slate-200 mb-4">
                <iframe
                  title="Hostel location map"
                  src={`https://maps.google.com/maps?q=${hostel.latitude},${hostel.longitude}&z=15&output=embed`}
                  width="100%"
                  height="280"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${hostel.latitude},${hostel.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                  <MapPin className="w-4 h-4" /> Get Directions
                </a>
              </div>
              {/* Nearby landmarks hint */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Nearby</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    `${hostel.city} Railway Station`,
                    `${hostel.city} Bus Stand`,
                    "Metro Station",
                    "University Area",
                    "IT Park",
                  ].map(place => (
                    <a key={place}
                      href={`https://www.google.com/maps/search/${encodeURIComponent(place + " near " + hostel.address_line1 + " " + hostel.city)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="badge badge-slate text-xs hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                      {place}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right sticky sidebar */}
          <aside className="h-fit sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
              <p className="text-sm text-slate-500">Starting from</p>
              {minMonthly ? (
                <>
                  <p className="mt-1 text-4xl font-heading font-bold text-primary">
                    ₹{minMonthly.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">/month</p>
                </>
              ) : (
                <p className="mt-1 text-lg font-semibold text-slate-400">Contact for pricing</p>
              )}

              <div className="mt-6 space-y-3">
                {rooms.length > 0 ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate("/login", { state: { from: location.pathname } });
                      } else {
                        navigate(`/booking/select?hostel=${hostel.slug}`);
                      }
                    }}
                    className="btn-primary flex items-center justify-center gap-2 w-full"
                  >
                    Book Now <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <a
                    href={`mailto:${hostel.email}`}
                    className="btn-primary flex items-center justify-center gap-2 w-full"
                  >
                    <Send className="w-4 h-4" /> Contact Hostel
                  </a>
                )}
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/login", { state: { from: location.pathname } });
                    } else {
                      favoriteMutation.mutate(hostel.id);
                    }
                  }}
                  disabled={favoriteMutation.isPending}
                  className="btn-outline flex items-center justify-center gap-2 w-full disabled:opacity-50"
                >
                  ♡ Save to Favorites
                </button>
                <Link to="/hostels" className="btn-outline flex items-center justify-center gap-2 w-full">
                  Back to Listings
                </Link>
              </div>

              {/* Quick info */}
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Shield className="w-4 h-4 text-success shrink-0" />
                  Verified hostel
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="capitalize">{hostel.hostel_type?.replace("_", "-")} hostel</span>
                </div>
                {hostel.city && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    {hostel.city}, {hostel.state}
                  </div>
                )}
                {(hostel.rating ?? 0) > 0 && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Star className="w-4 h-4 text-accent shrink-0" />
                    {hostel.rating} / 5 ({hostel.total_reviews} reviews)
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {hostel.amenities && hostel.amenities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100">
                <h3 className="font-bold text-dark mb-4">Amenities</h3>
                <div className="space-y-3">
                  {Object.entries(groupedAmenities).map(([group, items]) =>
                    items.length > 0 ? (
                      <div key={group}>
                        <p className="text-xs font-semibold uppercase text-slate-500 mb-2">{group}</p>
                        <div className="flex flex-wrap gap-2">
                          {items.map((a) => (
                            <span key={`${group}-${a}`} className="badge badge-slate text-xs">{a}</span>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* No amenities placeholder */}
            {(!hostel.amenities || hostel.amenities.length === 0) && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100">
                <h3 className="font-bold text-dark mb-3">Amenities</h3>
                <p className="text-sm text-slate-400 italic">Amenity details not listed yet. Contact the hostel directly.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
