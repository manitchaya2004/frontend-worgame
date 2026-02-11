import { create } from "zustand";
import { PLAYER_X_POS, FIXED_Y, ipAddress } from "../const/index";
import { sfx, bgm } from "../utils/sfx";
import { DeckManager, WordSystem } from "../utils/gameSystem";

const POWER_GROUPS = {
  G1: ["A", "E", "I", "O", "U"],
  G2: ["L", "N", "S", "T", "R", "D", "G", "B", "C", "M", "P", "F", "H", "K"],
  G3: ["V", "W", "J", "X", "Y", "Q", "Z"]
};

// ใช้ค่าจาก Level 8 เป็นมาตรฐานตามที่คุณต้องการ
const ENEMY_POWER_MAP = {};
// สร้าง Map เพื่อให้ค้นหาพลังจากตัวอักษรได้เร็วขึ้น
Object.entries(POWER_GROUPS).forEach(([group, chars]) => {
  const powerValue = group === "G1" ? 0.50 : group === "G2" ? 1.00 : 1.50;
  chars.forEach(char => {
    ENEMY_POWER_MAP[char] = powerValue;
  });
});

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

const getLetterDamage = (char, powerMap) => {
  if (!char || !powerMap) return 0;
  
  let upperChar = char.toUpperCase();

  if (upperChar === "QU") {
    upperChar = "Q";
  }

  const value = powerMap[upperChar];
  return value !== undefined ? Number(value) : 0;
};

