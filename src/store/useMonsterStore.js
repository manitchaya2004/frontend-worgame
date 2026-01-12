import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED ,API_URL} from "./const";


export const useMonsterStore = create((set) => ({
  monsters: [],
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
  clearListMonster : ()=>{
    set({
      monsters:[],
      loading:INITIALIZED,
    })
  }
}));
