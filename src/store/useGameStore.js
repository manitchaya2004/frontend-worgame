import { create } from "zustand";
import { PLAYER_X_POS, FIXED_Y, ipAddress } from "../const/index";
import { getLetterDamage } from "../const/letterValues";
import { sfx, bgm } from "../utils/sfx";
import { InventoryUtils, DeckManager, WordSystem } from "../utils/gameSystem";

// ============================================================================
// 🛠️ UTILITIES & MATH HELPERS
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
const chanceRound = (val, luckBonus = 0) => {
  const floor = Math.floor(val);
  const decimal = val - floor;
  const luckFactor = luckBonus * 0.02;
  return Math.random() < decimal + luckFactor ? floor + 1 : floor;
};

// ============================================================================
// 📦 GAME STORE
// ============================================================================

export const useGameStore = create((set, get) => ({
  // --------------------------------------------------------------------------
  // 🆕 SECTION: SETTINGS & MENU STATE (เพิ่มใหม่)
  // --------------------------------------------------------------------------
  isMenuOpen: false,
  isBgmOn: true,
  isSfxOn: true,

  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),

  toggleBgm: () => {
    const { isBgmOn, gameState } = get();
    if (isBgmOn) {
      // สั่งปิด: หยุดเพลงทันที
      bgm.stop();
      set({ isBgmOn: false });
    } else {
      // สั่งเปิด: เช็คสถานะเกมเพื่อเล่นเพลงที่ถูกต้อง
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
        bgm.playBattle(); // หรือเพลง Battle ที่คุณต้องการ
      }
    }
  },

  toggleSfx: () => set((state) => ({ isSfxOn: !state.isSfxOn })),

  // --------------------------------------------------------------------------
  // 1️⃣ SECTION: STATE DEFINITIONS
  // --------------------------------------------------------------------------

  // System State
  gameState: "LOADING",
  loadingProgress: 0,
  dictionary: [],
  stageData: [],

  // World & Progress
  distance: 0,
  coin: 0,
  currentEventIndex: 0,

  // Animation
  animTimer: 0,
  hasSpawnedEnemies: false,

  // UI State
  damagePopups: [],
  hoveredEnemyId: null,
  validWordInfo: null,

  // Combat State
  enemies: [],
  turnQueue: [],
  activeCombatant: null,

  // Quiz Mode State
  currentQuiz: null,
  quizResolver: null,

  // Player State
  playerX: PLAYER_X_POS,
  playerShoutText: "",
  playerVisual: "idle", // ท่าทางผู้เล่นปัจจุบัน
  animFrame: 1, // เฟรมปัจจุบัน
  selectedLetters: [],
  playerData: {
    name: "Hero",
    level: 1,
    next_exp: 0,
    exp: 0,
    max_hp: 0,
    hp: 0,
    atk: 0,
    shield: 0,
    max_rp: 0,
    rp: 0,
    speed: 0,
    unlockedSlots: 0,
    inventory: [],
  },

  // --------------------------------------------------------------------------
  // 2️⃣ SECTION: UI & BASIC SETTERS
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
  // 3️⃣ SECTION: INVENTORY & WORD LOGIC
  // --------------------------------------------------------------------------

  // เติมตัวอักษรเข้ามือ
  initSelectedLetters: () => {
    const { playerData } = get();
    set({
      selectedLetters: new Array(playerData.unlockedSlots).fill(null),
      validWordInfo: null,
    });
  },

  // เลือกตัวอักษรจากมือลงกระดาน
  selectLetter: (item, invIndex) => {
    if (item.status === "stun") {
      return;
    }
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
  // เอาตัวอักษรจากกระดานกลับเข้ามือ
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
  // นำตัวอักษรทั้งหมดบนกระดานกลับเข้ามือ
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
  // สลับตำแหน่งตัวอักษรบนกระดาน
  reorderLetters: (newOrder) => {
    const { playerData } = get();
    const fullList = [
      ...newOrder,
      ...new Array(playerData.unlockedSlots - newOrder.length).fill(null),
    ];
    set({ selectedLetters: fullList });
    get().checkCurrentWord(fullList);
  },

  // เช็คคำศัพท์ว่ามีความหมายไหม
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
  // 4️⃣ SECTION: SYSTEM LOOP & INITIALIZATION
  // --------------------------------------------------------------------------

  initializeGame: async (userData, stageId) => {
    console.log("Initializing Game...", userData, "Stage ID:", stageId);

    get().reset();
    set({ loadingProgress: 0, gameState: "LOADING" });

    try {
      // 1. Setup Hero Data
      const selectedHero =
        userData?.heroes?.find((h) => h.is_selected) || userData?.heroes?.[0];
      if (selectedHero) {
        set((state) => ({
          playerData: {
            ...state.playerData,
            name: selectedHero.hero_id,
            level: selectedHero.level,
            next_exp: selectedHero.next_exp,
            exp: selectedHero.current_exp,
            max_hp: selectedHero.hp,
            hp: selectedHero.hp,
            atk: selectedHero.power,
            speed: selectedHero.speed,
            unlockedSlots: selectedHero.slot,
            max_rp: selectedHero.spin_point,
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
      console.log( stageData)

      set({ loadingProgress: 75 });
      DeckManager.init();

      // 4. Finish
      set({ loadingProgress: 100 });
      await delay(1000);

      // ✅ เล่นเพลง (ถ้าเปิดอยู่)
      if (get().isBgmOn) bgm.playGreenGrass();

      set({
        dictionary: dictData,
        stageData: stageData,
        currentEventIndex: 0,
        gameState: "ADVANTURE",
      });
      console.log(get().stageData)
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
        // ✅ เช็ค SFX ก่อนเล่น
        if (state.gameState === "ADVANTURE" && state.isSfxOn) sfx.playWalk();
      }
      updates.animTimer = newTimer;

      if (state.gameState === "ADVANTURE") {
        const speed = 0.005;
        const newDist = state.distance + dt * speed;
        let nextTargetDist = Infinity;
        if (state.stageData && state.stageData.events[state.currentEventIndex]) {
          nextTargetDist = state.stageData.events[state.currentEventIndex].distance;
        }

        if (newDist >= nextTargetDist) {
          // ถึงจุดปะทะ
          // ✅ เปลี่ยนเพลง (ถ้าเปิดอยู่)
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
      return updates;
  }),
  reset: () => {
    set({
      gameState: "ADVANTURE",
      currentEventIndex: 0,
      coin: 0,
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
      isMenuOpen: false,
    });
  },

  // --------------------------------------------------------------------------
  // 5️⃣ SECTION: COMBAT FLOW
  // --------------------------------------------------------------------------

  spawnEnemies: (loot, autoStart = false) => {
    const store = get();
    const currentEvent = store.stageData.events[store.currentEventIndex];
    console.log(currentEvent)
    const waveData = currentEvent ? currentEvent.monsters : [];
    console.log(waveData)

    let currentX = 85;
    const enemiesWithPos = waveData.map((e, i) => {
      if (i > 0) currentX -= e.isBoss || waveData[i - 1].isBoss ? 14 : 7;
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

    console.log(get().enemies)

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
    await delay(500)

    // 1. จัดการ STUN (เคลียร์เมื่อเริ่มรอบใหม่)
    const currentInv = [...store.playerData.inventory];
    const updatedInv = currentInv.map((slot) => {
      if (slot && slot.status === "stun") {
        const newDuration = slot.statusDuration - 1;
        return newDuration <= 0
          ? { ...slot, status: null, statusDuration: 0 }
          : { ...slot, statusDuration: newDuration };
      }
      return slot;
    });

    set((state) => ({
      playerData: { ...state.playerData, shield: 0, inventory: updatedInv },
      enemies: state.enemies.map((e) => ({ ...e, shield: 0 })),
    }));

    // 3. Initiative Calculation
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
      let totalPoisonDmg = 0;
      let hasPoisonUpdate = false;

      const updatedInv = currentInv.map((slot) => {
        if (slot && slot.status === "poison") {
          hasPoisonUpdate = true;
          const dmg = Math.floor(store.playerData.max_hp * 0.25);
          totalPoisonDmg += Math.max(1, dmg);
          const newDuration = slot.statusDuration - 1;

          return newDuration <= 0
            ? { ...slot, status: null, statusDuration: 0 }
            : { ...slot, statusDuration: newDuration };
        }
        return slot;
      });

      if (hasPoisonUpdate) {
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
      }

      if (get().playerData.hp <= 0) {
        return;
      }
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
    if (store.stageData.events && store.stageData.events[nextEventIdx]) {
      set({
        gameState: "ADVANTURE",
        playerShoutText: "",
        currentEventIndex: nextEventIdx,
        turnQueue: [],
        activeCombatant: null,
        hasSpawnedEnemies: false,
      });
      // ✅ เปลี่ยนเพลงกลับ
      if (store.isBgmOn) {
        bgm.stop();
        bgm.playGreenGrass();
      }
    } else {
      bgm.stop();
      set({
        gameState: "GAME_CLEARED",
        enemies: [],
        playerShoutText: "All Clear!",
      });

    }
  },

  // --------------------------------------------------------------------------
  // 6️⃣ SECTION: PLAYER ACTIONS
  // --------------------------------------------------------------------------

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
    const currentInv = [...store.playerData.inventory];
    usedIndices.forEach((idx) => {
      currentInv[idx] = null;
    });
    for (let i = 0; i < store.playerData.unlockedSlots; i++) {
      if (currentInv[i] === null)
        currentInv[i] = DeckManager.createItem(
          i,
          currentInv,
          store.playerData.unlockedSlots
        );
    }

    set((s) => ({
      playerShoutText: actionType,
      gameState: "ACTION",
      playerVisual: "idle",
      playerData: { ...s.playerData, inventory: currentInv },
    }));

    await delay(300);

    if (actionType === "SHIELD") {
      let rawShield
      for (let char of word)
        rawShield = getLetterDamage(char, store.playerData.atk) ;
      const shieldAmount = chanceRound(rawShield);

      set({
        playerVisual: "guard-1",
        playerData: {
          ...store.playerData,
          shield: store.playerData.shield + shieldAmount,
        },
      });
      await delay(200);
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 60,
        value: `+${shieldAmount} SHEILD`,
        color: "#2e75cc",
      });
      await delay(500);
    } else if (actionType === "ATTACK") {
      const target = get().enemies.find((e) => e.id === targetId);
      if (target) {
        set({ playerX: target.x - 10, playerVisual: "walk" });
        await delay(200);

        let totalDmgRaw = 0;
        for (let char of word)
          totalDmgRaw += getLetterDamage(char, store.playerData.atk);
        const totalDmg = chanceRound(totalDmgRaw);

        set({ playerVisual: "attack-1" });
        await delay(400);
        // ✅ เช็ค SFX
        if (store.isSfxOn) sfx.playHit();
        set({ playerVisual: "attack-2" });

        get().damageEnemy(targetId, totalDmg);
        await delay(400);
      }
      set({ playerX: PLAYER_X_POS, playerVisual: "walk" });
      await delay(500);
    }

    set({ playerVisual: "idle", playerShoutText: "" });
    get().endTurn();
  },

  actionSpin: async (newInventory) => {
    const store = get();
    if (store.playerData.rp < 1) return;
    set((s) => ({
      playerData: {
        ...s.playerData,
        rp: s.playerData.max_rp - 1,
        inventory: newInventory,
      },
      playerShoutText: "SPIN!",
      gameState: "ACTION",
    }));
    await delay(600);
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },

  // --------------------------------------------------------------------------
  // 7️⃣ SECTION: ENEMY AI & LOGIC
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
        coin: state.coin + (target.exp || 0),
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

  runSingleEnemyTurn: async (enemyId) => {
    const store = get();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });

    const en = store.enemies.find((e) => e.id === enemyId);
    if (!en || en.hp <= 0) {
      get().endTurn();
      return;
    }

    get().updateEnemy(en.id, { shield: 0 });

    let actionObj = en.patternList?.find(
      (p) => p.pattern_no === en.selectedPattern && p.order === en.currentStep
    );
    const actionMove = actionObj ? actionObj.move.toUpperCase() : "WAIT";

    let nextStep = en.currentStep + 1;
    const hasNext = en.patternList?.some(
      (p) => p.pattern_no === en.selectedPattern && p.order === nextStep
    );
    if (!hasNext) nextStep = 1;

    switch (actionMove) {
      case "GUARD":
        const shieldGain = en.def || 5;
        get().updateEnemy(en.id, { shoutText: "GUARD!" });
        await delay(400);
        get().updateEnemy(en.id, { shield: (en.shield || 0) + shieldGain });
        await delay(600);
        break;

      case "ATTACK":
        const dmg =
          Math.floor(
            Math.random() * (en.atk_power_max - en.atk_power_min + 1)
          ) + en.atk_power_min;
        const shoutWord =
          WordSystem.getRandomWordByLength(
            store.dictionary,
            Math.min(dmg, 8)
          ) || "GRR!";

        get().updateEnemy(en.id, { shoutText: shoutWord });
        await delay(400);

        const originalX = en.x;
        const atkX = en.isBoss ? PLAYER_X_POS + 15 : PLAYER_X_POS + 10;
        get().updateEnemy(en.id, { x: atkX, atkFrame: 1 });
        await delay(400);

        get().damagePlayer(dmg);
        // ✅ เช็ค SFX
        if (store.isSfxOn) sfx.playHit();
        get().updateEnemy(en.id, { atkFrame: 2 });
        await delay(400);

        get().updateEnemy(en.id, { x: originalX, atkFrame: 0 });
        break;

      case "SKILL":
        await get().handleEnemySkill(en);
        break;

      case "HEAL":
        get().updateEnemy(en.id, { shoutText: "HEAL!" });
        await delay(500);
        const allies = store.enemies.filter((e) => e.hp > 0);
        if (allies.length > 0) {
          const targetAlly = allies.reduce((prev, curr) =>
            curr.hp / curr.maxHp < prev.hp / prev.maxHp ? curr : prev
          );
          const healAmt = Math.floor(en.maxHp * 0.2);
          get().updateEnemy(targetAlly.id, {
            hp: Math.min(targetAlly.maxHp, targetAlly.hp + healAmt),
          });
          get().addPopup({
            id: Math.random(),
            x: targetAlly.x,
            y: FIXED_Y - 100,
            value: `+${healAmt}`,
            color: "#2ecc71",
            fontSize: "34px",
          });
        }
        await delay(1200);
        break;

      case "POISON":
        get().updateEnemy(en.id, { shoutText: "POISON!" });
        await delay(500);
        const invP = [...get().playerData.inventory];
        const pSlots = invP
          .map((s, i) => (s && !s.status ? i : null))
          .filter((i) => i !== null);
        if (pSlots.length > 0) {
          const idx = pSlots[Math.floor(Math.random() * pSlots.length)];
          invP[idx].status = "poison";
          invP[idx].statusDuration = 3;
          set({ playerData: { ...get().playerData, inventory: invP } });
        }
        await delay(500);
        break;

      case "STUN":
        get().updateEnemy(en.id, { shoutText: "STUN!" });
        await delay(500);
        const invS = [...get().playerData.inventory];
        const sSlots = invS
          .map((s, i) => (s && !s.status ? i : null))
          .filter((i) => i !== null);
        if (sSlots.length > 0) {
          const idx = sSlots[Math.floor(Math.random() * sSlots.length)];
          invS[idx].status = "stun";
          invS[idx].statusDuration = 2;
          set({ playerData: { ...get().playerData, inventory: invS } });
        }
        await delay(500);
        break;

      default:
        get().updateEnemy(en.id, { shoutText: "..." });
        await delay(800);
        break;
    }

    get().updateEnemy(en.id, { shoutText: "", currentStep: nextStep });
    if (get().playerData.hp <= 0) {
      bgm.stop();
      set({ gameState: "OVER" });
      return;
    }
    get().endTurn();
  },

  handleEnemySkill: async (en) => {
    const store = get();
    const originalX = en.x;

    const vocabList = store.dictionary;
    const baseDmg =
      Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) +
      en.atk_power_min;
    let finalDmg = baseDmg * 2;
    let candidateWords = vocabList.filter((v) => v.word.length === finalDmg);
    if (candidateWords.length === 0) {
      candidateWords = vocabList;
      finalDmg =
        candidateWords[Math.floor(Math.random() * candidateWords.length)].word
          .length;
    }
    const correctEntry =
      candidateWords[Math.floor(Math.random() * candidateWords.length)];
    const choices = vocabList
      .filter((v) => v.word !== correctEntry.word)
      .map((v) => ({
        ...v,
        similarityScore: getLevenshteinDistance(correctEntry.word, v.word),
      }))
      .sort((a, b) => a.similarityScore - b.similarityScore)
      .slice(0, 3)
      .map((w) => w.word);

    const finalChoices = [correctEntry.word, ...choices].sort(
      () => 0.5 - Math.random()
    );

    get().updateEnemy(en.id, {
      x: PLAYER_X_POS + 30,
      shoutText: correctEntry.meaning,
      atkFrame: 1,
    });
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

    get().updateEnemy(en.id, { x: PLAYER_X_POS + 20, atkFrame: 1 });
const isCorrect = await new Promise((resolve) =>
      set({ quizResolver: resolve })
    );

    set({ gameState: "ENEMYTURN" });
    await delay(50);
    get().updateEnemy(en.id, { x: PLAYER_X_POS + 10, atkFrame: 2 });

    if (isCorrect) {
      set({ playerX: PLAYER_X_POS-5, playerVisual: "walk" });
      
      if (store.isSfxOn) sfx.playMiss();
      get().updateEnemy(en.id, { shoutText: "MISSED!" });
    } else {
      if (store.isSfxOn) sfx.playHit();
      get().damagePlayer(finalDmg);
    }

    await delay(800);
    set({ playerX: PLAYER_X_POS, playerVisual: "idle" });
    
    get().updateEnemy(en.id, { x: originalX, atkFrame: 0 });
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
