import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED } from "./const";
import { supabase } from "../service/supabaseClient";

export const useShopStore = create((set, get) => ({
  allItems: [], // เก็บข้อมูลต้นฉบับไว้ทำ Filter ในเครื่อง
  items: [],    // ข้อมูลที่แสดงผลปัจจุบัน
  loading: INITIALIZED,
  error: null,

  // ✅ 1. ดึงสินค้าทั้งหมดจาก Supabase
  getShop: async () => {
    try {
      set({ loading: LOADING, error: null });

      const { data, error } = await supabase
        .from('item') // หรือชื่อตารางสินค้าของคุณ เช่น 'shop_items'
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;

      set({ 
        allItems: data, 
        items: data, 
        loading: LOADED 
      });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  // ✅ 2. ค้นหาสินค้า (ยิง Query ไปที่ Database โดยตรง)
  searchShop: async (keyword) => {
    try {
      if (!keyword.trim()) {
        set({ items: get().allItems });
        return;
      }

      set({ loading: LOADING });

      // ค้นหาจากชื่อสินค้า (name) หรือคำอธิบาย (description)
      const { data, error } = await supabase
        .from('item')
        .select('*')
        .ilike('name', `%${keyword}%`) // ค้นหาแบบไม่สนตัวพิมพ์เล็ก-ใหญ่
        .order('price', { ascending: true });

      if (error) throw error;

      set({ items: data, loading: LOADED });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  // ✅ 3. เคลียร์การค้นหา (คืนค่าจาก Memory เพื่อความเร็ว)
  clearShop: () => {
    set({ items: get().allItems });
  },
}));