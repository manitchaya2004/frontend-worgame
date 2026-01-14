import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOADED, LOADING, FAILED, INITIALIZED, API_URL } from "./const";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ================= STATE (เหมือน Redux) ================= */
      registerState: INITIALIZED,
      loginState: INITIALIZED,
      selectHeroState: INITIALIZED,
      buyHeroState: INITIALIZED,
      buyHeroError: null,
      
      authLoading: true,
      isAuthenticated: false,
      isFirstTime: false,
      currentUser: null,

      backendRegisMessage: null,
      backendLoginMessage: null,

      errorLogin: false,
      errorRegister: false,

      /* ================= ACTIONS ================= */

      /* ===== REGISTER ===== */
      registerUser: async (userData) => {
        try {
          set({
            registerState: LOADING,
            backendRegisMessage: null,
            errorRegister: false,
          });

          const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
            credentials: "include",
          });

          if (!res.ok) {
            throw new Error("Server error, please try again");
          }

          const data = await res.json();

          if (!data.isSuccess) {
            throw new Error(data.message);
          }

          set({
            registerState: LOADED,
            currentUser: data.user ?? null, // ✅ สำคัญ
            errorRegister: false,
          });

          return data; // ✅ เหมือน thunk
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Register failed";

          set({
            registerState: FAILED,
            backendRegisMessage: message,
            errorRegister: true,
          });

          throw err; // ✅ ให้ component handle ได้
        }
      },

      /* ===== LOGIN ===== */
      loginUser: async (credentials) => {
        try {
          set({
            loginState: LOADING,
            backendLoginMessage: null,
            errorLogin: false,
          });
          console.log(JSON.stringify(credentials));

          const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            credentials: "include",
          });

          if (!res.ok) {
            throw new Error("Server error, please try again");
          }

          const data = await res.json();

          if (!data.isSuccess) {
            throw new Error(data.message);
          }

          localStorage.setItem("token", data.token);

          set({
            loginState: LOADED,
            isAuthenticated: true,
            currentUser: data.user,
            errorLogin: false,
          });
        } catch (error) {
          set({
            loginState: FAILED,
            isAuthenticated: false,
            backendLoginMessage: error.message,
            errorLogin: true,
          });
        }
      },

      /* ===== CHECK AUTH ===== */
      checkAuth: async () => {
        set({ authLoading: true });

        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");

          const res = await fetch(`${API_URL}/checkAuth`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("unauthorized");

          const data = await res.json();

          set({
            authLoading: false,
            isAuthenticated: true,
            currentUser: data.user,
          });
        } catch {
          set({
            authLoading: false,
            isAuthenticated: false,
            currentUser: null,
          });
        }
      },

      /* ===== CHECK FIRST TIME ===== */
      checkFirstTime: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");

          const res = await fetch(`${API_URL}/checkFirstTime`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          if (!res.ok) throw new Error("server error");

          const data = await res.json();
          console.log("data", data);

          if (!data.isSuccess) throw new Error(data.message);

          set({
            isFirstTime: data.firstTime,
          });

          return data.firstTime; // 👈 เผื่อ component เอาไปใช้
        } catch (error) {
          console.error("checkFirstTime error:", error);
          set({
            isFirstTime: false,
          });
          return false;
        }
      },

      selectHero: async (heroId) => {
        try {
          set({ selectHeroState: LOADING });

          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");

          const res = await fetch(`${API_URL}/select-hero`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ heroId }),
          });

          if (!res.ok) throw new Error("server error");

          const data = await res.json();
          if (!data.isSuccess) throw new Error(data.message);

          // ⭐ update hero ใน store
          set((state) => ({
            selectHeroState: LOADED,
            currentUser: {
              ...state.currentUser,
              heroes: state.currentUser.heroes.map((h) => ({
                ...h,
                is_selected: h.hero_id === heroId,
              })),
            },
          }));

          return true;
        } catch (err) {
          console.error("selectHero error:", err);
          set({ selectHeroState: FAILED });
          return false;
        }
      },

      // buy
      buyHero: async (heroId) => {
        try {
          set({ buyHeroState: LOADING, buyHeroError: null });

          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");

          const res = await fetch(`${API_URL}/buy-hero`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify({ heroId }), // ✅ สำคัญ
          });

          const data = await res.json(); // ✅ fetch ต้อง parse เอง

          if (!res.ok || !data.isSuccess) {
            throw new Error(data.message || "buy hero failed");
          }

          const { hero, moneyLeft } = data;

          // ✅ update local state
          set((state) => ({
            currentUser: {
              ...state.currentUser,
              money: moneyLeft,
              heroes: [...(state.currentUser?.heroes || []), hero],
            },
            buyHeroState: LOADED,
          }));
        } catch (err) {
          console.error("buyHero error:", err);
          set({
            buyHeroState: FAILED,
            buyHeroError: err.message,
          });
        } finally {
          setTimeout(() => {
            set({ buyHeroState: INITIALIZED });
          }, 800);
        }
      },

      /* ===== CLEAR STATES (เหมือน reducers) ===== */
      logout: () => {
        localStorage.removeItem("token");
        set({
          isAuthenticated: false,
          currentUser: null,
        });
      },

      clearErrorRegisMessage: () => set({ backendRegisMessage: null }),

      clearErrorLoginMessage: () => set({ backendLoginMessage: null }),

      clearLoginState: () => set({ loginState: INITIALIZED }),

      clearRegisterState: () => set({ registerState: INITIALIZED }),

      // hero ที่กำลังใช้อยู่
      getSelectedHero: () => {
        const user = get().currentUser;
        return user?.heroes?.find((h) => h.is_selected === true) ?? null;
      },

      // เช็คว่าผู้เล่นมี hero นี้ไหม
      isHeroOwned: (heroId) => {
        const user = get().currentUser;
        return !!user?.heroes?.some((h) => h.hero_id === heroId);
      },

      // เช็คว่า hero นี้กำลังถูกเลือกอยู่ไหม
      isHeroSelected: (heroId) => {
        const user = get().currentUser;
        return !!user?.heroes?.some(
          (h) => h.hero_id === heroId && h.is_selected === true
        );
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
      }),
    }
  )
);
