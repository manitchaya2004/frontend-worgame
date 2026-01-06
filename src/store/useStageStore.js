import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED } from "./const";

const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

export const useStageStore = create((set) => ({
  stages: [],
  loading: INITIALIZED,
  error: null,

  getAllStage: async () => {
    try {
      set({ loading: LOADING, error: null });

      const res = await fetch(`${API_URL}/getAllStage`);
      if (!res.ok) throw new Error("Failed to fetch stages");

      const data = await res.json();
      set({ stages: data, loading: LOADED });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },
}));
