import { Outlet, useNavigate, useLocation,Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useServerStore } from "../store/useServerStore";
import LoadingScreen from "../components/Loading/LoadingPage";
import ServerCloseModal from "../components/GameDialog/ServerCloseModel";

export default function ServerRoute() {
  const location = useLocation();

  const {
    checkServerInGame,
    isServerClose,
    serverChecked,
  } = useServerStore();

  useEffect(() => {
    checkServerInGame(location.pathname);
  }, [location.pathname]);

  // ⏳ ยังไม่รู้สถานะ server → loading อย่างเดียว
  if (!serverChecked) {
    return <LoadingScreen open={true} />;
  }

  // ❌ server ปิด → redirect ก่อน Home render
  if (isServerClose) {
    return <Navigate to="/server-closed" replace />;
  }

  // ✅ server เปิด → render หน้าเกม
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
