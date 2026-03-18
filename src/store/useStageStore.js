import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED } from "./const";
import { supabase } from "../service/supabaseClient";

export const useStageStore = create((set) => ({
  stages: [],
  loading: INITIALIZED,
  error: null,

  // ✅ ดึงข้อมูลด่านทั้งหมดจาก Supabase
  getAllStage: async () => {
    try {
      set({ loading: LOADING, error: null });

      // ดึงข้อมูลจากตาราง stage และเรียงลำดับตาม orderNo เพื่อให้ด่าน 1 มาก่อนด่าน 2
      const { data, error } = await supabase
        .from('stage')
        .select('*')
        .order('orderNo', { ascending: true });

      if (error) throw error;

      //console.log("✅ Supabase Stage Data:", data);

      set({ 
        stages: data || [], 
        loading: LOADED 
      });
    } catch (err) {
      console.error("❌ Fetch Stage Error:", err);
      set({ loading: FAILED, error: err.message });
    }
  },
}));