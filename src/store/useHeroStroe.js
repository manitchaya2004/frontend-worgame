import { create } from "zustand";
import { API_URL, INITIALIZED, LOADING, LOADED, FAILED } from "./const";

export const useHeroStore = create((set) => ({
  heros: [],
  loading: INITIALIZED,
  error: null,

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
}));
