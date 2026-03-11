import { create } from "zustand";
import { PLAYER_X_POS, FIXED_Y, ipAddress } from "../const/index";
import { sfx, bgm } from "../utils/sfx";
import { DeckManager, WordSystem } from "../utils/gameSystem";
import { useAuthStore } from "./useAuthStore";
// ==========================================
// 📊 GLOBAL POWER SETTINGS
// ==========================================
export const POWER_GROUPS = {
  G1: ["A", "E", "I", "O", "U"],
  G2: ["L", "N", "S", "T", "R", "D", "G", "B", "C", "M", "P", "F", "H", "K"],
  G3: ["V", "W", "J", "X", "Y", "Q", "Z"],
};

export const GLOBAL_POWER_MAP = {};
Object.entries(POWER_GROUPS).forEach(([group, chars]) => {
  const powerValue = group === "G1" ? 0.5 : group === "G2" ? 1.0 : 1.5;
  chars.forEach((char) => {
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

  const availableChars = new Set(letters.map((l) => l?.char.toLowerCase()));
  const charCounts = {};
  letters.forEach((item) => {
    if (!item) return;
    const c = item.char.toLowerCase();
    charCounts[c] = (charCounts[c] || 0) + 1;
  });

  let bestWord = "";
  let usedItems = [];

  const possibleWords = dictionary.filter(
    ({ word }) =>
      word.length > 0 &&
      word.length <= maxLetters &&
      word.length > bestWord.length &&
      [...word.toLowerCase()].every((char) => availableChars.has(char)),
  );

  possibleWords.forEach(({ word }) => {
    const w = word.toLowerCase();
    const tempCounts = { ...charCounts };
    let canMake = true;

    for (const char of w) {
      if (!tempCounts[char]) {
        canMake = false;
        break;
      }
      tempCounts[char]--;
    }

    if (canMake) {
      bestWord = w;
      const tempLetters = [...letters];
      const currentUsed = [];
      for (const char of w) {
        const idx = tempLetters.findIndex(
          (l) => l?.char.toLowerCase() === char,
        );
        currentUsed.push(tempLetters[idx]);
        tempLetters[idx] = null;
      }
      usedItems = currentUsed;
    }
  });

  return { bestWord, usedItems };
};

export const calculateZoneBuffs = (
  inventory,
  deckList,
  unlockedSlots,
  currentDrawPile = [],
) => {
  let placements = [];
  if (!deckList || deckList.length === 0)
    return { placements, newDrawPile: [] };

  let drawPile = [...currentDrawPile];
  let currentIndex = 0;

  let activeCardIds = inventory
    .filter((item) => item && item.buffId)
    .map((item) => item.buffId);

  while (currentIndex < unlockedSlots) {
    let remainingSpace = unlockedSlots - currentIndex;

    if (drawPile.length === 0) {
      let availableToReshuffle = deckList.filter(
        (c) => !activeCardIds.includes(c.id),
      );

      if (availableToReshuffle.length === 0) {
        break;
      }

      drawPile = [...availableToReshuffle].sort(() => 0.5 - Math.random());
    }

    let validInPile = drawPile.filter((c) => (c.size || 10) <= remainingSpace);

    if (validInPile.length === 0) {
      break;
    }

    const targetCard = validInPile[validInPile.length - 1];
    const cardIndex = drawPile.lastIndexOf(targetCard);

    const card = drawPile.splice(cardIndex, 1)[0];

    const size = card.size || 10;
    const endIndex = currentIndex + size;

    let availableInZone = [];
    for (let i = currentIndex; i < endIndex; i++) {
      if (
        inventory[i] &&
        !inventory[i].buff &&
        !placements.some((p) => p.targetIdx === i)
      ) {
        availableInZone.push(i);
      }
    }

    if (availableInZone.length > 0) {
      const targetIdx =
        availableInZone[Math.floor(Math.random() * availableInZone.length)];
      placements.push({ targetIdx, effect: card.effect, buffId: card.id });
      activeCardIds.push(card.id);
    }

    currentIndex += size;
  }

  return { placements, newDrawPile: drawPile };
};

export const applyRandomBuffs = (inventory, deckList = [], drawPile = []) => {
  const newItems = inventory.map((item) =>
    item ? { ...item, buff: null, buffId: null } : null,
  );
  let validIndices = newItems
    .map((item, idx) => (item ? idx : null))
    .filter((i) => i !== null);

  let updatedDrawPile = [...drawPile];

  if (validIndices.length > 0 && deckList.length > 0) {
    let result = calculateZoneBuffs(
      newItems,
      deckList,
      newItems.length,
      drawPile,
    );
    result.placements.forEach((p) => {
      newItems[p.targetIdx].buff = p.effect;
      newItems[p.targetIdx].buffId = p.buffId;
    });
    updatedDrawPile = result.newDrawPile;
  } else if (validIndices.length > 0) {
    validIndices.forEach((idx) => {
      const roll = Math.random();
      if (roll < 0.1) newItems[idx].buff = "double-dmg";
      else if (roll < 0.2) newItems[idx].buff = "double-guard";
      else if (roll < 0.3) newItems[idx].buff = "mana-plus";
    });
  }
  return { newItems, updatedDrawPile };
};

// ============================================================================
// GAME STORE
// ============================================================================

export const useGameStore = create((set, get) => ({
  isMenuOpen: false,

  isBgmOn: !useAuthStore.getState().isMuted,
  isSfxOn: !useAuthStore.getState().isSfxMuted,

  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),

  toggleBgm: () => {
    useAuthStore.getState().toggleMute();
    const isMutedNow = useAuthStore.getState().isMuted;
    set({ isBgmOn: !isMutedNow });

    if (isMutedNow) {
      bgm.stop();
    } else {
      bgm.playAdvanture();
    }
  },

  toggleSfx: () => {
    useAuthStore.getState().toggleSfxMute();
    const isSfxMutedNow = useAuthStore.getState().isSfxMuted;
    set({ isSfxOn: !isSfxMutedNow });
  },

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
  playerVisual: "idle-1",
  animFrame: 1,
  selectedLetters: [],

  stashEffects: () => {
    const store = get();
    let currentInv = [...store.playerData.inventory];
    let savedStatuses = [...(store.playerData.savedEffects?.statuses || [])];

    const newInv = currentInv.map((item) => {
      if (!item) return item;
      let newItem = { ...item };

      if (newItem.status) {
        savedStatuses.push({
          itemId: newItem.id,
          status: newItem.status,
          duration: newItem.statusDuration,
        });
        newItem.status = null;
        newItem.statusDuration = 0;
      }

      newItem.buff = null;
      newItem.buffId = null;
      return newItem;
    });

    set({
      playerData: {
        ...store.playerData,
        inventory: newInv,
        savedEffects: { buffs: [], statuses: savedStatuses },
      },
    });
  },

  revealEffects: async () => {
    const store = get();
    let currentInv = [...store.playerData.inventory];
    let savedStatuses = [...(store.playerData.savedEffects?.statuses || [])];

    currentInv.forEach((item) => {
      if (!item) return item;
      const sIndex = savedStatuses.findIndex((s) => s.itemId === item.id);
      if (sIndex !== -1) {
        item.status = savedStatuses[sIndex].status;
        item.statusDuration = savedStatuses[sIndex].duration;
        savedStatuses.splice(sIndex, 1);
      }
    });

    savedStatuses.forEach((eff) => {
      const available = currentInv.filter((i) => i && !i.status);
      if (available.length > 0) {
        const target = available[Math.floor(Math.random() * available.length)];
        target.status = eff.status;
        target.statusDuration = eff.duration;
      }
    });

    set({
      playerData: {
        ...store.playerData,
        inventory: [...currentInv],
        savedEffects: { buffs: [], statuses: [] },
      },
    });

    await delay(300);

    const { placements, newDrawPile } = calculateZoneBuffs(
      currentInv,
      store.playerData.deck_list,
      store.playerData.unlockedSlots,
      store.playerData.draw_pile,
    );

    for (const p of placements) {
      currentInv[p.targetIdx] = {
        ...currentInv[p.targetIdx],
        buff: p.effect,
        buffId: p.buffId,
      };
      set({
        playerData: {
          ...get().playerData,
          inventory: [...currentInv],
          draw_pile: newDrawPile,
        },
      });
      if (get().isSfxOn && sfx.playHeal) sfx.playHeal();
      await delay(200);
    }
  },

  playerData: {
    name: "Hero",
    img_path: "",
    level: 1,
    next_exp: 0,
    max_hp: 0,
    hp: 0,
    max_mana: 0,
    mana: 0,
    ability: { code: null, cost: 0, description: null },
    shield: 0,
    speed: 0,
    power: 0,
    unlockedSlots: 0,
    potions: { health: 1, cure: 1, reroll: 1 },
    inventory: [],
    deck_list: [],
    draw_pile: [],
    savedEffects: { buffs: [], statuses: [] },
  },

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
    const word = validLetters
      .map((i) => i.char)
      .join("")
      .toLowerCase();

    let rawScore = 0;
    validLetters.forEach((l) => {
      rawScore += getLetterDamage(l.char);
    });

    set({
      wordScore: {
        raw: rawScore,
        min: Math.floor(rawScore),
        max: Math.ceil(rawScore),
      },
    });

    if (!word) {
      set({ validWordInfo: null });
      return;
    }

    const matches = dictionary.filter((d) => d.word.toLowerCase() === word);

    if (matches.length > 0) {
      const grouped = {};
      matches.forEach((item) => {
        const type = item.category || item.type || "Word";
        const meaningPart =
          typeof item.meaning === "string"
            ? item.meaning.split(/,(?![^()]*\))/).map((m) => m.trim())
            : [item.meaning];

        if (!grouped[type]) grouped[type] = [];
        grouped[type] = [...new Set([...grouped[type], ...meaningPart])];
      });

      const displayTypes = Object.keys(grouped);

      set({
        validWordInfo: {
          word: word,
          entries: grouped,
          displayTypes: displayTypes,
          fullMatches: matches,
          currentDisplayIndex: 0,
        },
      });
    } else {
      set({ validWordInfo: null });
    }
  },
  setWordDisplayIndex: (index) => {
    const { validWordInfo } = get();
    if (validWordInfo) {
      set({ validWordInfo: { ...validWordInfo, currentDisplayIndex: index } });
    }
  },

  setupGame: async (userData, stageId) => {
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
        const { stats, deck_list } = selectedHero;
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
              cost: selectedHero.ability_cost || 0,
              description: selectedHero.ability_description || "No description",
            },
            potions: {
              health: userData.potion.health,
              cure: userData.potion.cure,
              reroll: userData.potion.reroll,
            },
            speed: stats?.speed || 3,
            power: stats?.power || 3,
            unlockedSlots: 20,
            deck_list: deck_list || [],
            draw_pile: [],
            savedEffects: { buffs: [], statuses: [] },
          },
        }));
      }

      const dictRes = await fetch(`/api/dict`);
      const dictData = await dictRes.json();
      const stageRes = await fetch(`/api/getStageById/${stageId}`);
      const stageData = await stageRes.json();

      DeckManager.init();
      await delay(500);

      const isMutedNow = useAuthStore.getState().isMuted;
      if (!isMutedNow) bgm.playAdvanture();

      if (get().isBgmOn) bgm.playAdvanture();
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
            setTimeout(() => {
              const store = get();
              if (store.gameState === "PREPARING_COMBAT") {
                const initialLoot = DeckManager.generateList(
                  store.playerData.unlockedSlots,
                );
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
        draw_pile: [],
        savedEffects: { buffs: [], statuses: [] },
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
        deck_list: e.deck_list || [],
        draw_pile: [],
        shield: 0,
        currentStep: 1,
        selectedPattern: 1,
        savedStatuses: [],
        nextAction: "strike", // 🌟 เริ่มมาให้โจมตีก่อน
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
    store.stashEffects();

    const { playerData } = get();
    let currentInv = [...playerData.inventory];

    while (currentInv.length < playerData.unlockedSlots) {
      currentInv.push(null);
    }

    const newPlayerMana = Math.min(playerData.max_mana, playerData.mana + 5);
    const updatedEnemies = store.enemies.map((e) => {
      if (e.hp <= 0) return e;
      return { ...e, mana: Math.min(e.quiz_move_cost, e.mana + 5) };
    });

    const existingSavedStatuses = playerData.savedEffects?.statuses || [];

    set({
      enemies: updatedEnemies,
      playerData: {
        ...playerData,
        mana: newPlayerMana,
        inventory: currentInv,
        savedEffects: {
          buffs: [],
          statuses: existingSavedStatuses,
        },
      },
    });

    get().addPopup({
      id: Math.random(),
      x: 45,
      y: FIXED_Y - 60,
      value: "Start new round!",
      color: "#ffffff",
    });
    await delay(500);

    let hasDrawn = false;
    for (let i = 0; i < playerData.unlockedSlots; i++) {
      if (currentInv[i] === null) {
        currentInv[i] = DeckManager.createItem(
          i,
          currentInv,
          playerData.unlockedSlots,
        );

        set((state) => ({
          playerData: {
            ...state.playerData,
            inventory: [...currentInv],
          },
        }));

        if (get().isSfxOn && sfx.playWalk) sfx.playWalk();

        hasDrawn = true;
        await delay(100);
      }
    }

    if (hasDrawn) {
      await delay(300);
    }

    const playerInit = Math.max(1, get().playerData.speed);
    let pool = [
      { id: "player", type: "player", name: "You", initiative: playerInit },
    ];
    store.enemies
      .filter((e) => e.hp > 0)
      .forEach((e) => {
        const init = Math.max(1, e.speed || 3);
        pool.push({ id: e.id, type: "enemy", name: e.name, initiative: init });
      });

    const finalQueue = pool
      .sort((a, b) => b.initiative - a.initiative)
      .map((unit, index) => ({
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
      const hasPoison = currentInv.some((s) => s?.status === "poison");
      let totalPoisonDmg = 0;
      if (hasPoison) {
        const dmg = Math.floor(store.playerData.max_hp * 0.15);
        totalPoisonDmg = Math.max(1, dmg);
      }

      let hasInventoryUpdate = false;
      const updatedInv = currentInv.map((slot) => {
        if (!slot) return slot;
        if (["poison", "stun", "blind"].includes(slot.status)) {
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
          const newDuration = slot.statusDuration - 1;
          return newDuration <= 0
            ? { ...slot, status: null, statusDuration: 0 }
            : { ...slot, statusDuration: newDuration };
        }
        return slot;
      });

      if (hasInventoryUpdate || totalPoisonDmg > 0) {
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
          await delay(800);
          get().damagePlayer(totalPoisonDmg, true);
          await delay(600);
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
          await delay(600);
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
        shield: 0,
        draw_pile: [],
        savedEffects: { buffs: [], statuses: [] },
      },
    }));
    if (store.isBgmOn) {
      bgm.stop();
      bgm.playAdvanture();
    }
  },

  finishStage: async () => {
    const store = get();
    if (store.gameState === "LOADING" || store.gameState === "GAME_CLEARED")
      return;
    bgm.stop();
    set({ gameState: "LOADING" });
    try {
      const token = localStorage.getItem("token");
      const currentStageId = store.stageData.id;
      const monsterMoney = Number(store.receivedCoin) || 0;
      const stageRecord = store.userStageHistory.find(
        (s) => s.stage_id === currentStageId,
      );

      const isFirstClear = !stageRecord || !stageRecord.is_completed;

      const stageReward = isFirstClear
        ? Number(store.stageData.money_reward) || 0
        : 0;
      const totalMoney = monsterMoney + stageReward;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const resMoney = await fetch(`/api/update-money`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ amount: totalMoney }),
      });
      const resMoneyData = await resMoney.json();
      if (resMoneyData.isSuccess) {
        set({ currentCoin: resMoneyData.currentMoney });
      }

      if (isFirstClear) {
        try {
          await fetch(`/api/upgrade-potion-slot`, {
            method: "POST",
            headers: headers,
          });
        } catch (slotErr) {
          console.error("Failed to upgrade potion slot:", slotErr);
        }
      }

      const unlockRes = await fetch(`/api/complete-stage`, {
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
      const totalMoney = Number(earnedAmount) || 0;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const resMoney = await fetch(`/api/update-money`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ amount: totalMoney }),
      });
      const resMoneyData = await resMoney.json();
      if (resMoneyData.isSuccess) {
        set({ currentCoin: resMoneyData.currentMoney });
      }
    } catch (error) {
      console.error("Save Money Error:", error);
    }
  },

  startPlayerTurn: async () => {
    const store = get();
    const currentShield = store.playerData.shield || 0;
    const newShield = Math.floor(currentShield / 2); // ลดเกราะเหลือครึ่งนึง ปัดลง
    const lostShield = currentShield - newShield;

    set((state) => ({
      gameState: "ACTION",
      playerVisual: "idle-1",
      playerData: {
        ...state.playerData,
        shield: newShield,
      },
    }));

    if (lostShield > 0) {
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 60,
        value: `-${lostShield} SHIELD`,
        color: "#95a5a6",
      });
      await delay(500);
    }

    await get().revealEffects();

    set({ gameState: "PLAYERTURN" });
  },

  performPlayerAction: async (actionType, word, targetId, usedIndices) => {
    const store = get();
    const { validWordInfo, wordLog, playerData, enemies, isSfxOn } = store;

    const itemsUsedInAction = store.selectedLetters.filter((l) => l !== null);
    const wordLength = itemsUsedInAction.length;
    const playerPower = playerData.power || 3;

    let totalDmgRaw = 0;
    let bonusMana = 0;
    let bonusShield = 0;

    let poisonCount = 0;
    let bleedCount = 0;
    let stunCount = 0;
    let blindCount = 0;
    let blessCount = 0;
    let healAmount = 0;
    let vampireFangCount = 0;

    itemsUsedInAction.forEach((item) => {
      let letterDmg = getLetterDamage(item.char);

      if (item.buff === "double-dmg" && actionType === "Strike") {
        letterDmg *= 2;
      } else if (
        (item.buff === "double-guard" || item.buff === "double-shield") &&
        actionType === "Guard"
      ) {
        letterDmg *= 2;
      } else if (item.buff === "mana-plus") {
        bonusMana += 5;
      } else if (item.buff === "shield-plus" && actionType === "Strike") {
        bonusShield += 1;
      } else if (item.buff === "add_poison" || item.buff === "add_posion")
        poisonCount++;
      else if (item.buff === "add_bleed") bleedCount++;
      else if (item.buff === "add_stun") stunCount++;
      else if (item.buff === "add_blind") blindCount++;
      else if (item.buff === "bless" && actionType === "Guard") blessCount++;
      else if (item.buff === "heal" && actionType === "Guard")
        healAmount += Math.ceil(letterDmg);
      else if (item.buff === "vampire_fang" && actionType === "Strike")
        vampireFangCount++;

      totalDmgRaw += letterDmg;
    });

    const totalDmg = chanceRound(totalDmgRaw);

    let recoilDamage = 0;
    const excessLetters = wordLength - playerPower;
    if (excessLetters > 0) {
      recoilDamage = excessLetters;
    }

    if (validWordInfo) {
      const lowerWord = word.toLowerCase();
      const currentType =
        validWordInfo.displayTypes[validWordInfo.currentDisplayIndex];
      const filteredMatches = validWordInfo.fullMatches.filter(
        (m) => (m.category || m.type || "Word") === currentType,
      );
      const activeMatch = filteredMatches[0];

      if (activeMatch) {
        const logKey = `${lowerWord}_${currentType}`;
        const existingEntry = wordLog[logKey] || {
          word: activeMatch.word,
          type: currentType,
          entries: filteredMatches,
          count: 0,
          totalDamage: 0,
        };

        set({
          wordLog: {
            ...wordLog,
            [logKey]: {
              ...existingEntry,
              count: existingEntry.count + 1,
              totalDamage: existingEntry.totalDamage + totalDmg,
            },
          },
        });
      }
    }

    let currentInv = [...playerData.inventory];
    let playerSavedStatuses = [...(playerData.savedEffects?.statuses || [])];

    if (blessCount > 0 && actionType === "Guard") {
      for (let i = 0; i < blessCount; i++) {
        const infectedIndices = currentInv
          .map((item, idx) => (item?.status ? idx : -1))
          .filter((idx) => idx !== -1);
        if (infectedIndices.length > 0) {
          const rIdx =
            infectedIndices[Math.floor(Math.random() * infectedIndices.length)];
          currentInv[rIdx].status = null;
          currentInv[rIdx].statusDuration = 0;
        } else if (playerSavedStatuses.length > 0) {
          playerSavedStatuses.shift();
        }
      }
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 110,
        value: `BLESSED!`,
        color: "#f1c40f",
      });
      await delay(600);
    }

    usedIndices.forEach((idx) => {
      if (idx !== undefined) currentInv[idx] = null;
    });

    set((s) => ({
      playerShoutText: actionType,
      gameState: "ACTION",
      playerVisual: "idle-1",
      playerData: {
        ...s.playerData,
        inventory: currentInv,
        savedEffects: {
          ...s.playerData.savedEffects,
          statuses: playerSavedStatuses,
        },
      },
      selectedLetters: new Array(s.playerData.unlockedSlots).fill(null),
      validWordInfo: null,
      wordScore: { raw: 0, min: 0, max: 0 },
    }));

    await delay(300);

    if (bonusMana > 0) {
      get().gainMana(bonusMana);
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 90,
        value: `+${bonusMana} MANA`,
        color: "#9b59b6",
      });
      await delay(500);
    }

    if (actionType === "Guard") {
      let finalHp = get().playerData.hp;
      if (healAmount > 0) {
        finalHp = Math.min(
          get().playerData.max_hp,
          get().playerData.hp + healAmount,
        );
        get().addPopup({
          id: Math.random(),
          x: PLAYER_X_POS,
          y: FIXED_Y - 80,
          value: `+${healAmount} HP`,
          color: "#2ecc71",
        });
        if (isSfxOn && sfx.playHeal) sfx.playHeal();
        await delay(600);
      }

      set({
        playerVisual: "guard-1",
        playerData: {
          ...get().playerData,
          hp: finalHp,
          shield: get().playerData.shield + totalDmg,
        },
      });
      await delay(200);
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 60,
        value: `+${totalDmg} SHIELD`,
        color: "#2e75cc",
      });
      get().gainMana(5);
      await delay(800);
    } else if (actionType === "Strike") {
      const target = enemies.find((e) => e.id === targetId);
      if (target) {
        set({ playerX: target.x - 10, playerVisual: "walk" });
        await delay(200);
        set({ playerVisual: "attack-1" });
        await delay(400);
        if (isSfxOn && sfx.playHit) sfx.playHit();
        set({ playerVisual: "attack-2" });

        get().damageEnemy(targetId, totalDmg);
        await delay(500);

        if (vampireFangCount > 0) {
          const vChance = 50 + (vampireFangCount - 1) * 25;
          if (Math.random() * 100 < vChance) {
            const stealAmount = Math.ceil(totalDmg / 2);
            if (stealAmount > 0) {
              const newHp = Math.min(
                get().playerData.max_hp,
                get().playerData.hp + stealAmount,
              );
              set({ playerData: { ...get().playerData, hp: newHp } });
              get().addPopup({
                id: Math.random(),
                x: get().playerX,
                y: FIXED_Y - 80,
                value: `+${stealAmount} HP`,
                color: "#2ecc71",
              });
              if (isSfxOn && sfx.playHeal) sfx.playHeal();
              await delay(600);
            }
          }
        }

        const aliveEnemies = get().enemies.filter((e) => e.hp > 0);

        if (aliveEnemies.length > 0) {
          const sortedTargets = [...aliveEnemies].sort((a, b) =>
            a.id === targetId ? -1 : 1,
          );
          const mainTarget = sortedTargets[0];

          if (poisonCount > 0) {
            const currentStatuses = mainTarget.savedStatuses || [];
            const newDebuffs = Array(poisonCount).fill({
              status: "poison",
              duration: 3,
            });
            get().updateEnemy(mainTarget.id, {
              savedStatuses: [...currentStatuses, ...newDebuffs],
            });
            get().addPopup({
              id: Math.random(),
              x: mainTarget.x,
              y: FIXED_Y - 80,
              value: "POISONED!",
              color: "#2ecc71",
            });
            await delay(500);
          }

          if (bleedCount > 0) {
            const bChance = 50 + (bleedCount - 1) * 25;
            if (Math.random() * 100 < bChance) {
              const currentStatuses = mainTarget.savedStatuses || [];
              get().updateEnemy(mainTarget.id, {
                savedStatuses: [
                  ...currentStatuses,
                  { status: "bleed", duration: 3 },
                ],
              });
              get().addPopup({
                id: Math.random(),
                x: mainTarget.x,
                y: FIXED_Y - 80,
                value: "BLEEDING!",
                color: "#e74c3c",
              });
              await delay(500);
            }
          }

          if (stunCount > 0) {
            const currentStatuses = mainTarget.savedStatuses || [];
            let successStunCount = 0;
            for (let k = 0; k < stunCount; k++) {
              if (Math.random() * 100 < 75) successStunCount++;
            }
            if (successStunCount > 0) {
              const newDebuffs = Array(successStunCount).fill({
                status: "stun",
                duration: 1,
              });
              get().updateEnemy(mainTarget.id, {
                savedStatuses: [...currentStatuses, ...newDebuffs],
              });
              get().addPopup({
                id: Math.random(),
                x: mainTarget.x,
                y: FIXED_Y - 80,
                value: "STUNNED!",
                color: "#f1c40f",
              });
              await delay(500);
            }
          }

          if (blindCount > 0) {
            const currentStatuses = mainTarget.savedStatuses || [];
            let successBlindCount = 0;
            for (let k = 0; k < blindCount; k++) {
              if (Math.random() * 100 < 75) successBlindCount++;
            }
            if (successBlindCount > 0) {
              const newDebuffs = Array(successBlindCount).fill({
                status: "blind",
                duration: 2,
              });
              get().updateEnemy(mainTarget.id, {
                savedStatuses: [...currentStatuses, ...newDebuffs],
              });
              get().addPopup({
                id: Math.random(),
                x: mainTarget.x,
                y: FIXED_Y - 80,
                value: "BLINDED!",
                color: "#8e44ad",
              });
              await delay(500);
            }
          }
        }

        if (bonusShield > 0) {
          set({
            playerData: {
              ...get().playerData,
              shield: get().playerData.shield + bonusShield,
            },
          });
          get().addPopup({
            id: Math.random(),
            x: get().playerX,
            y: FIXED_Y - 60,
            value: `+${bonusShield} SHIELD`,
            color: "#2e75cc",
          });
          await delay(500);
        }

        get().gainMana(5);
        await delay(400);
      }
      set({ playerX: PLAYER_X_POS, playerVisual: "walk" });
      await delay(500);
    }

    if (recoilDamage > 0) {
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 90,
        value: `Recoil!`,
        color: "#c0392b",
      });
      if (isSfxOn && sfx.playHit) sfx.playHit();
      get().damagePlayer(recoilDamage, true);
      await delay(800);

      if (get().playerData.hp <= 0) return;
    }

    set({ playerVisual: "idle-1", playerShoutText: "" });
    get().endTurn();
  },

  usePotion: (type, value = 5) => {
    const store = get();
    const { playerData, isSfxOn } = store;
    const { potions } = playerData;

    if (type === "health") {
      if (potions.health <= 0) return;
      const healAmount = 1;
      const newHp = Math.min(playerData.max_hp, playerData.hp + healAmount);
      if (isSfxOn) sfx.playHeal && sfx.playHeal();
      store.addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 80,
        value: `+${healAmount} HP`,
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
      const slotsWithStatus = currentInv
        .map((item, index) => (item && item.status ? index : null))
        .filter((index) => index !== null);
      if (slotsWithStatus.length > 0) {
        const targetsToClear = [];
        const numToClear = Math.min(slotsWithStatus.length, 1);
        for (let i = 0; i < numToClear; i++) {
          const randomIndex = Math.floor(
            Math.random() * slotsWithStatus.length,
          );
          targetsToClear.push(slotsWithStatus.splice(randomIndex, 1)[0]);
        }
        const newInv = currentInv.map((item, index) => {
          if (targetsToClear.includes(index))
            return { ...item, status: null, statusDuration: 0 };
          return item;
        });
        store.addPopup({
          id: Math.random(),
          x: PLAYER_X_POS,
          y: FIXED_Y - 80,
          value: `CLEANSED ${numToClear} STATUS${numToClear > 1 ? "S" : ""}!`,
          color: "#3498db",
        });
        set({
          playerData: {
            ...playerData,
            inventory: newInv,
            potions: { ...potions, cure: potions.cure - 1 },
          },
        });
      } else {
        store.addPopup({
          id: Math.random(),
          x: PLAYER_X_POS,
          y: FIXED_Y - 80,
          value: "NO STATUS TO CURE",
          color: "#95a5a6",
        });
      }
    } else if (type === "reroll") {
      if (potions.reroll <= 0) return;
      const currentInv = [...playerData.inventory];
      const itemsToRerollCount = currentInv.filter(
        (item) => item !== null,
      ).length;
      if (itemsToRerollCount > 0) {
        const rawItems = DeckManager.generateList(itemsToRerollCount);
        const { newItems: freshItemsWithBuffs, updatedDrawPile } =
          applyRandomBuffs(
            rawItems,
            playerData.deck_list,
            playerData.draw_pile,
          );
        let generatedIndex = 0;
        const newInv = currentInv.map((oldItem) => {
          if (!oldItem) return null;
          const freshItem = freshItemsWithBuffs[generatedIndex++];
          return {
            ...freshItem,
            status: oldItem.status || null,
            statusDuration: oldItem.statusDuration || 0,
          };
        });
        store.addPopup({
          id: Math.random(),
          x: PLAYER_X_POS,
          y: FIXED_Y - 80,
          value: "REROLL!",
          color: "#f39c12",
        });
        if (isSfxOn && sfx.playHeal) sfx.playHeal();
        set({
          playerData: {
            ...playerData,
            inventory: newInv,
            draw_pile: updatedDrawPile,
            potions: { ...potions, reroll: potions.reroll - 1 },
          },
        });
      }
    }
  },

  actionSpin: async (newInventory) => {
    set((s) => ({
      playerData: { ...s.playerData, inventory: newInventory },
      playerShoutText: "SPIN!",
      gameState: "ACTION",
    }));
    await delay(600);
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },

  passTurn: async () => {
    const store = get();
    store.resetSelection();
    set({ playerShoutText: "PASS!", gameState: "ACTION" });
    await delay(500);
    set({ playerShoutText: "" });
    get().endTurn();
  },

  performPlayerSkill: async (manualTargetId = null) => {
    const store = get();
    const { playerData, isSfxOn, selectedLetters } = store;
    const { ability, mana } = playerData;
    const abilityCodeStr = "SKILL";

    if (!ability) return;

    if (mana < ability.cost) {
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 80,
        value: "Not enough Mana!",
        color: "#555555",
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
      });
      return;
    }
    const newMana = mana - ability.cost;
    set({ playerData: { ...playerData, mana: newMana } });
    let rawDmg = 0;
    let bonusMana = 0;
    activeLetters.forEach((item) => {
      let letterDmg = getLetterDamage(item.char) * 2;
      if (item.buff === "double-dmg") letterDmg *= 2;
      if (item.buff === "mana-plus") bonusMana += 5;
      rawDmg += letterDmg;
    });
    const totalDmg = chanceRound(rawDmg);
    if (bonusMana > 0) {
      get().gainMana(bonusMana);
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 90,
        value: `+${bonusMana} MANA`,
        color: "#9b59b6",
      });
      await delay(400);
    }
    let targetId = manualTargetId || store.hoveredEnemyId;
    if (!targetId) {
      const firstEnemy = store.enemies.find((e) => e.hp > 0);
      targetId = firstEnemy ? firstEnemy.id : null;
    }
    let currentInv = [...store.playerData.inventory];
    activeLetters.forEach((item) => {
      if (item && item.originalIndex !== undefined)
        currentInv[item.originalIndex] = null;
    });
    set((s) => ({
      playerShoutText: abilityCodeStr,
      playerVisual: "idle-1",
      playerData: { ...s.playerData, inventory: currentInv },
      selectedLetters: new Array(s.playerData.unlockedSlots).fill(null),
      validWordInfo: null,
      wordScore: { raw: 0, min: 0, max: 0 },
    }));
    await delay(300);
    if (targetId) {
      const target = store.enemies.find((e) => e.id === targetId);
      if (target) {
        set({ playerX: target.x - 10, playerVisual: "walk" });
        await delay(200);
        set({ playerVisual: "attack-1" });
        await delay(400);
        if (store.isSfxOn) sfx.playHit();
        set({ playerVisual: "attack-2" });
        get().damageEnemy(targetId, totalDmg);
        await delay(600);
      }
      set({ playerX: PLAYER_X_POS, playerVisual: "walk" });
      await delay(500);
    }
    set({ playerVisual: "idle-1", playerShoutText: "" });
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
    const newMana = Math.min(target.quiz_move_cost, target.mana + finalDmg);
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
        receivedCoin: Number(state.receivedCoin || 0) + Number(target.exp || 0),
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
        setTimeout(() => set({ playerVisual: "idle-1" }), 600);
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
    if (roll >= chance) return;
    const store = get();
    const debuffColors = {
      POISON: "#2ecc71",
      BLEED: "#e74c3c",
      BLIND: "#8e44ad",
      STUN: "#f1c40f",
    };
    let newStatuses = Array(count).fill({
      status: code.toLowerCase(),
      duration: turn,
    });
    set({
      playerData: {
        ...store.playerData,
        savedEffects: {
          buffs: [],
          statuses: [
            ...(store.playerData.savedEffects?.statuses || []),
            ...newStatuses,
          ],
        },
      },
    });
    get().addPopup({
      id: Math.random(),
      x: PLAYER_X_POS,
      y: FIXED_Y - 80,
      value: `${code}!`,
      color: debuffColors[code.toUpperCase()] || "#8e44ad",
    });
  },

  performEnemySkill: async (enemyId) => {
    const store = get();
    const en = store.enemies.find((e) => e.id === enemyId);
    if (!en) return;

    get().updateEnemy(en.id, {
      mana: 0,
      shoutText: "ULTIMATE!",
    });
    await delay(800);
    const atkX = en.isBoss ? PLAYER_X_POS + 15 : PLAYER_X_POS + 10;
    const originalX = en.x;
    get().updateEnemy(en.id, { x: atkX, atkFrame: 1 });
    await delay(400);

    const finalValue = en.power * 2;

    await get().handleQuizMove(en, finalValue);
    get().updateEnemy(en.id, { x: originalX, atkFrame: 0, shoutText: "" });
    await delay(300);
  },

  runEnemyTurn: async (enemyId) => {
    const store = get();

    get().stashEffects();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });

    let en = store.enemies.find((e) => e.id === enemyId);
    if (!en || en.hp <= 0) {
      get().endTurn();
      return;
    }

    // === 🛡️ ระบบลดเกราะศัตรูตอนเริ่มเทิร์น ===
    const currentShield = en.shield || 0;
    const newShield = Math.floor(currentShield / 2);
    const lostShield = currentShield - newShield;

    if (lostShield > 0) {
      get().addPopup({
        id: Math.random(),
        x: en.x,
        y: FIXED_Y - 60,
        value: `-${lostShield} SHIELD`,
        color: "#95a5a6",
      });
      await delay(500);
    }
    get().updateEnemy(en.id, { shield: newShield });

    let currentInv = [...get().playerData.inventory];
    let eSavedStatuses = [...(en.savedStatuses || [])];

    currentInv.forEach((item) => {
      if (!item) return;
      const sIndex = eSavedStatuses.findIndex((s) => s.itemId === item.id);
      if (sIndex !== -1) {
        item.status = eSavedStatuses[sIndex].status;
        item.statusDuration = eSavedStatuses[sIndex].duration;
        eSavedStatuses.splice(sIndex, 1);
      }
    });

    eSavedStatuses.forEach((eff) => {
      const available = currentInv.filter((i) => i && !i.status);
      if (available.length > 0) {
        const target = available[Math.floor(Math.random() * available.length)];
        target.status = eff.status;
        target.statusDuration = eff.duration;
      }
    });

    set({ playerData: { ...get().playerData, inventory: currentInv } });
    await delay(600);

    // === ⚔️🛡️ ระบบสลับ Action ระหว่าง โจมตี และ ป้องกัน ===
    const actionType = en.nextAction || "strike";
    get().updateEnemy(en.id, { nextAction: actionType === "strike" ? "guard" : "strike" });

    if (en.mana >= en.quiz_move_cost) {
      await get().performEnemySkill(en.id);
      if (get().playerData.hp <= 0) {
        bgm.stop();
        set({ gameState: "OVER" });
        return;
      }
      en = get().enemies.find((e) => e.id === enemyId);
      if (!en || en.hp <= 0) {
        get().endTurn();
        return;
      }
    }

    const { placements, newDrawPile } = calculateZoneBuffs(
      currentInv,
      en.deck_list,
      get().playerData.unlockedSlots,
      en.draw_pile,
    );

    get().updateEnemy(en.id, { draw_pile: newDrawPile });

    if (placements.length > 0) {
      for (const p of placements) {
        currentInv[p.targetIdx] = {
          ...currentInv[p.targetIdx],
          buff: p.effect,
        };
        set({
          playerData: { ...get().playerData, inventory: [...currentInv] },
        });
        if (store.isSfxOn && sfx.playHeal) sfx.playHeal();
        await delay(300);
      }
    }

    const availableItems = currentInv.filter((item) => {
      if (item === null || !item.char) return false;
      if (item.status === "stun") return false;
      if (item.status === "blind") {
        return Math.random() < 0.25;
      }
      return true;
    });

    const oxfordDictionary = store.dictionary.filter(
      (d) => d.is_oxford === true,
    );
    const targetDict =
      oxfordDictionary.length > 0 ? oxfordDictionary : store.dictionary;
    const { bestWord, usedItems } = findBestWordFromLetters(
      availableItems,
      targetDict,
      en.power,
    );

    if (bestWord) {
      get().updateEnemy(en.id, { shoutText: actionType === "guard" ? "GUARD!" : "STRIKE!" });
      await delay(600);
      get().updateEnemy(en.id, { shoutText: "" });
      
      let enemySelectedArea = new Array(get().playerData.unlockedSlots).fill(null);
      let wordDamageRaw = 0;
      let bonusMana = 0;
      let bonusShield = 0;

      let enemyPoisonCount = 0;
      let enemyBleedCount = 0;
      let enemyStunCount = 0;
      let enemyBlindCount = 0;
      let enemyVampireCount = 0;

      let enemyHealAmount = 0;
      let enemyBlessCount = 0;

      for (let i = 0; i < usedItems.length; i++) {
        const targetItem = usedItems[i];
        const invIdx = currentInv.findIndex(
          (item) => item?.id === targetItem.id,
        );
        if (invIdx !== -1) {
          let letterDmg = getLetterDamage(targetItem.char);

          if (targetItem.buff === "double-dmg" && actionType === "strike") letterDmg *= 2;
          if ((targetItem.buff === "double-guard" || targetItem.buff === "double-shield") && actionType === "guard") letterDmg *= 2;

          if (targetItem.buff === "mana-plus") bonusMana += 5;
          if (targetItem.buff === "shield-plus" && actionType === "strike") bonusShield += 1;

          if (targetItem.buff === "add_poison" || targetItem.buff === "add_posion") enemyPoisonCount++;
          if (targetItem.buff === "add_bleed") enemyBleedCount++;
          if (targetItem.buff === "add_stun") enemyStunCount++;
          if (targetItem.buff === "add_blind") enemyBlindCount++;
          if (targetItem.buff === "vampire_fang" && actionType === "strike") enemyVampireCount++;

          if (targetItem.buff === "heal" && actionType === "guard") enemyHealAmount += Math.ceil(letterDmg);
          if (targetItem.buff === "bless" && actionType === "guard") enemyBlessCount++;

          wordDamageRaw += letterDmg;
          enemySelectedArea[i] = {
            ...currentInv[invIdx],
            originalIndex: invIdx,
          };
          currentInv[invIdx] = null;

          set({
            selectedLetters: [...enemySelectedArea],
            playerData: { ...get().playerData, inventory: [...currentInv] },
          });
          if (store.isSfxOn) sfx.playWalk();
          await delay(400);
        }
      }

      get().checkCurrentWord(enemySelectedArea);
      await delay(1500);
      set({ validWordInfo: null, wordScore: { raw: 0, min: 0, max: 0 } });
      get().initSelectedLetters();
      get().updateEnemy(en.id, { shoutText: bestWord.toUpperCase() });
      await delay(800);
      get().updateEnemy(en.id, { shoutText: "" });

      const originalX = en.x;
      const finalValue = chanceRound(wordDamageRaw);
      let currentActionShieldBonus = 0;

      if (actionType === "guard") {
        // === 🌟 ดาเมจจากคำศัพท์ทั้งหมดจะถูกเปลี่ยนเป็น Shield เมื่อเลือก Guard 🌟 ===
        currentActionShieldBonus = finalValue;
        get().addPopup({
          id: Math.random(),
          x: en.x,
          y: FIXED_Y - 60,
          value: `+${finalValue} SHIELD`,
          color: "#2e75cc",
        });
        await delay(600);
      } else {
        const atkX = en.isBoss ? PLAYER_X_POS + 15 : PLAYER_X_POS + 10;
        get().updateEnemy(en.id, { x: atkX, atkFrame: 1 });
        await delay(400);
        get().updateEnemy(en.id, { atkFrame: 2 });

        if (finalValue > 0) {
          get().damagePlayer(finalValue);
          if (store.isSfxOn) sfx.playHit();
          en = get().enemies.find((e) => e.id === enemyId);
          await delay(600);
        }
      }

      let newEnHp = en.hp;
      if (enemyHealAmount > 0) {
        newEnHp = Math.min(en.max_hp, newEnHp + enemyHealAmount);
        get().addPopup({
          id: Math.random(),
          x: en.x,
          y: FIXED_Y - 80,
          value: `+${enemyHealAmount} HP`,
          color: "#2ecc71",
        });
        await delay(500);
      }
      
      if (enemyVampireCount > 0 && actionType === "strike") {
        const vChance = 50 + (enemyVampireCount - 1) * 25;
        if (Math.random() * 100 < vChance) {
          const stealAmount = Math.ceil(finalValue / 2);
          if (stealAmount > 0) {
            newEnHp = Math.min(en.max_hp, newEnHp + stealAmount);
            get().addPopup({
              id: Math.random(),
              x: en.x,
              y: FIXED_Y - 80,
              value: `+${stealAmount} HP`,
              color: "#2ecc71",
            });
            await delay(500);
          }
        }
      }

      get().updateEnemy(en.id, {
        hp: newEnHp,
        mana: Math.min(en.quiz_move_cost, en.mana + bonusMana + 10),
        shield: (en.shield || 0) + bonusShield + currentActionShieldBonus,
      });

      if (enemyBlessCount > 0) {
        let eSavedStatuses = [...(en.savedStatuses || [])];
        for (let i = 0; i < enemyBlessCount; i++) {
          const infectedIndices = currentInv
            .map((item, idx) => (item?.status ? idx : -1))
            .filter((idx) => idx !== -1);
          if (infectedIndices.length > 0) {
            const rIdx =
              infectedIndices[
                Math.floor(Math.random() * infectedIndices.length)
              ];
            currentInv[rIdx].status = null;
            currentInv[rIdx].statusDuration = 0;
          } else if (eSavedStatuses.length > 0) {
            eSavedStatuses.shift();
          }
        }
        get().updateEnemy(en.id, { savedStatuses: eSavedStatuses });
        get().addPopup({
          id: Math.random(),
          x: en.x,
          y: FIXED_Y - 110,
          value: `BLESSED!`,
          color: "#f1c40f",
        });
        await delay(600);
      }

      if (actionType === "strike") {
        if (enemyPoisonCount > 0) {
          get().applyStatusToPlayer("poison", 100, enemyPoisonCount, 3);
          await delay(500);
        }
        if (enemyBleedCount > 0) {
          const bChance = 50 + (enemyBleedCount - 1) * 25;
          if (Math.random() * 100 < bChance) {
            get().applyStatusToPlayer("bleed", 100, 1, 3);
            await delay(500);
          }
        }
        if (enemyStunCount > 0) {
          let successStunCount = 0;
          for (let k = 0; k < enemyStunCount; k++) {
            if (Math.random() * 100 < 75) successStunCount++;
          }
          if (successStunCount > 0) {
            get().applyStatusToPlayer("stun", 100, successStunCount, 1);
            await delay(500);
          }
        }
        if (enemyBlindCount > 0) {
          let successBlindCount = 0;
          for (let k = 0; k < enemyBlindCount; k++) {
            if (Math.random() * 100 < 75) successBlindCount++;
          }
          if (successBlindCount > 0) {
            get().applyStatusToPlayer("blind", 100, successBlindCount, 2);
            await delay(500);
          }
        }
      }

      await delay(500);
      if (actionType === "strike") {
        get().updateEnemy(en.id, { x: originalX, atkFrame: 0 });
      }
    } else {
      get().updateEnemy(en.id, { shoutText: "PASS..." });
      await delay(1000);
    }

    let poisonDmg = 0;
    let bleedExplode = false;
    let hasInvUpdate = false;
    const totalBleed = currentInv.filter((s) => s?.status === "bleed").length;
    if (totalBleed >= 3) bleedExplode = true;

    if (currentInv.some((s) => s?.status === "poison")) {
      poisonDmg = Math.max(1, Math.floor(en.max_hp * 0.1));
    }

    currentInv = currentInv.map((slot) => {
      if (!slot || !slot.status) return slot;
      hasInvUpdate = true;
      if (["poison", "stun", "blind"].includes(slot.status)) {
        const nDur = slot.statusDuration - 1;
        return nDur <= 0
          ? { ...slot, status: null, statusDuration: 0 }
          : { ...slot, statusDuration: nDur };
      }
      if (slot.status === "bleed") {
        if (bleedExplode) return { ...slot, status: null, statusDuration: 0 };
        const nDur = slot.statusDuration - 1;
        return nDur <= 0
          ? { ...slot, status: null, statusDuration: 0 }
          : { ...slot, statusDuration: nDur };
      }
      return slot;
    });

    if (hasInvUpdate || poisonDmg > 0) {
      set({ playerData: { ...get().playerData, inventory: currentInv } });
      if (poisonDmg > 0) {
        get().addPopup({
          id: Math.random(),
          x: en.x,
          y: FIXED_Y - 60,
          value: "POISON!",
          color: "#2ecc71",
        });
        get().damageEnemy(en.id, poisonDmg);
        await delay(800);
      }
      if (bleedExplode) {
        const bDmg = Math.max(1, Math.floor(en.max_hp * 0.3));
        get().addPopup({
          id: Math.random(),
          x: en.x,
          y: FIXED_Y - 60,
          value: "BLOOD EXPLOSION!",
          color: "#c0392b",
        });
        get().damageEnemy(en.id, bDmg);
        await delay(800);
      }
    }

    en = get().enemies.find((e) => e.id === enemyId);
    if (!en || en.hp <= 0) {
      let cleanedInv = get().playerData.inventory.map((item) =>
        item ? { ...item, buff: null, status: null } : null,
      );
      set({ playerData: { ...get().playerData, inventory: cleanedInv } });
      get().endTurn();
      return;
    }

    let nextEnemySavedStatuses = [];
    currentInv = currentInv.map((item) => {
      if (!item) return item;
      let newItem = { ...item };
      if (newItem.status) {
        nextEnemySavedStatuses.push({
          itemId: newItem.id,
          status: newItem.status,
          duration: newItem.statusDuration,
        });
        newItem.status = null;
        newItem.statusDuration = 0;
      }
      newItem.buff = null;
      return newItem;
    });

    get().updateEnemy(en.id, { savedStatuses: nextEnemySavedStatuses });
    set({ playerData: { ...get().playerData, inventory: currentInv } });

    if (get().playerData.hp <= 0) {
      bgm.stop();
      set({ gameState: "OVER" });
      return;
    }
    get().endTurn();
  },

  handleQuizMove: async (en, penaltyDmg) => {
    const store = get();

    const oxfordDictionary = store.dictionary.filter(
      (d) => d.is_oxford === true,
    );

    let vocabList = oxfordDictionary.filter((d) => d.level === en.level);

    if (vocabList.length === 0) {
      vocabList =
        oxfordDictionary.length > 0 ? oxfordDictionary : store.dictionary;
    }

    const correctEntry =
      vocabList[Math.floor(Math.random() * vocabList.length)];

    const singleMeaning =
      typeof correctEntry.meaning === "string"
        ? correctEntry.meaning.split(/,(?![^()]*\))/)[0].trim()
        : correctEntry.meaning;

    const filteredVocab = vocabList.filter(
      (v) => v.word.toLowerCase() !== correctEntry.word.toLowerCase(),
    );

    const uniqueVocabMap = new Map();
    filteredVocab.forEach((v) => {
      const lowerWord = v.word.toLowerCase();
      if (!uniqueVocabMap.has(lowerWord)) {
        uniqueVocabMap.set(lowerWord, v);
      }
    });

    const uniqueVocabList = Array.from(uniqueVocabMap.values());

    const choices = uniqueVocabList
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

    get().updateEnemy(en.id, { shoutText: singleMeaning });
    await delay(600);
    set({
      gameState: "QUIZ_MODE",
      currentQuiz: {
        question: singleMeaning,
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
      get().updateEnemy(en.id, { atkFrame: 2, shoutText: "MISSED!" });
      set({ playerX: PLAYER_X_POS - 5, playerVisual: "walk-1" });
      if (store.isSfxOn) sfx.playMiss();
    } else {
      get().updateEnemy(en.id, { atkFrame: 2 });
      if (store.isSfxOn) sfx.playHit();
      get().damagePlayer(penaltyDmg);
    }
    await delay(800);
    set({ playerX: PLAYER_X_POS, playerVisual: "idle-1" });
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

useAuthStore.subscribe((state) => {
  useGameStore.setState({
    isBgmOn: !state.isMuted,
    isSfxOn: !state.isSfxMuted,
  });
});