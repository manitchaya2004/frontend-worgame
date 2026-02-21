import { create } from "zustand";
import { PLAYER_X_POS, FIXED_Y, ipAddress } from "../const/index";
import { sfx, bgm } from "../utils/sfx";
import { DeckManager, WordSystem } from "../utils/gameSystem";

// ==========================================
// 📊 GLOBAL POWER SETTINGS
// ==========================================
export const POWER_GROUPS = {
  G1: ["A", "E", "I", "O", "U"],
  G2: ["L", "N", "S", "T", "R", "D", "G", "B", "C", "M", "P", "F", "H", "K"],
  G3: ["V", "W", "J", "X", "Y", "Q", "Z"]
};

export const GLOBAL_POWER_MAP = {};
Object.entries(POWER_GROUPS).forEach(([group, chars]) => {
  const powerValue = group === "G1" ? 0.50 : group === "G2" ? 1.00 : 1.50;
  chars.forEach(char => {
    GLOBAL_POWER_MAP[char] = powerValue;
  });
});

// ============================================================================
// UTILITIES & MATH HELPERS
// ============================================================================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const chanceRound = (val, luckBonus = 0) => {
  const floor = Math.floor(val);
  const decimal = val - floor;
  const luckFactor = luckBonus * 0.02;
  return Math.random() < decimal + luckFactor ? floor + 1 : floor;
};

export const getLetterDamage = (char) => {
  if (!char) return 0;
  let upperChar = char.toUpperCase();
  if (upperChar === "QU") upperChar = "Q";
  const value = GLOBAL_POWER_MAP[upperChar];
  return value !== undefined ? Number(value) : 0;
};