// ฟังก์ชันหาคำที่ยาวที่สุดจากตัวอักษรที่มี
const findBestWordFromLetters = (letters, dictionary, maxLetters) => {
  if (!letters || letters.length === 0) return { bestWord: "", usedItems: [] }; // ป้องกันลูปฟรี

  // 1. สร้าง Map ของตัวอักษรที่มีบนมือผู้เล่นไว้ก่อน
  const availableChars = new Set(letters.map(l => l?.char.toLowerCase()));
  const charCounts = {};
  letters.forEach(item => {
    if (!item) return;
    const c = item.char.toLowerCase();
    charCounts[c] = (charCounts[c] || 0) + 1;
  });

  let bestWord = "";
  let usedItems = [];

  // 2. กรอง Dictionary ล่วงหน้า
  const possibleWords = dictionary.filter(({ word }) => 
    word.length > 0 && 
    word.length <= maxLetters && // ตัดคำที่ยาวเกินพลังโจมตีออกทันที
    word.length > bestWord.length && // เช็คเฉพาะคำที่ยาวกว่าคำที่เจอแล้ว
    [...word.toLowerCase()].every(char => availableChars.has(char)) // ต้องมีตัวอักษรนั้นบนมือ
  );

  // 3. วนลูปเฉพาะคำที่มีโอกาสเป็นไปได้จริงๆ
  possibleWords.forEach(({ word }) => {
    const w = word.toLowerCase();
    const tempCounts = { ...charCounts };
    let canMake = true;
    
    for (const char of w) {
      if (!tempCounts[char]) { canMake = false; break; }
      tempCounts[char]--;
    }
    
    if (canMake) {
      bestWord = w;
      const tempLetters = [...letters];
      const currentUsed = [];
      for (const char of w) {
        const idx = tempLetters.findIndex(l => l?.char.toLowerCase() === char);
        currentUsed.push(tempLetters[idx]);
        tempLetters[idx] = null;
      }
      usedItems = currentUsed;
    }
  });

  return { bestWord, usedItems };
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

  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }), // เปิดหน้าเมนู เปลี่ยนตัวแปรเป็น true

  // เปิด/ปิดเสียงเพลง
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

  // เปิด/ปิดเสียงเอฟเฟค
  toggleSfx: () => set((state) => ({ isSfxOn: !state.isSfxOn })),

  // --------------------------------------------------------------------------
  // SECTION: STATE DEFINITIONS
  // --------------------------------------------------------------------------
  gameState: "LOADING", // เช็ค state ปัจจุบันของเกม

  dictionary: [], // คำศัพท์ทั้งหมด
  stageData: [], // ข้อมูลทุกอย่างในด่าน
  userStageHistory: [],

  wordLog: {}, // คำศัพท์ที่ใช้ไปในเกมนี้

  distance: 0, // ระยะทางปัจจุบัน
  currentEventIndex: 0, // เหตุการณ์ปัจจุบัน ไว้เช็คศัตรูที่จะเกิดในด่าน

  animTimer: 0, // ใช้เช็ค frame การเดิน
  hasSpawnedEnemies: false,

  damagePopups: [], // แสดงค่าความเสียหาย หรือ สถานะ
  hoveredEnemyId: null, // ศัตรูที่เอาเมาส์ไปชี้
  validWordInfo: null, // ข้อมูลคำศัพท์ที่เลือกอยู่

  enemies: [], // ศัตรูในสนามรบปัจจุบัน
  turnQueue: [], // คิวเทิร์นของการต่อสู้
  activeCombatant: null, // ตัวละครที่อยู่ในเทิร์นนั้น
  
  currentQuiz: null, // ข้อมูลคำถาม Quiz ปัจจุบัน
  quizResolver: null, // ฟังก์ชันที่ใช้แก้คำถาม Quiz

  username: "",
  currentCoin: 0, // เหรียญปัจจุบัน
  receivedCoin: 0, // เหรียญที่ได้รับในด่านนี้

  playerX: PLAYER_X_POS,
  playerShoutText: "",
  playerVisual: "idle", // ใช้แสดงท่าทางปัจจุบัน 
  animFrame: 1, // ใช้แสดงอนิเมชั่น frame ปัจจุบัน
  selectedLetters: [], // ตัวอักษรที่เลือกอยู่บนหน้าจอ

  playerData: {
    name: "Hero",
    img_path: "",
    level: 1,
    next_exp: 0,
    max_hp: 0,
    hp: 0,
    max_mana: 0,
    mana: 0,
    power: {},
    
    common_tile_dmg: 0,
    uncommon_tile_dmg: 0,
    rare_tile_dmg: 0,

    ability: {
      code: null,
      cost: 0,
      description: null,
    },
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

  // ==========================================================================
  // HELPER: Gain Mana Function
  // ==========================================================================
  gainMana: (amount) => {
    const { playerData } = get();
    if (playerData.hp <= 0) return;

    const current = playerData.mana;
    const max = playerData.max_mana;
    const nextMana = Math.min(max, current + amount);

    if (nextMana > current) {
      set({ playerData: { ...playerData, mana: nextMana } });
    }
  },

  // --------------------------------------------------------------------------
  // SECTION: INVENTORY & WORD LOGIC
  // --------------------------------------------------------------------------

  // รีเซ็ตตัวอักษรที่เลือก
  initSelectedLetters: () => {
    const { playerData } = get();
    set({
      selectedLetters: new Array(playerData.unlockedSlots).fill(null), 
      validWordInfo: null,
    });
  },
  // เลือกตัวอักษรจากมือไปวางบนหน้าจอ
  selectLetter: (item, invIndex) => {
    // ถ้าติดสถานะ stun ห้ามกดเลือก
    if (item.status === "stun") return;
    const { selectedLetters, playerData } = get();
    const emptyIdx = selectedLetters.findIndex((s) => s === null);
    if (emptyIdx !== -1) {
      const newSelected = [...selectedLetters];
      // เก็บ originalIndex ไว้ใน item เพื่อใช้ตอนยกเลิกการเลือก
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
  // เอาตัวอักษรที่หน้าจอ กลับเข้าสู่มือ
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
  // เคลียร์ตัวอักษรทั้งหมดที่หน้าจอ
  resetSelection: () => {
    const { selectedLetters, playerData } = get();
    const itemsToReturn = selectedLetters.filter((i) => i !== null);
    if (itemsToReturn.length > 0) {
      const newInv = DeckManager.returnItems(
        playerData.inventory,
        itemsToReturn,
        playerData.unlockedSlots,
      );
      set({ playerData: { ...playerData, inventory: newInv } });
    }
    get().initSelectedLetters();
  },
  // สลับที่ตัวอักษรบนหน้าจอ
  reorderLetters: (newOrder) => {
    const { playerData } = get();
    const fullList = [
      ...newOrder,
      ...new Array(playerData.unlockedSlots - newOrder.length).fill(null),
    ];
    set({ selectedLetters: fullList });
    get().checkCurrentWord(fullList);
  },
  // เช็คว่าตัวอักษรบนหน้าจอมีความหมายจริงๆไหมในคลังคำศัพท์
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

  // -----------
  // เกมเพลย์หลัก
  // -----------
  setupGame: async (userData, stageId) => {
    // console.log("Initializing Game...", userData, "Stage ID:", stageId);
    get().reset();
    set({ gameState: "LOADING" });

    try {
      const selectedHero =
        userData?.heroes?.find((h) => h.is_selected) || userData?.heroes?.[0];
      if (userData) {
        set(() => ({
          username: userData.username,
          currentCoin: userData.money,
          userStageHistory: userData.stages || [],
        }));
      }

      if (selectedHero) {
        const { stats } = selectedHero;
        set((state) => ({
          playerData: {
            ...state.playerData,
            
            // 1. เทข้อมูล Stats ลงไปก่อน (common/rare/uncommon/power จะเข้าตรงนี้)
            ...stats,

            // 2. กำหนดค่าที่ชื่อไม่ตรงกัน หรือต้อง Override
            name: selectedHero.name,
            img_path: selectedHero.hero_id,
            level: selectedHero.level,
            next_exp: selectedHero.next_exp || 100,

            max_hp: stats?.hp || 20,
            hp: stats?.hp || 20,

            max_mana: selectedHero.ability_cost ,
            mana: 0,

            ability: {
              code: selectedHero.ability_code || null,
              cost: selectedHero.ability_cost || 0,
              description: selectedHero.ability_description || "No description",
            },
            potions: { 
              health: userData.potion.health, 
              cure: userData.potion.cure, 
              reroll: userData.potion.reroll 
            },
            speed: stats?.speed || 3,
            unlockedSlots: stats?.slot || 5,
          },
        }));
      }

      const dictRes = await fetch(`${ipAddress}/dict`);
      const dictData = await dictRes.json();

      const stageRes = await fetch(`${ipAddress}/getStageById/${stageId}`);
      const stageData = await stageRes.json();
      console.log("stageData", stageData);

      DeckManager.init();
      await delay(500);

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

  update: (dt) =>
    set((state) => {
      let updates = {};
      const ANIM_SPEED = 300;
      let newTimer = (state.animTimer || 0) + dt;

      if (newTimer >= ANIM_SPEED) {
        newTimer -= ANIM_SPEED;
        updates.animFrame = state.animFrame === 1 ? 2 : 1;
        if (state.gameState === "ADVANTURE" && state.isSfxOn) sfx.playWalk();
      }
      updates.animTimer = newTimer;

      if (state.gameState === "ADVANTURE") {
        const goal = state.stageData.distant_goal;
        if (goal && state.distance >= goal) {
          updates.distance = goal;
          const walkOutSpeed = 0.1;
          const nextX = state.playerX + dt * walkOutSpeed;
          updates.playerX = nextX;
          if (nextX > 180) {
            get().finishStage();
            return updates;
          }
        } else {
          const speed = 0.005;
          const newDist = state.distance + dt * speed;
          updates.playerX = PLAYER_X_POS;

          let nextTargetDist = Infinity;
          if (
            state.stageData &&
            state.stageData.events[state.currentEventIndex]
          ) {
            nextTargetDist =
              state.stageData.events[state.currentEventIndex].distance;
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
        mana: 0,
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
        
        max_hp: e.hp,    
        hp: e.hp,        
        power: e.power,     

        level: e.level || "A1",
        
        // --- MANA SYSTEM ---
        mana: 0, 
        quiz_move_cost: e.quiz_move_cost || 100,
        quiz_move_info: e.quiz_move_info,
        // -------------------
        
        shield: 0,
        currentStep: 1,
        selectedPattern: 1,
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
    const { playerData } = store;

    // 1. เพิ่มมานาตอนเริ่มรอบ
    const newPlayerMana = Math.min(playerData.max_mana, playerData.mana + 5);
    const updatedEnemies = store.enemies.map(e => {
      if (e.hp <= 0) return e;
      return { ...e, shield: 0, mana: Math.min(e.quiz_move_cost, e.mana + 5) };
    });

    set({ 
      enemies: updatedEnemies, 
      playerData: { ...playerData, mana: newPlayerMana, shield: 0 } 
    });

    get().addPopup({
      id: Math.random(),
      x: 30,
      y: FIXED_Y - 60,
      value: "Start new round!",
      color: "#ffffff",
    });
    await delay(500);

    // 2. คำนวณค่า Initiative เริ่มต้น
    const playerInit = Math.max(
      1,
      store.playerData.speed + (Math.floor(Math.random() * 3) - 1),
    );
    let pool = [
      { id: "player", type: "player", name: "You", initiative: playerInit },
    ];

    store.enemies
      .filter((e) => e.hp > 0)
      .forEach((e) => {
        const init = Math.max(
          1,
          (e.speed || 3) + (Math.floor(Math.random() * 3) - 1),
        );
        pool.push({ id: e.id, type: "enemy", name: e.name, initiative: init });
      });

    // 3. จัดเรียงคิวแบบเล่นคนละ 1 ครั้งเท่านั้น
    // เรียงจากมากไปน้อย ใครไวกว่าได้เล่นก่อน
    const finalQueue = pool
      .sort((a, b) => b.initiative - a.initiative)
      .map((unit, index) => ({
        ...unit,
        uniqueId: `${unit.id}_${index}_${Date.now()}`, // สร้าง Unique ID ให้แต่ละเทิร์น
      }));

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
        (e) => e.id === activeUnit.id && e.hp > 0,
      );
      if (!exists) {
        get().endTurn();
        return;
      }
      get().runEnemyTurn(activeUnit.id);
    } else {
      get().startPlayerTurn();
    }
  },

  endTurn: async () => {
    const store = get();

    if (store.activeCombatant && store.activeCombatant.type === "player") {
      const currentInv = [...store.playerData.inventory];
      const totalBleedStacks = currentInv.filter(
        (s) => s?.status === "bleed",
      ).length;
      const isBleedExploding = totalBleedStacks >= 3;
      let totalPoisonDmg = 0;
      let hasInventoryUpdate = false;

      const updatedInv = currentInv.map((slot) => {
        if (!slot) return slot;
        if (slot.status === "poison") {
          hasInventoryUpdate = true;
          const dmg = Math.floor(store.playerData.max_hp * 0.1);
          totalPoisonDmg += Math.max(1, dmg);
          const newDuration = slot.statusDuration - 1;
          return newDuration <= 0
            ? { ...slot, status: null, statusDuration: 0 }
            : { ...slot, statusDuration: newDuration };
        }
        if (slot.status === "stun" || slot.status === "blind") {
          hasInventoryUpdate = true;
          const newDuration = slot.statusDuration - 1;
          return newDuration <= 0
            ? { ...slot, status: null, statusDuration: 0 }
            : { ...slot, statusDuration: newDuration };
        }
        if (slot.status === "bleed") {
          hasInventoryUpdate = true;
          if (isBleedExploding)
            return { ...slot, status: null, statusDuration: 0 };
          else {
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
          const bleedDmg = Math.floor(store.playerData.max_hp * 0.3);
          get().addPopup({
            id: Math.random(),
            x: PLAYER_X_POS,
            y: FIXED_Y - 60,
            value: "BLOOD EXPLOSION!",
            color: "#c0392b",
            fontSize: "20px",
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

  handleWaveClear: async () => {
    const store = get();
    set({ gameState: "WAVE_CLEARED", playerShoutText: "Victory!" });
    await delay(2000);
    const nextEventIdx = store.currentEventIndex + 1;
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

  finishStage: async () => {
    const store = get();
    if (store.gameState === "LOADING" || store.gameState === "GAME_CLEARED")
      return;

    bgm.stop();
    set({ gameState: "LOADING", playerShoutText: "Saving..." });

    try {
      const token = localStorage.getItem("token");
      const currentStageId = store.stageData.id;

      // 1. เงินจากมอนสเตอร์ (ที่มีอยู่ใน receivedCoin อยู่แล้ว ไม่ต้องไปยุ่งกับมัน)
      const monsterMoney = store.receivedCoin || 0;

      // 2. เช็คว่าผ่านครั้งแรกไหม
      const stageRecord = store.userStageHistory.find(
        (s) => s.stage_id === currentStageId
      );
      const isFirstClear = !stageRecord || !stageRecord.is_completed;
      
      const stageReward = isFirstClear ? (store.stageData.money_reward || 0) : 0;

      // 3. รวมเงินทั้งหมดเพื่อส่ง Server (เงินในกระเป๋า + มอนสเตอร์ + รางวัล)
      const totalMoney = (store.currentCoin || 0) + monsterMoney + stageReward;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // ส่งยอดเงินรวม
      await fetch(`${ipAddress}/update-money`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ money: totalMoney }),
      });

      // ปลดล็อกด่าน
      const unlockRes = await fetch(`${ipAddress}/complete-stage`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ currentStageId: currentStageId }),
      });

      if (!unlockRes.ok) {
        const unlockData = await unlockRes.json();
        throw new Error(unlockData.message || "Failed to unlock stage");
      }

      set({ 
          gameState: "GAME_CLEARED",
      });

    } catch (error) {
      console.error("Save Game Error:", error);
      set({ gameState: "GAME_CLEARED", playerShoutText: "Error Saving!" });
    }
  },
  
  saveQuitGame: async (earnedAmount) => {
    const store = get();
    try {
      const token = localStorage.getItem("token");
      const totalMoney = (store.currentCoin || 0) + earnedAmount;
      
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // ยิง API อัปเดตเงินอย่างเดียว
      await fetch(`${ipAddress}/update-money`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ money: totalMoney }),
      });
      
      console.log("Money saved on Quit/Loss:", earnedAmount);
    } catch (error) {
      console.error("Save Money Error:", error);
    }
  },

  startPlayerTurn: () => {
    const store = get();
    const currentInv = [...store.playerData.inventory];
    const filledInv = DeckManager.fillEmptySlots(
      currentInv,
      [], 
      store.playerData.unlockedSlots
    );

    set((s) => ({
      gameState: "PLAYERTURN",
      playerVisual: "idle",
      playerData: { ...s.playerData, inventory: filledInv },
    }));
  },

  performPlayerAction: async (actionType, word, targetId, usedIndices) => {
    const store = get();

    // 1. Calculate Damage
    let totalDmgRaw = 0;
    for (let char of word)
      totalDmgRaw += getLetterDamage(char, store.playerData.power);
    const totalDmg = chanceRound(totalDmgRaw);

    // 2. Logging
    const { dictionary, wordLog } = store;
    const lowerWord = word.toLowerCase();
    const vocabData = dictionary.find(
      (v) => v.word.toLowerCase() === lowerWord,
    );
    if (vocabData) {
      const existingEntry = wordLog[lowerWord] || {
        word: vocabData.word,
        meaning: vocabData.meaning,
        type: vocabData.category || vocabData.type || "-",
        count: 0,
        totalDamage: 0,
      };
      set({
        wordLog: {
          ...wordLog,
          [lowerWord]: {
            ...existingEntry,
            count: existingEntry.count + 1,
            totalDamage: existingEntry.totalDamage + totalDmg,
          },
        },
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
      store.playerData.unlockedSlots,
    );

    set((s) => ({
      playerShoutText: actionType,
      gameState: "ACTION",
      playerVisual: "idle",
      playerData: { ...s.playerData, inventory: currentInv },
    }));

    await delay(300);

    // 4. Action Logic
    if (actionType === "Guard") {
      set({
        playerVisual: "guard-1",
        playerData: {
          ...store.playerData,
          shield: store.playerData.shield + totalDmg,
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
      get().gainMana(5);
      await delay(500);
    } else if (actionType === "Strike") {
      const target = get().enemies.find((e) => e.id === targetId);
      if (target) {
        set({ playerX: target.x - 10, playerVisual: "walk" });
        await delay(200);
        set({ playerVisual: "attack-1" });
        await delay(400);
        if (store.isSfxOn) sfx.playHit();
        set({ playerVisual: "attack-2" });
        get().damageEnemy(targetId, totalDmg);
        get().gainMana(5);
        await delay(400);
      }
      set({ playerX: PLAYER_X_POS, playerVisual: "walk" });
      await delay(500);
    }

    set({ playerVisual: "idle", playerShoutText: "" });
    get().endTurn();
  },

  usePotion: (type, value = 0) => {
    const store = get();
    const { playerData, isSfxOn } = store;
    const { potions } = playerData;

    if (type === "health") {
      if (potions.health <= 0) return;
      const newHp = Math.min(playerData.max_hp, playerData.hp + value);

      // Play Sound/Popup
      if (isSfxOn) sfx.playHeal && sfx.playHeal(); 
      store.addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 80,
        value: `+${value} HP`,
        color: "#2ecc71",
      });

      set({
        playerData: {
          ...playerData,
          hp: newHp,
          potions: { ...potions, health: potions.health - 1 },
        },
      });
    } else if (type === "cure") {
      if (potions.cure <= 0) return;

      const currentInv = [...playerData.inventory];
      const newInv = currentInv.map((item) => {
        if (!item || !item.status) return item;
        // ลด Duration ลง 1
        const newDuration = item.statusDuration - 1;
        // ถ้าเหลือ 0 หรือน้อยกว่า ให้ลบสถานะออก
        return newDuration <= 0
          ? { ...item, status: null, statusDuration: 0 }
          : { ...item, statusDuration: newDuration };
      });

      // Play Sound/Popup
      // if (isSfxOn) sfx.playBuff(); // ถ้ามีเสียง Buff
      store.addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 80,
        value: "CLEANSED!",
        color: "#3498db",
      });

      set({
        playerData: {
          ...playerData,
          inventory: newInv,
          potions: { ...potions, cure: potions.cure - 1 },
        },
      });
    } else if (type === "reroll") {
      if (potions.reroll <= 0) return;
      // Reroll logic จะทำงานต่อใน GameApp แต่เราต้องตัดจำนวนยาที่นี่
      set({
        playerData: {
          ...playerData,
          potions: { ...potions, reroll: potions.reroll - 1 },
        },
      });
    }
  },

  actionSpin: async (newInventory) => {
    const store = get();
    set((s) => ({
      playerData: { ...s.playerData, inventory: newInventory },
      playerShoutText: "SPIN!",
      gameState: "ACTION",
    }));
    await delay(600);
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },
  passTurn: async () => {
    // 1. เรียก store เพื่อเข้าถึงข้อมูลปัจจุบัน
    const store = get(); 
    
    // เคลียร์การเลือกบนหน้าจอ
    store.resetSelection();

    const slots = store.playerData.unlockedSlots;
    const currentInventory = store.playerData.inventory; 

    // 2. สุ่มของใหม่มาเตรียมไว้
    let newInventory = DeckManager.generateList(slots);

    // 3. (สำคัญ) วนลูปเอาสถานะจากของเก่า มาแปะใส่ของใหม่ ในตำแหน่งเดิม 
    newInventory = newInventory.map((newItem, index) => {
      const oldItem = currentInventory[index];
      
      // ถ้าช่องเดิมมีของ และมีสถานะติดอยู่
      if (oldItem && oldItem.status) {
        return {
          ...newItem, // ใช้ตัวอักษรใหม่/ID ใหม่
          status: oldItem.status, // แต่เอาสถานะเดิมมาใส่
          statusDuration: oldItem.statusDuration // เอาระยะเวลาเดิมมาใส่
        };
      }
      
      // ถ้าไม่มีสถานะ ก็ใช้ของใหม่เพียวๆ
      return newItem;
    });

    // 4. แสดง Effect
    set({ playerShoutText: "PASS!", gameState: "ACTION" });
    await delay(500);

    // 5. อัปเดต Inventory ที่รวมร่างแล้วลง State
    set((s) => ({
      playerData: { ...s.playerData, inventory: newInventory },
      playerShoutText: "",
    }));

    // 6. จบเทิร์น (เพื่อให้สถานะ Poison/Burn ทำงานลดเลือด หรือลด Duration ลง)
    get().endTurn();
  },

  performPlayerSkill: async (manualTargetId = null) => {
    const store = get();
    const { playerData, isSfxOn, selectedLetters } = store;
    const { ability, mana } = playerData;

    // 1. Validation Checks
    if (!ability || !ability.code) return;

    if (mana < ability.cost) {
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 80,
        value: "Not enough Mana!",
        color: "#555555",
        fontSize: "20px",
      });
      return;
    }

    const activeLetters = selectedLetters.filter((l) => l !== null);
    if (activeLetters.length === 0) {
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 80,
        value: "Need Word!",
        color: "#ff5555",
        fontSize: "20px",
      });
      return;
    }

    // 2. Consume Resources
    const newMana = mana - ability.cost;
    set({ playerData: { ...playerData, mana: newMana } });

    // 3. Calculate Base Damage (with Rounding)
    let rawDmg = 0;
    activeLetters.forEach((l) => {
      rawDmg += getLetterDamage(l.char, playerData.power);
    });
    // Apply chanceRound to base damage
    let totalDmg = chanceRound(rawDmg);

    // 4. Resolve Target
    let targetId = manualTargetId || store.hoveredEnemyId;
    if (!targetId && ability.code !== "Expolsion") {
      const firstEnemy = store.enemies.find((e) => e.hp > 0);
      targetId = firstEnemy ? firstEnemy.id : null;
    }

    // 5. Execute Skill Logic & Animation
    set({ playerShoutText: ability.code, playerVisual: "guard-1" });
    if (isSfxOn) sfx.playBlock();
    await delay(500);

    switch (ability.code) {
      case "Holy Shield":
        if (targetId) {
          const target = store.enemies.find((e) => e.id === targetId);
          if (target) {
            set({ playerX: target.x - 12, playerVisual: "walk" });
            await delay(400);
            set({ playerVisual: "attack-1" });
            await delay(200);
            if (isSfxOn) sfx.playHit();
            get().damageEnemy(targetId, totalDmg); // Uses rounded totalDmg
          }
        }

        set({ playerVisual: "guard-1" });
        await delay(200);
        if (isSfxOn) sfx.playBlock();
        set((s) => ({
          playerData: {
            ...s.playerData,
            shield: s.playerData.shield + totalDmg, // Uses rounded totalDmg
          },
        }));
        get().addPopup({
          id: Math.random(),
          x: PLAYER_X_POS,
          y: FIXED_Y - 60,
          value: `+${totalDmg} SHIELD`,
          color: "#2e75cc",
        });
        await delay(500);
        set({ playerX: PLAYER_X_POS, playerVisual: "walk" });
        await delay(400);
        break;

      case "Shadow Slash":
        if (targetId) {
          const target = store.enemies.find((e) => e.id === targetId);
          if (target) {
            if (activeLetters.length > 0) {
              const firstChar = activeLetters[0].char;
              const bonus = getLetterDamage(firstChar, playerData.power);
              totalDmg = chanceRound(rawDmg + bonus);
            }

            set({ playerX: target.x - 5, playerVisual: "attack-2" });
            if (isSfxOn) sfx.playHit();
            get().damageEnemy(targetId, totalDmg);
            get().addPopup({
              id: Math.random(),
              x: PLAYER_X_POS,
              y: FIXED_Y - 90,
              value: "CRIT!",
              color: "#e67e22",
              fontSize: "24px",
            });
            await delay(400);
            set({ playerX: PLAYER_X_POS, playerVisual: "idle" });
          }
        }
        break;

      case "Bat Ambush":
        if (targetId) {
          const target = store.enemies.find((e) => e.id === targetId);
          if (target) {
            // 1. เดินไปหาศัตรู
            set({ playerX: target.x - 12, playerVisual: "walk" });
            await delay(400);
            // 2. โจมตี
            set({ playerVisual: "attack-1" });
            await delay(200);
            set({ playerVisual: "attack-2" });
            if (isSfxOn) sfx.playHit();
            // 3. สร้างความเสียหาย
            get().damageEnemy(targetId, totalDmg);
            // 4. คำนวณดูดเลือด (50%)
            const healAmount = Math.floor(totalDmg * 0.5);
            // 5. เพิ่มเลือด (แก้บั๊ก NaN)
            if (healAmount > 0) {
                set((s) => {
                    // แปลงเป็น Number เพื่อกันค่า NaN
                    const currentHp = Number(s.playerData.hp) || 0;
                    // เช็คชื่อตัวแปรให้ครบ (max_hp หรือ maxHp)
                    const maxHpVal = Number(s.playerData.max_hp) || Number(s.playerData.maxHp) || 20;
                    return {
                        playerData: {
                            ...s.playerData,
                            hp: Math.min(maxHpVal, currentHp + healAmount)
                        }
                    };
                });
                // แสดงตัวเลขสีเขียว
                get().addPopup({
                    id: Math.random(),
                    x: PLAYER_X_POS,
                    y: FIXED_Y - 60,
                    value: `+${healAmount} HP`,
                    color: "#2ecc71",
                });
            }
            await delay(500);
            // 6. เดินกลับมาที่เดิม
            set({ playerX: PLAYER_X_POS, playerVisual: "walk" });
            await delay(400);
          }
        }
        break;

      case "Expolsion":
        set({ playerVisual: "attack-2" });
        await delay(300);
        if (isSfxOn) sfx.playHit();
        store.enemies.forEach((e) => {
          if (e.hp > 0) {
            get().damageEnemy(e.id, totalDmg); 
          }
        });
        await delay(300);
        break;

      default:
        console.log("Unknown ability:", ability.code);
        if (targetId) get().damageEnemy(targetId, totalDmg);
    }

    // 6. Cleanup & End Turn
    const currentInv = [...store.playerData.inventory];
    activeLetters.forEach((item) => {
      if (item && item.originalIndex !== undefined)
        currentInv[item.originalIndex] = null;
    });
    const filledInv = DeckManager.fillEmptySlots(
      currentInv,
      [],
      store.playerData.unlockedSlots,
    );

    set((s) => ({
      playerData: { ...s.playerData, inventory: filledInv },
      selectedLetters: new Array(s.playerData.unlockedSlots).fill(null),
      validWordInfo: null,
    }));

    await delay(300);
    set({ playerVisual: "idle", playerShoutText: "" });
    get().endTurn();
  },

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

    // --- MANA GAIN ON HIT (Pain Gain) ---
    const newMana = Math.min(target.quiz_move_cost, target.mana + finalDmg); 
    // ------------------------------------

    get().updateEnemy(id, { hp: newHp, mana: newMana });
    get().addPopup({
      id: Math.random(),
      x: target.x - 2,
      y: FIXED_Y - 80,
      value: finalDmg,
      color: "#cc2e2e",
    });
    if (newHp <= 0)
      set((state) => ({
        receivedCoin: state.receivedCoin + (target.exp || 0),
      }));
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
      get().gainMana(remainingDmg);
    }
    if (newHp <= 0) {
      bgm.stop();
      set({ gameState: "OVER" });
    }
  },

  applyStatusToPlayer: (code, chance, count, turn) => {
    if (!code) return;
    const roll = Math.floor(Math.random() * 100);
    if (roll >= chance) {
      console.log("Status missed!", roll, chance);
      return;
    }

    const store = get();
    const currentInv = [...store.playerData.inventory];
    const availableSlots = currentInv
      .map((s, i) => (s && !s.status ? i : null))
      .filter((i) => i !== null);

    if (availableSlots.length > 0) {
      const targets = [];
      for (let i = 0; i < count; i++) {
        if (availableSlots.length === 0) break;
        const randIndex = Math.floor(Math.random() * availableSlots.length);
        targets.push(availableSlots.splice(randIndex, 1)[0]);
      }

      targets.forEach((idx) => {
        if (currentInv[idx]) {
          currentInv[idx] = {
            ...currentInv[idx],
            status: code.toLowerCase(),
            statusDuration: turn,
          };
        }
      });

      const debuffColors = {
        POISON: "#2ecc71",
        BLEED: "#e74c3c",
        BLIND: "#8e44ad",
        STUN: "#f1c40f",
      };

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

  performEnemySkill: async (enemyId) => {
    const store = get();
    const en = store.enemies.find(e => e.id === enemyId);
    if (!en || !en.quiz_move_info) return;

    const moveData = en.quiz_move_info;

    // 1. Reset Mana & Shout Skill Name
    get().updateEnemy(en.id, { mana: 0, shoutText: moveData.name || "ULTIMATE!" });
    await delay(800); 

    // 2. Animation (Dash In)
    const atkX = en.isBoss ? PLAYER_X_POS + 15 : PLAYER_X_POS + 10;
    const originalX = en.x;
    get().updateEnemy(en.id, { x: atkX, atkFrame: 1 });
    await delay(400);

    // 3. Execute Quiz Move
    const rawAtk = en.power;
    const finalValue = Math.floor((rawAtk * (moveData.power || 0)) / 100);

    await get().handleQuizMove(en, finalValue, moveData);

    // 4. Return to Position
    get().updateEnemy(en.id, { x: originalX, atkFrame: 0, shoutText: "" });
    await delay(300);
  },

  runEnemyTurn: async (enemyId) => {
    const store = get();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });
    
    let en = store.enemies.find((e) => e.id === enemyId);
    if (!en || en.hp <= 0) {
      get().endTurn();
      return;
    }
    get().updateEnemy(en.id, { shield: 0 });

    // ⭐ CHECKPOINT 1: ตรวจสอบ Mana ต้นเทิร์น
    if (en.mana >= en.quiz_move_cost && en.quiz_move_info) {
        await get().performEnemySkill(en.id);
        en = get().enemies.find((e) => e.id === enemyId);
        if (get().playerData.hp <= 0) {
              bgm.stop(); set({ gameState: "OVER" }); return;
        }
    }

    const actionObj = en.pattern_list?.find(
      (p) => p.pattern_no === en.selectedPattern && p.order === en.currentStep,
    );

    if (!actionObj || !actionObj.move) {
      get().updateEnemy(en.id, { shoutText: "..." });
      await delay(800);
      get().endTurn();
      return;
    }

    const moveData = actionObj.move;
    let wordDamageRaw = 0; 

    // 🆕 ⭐ ENEMY STEAL & SPELL LOGIC
    if (moveData.type === "ATTACK" && !moveData.is_quiz) {
      const currentInv = [...store.playerData.inventory];
      const availableItems = currentInv.filter(item => item !== null);
      
      const { bestWord, usedItems } = findBestWordFromLetters(availableItems, store.dictionary, en.power);

      if (bestWord) {
        get().updateEnemy(en.id, { shoutText: moveData.name || "STRIKE!" });
        await delay(600);
        get().updateEnemy(en.id, { shoutText: "" });
        let newInv = [...currentInv];
        let enemySelectedArea = new Array(store.playerData.unlockedSlots).fill(null);

        // 1. จังหวะดึงตัวอักษรขึ้น Selected Area ทีละตัว
        for (let i = 0; i < usedItems.length; i++) {
          const targetItem = usedItems[i];
          const invIdx = newInv.findIndex(item => item?.id === targetItem.id);
          
          if (invIdx !== -1) {
            const char = targetItem.char.toUpperCase();
            wordDamageRaw += ENEMY_POWER_MAP[char] || 0.5;

            enemySelectedArea[i] = { ...newInv[invIdx], originalIndex: invIdx };
            
            const oldItem = newInv[invIdx];
            newInv[invIdx] = oldItem.status ? { 
              ...oldItem, char: "", id: `stolen_${Math.random()}`, visible: false 
            } : null;

            set({ 
              selectedLetters: [...enemySelectedArea],
              playerData: { ...store.playerData, inventory: [...newInv] } 
            });

            if (store.isSfxOn) sfx.playWalk();
            await delay(500); 
          }
        }

        // 2. ✅ แสดงคำแปล (MeaningPopup) ทันทีที่เรียงครบ
        const wordData = store.dictionary.find(d => d.word.toLowerCase() === bestWord.toLowerCase());
        set({ validWordInfo: wordData || { word: bestWord, meaning: "???" } });

        // 3. ✅ แสดงชื่อคำศัพท์บนหัวศัตรู 2 วินาที (เพื่อให้สอดคล้องกับเวลาอ่านคำแปล)
        await delay(1000); 

        // 4. ✅ เอาความหมายและตัวอักษรออก
        set({ validWordInfo: null });
        store.initSelectedLetters();

        // 5. ✅ ป๊อปอัพคำพูดศัตรูก่อนโจมตี (ค้างไว้ 1 วิ)
        get().updateEnemy(en.id, { shoutText: bestWord.toUpperCase() });
        await delay(1000); 

      } else {
        // กรณีหาคำไม่ได้: PASS
        get().updateEnemy(en.id, { shoutText: "PASS..." });
        await delay(1000);
        let nextStep = en.currentStep + 1;
        if (!en.pattern_list?.some(p => p.pattern_no === en.selectedPattern && p.order === nextStep)) nextStep = 1;
        get().updateEnemy(en.id, { currentStep: nextStep });
        get().endTurn();
        return; 
      }
    } else {
      // ท่าที่ไม่ใช่การขโมยตัวอักษร
      get().updateEnemy(en.id, { shoutText: moveData.name || "ATTACK!" });
      await delay(1000); // แสดงชื่อท่า 1 วิ เหมือนกัน
    }

    // --- 6. EXECUTE ATTACK (เริ่มพุ่งโจมตี) ---
    const originalX = en.x;
    if (moveData.is_dash) {
      const atkX = en.isBoss ? PLAYER_X_POS + 15 : PLAYER_X_POS + 10;
      get().updateEnemy(en.id, { x: atkX, atkFrame: 1 });
      await delay(400);
    } else {
      get().updateEnemy(en.id, { atkFrame: 1 });
      await delay(400);
    }

    const finalValue = chanceRound((wordDamageRaw * (moveData.power || 100)) / 100);
    
    if (moveData.is_quiz) {
      await get().handleQuizMove(en, finalValue, moveData);
    } else {
      get().updateEnemy(en.id, { atkFrame: 2 });
      if (moveData.type === "ATTACK") {
        if (finalValue > 0) {
          get().damagePlayer(finalValue);
          if (store.isSfxOn) sfx.playHit();
          
          en = get().enemies.find((e) => e.id === enemyId); 
          const newMana = Math.min(en.quiz_move_cost, en.mana + 10);
          get().updateEnemy(en.id, { mana: newMana });
        }
        if (moveData.debuff_code) {
          get().applyStatusToPlayer(
            moveData.debuff_code, moveData.debuff_chance, moveData.debuff_count, moveData.debuff_turn
          );
        }
      } else if (moveData.type === "HEAL") {
        get().updateEnemy(en.id, { hp: Math.min(en.max_hp, en.hp + finalValue) });
      } else if (moveData.type === "GUARD") {
        get().updateEnemy(en.id, { shield: (en.shield || 0) + finalValue });
      }
      await delay(500);
    }

    // จบการโจมตี
    if (moveData.is_dash) {
      get().updateEnemy(en.id, { x: originalX, atkFrame: 0 });
    } else {
      get().updateEnemy(en.id, { atkFrame: 0 });
    }

    // ⭐ CHECKPOINT 2: Mana หลังจบการกระทำ
    en = get().enemies.find((e) => e.id === enemyId);
    if (en.mana >= en.quiz_move_cost && en.quiz_move_info) {
        await delay(200);
        await get().performEnemySkill(en.id);
        if (get().playerData.hp <= 0) { bgm.stop(); set({ gameState: "OVER" }); return; }
    }

    // อัปเดตสถานะเทิร์นถัดไป
    en = get().enemies.find((e) => e.id === enemyId); 
    let nextStep = en.currentStep + 1;
    let nextPattern = en.selectedPattern;
    const hasNext = en.pattern_list?.some(p => p.pattern_no === en.selectedPattern && p.order === nextStep);

    if (!hasNext) {
       nextStep = 1;
       const uniquePatterns = [...new Set(en.pattern_list?.map(p => p.pattern_no) || [])];
       if (uniquePatterns.length > 1) {
           nextPattern = uniquePatterns[Math.floor(Math.random() * uniquePatterns.length)];
       }
    }

    get().updateEnemy(en.id, { shoutText: "", currentStep: nextStep, selectedPattern: nextPattern });
    if (get().playerData.hp <= 0) { bgm.stop(); set({ gameState: "OVER" }); return; }
    get().endTurn();
  },

  handleQuizMove: async (en, penaltyDmg, moveData) => {
    const store = get();
    const vocabList = store.dictionary;
    let candidateWords = vocabList;
    if (candidateWords.length === 0) candidateWords = vocabList;
    const correctEntry =
      candidateWords[Math.floor(Math.random() * candidateWords.length)];
    const choices = vocabList
      .filter((v) => v.word !== correctEntry.word)
      .map((v) => ({
        ...v,
        score: WordSystem.getLevenshteinDistance(correctEntry.word, v.word),
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((w) => w.word);
    const finalChoices = [correctEntry.word, ...choices].sort(
      () => 0.5 - Math.random(),
    );
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
    const isCorrect = await new Promise((resolve) =>
      set({ quizResolver: resolve }),
    );
    set({ gameState: "ENEMYTURN" });
    if (isCorrect) {
      get().updateEnemy(en.id, { atkFrame: 2 });
      set({ playerX: PLAYER_X_POS - 5, playerVisual: "walk" });
      if (store.isSfxOn) sfx.playMiss();
      get().updateEnemy(en.id, { shoutText: "MISSED!" });
    } else {
      get().updateEnemy(en.id, { atkFrame: 2 });
      if (store.isSfxOn) sfx.playHit();
      get().damagePlayer(penaltyDmg);
      if (moveData.debuff_code) {
        get().applyStatusToPlayer(
          moveData.debuff_code,
          moveData.debuff_chance,
          moveData.debuff_count,
          moveData.debuff_turn,
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