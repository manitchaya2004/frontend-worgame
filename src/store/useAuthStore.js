import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOADED, LOADING, FAILED, INITIALIZED, API_URL } from "./const";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      previewData: null,

      /* ================= STATE (เหมือน Redux) ================= */
      registerState: INITIALIZED,
      loginState: INITIALIZED,
      selectHeroState: INITIALIZED,
      buyHeroState: INITIALIZED,
      resourceStatus: INITIALIZED,
      upgradeStatus: INITIALIZED,

      authLoading: true,
      isAuthenticated: false,
      isFirstTime: false,


      backendRegisMessage: null,
      backendLoginMessage: null,

      errorLogin: false,
      errorRegister: false,
      buyHeroError: null,
      /* ================= ACTIONS ================= */

      /* ===== REGISTER ===== */
      registerUser: async (userData) => {
        try {
          set({
            registerState: LOADING,
            backendRegisMessage: null,
            errorRegister: false,
          });

          const res = await fetch(`/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
            credentials: "include",
          });

          // Safety Check: ถ้าไม่ใช่ JSON หรือส่ง Error กลับมา
          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("Server error (Not JSON), please check your Backend URL");
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

          const res = await fetch(`/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            credentials: "include",
          });

          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("Login failed: Server returned non-JSON response");
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

          const res = await fetch(`/api/checkAuth`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("unauthorized");
          }

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

      /* ===== REFRESH USER DATA (แบบเงียบ ไม่หมุนติ้ว) ===== */
      refreshUser: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return; // ถ้าไม่มี token ก็ช่างมัน

          const res = await fetch(`/api/checkAuth`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          // แก้จุดนี้: ตรวจสอบก่อนว่าเป็น JSON หรือไม่ ก่อนจะสั่ง parse
          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            console.warn("Refresh failed: Server returned HTML or Error");
            return;
          }

          const data = await res.json();

          set({
            // อัปเดตแค่ข้อมูล User (เงิน, ด่านที่ผ่าน)
            currentUser: data.user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Failed to refresh user data", error);
        }
      },

      /* ===== CHECK FIRST TIME ===== */
      checkFirstTime: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");

          const res = await fetch(`/api/checkFirstTime`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("server error");
          }

          const data = await res.json();

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

          const res = await fetch(`/api/select-hero`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ heroId }),
          });

          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("server error");
          }

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

          const res = await fetch(`/api/buy-hero`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify({ heroId }), // ✅ สำคัญ
          });

          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
             throw new Error("Server returned non-JSON. Possible 404 or Crash.");
          }

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

      //update resource (item)
      updateResources: async (payload) => {
        set({ resourceStatus: LOADING });
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");
          const res = await fetch(`/api/update-resources`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("server error");
          }

          const data = await res.json();
          if (!data.isSuccess) throw new Error(data.message);

          if (data.isSuccess) {
            const { health, cure, reroll } = data.resources;

            // อัปเดต State currentUser ทันทีเพื่อให้ UI เปลี่ยน
            set((state) => ({
              resourceStatus: LOADED,
              currentUser: {
                ...state.currentUser,
                potion: {
                  ...state.currentUser.potion,
                  health: health,
                  cure: cure,
                  reroll: reroll,
                },
              },
            }));

            // Reset status กลับเป็น INIT หลังจากผ่านไป 1 วิ
            setTimeout(() => {
              set({ resourceStatus: INITIALIZED });
            }, 1000);
          } else {
            set({ resourceStatus: FAILED });
          }
        } catch (err) {
          console.error("updateResources error:", err);
          set({ resourceStatus: FAILED });
        }
      },

      // level up
      upgradeHero: async (heroId) => {
        set({ upgradeStatus: LOADING });
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");
          const res = await fetch(`/api/level-up`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ heroId }),
          });

          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned non-JSON");
          }

          const data = await res.json();
          if (!res.ok || !data.isSuccess) throw new Error(data.message);

          const { hero } = data; // ข้อมูล Hero ตัวใหม่ที่อัปเวลแล้ว

          // อัปเดต Hero ใน List ทันที
          set((state) => ({
            upgradeStatus: LOADED, // สำเร็จ
            currentUser: {
              ...state.currentUser,
              heroes: state.currentUser.heroes.map((h) =>
                h.hero_id === heroId ? { ...h, ...hero } : h
              ),
              money: data.moneyLeft ?? state.currentUser.money,
            },
          }));

          return true;
        } catch (err) {
          console.error("upgradeHero error:", err);
          set({ upgradeStatus: FAILED });
        }
      },

      //  preview data for level up
      fetchPreviewData: async (heroId) => {
        set({ previewData: null, upgradeStatus: LOADING });
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");
          const res = await fetch(`/api/preview-level-up`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ heroId }),
          });

          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
             throw new Error("Server error");
          }

          const data = await res.json();
          if (!res.ok || !data.isSuccess) throw new Error(data.message);

          set({ 
            previewData: data.data, // ข้อมูล comparison
            upgradeStatus: LOADED // โหลดเสร็จแล้ว โชว์ข้อมูลได้
          });
        } catch (err) {
          console.error("fetchPreviewData error:", err);
          set({ upgradeStatus: FAILED });
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

      clearUpgradeStatus: () => set({ upgradeStatus: INITIALIZED, previewData: null }),

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
          (h) => h.hero_id === heroId && h.is_selected === true,
        );
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
      }),
    },
  ),
);