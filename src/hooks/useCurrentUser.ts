import { useAuthStore } from "../store/authStore";

export type UserRole = "super_admin" | "hostel_admin" | "supervisor" | "student" | "visitor";

export function useCurrentUser() {
  const userId = useAuthStore((s) => s.userId);
  const role = useAuthStore((s) => s.role) as UserRole | null;
  const accessToken = useAuthStore((s) => s.accessToken);
  const hostelIds = useAuthStore((s) => s.hostelIds);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated) && !!accessToken && !!userId;

  function hasRole(...roles: UserRole[]): boolean {
    return role !== null && roles.includes(role);
  }

  function canAccess(requiredRole: UserRole): boolean {
    return role === "super_admin" || role === requiredRole;
  }

  return {
    userId,
    role,
    hostelIds,
    isAuthenticated,
    hasRole,
    canAccess,
    isSuperAdmin: role === "super_admin",
    isHostelAdmin: role === "hostel_admin",
    isSupervisor: role === "supervisor",
    isStudent: role === "student",
    isVisitor: role === "visitor",
  };
}
