import { create } from "zustand";
import { PLAYER_X_POS, FIXED_Y, ipAddress } from "../const/index";
import { sfx, bgm } from "../utils/sfx";
import { DeckManager, WordSystem } from "../utils/gameSystem";

// ============================================================================
// UTILITIES & MATH HELPERS
// ============================================================================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const chanceRound = (val, luckBonus = 0) => {
  const floor = Math.floor(val);
  const decimal = val - floor;
  const luckFactor = luckBonus * 0.02;
  return Math.random() < decimal + luckFactor ? floor + 1 : floor;
};

// ฟังก์ชันคำนวณดาเมจจากตัวอักษร โดยใช้ Power Map ของผู้เล่น
const getLetterDamage = (char, powerMap) => {
  if (!char || !powerMap) return 0;
  const upperChar = char.toUpperCase();
  const value = powerMap[upperChar];
  // ถ้าหาค่าไม่เจอให้เป็น 0
  return value !== undefined ? Number(value) : 0;
};

// ============================================================================
// GAME STORE
// ============================================================================

export const useGameStore = create((set, get) => ({
  // --------------------------------------------------------------------------
  // SECTION: SETTINGS & MENU STATE
  // --------------------------------------------------------------------------
  isMenuOpen: false,
  isBgmOn: true,
  isSfxOn: true,

  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),

  toggleBgm: () => {
    const { isBgmOn, gameState } = get();
    if (isBgmOn) {
      bgm.stop();
      set({ isBgmOn: false });
    } else {
      set({ isBgmOn: true });
      if (gameState === "ADVANTURE") bgm.playGreenGrass();
      else if (
        [
          "PREPARING_COMBAT",
          "PLAYERTURN",
          "ENEMYTURN",
          "ACTION",
          "QUIZ_MODE",
        ].includes(gameState)
      ) {
        bgm.playBattle();
      }
    }
  },

  toggleSfx: () => set((state) => ({ isSfxOn: !state.isSfxOn })),

  // --------------------------------------------------------------------------
  // SECTION: STATE DEFINITIONS
  // --------------------------------------------------------------------------
  gameState: "LOADING",
  loadingProgress: 0,
  dictionary: [],
  stageData: [],

  // 📦 เก็บ Log คำศัพท์ที่ใช้ไป (Word, Meaning, Type, Count, TotalDamage)
  wordLog: {},

  distance: 0,
  currentEventIndex: 0,

  animTimer: 0,
  hasSpawnedEnemies: false,

  damagePopups: [],
  hoveredEnemyId: null,
  validWordInfo: null,

  enemies: [],
  turnQueue: [],
  activeCombatant: null,

  currentQuiz: null,
  quizResolver: null,

  username: "",
  currentCoin: 0,
  receivedCoin: 0,
  
  playerX: PLAYER_X_POS,
  playerShoutText: "",
  playerVisual: "idle",
  animFrame: 1,
  selectedLetters: [],
  
  playerData: {
    name: "Hero",
    img_path: "",
    level: 1,
    next_exp: 0,
    exp: 0,
    max_hp: 0, hp: 0,
    power: {}, // เก็บ Object Power Stat ({A: 1, B: 0.5...})
    shield: 0,
    speed: 0,
    unlockedSlots: 0,
    potions: { health: 1, cure: 1, reroll: 1 },
    inventory: [],
  },

  // --------------------------------------------------------------------------
  // SECTION: UI & BASIC SETTERS
  // --------------------------------------------------------------------------
  addPopup: (p) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  removePopup: (id) =>
    set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),

  setHoveredEnemyId: (id) => {
    if (id === null) {
      set({ hoveredEnemyId: null });
      return;
    }
    if (id === "PLAYER") {
      set({ hoveredEnemyId: "PLAYER" });
      return;
    }
    const exist = get().enemies.some((e) => e.id === id && e.hp > 0);
    if (exist) set({ hoveredEnemyId: id });
  },
  
  clearHoverIfInvalid: () => {
    const { hoveredEnemyId, enemies } = get();
    if (!hoveredEnemyId) return;
    if (!enemies.some((e) => e.id === hoveredEnemyId && e.hp > 0)) {
      set({ hoveredEnemyId: null });
    }
  },

  // --------------------------------------------------------------------------
  // SECTION: INVENTORY & WORD LOGIC
  // --------------------------------------------------------------------------
  initSelectedLetters: () => {
    const { playerData } = get();
    set({
      selectedLetters: new Array(playerData.unlockedSlots).fill(null),
      validWordInfo: null,
    });
  },

  selectLetter: (item, invIndex) => {
    if (item.status === "stun") return;
    const { selectedLetters, playerData } = get();
    const emptyIdx = selectedLetters.findIndex((s) => s === null);

    if (emptyIdx !== -1) {
      const newSelected = [...selectedLetters];
      newSelected[emptyIdx] = { ...item, originalIndex: invIndex };
      const newInv = [...playerData.inventory];
      newInv[invIndex] = null;

      set({
        selectedLetters: newSelected,
        playerData: { ...playerData, inventory: newInv },
      });
      get().checkCurrentWord(newSelected);
    }
  },

  deselectLetter: (item) => {
    if (!item) return;
    const { selectedLetters, playerData } = get();

    const newInv = [...playerData.inventory];
    newInv[item.originalIndex] = { ...item };
    delete newInv[item.originalIndex].originalIndex;

    const indexToRemove = selectedLetters.findIndex((s) => s?.id === item.id);
    const newSelected = [...selectedLetters];
    newSelected[indexToRemove] = null;

    const compacted = newSelected.filter((l) => l !== null);
    const finalSelected = [
      ...compacted,
      ...new Array(playerData.unlockedSlots - compacted.length).fill(null),
    ];

    set({
      selectedLetters: finalSelected,
      playerData: { ...playerData, inventory: newInv },
    });
    get().checkCurrentWord(finalSelected);
  },

  resetSelection: () => {
    const { selectedLetters, playerData } = get();
    const itemsToReturn = selectedLetters.filter((i) => i !== null);
    if (itemsToReturn.length > 0) {
      const newInv = DeckManager.returnItems(
        playerData.inventory,
        itemsToReturn,
        playerData.unlockedSlots
      );
      set({ playerData: { ...playerData, inventory: newInv } });
    }
    get().initSelectedLetters();
  },

  reorderLetters: (newOrder) => {
    const { playerData } = get();
    const fullList = [
      ...newOrder,
      ...new Array(playerData.unlockedSlots - newOrder.length).fill(null),
    ];
    set({ selectedLetters: fullList });
    get().checkCurrentWord(fullList);
  },

  checkCurrentWord: (currentSelected) => {
    const { dictionary } = get();
    const word = currentSelected
      .filter((i) => i !== null)
      .map((i) => i.char)
      .join("")
      .toLowerCase();
    if (!word) {
      set({ validWordInfo: null });
      return;
    }
    const found = dictionary.find((d) => d.word.toLowerCase() === word);
    set({ validWordInfo: found || null });
  },

  // --------------------------------------------------------------------------
  // SECTION: SYSTEM LOOP & INITIALIZATION
  // --------------------------------------------------------------------------
  initializeGame: async (userData, stageId) => {
    console.log("Initializing Game...", userData, "Stage ID:", stageId);

    get().reset();
    set({ loadingProgress: 0, gameState: "LOADING" });

    try {
      // 1. Setup Hero Data
      const selectedHero =
        userData?.heroes?.find((h) => h.is_selected) || userData?.heroes?.[0];
      if (userData) {
        set(() => ({
          username: userData.username,
          currentCoin: userData.money,
        }));
      }

      if (selectedHero) {
        const { stats } = selectedHero;

        set((state) => ({
          playerData: {
            ...state.playerData,
            name: selectedHero.name,
            img_path: selectedHero.hero_id,
            level: selectedHero.level,
            next_exp: selectedHero.next_exp || 100,
            exp: 0,
            
            // ใช้ค่า Stat จริงจาก backend
            max_hp: stats?.hp || 20,
            hp: stats?.hp || 20,
            
            // เก็บ Object Power ลงใน playerData.power
            power: stats?.power || {},
            
            speed: stats?.speed || 3,
            unlockedSlots: stats?.slot || 5,
          },
        }));
      }
      set({ loadingProgress: 25 });

      // 2. Fetch Dictionary
      const dictRes = await fetch(`${ipAddress}/dict`);
      const dictData = await dictRes.json();
      set({ loadingProgress: 50 });

      // 3. Setup Stage
      const stageRes = await fetch(`${ipAddress}/getStageById/${stageId}`);
      const stageData = await stageRes.json();

      // console.log("stageData");
      console.log("stageData",stageData);

      set({ loadingProgress: 75 });
      DeckManager.init();

      // 4. Finish
      set({ loadingProgress: 100 });
      await delay(1000);

      if (get().isBgmOn) bgm.playGreenGrass();

      set({
        dictionary: dictData,
        stageData: stageData,
        currentEventIndex: 0,
        gameState: "ADVANTURE",
      });
    } catch (error) {
      console.error("Init Failed:", error);
    }
  },

  // 🔥 UPDATE LOOP
  update: (dt) =>
    set((state) => {
      let updates = {};
      const ANIM_SPEED = 300;
      let newTimer = (state.animTimer || 0) + dt;

      // Animation Loop
      if (newTimer >= ANIM_SPEED) {
        newTimer -= ANIM_SPEED;
        updates.animFrame = state.animFrame === 1 ? 2 : 1;
        if (state.gameState === "ADVANTURE" && state.isSfxOn) sfx.playWalk();
      }
      updates.animTimer = newTimer;

      // Adventure Logic
      if (state.gameState === "ADVANTURE") {
        const goal = state.stageData.distant_goal;

        // 🟢 1. เช็คว่าถึงเส้นชัยหรือยัง
        if (goal && state.distance >= goal) {
           // A. หยุดขยับฉากหลัง (Fix Distance)
           updates.distance = goal;

           // B. ขยับตัวผู้เล่นไปทางขวา (Walk Out)
           const walkOutSpeed = 0.1; // ความเร็วเดินออก
           const nextX = state.playerX + (dt * walkOutSpeed);
           updates.playerX = nextX;

           // C. เช็คว่าเดินพ้นจอหรือยัง (สมมติจอ 1200px)
           if (nextX > 1200) {
             get().finishStage(); // จบเกมจริงๆ
             return updates;
           }

        } else {
           // 🔵 2. กรณีปกติ (ยังไม่ถึงเส้นชัย)
           const speed = 0.005;
           const newDist = state.distance + dt * speed;
           updates.playerX = PLAYER_X_POS; // ตรึงตำแหน่งผู้เล่นไว้ที่เดิม

           // เช็ค Event Encounter
           let nextTargetDist = Infinity;
           if (state.stageData && state.stageData.events[state.currentEventIndex]) {
             nextTargetDist = state.stageData.events[state.currentEventIndex].distance;
           }

           if (newDist >= nextTargetDist) {
             if (state.isBgmOn) {
               bgm.stop();
               bgm.playBattle();
             }

             setTimeout(() => {
               const store = get();
               if (store.gameState === "PREPARING_COMBAT") {
                 const activeSlots = store.playerData.unlockedSlots || 10;
                 const initialLoot = DeckManager.generateList(activeSlots);
                 store.spawnEnemies(initialLoot, true);
               }
             }, 50);
             updates.distance = nextTargetDist;
             updates.gameState = "PREPARING_COMBAT";
           } else {
             updates.distance = newDist;
           }
        }
      }
      return updates;
    }),

  reset: () => {
    set({
      gameState: "ADVANTURE",
      currentEventIndex: 0,
      receivedCoin: 0,
      selectedLetters: [],
      validWordInfo: null,
      playerData: {
        ...get().playerData,
        hp: get().playerData.max_hp,
        shield: 0,
        inventory: [],
      },
      enemies: [],
      damagePopups: [],
      turnQueue: [],
      activeCombatant: null,
      distance: 0,
      playerX: PLAYER_X_POS, 
      isMenuOpen: false,
      wordLog: {}, 
    });
  },

  // --------------------------------------------------------------------------
  // SECTION: COMBAT FLOW
  // --------------------------------------------------------------------------
  spawnEnemies: (loot, autoStart = false) => {
    const store = get();
    const currentEvent = store.stageData.events[store.currentEventIndex];
    const waveData = currentEvent ? currentEvent.monsters : [];

    let currentX = 85;
    const enemiesWithPos = waveData.map((e, i) => {
      if (i > 0) currentX -= e.isBoss || waveData[i - 1].isBoss ? 14 : 7;
      return {
        ...e,
        id: e.spawn_id || `enemy_${i}_${Date.now()}`,
        x: currentX,
        hp: e.max_hp,
        shield: 0,
        currentStep: 1, // เท่าไหร่ของแพทเทิร์นนั้น
        selectedPattern: 1, // แพทเทิร์นไหน
      };
    });

    set({
      enemies: enemiesWithPos,
      playerData: {
        ...store.playerData,
        inventory: loot,
      },
    });

    if (autoStart) get().startCombatRound();
  },

  startCombatRound: async () => {
    const store = get();

    get().addPopup({
      id: Math.random(),
      x: 30,
      y: FIXED_Y - 60,
      value: "Start new round!",
      color: "#ffffff",
    });
    await delay(500);

    set((state) => ({
      playerData: { ...state.playerData, shield: 0 },
      enemies: state.enemies.map((e) => ({ ...e, shield: 0 })),
    }));

    const playerInit = Math.max(
      1,
      store.playerData.speed + (Math.floor(Math.random() * 3) - 1)
    );
    let pool = [
      { id: "player", type: "player", name: "You", initiative: playerInit },
    ];

    store.enemies
      .filter((e) => e.hp > 0)
      .forEach((e) => {
        const init = Math.max(
          1,
          (e.speed || 3) + (Math.floor(Math.random() * 3) - 1)
        );
        pool.push({ id: e.id, type: "enemy", name: e.name, initiative: init });
      });

    const finalQueue = [];
    const minInit = Math.min(...pool.map((u) => u.initiative));
    let queueCounter = 0;

    while (pool.length > 0) {
      pool.sort((a, b) => b.initiative - a.initiative);
      const winner = pool.shift();
      finalQueue.push({
        ...winner,
        uniqueId: `${winner.id}_${queueCounter++}`,
      });

      const nextInit = Math.floor(winner.initiative / 2);
      if (nextInit > minInit) {
        pool.push({ ...winner, initiative: nextInit });
      }
    }

    set({ turnQueue: finalQueue });
    get().processNextTurn();
  },

  processNextTurn: async () => {
    const store = get();
    const queue = store.turnQueue;

    if (queue.length === 0) {
      const aliveEnemies = store.enemies.filter((e) => e.hp > 0).length;
      if (aliveEnemies > 0 && store.playerData.hp > 0) get().startCombatRound();
      return;
    }

    const activeUnit = queue[0];
    set({ activeCombatant: activeUnit });

    if (activeUnit.type === "enemy") {
      const exists = store.enemies.find(
        (e) => e.id === activeUnit.id && e.hp > 0
      );
      if (!exists) {
        get().endTurn();
        return;
      }
      get().runSingleEnemyTurn(activeUnit.id);
    } else {
      get().startPlayerTurn();
    }
  },

  endTurn: async () => {
    const store = get();

    if (store.activeCombatant && store.activeCombatant.type === "player") {
      const currentInv = [...store.playerData.inventory];
      
      const totalBleedStacks = currentInv.filter(s => s?.status === "bleed").length;
      const isBleedExploding = totalBleedStacks >= 3;

      let totalPoisonDmg = 0;
      let hasInventoryUpdate = false; 

      const updatedInv = currentInv.map((slot) => {
        if (!slot) return slot;

        // POISON
        if (slot.status === "poison") {
           hasInventoryUpdate = true;
           const dmg = Math.floor(store.playerData.max_hp * 0.10);
           totalPoisonDmg += Math.max(1, dmg);
           const newDuration = slot.statusDuration - 1;
           return newDuration <= 0
            ? { ...slot, status: null, statusDuration: 0 }
            : { ...slot, statusDuration: newDuration };
        }

        // STUN / BLIND
        if (slot.status === "stun" || slot.status === "blind") {
           hasInventoryUpdate = true;
           const newDuration = slot.statusDuration - 1;
           return newDuration <= 0
            ? { ...slot, status: null, statusDuration: 0 }
            : { ...slot, statusDuration: newDuration };
        }
        
        // BLEED
        if (slot.status === "bleed") {
          hasInventoryUpdate = true;
          if (isBleedExploding) {
            return { ...slot, status: null, statusDuration: 0 };
          } else {
            const newDuration = slot.statusDuration - 1;
            return newDuration <= 0
              ? { ...slot, status: null, statusDuration: 0 }
              : { ...slot, statusDuration: newDuration };
          }
        }

        return slot;
      });

      if (hasInventoryUpdate) {
        set({ playerData: { ...store.playerData, inventory: updatedInv } });

        if (totalPoisonDmg > 0) {
           get().addPopup({
            id: Math.random(),
            x: PLAYER_X_POS,
            y: FIXED_Y - 60,
            value: "POISON!",
            color: "#33ff00",
          });
          if (store.isSfxOn) sfx.playPoison();
          await delay(1000);
          get().damagePlayer(totalPoisonDmg, true);
          await delay(500);
        }

        if (isBleedExploding) {
            const bleedDmg = Math.floor(store.playerData.max_hp * 0.30);
            get().addPopup({
                id: Math.random(),
                x: PLAYER_X_POS,
                y: FIXED_Y - 60,
                value: "BLOOD EXPLOSION!", 
                color: "#c0392b",
                fontSize: "20px"
            });
            if (store.isSfxOn) sfx.playHit();
            await delay(800);
            get().damagePlayer(bleedDmg, true); 
            await delay(500);
        }
      }
      
      if (get().playerData.hp <= 0) return;
    }

    if (!store.enemies.some((e) => e.hp > 0)) {
      get().handleWaveClear();
      return;
    }

    const newQueue = [...store.turnQueue];
    newQueue.shift();
    set({ turnQueue: newQueue, activeCombatant: null });
    get().processNextTurn();
  },

  // 🔥 HANDLE WAVE CLEAR
  handleWaveClear: async () => {
    const store = get();
    set({ gameState: "WAVE_CLEARED", playerShoutText: "Victory!" });
    await delay(2000);

    // เลื่อนไป Event ถัดไป (ถ้ามี) หรือแค่วิ่งเปล่าๆ
    const nextEventIdx = store.currentEventIndex + 1;
    
    // กลับไปวิ่ง (ADVANTURE) ไม่ว่าจะมี Event ต่อหรือไม่
    // เพราะเราใช้ distance เป็นตัวจบเกม
    set({
      gameState: "ADVANTURE",
      playerShoutText: "",
      currentEventIndex: nextEventIdx,
      turnQueue: [],
      activeCombatant: null,
      hasSpawnedEnemies: false,
    });

    if (store.isBgmOn) {
      bgm.stop();
      bgm.playGreenGrass();
    }
  },

  // 🔥 FINISH STAGE
  finishStage: async () => {
      const store = get();
      if (store.gameState === "LOADING" || store.gameState === "GAME_CLEARED") return; // กันเรียกซ้ำ

      bgm.stop();
      set({ gameState: "LOADING", playerShoutText: "Saving..." });
      
      try {
        const token = localStorage.getItem("token");
        const totalMoney = (store.currentCoin || 0) + (store.receivedCoin || 0);
        const currentStageId = store.stageData.id;

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        // 1. Update Money
        await fetch(`${ipAddress}/update-money`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ money: totalMoney })
        });

        // 2. Unlock Stage / Complete
        const unlockRes = await fetch(`${ipAddress}/complete-stage`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ currentStageId: currentStageId })
        });
        const unlockData = await unlockRes.json();
        
        if (!unlockRes.ok) throw new Error(unlockData.message || "Failed to unlock stage");

        set({
          currentCoin: totalMoney,
          receivedCoin: 0,
          gameState: "GAME_CLEARED", 
          enemies: [],
          playerShoutText: "All Clear!",
        });
        console.log("Game Saved Successfully:", unlockData);
      } catch (error) {
        console.error("Save Game Error:", error);
        set({ 
          gameState: "GAME_CLEARED", 
          playerShoutText: "Error Saving!" 
        });
      }
  },

  // --------------------------------------------------------------------------
  // SECTION: PLAYER ACTIONS
  // --------------------------------------------------------------------------
  startPlayerTurn: () => {
    const store = get();
    const newInventory = DeckManager.fillEmptySlots(
      store.playerData.inventory,
      [],
      store.playerData.unlockedSlots
    );
    set((s) => ({
      gameState: "PLAYERTURN",
      playerVisual: "idle",
      playerData: {
        ...s.playerData,
        inventory: newInventory,
      },
    }));
  },

  performPlayerAction: async (actionType, word, targetId, usedIndices) => {
    const store = get();
    
    // 1. คำนวณ Damage โดยใช้ getLetterDamage และ playerData.power
    let totalDmgRaw = 0;
    for (let char of word)
      totalDmgRaw += getLetterDamage(char, store.playerData.power);
    const totalDmg = chanceRound(totalDmgRaw); 

    // 2. LOGGING LOGIC
    const { dictionary, wordLog } = store;
    const lowerWord = word.toLowerCase();
    
    const vocabData = dictionary.find((v) => v.word.toLowerCase() === lowerWord);
    
    if (vocabData) {
      const existingEntry = wordLog[lowerWord] || {
        word: vocabData.word,
        meaning: vocabData.meaning,
        type: vocabData.category || vocabData.type || "-", 
        count: 0,
        totalDamage: 0 
      };

      set({
        wordLog: {
          ...wordLog,
          [lowerWord]: {
            ...existingEntry,
            count: existingEntry.count + 1,
            totalDamage: existingEntry.totalDamage + totalDmg // ➕ บวกค่า Damage ที่ทำได้สะสมไป
          }
        }
      });
    }

    // 3. Clear Inventory
    let currentInv = [...store.playerData.inventory];
    usedIndices.forEach((idx) => {
      currentInv[idx] = null;
    });

    currentInv = DeckManager.fillEmptySlots(
      currentInv, 
      [], 
      store.playerData.unlockedSlots
    );

    set((s) => ({
      playerShoutText: actionType,
      gameState: "ACTION",
      playerVisual: "idle",
      playerData: { ...s.playerData, inventory: currentInv },
    }));

    await delay(300);

    // 4. Action Logic (ใช้ค่า totalDmg ที่คำนวณไว้แล้ว)
    if (actionType === "SHIELD") {
      set({
        playerVisual: "guard-1",
        playerData: {
          ...store.playerData,
          shield: store.playerData.shield + totalDmg, // ✅ ใช้ totalDmg เดิม
        },
      });
      await delay(200);
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 60,
        value: `+${totalDmg} SHEILD`,
        color: "#2e75cc",
      });
      await delay(500);
    } else if (actionType === "ATTACK") {
      const target = get().enemies.find((e) => e.id === targetId);
      if (target) {
        set({ playerX: target.x - 10, playerVisual: "walk" });
        await delay(200);

        set({ playerVisual: "attack-1" });
        await delay(400);
        if (store.isSfxOn) sfx.playHit();
        set({ playerVisual: "attack-2" });

        get().damageEnemy(targetId, totalDmg); // ✅ ใช้ totalDmg เดิม
        await delay(400);
      }
      set({ playerX: PLAYER_X_POS, playerVisual: "walk" });
      await delay(500);
    }

    set({ playerVisual: "idle", playerShoutText: "" });
    get().endTurn();
  },

  usePotion: (type, value = 0) => set((state) => {
    const { playerData } = state;
    const { potions } = playerData;

    if (type === "health") {
      if (potions.health <= 0) return state;
      const newHp = Math.min(playerData.max_hp, playerData.hp + value);
      return {
        playerData: {
          ...playerData,
          hp: newHp,
          potions: { ...potions, health: potions.health - 1 }
        }
      };
    }

    if (type === "reroll") {
      if (potions.reroll <= 0) return state;
      return {
        playerData: {
          ...playerData,
          potions: { ...potions, reroll: potions.reroll - 1 }
        }
      };
    }
    return state;
  }),

  actionSpin: async (newInventory) => {
    const store = get();
    set((s) => ({
      playerData: {
        ...s.playerData,
        inventory: newInventory,
      },
      playerShoutText: "SPIN!",
      gameState: "ACTION",
    }));
    await delay(600);
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },

  // --------------------------------------------------------------------------
  // SECTION: ENEMY AI & LOGIC (REFRACTORED MAJOR UPDATE) 🚀
  // --------------------------------------------------------------------------

  updateEnemy: (id, data) =>
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),

  damageEnemy: (id, dmg) => {
    const target = get().enemies.find((e) => e.id === id);
    if (!target) return;

    let finalDmg = dmg;
    let currentShield = target.shield || 0;
    if (currentShield > 0) {
      if (currentShield >= dmg) {
        currentShield -= dmg;
        finalDmg = 0;
      } else {
        finalDmg -= currentShield;
        currentShield = 0;
      }
      get().updateEnemy(id, { shield: currentShield });
    }

    const newHp = Math.max(0, target.hp - finalDmg);
    get().updateEnemy(id, { hp: newHp });
    get().addPopup({
      id: Math.random(),
      x: target.x - 2,
      y: FIXED_Y - 80,
      value: finalDmg,
      color: "#cc2e2e",
    });

    if (newHp <= 0) {
      set((state) => ({
        receivedCoin: state.receivedCoin + (target.exp || 0),
      }));
    }
  },

  damagePlayer: (dmg, ignoreShield = false) => {
    const { playerData: stat, isSfxOn } = get();
    let remainingDmg = dmg;
    let newShield = stat.shield;

    if (!ignoreShield && newShield > 0) {
      const blockAmount = Math.min(newShield, remainingDmg);
      newShield -= blockAmount;
      remainingDmg -= blockAmount;

           get().addPopup({
            id: Math.random(),
            x: PLAYER_X_POS,
            y: FIXED_Y - 60,
            value: "BLOCK!",
            color: "#ffffff",
          });

      if (remainingDmg === 0) {
        if (isSfxOn) sfx.playBlock();
        set({ playerVisual: "guard-1" }); 
        setTimeout(() => set({ playerVisual: "idle" }), 600);
      }
    }

    const newHp = Math.max(0, stat.hp - remainingDmg);
    set({ playerData: { ...stat, hp: newHp, shield: newShield } });

    if (remainingDmg > 0) {
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS - 2,
        y: FIXED_Y - 50,
        value: remainingDmg,
        isPlayer: true,
        color: "#cc2e2e",
      });
    }

    if (newHp <= 0) {
      bgm.stop();
      set({ gameState: "OVER" });
    }
  },

  // ฟังก์ชันช่วยใส่สถานะ (เรียกใช้ซ้ำได้)
  applyStatusToPlayer: (code, chance, count, turn) => {
     if (!code) return;
     // เช็คโอกาสติด (0-100)
     const roll = Math.floor(Math.random() * 100);
     if (roll >= chance) {
         console.log("Status missed!", roll, chance);
         return; // ไม่ติด
     }

     const store = get();
     const currentInv = [...store.playerData.inventory];
     // หาช่องว่างที่ไม่มีสถานะ
     const availableSlots = currentInv
       .map((s, i) => (s && !s.status ? i : null))
       .filter((i) => i !== null);

       if (availableSlots.length > 0) {
         // สุ่มช่องที่จะโดนตามจำนวน count
         // เช่น ถ้า count = 2 แต่เหลือที่ว่าง 1 ก็โดนแค่ 1
         const targets = [];
         for(let i=0; i<count; i++) {
             if (availableSlots.length === 0) break;
             const randIndex = Math.floor(Math.random() * availableSlots.length);
             targets.push(availableSlots.splice(randIndex, 1)[0]);
         }

         targets.forEach(idx => {
             currentInv[idx].status = code.toLowerCase(); // poison, bleed, blind, stun
             currentInv[idx].statusDuration = turn;
         });
         
         const debuffColors = {
             "POISON": "#2ecc71", 
             "BLEED":  "#e74c3c", 
             "BLIND":  "#8e44ad", 
             "STUN":   "#f1c40f", 
         };

         // เลือกสี ถ้าไม่มีในรายการให้เป็นสีม่วงเดิม หรือ ขาว
         const popupColor = debuffColors[code] || "#8e44ad"; 

         set({ playerData: { ...store.playerData, inventory: currentInv } });
         get().addPopup({
             id: Math.random(),
             x: PLAYER_X_POS,
             y: FIXED_Y - 80,
             value: `${code}!`,
             color: popupColor, 
         });
      }
  },

  // ฟังก์ชันประมวลผลเทิร์นศัตรูแบบใหม่ (Data-Driven)
  runSingleEnemyTurn: async (enemyId) => {
    const store = get();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });

    const en = store.enemies.find((e) => e.id === enemyId);
    if (!en || en.hp <= 0) {
      get().endTurn();
      return;
    }

    // Reset Shield มอนสเตอร์ก่อนเริ่มเทิร์น
    get().updateEnemy(en.id, { shield: 0 });

    // 1. หา Pattern และ Move ปัจจุบัน
    const actionObj = en.pattern_list?.find(
      (p) => p.pattern_no === en.selectedPattern && p.order === en.currentStep
    );
    
    // ถ้าไม่มีข้อมูล ให้รอเฉยๆ (กันบั๊ก)
    if (!actionObj || !actionObj.move) {
        get().updateEnemy(en.id, { shoutText: "..." });
        await delay(800);
        get().endTurn();
        return;
    }

    const moveData = actionObj.move;
    
    // 2. ตะโกนชื่อท่า
    get().updateEnemy(en.id, { shoutText: moveData.name || "ATTACK!" });
    await delay(500);

    const originalX = en.x;

    // 3. จัดการ Animation (พุ่ง / ไม่พุ่ง)
    if (moveData.is_dash) {
        const atkX = en.isBoss ? PLAYER_X_POS + 15 : PLAYER_X_POS + 10;
        get().updateEnemy(en.id, { x: atkX, atkFrame: 1 });
        await delay(400);
    } else {
        // ยืนร่ายเวทย์ที่เดิม
        get().updateEnemy(en.id, { atkFrame: 1 });
        await delay(400);
    }

    // 4. คำนวณความแรง (Power %)
    // สูตร: Random(Min, Max) * Power / 100
    const rawAtk = Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min;
    const finalValue = Math.floor((rawAtk * (moveData.power || 0)) / 100);

    // 5. แยกประเภทการกระทำ (QUIZ vs NORMAL)
    if (moveData.is_quiz) {
        // --- QUIZ LOGIC ---
        // (ใช้ Logic เดิม แต่ปรับให้รับค่า finalValue เป็น damage บทลงโทษ)
        await get().handleQuizMove(en, finalValue, moveData);
    } else {
        // --- NORMAL LOGIC ---
        get().updateEnemy(en.id, { atkFrame: 2 }); // Action Frame

        if (moveData.type === 'ATTACK') {
            // โจมตี
            if (finalValue > 0) {
                get().damagePlayer(finalValue);
                if (store.isSfxOn) sfx.playHit();
            }
            // ยัดสถานะ (ถ้ามี)
            if (moveData.debuff_code) {
                get().applyStatusToPlayer(
                    moveData.debuff_code, 
                    moveData.debuff_chance, 
                    moveData.debuff_count, 
                    moveData.debuff_turn
                );
            }
        } else if (moveData.type === 'HEAL') {
             // ฮีล (Logic: หาเพื่อนเลือดน้อยสุด หรือตัวเอง)
             get().updateEnemy(en.id, { hp: Math.min(en.max_hp, en.hp + finalValue) });
             get().addPopup({
                id: Math.random(),
                x: en.x, y: FIXED_Y - 100,
                value: `+${finalValue}`, color: "#2ecc71", fontSize: "34px",
             });
        } else if (moveData.type === 'GUARD') {
             // เพิ่มเกราะ
             get().updateEnemy(en.id, { shield: (en.shield || 0) + finalValue });
        }

        await delay(500);
    }

    // 6. กลับที่เดิม & คำนวณ Step ถัดไป
    if (moveData.is_dash) {
        get().updateEnemy(en.id, { x: originalX, atkFrame: 0 });
    } else {
        get().updateEnemy(en.id, { atkFrame: 0 });
    }

    // คำนวณ Next Step (วนลูป pattern)
    let nextStep = en.currentStep + 1;
    const hasNext = en.pattern_list?.some(
      (p) => p.pattern_no === en.selectedPattern && p.order === nextStep
    );
    if (!hasNext) nextStep = 1;

    get().updateEnemy(en.id, { shoutText: "", currentStep: nextStep });

    if (get().playerData.hp <= 0) {
      bgm.stop();
      set({ gameState: "OVER" });
      return;
    }
    get().endTurn();
  },

  // Logic Quiz แยกออกมา
  handleQuizMove: async (en, penaltyDmg, moveData) => {
    const store = get();
    // 1. หาคำศัพท์
    const vocabList = store.dictionary;
    // พยายามหาคำที่ความยาวสัมพันธ์กับ Damage (Gimmick)
    let targetLen = Math.max(3, Math.min(8, Math.floor(penaltyDmg / 5))); 
    let candidateWords = vocabList.filter((v) => v.word.length === targetLen);
    if (candidateWords.length === 0) candidateWords = vocabList;
    
    const correctEntry = candidateWords[Math.floor(Math.random() * candidateWords.length)];
    const choices = vocabList
      .filter((v) => v.word !== correctEntry.word)
      .map((v) => ({ ...v, score: WordSystem.getLevenshteinDistance(correctEntry.word, v.word) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((w) => w.word);

    const finalChoices = [correctEntry.word, ...choices].sort(() => 0.5 - Math.random());

    // 2. แสดง UI
    get().updateEnemy(en.id, { shoutText: correctEntry.meaning });
    await delay(600);
    set({
      gameState: "QUIZ_MODE",
      currentQuiz: {
        question: correctEntry.meaning,
        correctAnswer: correctEntry.word,
        choices: finalChoices,
        enemyId: en.id,
        timeLimit: 10000,
      },
    });

    // 3. รอผลลัพธ์
    const isCorrect = await new Promise((resolve) => set({ quizResolver: resolve }));
    set({ gameState: "ENEMYTURN" });
    
    if (isCorrect) {
      get().updateEnemy(en.id, { atkFrame: 2 });
      set({ playerX: PLAYER_X_POS - 5, playerVisual: "walk" });
      if (store.isSfxOn) sfx.playMiss();
      get().updateEnemy(en.id, { shoutText: "MISSED!" });
    } else {
      get().updateEnemy(en.id, { atkFrame: 2 });
      // ตอบผิด: โดน Damage และโดน Status (ถ้ามี)
      if (store.isSfxOn) sfx.playHit();
      get().damagePlayer(penaltyDmg);
      
      if (moveData.debuff_code) {
          get().applyStatusToPlayer(
              moveData.debuff_code, 
              moveData.debuff_chance, 
              moveData.debuff_count, 
              moveData.debuff_turn
          );
      }
    }
    await delay(800);
    set({ playerX: PLAYER_X_POS, playerVisual: "idle" });
  },

  resolveQuiz: (answer) => {
    const store = get();
    if (!store.currentQuiz || !store.quizResolver) return;
    store.quizResolver(answer === store.currentQuiz.correctAnswer);
    set({ currentQuiz: null, quizResolver: null });
  },

  setInventory: (items) =>
    set({ playerData: { ...get().playerData, inventory: items } }),
}));