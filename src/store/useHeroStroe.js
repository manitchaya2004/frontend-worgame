import { create } from "zustand";
import { API_URL, INITIALIZED, LOADING, LOADED, FAILED } from "./const";

export const useHeroStore = create((set) => ({
  heros: [],
  loading: INITIALIZED,
  error: null,

  upgradeLoading: INITIALIZED,
  upgradeError: null,

  getAllHeros: async () => {
    try {
      set({ loading: LOADING, error: null });

      // แก้ไข: เพิ่ม Header เพื่อข้ามหน้าแจ้งเตือนของ ngrok สำหรับ GET request
      const res = await fetch(`/api/hero`, {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      });
      
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

      const res = await fetch(`/api/upgrade-stat`, {
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
}));