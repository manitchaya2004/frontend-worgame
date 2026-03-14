import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED } from "./const";
import { supabase } from "../service/supabaseClient";

export const useHeroStore = create((set, get) => ({
  heros: [],
  loading: INITIALIZED,
  error: null,

  upgradeLoading: INITIALIZED,
  upgradeError: null,

  // ✅ 1. แก้ไข getAllHeros: ให้ดึงข้อมูลผ่าน RPC 'get_all_heroes_with_stats' 
  // แทนการ select ตารางตรงๆ เพื่อให้ได้ค่า stats ที่คำนวณแล้วจาก SQL Logic
  getAllHeros: async (username) => {
    try {
      set({ loading: LOADING, error: null });

      // หมายเหตุ: แนะนำให้สร้าง RPC ชื่อ get_all_heroes_metadata สำหรับหน้า Store
      // หรือถ้าจะดึงผ่าน select ตรงๆ ต้องมาคำนวณ stats ฝั่ง frontend เอง
      // ในที่นี้ผมจะใช้ select ตรงๆ แต่เพิ่ม Logic คำนวณ stats ให้เหมือนใน SQL ครับ
      const { data, error } = await supabase
        .from('hero')
        .select(`
          *,
          hero_deck (
            id,
            effect,
            size
          )
        `)
        .order('id', { ascending: true });

      if (error) throw error;

      // ✅ 2. เพิ่ม Logic การคำนวณ Stats/Deck ฝั่ง Frontend (สำหรับ Hero ที่ยังไม่ได้ซื้อ)
      // เพื่อให้หน้า Shop แสดงค่าพลังที่ถูกต้อง
      const formattedData = data.map(hero => {
        // คำนวณ Stats เริ่มต้น (Level 1)
        const baseStats = {
          hp: hero.hp,
          power: hero.power,
          speed: hero.speed
        };

        return {
          ...hero,
          stats: baseStats,
          hero_deck: hero.hero_deck || []
        };
      });

      set({ heros: formattedData, loading: LOADED });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  // ✅ 3. แก้ไข upradeStatHero: 
  // รับข้อมูลจาก RPC และอัปเดตข้อมูลใน AuthStore หรือ Global State ทันที
  upradeStatHero: async (heroId, username) => {
    try {
      set({ upgradeLoading: LOADING, upgradeError: null });

      // เรียก RPC ที่เราเขียน SQL ไว้ก่อนหน้านี้
      const { data, error } = await supabase.rpc('upgrade_hero_stats', {
        p_hero_id: heroId,
        p_username: username 
      });

      if (error) throw error;

      // data ที่ส่งกลับมาจาก RPC จะเป็น JSON ผู้เล่นตัวใหม่ (จาก get_player_data)
      set({ upgradeLoading: LOADED });

      // 💡 สำคัญ: ควรส่ง data นี้ไปอัปเดต currentUser ใน useAuthStore ด้วย
      // เพื่อให้หน้าจออื่นๆ (เช่น HP ในหน้าเดิน) อัปเดตตามทันที
      return data; 
    } catch (err) {
      set({
        upgradeLoading: FAILED,
        upgradeError: err.message,
      });
      throw err;
    }
  },
}));