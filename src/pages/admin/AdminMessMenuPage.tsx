import { useState } from "react";
import { UtensilsCrossed, Plus, X, Check, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminMessMenu, useCreateAdminMessMenu, useDeleteAdminMessMenu } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import { FOOD_IMAGES, getFoodImage } from "../../utils/images";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { useModal } from ".././../context/ModalContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["breakfast", "lunch", "snacks", "dinner"] as const;
type MealType = typeof MEALS[number];

const MEAL_TIMES: Record<MealType, string> = {
  breakfast: "7:30 – 9:30 AM",
  lunch: "12:30 – 2:30 PM",
  snacks: "5:00 – 6:00 PM",
  dinner: "7:30 – 9:30 PM",
};

const TODAY_DAY = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

export function AdminMessMenuPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;
  const { data, isLoading } = useAdminMessMenu(userId, hostelId, hostelIds);
  const createMutation = useCreateAdminMessMenu(userId, hostelId, hostelIds);
  const { openModal } = useModal()
  const [activeDay, setActiveDay] = useState(TODAY_DAY);
  const [editCell, setEditCell] = useState<{ day: string; meal: MealType } | null>(null);
  const [itemInput, setItemInput] = useState("");
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().slice(0, 10);
  });
  const deleteMutation = useDeleteAdminMessMenu(userId, hostelId, hostelIds);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          toast.success("Menu item deleted");
          setDeleteConfirmId(null);
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, "Failed to delete item"));
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  if (!userId || !hostelIds.length) {
    return <div className="p-8 text-slate-500">Login as admin with assigned hostels.</div>;
  }

  // Group existing items by day+meal
  const menuMap: Record<string, Record<string, any[]>> = {};
  (data ?? []).forEach((m: any) => {
    const day = m.day_of_week ?? "";
    const meal = m.meal_type ?? "";
    if (!menuMap[day]) menuMap[day] = {};
    if (!menuMap[day][meal]) menuMap[day][meal] = [];
    if (m.item_name) menuMap[day][meal].push(m);
  });
  console.log(data)
  async function handleAddItem() {
    if (!editCell || !itemInput.trim()) return;
    try {
      await createMutation.mutateAsync({
        week_start_date: weekStart,
        is_active: true,
        meal_type: editCell.meal,
        item_name: itemInput.trim(),
        day_of_week: editCell.day,
        is_veg: true,
      });
      toast.success("Item added");
      setItemInput("");
      setEditCell(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add item"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark dark:text-white">Mess Menu</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Manage weekly meal schedules for students.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Week of:</label>
          <input type="date" value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="input-field w-auto text-sm" />
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex items-center justify-between flex-wrap ">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DAYS.map((day) => (
            <button key={day} onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeDay === day
                ? "bg-primary text-white"
                : day === TODAY_DAY
                  ? "bg-primary/10 text-primary border border-primary/30 dark:bg-primary/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/50"
                }`}>
              {day.slice(0, 3)}
              {day === TODAY_DAY && <span className="ml-1 text-xs opacity-70">Today</span>}
            </button>
          ))}
        </div>

        <button onClick={() => openModal("messmenu")} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Menu Item
        </button>
      </div>


      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MEALS.map(m => <div key={m} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MEALS.map((meal) => {
            const items = menuMap[activeDay]?.[meal] ?? [];
            const stringItems = items.map((m: any) => m.item_name);
            const img = getFoodImage(meal, stringItems) ?? FOOD_IMAGES[meal];
            const isEditing = editCell?.day === activeDay && editCell?.meal === meal;

            return (
              <div key={meal} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden card-hover">
                {/* Food image */}
                <div className="relative h-32 overflow-hidden">
                  <img src={img} alt={meal} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="badge badge-primary text-xs capitalize">{meal}</span>
                  </div>
                  <div className="absolute top-3 right-3 text-white/80 text-xs">{MEAL_TIMES[meal]}</div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Items list */}
                  {items.length > 0 ? (
                    <ul className="space-y-1.5">
                      {items.map((m: any) => (
                        <li key={m.id} className="flex items-center justify-between group gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="truncate" title={m.item_name}>{m.item_name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal('messmenu', m)} title="Edit menu item" className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteClick(m.id)} title="Delete menu item" className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">No items added</p>
                  )}

                  {/* Add item inline */}
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={itemInput}
                        onChange={(e) => setItemInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(); if (e.key === "Escape") setEditCell(null); }}
                        placeholder="e.g. Idli Sambar"
                        className="input-field text-xs py-2 flex-1"
                      />
                      <button onClick={handleAddItem} disabled={createMutation.isPending || !itemInput.trim()}
                        className="p-2 rounded-xl bg-success text-white hover:bg-success/90 disabled:opacity-50 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditCell(null); setItemInput(""); }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-200 transition-colors">
                        <X className="w-4 h-4 dark:text-slate-300" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditCell({ day: activeDay, meal }); setItemInput(""); }}
                      className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                      <Plus className="w-3.5 h-3.5" /> Add item
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All entries table */}
      {!isLoading && (data ?? []).length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-dark dark:text-white">All Menu Entries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {["Day", "Meal", "Item", "Veg", "Active", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((m: any) => (
                  <tr key={m.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-dark dark:text-slate-200">{m.day_of_week ?? "—"}</td>
                    <td className="px-5 py-3 capitalize text-slate-600 dark:text-slate-400">{m.meal_type ?? "—"}</td>
                    <td className="px-5 py-3 text-dark dark:text-slate-200">{m.item_name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${m.is_veg ? "badge-success" : "badge-error"} text-xs`}>
                        {m.is_veg ? "Veg" : "Non-veg"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${m.is_active ? "badge-success" : "badge-slate"} text-xs`}>
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                          onClick={() => { openModal('messmenu', m) }}>
                          <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button onClick={() => handleDeleteClick(m.id)}
                          className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors">
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-dark dark:text-white">Delete Menu Item?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Are you sure you want to delete this item?
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 dark:bg-red-600 text-white font-semibold hover:bg-red-700 dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
