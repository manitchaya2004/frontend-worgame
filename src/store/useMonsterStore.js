import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED } from "./const";
import { supabase } from "../service/supabaseClient";

export const useMonsterStore = create((set, get) => ({
  monsters: [],
  unlockedMonsterIds: [],
  loading: INITIALIZED,
  error: null,

  // ✅ 1. ดึงมอนสเตอร์ทั้งหมดจากตาราง monster
  getMonsters: async () => {
    try {
      set({ loading: LOADING, error: null });

      const { data, error } = await supabase
        .from('monster')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      set({ monsters: data, loading: LOADED });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  // ✅ 2. ดึง ID มอนสเตอร์ที่ปลดล็อคแล้ว (Logic ใหม่: ยิงทีเดียวจบ)
  fetchUnlockedMonsters: async (userStages) => {
    if (!userStages || userStages.length === 0) {
      set({ unlockedMonsterIds: [] });
      return;
    }

    try {
      // ดึง stage_id ทั้งหมดที่ user เคยเล่น
      const stageIds = userStages.map((s) => s.stage_id);

      // 💡 ใช้ Supabase Query: 
      // ดึงข้อมูลจากตาราง monster_spawn เฉพาะด่านที่อยู่ใน stageIds 
      // แล้วเอาแค่คอลัมน์ monster_id
      const { data, error } = await supabase
        .from('monster_spawn')
        .select('monster_id')
        .in('stage_id', stageIds);

      if (error) throw error;

      // ใช้ Set เพื่อกรอง ID ที่ซ้ำกัน (เช่น มอนสเตอร์ตัวเดียวกันเกิดหลายด่าน)
      const unlockedIds = [...new Set(data.map((item) => item.monster_id))];

      set({ unlockedMonsterIds: unlockedIds });
    } catch (err) {
      console.error("Error in fetchUnlockedMonsters:", err);
    }
  },

  clearListMonster: () => {
    set({
      monsters: [],
      unlockedMonsterIds: [],
      loading: INITIALIZED,
    });
  }
}));