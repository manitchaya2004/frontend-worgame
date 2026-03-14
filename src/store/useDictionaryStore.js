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
  fetchDictionary: async ({ search = "", page = 0, limit = 20, append = false, level = "" }) => {
    try {
      set({ loading: LOADING, error: null });

      // คำนวณช่วงข้อมูล (Pagination)
      const from = page * limit;
      const to = from + limit - 1;

      // เริ่มสร้าง Query
      let query = supabase
        .from('dictionary')
        .select('*', { count: 'exact' }); // count: exact เพื่อเอาจำนวนทั้งหมดมาคำนวณ hasNext

      // 🔍 ถ้ามีการค้นหา
      if (search) {
        query = query.ilike('word', `%${search}%`);
      }

      // 🎯 ถ้ามีการกรองเลเวล
      if (level) {
        query = query.eq('level', level);
      }

      // 📦 กำหนดช่วงข้อมูลและเรียงลำดับ
      const { data, error, count } = await query
        .range(from, to)
        .order('word', { ascending: true });

      if (error) throw error;

      set({
        count: count || 0,
        hasNext: count > to + 1,
        words: append ? [...get().words, ...data] : data,
        loading: LOADED,
      });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  // ✅ 2. Dictionary สำหรับหน้า Mini Game
  // (โครงสร้างคล้ายกัน แต่แยกเก็บคนละก้อนเพื่อไม่ให้ UI หน้าหลักกระโดด)
  fetchMiniGameDictionary: async ({ search = "", page = 0, limit = 10, append = false, level = "" }) => {
    try {
      set({ loading: LOADING, error: null });

      const from = page * limit;
      const to = from + limit - 1;

      let query = supabase.from('dictionary').select('*', { count: 'exact' });

      if (search) query = query.ilike('word', `%${search}%`);
      if (level) query = query.eq('level', level);

      const { data, error, count } = await query
        .range(from, to)
        .order('word', { ascending: true });

      if (error) throw error;

      set({
        count: count || 0,
        hasNext: count > to + 1,
        wordsForMiniGame: append ? [...get().wordsForMiniGame, ...data] : data,
        loading: LOADED,
      });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  clearDictionary: () => set({ words: [], count: 0, hasNext: false }),
  clearMiniGameDictionary: () => set({ wordsForMiniGame: [], count: 0, hasNext: false }),
}));