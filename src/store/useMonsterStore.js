import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED ,API_URL} from "./const";


export const useMonsterStore = create((set) => ({
  monsters: [],
  unlockedMonsterIds: [], // เพิ่ม State เก็บ ID มอนสเตอร์ที่ปลดล็อคแล้ว
  loading: INITIALIZED,
  error: null,

  getMonsters: async () => {
    try {
      set({ loading: LOADING, error: null });

      const res = await fetch(`${API_URL}/monster`);
      if (!res.ok) throw new Error("Failed to fetch monsters");

      const data = await res.json();
      set({ monsters: data, loading: LOADED });
    } catch (err) {
      set({ loading: FAILED, error: err.message });
    }
  },
  fetchUnlockedMonsters: async (userStages) => {
    // ถ้ายังไม่มีข้อมูลด่านเลย ให้หยุดทำงาน
    if (!userStages || userStages.length === 0) {
      set({ unlockedMonsterIds: [] });
      return;
    }

    try {
      // ใช้ Set เพื่อไม่ให้เก็บ ID มอนสเตอร์ซ้ำกัน
      const unlockedIds = new Set();

      // ยิง API getStageById ของทุกด่านพร้อมกัน
      const fetchPromises = userStages.map(async (stage) => {
        try {
          const res = await fetch(`${API_URL}/getStageById/${stage.stage_id}`);
          if (!res.ok) return; // ถ้าดึงด่านไหนไม่ผ่าน ก็ข้ามไป
          const stageData = await res.json();

          // วนลูปเข้าไปดึง monster_id ใน events
          if (stageData.events && Array.isArray(stageData.events)) {
            stageData.events.forEach((event) => {
              if (event.monsters && Array.isArray(event.monsters)) {
                event.monsters.forEach((m) => {
                  unlockedIds.add(m.monster_id);
                });
              }
            });
          }
        } catch (e) {
          console.error(`Failed to fetch stage: ${stage.stage_id}`, e);
        }
      });

      // รอจนกว่าจะดึงข้อมูลครบทุกด่าน
      await Promise.all(fetchPromises);

      // แปลง Set กลับเป็น Array แล้วเก็บลง State
      set({ unlockedMonsterIds: Array.from(unlockedIds) });
    } catch (err) {
      console.error("Error in fetchUnlockedMonsters:", err);
    }
  },
  clearListMonster : ()=>{
    set({
      monsters:[],
      loading:INITIALIZED,
    })
  }
}));
