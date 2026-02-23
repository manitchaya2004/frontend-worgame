import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export const AdminBossRoute = () => {
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!currentUser) return <Navigate to="/auth/login" replace />;

  const role = (currentUser.role || "").toLowerCase();
  const ok = role === "adminboss" || role === "admin_boss" || role === "adminBoss";;

  if (!ok) return <Navigate to="/403" replace />;

  return <Outlet />;
};
