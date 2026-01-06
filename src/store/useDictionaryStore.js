import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED } from "./const";
const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

export const useDictionaryStore = create((set, get) => ({
  words: [],
  count: 0,
  hasNext: false,
  lastWord: null,
  loading: INITIALIZED,
  error: null,

  fetchDictionary: async (payload) => {
    try {
      set({ loading: LOADING, error: null });

      const res = await fetch(`${API_URL}/dict/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Fetch dictionary failed");

      const data = await res.json();

      set({
        count: data.count,
        hasNext: data.hasNext,
        lastWord: data.lastWord,
        words: payload.append ? [...get().words, ...data.data] : data.data,
        loading: LOADED,
      });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  clearDictionary: () => {
    set({
      words: [],
      count: 0,
      hasNext: false,
      lastWord: null,
    });
  },
}));
