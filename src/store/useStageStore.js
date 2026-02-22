import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED ,API_URL} from "./const";


export const useStageStore = create((set) => ({
  stages: [],
  loading: INITIALIZED,
  error: null,

  getAllStage: async () => {
    try {
      set({ loading: LOADING, error: null });

      const res = await fetch(`/api/getAllStage`);
      if (!res.ok) throw new Error("Failed to fetch stages");

      const data = await res.json();
      set({ stages: data, loading: LOADED });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },
}));
