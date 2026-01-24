import { create } from "zustand";
import { INITIALIZED, LOADING, LOADED, FAILED, API_URL } from "./const";

const SERVER_ID = "hell"; // หรือ id จริง

export const useServerStore = create((set) => ({
  // ===== state หลัก =====
  isServerClose: false,
  lastPathBeforeClose: null,

  // กันกระพริบ
  serverChecked: false,

  // ใช้เฉพาะหน้า server-closed
  serverStatus: INITIALIZED,
  // INITIALIZED | LOADING | LOADED | FAILED

  // =========================
  // 🔴 ใช้หลัง login / ระหว่างเล่นเกม
  // =========================
  checkServerInGame: async (currentPath) => {
    if (!navigator.onLine) {
      set({
        isOffline: true,
        serverChecked: true,
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/server/${SERVER_ID}`);
      if (!res.ok) throw new Error();

      const data = await res.json();

      if (data.is_close) {
        set({
          isServerClose: true,
          lastPathBeforeClose: currentPath,
          serverChecked: true,
        });
        return;
      }

      // server เปิด
      set({ serverChecked: true, isServerClose: false, isOffline: false });
    } catch {
      // backend ล่ม = ถือว่า server ใช้ไม่ได้
      set({
        isOffline: true,
        serverChecked: true,
      });
    }
  },

  // =========================
  // 🔵 ใช้เฉพาะหน้า server-closed
  // =========================
  refreshServer: async () => {
    set({ serverStatus: LOADING });

    const start = Date.now();

    try {
      const res = await fetch(`${API_URL}/server/${SERVER_ID}`);
      if (!res.ok) throw new Error();

      const data = await res.json();

      // ⭐ บังคับให้ loading อย่างน้อย 600ms
      const elapsed = Date.now() - start;
      if (elapsed < 600) {
        await new Promise((r) => setTimeout(r, 600 - elapsed));
      }

      if (!data.is_close) {
        set({
          serverStatus: LOADED,
          isServerClose: false,
           isOffline: false,
        });
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
  // 🟢 clear หลัง server เปิด
  // =========================
  clearServerClose: () =>
    set({
      isServerClose: false,
      serverChecked: false,
      serverStatus: INITIALIZED,
      lastPathBeforeClose: null,
       isOffline: false,
    }),
}));

// import { create } from "zustand";
// import {
//   INITIALIZED,
//   LOADING,
//   LOADED,
//   FAILED,
//   API_URL,
// } from "./const";

// export const useServerStore = create((set, get) => ({
//   serverId: "hell",

//   serverStatus: INITIALIZED,   // status การโหลด server
//   isServerClose: false,        // ปิดจริงไหม (จาก backend)
//   showCloseModal: false,

//   /* ===============================
//      ใช้ตอน BEFORE LOGIN
//      =============================== */
//   checkServerBeforeLogin: async () => {
//     const { serverId } = get();

//     set({ serverStatus: LOADING });

//     try {
//       const res = await fetch(`${API_URL}/server/${serverId}`);

//       if (!res.ok) throw new Error("Server error");

//       const data = await res.json();

//       set({
//         serverStatus: LOADED,
//         isServerClose: data.is_close,
//       });

//       // ❌ ถ้า server ปิด ไม่ให้ login
//       return !data.is_close;
//     } catch (error) {
//       set({
//         serverStatus: FAILED,
//         isServerClose: true,
//       });

//       return false;
//     }
//   },

//   /* ===============================
//      ใช้ตอน IN GAME (polling)
//      =============================== */
//   checkServerInGame: async () => {
//     const { serverId, isServerClose } = get();

//     try {
//       const res = await fetch(`${API_URL}/server/${serverId}`);

//       if (!res.ok) throw new Error("Server error");

//       const data = await res.json();

//       // ปิดตอนเล่นอยู่ → เด้ง modal
//       if (data.is_close && !isServerClose) {
//         set({
//           isServerClose: true,
//           showCloseModal: true,
//         });
//       }
//     } catch (error) {
//       set({
//         isServerClose: true,
//         showCloseModal: true,
//       });
//     }
//   },

//   /* ===============================
//      ออกจากเกม
//      =============================== */
//   closeModalAndExit: () => {
//     set({
//       showCloseModal: false,
//     });
//   },
// }));
