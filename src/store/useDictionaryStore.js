import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED } from "./const";
import { supabase } from "../service/supabaseClient";

export const useDictionaryStore = create((set, get) => ({
  words: [],
  wordsForMiniGame: [],
  count: 0,
  hasNext: false,
  loading: INITIALIZED,
  error: null,

  // ✅ 1. Fetch Dictionary แบบรองรับการค้นหาและแบ่งหน้า
  fetchDictionary: async (payload) => {
    try {
      set({ loading: LOADING, error: null });

      // แมปตัวแปรจาก payload เดิมให้ตรงกับพารามิเตอร์ของ RPC
      const { data, error } = await supabase.rpc("query_dict", {
        p_starts_with: payload.startsWith || null,
        p_contains: payload.contains || null,
        p_length: payload.length || 0,
        p_level: payload.level || null,
        p_limit: payload.limit || 50,
        p_last_word: payload.lastWord || null,
      });

      if (error) throw new Error(error.message);
      if (!data || !data.isSuccess) throw new Error("fetch dictionary failed");

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

  // ✅ 2. Dictionary สำหรับหน้า Mini Game
  // (โครงสร้างคล้ายกัน แต่แยกเก็บคนละก้อนเพื่อไม่ให้ UI หน้าหลักกระโดด)
  fetchMiniGameDictionary: async (payload) => {
    try {
      set({ loading: LOADING, error: null });

      // แมปตัวแปรจาก payload เดิมให้ตรงกับพารามิเตอร์ของ RPC
      const { data, error } = await supabase.rpc("query_dict", {
        p_starts_with: payload.startsWith || null,
        p_contains: payload.contains || null,
        p_length: payload.length || 0,
        p_level: payload.level || null,
        p_limit: payload.limit || 50,
        p_last_word: payload.lastWord || null,
      });

      if (error) throw new Error(error.message);
      if (!data || !data.isSuccess) throw new Error("fetch dictionary failed");

      set({
        count: data.count,
        hasNext: data.hasNext,
        lastWord: data.lastWord,
        wordsForMiniGame: payload.append ? [...get().wordsForMiniGame, ...data.data] : data.data,
        loading: LOADED,
      });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  clearDictionary: () => set({ words: [], count: 0, hasNext: false }),
  clearMiniGameDictionary: () =>
    set({ wordsForMiniGame: [], count: 0, hasNext: false }),
}));
