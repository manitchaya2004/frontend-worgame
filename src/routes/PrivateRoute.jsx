import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function PrivateRoute() {
  const {
    isAuthenticated,
    checkFirstTime,
    isFirstTime,
  } = useAuthStore();

  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (isAuthenticated) {
        await checkFirstTime();
      }
      setLoading(false);
    };
    run();
  }, [isAuthenticated]);

  if (loading) return null;

  // ❌ ยังไม่ login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // ⭐ ยังไม่เลือก hero → บังคับไป select-hero
  // ⛔ แต่ต้องไม่ redirect ซ้ำ ถ้าอยู่หน้านั้นอยู่แล้ว
  if (isFirstTime && location.pathname !== "/select-hero") {
    return <Navigate to="/select-hero" replace />;
  }

  // ⭐ เลือก hero แล้ว แต่พยายามเข้า select-hero อีก
  if (!isFirstTime && location.pathname === "/select-hero") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
