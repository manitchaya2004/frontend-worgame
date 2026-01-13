// src/store/useGameStore.js
import { create } from "zustand";
import { PLAYER_X_POS, FIXED_Y, ipAddress } from "../const/index";
import { getLetterDamage } from "../const/letterValues"; // ✅ เรียกใช้สูตร * 0.5 จากไฟล์นี้
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

// ✅ HELPER: คำนวณโบนัส (ทุก 1 แต้มที่เกิน 10 นับเป็น 1 Bonus)
const getStatBonus = (val) => Math.max(0, val - 10);

// ============================================================================
// 📦 MAIN STORE
// ============================================================================

export const useGameStore = create((set, get) => ({
  // --------------------------------------------------------------------------
  // 🟢 STATE: GLOBAL
  // --------------------------------------------------------------------------
  gameState: "ADVANTURE",
  damagePopups: [],
  dictionary: [],
  stageData: [],
  distance: 0,
  loadingProgress: 0,

  // Animation Control
  animTimer: 0,
  animFrame: 1,
  hasSpawnedEnemies: false,

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
    // Base Stats (1-20)
    stats: {
      STR: 20, // Modifier ไปคูณ 0.5 ใน getLetterDamage
      CON: 20, // +2 HP per point
      INT: 20, // +1 Slot per point
      DEX: 10, // +1 Speed per point
      FAITH: 20, // +1 RP per point
      LUCK: 10, // +2% Crit per point
    },
    // Derived Stats
    max_hp: 8,
    hp: 8,
    shield: 0,
    max_rp: 3,
    rp: 3,
    speed: 6,
    unlockedSlots: 10,
    critChance: 0,
    inventory: [],
  },
  playerX: PLAYER_X_POS,
  playerShoutText: "",
  playerVisual: "idle",
  isGuarding: false,
  actionPhase: "IDLE",

  // ==========================================================================
  // ⚡ ACTIONS: SYSTEM
  // ==========================================================================

  recalculatePlayerStats: () => {
    set((state) => {
      const s = state.playerData.stats;
      const lvl = state.playerData.level || 1;

      const conBonus = getStatBonus(s.CON);
      const intBonus = getStatBonus(s.INT);
      const dexBonus = getStatBonus(s.DEX);
      const faithBonus = getStatBonus(s.FAITH);
      const luckBonus = getStatBonus(s.LUCK);

      // 1. HP: Base 8 + (CON Bonus * 2) + (Level * 3)
      const newMaxHp = 8 + conBonus * 2 + lvl * 3;

      // ✅ แก้ไข: คำนวณเลือดปัจจุบันใหม่ โดยบวกส่วนต่างที่เพิ่มขึ้นเข้าไป
      const oldMaxHp = state.playerData.max_hp || 8;
      const hpDiff = newMaxHp - oldMaxHp;
      // เลือดใหม่ = เลือดเก่า + ส่วนต่าง (แต่ไม่เกิน Max ใหม่ และไม่ต่ำกว่า 0)
      const newCurrentHp = Math.max(0, Math.min(newMaxHp, state.playerData.hp + hpDiff));

      // 2. Slots: Base 10 + (INT Bonus) + (Level / 2)
      const newSlots = Math.min(20, 10 + intBonus + Math.floor(lvl / 2));

      // 3. Speed: Base 6 + (DEX Bonus)
      const newSpeed = Math.max(1, 6 + dexBonus);

      // 4. RP: Base 1 + (FAITH Bonus)
      const newMaxRp = 1 + faithBonus;

      // 5. Crit: Base 5% + (LUCK Bonus * 2%)
      const newCrit = Math.min(100, 5 + luckBonus * 2);

      return {
        playerData: {
          ...state.playerData,
          max_hp: newMaxHp,
          hp: newCurrentHp, // ✅ ใช้ค่าที่คำนวณใหม่
          unlockedSlots: newSlots,
          speed: newSpeed,
          max_rp: newMaxRp,
          critChance: newCrit,
        },
      };
    });
  },

  // ... (initializeGame, update, etc. คงเดิม) ...

initializeGame: async (userData, stageData) => {
    
    // ✅ 1. Console Log ดูค่าที่ส่งมา
    console.log("====================================");
    console.log("🚀 START INITIALIZE GAME");
    console.log("👤 User Data:", userData);
    console.log("🗺️ Stage Data:", stageData);
    console.log("====================================");
    set({ loadingProgress: 0, gameState: "LOADING" });
    try {
      const dictRes = await fetch(`${ipAddress}/dict`);
      const dictData = await dictRes.json();
      const stageRes = await fetch(`${ipAddress}/getStageById/green-grass-1`);
      const stageRaw = await stageRes.json();

      const groupedEvents = {};
      if (Array.isArray(stageRaw)) {
        stageRaw.forEach((data) => {
          const dist = Number(data.distant_spawn);
          if (!groupedEvents[dist]) groupedEvents[dist] = [];
          const availablePatterns = data.pattern_list
            ? [...new Set(data.pattern_list.map((p) => p.pattern_no))]
            : [1];
          const selectedPatternNo =
            availablePatterns[
              Math.floor(Math.random() * availablePatterns.length)
            ];
          groupedEvents[dist].push({
            ...data,
            id: data.event_id || Math.random(),
            hp: data.max_hp || 10,
            maxHp: data.max_hp || 10,
            x: 0,
            currentStep: 1,
            selectedPattern: selectedPatternNo,
            atkFrame: 0,
            shoutText: "",
            patternList: data.pattern_list || [],
            speed: data.speed || 3,
          });
        });
      }
      const sortedStageEvents = Object.keys(groupedEvents)
        .map((key) => Number(key))
        .sort((a, b) => a - b)
        .map((dist) => ({ distance: dist, monsters: groupedEvents[dist] }));

      DeckManager.init();
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

        // ✅ เช็คแค่ว่า "ถึงหรือยัง" (ไม่ต้องมี Pre-spawn)
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

    const enemiesWithPos = waveData.map((e, i) => ({
      ...e,
      x: 85 - i * 15,
      hp: e.max_hp,
      shield: 0,
      currentStep: 1,
      selectedPattern: e.selectedPattern || 1,
    }));

    set({
      enemies: enemiesWithPos,
      playerData: {
        ...store.playerData,
        rp: store.playerData.max_rp,
        inventory: loot,
      },
    });

    // ✅ ถ้า autoStart เป็น true ค่อยเริ่ม (ใช้กรณี Debug หรืออื่นๆ)
    // แต่ปกติเราจะไปเรียก startCombatRound ตอนเดินถึงเป้าหมายแทน
    if (autoStart) {
        get().startCombatRound();
    }
  },

  startCombatRound: async () => {
    const store = get();
    set({ playerShoutText: "New Round!", gameState: "PROCESSING_QUEUE" });
    await delay(1000);
    set({ playerShoutText: "" });
    const playerSpeed = store.playerData.speed;
    const playerInit = Math.max(
      1,
      playerSpeed + (Math.floor(Math.random() * 3) - 1)
    );
    let pool = [
      {
        id: "player",
        type: "player",
        name: "You",
        initiative: playerInit,
        originalInitiative: playerInit,
        uniqueId: `player-${Math.random()}`,
      },
    ];
    store.enemies
      .filter((e) => e.hp > 0)
      .forEach((e) => {
        const baseSpeed = e.speed || 3;
        const init = Math.max(
          1,
          baseSpeed + (Math.floor(Math.random() * 3) - 1)
        );
        pool.push({
          id: e.id,
          type: "enemy",
          name: e.name,
          initiative: init,
          originalInitiative: init,
          uniqueId: `${e.id}-${Math.random()}`,
        });
      });
    const minInitiativeInRound = Math.min(...pool.map((u) => u.initiative));
    const finalQueue = [];
    while (pool.length > 0) {
      pool.sort((a, b) => b.initiative - a.initiative);
      const winner = pool.shift();
      finalQueue.push(winner);
      const nextInit = Math.floor(winner.initiative / 2);
      if (nextInit > minInitiativeInRound)
        pool.push({
          ...winner,
          initiative: nextInit,
          uniqueId: `${winner.id}-${Math.random()}`,
        });
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
        shield: 0,
        inventory: newInventory,
      },
    }));
    get().addPopup({
      id: Math.random(),
      x: PLAYER_X_POS,
      y: FIXED_Y - 90,
      value: "YOUR TURN",
      isPlayer: true,
    });
  },

  // 🛡️ ACTION: ATTACK & SHIELD
  performPlayerAction: async (actionType, word, targetId, usedIndices) => {
    const store = get();
    
    // 1. Consume Inventory & Refill
    // ลบตัวอักษรที่ใช้แล้วออกจากกระเป๋า แล้วสุ่มเติมใหม่ทันที
    const activeSlots = store.playerData.unlockedSlots;
    const currentInv = [...store.playerData.inventory];
    usedIndices.forEach((idx) => { currentInv[idx] = null; });
    for (let i = 0; i < activeSlots; i++) {
      if (currentInv[i] === null) currentInv[i] = DeckManager.createItem(i);
    }

    // อัปเดต State เพื่อเริ่มอนิเมชั่น
    set((s) => ({
      playerShoutText: actionType,
      gameState: "ACTION",
      playerVisual: "idle",
      playerData: {
        ...s.playerData,
        inventory: currentInv, 
      },
    }));

    await delay(300);

    const wordLength = word.length;
    
    // ✅ 1. ดึงค่า STR Bonus (ทุก 1 แต้มที่เกิน 10 นับเป็น 1 Bonus)
    // ฟังก์ชัน getStatBonus = (val) => Math.max(0, val - 10);
    const strBonus = getStatBonus(store.playerData.stats.STR);

    // ✅ 2. Modifier ที่จะส่งให้ getLetterDamage (ใช้แค่ STR ไม่รวม Level)
    const totalModifier = strBonus; 

    // 🛡️ SHIELD ACTION
    if (actionType === "SHIELD") {
       // สูตรโล่: (Length * 1.5) + STR Bonus
       const shieldAmount = Math.floor((wordLength * 1.5) + totalModifier);
       
       set({ playerVisual: "guard-1" });
       set((s) => ({ playerData: { ...s.playerData, shield: s.playerData.shield + shieldAmount } }));
       
       // แสดง Popup สีเขียว (ไม่ระบุ isPlayer: true จะเป็นสีเขียว/ขาวตาม Default)
       get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: `+${shieldAmount} DEF`, isPlayer: false });
       
       await delay(500); 
       set({ playerVisual: "idle" });
    }
    // ⚔️ ATTACK ACTION
    else if (actionType === "ATTACK") {
       const originalX = PLAYER_X_POS;
       if (targetId) {
         const target = get().enemies.find(e => e.id === targetId);
         if (target) {
            // เดินไปหาศัตรู
            set({ playerX: target.x - 10, playerVisual: "walk" }); 
            await delay(200);

            let totalDmg = 0;
            
            // ✅ Loop คำนวณดาเมจทีละตัวอักษร
            // สูตรข้างใน getLetterDamage คือ: Base + (totalModifier * 0.5)
            for (let char of word) {
                totalDmg += getLetterDamage(char, totalModifier);
            }
            
            totalDmg = Math.floor(totalDmg);

            // คำนวณ Critical (LUCK)
            const isCrit = Math.random() * 100 < store.playerData.critChance;
            if (isCrit) {
                totalDmg = Math.floor(totalDmg * 2);
                get().addPopup({ id: Math.random(), x: target.x, y: FIXED_Y - 100, value: "CRITICAL!", isPlayer: true });
            }

            // เล่นท่าโจมตี
            set({ playerVisual: "attack-1" }); 
            await delay(400);
            
            sfx.playHit(); 
            set({ playerVisual: "attack-2" }); 

            // สร้างความเสียหาย
            get().damageEnemy(targetId, totalDmg);
            await delay(400);
         }
       }
       // เดินกลับที่เดิม
       await delay(200);
       set({ playerX: originalX, playerVisual: "walk" });
       await delay(500);
    }

    set({ playerVisual: "idle", playerShoutText: "" });
    await delay(200);

    // จบเทิร์น
    get().endTurn();
  },

  actionSpin: async (newInventory) => {
    const store = get();
    if (store.playerData.rp < 1) return;
    set((s) => ({
      playerData: {
        ...s.playerData,
        rp: s.playerData.rp - 1,
        inventory: newInventory,
      },
      playerShoutText: "SPIN!",
      gameState: "ACTION",
    }));
    await delay(600);
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },

  // ... (Enemy Update, Damage Player, Quiz Logic คงเดิม) ...
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
      });
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
      get().updateEnemy(en.id, { x: PLAYER_X_POS + 10, atkFrame: 1 });
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

    // ------------------------------------------------------------------------
    // ⚡ SKILL LOGIC (วางทับ Block เดิมได้เลย)
    // ------------------------------------------------------------------------
} else if (actionMove === "SKILL") {
      const originalX = en.x;
      const vocabList = store.dictionary;
      
      // 1. Logic ดาเมจ & คำศัพท์ (เหมือนเดิม)
      const baseDmg = Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min;
      let finalDmg = baseDmg * 2; 
      let candidateWords = vocabList.filter(v => v.word.length === finalDmg);
      if (candidateWords.length === 0) {
        candidateWords = vocabList;
        const fallbackWord = candidateWords[Math.floor(Math.random() * candidateWords.length)];
        finalDmg = fallbackWord.word.length; 
      }
      const correctEntry = candidateWords[Math.floor(Math.random() * candidateWords.length)];
      
      // 2. Logic Choice หลอก (เหมือนเดิม)
      const choices = vocabList
        .filter((v) => v.word !== correctEntry.word)
        .map((v) => {
          let score = getLevenshteinDistance(correctEntry.word, v.word);
          score += Math.abs(correctEntry.word.length - v.word.length) * 2; 
          return { ...v, similarityScore: score };
        })
        .sort((a, b) => a.similarityScore - b.similarityScore)
        .slice(0, 3).map((w) => w.word);
      const finalChoices = [correctEntry.word, ...choices].sort(() => 0.5 - Math.random());

      // ======================================================
      // 📍 CONFIG ระยะห่าง (สำคัญมาก!)
      // ======================================================
      // CREEP_DIST: ระยะที่เดินมาช้าๆ (10 วิ) -> เอาแบบปลอดภัย ไม่ทับ (18)
      const CREEP_DIST = 10; 
      
      // STRIKE_DIST: ระยะฟัน -> ขยับเข้าไปอีกนิดเพื่อให้เกิดการเคลื่อนที่ใหม่ (14)
      // *การเปลี่ยนจาก 18 ไป 14 จะบังคับให้ Animation "ดีดตัว" ใหม่ทันที*
      const STRIKE_DIST = 6; 

      // ======================================================
      // 🚀 PHASE 1: LUNGE (ตั้งหลักไกลๆ)
      // ======================================================


      // ======================================================
      // ⏱️ PHASE 2: CREEP (เดินกดดัน)
      // ======================================================
      const QUIZ_SECONDS = 10; 
      set({
        gameState: "QUIZ_MODE",
        currentQuiz: {
          question: correctEntry.meaning,
          correctAnswer: correctEntry.word,
          choices: finalChoices,
          enemyId: en.id,
          timeLimit: QUIZ_SECONDS * 1000
        },
      });

      // เดินช้าๆ มาที่ระยะปลอดภัย (18)
      get().updateEnemy(en.id, {
        x: PLAYER_X_POS + CREEP_DIST, 
        atkFrame: 1, 
      });

      // ⏳ รอคำตอบ...
      const isCorrect = await new Promise((resolve) => {
        set({ quizResolver: resolve });
      });

      // ======================================================
      // ⚔️ PHASE 3: STRIKE (พุ่งฟัน!)
      // ======================================================
      // 1. เปลี่ยนโหมดเพื่อให้ Animation เป็น Spring
      set({ gameState: "ENEMYTURN" }); 
      
      // 2. ให้เวลานิดนึงเพื่อ Reset State
      await delay(50); 

      // 3. 🔴 สั่งเปลี่ยนตำแหน่งเป็น STRIKE_DIST (14)
      // - เพราะค่า X เปลี่ยน (จากเป้าหมายเดิม 18 -> 14) 
      // - ระบบจะ "ยกเลิก" การเดินช้า แล้วคำนวณเส้นทางใหม่ด้วยความเร็วสูง (Spring)
      // - ไม่ว่าจะอยู่ไกล (ตอบเร็ว) หรืออยู่ใกล้ (หมดเวลา) มันจะพุ่งมาที่ 14 ทันที
      get().updateEnemy(en.id, { 
        x: PLAYER_X_POS + STRIKE_DIST, 
        atkFrame: 2 // ง้างฟัน
      });

      if (isCorrect) {
        set({ isDodging: true }); 
        sfx.playMiss();
        get().updateEnemy(en.id, { shoutText: "MISSED!" });
      } else {
        sfx.playHit();
        get().damagePlayer(finalDmg); 
      }

      await delay(800);

      // ======================================================
      // 🔙 PHASE 4: RETREAT
      // ======================================================
      set({ isDodging: false }); 
      get().updateEnemy(en.id, {
        x: originalX, 
        atkFrame: 0, 
        shoutText: "",
        currentStep: nextStep,
      });
      await delay(1000);
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
      });
    if (newHp <= 0) set({ gameState: "OVER" });
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
