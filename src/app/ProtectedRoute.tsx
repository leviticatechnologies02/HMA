import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { refreshToken } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function ProtectedRoute() {
  const { isAuthenticated } = useCurrentUser();
  const location = useLocation();
  const role = useAuthStore((s) => s.role);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    let cancelled = false;

    async function tryRefresh() {
      if (isAuthenticated) {
        setChecking(false);
        return;
      }

      try {
        const data = await refreshToken();
        console.log(data, "refreshToken success");
        if (cancelled) return;
        setUser(data.user_id, data.role, data.access_token, data.hostel_ids);
        setChecking(false);
      } catch {
        if (cancelled) return;
        clearUser();
        setChecking(false);
      }
    }

    setChecking(!isAuthenticated);
    void tryRefresh();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setUser, clearUser]);

  if (checking) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const pathname = location.pathname;
  const rolePrefixMap: Record<string, string> = {
    super_admin: "/super-admin",
    hostel_admin: "/admin",
    supervisor: "/supervisor",
    student: "/student",
  };
  const requiredPrefix =
    role && (pathname.startsWith("/super-admin") || pathname.startsWith("/admin") || pathname.startsWith("/supervisor") || pathname.startsWith("/student"))
      ? rolePrefixMap[role]
      : null;
  if (requiredPrefix && !pathname.startsWith(requiredPrefix)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

