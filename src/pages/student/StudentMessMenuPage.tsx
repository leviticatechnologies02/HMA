import { useState, useMemo } from "react";
import { UtensilsCrossed, Leaf, Drumstick } from "lucide-react";
import { useStudentMessMenu } from "../../hooks/useStudentComplaints";
import { useAuthStore } from "../../store/authStore";
import { StudentNotCheckedInBanner } from "../../components/student/StudentNotCheckedInBanner";

const FOOD_IMAGES: Record<string, string> = {
  breakfast:
    "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80",
  lunch: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
  snacks:
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
  dinner:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
};

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MEAL_TYPES = ["breakfast", "lunch", "snacks", "dinner"];

export function StudentMessMenuPage() {
  const userId = useAuthStore((s) => s.userId);
  const { data, isLoading, isError } = useStudentMessMenu(userId);

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [selectedDay, setSelectedDay] = useState(
    DAYS_OF_WEEK.includes(todayName) ? todayName : "Monday",
  );

  const menuItems = data ?? [];

  // ✅ FIXED: moved before early return — hooks must never come after a conditional return
  const mealsForSelectedDay = useMemo(() => {
    return menuItems.filter(
      (m: any) =>
        m.day_of_week?.trim().toLowerCase() ===
        selectedDay.trim().toLowerCase(),
    );
  }, [menuItems, selectedDay]);

  if (!userId)
    return (
      <div className="p-8 text-slate-500 dark:text-slate-400">
        Please login to view the mess menu.
      </div>
    );

  return (
    <div className="space-y-6">
      <StudentNotCheckedInBanner />

      <div>
        <h1 className="text-3xl font-heading font-bold text-dark dark:text-white">
          Mess Menu
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Weekly meal schedule for your hostel.
        </p>
      </div>

      {/* ✅ FIXED: clean loading skeleton — no nested condition inside */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && menuItems.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
          <UtensilsCrossed className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-dark dark:text-white mb-2">
            No menu available
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            The mess menu hasn't been published yet.
          </p>
        </div>
      )}

      {!isLoading && !isError && menuItems.length > 0 && (
        <>
          {/* Days Selector */}
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const hasMeals = menuItems.some(
                (m: any) => m.day_of_week?.trim() === day,
              );
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`min-w-[120px] px-5 py-3 rounded-xl font-semibold transition-all duration-200 border ${
                    selectedDay === day
                      ? "bg-primary text-white border-primary shadow-lg"
                      : hasMeals
                        ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-white border-slate-300 dark:border-slate-700 hover:bg-primary hover:text-white hover:border-primary"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Meal cards for selected day */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MEAL_TYPES.map((mealType) => {
              const mealData = mealsForSelectedDay.find(
                (m: any) => m.meal_type === mealType,
              );
              return (
                <div
                  key={mealType}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden card-hover flex flex-col h-full"
                >
                  <div className="h-32 relative overflow-hidden shrink-0">
                    <img
                      src={FOOD_IMAGES[mealType]}
                      alt={mealType}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <p className="absolute bottom-3 left-3 text-white font-heading font-bold capitalize text-lg">
                      {mealType}
                    </p>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 font-medium uppercase tracking-wider">
                      {mealType === "breakfast" && "7:00 AM – 9:00 AM"}
                      {mealType === "lunch" && "12:30 PM – 2:30 PM"}
                      {mealType === "snacks" && "5:00 PM – 6:00 PM"}
                      {mealType === "dinner" && "7:30 PM – 9:30 PM"}
                    </p>
                    {mealData ? (
                      <>
                        <p className="text-dark dark:text-white font-medium leading-snug flex-grow mb-3">
                          {mealData.item_name}
                        </p>
                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {mealData.is_veg ? (
                              <Leaf className="w-4 h-4 text-success" />
                            ) : (
                              <Drumstick className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {mealData.is_veg ? "Veg" : "Non-veg"}
                            </span>
                          </div>
                          {mealData.special_note && (
                            <span
                              className="text-[10px] bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary/80 border border-secondary/20 dark:border-secondary/30 px-2 py-0.5 rounded-full font-medium truncate max-w-[100px]"
                              title={mealData.special_note}
                            >
                              {mealData.special_note}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex-grow flex items-center justify-center flex-col text-slate-300 dark:text-slate-600 py-4">
                        <UtensilsCrossed className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm font-medium">Not specified</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-dark dark:text-white">
                Weekly Menu Overview
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {DAYS_OF_WEEK.filter((day) =>
                menuItems.some((m: any) => m.day_of_week === day),
              ).map((day) => {
                const dayMeals = menuItems.filter(
                  (m: any) => m.day_of_week === day,
                );
                return (
                  <div
                    key={day}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => setSelectedDay(day)}
                  >
                    <div className="w-28 shrink-0">
                      <p
                        className={`font-medium ${
                          selectedDay === day
                            ? "text-primary"
                            : "text-dark dark:text-white"
                        }`}
                      >
                        {day}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {dayMeals.length} meals served
                      </p>
                    </div>
                    <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-3">
                      {MEAL_TYPES.map((type) => {
                        const meal = dayMeals.find(
                          (m: any) => m.meal_type === type,
                        );
                        return meal ? (
                          <div
                            key={type}
                            className="bg-white dark:bg-slate-800 rounded-lg p-2.5 border border-slate-100 dark:border-slate-700 shadow-sm"
                          >
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase mb-1">
                              {type}
                            </p>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                              {meal.item_name}
                            </p>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
