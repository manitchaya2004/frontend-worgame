import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED } from "./const";
import { supabase } from "../service/supabaseClient";

const SERVER_ID = "hell";

export const useServerStore = create((set, get) => ({
  isServerClose: false,
  isOffline: false,
  serverChecked: false,
  serverStatus: INITIALIZED,
  lastPathBeforeClose: null,

  // =========================
  // 🔴 เช็คสถานะเซิร์ฟเวอร์ (Supabase Version)
  // =========================
  checkServerInGame: async (currentPath) => {
    // เช็คเน็ตเบื้องต้น
    if (!navigator.onLine) {
      set({ isOffline: true, serverChecked: true });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('server_config')
        .select('is_close')
        .eq('id', SERVER_ID)
        .single();

      if (error) throw error;

      if (data.is_close) {
        set({
          isServerClose: true,
          lastPathBeforeClose: currentPath,
          serverChecked: true,
        });
      } else {
        set({ serverChecked: true, isServerClose: false, isOffline: false });
      }
    } catch (err) {
      // ถ้าติดต่อ Supabase ไม่ได้ หรือ Error ถือว่า Offline/Server ล่ม
      set({ isOffline: true, serverChecked: true });
    }
  },

  // =========================
  // 🔵 ใช้เฉพาะหน้า server-closed (Manual Refresh)
  // =========================
  refreshServer: async () => {
    set({ serverStatus: LOADING });
    const start = Date.now();

    try {
      const { data, error } = await supabase
        .from('server_config')
        .select('is_close')
        .eq('id', SERVER_ID)
        .single();

      if (error) throw error;

      // บังคับหน่วงเวลาให้ดูเหมือนมีการโหลดจริง (UX)
      const elapsed = Date.now() - start;
      if (elapsed < 600) await new Promise(r => setTimeout(r, 600 - elapsed));

      if (!data.is_close) {
        set({ serverStatus: LOADED, isServerClose: false, isOffline: false });
        return true;
      }

      set({ serverStatus: FAILED });
      return false;
    } catch {
      set({ serverStatus: FAILED });
      return false;
    }
  },

  // =========================
  // 🟢 ฟังก์ชันใหม่: ดักฟัง Realtime (Admin สั่งปิด/เปิด ปุ๊บ รู้ปั๊บ)
  // =========================
  subscribeServerStatus: () => {
    return supabase
      .channel('server_status_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'server_config', filter: `id=eq.${SERVER_ID}` },
        (payload) => {
          const { is_close } = payload.new;
          set({ isServerClose: is_close });
          if (is_close) {
            set({ lastPathBeforeClose: window.location.pathname });
          }
        }
      )
      .subscribe();
  },

  clearServerClose: () =>
    set({
      isServerClose: false,
      serverChecked: false,
      serverStatus: INITIALIZED,
      lastPathBeforeClose: null,
      isOffline: false,
    }),
}));