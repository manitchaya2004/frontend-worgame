import { create } from "zustand";
import { API_URL, INITIALIZED, LOADING, LOADED, FAILED } from "./const";

export const useHeroStore = create((set) => ({
  heros: [],
  loading: INITIALIZED,
  error: null,

  upgradeLoading: INITIALIZED,
  upgradeError: null,

  buyHeroState: INITIALIZED,
  buyHeroError: null,

  getAllHeros: async () => {
    try {
      set({ loading: LOADING, error: null });

      const res = await fetch(`${API_URL}/hero`);
      if (!res.ok) throw new Error("Failed to fetch heros");

      const data = await res.json();
      set({ heros: data, loading: LOADED });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  // upgrade
  upradeStatHero: async (statData) => {
    try {
      set({ upgradeLoading: LOADING, upgradeError: null });

      const res = await fetch(`${API_URL}/upgrade-stat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ถ้าใช้ auth cookie
        body: JSON.stringify(statData),
      });

      const data = await res.json();

      if (!res.ok || !data.isSuccess) {
        throw new Error(data.message || "post stat failed");
      }

      set({ upgradeLoading: LOADED });

      return data.data; // 👈 ส่งผลลัพธ์กลับไปให้ component ใช้
    } catch (err) {
      set({
        upgradeLoading: FAILED,
        upgradeError: err.message,
      });
      throw err;
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
}));
