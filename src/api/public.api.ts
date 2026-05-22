import { api } from "./axiosInstance";

// ============ SCHEMAS ============

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface HostelListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  state: string;
  hostel_type: string;
  status: string;
  is_public: boolean;
  is_featured: boolean;
  rating: number;
  total_reviews: number;
  starting_price: number;
  starting_daily_price: number;
  starting_monthly_price: number;
  available_beds: number;
  images?: Array<{ id: string; url: string; thumbnail_url: string; is_primary: boolean; sort_order: number }>;
  created_at: string;
  updated_at: string;
}

export interface HostelImage {
  id: string;
  url: string;
  thumbnail_url: string;
  caption?: string | null;
  image_type: string;
  sort_order: number;
  is_primary: boolean;
}

export interface HostelDetail extends HostelListItem {
  address_line1: string;
  address_line2?: string | null;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string | null;
  rules_and_regulations?: string | null;
  latitude: number;
  longitude: number;
  amenities: string[];
  images: HostelImage[];
}

export interface Room {
  id: string;
  hostel_id: string;
  room_number: string;
  floor: number;
  room_type: string;
  total_beds: number;
  daily_rent: number;
  monthly_rent: number;
  security_deposit: number;
  dimensions?: string | null;
  is_active: boolean;
  available_beds: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  visitor_id: string;
  overall_rating: number;
  title: string;
  content: string;
  is_verified: boolean;
  created_at: string;
}

export interface City {
  city: string;
  hostel_count: number;
}

export interface PublicHostelsQueryParams {
  city?: string;
  hostel_type?: string;
  room_type?: string;
  min_price?: number;
  max_price?: number;
  available_from?: string;
  booking_mode?: "daily" | "monthly";
  is_featured?: boolean;
  page?: number;
  per_page?: number;
}

export interface InquiryPayload {
  hostel_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

// ============ API CALLS ============

export const fetchPublicHostels = async (params?: PublicHostelsQueryParams) => {
  const response = await api.get<PaginatedResponse<HostelListItem>>(
    "/public/hostels",
    { params }
  );
  return response.data;
};

export const fetchPublicHostel = async (slug: string): Promise<HostelDetail> => {
  const response = await api.get<HostelDetail>(`/public/hostels/${slug}`);
  return response.data;
}

export async function fetchHostelRooms(hostelId: string) {
  const response = await api.get<Room[]>(`/public/hostels/${hostelId}/rooms`);
  return response.data;
}

export async function fetchHostelReviews(hostelId: string) {
  const response = await api.get<Review[]>(`/public/hostels/${hostelId}/reviews`);
  return response.data;
}

export async function fetchPublicCities() {
  const response = await api.get<City[]>("/public/cities");
  return response.data;
}

export async function submitInquiry(payload: InquiryPayload) {
  const response = await api.post("/public/inquiries", payload);
  return response.data;
}

export interface ReviewPayload {
  hostel_id: string;
  booking_id?: string;
  overall_rating: number;
  cleanliness_rating: number;
  food_rating: number;
  security_rating: number;
  value_rating: number;
  title: string;
  content: string;
}

export async function submitReview(payload: ReviewPayload) {
  const response = await api.post("/visitor/reviews", payload);
  return response.data;
}

export async function fetchMyReviews() {
  const response = await api.get("/visitor/reviews");
  return response.data;
}
