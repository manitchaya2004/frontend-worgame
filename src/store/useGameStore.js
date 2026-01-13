import { create } from "zustand";
import { PLAYER_X_POS, FIXED_Y, ipAddress } from "../const/index";
import { getLetterDamage } from "../const/letterValues";
import { sfx } from "../utils/sfx";
import { InventoryUtils, DeckManager, WordSystem } from "../utils/gameSystem";

// ============================================================================
// 🛠️ HELPER FUNCTIONS
// ============================================================================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getLevenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const getStatBonus = (val) => Math.max(0, val - 10);

/**
 * 🎲 Stochastic Rounding (ดวงล้วนๆ)
 * ใช้ค่า decimal (เศษ) + luckBonus มาเป็นโอกาสในการปัดขึ้น
 */
const chanceRound = (val, luckBonus = 0) => {
  const floor = Math.floor(val);
  const decimal = val - floor; 
  // ทุกๆ 1 Luck Bonus เพิ่มโอกาสปัดเศษขึ้น 2% (0.02)
  const luckFactor = luckBonus * 0.02;
  const finalChance = decimal + luckFactor;

  return Math.random() < finalChance ? floor + 1 : floor;
};

// ============================================================================
// 📦 MAIN STORE
// ============================================================================

export const useGameStore = create((set, get) => ({
  // --------------------------------------------------------------------------
  // 🟢 STATE: GLOBAL
  // --------------------------------------------------------------------------
  gameState: "ADVANTURE",
  dictionary: [],
  stageData: [],
  distance: 0,
  loadingProgress: 0,
  accumulatedExp: 0, 

  // Animation
  animTimer: 0,
  animFrame: 1,
  hasSpawnedEnemies: false,

  // --------------------------------------------------------------------------
  // 🟡 STATE: UI & INTERACTION
  // --------------------------------------------------------------------------
  logs: [],
  damagePopups: [],
  selectedLetters: [], 
  hoveredEnemyId: null,
  validWordInfo: null, 

  // --------------------------------------------------------------------------
  // 🔴 STATE: ENEMY & COMBAT QUEUE
  // --------------------------------------------------------------------------
  currentEventIndex: 0,
  enemies: [],
  isDodging: false,
  currentQuiz: null,
  quizResolver: null,
  turnQueue: [],
  activeCombatant: null,

  // --------------------------------------------------------------------------
  // 🔵 STATE: PLAYER
  // --------------------------------------------------------------------------
  playerData: {
    name: "sir-nick",
    level: 1,
    exp: 0,
    stats: { STR: 10, CON: 10, INT: 20, DEX: 10, FAITH: 20, LUCK: 10 },
    max_hp: 5,
    hp: 5,
    shield: 0,
    max_rp: 3,
    rp: 3,
    speed: 6,
    unlockedSlots: 10,
    inventory: [],
  },
  playerX: PLAYER_X_POS,
  playerShoutText: "",
  playerVisual: "idle",
  isGuarding: false,
  actionPhase: "IDLE",

  // ==========================================================================
  // ⚡ ACTIONS: UI & SELECTION LOGIC
  // ==========================================================================

  addLog: (message, type = "info") => {
    set((state) => {
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        message,
        type,
        timestamp: Date.now(),
      };
      const newLogs = [...state.logs, newLog];
      return {
        logs:
          newLogs.length > 50 ? newLogs.slice(newLogs.length - 50) : newLogs,
      };
    });
  },

  setHoveredEnemyId: (id) => set({ hoveredEnemyId: id }),

  initSelectedLetters: () => {
    const { playerData } = get();
    set({
      selectedLetters: new Array(playerData.unlockedSlots).fill(null),
      validWordInfo: null,
    });
  },

  selectLetter: (item, invIndex) => {
    // ป้องกันถ้าช่องนั้นติด Stun
    if (item.status === "stun") {
        get().addLog("This slot is STUNNED!", "error");
        return;
    }

    const { selectedLetters, playerData } = get();
    const emptyIdx = selectedLetters.findIndex((s) => s === null);

    if (emptyIdx !== -1) {
      const newSelected = [...selectedLetters];
      newSelected[emptyIdx] = { ...item, originalIndex: invIndex };
      const newInv = [...playerData.inventory];
      newInv[invIndex] = null;

      set({ selectedLetters: newSelected, playerData: { ...playerData, inventory: newInv } });
      get().checkCurrentWord(newSelected);
    }
  },

  deselectLetter: (item) => {
    const { selectedLetters, playerData } = get();
    if (!item) return;

    // คืนค่ากลับไปพร้อมสถานะเดิม (Poison/Stun)
    const newInv = [...playerData.inventory];
    newInv[item.originalIndex] = { ...item };
    delete newInv[item.originalIndex].originalIndex;

    const indexToRemove = selectedLetters.findIndex((s) => s?.id === item.id);
    const newSelected = [...selectedLetters];
    newSelected[indexToRemove] = null;

    const compacted = newSelected.filter((l) => l !== null);
    const finalSelected = [...compacted, ...new Array(playerData.unlockedSlots - compacted.length).fill(null)];

    set({ selectedLetters: finalSelected, playerData: { ...playerData, inventory: newInv } });
    get().checkCurrentWord(finalSelected);
  },
  resetSelection: () => {
    const { selectedLetters, playerData } = get();
    const itemsToReturn = selectedLetters.filter((i) => i !== null);

    if (itemsToReturn.length > 0) {
      const newInv = InventoryUtils.returnItems(
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

  // ==========================================================================
  // ⚡ ACTIONS: GAME SYSTEM & LOGIC
  // ==========================================================================

  recalculatePlayerStats: () => {
    set((state) => {
      const s = state.playerData.stats;
      const lvl = state.playerData.level || 1;
      const conBonus = getStatBonus(s.CON);
      const dexBonus = getStatBonus(s.DEX);
      const faithBonus = getStatBonus(s.FAITH);

      const newMaxHp = 8 + conBonus * 2 + lvl * 3;
      const oldMaxHp = state.playerData.max_hp || 8;
      const hpDiff = newMaxHp - oldMaxHp;
      const newCurrentHp = Math.max(
        0,
        Math.min(newMaxHp, state.playerData.hp + hpDiff)
      );
      const newSlots = s.INT;
      const newSpeed = Math.max(1, 6 + dexBonus);
      const newMaxRp = 1 + faithBonus;

      return {
        playerData: {
          ...state.playerData,
          max_hp: newMaxHp,
          hp: newCurrentHp,
          unlockedSlots: newSlots,
          speed: newSpeed,
          max_rp: newMaxRp,
        },
      };
    });
  },

  saveHeroExp: async (amount) => {
    if (amount <= 0) return;
    const { playerData } = get();
    const token = localStorage.getItem("token");
    console.log(`💾 Saving EXP: ${amount} to Hero: ${playerData.name}`);

    try {
      const res = await fetch(`${ipAddress}/add-exp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hero_id: playerData.name,
          add_exp: amount,
        }),
      });
      const data = await res.json();
      if (data.isSuccess) console.log("✅ EXP Saved!", data.data);
      else console.error("❌ Save Failed:", data.message);
    } catch (error) {
      console.error("❌ API Error:", error);
    }
  },

  initializeGame: async (userData, stageData) => {
    console.log("🚀 INITIALIZE GAME");

// 🟢 1. เคลียร์ข้อมูลเดิมทิ้งทั้งหมดก่อน (Reset State)
    set({
      loadingProgress: 0,
      gameState: "LOADING",
      distance: 0,
      accumulatedExp: 0,
      logs: [],
      damagePopups: [],
      selectedLetters: [],
      enemies: [],
      turnQueue: [],
      activeCombatant: null,
      currentEventIndex: 0,
      hasSpawnedEnemies: false,
      validWordInfo: null,
      playerVisual: "idle",
      playerShoutText: "",
      // มั่นใจว่า Shield เริ่มที่ 0 เสมอ
      playerData: { ...get().playerData, shield: 0, hp: get().playerData.max_hp } 
    });

    set({ loadingProgress: 0, gameState: "LOADING" });

    try {
      const selectedHero =
        userData?.heroes?.find((h) => h.is_selected) || userData?.heroes?.[0];
      if (selectedHero) {
        set((state) => ({
          playerData: {
            ...state.playerData,
            name: selectedHero.hero_id,
            level: selectedHero.level,
            exp: selectedHero.current_exp,
            stats: {
              STR: selectedHero.cur_str,
              CON: selectedHero.cur_con,
              INT: selectedHero.cur_int,
              DEX: selectedHero.cur_dex,
              FAITH: selectedHero.cur_faith,
              LUCK: selectedHero.cur_luck,
            },
          },
        }));
        get().recalculatePlayerStats();
      }

      set({ loadingProgress: 25 });

      const dictRes = await fetch(`${ipAddress}/dict`);
      const dictData = await dictRes.json();

      set({ loadingProgress: 50 });

      const targetStageId =
        typeof stageData === "object" ? stageData.stage_id : stageData;
      const stageRes = await fetch(
        `${ipAddress}/getStageById/${targetStageId}`
      );

      
      const stageRaw = await stageRes.json();
      console.log(stageRaw)

      const groupedEvents = {};
      if (Array.isArray(stageRaw)) {
        stageRaw.forEach((data) => {
          const dist = Number(data.distant_spawn);
          if (!groupedEvents[dist]) groupedEvents[dist] = [];

          const availablePatterns = data.pattern_list
            ? [...new Set(data.pattern_list.map((p) => p.pattern_no))]
            : [1];
          const selectedPatternNo =
            availablePatterns.length > 0
              ? availablePatterns[
                  Math.floor(Math.random() * availablePatterns.length)
                ]
              : 1;

          groupedEvents[dist].push({
            ...data,
            id: data.event_id || `m-${Math.random()}`,
            monster_id: data.id,
            hp: data.max_hp || 10,
            maxHp: data.max_hp || 10,
            x: 0,
            currentStep: 1,
            selectedPattern: selectedPatternNo,
            atkFrame: 0,
            shoutText: "",
            patternList: data.pattern_list || [],
            speed: data.speed || 3,
            exp: data.exp || 0,
            isBoss: data.isBoss === true || data.isBoss === "true" || false
          });
        });
      }

      const sortedStageEvents = Object.keys(groupedEvents)
        .map((key) => Number(key))
        .sort((a, b) => a - b)
        .map((dist) => ({ distance: dist, monsters: groupedEvents[dist] }));
        

      set({ loadingProgress: 75 });

      DeckManager.init();

      set({ loadingProgress: 100 });
      await delay(2000);

      set({
        dictionary: dictData,
        stageData: sortedStageEvents,
        currentEventIndex: 0,
        loadingProgress: 100,
        gameState: "ADVANTURE",
      });
      get().recalculatePlayerStats();
    } catch (error) {
      console.error("Init Failed:", error);
    }
  },

  setDictionary: (data) => set({ dictionary: data }),
  addPopup: (p) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  removePopup: (id) =>
    set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),

  reset: () => {
    set({
      gameState: "ADVANTURE",
      currentEventIndex: 0,
      accumulatedExp: 0,
      logs: [],
      selectedLetters: [],
      validWordInfo: null,
      playerData: {
        name: "chara",
        level: 1,
        exp: 0,
        stats: { STR: 10, CON: 10, INT: 10, DEX: 10, FAITH: 10, LUCK: 10 },
        max_hp: 8,
        hp: 8,
        max_rp: 3,
        rp: 3,
        speed: 6,
        shield: 0,
        unlockedSlots: 10,
        inventory: [],
      },
      enemies: [],
      playerVisual: "idle",
      animFrame: 1,
      animTimer: 0,
      distance: 0,
      damagePopups: [],
      currentQuiz: null,
      quizResolver: null,
      turnQueue: [],
      activeCombatant: null,
      hasSpawnedEnemies: false,
    });
    get().recalculatePlayerStats();
  },

  update: (dt) =>
    set((state) => {
      let updates = {};
      const ANIM_SPEED = 300;
      let newTimer = (state.animTimer || 0) + dt;
      if (newTimer >= ANIM_SPEED) {
        newTimer -= ANIM_SPEED;
        updates.animFrame = state.animFrame === 1 ? 2 : 1;
        if (state.gameState === "ADVANTURE") sfx.playWalk();
      }
      updates.animTimer = newTimer;

      if (state.gameState === "ADVANTURE") {
        const speed = 0.005;
        const newDist = state.distance + dt * speed;
        let nextTargetDist = Infinity;
        if (state.stageData && state.stageData[state.currentEventIndex])
          nextTargetDist = state.stageData[state.currentEventIndex].distance;

        if (newDist >= nextTargetDist) {
          const finalDist = nextTargetDist;
          setTimeout(() => {
            const store = get();
            if (store.gameState === "PREPARING_COMBAT") {
              const activeSlots = store.playerData.unlockedSlots || 10;
              const initialLoot = DeckManager.generateList(activeSlots);
              store.spawnEnemies(initialLoot, true);
            }
          }, 50);
          updates.distance = finalDist;
          updates.gameState = "PREPARING_COMBAT";
        } else {
          updates.distance = newDist;
        }
      }
      return updates;
    }),

  spawnEnemies: (loot, autoStart = false) => {
    const store = get();
    const currentEvent = store.stageData[store.currentEventIndex];
    const waveData = currentEvent ? currentEvent.monsters : [];

    if (!waveData || waveData.length === 0) {
      set({ gameState: "GAME_CLEARED", playerShoutText: "MISSION COMPLETE!" });
      return;
    }

    let currentX = 85;           // จุดเริ่ม
    const NORMAL_GAP = 7;
    const BOSS_GAP = 14;         // ระยะพิเศษใกล้บอส

    const enemiesWithPos = waveData.map((e, i) => {
      const isBoss = e.isBoss === true;

      // ถ้าตัวก่อนหน้าเป็นบอส → เว้นเพิ่ม
      if (i > 0) {
        const prev = waveData[i - 1];
        const nearBoss = isBoss || prev.isBoss;

        currentX -= nearBoss ? BOSS_GAP : NORMAL_GAP;
      }

      return {
        ...e,
        x: currentX,
        hp: e.max_hp,
        shield: 0,
        currentStep: 1,
        selectedPattern: e.selectedPattern || 1,
      };
    });

    set({
      enemies: enemiesWithPos,
      playerData: {
        ...store.playerData,
        rp: store.playerData.max_rp,
        inventory: loot,
      },
    });

    if (autoStart) get().startCombatRound();
  },



  startCombatRound: async () => {
    const store = get();

    // ---------------------------------------------------------
    // 🟢 1. เช็คสถานะพิเศษเมื่อเริ่มรอบใหม่ (Poison Damage & Duration)
    // ---------------------------------------------------------
    const currentInv = [...store.playerData.inventory];
    let totalPoisonDmg = 0;

    const updatedInv = currentInv.map((slot, idx) => {
      if (slot && slot.status) {
        // คิดดาเมจพิษ (10% ของ HP สูงสุด ต่อ 1 ช่องที่ติดพิษ)
        if (slot.status === "poison") {
          const dmg = Math.floor(store.playerData.max_hp * 0.1);
          totalPoisonDmg += dmg;
        }

        // ลดจำนวนรอบที่เหลือ (Duration)
        const newDuration = slot.statusDuration - 1;

        // ถ้าหมดเวลา ล้างสถานะให้เป็น null
        if (newDuration <= 0) {
          return { ...slot, status: null, statusDuration: 0 };
        }
        return { ...slot, statusDuration: newDuration };
      }
      return slot;
    });

    // แสดงดาเมจพิษ (ถ้ามีช่องติดพิษเหลืออยู่)
    if (totalPoisonDmg > 0) {
      get().damagePlayer(totalPoisonDmg);
      get().addLog(`Poison Round Damage: -${totalPoisonDmg} HP`, "error");
    }

    // ---------------------------------------------------------
    // 🟢 2. รีเซ็ตสถานะพื้นฐานของรอบใหม่ และอัปเดต Inventory
    // ---------------------------------------------------------
    set((state) => ({
      playerData: {
        ...state.playerData,
        shield: 0,            // รีเซ็ตเกราะผู้เล่น
        inventory: updatedInv // อัปเดตช่องสถานะตัวอักษรที่คำนวณแล้ว
      },
      // รีเซ็ตเกราะศัตรูทั้งหมดที่ยังมีชีวิตอยู่
      enemies: state.enemies.map(e => ({ ...e, shield: 0 }))
    }));

    // ---------------------------------------------------------
    // 🟢 3. คำนวณลำดับคิวการต่อสู้ (Initiative Queue)
    // ---------------------------------------------------------
    const playerSpeed = store.playerData.speed;
    const playerInit = Math.max(1, playerSpeed + (Math.floor(Math.random() * 3) - 1));

    let pool = [
      { 
        id: "player", 
        type: "player", 
        name: "You", 
        initiative: playerInit, 
        originalInitiative: playerInit, 
        uniqueId: `player-${Math.random()}` 
      },
    ];

    // เพิ่มศัตรูที่ยังมี HP > 0 ลงในคิว
    store.enemies.filter((e) => e.hp > 0).forEach((e) => {
      const baseSpeed = e.speed || 3;
      const init = Math.max(1, baseSpeed + (Math.floor(Math.random() * 3) - 1));
      pool.push({
        id: e.id,
        type: "enemy",
        name: e.name,
        initiative: init,
        originalInitiative: init,
        uniqueId: `${e.id}-${Math.random()}`,
      });
    });

    const minInit = Math.min(...pool.map((u) => u.initiative));
    const finalQueue = [];
    
    // จัดเรียงลำดับตามความเร็ว (Speed-based turn order)
    while (pool.length > 0) {
      pool.sort((a, b) => b.initiative - a.initiative);
      const winner = pool.shift();
      finalQueue.push(winner);
      
      const nextInit = Math.floor(winner.initiative / 2);
      if (nextInit > minInit) {
        pool.push({
          ...winner,
          initiative: nextInit,
          uniqueId: `${winner.id}-${Math.random()}`,
        });
      }
    }
    
    // ตั้งค่าคิวและเริ่มเทิร์นแรกของรอบทันที
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
      const enemyExists = store.enemies.find(
        (e) => e.id === activeUnit.id && e.hp > 0
      );
      if (!enemyExists) {
        get().endTurn();
        return;
      }
    }
    if (activeUnit.type === "player") get().startPlayerTurn();
    else get().runSingleEnemyTurn(activeUnit.id);
  },

  endTurn: () => {
    const store = get();
    const aliveEnemies = store.enemies.filter((e) => e.hp > 0).length;
    if (aliveEnemies === 0) {
      get().handleWaveClear();
      return;
    }

    const newQueue = [...store.turnQueue];
    newQueue.shift();
    set({ turnQueue: newQueue, activeCombatant: null });
    get().processNextTurn();
  },

  handleWaveClear: async () => {
    const store = get();
    const nextEventIdx = store.currentEventIndex + 1;

    if (store.stageData && store.stageData[nextEventIdx]) {
      set({ gameState: "WAVE_CLEARED", playerShoutText: "Victory!" });
      await delay(2000);
      set({
        gameState: "ADVANTURE",
        playerShoutText: "",
        currentEventIndex: nextEventIdx,
        turnQueue: [],
        activeCombatant: null,
        hasSpawnedEnemies: false,
      });
    } else {
      set({
        gameState: "GAME_CLEARED",
        enemies: [],
        playerShoutText: "All Clear!",
      });
      const totalExp = store.accumulatedExp;
      console.log(`🎉 Mission Complete! Gained(100%): ${totalExp}`);
      await get().saveHeroExp(totalExp);
    }
  },

  startPlayerTurn: () => {
    const store = get();
    const newInventory = InventoryUtils.fillEmptySlots(
      store.playerData.inventory,
      [],
      store.playerData.unlockedSlots
    );
    set((s) => ({
      gameState: "PLAYERTURN",
      playerVisual: "idle",
      playerData: {
        ...s.playerData,
        rp: s.playerData.max_rp,
        inventory: newInventory,
      },
    }));
  },

  performPlayerAction: async (actionType, word, targetId, usedIndices) => {
    const store = get();
    const activeSlots = store.playerData.unlockedSlots;
    const currentInv = [...store.playerData.inventory];

    // 1. จัดการ Poison Damage ก่อนเริ่ม Action (ถ้าช่องไหนมี Poison แล้วถูกใช้ พิษจะหายไป)
    // 2. เติมของใหม่ในช่องที่ใช้ไป
    usedIndices.forEach((idx) => { currentInv[idx] = null; });
    
    // เติม Item ใหม่ (Item ใหม่จะไม่มี Status)
    for (let i = 0; i < activeSlots; i++) {
      if (currentInv[i] === null) currentInv[i] = DeckManager.createItem(i, currentInv, activeSlots);
    }

    set((s) => ({
      playerShoutText: actionType,
      gameState: "ACTION",
      playerVisual: "idle",
      playerData: { ...s.playerData, inventory: currentInv },
    }));

    await delay(300);
    const strBonus = getStatBonus(store.playerData.stats.STR);
    const luckBonus = getStatBonus(store.playerData.stats.LUCK);

    if (actionType === "SHIELD") {
      const rawShield = word.length * 1.5 + strBonus;
      const shieldAmount = chanceRound(rawShield, luckBonus);
      set({ playerVisual: "guard-1" });
      set((s) => ({ playerData: { ...s.playerData, shield: s.playerData.shield + shieldAmount } }));
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: `+${shieldAmount} DEF`, isPlayer: false, color: "#2e75cc" });
      await delay(500);
    } else if (actionType === "ATTACK") {
      const originalX = PLAYER_X_POS;
      if (targetId) {
        const target = get().enemies.find((e) => e.id === targetId);
        if (target) {
          set({ playerX: target.x - 10, playerVisual: "walk" });
          await delay(200);
          let totalDmgRaw = 0;
          for (let char of word) totalDmgRaw += getLetterDamage(char, strBonus);
          const totalDmg = chanceRound(totalDmgRaw, luckBonus);
          set({ playerVisual: "attack-1" });
          await delay(400); sfx.playHit();
          set({ playerVisual: "attack-2" });
          get().damageEnemy(targetId, totalDmg);
          await delay(400);
        }
      }
      set({ playerX: originalX, playerVisual: "walk" });
      await delay(500);
    }

    set({ playerVisual: "idle", playerShoutText: "" });
    get().endTurn();
  },

  actionSpin: async (newInventory) => {
    const store = get();
    if (store.playerData.rp < 1) return;

    // มั่นใจว่า Inventory ใหม่ที่รับมา ได้รวมเอา Status เดิมมาด้วยแล้ว
    set((s) => ({
      playerData: {
        ...s.playerData,
        rp: s.playerData.max_rp - 1, // หรือ s.playerData.rp - 1 ตาม Logic เดิม
        inventory: newInventory,
      },
      playerShoutText: "SPIN!",
      gameState: "ACTION",
    }));

    await delay(600);
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },

  updateEnemy: (id, data) =>
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),

  damageEnemy: (id, dmg) => {
    const target = get().enemies.find((e) => e.id === id);
    if (target) {
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
        color: "#cc2e2e"
      });

      if (newHp <= 0) {
        const gainedExp = target.exp || 0;
        set((state) => ({ accumulatedExp: state.accumulatedExp + gainedExp }));
      }
    }
  },

  runSingleEnemyTurn: async (enemyId) => {
    const store = get();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });
    const en = store.enemies.find((e) => e.id === enemyId);
    if (!en || en.hp <= 0) {
      get().endTurn();
      return;
    }

    get().updateEnemy(en.id, { shield: 0 });
    let actionObj = null;
    if (en.patternList)
      actionObj = en.patternList.find(
        (p) => p.pattern_no === en.selectedPattern && p.order === en.currentStep
      );

    const actionMove = actionObj ? actionObj.move.toUpperCase() : "WAIT";
    let nextStep = en.currentStep + 1;
    const hasNext = en.patternList?.some(
      (p) => p.pattern_no === en.selectedPattern && p.order === nextStep
    );
    if (!hasNext) nextStep = 1;

    if (actionMove === "GUARD") {
      const shieldGain = en.def || 5;
      get().updateEnemy(en.id, { shoutText: "GUARD!" });
      await delay(400);
      get().updateEnemy(en.id, { shield: (en.shield || 0) + shieldGain });
      await delay(600);
      get().updateEnemy(en.id, { shoutText: "", currentStep: nextStep });
      await delay(200);
    } else if (actionMove === "ATTACK") {
      const dmg =
        Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) +
        en.atk_power_min;
      const shoutWord =
        WordSystem.getRandomWordByLength(store.dictionary, Math.min(dmg, 8)) ||
        "GRR!";
      get().updateEnemy(en.id, { shoutText: shoutWord });
      await delay(400);
      const originalX = en.x;
      if(en.isBoss) get().updateEnemy(en.id, { x: PLAYER_X_POS + 15, atkFrame: 1 });
      else get().updateEnemy(en.id, { x: PLAYER_X_POS + 10, atkFrame: 1 });
      await delay(400);
      get().damagePlayer(dmg);
      sfx.playHit();
      get().updateEnemy(en.id, { atkFrame: 2 });
      await delay(400);
      get().updateEnemy(en.id, {
        x: originalX,
        atkFrame: 0,
        shoutText: "",
        currentStep: nextStep,
      });
      await delay(200);
    } else if (actionMove === "WAIT") {
      get().updateEnemy(en.id, { shoutText: "...", currentStep: nextStep });
      await delay(800);
      get().updateEnemy(en.id, { shoutText: "" });
    }
    // ⚡ SKILL LOGIC
    else if (actionMove === "SKILL") {
      const originalX = en.x;
      const vocabList = store.dictionary;
      const baseDmg =
        Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) +
        en.atk_power_min;
      let finalDmg = baseDmg * 2;
      let candidateWords = vocabList.filter((v) => v.word.length === finalDmg);
      if (candidateWords.length === 0) {
        candidateWords = vocabList;
        const fallbackWord =
          candidateWords[Math.floor(Math.random() * candidateWords.length)];
        finalDmg = fallbackWord.word.length;
      }
      const correctEntry =
        candidateWords[Math.floor(Math.random() * candidateWords.length)];
      const choices = vocabList
        .filter((v) => v.word !== correctEntry.word)
        .map((v) => {
          let score = getLevenshteinDistance(correctEntry.word, v.word);
          score += Math.abs(correctEntry.word.length - v.word.length) * 2;
          return { ...v, similarityScore: score };
        })
        .sort((a, b) => a.similarityScore - b.similarityScore)
        .slice(0, 6)
        .map((w) => w.word);
      const finalChoices = [correctEntry.word, ...choices].sort(
        () => 0.5 - Math.random()
      );

      const CREEP_DIST = 4;
      const STRIKE_DIST = 6;

      get().updateEnemy(en.id, {
        x: PLAYER_X_POS + 30,
        shoutText: correctEntry.meaning,
        atkFrame: 1,
      });
      await delay(600);

      const QUIZ_SECONDS = 10;
      set({
        gameState: "QUIZ_MODE",
        currentQuiz: {
          question: correctEntry.meaning,
          correctAnswer: correctEntry.word,
          choices: finalChoices,
          enemyId: en.id,
          timeLimit: QUIZ_SECONDS * 1000,
        },
      });

      get().updateEnemy(en.id, { x: PLAYER_X_POS + CREEP_DIST, atkFrame: 1 });
      const isCorrect = await new Promise((resolve) => {
        set({ quizResolver: resolve });
      });

      set({ gameState: "ENEMYTURN" });
      await delay(50);
      get().updateEnemy(en.id, { x: PLAYER_X_POS + STRIKE_DIST, atkFrame: 2 });

      if (isCorrect) {
        set({ isDodging: true });
        sfx.playMiss();
        get().updateEnemy(en.id, { shoutText: "MISSED!" });
      } else {
        sfx.playHit();
        get().damagePlayer(finalDmg);
      }
      await delay(800);
      set({ isDodging: false });
      get().updateEnemy(en.id, {
        x: originalX,
        atkFrame: 0,
        shoutText: "",
        currentStep: nextStep,
      });
      await delay(1000);
    }
    // --- NEW LOGIC: HEAL ---
    else if (actionMove === "HEAL") {
        get().updateEnemy(en.id, { shoutText: "HEAL!" });
        await delay(500);

        const allies = store.enemies.filter(e => e.hp > 0);
        
        if (allies.length > 0) {
            // 🎯 ค้นหาศัตรูที่เลือดน้อยที่สุด (คำนวณจาก HP / MaxHP)
            const targetAlly = allies.reduce((prev, curr) => {
                const prevPct = prev.hp / prev.maxHp;
                const currPct = curr.hp / curr.maxHp;
                return (currPct < prevPct) ? curr : prev;
            });

            const healAmt = Math.floor(en.maxHp * 0.2);
            const newHp = Math.min(targetAlly.maxHp, targetAlly.hp + healAmt);
            
            get().updateEnemy(targetAlly.id, { hp: newHp });

            // 🟢 Popup ฮีลสีเขียว ชัดๆ นานๆ
            get().addPopup({ 
                id: Math.random(), 
                x: targetAlly.x, 
                y: FIXED_Y - 100, 
                value: `+${healAmt}`, 
                isPlayer: false, 
                color: "#2ecc71", // สีเขียวสว่าง
                fontSize: "34px"  // ขยายขนาดให้ชัดเจน
            });
        }

        await delay(1200); // รอนานขึ้นนิดนึงให้ผู้เล่นเห็น Popup ชัดๆ
        get().updateEnemy(en.id, { shoutText: "", currentStep: nextStep });
    }
    // 🟢 สกิล POISON: ติดพิษ 3 เทิร์น (ถ้าไม่ใช้จะเสียเลือด)
    else if (actionMove === "POISON") {
        get().updateEnemy(en.id, { shoutText: "POISON!" });
        await delay(500);
        
        const inv = [...get().playerData.inventory];
        // หาช่องที่มีตัวอักษรและยังไม่มีสถานะใดๆ
        const targetableSlots = inv.map((s, i) => (s && !s.status) ? i : null).filter(i => i !== null);
        
        if (targetableSlots.length > 0) {
            const targetIdx = targetableSlots[Math.floor(Math.random() * targetableSlots.length)];
            inv[targetIdx].status = "poison";
            inv[targetIdx].statusDuration = 3; // อยู่ได้ 3 เทิร์น
            
            set({ playerData: { ...get().playerData, inventory: inv } });
            get().addLog(`Slot ${targetIdx + 1} is POISONED!`, "error");
        }
        await delay(500);
        get().updateEnemy(en.id, { shoutText: "", currentStep: nextStep });
    }
    // 🔴 สกิล STUN: ล็อคช่อง 2 เทิร์น (กดใช้ไม่ได้)
    else if (actionMove === "STUN") {
        get().updateEnemy(en.id, { shoutText: "STUN!" });
        await delay(500);
        
        const inv = [...get().playerData.inventory];
        const targetableSlots = inv.map((s, i) => (s && !s.status) ? i : null).filter(i => i !== null);
        
        if (targetableSlots.length > 0) {
            const targetIdx = targetableSlots[Math.floor(Math.random() * targetableSlots.length)];
            inv[targetIdx].status = "stun";
            inv[targetIdx].statusDuration = 2; // อยู่ได้ 2 เทิร์น
            
            set({ playerData: { ...get().playerData, inventory: inv } });
            get().addLog(`Slot ${targetIdx + 1} is STUNNED!`, "error");
        }
        await delay(500);
        get().updateEnemy(en.id, { shoutText: "", currentStep: nextStep });
    }
    else { // WAIT
      get().updateEnemy(en.id, { shoutText: "...", currentStep: nextStep });
      await delay(800);
      get().updateEnemy(en.id, { shoutText: "" });
    }
    if (get().playerData.hp <= 0) {
      set({ gameState: "OVER" });
      return;
    }
    get().endTurn();
  },

  damagePlayer: (dmg) => {
    const { playerData: stat } = get();
    let remainingDmg = dmg;
    let newShield = stat.shield;
    if (newShield > 0) {
      const blockAmount = Math.min(newShield, remainingDmg);
      newShield -= blockAmount;
      remainingDmg -= blockAmount;
      if (remainingDmg === 0) {
        sfx.playBlock();
        set({ isGuarding: true, playerVisual: "guard-1" });
        setTimeout(() => {
          set({ isGuarding: false, playerVisual: "idle" });
        }, 600);
      }
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 70,
        value: 0,
        isPlayer: true,
        color: "#cc2e2e"
      });
    }
    const newHp = Math.max(0, stat.hp - remainingDmg);
    if (remainingDmg > 0) {
      set({ isGuarding: false, playerVisual: "idle" });
    }
    set({ playerData: { ...stat, hp: newHp, shield: newShield } });
    if (remainingDmg > 0)
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS - 2,
        y: FIXED_Y - 50,
        value: remainingDmg,
        isPlayer: true,
        color: "#cc2e2e"
      });

    if (newHp <= 0) {
      set({ gameState: "OVER" });
      const totalExp = get().accumulatedExp;
      const halfExp = Math.floor(totalExp / 2);
      console.log(
        `💀 Game Over! Total EXP: ${totalExp}, Gained(50%): ${halfExp}`
      );
      get().saveHeroExp(halfExp);
    }
  },

  setInventory: (items) =>
    set({ playerData: { ...get().playerData, inventory: items } }),
  resolveQuiz: (answer) => {
    const store = get();
    if (!store.currentQuiz || !store.quizResolver) return;
    const isCorrect = answer === store.currentQuiz.correctAnswer;
    store.quizResolver(isCorrect);
    set({ currentQuiz: null, quizResolver: null });
  },
}));