import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED } from "./const";
const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

export const useMonsterStore = create((set) => ({
  monsters: [],
  loading: INITIALIZED,
  error: null,

  getMonsters: async () => {
    try {
      set({ loading: LOADING, error: null });

      const res = await fetch(`${API_URL}/monsters`);
      if (!res.ok) throw new Error("Failed to fetch monsters");

      const data = await res.json();
      set({ monsters: data, loading: LOADED });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },
}));
