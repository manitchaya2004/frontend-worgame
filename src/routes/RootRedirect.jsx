import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function RootRedirect() {
  const currentUser = useAuthStore((state) => state.currentUser);

  // App กัน authLoading ไว้แล้ว → ไม่ต้องเช็คซ้ำ
  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (currentUser.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/home" replace />;
}
