// src/store/useGameStore.js
import { create } from "zustand";
import { PLAYER_X_POS, FIXED_Y, ipAddress } from "../const/index";
import { sfx } from "../utils/sfx";
import { 
  CombatSystem, 
  InventoryUtils, 
  DeckManager, 
  WordSystem 
} from "../utils/gameSystem";

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
  stageData: null,
  distance: 0,
  loadingProgress: 0,
  animResolver: null,
  
  animTimer: 0, 
  animFrame: 1, 

  // --------------------------------------------------------------------------
  // 🔴 STATE: ENEMY
  // --------------------------------------------------------------------------
  currentWave: 1,
  enemies: [],
  isDodging: false,
  currentQuiz: null,
  quizResolver: null,

  // --------------------------------------------------------------------------
  // 🔵 STATE: PLAYER
  // --------------------------------------------------------------------------
  playerData: {
    name: "chara",
    max_hp: 100, hp: 100, shield: 0,
    max_rp: 3, rp: 3,
    mp: 0, max_mp: 25, manaRegen: 5,
    max_ap: 3, ap: 3,
    unlockedSlots: 10,
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

  initializeGame: async () => {
    set({ loadingProgress: 0, gameState: "LOADING" });

    try {
      const dictRes = await fetch(`${ipAddress}/dict`);
      const dictData = await dictRes.json();
      
      const stageRes = await fetch(`${ipAddress}/getStageById/green-grass-1`);
      const stageRaw = await stageRes.json();

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

      DeckManager.init();

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

  notifyAnimationComplete: () => {
    const resolver = get().animResolver;
    if (resolver) {
      resolver();
      set({ animResolver: null });
    }
  },

  waitAnim: async (timeoutMs = 1000) => {
    const safeTimeout = setTimeout(() => get().notifyAnimationComplete(), timeoutMs);
    await new Promise((resolve) => set({ animResolver: resolve }));
    clearTimeout(safeTimeout);
  },

  setDictionary: (data) => set({ dictionary: data }),
  addPopup: (p) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  removePopup: (id) => set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),

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
      playerVisual: "idle", 
      animFrame: 1,
      animTimer: 0,
      distance: 0,
      damagePopups: [],
      currentQuiz: null,
      quizResolver: null,
    }),

  // 🔄 MAIN UPDATE LOOP
  update: (dt) =>
    set((state) => {
      let updates = {}; 

      // ----------------------------------------------------------------------
      // ✅ 1. ANIMATION LOOP (สับขาตามเวลา 0.5 วินาที)
      // ----------------------------------------------------------------------
      const ANIM_SPEED = 200; // ความเร็วตามที่ขอ (0.5 วินาที)
      
      let newTimer = (state.animTimer || 0) + dt;
      
      if (newTimer >= ANIM_SPEED) {
        newTimer -= ANIM_SPEED; // ลบออกเพื่อรักษาจังหวะ (ไม่ reset เป็น 0)
        updates.animFrame = state.animFrame === 1 ? 2 : 1; 
      }
      updates.animTimer = newTimer;

      // ----------------------------------------------------------------------
      // ✅ 2. ADVENTURE MOVEMENT
      // ----------------------------------------------------------------------
      if (state.gameState === "ADVANTURE") {
        const speed = 0.001; // ความเร็วเดิน
        const newDist = state.distance + dt * speed;
        const targetDist = state.currentWave * 10; 

        if (newDist >= targetDist) {
          const finalDist = targetDist;
          
          setTimeout(() => {
            const store = get();
            const activeSlots = store.playerData.unlockedSlots || 10;
            const initialLoot = DeckManager.generateList(activeSlots);
            store.spawnEnemies(initialLoot);
          }, 500); 

          updates.distance = finalDist;
          updates.gameState = "PREPARING_COMBAT";
        } else {
          updates.distance = newDist;
        }
      }

      return updates;
    }),

  // ==========================================================================
  // ⚡ ACTIONS: ENEMY
  // ==========================================================================

  spawnEnemies: (loot) => {
    const store = get();
    const waveData = store.stageData ? store.stageData[store.currentWave] : [];

    if (!waveData || waveData.length === 0) {
      console.log("No enemies found for wave " + store.currentWave);
      set({ gameState: "GAME_CLEARED", playerShoutText: "MISSION COMPLETE!" });
      return;
    }

    const enemiesWithPos = waveData.map((e, i) => ({
      ...e,
      x: 85 - i * 10,
      hp: e.max_hp,
      shield: 0,
      currentStep: 1,
      selectedPattern: e.selectedPattern || 1,
    }));

    set({
      gameState: "PLAYERTURN",
      enemies: enemiesWithPos,
      playerData: {
        ...store.playerData,
        rp: store.playerData.max_rp,
        inventory: loot,
      },
    });
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
      });
    }
  },

  resolveQuiz: (answer) => {
    const store = get();
    if (!store.currentQuiz || !store.quizResolver) return;
    const isCorrect = answer === store.currentQuiz.correctAnswer;
    store.quizResolver(isCorrect);
    set({ currentQuiz: null, quizResolver: null });
  },

  runEnemyTurn: async () => {
    const store = get();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });

    const enemiesResetShield = store.enemies.map((e) => ({ ...e, shield: 0 }));
    set({ enemies: enemiesResetShield });

    const currentEnemies = get().enemies;

    for (const en of currentEnemies) {
      if (en.hp <= 0) continue;
      if (get().playerData.hp <= 0) {
        set({ gameState: "OVER" });
        return;
      }

      let actionObj = null;
      if (en.patternList) {
        actionObj = en.patternList.find(
          (p) => p.pattern_no === en.selectedPattern && p.order === en.currentStep
        );
      }
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

        const currentShield = en.shield || 0;
        get().updateEnemy(en.id, { shield: currentShield + shieldGain });
        await delay(600);

        get().updateEnemy(en.id, { shoutText: "", currentStep: nextStep });
        await delay(200);
        continue;
      }

      if (actionMove === "ATTACK") {
        const dmg = Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min;
        const shoutWord = WordSystem.getRandomWordByLength(store.dictionary, Math.min(dmg, 8)) || "GRR!";

        get().updateEnemy(en.id, { shoutText: shoutWord });
        await delay(400);

        const originalX = en.x;
        get().updateEnemy(en.id, { x: PLAYER_X_POS + 10 , atkFrame: 1 });
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
        continue;
      }

      if (actionMove === "WAIT") {
        get().updateEnemy(en.id, { shoutText: "...", currentStep: nextStep });
        get().addPopup({ id: Math.random(), x: en.x - 2, y: FIXED_Y - 80, value: 0 });
        await delay(800);
        get().updateEnemy(en.id, { shoutText: "" });
        continue;
      }

      if (actionMove === "SKILL") {
        const vocabList = store.dictionary;
        const correctEntry = vocabList[Math.floor(Math.random() * vocabList.length)];
        
        const choices = vocabList
          .filter((v) => v.word !== correctEntry.word)
          .map((v) => {
            let score = getLevenshteinDistance(correctEntry.word, v.word);
            score += Math.abs(correctEntry.word.length - v.word.length);
            return { ...v, similarityScore: score };
          })
          .sort((a, b) => a.similarityScore - b.similarityScore)
          .slice(0, 3)
          .map((w) => w.word);

        const finalChoices = [correctEntry.word, ...choices].sort(() => 0.5 - Math.random());
        const originalX = en.x;

        get().updateEnemy(en.id, {
          x: PLAYER_X_POS - 10,
          shoutText: correctEntry.meaning,
          atkFrame: 1,
        });

        await delay(300);

        set({ 
          gameState: "QUIZ_MODE",
          currentQuiz: {
            question: correctEntry.meaning,
            correctAnswer: correctEntry.word,
            choices: finalChoices,
            enemyId: en.id,
          },
        });

        const isCorrect = await new Promise((resolve) => {
          set({ quizResolver: resolve });
        });

        set({ gameState: "ENEMYTURN" });
        await delay(50);
        get().updateEnemy(en.id, { x: PLAYER_X_POS, atkFrame: 2 });

        if (isCorrect) {
          set({ isDodging: true });
          get().updateEnemy(en.id, { shoutText: "MISSED!" });
          get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: "MISS", isPlayer: true });
        } else {
          const dmg = (Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min) * 2;
          sfx.playHit();
          get().damagePlayer(dmg);
        }

        await delay(1000);
        set({ isDodging: false });
        get().updateEnemy(en.id, {
          x: originalX,
          atkFrame: 0,
          shoutText: "",
          currentStep: nextStep,
        });
        await delay(500);
      }

      if (get().playerData.hp <= 0) {
        set({ gameState: "OVER" });
        return;
      }
    }

    if (get().playerData.hp > 0) {
      get().startPlayerTurn();
    }
  },

  // ==========================================================================
  // ⚡ ACTIONS: PLAYER
  // ==========================================================================

  updatePlayer: (data) => set((s) => ({ playerData: { ...s.playerData, ...data } })),

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
        setTimeout(() => { set({ isGuarding: false, playerVisual: "idle" }); }, 600);
      }
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 70, value: 0, isPlayer: true });
    }

    const newHp = Math.max(0, stat.hp - remainingDmg);
    let newMp = stat.mp;

    if (remainingDmg > 0) {
      set({ isGuarding: false, playerVisual: "idle" }); 
      const mpGainOnHit = remainingDmg; 
      newMp = Math.min(stat.max_mp, stat.mp + mpGainOnHit);
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS + 20, y: FIXED_Y - 90, value: mpGainOnHit, isPlayer: true }); 
    }

    set({ playerData: { ...stat, hp: newHp, shield: newShield, mp: newMp } });

    if (remainingDmg > 0) {
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS - 2, y: FIXED_Y - 50, value: remainingDmg, isPlayer: true });
    }
    
    if (newHp <= 0) set({ gameState: "OVER" });
  },

  setInventory: (items) => set({ playerData: { ...get().playerData, inventory: items } }),

  startPlayerTurn: () => {
    const store = get();
    const newInventory = InventoryUtils.fillEmptySlots(store.playerData.inventory, [], store.playerData.unlockedSlots);

    set((s) => ({
      gameState: "PLAYERTURN",
      playerVisual: "idle",
      playerData: {
        ...s.playerData,
        rp: s.playerData.max_rp,
        ap: s.playerData.max_ap, 
        mp: Math.min(s.playerData.max_mp, s.playerData.mp + s.playerData.manaRegen),
        shield: 0, 
        inventory: newInventory,
      }
    }));
    get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 90, value: 5, isPlayer: true });
  },

  actionSpin: async (newInventory) => {
    const store = get();
    if (store.playerData.rp < 1) return;
    set((s) => ({
      playerData: { ...s.playerData, rp: s.playerData.rp - 1, inventory: newInventory },
      playerShoutText: "REROLL!",
      gameState: "ACTION",
    }));
    await store.waitAnim(600);
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },

  castSkill: async (skill, chosenWord, targetIds, usedIndices) => {
    const store = get();
    const finalApCost = skill.apCost || 1;

    if (store.playerData.mp < (skill.mpCost || 0)) return;
    if (store.playerData.ap < finalApCost) return; 

    const activeSlots = store.playerData.unlockedSlots;
    const currentInv = [...store.playerData.inventory];
    usedIndices.forEach((idx) => { currentInv[idx] = null; });
    for (let i = 0; i < activeSlots; i++) {
      if (currentInv[i] === null) currentInv[i] = DeckManager.createItem(i);
    }

    set((s) => ({
      playerShoutText: skill.name,
      gameState: "ACTION",
      playerVisual: "idle",
      playerData: {
        ...s.playerData,
        inventory: currentInv, 
        mp: s.playerData.mp - (skill.mpCost || 0),
        ap: s.playerData.ap - finalApCost, 
      },
    }));

    await store.waitAnim(300); 

    const isBasicMove = (skill.mpCost || 0) === 0;

    // SHIELD
    if (skill.effectType === "SHIELD") {
      let shieldAmount = isBasicMove ? chosenWord.length * skill.basePower : skill.basePower;
      set({ playerVisual: "guard-1" });
      set((s) => ({ playerData: { ...s.playerData, shield: s.playerData.shield + shieldAmount } }));
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: shieldAmount, isPlayer: false });
      await delay(500);
      set({ playerVisual: "idle" });
    } 
    // DAMAGE
    else if (skill.effectType === "DAMAGE") {
      const originalX = PLAYER_X_POS;
      const firstTarget = get().enemies.find(e => e.id === targetIds[0]);
      
      if (firstTarget) {
        set({ playerX: firstTarget.x - 10, playerVisual: "walk" }); 
        await delay(200); 
      }

      const hitsPerTarget = skill.hitCount || 1;
      for (const targetId of targetIds) {
        for (let i = 0; i < hitsPerTarget; i++) {
          const target = get().enemies.find((e) => e.id === targetId);
          if (!target || target.hp <= 0) break;
          set({ playerVisual: "attack-1" }); 
          await delay(400);
          sfx.playHit(); 
          set({ playerVisual: "attack-2" }); 
          let finalDamage = CombatSystem.calculateDamage(skill, chosenWord, target);
          get().damageEnemy(targetId, finalDamage);
          await delay(400); 
        }
      }
      await delay(200);
      set({ playerX: originalX, playerVisual: "walk" });
      await delay(500);
    }

    set({ playerVisual: "idle", playerShoutText: "" });
    await delay(200);

    if (get().enemies.filter((e) => e.hp > 0).length === 0) {
      const nextWave = store.currentWave + 1;
      if (store.stageData && store.stageData[nextWave]) {
        set({ gameState: "WAVE_CLEARED", playerShoutText: "Skibidi!" });
        await delay(2000);
        set({ gameState: "ADVANTURE", playerShoutText: "", currentWave: nextWave });
      } else {
        set({ gameState: "GAME_CLEARED", enemies: [], playerShoutText: "Time to rest!" });
      }
      return;
    }

    set({ gameState: "PLAYERTURN" });
  },

}));