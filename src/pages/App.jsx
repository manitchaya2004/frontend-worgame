import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { AdminRoute } from "../routes/AdminRoute";
import PrivateRoute from "../routes/PrivateRoute";
import RootRedirect from "../routes/RootRedirect";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import LoginPage from "./AuthPage/LoginPage";
import RegisterPage from "./AuthPage/RegisterPage";
import HomePage from "./HomePage";
import AdvantureFeature from "./HomePage/feature/AdvantureFeature";
import ShopSpellFeature from "./HomePage/feature/ShopSpellFeature";
import DictionaryLibrary from "./HomePage/feature/LibraryFeature/dictionary/DictionaryLibrary";
import MonsterLibrary from "./HomePage/feature/LibraryFeature/monster/MonsterLibrary";
import GamePage from "./GamePage/GamePage";
import AuthPage from "./AuthPage";
import { HomeLobbyLayout } from "./HomePage/HomeLobbyLayout";
import LibraryFeature from "./HomePage/feature/LibraryFeature";
import AdminPage from "./AdminPage/AdminPage";
// import NotFoundPage from "./NotFoundPage";
export default function App() {
  const authLoading = useAuthStore((state) => state.authLoading);
  const checkAuth = useAuthStore((state)=>state.checkAuth);

  // เช็ค auth ตอนเปิดเว็บ
  useEffect(() => {
    checkAuth();
  }, []);

  if (authLoading) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      {/* public */}
      <Route element={<AuthLayout />}>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
      </Route>

      {/* private (player)*/}
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<HomePage />}>
          <Route index element={<HomeLobbyLayout />} />
        </Route>
        <Route path="/home/adventure" element={<AdvantureFeature />} />
        <Route path="/home/shop" element={<ShopSpellFeature />} />
        <Route path="/home/library" element={<LibraryFeature />} />
        <Route
          path="/home/library/dictionary"
          element={<DictionaryLibrary />}
        />
        <Route path="/home/library/monster" element={<MonsterLibrary />} />
        <Route path="/battle" element={<GamePage />} />
      </Route>

      {/* Admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
