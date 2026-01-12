import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
export const AdminRoute = () => {
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
