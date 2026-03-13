import { Outlet, useNavigate, useLocation,Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useServerStore } from "../store/useServerStore";
import { useAuthStore } from "../store/useAuthStore";
import LoadingScreen from "../components/Loading/LoadingPage";

export default function ServerRoute() {
  const location = useLocation();

  const currentUser = useAuthStore((state) => state.currentUser); // 2. ดึงข้อมูล user ปัจจุบัน

  const {
    checkServerInGame,
    isServerClose,
    serverChecked,
    isOffline,
  } = useServerStore();

  useEffect(() => {
    checkServerInGame(location.pathname);
  }, [location.pathname]);

  // ⏳ ยังไม่รู้สถานะ server → loading อย่างเดียว
  if (!serverChecked) {
    return <LoadingScreen open={true} />;
  }

  // 🛡️ เช็คเงื่อนไข Admin Bypass
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "adminBoss";

  // ❌ server ปิด และไม่ใช่ Admin และไม่ได้อยู่ในโหมด Offline (Local ล่ม)
  // ถ้าเป็น Admin เงื่อนไขนี้จะเป็น false เสมอ ทำให้ Admin ผ่านไปเล่นเกมได้
  if (isServerClose && !isOffline && !isAdmin) {
    return <Navigate to="/server-closed" replace />;
  }

  // ✅ server เปิด หรือ เป็น admin หรือ backend ล่ม(isOffline) → render หน้าเกม
  return <Outlet />;
}
// import { Outlet, useNavigate, useLocation } from "react-router-dom";
// import { useEffect, useRef } from "react";
// import { useServerStore } from "../store/useServerStore";
// import ServerCloseModal from "../components/GameDialog/ServerCloseModel";

// export default function ServerRoute() {
//   const checkServerInGame = useServerStore(
//     (state) => state.checkServerInGame
//   );

//   useEffect(() => {
//     // เช็คทันทีตอนเข้า
//     checkServerInGame();

//     // polling ทุก 5 วิ
//     const interval = setInterval(() => {
//       checkServerInGame();
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <>
//       {/* ทุกหน้าเกมจะโดน modal ครอบ */}
//       <ServerCloseModal />

//       {/* page จริง */}
//       <Outlet />
//     </>
//   );
// }
