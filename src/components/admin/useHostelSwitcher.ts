import { useAdminMyHostels } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";

export const useHostelSwitcher = () => {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId);
  const setActiveHostelId = useAuthStore((s) => s.setActiveHostelId);

  const hostelsQ = useAdminMyHostels(userId, hostelIds);
  const hostels = hostelsQ.data ?? [];

  const active =
    hostels.find((h) => h.id === activeHostelId) ||
    hostels[0] ||
    null;

  return {
    hostels,
    hostelIds,
    activeHostelId,
    setActiveHostelId,
    active,
    isLoading: hostelsQ.isLoading,
  };
};