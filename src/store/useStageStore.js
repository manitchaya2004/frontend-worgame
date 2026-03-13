import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED ,API_URL} from "./const";


export const useStageStore = create((set) => ({
  stages: [],
  loading: INITIALIZED,
  error: null,

  getAllStage: async () => {
    try {
      set({ loading: LOADING, error: null });

      const res = await fetch(`/api/getAllStage`);
      if (!res.ok) throw new Error("Failed to fetch stages");

      const data = await res.json();
      console.log("Check Stage Data:", data); // ดูใน Console ว่า data เป็น Array หรือ Object

      // ถ้า data ที่มาเป็น Object { data: [...] } ให้ใช้ data.data
      const stageList = Array.isArray(data) ? data : data.data; 
      
      set({ stages: stageList || [], loading: LOADED });
    } catch (err) {
      console.error("Fetch Stage Error:", err);
      set({ loading: FAILED, error: err.message });
    }
  },
}));
