// ── Unsplash image constants — no API key needed ──────────────────────────────

export const HOSTEL_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop&auto=format&q=80",
];

export const ROOM_IMAGES: Record<string, string> = {
  single:    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop&auto=format&q=80",
  double:    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop&auto=format&q=80",
  triple:    "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400&h=300&fit=crop&auto=format&q=80",
  dormitory: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop&auto=format&q=80",
};

export const FOOD_IMAGES: Record<string, string> = {
  breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&auto=format&q=80",
  lunch:     "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format&q=80",
  dinner:    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&auto=format&q=80",
  snacks:    "https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=400&h=300&fit=crop&auto=format&q=80",
  dal_rice:  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&auto=format&q=80",
  roti:      "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop&auto=format&q=80",
  idli:      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop&auto=format&q=80",
  biryani:   "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop&auto=format&q=80",
};

export const CITY_IMAGES: Record<string, string> = {
  Hyderabad: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop&auto=format&q=80",
  Mumbai:    "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&h=400&fit=crop&auto=format&q=80",
  Bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&h=400&fit=crop&auto=format&q=80",
  Delhi:     "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=400&fit=crop&auto=format&q=80",
  Pune:      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&h=400&fit=crop&auto=format&q=80",
  Chennai:   "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400&fit=crop&auto=format&q=80",
};

/** Pick a hostel image deterministically from the hostel's ID/name */
export function getHostelImage(idOrName: string): string {
  const code = idOrName.charCodeAt(0) % HOSTEL_IMAGES.length;
  return HOSTEL_IMAGES[code];
}

/** Pick a food image based on meal type and item names */
export function getFoodImage(mealType: string, items: string[] = []): string {
  const str = items.join(" ").toLowerCase();
  if (str.includes("idli") || str.includes("dosa")) return FOOD_IMAGES.idli;
  if (str.includes("biryani") || str.includes("rice")) return FOOD_IMAGES.biryani;
  if (str.includes("roti") || str.includes("chapati")) return FOOD_IMAGES.roti;
  if (str.includes("dal")) return FOOD_IMAGES.dal_rice;
  return FOOD_IMAGES[mealType.toLowerCase()] ?? FOOD_IMAGES.lunch;
}

/** DiceBear avatar URL */
export function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}
