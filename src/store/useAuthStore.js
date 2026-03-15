import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOADED, LOADING, FAILED, INITIALIZED } from "./const";
import { getCalculatedStats } from "../utils/getCalculated";
import { supabase } from "../service/supabaseClient";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      previewData: null,

      /* ================= STATE ================= */
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
      buyHeroError: null,

      errorLogin: false,
      errorRegister: false,

      volume: 0.3,
      isMuted: false,
      sfxVolume: 0.5,
      isSfxMuted: false,

      /* ================= ACTIONS ================= */

      setVolume: (newVolume) => {
        set({ volume: newVolume });
        import("../utils/sfx").then((m) => m.bgm.updateLiveVolume());
      },
      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted }));
        import("../utils/sfx").then((m) => m.bgm.updateLiveVolume());
      },
      setSfxVolume: (newVolume) => set({ sfxVolume: newVolume }),
      toggleSfxMute: () => set((state) => ({ isSfxMuted: !state.isSfxMuted })),

      /* ===== REGISTER (คงความหมายเดิม: รับ username, email, password) ===== */
      registerUser: async (userData) => {
        const { username, email, password } = userData;

        try {
          set({
            registerState: LOADING,
            backendRegisMessage: null,
            errorRegister: false,
          });

          // 1️⃣ เช็ค username ก่อน
          const { data: usernameCheck } = await supabase
            .from("player")
            .select("username")
            .eq("username", username)
            .maybeSingle();

          if (usernameCheck) {
            throw new Error("username already exists");
          }

          // 2️⃣ สมัคร Supabase Auth
          const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: { username: username },
            },
          });

          if (error) {
            throw new Error("email already registered");
          }

          set({
            registerState: LOADED,
            errorRegister: false,
          });

          return { isSuccess: true };
        } catch (err) {
          set({
            registerState: FAILED,
            backendRegisMessage: err.message,
            errorRegister: true,
          });

          throw err;
        }
      },

      /* ===== LOGIN (ใช้ Username ค้นหา Email เพื่อ Auth กับ Supabase) ===== */
      loginUser: async (credentials) => {
        const { username, password } = credentials;
        try {
          set({
            loginState: LOADING,
            backendLoginMessage: null,
            errorLogin: false,
          });

          // 1. 🔍 ไปค้นหา Email จริงๆ ของ Username นี้จากตาราง player ก่อน
          const { data: userData, error: userError } = await supabase
            .from("player")
            .select("email")
            .eq("username", username)
            .maybeSingle();

          if (userError || !userData) {
            throw new Error("Invaild username. Please try again");
          }

          // 2. 🔑 เอา Email ที่หาเจอไป Login กับ Supabase Auth
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email: userData.email,
              password: password,
            });

          if (authError) {
            throw new Error("Invaild password. Please try again");
          }

          // 3. 🎮 ดึงข้อมูลเกม (Money, Stamina, Heroes) ผ่าน RPC get_player_data
          const { data: gameData, error: rpcError } = await supabase.rpc(
            "get_player_data",
            {
              p_username: username,
            },
          );

          if (rpcError) throw rpcError;

          // เซ็ตสถานะสำเร็จ
          set({
            loginState: LOADED,
            isAuthenticated: true,
            currentUser: gameData,
            errorLogin: false,
          });

          return gameData; // คืนค่ากลับเพื่อให้หน้า UI เปลี่ยนหน้าได้
        } catch (error) {
          console.error("Login Error:", error);
          set({
            loginState: FAILED,
            isAuthenticated: false,
            backendLoginMessage: error.message,
            errorLogin: true,
          });
          return null;
        }
      },

      /* ===== CHECK AUTH (ตรวจสอบ Session เมื่อ Refresh หน้าจอ) ===== */
      checkAuth: async () => {
        set({ authLoading: true });
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) throw new Error("no token");

          // ดึง username จาก metadata ที่เราเก็บไว้ตอนสมัคร
          const username = session.user.user_metadata.username;

          const { data: userData, error } = await supabase.rpc(
            "get_player_data",
            {
              p_username: username,
            },
          );

          if (error) throw error;

          set({
            authLoading: false,
            isAuthenticated: true,
            currentUser: userData,
          });
        } catch (err) {
          set({
            authLoading: false,
            isAuthenticated: false,
            currentUser: null,
          });
        }
      },

      refreshUser: async () => {
        const user = get().currentUser;
        if (!user) return;
        try {
          const { data: userData, error } = await supabase.rpc(
            "get_player_data",
            {
              p_username: user.username,
            },
          );
          if (!error) set({ currentUser: userData });
        } catch (error) {
          console.error("Failed to refresh user data", error);
        }
      },

      /* ===== 4. HERO ACTIONS (ใช้ Username อ้างอิง) ===== */
      selectHero: async (heroId) => {
        try {
          set({ selectHeroState: LOADING });

          const username = get().currentUser.username;

          // reset hero
          const { error: resetError } = await supabase
            .from("player_hero")
            .update({ is_selected: false })
            .eq("player_id", username);

          if (resetError) throw resetError;

          // select hero
          const { error: selectError } = await supabase
            .from("player_hero")
            .update({ is_selected: true })
            .match({
              player_id: username,
              hero_id: heroId,
            });

          if (selectError) throw selectError;

          await get().refreshUser();

          set({ selectHeroState: LOADED });
          return true;
        } catch (err) {
          console.error(err);
          set({ selectHeroState: FAILED });
          return false;
        }
      },

      buyHero: async (heroId) => {
        try {
          set({ buyHeroState: "LOADING", buyHeroError: null });

          // 1. ดึง username จาก state ปัจจุบันด้วย get()
          const state = get();
          const currentUsername = state.currentUser?.username;

          if (!currentUsername) {
            throw new Error("no user found in state");
          }

          // 2. เรียกใช้ RPC ที่เราสร้างไว้ใน Supabase
          const { data, error } = await supabase.rpc("buy_hero", {
            p_hero_id: heroId,
            p_username: currentUsername,
          });

          if (error) {
            throw new Error(error.message || "Supabase RPC error");
          }

          // 3. เช็คกรณีเงินไม่พอ หรือซื้อไม่สำเร็จตามโครงสร้าง JSON ที่ Return กลับมา
          if (!data || !data.isSuccess) {
            throw new Error(data?.message || "buy hero failed");
          }

          const { hero, moneyLeft } = data;

          // 4. อัปเดต State กลับเข้าไป
          set((state) => ({
            currentUser: {
              ...state.currentUser,
              money: moneyLeft,
              heroes: [...(state.currentUser?.heroes || []), hero],
            },
            buyHeroState: "LOADED",
          }));
        } catch (err) {
          console.error("buyHero error:", err);
          set({
            buyHeroState: "FAILED",
            buyHeroError: err.message,
          });
        } finally {
          setTimeout(() => {
            set({ buyHeroState: "INITIALIZED" });
          }, 800);
        }
      },

      upgradeHero: async (heroId) => {
        set({ upgradeStatus: LOADING });
        try {
          const user = get().currentUser;
          const { data: updatedUser, error } = await supabase.rpc(
            "upgrade_hero_stats",
            {
              p_hero_id: heroId,
              p_username: user.username,
            },
          );

          if (error) throw error;

          set({ upgradeStatus: LOADED, currentUser: updatedUser });
          return true;
        } catch (err) {
          console.error("upgradeHero error:", err);
          set({ upgradeStatus: FAILED });
        }
      },

      fetchPreviewData: async (heroId) => {
        set({ previewData: null, upgradeStatus: LOADING });

        try {
          const username = useAuthStore.getState().currentUser.username;

          const { data, error } = await supabase
            .from("player_hero")
            .select(
              `
        level,
        hero:hero_id (
          hp,
          power,
          speed
        )
      `,
            )
            .eq("player_id", username)
            .eq("hero_id", heroId)
            .single();

          if (error) throw error;

          const row = data;

          // ใช้ฟังก์ชันเดิมของพั้น
          const curStats = getCalculatedStats(
            row.hero.hp,
            row.hero.power,
            row.hero.speed,
            row.level,
          );

          const nxtStats = getCalculatedStats(
            row.hero.hp,
            row.hero.power,
            row.hero.speed,
            row.level + 1,
          );

          set({
            previewData: {
              level: { current: row.level, next: row.level + 1 },
              hp: { current: curStats.hp, next: nxtStats.hp },
              power: { current: curStats.power, next: nxtStats.power },
              speed: { current: curStats.speed, next: nxtStats.speed },
            },
            upgradeStatus: LOADED,
          });
        } catch (err) {
          console.error("fetchPreviewData error:", err);
          set({ upgradeStatus: FAILED });
        }
      },

      /* ===== 5. RESOURCES & STAMINA (ใช้ Username อ้างอิง) ===== */
      updateResources: async (payload) => {
        set({ resourceStatus: LOADING });
        try {
          const currentUsername = get().currentUser?.username;
          if (!currentUsername) throw new Error("no user found");

          const { data, error } = await supabase.rpc("update_resources", {
            p_username: currentUsername,
            p_heal: payload.heal,
            p_cure: payload.cure,
            p_reroll: payload.reroll,
            p_stamina: payload.stamina,
          });

          if (error) throw new Error(error.message);
          if (!data || !data.isSuccess) throw new Error(data?.message || "update failed");

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
          
        } catch (err) {
          console.error("updateResources error:", err);
          set({ resourceStatus: FAILED });
        }
      },

      updateStamina: async (amount) => {
        try {
          const user = get().currentUser;
          const { data, error } = await supabase.rpc(
            "update_stamina",
            {
              p_username: user.username,
              p_amount: amount,
            },
          );

          if (error) throw error;
          if (!data || !data.isSuccess) throw new Error(data?.message || "update failed");

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
          return { success: false, error: err.message };
        }
      },

      reduceStaminaTimer: async (minutes) => {
        try {
          const user = get().currentUser;
          const { data, error } = await supabase.rpc(
            "reduce_stamina_timer",
            {
              p_username: user.username,
              p_minutes: minutes,
            },
          );

          if (error) throw error;
          if (!data || !data.isSuccess) throw new Error(data?.message || "reduce timer failed");

          const previousStamina = get().currentUser?.stamina?.current || 0;
          const earnedStamina = data.stamina.current > previousStamina;

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

          return {
            success: true,
            currentStamina: data.stamina.current,
            earnedStamina,
          };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          isAuthenticated: false,
          currentUser: null,
          loginState: INITIALIZED,
          registerState: INITIALIZED,
        });
      },

      /* ===== CLEAR MESSAGES & STATES ===== */
      clearBackendMessage: () =>
        set({
          backendLoginMessage: null,
          backendRegisMessage: null,
          buyHeroError: null,
          errorLogin: false,
          errorRegister: false,
        }),

      clearErrorRegisMessage: () =>
        set({
          backendRegisMessage: null,
          errorRegister: false,
        }),

      clearErrorLoginMessage: () =>
        set({
          backendLoginMessage: null,
          errorLogin: false,
        }),

      clearLoginState: () => set({ loginState: INITIALIZED }),
      clearRegisterState: () => set({ registerState: INITIALIZED }),
      clearUpgradeStatus: () =>
        set({ upgradeStatus: INITIALIZED, previewData: null }),

      /* ===== HELPERS ===== */
      getSelectedHero: () =>
        get().currentUser?.heroes?.find((h) => h.is_selected) ?? null,
      isHeroOwned: (heroId) =>
        !!get().currentUser?.heroes?.some((h) => h.hero_id === heroId),
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