import { FIXED_Y } from "../../const/index";
import { StageProcessor, DeckManager } from "../../utils/gameSystem"; 
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
  
  // ✅ 1. เพิ่มตัวจับเวลาสำหรับอนิเมชั่น
  animTimer: 0, 

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

      // --- 2. ส่วน Process Data ---
      const waves = {}; 

      if (Array.isArray(stageRaw)) {
        stageRaw.forEach((data) => {
          const waveNo = Number(data.wave_no); 
          
          if (!waves[waveNo]) waves[waveNo] = [];

          const availablePatterns = data.pattern_list 
            ? [...new Set(data.pattern_list.map((p) => p.pattern_no))]
            : [1];
          const selectedPatternNo = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

          waves[waveNo].push({
            ...data, 
            id: data.event_id || Math.random(),
            hp: data.max_hp || 10,
            maxHp: data.max_hp || 10, 
            x: 0,
            currentStep: 1,
            selectedPattern: selectedPatternNo,
            atkFrame: 0,
            shoutText: "",
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
        stageData: waves, 
        loadingProgress: 100,
        gameState: "ADVANTURE" 
      });

    } catch (error) {
      console.error("Initialization Failed:", error);
    }
  },

  // แจ้งว่าอนิเมชั่นเสร็จสิ้น
  notifyAnimationComplete: () => {
    const resolver = get().animResolver;
    if (resolver) {
      resolver();
      set({ animResolver: null });
    }
  },

  // รออนิเมชั่น
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

  // ล้างค่าสถานะเกมทั้งหมด
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
      
      // ✅ รีเซ็ตค่าเกี่ยวกับ Animation
      playerVisual: "idle", 
      animFrame: 1,
      animTimer: 0,
      
      distance: 0,
      damagePopups: [],
      currentQuiz: null,
      quizResolver: null,
    }),

  // 🔄 MAIN UPDATE LOOP (ทำงานทุกเฟรม)
  update: (dt) =>
    set((state) => {
      // ใช้ตัวแปร updates เพื่อรวมค่าที่จะ set ทีเดียว
      let updates = {}; 

      // ------------------------------------------------------------------
      // ✅ 2. LOGIC ANIMATION LOOP (สับขา/หายใจ)
      // ------------------------------------------------------------------
      // ทำงานตลอดเวลาเพื่อให้ตัวละครขยับได้แม้จะยืนเฉยๆ
      let newTimer = (state.animTimer || 0) + dt;

      // ทุกๆ 0.5 วินาที ให้สลับเฟรม (1 <-> 2)
      if (newTimer >= 0.5) {
        newTimer = 0;
        updates.animFrame = state.animFrame === 1 ? 2 : 1; 
      }
      updates.animTimer = newTimer;
      // ------------------------------------------------------------------


      // 3. Logic การเดิน (เฉพาะตอน Adventure Mode)
      if (state.gameState === "ADVANTURE") {
        const speed = 0.001; // ความเร็วเดิน
        const newDist = state.distance + dt * speed;
        const targetDist = state.currentWave * 10; // ระยะทางเป้าหมาย

        if (newDist >= targetDist) {
          // ถึงเป้าหมาย
          const finalDist = targetDist;
          
          setTimeout(() => {
            const store = get();
            
            // เตรียมไอเทมเริ่มต้น (Loot)
            const activeSlots = store.playerData.unlockedSlots || 10;
            const initialLoot = DeckManager.generateList(activeSlots);
            
            // เรียกเกิดศัตรู
            if (store.spawnEnemies) {
              console.log("Triggering spawnEnemies for wave:", store.currentWave);
              store.spawnEnemies(initialLoot);
            } else {
              console.error("หาฟังก์ชัน spawnEnemies ไม่เจอใน Store!");
            }
          }, 500); 

          updates.distance = finalDist;
          updates.gameState = "PREPARING_COMBAT";
        } else {
          // ยังเดินไม่ถึง
          updates.distance = newDist;
        }
      }

      // ส่งค่าที่เปลี่ยนแปลงทั้งหมดกลับไป
      return updates;
    }),
});