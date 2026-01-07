import { FIXED_Y } from "../../const/index";
import { StageProcessor, DeckManager } from "../../utils/gameSystem"; // แก้เป็น gameSystems ตามที่ตกลงกันไว้
import { ipAddress } from "../../const/index";
// ✅ ฟังก์ชันหน่วงเวลา
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const createGameSlice = (set, get) => ({
  gameState: "ADVANTURE",
  // projectiles: [],
  damagePopups: [],
  dictionary: [],
  distance: 0,
  loadingProgress: 0,
  animResolver: null,

  // --- ACTIONS ---

  // โหลดข้อมูลเริ่มต้น (Dictionary, Stage, Assets)
initializeGame: async () => {
    set({ loadingProgress: 0, gameState: "LOADING" });

    try {
      // --- 1. ส่วน Fetch ข้อมูล ---
      const dictRes = await fetch(`${ipAddress}/dict`);
      const dictData = await dictRes.json();
      
      const stageRes = await fetch(`${ipAddress}/getStageById/green-grass-1`);
      const stageRaw = await stageRes.json();

      // --- 2. ส่วน Process Data (ย้ายมาจาก StageProcessor) ---
      const waves = {}; // ตัวแปรสำหรับเก็บข้อมูลที่จัดรูปแบบแล้ว

      if (Array.isArray(stageRaw)) {
        stageRaw.forEach((data) => {
          // ✅ บังคับให้เป็น Number เพื่อป้องกันบั๊ก Type Mismatch
          const waveNo = Number(data.wave_no); 
          
          if (!waves[waveNo]) waves[waveNo] = [];

          // สุ่มเลือก Pattern เริ่มต้น
          const availablePatterns = data.pattern_list 
            ? [...new Set(data.pattern_list.map((p) => p.pattern_no))]
            : [1];
          const selectedPatternNo = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

          // Push ข้อมูลศัตรูที่ setup ค่าเริ่มต้นแล้วลงใน wave นั้นๆ
          waves[waveNo].push({
            ...data, // copy ข้อมูลดิบมาด้วย (เช่น name, monster_id, max_hp)
            id: data.event_id || Math.random(),
            hp: data.max_hp || 10,
            maxHp: data.max_hp || 10, // สำรองไว้เผื่อโค้ดเก่าใช้
            x: 0,
            currentStep: 1,
            selectedPattern: selectedPatternNo,
            atkFrame: 0,
            shoutText: "",
            // เช็คว่ามี pattern_list ไหม ถ้าไม่มีให้ใส่ Array ว่างป้องกันพัง
            patternList: data.pattern_list || [] 
          });
        });
      }

      console.log("Processed Stage Data inside init:", waves);

      // --- 3. ส่วนเตรียมระบบและเริ่มเกม ---
      DeckManager.init();

      console.log("Game Ready! Starting Adventure...");
      set({ 
        dictionary: dictData,
        stageData: waves, // ✅ ใช้ตัวแปร waves ที่ทำเสร็จตะกี้เลย
        loadingProgress: 100,
        gameState: "ADVANTURE" 
      });

    } catch (error) {
      console.error("Initialization Failed:", error);
      // ควรมีการจัดการ Error state ด้วยถ้าต้องการ
    }
  },
  
  // แจ้งว่าอนิเมชั่นเสร็จสิ้น (ใช้ร่วมกับ waitAnim)
  notifyAnimationComplete: () => {
    const resolver = get().animResolver;
    if (resolver) {
      resolver();
      set({ animResolver: null });
    }
  },

  // ฟังก์ชันรอให้อนิเมชั่นใน Component เล่นเสร็จก่อนทำ Logic ต่อไป
  waitAnim: async (timeoutMs = 1000) => {
    const safeTimeout = setTimeout(
      () => get().notifyAnimationComplete(),
      timeoutMs
    );
    await new Promise((resolve) => set({ animResolver: resolve }));
    clearTimeout(safeTimeout);
  },

  setDictionary: (data) => set({ dictionary: data }),
  
  addPopup: (p) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  
  removePopup: (id) => set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),

  // ล้างค่าสถานะเกมทั้งหมด (ใช้ตอนเริ่มเกมใหม่หรือ Game Over)
  reset: () =>
    set({
      gameState: "ADVANTURE",
      currentWave: 1, 
      playerData: {
          name: "chara",
          max_hp: 100, hp: 100, 
          max_rp: 3, rp: 3,
          max_mp: 25, mp: 0,
          max_ap: 3, ap: 3, 
          manaRegen: 5,
          shield: 0, 
          unlockedSlots: 10,
          inventory: [],
      },
      enemies: [],
      // projectiles: [],
      distance: 0,
      damagePopups: [],
      currentQuiz: null,
      quizResolver: null,
    }),

  // 🔄 MAIN UPDATE LOOP (ทำงานทุกเฟรม)
  update: (dt) =>
    set((state) => {
      // 1. Logic การเดิน (Adventure Mode)
    if (state.gameState === "ADVANTURE") {
      const speed = 0.001; // ความเร็วเดิน
      const newDist = state.distance + dt * speed;
      const targetDist = state.currentWave * 10; // ระยะทางเป้าหมาย

      if (newDist >= targetDist) {
        // --- 🚩 ส่วนที่ต้องแก้ไข/เพิ่มเข้าไป 🚩 ---
        
        // 1. ล็อคระยะทางให้หยุดตรงเป้าเป๊ะๆ
        const finalDist = targetDist;
        
        // 2. ใช้ setTimeout หน่วงเวลาเล็กน้อย (0.5 - 1 วิ) เพื่อให้ฟิลลิ่งกล้องหยุดนิ่งก่อนศัตรูโผล่
        setTimeout(() => {
          const store = get();
          
          // เตรียมไอเทมเริ่มต้น (Loot) ในกระเป๋า
          const activeSlots = store.playerData.unlockedSlots || 10;
          const initialLoot = DeckManager.generateList(activeSlots);
          
          // 🔥 เรียกฟังก์ชันเกิดศัตรู (ซึ่งอยู่ใน EnemySlice)
          // เนื่องจาก Zustand รวม Slices ให้แล้ว เราจึงเรียกผ่าน get() ได้เลย
          if (store.spawnEnemies) {
            console.log("Triggering spawnEnemies for wave:", store.currentWave);
            store.spawnEnemies(initialLoot);
          } else {
            console.error("หาฟังก์ชัน spawnEnemies ไม่เจอใน Store!");
          }
        }, 500); 

        return { 
          distance: finalDist, 
          gameState: "PREPARING_COMBAT" 
        };
        // --------------------------------------
      } else {
        return { distance: newDist };
      }
    }

      return {};
    }),
});