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

  // 🌟 เพิ่ม State สำหรับ Top Words
  topWords: [],
  topWordsLoading: false,

  myWords: [],
  myDictMap: {},
  myWordsLoading: false,

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
        wordsForMiniGame: payload.append
          ? [...get().wordsForMiniGame, ...data.data]
          : data.data,
        loading: LOADED,
      });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },

  // 🌟 เพิ่มฟังก์ชันดึง Top Words
  fetchTopWords: async () => {
    set({ topWordsLoading: true });
    try {
      const { data, error } = await supabase
        .from("dictionary")
        .select("*")
        .gt("use_count", 0); // ดึงเฉพาะคำที่เคยใช้

      if (error) throw error;

      set({ topWords: data || [], topWordsLoading: false });
    } catch (error) {
      console.error("Error fetching dictionary top words:", error);
      set({ topWords: [], topWordsLoading: false });
    }
  },

  // 🌟 เพิ่มฟังก์ชันดึงคำศัพท์ส่วนตัว
  fetchMyWords: async (username) => {
    if (!username) return;
    
    set({ myWordsLoading: true });
    try {
      // 1. ดึง Log ของผู้เล่น
      const { data: logData, error: logError } = await supabase
        .from('player_word_log')
        .select('*')
        .eq('player_id', username)
        .order('update_at', { ascending: false });

      if (logError) throw logError;

      let dictMap = {};
      
      // 2. ดึงข้อมูลคำศัพท์จากตาราง dictionary ตามคำที่ผู้เล่นเคยพิมพ์
      if (logData && logData.length > 0) {
        const wordIds = logData.map((log) => log.word_id);
        
        const { data: dictData, error: dictError } = await supabase
          .from('dictionary')
          .select('*')
          .in('id', wordIds);

        if (dictError) {
          console.error('Error fetching dictionary for my words:', dictError);
        } else if (dictData) {
          dictData.forEach((item) => {
            dictMap[item.id] = item;
          });
        }
      }

      // บันทึกลง Store
      set({ 
        myWords: logData || [], 
        myDictMap: dictMap, 
        myWordsLoading: false 
      });

    } catch (error) {
      console.error('Error fetching my words:', error);
      set({ myWordsLoading: false });
    }
  },

  clearDictionary: () => set({ words: [], count: 0, hasNext: false }),
  clearMiniGameDictionary: () =>
    set({ wordsForMiniGame: [], count: 0, hasNext: false }),
}));
