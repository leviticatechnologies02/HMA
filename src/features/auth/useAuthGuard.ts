import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser, type UserRole } from "../../hooks/useCurrentUser";

export function useAuthGuard(requiredRole?: UserRole) {
  const { isAuthenticated, role } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (requiredRole && role !== requiredRole && role !== "super_admin") {
      navigate("/login");
    }
  }, [isAuthenticated, role, requiredRole, navigate]);
}