export const findBestWordFromLetters = (letters, dictionary, maxLetters) => {
  if (!letters || letters.length === 0) return { bestWord: "", usedItems: [] };

  const availableChars = new Set(letters.map(l => l?.char.toLowerCase()));
  const charCounts = {};
  letters.forEach(item => {
    if (!item) return;
    const c = item.char.toLowerCase();
    charCounts[c] = (charCounts[c] || 0) + 1;
  });

  let bestWord = "";
  let usedItems = [];

  const possibleWords = dictionary.filter(({ word }) => 
    word.length > 0 && 
    word.length <= maxLetters && 
    word.length > bestWord.length && 
    [...word.toLowerCase()].every(char => availableChars.has(char))
  );

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

export const applyRandomBuffs = (inventory) => {
  return inventory.map(item => {
    if (!item) return item;
    const roll = Math.random();
    let newItem = { ...item, buff: null };
    if (roll < 0.1) newItem.buff = "STRIKE_x2";
    else if (roll < 0.2) newItem.buff = "GUARD_x2";
    else if (roll < 0.3) newItem.buff = "MANA_PLUS";
    return newItem;
  });
};

// ============================================================================
// GAME STORE
// ============================================================================

export const useGameStore = create((set, get) => ({
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
      else if (["PREPARING_COMBAT", "PLAYERTURN", "ENEMYTURN", "ACTION", "QUIZ_MODE"].includes(gameState)) {
        bgm.playBattle();
      }
    }
  },

  toggleSfx: () => set((state) => ({ isSfxOn: !state.isSfxOn })),

  gameState: "LOADING",
  dictionary: [],
  stageData: [],
  userStageHistory: [],
  wordLog: {},
  distance: 0,
  currentEventIndex: 0,
  animTimer: 0,
  hasSpawnedEnemies: false,
  damagePopups: [],
  hoveredEnemyId: null,
  validWordInfo: null,
  wordScore: { raw: 0, min: 0, max: 0 }, 
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
    max_hp: 0,
    hp: 0,
    max_mana: 0,
    mana: 0,
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

  addPopup: (p) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  removePopup: (id) => set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),

  setHoveredEnemyId: (id) => {
    if (id === null) { set({ hoveredEnemyId: null }); return; }
    if (id === "PLAYER") { set({ hoveredEnemyId: "PLAYER" }); return; }
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

  initSelectedLetters: () => {
    const { playerData } = get();
    set({
      selectedLetters: new Array(playerData.unlockedSlots).fill(null), 
      validWordInfo: null,
      wordScore: { raw: 0, min: 0, max: 0 }, 
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
        playerData.unlockedSlots,
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
    if (!currentSelected) return;

    const validLetters = currentSelected.filter((i) => i !== null);
    const word = validLetters.map((i) => i.char).join("").toLowerCase();

    let rawScore = 0;
    validLetters.forEach((l) => {
      rawScore += getLetterDamage(l.char);
    });

    set({
      wordScore: {
        raw: rawScore,
        min: Math.floor(rawScore),
        max: Math.ceil(rawScore),
      }
    });

    if (!word) {
      set({ validWordInfo: null });
      return;
    }

    const matches = dictionary.filter((d) => d.word.toLowerCase() === word);

    if (matches.length > 0) {
      const grouped = {};
      matches.forEach(item => {
        const type = item.category || item.type || "Word";
        
        const meaningPart = typeof item.meaning === "string" 
          ? item.meaning.split(/,(?![^()]*\))/).map(m => m.trim())
          : [item.meaning];
        
        if (!grouped[type]) grouped[type] = [];
        grouped[type] = [...new Set([...grouped[type], ...meaningPart])];
      });

      Object.keys(grouped).forEach(key => {
        if (grouped[key].length === 0) {
          delete grouped[key];
        }
      });

      if (Object.keys(grouped).length === 0) {
        set({ validWordInfo: null });
        return;
      }

      set({ 
        validWordInfo: { 
          word: word, 
          entries: grouped 
        } 
      });
    } else {
      set({ validWordInfo: null });
    }
  },

  setupGame: async (userData, stageId) => {
    get().reset();
    set({ gameState: "LOADING" });

    try {
      const selectedHero = userData?.heroes?.find((h) => h.is_selected) || userData?.heroes?.[0];
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
            name: selectedHero.name,
            img_path: selectedHero.hero_id,
            level: selectedHero.level,
            next_exp: selectedHero.next_exp || 100,
            max_hp: stats?.hp || 20,
            hp: stats?.hp || 20,
            max_mana: selectedHero.ability_cost,
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
            unlockedSlots: stats?.power || 5,
          },
        }));
      }

      const dictRes = await fetch(`${ipAddress}/dict`);
      const dictData = await dictRes.json();

      const stageRes = await fetch(`${ipAddress}/getStageById/${stageId}`);
      const stageData = await stageRes.json();

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
          if (state.stageData && state.stageData.events[state.currentEventIndex]) {
            nextTargetDist = state.stageData.events[state.currentEventIndex].distance;
          }

          if (newDist >= nextTargetDist) {
            if (state.isBgmOn) { bgm.stop(); bgm.playBattle(); }
            setTimeout(() => {
              const store = get();
              if (store.gameState === "PREPARING_COMBAT") {
                const activeSlots = store.playerData.unlockedSlots || 8;
                const initialLoot = applyRandomBuffs(DeckManager.generateList(activeSlots));
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
      wordScore: { raw: 0, min: 0, max: 0 }, 
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
        mana: 0, 
        quiz_move_cost: e.quiz_move_cost || 100,
        quiz_move_info: e.quiz_move_info,
        shield: 0,
        currentStep: 1,
        selectedPattern: 1,
      };
    });

    set({
      enemies: enemiesWithPos,
      playerData: { ...store.playerData, inventory: loot },
    });

    if (autoStart) get().startCombatRound();
  },

  startCombatRound: async () => {
    const store = get();
    const { playerData } = store;

    const currentInv = [...playerData.inventory];
    const filledInv = applyRandomBuffs(DeckManager.fillEmptySlots(currentInv, [], playerData.unlockedSlots));

    const newPlayerMana = Math.min(playerData.max_mana, playerData.mana + 5);
    const updatedEnemies = store.enemies.map(e => {
      if (e.hp <= 0) return e;
      return { ...e, shield: 0, mana: Math.min(e.quiz_move_cost, e.mana + 5) };
    });

    set({ 
      enemies: updatedEnemies, 
      playerData: { ...playerData, mana: newPlayerMana, shield: 0, inventory: filledInv } 
    });

    get().addPopup({
      id: Math.random(),
      x: 30,
      y: FIXED_Y - 60,
      value: "Start new round!",
      color: "#ffffff",
    });
    await delay(500);

    const playerInit = Math.max(1, store.playerData.speed + (Math.floor(Math.random() * 3) - 1));
    let pool = [{ id: "player", type: "player", name: "You", initiative: playerInit }];

    store.enemies.filter((e) => e.hp > 0).forEach((e) => {
      const init = Math.max(1, (e.speed || 3) + (Math.floor(Math.random() * 3) - 1));
      pool.push({ id: e.id, type: "enemy", name: e.name, initiative: init });
    });

    const finalQueue = pool.sort((a, b) => b.initiative - a.initiative).map((unit, index) => ({
      ...unit,
      uniqueId: `${unit.id}_${index}_${Date.now()}`,
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
      const exists = store.enemies.find((e) => e.id === activeUnit.id && e.hp > 0);
      if (!exists) { get().endTurn(); return; }
      get().runEnemyTurn(activeUnit.id);
    } else {
      get().startPlayerTurn();
    }
  },

  endTurn: async () => {
    const store = get();

    if (store.activeCombatant && store.activeCombatant.type === "player") {
      const currentInv = [...store.playerData.inventory];
      const totalBleedStacks = currentInv.filter((s) => s?.status === "bleed").length;
      const isBleedExploding = totalBleedStacks >= 3;
      
      const hasPoison = currentInv.some((s) => s?.status === "poison");
      let totalPoisonDmg = 0;
      if (hasPoison) {
        const dmg = Math.floor(store.playerData.max_hp * 0.15);
        totalPoisonDmg = Math.max(1, dmg);
      }

      let hasInventoryUpdate = false;

      const updatedInv = currentInv.map((slot) => {
        if (!slot) return slot;
        if (slot.status === "poison" || slot.status === "stun" || slot.status === "blind") {
          hasInventoryUpdate = true;
          const newDuration = slot.statusDuration - 1;
          return newDuration <= 0 ? { ...slot, status: null, statusDuration: 0 } : { ...slot, statusDuration: newDuration };
        }
        if (slot.status === "bleed") {
          hasInventoryUpdate = true;
          if (isBleedExploding) return { ...slot, status: null, statusDuration: 0 };
          else {
            const newDuration = slot.statusDuration - 1;
            return newDuration <= 0 ? { ...slot, status: null, statusDuration: 0 } : { ...slot, statusDuration: newDuration };
          }
        }
        return slot;
      });

      if (hasInventoryUpdate || totalPoisonDmg > 0) {
        set({ playerData: { ...store.playerData, inventory: updatedInv } });
        
        if (totalPoisonDmg > 0) {
          get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: "POISON!", color: "#33ff00" });
          if (store.isSfxOn) sfx.playPoison();
          await delay(1000);
          get().damagePlayer(totalPoisonDmg, true); 
          await delay(500);
        }

        if (isBleedExploding) {
          const bleedDmg = Math.floor(store.playerData.max_hp * 0.3);
          get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: "BLOOD EXPLOSION!", color: "#c0392b", fontSize: "20px" });
          if (store.isSfxOn) sfx.playHit();
          await delay(800);
          get().damagePlayer(bleedDmg, true);
          await delay(500);
        }
      }
      if (get().playerData.hp <= 0) return;
    }

    if (!store.enemies.some((e) => e.hp > 0)) { get().handleWaveClear(); return; }
    const newQueue = [...store.turnQueue];
    newQueue.shift();
    set({ turnQueue: newQueue, activeCombatant: null });
    get().processNextTurn();
  },

  handleWaveClear: async () => {
    const store = get();
    set({ gameState: "WAVE_CLEARED", playerShoutText: "Victory!" });
    await delay(2000);

    get().initSelectedLetters(); 
    const nextEventIdx = store.currentEventIndex + 1;
    set((s) => ({
      gameState: "ADVANTURE",
      playerShoutText: "",
      currentEventIndex: nextEventIdx,
      turnQueue: [],
      activeCombatant: null,
      hasSpawnedEnemies: false,
      playerData: { 
        ...s.playerData, 
        inventory: [], 
        mana: 0,       
        shield: 0      
      }
    }));
    
    if (store.isBgmOn) { bgm.stop(); bgm.playGreenGrass(); }
  },

  finishStage: async () => {
    const store = get();
    if (store.gameState === "LOADING" || store.gameState === "GAME_CLEARED") return;
    bgm.stop();
    set({ gameState: "LOADING", playerShoutText: "Saving..." });
    try {
      const token = localStorage.getItem("token");
      const currentStageId = store.stageData.id;
      const monsterMoney = Number(store.receivedCoin) || 0;
      const stageRecord = store.userStageHistory.find((s) => s.stage_id === currentStageId);
      const isFirstClear = !stageRecord || !stageRecord.is_completed;
      const stageReward = isFirstClear ? (Number(store.stageData.money_reward) || 0) : 0;
      
      const totalMoney = Number(store.currentCoin) + monsterMoney + stageReward;
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

      await fetch(`${ipAddress}/update-money`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ money: totalMoney }),
      });

      set({ currentCoin: totalMoney });

      const unlockRes = await fetch(`${ipAddress}/complete-stage`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ currentStageId: currentStageId }),
      });

      if (!unlockRes.ok) throw new Error("Failed to unlock stage");
      set({ gameState: "GAME_CLEARED" });
    } catch (error) {
      console.error("Save Game Error:", error);
      set({ gameState: "GAME_CLEARED", playerShoutText: "Error Saving!" });
    }
  },

  saveQuitGame: async (earnedAmount) => {
    const store = get();
    try {
      const token = localStorage.getItem("token");
      const currentMoney = Number(store.currentCoin) || 0;
      const totalMoney = currentMoney + Number(earnedAmount);
      
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      await fetch(`${ipAddress}/update-money`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ money: totalMoney }),
      });
      
      set({ currentCoin: totalMoney });
      console.log("Money Saved:", totalMoney);
    } catch (error) { 
      console.error("Save Money Error:", error); 
    }
  },

  startPlayerTurn: () => {
    set(() => ({
      gameState: "PLAYERTURN",
      playerVisual: "idle",
    }));
  },

  performPlayerAction: async (actionType, word, targetId, usedIndices) => {
    const store = get();
    const itemsUsedInAction = store.selectedLetters.filter(l => l !== null);

    let totalDmgRaw = 0;
    let bonusMana = 0;

    itemsUsedInAction.forEach((item) => {
      let letterDmg = getLetterDamage(item.char);
      if (item.buff === "STRIKE_x2" && actionType === "Strike") {
        letterDmg *= 2;
      } else if (item.buff === "GUARD_x2" && actionType === "Guard") {
        letterDmg *= 2;
      } else if (item.buff === "MANA_PLUS") {
        bonusMana += 5;
      }
      totalDmgRaw += letterDmg;
    });

    const totalDmg = chanceRound(totalDmgRaw);
    const { dictionary, wordLog } = store;
    const lowerWord = word.toLowerCase();
    const matches = dictionary.filter((v) => v.word.toLowerCase() === lowerWord);

    if (matches.length > 0) {
      const existingEntry = wordLog[lowerWord] || { 
        word: matches[0].word, 
        entries: matches, 
        count: 0, 
        totalDamage: 0 
      };
      set({ 
        wordLog: { 
          ...wordLog, 
          [lowerWord]: { 
            ...existingEntry, 
            count: existingEntry.count + 1, 
            totalDamage: existingEntry.totalDamage + totalDmg 
          } 
        } 
      });
    }
    
    let currentInv = [...store.playerData.inventory];
    usedIndices.forEach((idx) => { currentInv[idx] = null; });

    set((s) => ({
      playerShoutText: actionType,
      gameState: "ACTION",
      playerVisual: "idle",
      playerData: { ...s.playerData, inventory: currentInv },
    }));

    await delay(300);

    if (bonusMana > 0) {
      get().gainMana(bonusMana);
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 90, value: `+${bonusMana} MANA`, color: "#9b59b6" });
    }

    if (actionType === "Guard") {
      const currentShield = get().playerData.shield;
      set({ 
        playerVisual: "guard-1", 
        playerData: { ...get().playerData, shield: currentShield + totalDmg } 
      });
      await delay(200);
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: `+${totalDmg} SHIELD`, color: "#2e75cc" });
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

    get().initSelectedLetters(); 
    set({ playerVisual: "idle", playerShoutText: "" });
    get().endTurn();
  },

  usePotion: (type, value = 5) => { 
    const store = get();
    const { playerData, isSfxOn } = store;
    const { potions } = playerData;

    if (type === "health") {
      if (potions.health <= 0) return;
      const healAmount = 5;
      const newHp = Math.min(playerData.max_hp, playerData.hp + healAmount);
      if (isSfxOn) sfx.playHeal && sfx.playHeal();
      store.addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: `+${healAmount} HP`, color: "#2ecc71" });
      set({ playerData: { ...playerData, hp: newHp, potions: { ...potions, health: potions.health - 1 } } });
    } else if (type === "cure") {
      if (potions.cure <= 0) return;
      const currentInv = [...playerData.inventory];
      const slotsWithStatus = currentInv
        .map((item, index) => (item && item.status ? index : null))
        .filter((index) => index !== null);

      if (slotsWithStatus.length > 0) {
        const targetsToClear = [];
        const numToClear = Math.min(slotsWithStatus.length, 2);
        for (let i = 0; i < numToClear; i++) {
          const randomIndex = Math.floor(Math.random() * slotsWithStatus.length);
          targetsToClear.push(slotsWithStatus.splice(randomIndex, 1)[0]);
        }
        const newInv = currentInv.map((item, index) => {
          if (targetsToClear.includes(index)) {
            return { ...item, status: null, statusDuration: 0 };
          }
          return item;
        });
        store.addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: "CLEANSED 2 STATUS!", color: "#3498db" });
        set({ playerData: { ...playerData, inventory: newInv, potions: { ...potions, cure: potions.cure - 1 } } });
      } else {
        store.addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: "NO STATUS TO CURE", color: "#95a5a6" });
      }
    } else if (type === "reroll") {
      if (potions.reroll <= 0) return;
      
      store.resetSelection();

      const slots = store.playerData.unlockedSlots;
      const currentInventory = get().playerData.inventory; 
      
      let newInventory = DeckManager.generateList(slots);

      newInventory = newInventory.map((newItem, index) => {
        const oldItem = currentInventory[index];
        let restoredItem = { ...newItem };

        if (oldItem) {
          if (oldItem.buff) restoredItem.buff = oldItem.buff;
          if (oldItem.status) {
            restoredItem.status = oldItem.status;
            restoredItem.statusDuration = oldItem.statusDuration;
          }
        }
        return restoredItem;
      });

      if (isSfxOn) sfx.playWalk && sfx.playWalk();
      store.addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: "REROLL!", color: "#f1c40f" });
      
      set({ 
        playerData: { 
          ...get().playerData, 
          inventory: newInventory, 
          potions: { ...potions, reroll: potions.reroll - 1 } 
        } 
      });
    }
  },

  actionSpin: async (newInventory) => {
    set((s) => ({ playerData: { ...s.playerData, inventory: newInventory }, playerShoutText: "SPIN!", gameState: "ACTION" }));
    await delay(600);
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },

  // ✅ แก้ไข: เอาการสุ่มอักษรใหม่ออกตอนกด Pass
  passTurn: async (isManual = false) => {
    const store = get(); 
    // ดึงตัวอักษรที่เลือกไว้กลับลงกระเป๋าก่อน
    store.resetSelection();

    set({ playerShoutText: "PASS!", gameState: "ACTION" });
    await delay(500);
    
    // ไม่เซ็ต newInventory ใดๆ ใช้ของเดิมในกระเป๋าต่อไป
    set({ playerShoutText: "" });
    get().endTurn();
  },

  performPlayerSkill: async (manualTargetId = null) => {
    const store = get();
    const { playerData, isSfxOn, selectedLetters } = store;
    const { ability, mana } = playerData;

    if (!ability || !ability.code) return;
    if (mana < ability.cost) {
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: "Not enough Mana!", color: "#555555", fontSize: "20px" });
      return;
    }

    const activeLetters = selectedLetters.filter((l) => l !== null);
    if (activeLetters.length === 0) {
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: "Need Word!", color: "#ff5555", fontSize: "20px" });
      return;
    }

    const newMana = mana - ability.cost;
    set({ playerData: { ...playerData, mana: newMana } });

    let rawDmg = 0;
    let bonusMana = 0;
    activeLetters.forEach((l) => { 
      rawDmg += getLetterDamage(l.char);
      if (l.buff === "MANA_PLUS") bonusMana += 5;
    });
    let totalDmg = chanceRound(rawDmg);

    if (bonusMana > 0) {
      get().gainMana(bonusMana);
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 90, value: `+${bonusMana} MANA`, color: "#9b59b6" });
    }

    let targetId = manualTargetId || store.hoveredEnemyId;
    if (!targetId && ability.code !== "Expolsion") {
      const firstEnemy = store.enemies.find((e) => e.hp > 0);
      targetId = firstEnemy ? firstEnemy.id : null;
    }

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
            get().damageEnemy(targetId, totalDmg);
          }
        }
        set({ playerVisual: "guard-1" });
        await delay(200);
        if (isSfxOn) sfx.playBlock();
        set((s) => ({ playerData: { ...s.playerData, shield: s.playerData.shield + totalDmg } }));
        get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: `+${totalDmg} SHIELD`, color: "#2e75cc" });
        await delay(500);
        set({ playerX: PLAYER_X_POS, playerVisual: "walk" });
        await delay(400);
        break;

      case "Shadow Slash":
        if (targetId) {
          const target = store.enemies.find((e) => e.id === targetId);
          if (target) {
            if (activeLetters.length > 0) {
              const bonus = getLetterDamage(activeLetters[0].char);
              totalDmg = chanceRound(rawDmg + bonus);
            }
            set({ playerX: target.x - 5, playerVisual: "attack-2" });
            if (isSfxOn) sfx.playHit();
            get().damageEnemy(targetId, totalDmg);
            get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 90, value: "CRIT!", color: "#e67e22", fontSize: "24px" });
            await delay(400);
            set({ playerX: PLAYER_X_POS, playerVisual: "idle" });
          }
        }
        break;

      case "Bat Ambush":
        if (targetId) {
          const target = store.enemies.find((e) => e.id === targetId);
          if (target) {
            set({ playerX: target.x - 12, playerVisual: "walk" });
            await delay(400);
            set({ playerVisual: "attack-1" });
            await delay(200);
            set({ playerVisual: "attack-2" });
            if (isSfxOn) sfx.playHit();
            get().damageEnemy(targetId, totalDmg);
            const healAmount = Math.floor(totalDmg * 0.5);
            if (healAmount > 0) {
                set((s) => {
                    const currentHp = Number(s.playerData.hp) || 0;
                    const maxHpVal = Number(s.playerData.max_hp) || 20;
                    return { playerData: { ...s.playerData, hp: Math.min(maxHpVal, currentHp + healAmount) } };
                });
                get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: `+${healAmount} HP`, color: "#2ecc71" });
            }
            await delay(500);
            set({ playerX: PLAYER_X_POS, playerVisual: "walk" });
            await delay(400);
          }
        }
        break;

      case "Expolsion":
        set({ playerVisual: "attack-2" });
        await delay(300);
        if (isSfxOn) sfx.playHit();
        store.enemies.forEach((e) => { if (e.hp > 0) get().damageEnemy(e.id, totalDmg); });
        await delay(300);
        break;

      default:
        if (targetId) get().damageEnemy(targetId, totalDmg);
    }

    let currentInv = [...store.playerData.inventory];
    activeLetters.forEach((item) => { if (item && item.originalIndex !== undefined) currentInv[item.originalIndex] = null; });

    set((s) => ({
      playerData: { ...s.playerData, inventory: currentInv },
      selectedLetters: new Array(s.playerData.unlockedSlots).fill(null),
      validWordInfo: null,
    }));

    get().initSelectedLetters(); 
    await delay(300);
    set({ playerVisual: "idle", playerShoutText: "" });
    get().endTurn();
  },

  updateEnemy: (id, data) => set((s) => ({ enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...data } : e)) })),
  
  damageEnemy: (id, dmg) => {
    const target = get().enemies.find((e) => e.id === id);
    if (!target) return;
    let finalDmg = dmg;
    let currentShield = target.shield || 0;
    if (currentShield > 0) {
      if (currentShield >= dmg) { currentShield -= dmg; finalDmg = 0; }
      else { finalDmg -= currentShield; currentShield = 0; }
      get().updateEnemy(id, { shield: currentShield });
    }
    const newHp = Math.max(0, target.hp - finalDmg);
    const newMana = Math.min(target.quiz_move_cost, target.mana + finalDmg); 

    get().updateEnemy(id, { hp: newHp, mana: newMana });
    get().addPopup({ id: Math.random(), x: target.x - 2, y: FIXED_Y - 80, value: finalDmg, color: "#cc2e2e" });
    if (newHp <= 0) set((state) => ({ receivedCoin: state.receivedCoin + (target.exp || 0) }));
  },

  damagePlayer: (dmg, ignoreShield = false) => {
    const { playerData: stat, isSfxOn } = get();
    let remainingDmg = dmg;
    let newShield = stat.shield;
    if (!ignoreShield && newShield > 0) {
      const blockAmount = Math.min(newShield, remainingDmg);
      newShield -= blockAmount;
      remainingDmg -= blockAmount;
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: "BLOCK!", color: "#ffffff" });
      if (remainingDmg === 0) {
        if (isSfxOn) sfx.playBlock();
        set({ playerVisual: "guard-1" });
        setTimeout(() => set({ playerVisual: "idle" }), 600);
      }
    }
    const newHp = Math.max(0, stat.hp - remainingDmg);
    set({ playerData: { ...stat, hp: newHp, shield: newShield } });
    if (remainingDmg > 0) {
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS - 2, y: FIXED_Y - 50, value: remainingDmg, isPlayer: true, color: "#cc2e2e" });
      get().gainMana(remainingDmg);
    }
    if (newHp <= 0) { bgm.stop(); set({ gameState: "OVER" }); }
  },

  applyStatusToPlayer: (code, chance, count, turn) => {
    if (!code) return;
    const roll = Math.floor(Math.random() * 100);
    if (roll >= chance) return;

    const store = get();
    const currentInv = [...store.playerData.inventory];
    const availableSlots = currentInv
      .map((s, i) => (s && s.char && !s.status ? i : null))
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
            statusDuration: turn 
          };
        }
      });
      const debuffColors = { POISON: "#2ecc71", BLEED: "#e74c3c", BLIND: "#8e44ad", STUN: "#f1c40f" };
      set({ playerData: { ...store.playerData, inventory: currentInv } });
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: `${code}!`, color: debuffColors[code] || "#8e44ad" });
    }
  },

  performEnemySkill: async (enemyId) => {
    const store = get();
    const en = store.enemies.find(e => e.id === enemyId);
    if (!en || !en.quiz_move_info) return;
    const moveData = en.quiz_move_info;
    get().updateEnemy(en.id, { mana: 0, shoutText: moveData.name || "ULTIMATE!" });
    await delay(800); 
    const atkX = en.isBoss ? PLAYER_X_POS + 15 : PLAYER_X_POS + 10;
    const originalX = en.x;
    get().updateEnemy(en.id, { x: atkX, atkFrame: 1 });
    await delay(400);
    const rawAtk = en.power;
    const finalValue = Math.floor((rawAtk * (moveData.power || 0)) / 100);
    await get().handleQuizMove(en, finalValue, moveData);
    get().updateEnemy(en.id, { x: originalX, atkFrame: 0, shoutText: "" });
    await delay(300);
  },

  runEnemyTurn: async (enemyId) => {
    const store = get();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });
    let en = store.enemies.find((e) => e.id === enemyId);
    if (!en || en.hp <= 0) { get().endTurn(); return; }
    get().updateEnemy(en.id, { shield: 0 });

    if (en.mana >= en.quiz_move_cost && en.quiz_move_info) {
        await get().performEnemySkill(en.id);
        en = get().enemies.find((e) => e.id === enemyId);
        if (get().playerData.hp <= 0) { bgm.stop(); set({ gameState: "OVER" }); return; }
    }

    const actionObj = en.pattern_list?.find((p) => p.pattern_no === en.selectedPattern && p.order === en.currentStep);
    
    if (!actionObj || !actionObj.move || actionObj.move.type === "WAIT") {
      const displayMoveName = actionObj?.move?.move_name || "...";
      get().updateEnemy(en.id, { shoutText: displayMoveName });
      await delay(800);
      let nextStep = en.currentStep + 1;
      let nextPattern = en.selectedPattern;
      if (!en.pattern_list?.some(p => p.pattern_no === en.selectedPattern && p.order === nextStep)) {
          nextStep = 1;
          const uniquePatterns = [...new Set(en.pattern_list?.map(p => p.pattern_no) || [])];
          if (uniquePatterns.length > 1) nextPattern = uniquePatterns[Math.floor(Math.random() * uniquePatterns.length)];
      }
      get().updateEnemy(en.id, { shoutText: "", currentStep: nextStep, selectedPattern: nextPattern });
      get().endTurn();
      return;
    }

    const moveData = actionObj.move;
    let wordDamageRaw = 0; 
    let finalInv = [...get().playerData.inventory];

    if (!moveData.is_quiz) {
      const currentInv = [...get().playerData.inventory];
      const availableItems = currentInv.filter(item => item !== null && item.char);
      const oxfordDictionary = store.dictionary.filter(d => d.is_oxford === true);
      const targetDict = oxfordDictionary.length > 0 ? oxfordDictionary : store.dictionary;
      const { bestWord, usedItems } = findBestWordFromLetters(availableItems, targetDict, en.power);

      if (bestWord) {
        get().updateEnemy(en.id, { shoutText: moveData.name || "ACTION!" });
        await delay(600);
        get().updateEnemy(en.id, { shoutText: "" });
        let enemySelectedArea = new Array(get().playerData.unlockedSlots).fill(null);
        for (let i = 0; i < usedItems.length; i++) {
          const targetItem = usedItems[i];
          const invIdx = finalInv.findIndex(item => item?.id === targetItem.id);
          if (invIdx !== -1) {
            wordDamageRaw += getLetterDamage(targetItem.char);
            enemySelectedArea[i] = { ...finalInv[invIdx], originalIndex: invIdx };
            finalInv[invIdx] = null; 
            set({ 
              selectedLetters: [...enemySelectedArea], 
              playerData: { ...get().playerData, inventory: [...finalInv] } 
            });
            if (store.isSfxOn) sfx.playWalk();
            await delay(400); 
          }
        }
        get().checkCurrentWord(enemySelectedArea);
        await delay(1500); 
        set({ validWordInfo: null });
        get().initSelectedLetters();
        get().updateEnemy(en.id, { shoutText: bestWord.toUpperCase() });
        await delay(800); 
      } else {
        get().updateEnemy(en.id, { shoutText: "PASS..." });
        await delay(1000);
        let nextStep = en.currentStep + 1;
        if (!en.pattern_list?.some(p => p.pattern_no === en.selectedPattern && p.order === nextStep)) nextStep = 1;
        get().updateEnemy(en.id, { currentStep: nextStep });
        get().endTurn();
        return; 
      }
    } else {
      get().updateEnemy(en.id, { shoutText: moveData.name || "ATTACK!" });
      await delay(1000);
    }

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
          get().updateEnemy(en.id, { mana: Math.min(en.quiz_move_cost, en.mana + 10) });
        }
        if (moveData.debuff_code) get().applyStatusToPlayer(moveData.debuff_code, moveData.debuff_chance, moveData.debuff_count, moveData.debuff_turn);
      } 
      else if (moveData.type === "HEAL") {
        const healableEnemies = store.enemies.filter(e => e.hp > 0 && e.hp < e.max_hp);
        if (healableEnemies.length > 0) {
          const targetEnemy = healableEnemies[Math.floor(Math.random() * healableEnemies.length)];
          const healAmt = finalValue;
          get().updateEnemy(targetEnemy.id, { hp: Math.min(targetEnemy.max_hp, targetEnemy.hp + healAmt) });
          get().addPopup({ id: Math.random(), x: targetEnemy.x, y: FIXED_Y - 80, value: `+${healAmt}`, color: "#2ecc71" });
          if (store.isSfxOn) sfx.playHeal && sfx.playHeal();
        } else {
          get().updateEnemy(en.id, { shoutText: "FULL HP" });
          await delay(500);
        }
      }
      else if (moveData.type === "GUARD") {
        get().updateEnemy(en.id, { shield: (en.shield || 0) + finalValue });
        get().addPopup({ id: Math.random(), x: en.x, y: FIXED_Y - 80, value: `+${finalValue} SHIELD`, color: "#3498db" });
      }
      await delay(500);
    }

    if (moveData.is_dash) get().updateEnemy(en.id, { x: originalX, atkFrame: 0 });
    else get().updateEnemy(en.id, { atkFrame: 0 });

    en = get().enemies.find((e) => e.id === enemyId);
    let nextStep = en.currentStep + 1;
    let nextPattern = en.selectedPattern;
    if (!en.pattern_list?.some(p => p.pattern_no === en.selectedPattern && p.order === nextStep)) {
        nextStep = 1;
        const uniquePatterns = [...new Set(en.pattern_list?.map(p => p.pattern_no) || [])];
        if (uniquePatterns.length > 1) nextPattern = uniquePatterns[Math.floor(Math.random() * uniquePatterns.length)];
    }

    get().updateEnemy(en.id, { shoutText: "", currentStep: nextStep, selectedPattern: nextPattern });
    if (get().playerData.hp <= 0) { bgm.stop(); set({ gameState: "OVER" }); return; }
    get().endTurn();
  },

  handleQuizMove: async (en, penaltyDmg, moveData) => {
    const store = get();
    const oxfordDictionary = store.dictionary.filter(d => d.is_oxford === true);
    const vocabList = oxfordDictionary.length > 0 ? oxfordDictionary : store.dictionary;
    const correctEntry = vocabList[Math.floor(Math.random() * vocabList.length)];
    const singleMeaning = typeof correctEntry.meaning === "string"
      ? correctEntry.meaning.split(/,(?![^()]*\))/)[0].trim()
      : correctEntry.meaning;
    const choices = vocabList.filter((v) => v.word !== correctEntry.word).map((v) => ({ ...v, score: WordSystem.getLevenshteinDistance(correctEntry.word, v.word) })).sort((a, b) => a.score - b.score).slice(0, 3).map((w) => w.word);
    const finalChoices = [correctEntry.word, ...choices].sort(() => 0.5 - Math.random());
    get().updateEnemy(en.id, { shoutText: singleMeaning });
    await delay(600);
    set({ gameState: "QUIZ_MODE", currentQuiz: { question: singleMeaning, correctAnswer: correctEntry.word, choices: finalChoices, enemyId: en.id, timeLimit: 10000 } });
    const isCorrect = await new Promise((resolve) => set({ quizResolver: resolve }));
    set({ gameState: "ENEMYTURN" });
    if (isCorrect) {
      get().updateEnemy(en.id, { atkFrame: 2, shoutText: "MISSED!" });
      set({ playerX: PLAYER_X_POS - 5, playerVisual: "walk" });
      if (store.isSfxOn) sfx.playMiss();
    } else {
      get().updateEnemy(en.id, { atkFrame: 2 });
      if (store.isSfxOn) sfx.playHit();
      get().damagePlayer(penaltyDmg);
      if (moveData.debuff_code) get().applyStatusToPlayer(moveData.debuff_code, moveData.debuff_chance, moveData.debuff_count, moveData.debuff_turn);
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

  setInventory: (items) => set({ playerData: { ...get().playerData, inventory: items } }),
}));