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

      // volumn
      volume: 0.3,
      isMuted: false,

      // 💥 SFX Settings
      sfxVolume: 0.5,
      isSfxMuted: false,

      /* ================= ACTIONS ================= */

      setVolume: (newVolume) => {
        set({ volume: newVolume });
        import("../utils/sfx").then((m) => m.bgm.updateLiveVolume());
      },
      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted }));
        import("../utils/sfx").then(m => m.bgm.updateLiveVolume());
      },
      setSfxVolume: (newVolume) => set({ sfxVolume: newVolume }),
      toggleSfxMute: () => set((state) => ({ isSfxMuted: !state.isSfxMuted })),

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

          const contentType = res.headers.get("content-type");
          if (
            !res.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
            throw new Error(
              "Server error (Not JSON), please check your Backend URL",
            );
          }

          const data = await res.json();

          if (!data.isSuccess) {
            throw new Error(data.message);
          }

          set({
            registerState: LOADED,
            currentUser: data.user ?? null,
            errorRegister: false,
          });

          return data;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Register failed";

          set({
            registerState: FAILED,
            backendRegisMessage: message,
            errorRegister: true,
          });

          throw err;
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
          if (
            !res.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
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
          if (
            !res.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
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

      /* ===== REFRESH USER DATA ===== */
      refreshUser: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          const res = await fetch(`/api/checkAuth`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          const contentType = res.headers.get("content-type");
          if (
            !res.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
            console.warn("Refresh failed: Server returned HTML or Error");
            return;
          }

          const data = await res.json();

          set({
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
          if (
            !res.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
            throw new Error("server error");
          }

          const data = await res.json();

          if (!data.isSuccess) throw new Error(data.message);

          set({
            isFirstTime: data.firstTime,
          });

          return data.firstTime;
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
          if (
            !res.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
            throw new Error("server error");
          }

          const data = await res.json();
          if (!data.isSuccess) throw new Error(data.message);

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
            body: JSON.stringify({ heroId }),
          });

          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned non-JSON. Possible 404 or Crash.");
          }

          const data = await res.json();

          if (!res.ok || !data.isSuccess) {
            throw new Error(data.message || "buy hero failed");
          }

          const { hero, moneyLeft } = data;

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
          if (
            !res.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
            throw new Error("server error");
          }

          const data = await res.json();
          if (!data.isSuccess) throw new Error(data.message);

          if (data.isSuccess) {
            const { health, cure, reroll } = data.resources;

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
          if (
            !res.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
            throw new Error("Server returned non-JSON");
          }

          const data = await res.json();
          if (!res.ok || !data.isSuccess) throw new Error(data.message);

          const { hero } = data;

          set((state) => ({
            upgradeStatus: LOADED,
            currentUser: {
              ...state.currentUser,
              heroes: state.currentUser.heroes.map((h) =>
                h.hero_id === heroId ? { ...h, ...hero } : h,
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
          if (
            !res.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
            throw new Error("Server error");
          }

          const data = await res.json();
          if (!res.ok || !data.isSuccess) throw new Error(data.message);

          set({
            previewData: data.data,
            upgradeStatus: LOADED,
          });
        } catch (err) {
          console.error("fetchPreviewData error:", err);
          set({ upgradeStatus: FAILED });
        }
      },

      // =========================================
      // ⚡ UPDATE STAMINA
      // =========================================
      updateStamina: async (amount) => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");

          const res = await fetch(`/api/update-stamina`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount }),
          });

          const contentType = res.headers.get("content-type");
          if (
            !res.ok ||
            !contentType ||
            !contentType.includes("application/json")
          ) {
            throw new Error("server error");
          }

          const data = await res.json();
          if (!data.isSuccess) throw new Error(data.message);

          set((state) => ({
            currentUser: {
              ...state.currentUser,
              stamina: {
                ...state.currentUser.stamina,
                current: data.stamina.current,
                max: data.stamina.max,
                timeToNext: data.stamina.timeToNext,
              },
            },
          }));

          return { success: true, currentStamina: data.stamina.current };
        } catch (err) {
          console.error("updateStamina error:", err);
          return { success: false, error: err.message };
        }
      },

      // =========================================
      // ⏳ REDUCE STAMINA TIMER (มินิเกมตอบถูก)
      // =========================================
      reduceStaminaTimer: async (minutes) => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");

          const res = await fetch(`/api/reduce-stamina-timer`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ minutes }),
          });

          // ... (ส่วนตรวจเช็ค error เหมือนเดิม) ...

          const data = await res.json();
          if (!data.isSuccess) throw new Error(data.message);

          // 💡 ตรวจสอบว่าสายฟ้าปัจจุบัน เพิ่มขึ้นจากของเดิมใน Store หรือไม่
          const previousStamina = get().currentUser?.stamina?.current || 0;
          const currentStamina = data.stamina.current;
          const earnedStamina = currentStamina > previousStamina; // ถ้าได้เพิ่ม ถือว่าตีบวกสำเร็จ!

          set((state) => ({
            currentUser: {
              ...state.currentUser,
              stamina: {
                ...state.currentUser.stamina,
                current: currentStamina,
                max: data.stamina.max,
                timeToNext: data.stamina.timeToNext,
              },
            },
          }));

          return {
            success: true,
            currentStamina: currentStamina,
            earnedStamina: earnedStamina, // 💡 ส่งค่านี้กลับไปให้ MiniGame.jsx รู้
          };
        } catch (err) {
          console.error("reduceStaminaTimer error:", err);
          return { success: false, error: err.message };
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

      clearUpgradeStatus: () =>
        set({ upgradeStatus: INITIALIZED, previewData: null }),

      getSelectedHero: () => {
        const user = get().currentUser;
        return user?.heroes?.find((h) => h.is_selected === true) ?? null;
      },

      isHeroOwned: (heroId) => {
        const user = get().currentUser;
        return !!user?.heroes?.some((h) => h.hero_id === heroId);
      },

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

        volume: state.volume,
        isMuted: state.isMuted,

        sfxVolume: state.sfxVolume,
        isSfxMuted: state.isSfxMuted,
      }),
    },
  ),
);
