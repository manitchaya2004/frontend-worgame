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

      /* ===== PLAY AS GUEST (เล่นแบบไม่ Login) ===== */
      loginAsGuest: async () => {
        set({ loginState: LOADING });
        try {
          const { data: firstHero } = await supabase
            .from("hero")
            .select(`
              *,
              hero_deck (
                id,
                effect,
                size
              )
            `)
            .order("id", { ascending: true })
            .limit(1)
            .maybeSingle();

          const defaultHero = firstHero ? {
            hero_id: firstHero.id,
            name: firstHero.name,
            price: firstHero.price,
            level: 1,
            is_selected: true,
            ability_cost: firstHero.ability_cost || 10,
            ability_description: firstHero.ability_description || "",
            stats: {
              hp: firstHero.hp,
              power: firstHero.power,
              speed: firstHero.speed,
            },
            hero_deck: firstHero.hero_deck || [],
          } : {
            hero_id: "h001",
            name: "Aria",
            price: 0,
            level: 1,
            is_selected: true,
            ability_cost: 10,
            ability_description: "Double your next Strike letter's power.",
            stats: {
              hp: 20,
              power: 3,
              speed: 3
            },
            hero_deck: [
              { id: "d1", effect: "strike", size: 1 },
              { id: "d2", effect: "guard", size: 1 }
            ]
          };

          const guestUser = {
            username: "GuestPlayer",
            money: 500,
            role: "player",
            potion: { health: 3, cure: 3, reroll: 3, max_slot: 3 },
            stamina: { current: 5, max: 5, timeToNext: 0 },
            stages: [],
            heroes: [defaultHero]
          };

          set({
            isAuthenticated: true,
            currentUser: guestUser,
            isFirstTime: false,
            loginState: LOADED
          });
        } catch (err) {
          console.error("Guest login failed:", err);
          set({ loginState: FAILED });
        }
      },

      /* ===== CHECK AUTH (ตรวจสอบ Session เมื่อ Refresh หน้าจอ) ===== */
      checkAuth: async () => {
        set({ authLoading: true });
        try {
          const user = get().currentUser;
          if (user && user.username === "GuestPlayer") {
            set({ authLoading: false, isAuthenticated: true });
            return;
          }
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
        const user = get().currentUser;
        if (user && user.username === "GuestPlayer") {
          set({ selectHeroState: LOADING });
          const updatedHeroes = user.heroes.map((h) => ({
            ...h,
            is_selected: h.hero_id === heroId || h.id === heroId,
          }));
          set((state) => ({
            selectHeroState: LOADED,
            currentUser: {
              ...state.currentUser,
              heroes: updatedHeroes,
            },
          }));
          return true;
        }
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
        const user = get().currentUser;
        if (user && user.username === "GuestPlayer") {
          try {
            set({ buyHeroState: "LOADING", buyHeroError: null });
            await new Promise((resolve) => setTimeout(resolve, 500));

            const { data: heroData } = await supabase
              .from("hero")
              .select(`
                *,
                hero_deck (
                  id,
                  effect,
                  size
                )
              `)
              .eq("id", heroId)
              .single();

            if (heroData) {
              if (user.money < heroData.price) {
                throw new Error("Not enough money!");
              }

              const newHero = {
                hero_id: heroData.id,
                name: heroData.name,
                price: heroData.price,
                level: 1,
                is_selected: false,
                ability_cost: heroData.ability_cost || 10,
                ability_description: heroData.ability_description || "",
                stats: {
                  hp: heroData.hp,
                  power: heroData.power,
                  speed: heroData.speed,
                },
                hero_deck: heroData.hero_deck || [],
              };

              set((state) => ({
                currentUser: {
                  ...state.currentUser,
                  money: state.currentUser.money - heroData.price,
                  heroes: [...(state.currentUser?.heroes || []), newHero],
                },
                buyHeroState: "LOADED",
              }));
            }
          } catch (err) {
            set({ buyHeroState: "FAILED", buyHeroError: err.message });
          } finally {
            setTimeout(() => {
              set({ buyHeroState: "INITIALIZED" });
            }, 800);
          }
          return;
        }
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
        const user = get().currentUser;
        if (user && user.username === "GuestPlayer") {
          try {
            set({ upgradeStatus: LOADING });
            await new Promise((resolve) => setTimeout(resolve, 500));

            const hero = user.heroes.find((h) => h.hero_id === heroId || h.id === heroId);
            if (!hero) throw new Error("Hero not found");

            const nextLvl = hero.level + 1;
            const upgradeCost = nextLvl * 100;

            if (user.money < upgradeCost) throw new Error("Not enough money");

            const updatedHeroes = user.heroes.map((h) => {
              if (h.hero_id === heroId || h.id === heroId) {
                return {
                  ...h,
                  level: nextLvl,
                  next_upgrade: (nextLvl + 1) * 100,
                  stats: {
                    hp: h.stats.hp + 2,
                    power: h.stats.power + (nextLvl % 3 === 0 ? 1 : 0),
                    speed: h.stats.speed + (nextLvl % 4 === 0 ? 1 : 0),
                  }
                };
              }
              return h;
            });

            const updatedUser = {
              ...user,
              money: user.money - upgradeCost,
              heroes: updatedHeroes
            };

            set({ upgradeStatus: LOADED, currentUser: updatedUser });
            return true;
          } catch (err) {
            console.error("upgradeHero error:", err);
            set({ upgradeStatus: FAILED });
            return false;
          }
        }
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
        const user = get().currentUser;
        if (user && user.username === "GuestPlayer") {
          try {
            set({ previewData: null, upgradeStatus: LOADING });
            const hero = user.heroes.find((h) => h.hero_id === heroId || h.id === heroId);
            if (!hero) throw new Error("Hero not found");

            const nextLvl = hero.level + 1;
            const curStats = hero.stats;
            const nxtStats = {
              hp: curStats.hp + 2,
              power: curStats.power + (nextLvl % 3 === 0 ? 1 : 0),
              speed: curStats.speed + (nextLvl % 4 === 0 ? 1 : 0),
            };

            set({
              previewData: {
                level: { current: hero.level, next: nextLvl },
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
          return;
        }
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
        const user = get().currentUser;
        if (user && user.username === "GuestPlayer") {
          set({ resourceStatus: LOADING });
          await new Promise((resolve) => setTimeout(resolve, 500));

          set((state) => ({
            resourceStatus: LOADED,
            currentUser: {
              ...state.currentUser,
              potion: {
                ...state.currentUser.potion,
                health: state.currentUser.potion.health + (payload.heal || 0),
                cure: state.currentUser.potion.cure + (payload.cure || 0),
                reroll: state.currentUser.potion.reroll + (payload.reroll || 0),
              },
            },
          }));

          setTimeout(() => {
            set({ resourceStatus: INITIALIZED });
          }, 1000);
          return;
        }
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
        const user = get().currentUser;
        if (user && user.username === "GuestPlayer") {
          const nextStamina = Math.max(0, Math.min(5, user.stamina.current + amount));
          set((state) => ({
            currentUser: {
              ...state.currentUser,
              stamina: {
                ...state.currentUser.stamina,
                current: nextStamina,
              },
            },
          }));
          return { success: true, currentStamina: nextStamina };
        }
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
        const user = get().currentUser;
        if (user && user.username === "GuestPlayer") {
          return { success: true, currentStamina: user.stamina.current, earnedStamina: false };
        }
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