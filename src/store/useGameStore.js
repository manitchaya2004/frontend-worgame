import { create } from "zustand";
import { PLAYER_X_POS, FIXED_Y } from "../const/index";
import { sfx, bgm } from "../utils/sfx";
import { DeckManager, WordSystem, GameLogic } from "../utils/gameSystem";
import { useAuthStore } from "./useAuthStore";
import { supabase } from "../service/supabaseClient";

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
  isFirstClear: false,

  isProcessingUpdate: false,

  update: (dt) => {
    const state = get();
    const updates = {};
    const ANIM_SPEED = 300;
    
    let newTimer = (state.animTimer || 0) + dt;
    if (newTimer >= ANIM_SPEED) {
      newTimer -= ANIM_SPEED;
      updates.animFrame = state.animFrame === 1 ? 2 : 1;
      if (state.gameState === "ADVANTURE" && state.isSfxOn) sfx.playWalk();
    }
    updates.animTimer = newTimer;

    if (state.gameState === "ADVANTURE") {
      const goal = state.stageData?.distant_goal;
      
      if (goal && state.distance >= goal) {
        const nextX = state.playerX + dt * 0.1;
        updates.playerX = nextX;
        if (nextX > 150 && state.gameState !== "LOADING" && state.gameState !== "GAME_CLEARED") {
          set({ gameState: "LOADING" });
          get().finishStage();
        }
      } else {
        const newDist = state.distance + dt * 0.005;
        let nextTargetDist = state.stageData?.events?.[state.currentEventIndex]?.distance || Infinity;

        if (newDist >= nextTargetDist) {
          updates.distance = nextTargetDist;
          updates.gameState = "PREPARING_COMBAT";
          
          requestAnimationFrame(() => {
            const store = get();
            const initialLoot = DeckManager.generateList(store.playerData.unlockedSlots);
            store.spawnEnemies(initialLoot, true);
          });
        } else {
          updates.distance = newDist;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },

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

    const { placements, newDrawPile } = GameLogic.calculateZoneBuffs(
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
      rawScore += DeckManager.getLetterDamage(l.char);
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
      const selectedHero = userData?.heroes?.find((h) => h.is_selected) || userData?.heroes?.[0];
      
      if (userData) {
        set(() => ({
          username: userData.username,
          currentCoin: userData.money,
          userStageHistory: userData.stages || [],
        }));
      }

      if (selectedHero) {
        const { stats, deck_list } = selectedHero;
        // 🌟 แก้ไข: คำนวณ Slot เริ่มต้นจาก 8 + Power (ไม่เกิน 20)
        const initialPower = stats?.power || 3;
        const initialUnlockedSlots = Math.min(8 + initialPower, 20);

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
              cost: selectedHero.ability_cost || 10,
              description: selectedHero.ability_description || "No description",
            },
            potions: {
              health: userData.potion.health,
              cure: userData.potion.cure,
              reroll: userData.potion.reroll,
            },
            speed: stats?.speed || 3,
            power: initialPower,
            unlockedSlots: initialUnlockedSlots, // 🌟 ใช้ค่าที่คำนวณใหม่
            deck_list: deck_list || [],
            draw_pile: [],
            savedEffects: { buffs: [], statuses: [] },
          },
        }));
      }

      let allDictData = [];
      let from = 0;
      let to = 999;
      let hasMore = true;

      while (hasMore) {
        const { data: partDict, error: dictError } = await supabase
          .from('dictionary')
          .select('*')
          .range(from, to);

        if (dictError) throw dictError;
        allDictData = [...allDictData, ...partDict];

        if (partDict.length < 1000) {
          hasMore = false;
        } else {
          from += 1000;
          to += 1000;
        }
      }

      const { data: rawStageData, error: stageError } = await supabase
        .from('stage')
        .select(`
          *,
          monster_spawn (
            spawn_id:id,
            level,
            distant_spawn,
            monster (
              *,
              monster_deck (
                id,
                effect,
                size
              )
            )
          )
        `)
        .eq('id', stageId)
        .single();

      if (stageError) throw stageError;

      const groupedEvents = rawStageData.monster_spawn.reduce((acc, row) => {
        const dist = Number(row.distant_spawn);
        let group = acc.find(g => g.distance === dist);

        const monsterData = {
          spawn_id: row.spawn_id,
          monster_id: row.monster.id,
          level: row.level,
          name: row.monster.name,
          hp: row.monster.hp,
          power: row.monster.power,
          exp: row.monster.exp,
          speed: row.monster.speed,
          isBoss: row.monster.isBoss,
          quiz_move_cost: row.monster.quiz_move_cost,
          deck_list: row.monster.monster_deck ? row.monster.monster_deck.map(d => ({
            id: d.id,
            effect: d.effect,
            size: d.size
          })) : []
        };

        if (group) { group.monsters.push(monsterData); } 
        else { acc.push({ distance: dist, monsters: [monsterData] }); }
        return acc;
      }, []).sort((a, b) => a.distance - b.distance); 

      const finalStageData = {
        id: rawStageData.id,
        orderNo: rawStageData.orderNo,
        name: rawStageData.name,
        description: rawStageData.description,
        money_reward: rawStageData.money_reward,
        distant_goal: rawStageData.distant_goal,
        slot_count: rawStageData.slot_count, 
        is_upgrade_potionn: rawStageData.is_upgrade_potionn,
        events: groupedEvents 
      };

      const STORAGE_HERO = "https://qsopjsioqmqtyaocqmmx.supabase.co/storage/v1/object/public/asset/img_hero/";
      const STORAGE_MONSTER = "https://qsopjsioqmqtyaocqmmx.supabase.co/storage/v1/object/public/asset/img_monster/";
      const STORAGE_MAP = "https://qsopjsioqmqtyaocqmmx.supabase.co/storage/v1/object/public/asset/img_map/";
      
      const imagesToPreload = [];

      const pPath = selectedHero?.hero_id;
      if (pPath) {
        ["idle", "walk", "attack", "guard"].forEach(act => {
          [1, 2].forEach(f => imagesToPreload.push(`${STORAGE_HERO}${pPath}-${act}-${f}.png`));
        });
      }

      finalStageData.events.forEach(ev => {
        ev.monsters.forEach(m => {
          ["idle", "attack"].forEach(act => {
            [1, 2].forEach(f => imagesToPreload.push(`${STORAGE_MONSTER}${m.monster_id}-${act}-${f}.png`));
          });
        });
      });

      if (stageId) {
        imagesToPreload.push(`${STORAGE_MAP}${stageId}.png`);
      }

      const preloadPromises = [...new Set(imagesToPreload)].map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve; 
        });
      });

      await Promise.all(preloadPromises);

      set((state) => ({
        dictionary: allDictData,
        stageData: finalStageData, 
        currentEventIndex: 0,
        gameState: "ADVANTURE",
        username: userData?.username || "",
        currentCoin: userData?.money || 0,
        playerData: {
          ...state.playerData,
          // 🌟 ใช้ unlockedSlots ที่คำนวณจาก Power แทนค่าจาก stageData.slot_count
          unlockedSlots: state.playerData.unlockedSlots, 
        }
      }));

      DeckManager.init();
      await delay(500);

      const isMutedNow = useAuthStore.getState().isMuted;
      if (!isMutedNow) bgm.playAdvanture();

    } catch (error) {
      console.error("❌ Setup Failed:", error);
      set({ gameState: "ERROR" });
    }
  },

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
      hasSpawnedEnemies: false,
      isFirstClear: false,
    });
  },

  spawnEnemies: (loot, autoStart = false) => {
    const store = get();
    if (store.hasSpawnedEnemies && store.gameState !== "PREPARING_COMBAT") return;

    const currentEvent = store.stageData.events[store.currentEventIndex];
    const waveData = currentEvent ? currentEvent.monsters : [];

    let currentX = 85;
    const enemiesWithPos = waveData.map((e, i) => {
      if (i > 0) currentX -= e.isBoss || waveData[i - 1].isBoss ? 14 : 7;
      return {
        ...e,
        id: e.spawn_id || `en_${Date.now()}_${i}`,
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
        nextAction: "strike", 
        atkFrame: 0,
      };
    });

    set({
      enemies: enemiesWithPos,
      hasSpawnedEnemies: true,
      playerData: { ...store.playerData, inventory: loot },
    });

    if (autoStart) get().startCombatRound();
  },

  fillInventorySlots: async () => {
    const store = get();
    const { playerData } = store;
    let currentInv = [...playerData.inventory];
    
    // 🌟 มั่นใจว่าอาเรย์มีขนาดเท่ากับ unlockedSlots (8+power)
    while (currentInv.length < playerData.unlockedSlots) {
      currentInv.push(null);
    }

    let hasDrawn = false;
    for (let i = 0; i < playerData.unlockedSlots; i++) {
      if (currentInv[i] === null || currentInv[i] === undefined) {
        currentInv[i] = DeckManager.createItem(
          i,
          currentInv,
          playerData.unlockedSlots
        );

        set((state) => ({
          playerData: {
            ...state.playerData,
            inventory: [...currentInv],
          },
        }));

        if (get().isSfxOn && sfx.playHeal) sfx.playHeal(); 
        hasDrawn = true;
        await delay(100);
      }
    }

    if (hasDrawn) {
      await delay(300);
    }
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

    await get().fillInventorySlots();

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
      const hasPoison = currentInv.some((s) => s?.status === "poison");
      let totalPoisonDmg = 0;
      if (hasPoison) {
        const dmg = Math.floor(store.playerData.max_hp * 0.15);
        totalPoisonDmg = Math.max(1, dmg);
      }

      let hasInventoryUpdate = false;
      const updatedInv = currentInv.map((slot) => {
        if (!slot) return slot;
        if (["poison", "stun", "blind", "bleed"].includes(slot.status)) {
          hasInventoryUpdate = true;
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

  saveWordUsageLog: async () => {
    const store = get();
    const username = store.username;
    const { wordLog } = store;

    const wordUsageCounts = {};
    Object.values(wordLog).forEach((log) => {
      if (log.word_id) {
        wordUsageCounts[log.word_id] = (wordUsageCounts[log.word_id] || 0) + log.count;
      }
    });

    const wordIds = Object.keys(wordUsageCounts);
    if (wordIds.length === 0) return;

    try {
      const { data: existingLogs } = await supabase
        .from('player_word_log')
        .select('id, word_id, count')
        .eq('player_id', username)
        .in('word_id', wordIds);

      const existingMap = {};
      if (existingLogs) {
        existingLogs.forEach((row) => {
          existingMap[row.word_id] = row;
        });
      }

      const rowsToUpsert = wordIds.map((wId) => {
        const existing = existingMap[wId];
        const row = {
          player_id: username,
          word_id: wId,
          count: (existing ? Number(existing.count) : 0) + wordUsageCounts[wId],
          update_at: new Date().toISOString(),
        };
        if (existing) {
          row.id = existing.id;
        } else {
          row.id = crypto.randomUUID();
        }
        return row;
      });

      const { error: upsertErr } = await supabase
        .from('player_word_log')
        .upsert(rowsToUpsert);

      if (upsertErr) console.error("Upsert Word Log Error:", upsertErr);

      const { data: dictRows } = await supabase
        .from('dictionary')
        .select('id, use_count')
        .in('id', wordIds);

      if (dictRows) {
        for (const dictRow of dictRows) {
          const addedCount = wordUsageCounts[dictRow.id] || 0;
          const newUseCount = (Number(dictRow.use_count) || 0) + addedCount;
          
          const { error: dictUpdateErr } = await supabase
            .from('dictionary')
            .update({ use_count: newUseCount })
            .eq('id', dictRow.id);
            
          if (dictUpdateErr) console.error("Update Dictionary count Error:", dictUpdateErr);
        }
      }

    } catch (error) {
      console.error("Save Word Log Error:", error);
    }
  },
  
  finishStage: async () => {
    const store = get();
    // 🌟 แก้ไข: ลบเช็ค gameState === "LOADING" ออก ให้เช็คแค่ GAME_CLEARED พอ ไม่งั้นตอนจะจบมันติด return
    if (store.gameState === "GAME_CLEARED") return;
    
    bgm.stop();
    set({ gameState: "LOADING" });
    
    try {
      const username = store.username;
      const currentStageId = store.stageData.id;
      const monsterMoney = Number(store.receivedCoin) || 0;
      
      const stageRecord = store.userStageHistory.find((s) => s.stage_id === currentStageId);
      const isFirstClear = !stageRecord || !stageRecord.is_completed;
      const stageReward = isFirstClear ? (Number(store.stageData.money_reward) || 0) : 0;
      const totalMoneyEarned = monsterMoney + stageReward;

      const { data: currentResource, error: resourceErr } = await supabase
        .from('player_resource')
        .select('coin, potion_slot')
        .eq('player_id', username)
        .single();
      
      if (resourceErr) throw resourceErr;

      let updateResourceData = { coin: currentResource.coin + totalMoneyEarned };
      if (isFirstClear) {
        updateResourceData.potion_slot = currentResource.potion_slot + 1;
      }

      const { error: updateResErr } = await supabase
        .from('player_resource')
        .update(updateResourceData)
        .eq('player_id', username);

      if (updateResErr) console.error("Error Updating Resource:", updateResErr);

      const { error: progressUpdateErr } = await supabase
        .from('player_stage_progress')
        .update({ 
          is_completed: true, 
          is_current: false,
          last_distant: store.stageData.distant_goal
        })
        .eq('player_id', username)
        .eq('stage_id', currentStageId);

      if (progressUpdateErr) {
        console.error("Update Stage Progress Error (400):", progressUpdateErr);
      }

      const { data: nextStage } = await supabase
        .from('stage')
        .select('id')
        .eq('orderNo', store.stageData.orderNo + 1)
        .single();

      if (nextStage) {
        const { data: existProgress } = await supabase
          .from('player_stage_progress')
          .select('id')
          .eq('player_id', username)
          .eq('stage_id', nextStage.id)
          .maybeSingle();

        if (!existProgress) {
          const { error: insertErr } = await supabase
            .from('player_stage_progress')
            .insert({ 
              id: crypto.randomUUID(), 
              player_id: username, 
              stage_id: nextStage.id, 
              last_distant: 0, 
              is_completed: false, 
              is_current: true 
            });
          if (insertErr) console.error("Insert Next Stage Error:", insertErr);
        } else {
          const { error: updateErr } = await supabase
            .from('player_stage_progress')
            .update({ is_current: true })
            .eq('player_id', username)
            .eq('stage_id', nextStage.id);
          if (updateErr) console.error("Update Next Stage Error:", updateErr);
        }
      }

      await get().saveWordUsageLog();

      set({ 
        gameState: "GAME_CLEARED",
        currentCoin: currentResource.coin + totalMoneyEarned,
        isFirstClear: isFirstClear,
      });
    } catch (error) {
      console.error("Save Game Error:", error);
      set({ gameState: "GAME_CLEARED", playerShoutText: "Error Saving!" });
    }
  },

  saveQuitGame: async (earnedAmount) => {
    const store = get();
    
    // 1. เข้าหน้าโหลดทันที
    set({ gameState: "LOADING" });

    try {
      const username = store.username;
      const currentStageId = store.stageData?.id;
      const currentDist = Math.floor(store.distance);
      
      // เรียกใช้ API ทั้งหมด
      await store.saveWordUsageLog();

      const { data: currentRes } = await supabase
        .from('player_resource')
        .select('coin')
        .eq('player_id', username)
        .single();

      const { error } = await supabase
        .from('player_resource')
        .update({ coin: (currentRes?.coin || 0) + Number(earnedAmount) })
        .eq('player_id', username);

      if (currentStageId) {
        const { data: oldProgress } = await supabase
          .from('player_stage_progress')
          .select('last_distant')
          .eq('player_id', username)
          .eq('stage_id', currentStageId)
          .maybeSingle();

        const oldDist = oldProgress?.last_distant || 0;
        if (currentDist > oldDist) {
          await supabase
            .from('player_stage_progress')
            .update({ last_distant: currentDist })
            .eq('player_id', username)
            .eq('stage_id', currentStageId);
        }
      }

      if (!error) {
        set({ currentCoin: (currentRes?.coin || 0) + Number(earnedAmount) });
      }

      // 2. เมื่อทำงานเสร็จ ค่อยเปลี่ยนไปหน้า OVER หรือหน้าหลัก
      set({ gameState: "OVER" }); 

    } catch (error) {
      console.error("Save Money Error:", error);
      // กรณี Error ควรมีทางออกให้ user เช่นกลับหน้าเมนู
      set({ gameState: "MENU" }); 
    }
  },

  startPlayerTurn: async () => {
    const store = get();
    const currentShield = store.playerData.shield || 0;
    
    const newShield = 0; 
    const lostShield = currentShield;

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

    await get().fillInventorySlots();

    set({ gameState: "PLAYERTURN" });
  },

  usePotion: (type, value = 5) => {
    const store = get();
    const { playerData, isSfxOn } = store;
    const { potions } = playerData;

    if (type === "health") {
      if (potions.health <= 0) return;
      
      get().resetSelection();
      
      const currentState = get();
      const currentPlayerData = currentState.playerData;
      
      const healAmount = 1;
      const newHp = Math.min(currentPlayerData.max_hp, currentPlayerData.hp + healAmount);
      if (isSfxOn) sfx.playHeal && sfx.playHeal();
      
      currentState.addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 80,
        value: `+${healAmount} HP`,
        color: "#2ecc71",
      });
      
      set({
        playerData: {
          ...currentPlayerData,
          hp: newHp,
          potions: { ...potions, health: potions.health - 1 },
        },
      });
    } else if (type === "cure") {
      if (potions.cure <= 0) return;
      
      get().resetSelection();
      
      const currentState = get();
      const currentPlayerData = currentState.playerData;
      const currentInv = [...currentPlayerData.inventory];
      
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
        currentState.addPopup({
          id: Math.random(),
          x: PLAYER_X_POS,
          y: FIXED_Y - 80,
          value: `CLEANSED ${numToClear} STATUS${numToClear > 1 ? "S" : ""}!`,
          color: "#3498db",
        });
        set({
          playerData: {
            ...currentPlayerData,
            inventory: newInv,
            potions: { ...potions, cure: potions.cure - 1 },
          },
        });
      } else {
        currentState.addPopup({
          id: Math.random(),
          x: PLAYER_X_POS,
          y: FIXED_Y - 80,
          value: "NO STATUS TO CURE",
          color: "#95a5a6",
        });
      }
    } else if (type === "reroll") {
      if (potions.reroll <= 0) return;
      
      get().resetSelection();
      
      const currentState = get();
      const currentPlayerData = currentState.playerData;
      const currentInv = [...currentPlayerData.inventory];
      
      const itemsToRerollCount = currentInv.filter(
        (item) => item !== null,
      ).length;
      
      if (itemsToRerollCount > 0) {
        const rawItems = DeckManager.generateList(itemsToRerollCount);
        const { newItems: freshItemsWithBuffs, updatedDrawPile } =
          GameLogic.applyRandomBuffs(
            rawItems,
            currentPlayerData.deck_list,
            currentPlayerData.draw_pile,
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
        
        currentState.addPopup({
          id: Math.random(),
          x: PLAYER_X_POS,
          y: FIXED_Y - 80,
          value: "REROLL!",
          color: "#f39c12",
        });
        
        if (isSfxOn && sfx.playHeal) sfx.playHeal();
        
        set({
          playerData: {
            ...currentPlayerData,
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

  performPlayerAction: async (actionType, word, targetId, usedIndices) => {
    const store = get();
    
    if (store.gameState !== "PLAYERTURN") return;
    set({ gameState: "ACTION" });

    const { validWordInfo, wordLog, playerData, enemies, isSfxOn } = store;

    if (actionType === "Skill") {
      const { ability, mana } = playerData;
      if (mana < (ability?.cost || 10)) {
        get().addPopup({
          id: Math.random(),
          x: PLAYER_X_POS,
          y: FIXED_Y - 80,
          value: "Not enough Mana!",
          color: "#555555",
        });
        set({ gameState: "PLAYERTURN" });
        return; 
      }
    }

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
    let hasVampire = false;

    itemsUsedInAction.forEach((item) => {
      let letterDmg = DeckManager.getLetterDamage(item.char);

      if (item.buff === "double-dmg" && (actionType === "Strike" || actionType === "Skill")) {
        letterDmg *= 2;
      } else if (
        (item.buff === "double-guard" || item.buff === "double-shield") &&
        actionType === "Guard"
      ) {
        letterDmg *= 2;
      } else if (item.buff === "mana-plus") {
        bonusMana += 5;
      } else if (item.buff === "shield-plus" && (actionType === "Strike" || actionType === "Skill")) {
        bonusShield += 1;
      } else if (item.buff === "add_poison" || item.buff === "add_posion")
        poisonCount++;
      else if (item.buff === "add_bleed") bleedCount++;
      else if (item.buff === "add_stun") stunCount++;
      else if (item.buff === "add_blind") blindCount++;
      else if (item.buff === "bless" && actionType === "Guard") blessCount++;
      else if (item.buff === "heal" && actionType === "Guard")
        healAmount += Math.ceil(letterDmg);
      else if (item.buff === "vampire_fang" && (actionType === "Strike" || actionType === "Skill"))
        hasVampire = true;

      totalDmgRaw += letterDmg;
    });

    const totalDmg = chanceRound(totalDmgRaw);
    const finalActionDmg = actionType === "Skill" ? totalDmg * 2 : totalDmg;

    let recoilDamage = 0;
    const excessLetters = wordLength - playerPower;
    if (excessLetters > 0 && (actionType === "Strike" || actionType === "Skill")) {
      recoilDamage = Math.max(1, Math.floor(finalActionDmg * 0.5));
    } else if (excessLetters > 0) {
      recoilDamage = excessLetters; 
    }

    if (validWordInfo) {
      const lowerWord = word.toLowerCase();
      const currentType = validWordInfo.displayTypes[validWordInfo.currentDisplayIndex];
      const filteredMatches = validWordInfo.fullMatches.filter(
        (m) => (m.category || m.type || "Word") === currentType,
      );
      const activeMatch = filteredMatches[0];

      if (activeMatch) {
        const logKey = `${lowerWord}_${currentType}`;
        const existingEntry = wordLog[logKey] || {
          word: activeMatch.word,
          word_id: activeMatch.id,
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
              totalDamage: existingEntry.totalDamage + finalActionDmg,
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
          const rIdx = infectedIndices[Math.floor(Math.random() * infectedIndices.length)];
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
      playerShoutText: word.toUpperCase(),
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

    if (bonusMana > 0 && actionType !== "Skill") {
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
        finalHp = Math.min(get().playerData.max_hp, get().playerData.hp + healAmount);
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
          shield: get().playerData.shield + finalActionDmg,
        },
      });
      await delay(200);
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS,
        y: FIXED_Y - 60,
        value: `+${finalActionDmg} SHIELD`,
        color: "#2e75cc",
      });
      get().gainMana(5);
      await delay(800);
    } else if (actionType === "Strike" || actionType === "Skill") {
      const target = enemies.find((e) => e.id === targetId);
      if (target) {
        let isHit = true;
        let meaningStr = ""; 
        
        if (actionType === "Skill") {
          let wordLevel = "A1";
          if (validWordInfo && validWordInfo.fullMatches?.length > 0) {
            const currentType = validWordInfo.displayTypes[validWordInfo.currentDisplayIndex];
            const filteredMatches = validWordInfo.fullMatches.filter(
              (m) => (m.category || m.type || "Word") === currentType
            );
            const matchToUse = filteredMatches[0] || validWordInfo.fullMatches[0];
            wordLevel = matchToUse.level?.toUpperCase() || "A1";
            meaningStr = typeof matchToUse.meaning === "string"
              ? matchToUse.meaning.split(/,(?![^()]*\))/)[0].trim()
              : matchToUse.meaning || "???";
          }
          
          let hitChance = 75; 
          if (wordLevel === "A2") hitChance = 80;
          else if (wordLevel === "B1") hitChance = 85;
          else if (wordLevel === "B2") hitChance = 90;

          const roll = Math.floor(Math.random() * 100);
          if (roll >= hitChance) isHit = false; 
        }

        set({ playerX: target.x - 10, playerVisual: "walk" });
        await delay(200);
        set({ playerVisual: "attack-1" });
        await delay(400);
        
        if (isHit) {
          if (isSfxOn && sfx.playHit) sfx.playHit();
          set({ playerVisual: "attack-2" });
          get().damageEnemy(targetId, finalActionDmg);
          set({ playerShoutText: "" }); 
          await delay(500);

          if (hasVampire) {
            const stealAmount = Math.ceil(finalActionDmg / 2);
            if (stealAmount > 0) {
              const newHp = Math.min(get().playerData.max_hp, get().playerData.hp + stealAmount);
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

          const aliveEnemies = get().enemies.filter((e) => e.hp > 0);
          if (aliveEnemies.length > 0) {
            const sortedTargets = [...aliveEnemies].sort((a, b) => a.id === targetId ? -1 : 1);
            const mainTarget = sortedTargets[0];

            if (poisonCount > 0) {
              const currentStatuses = mainTarget.savedStatuses || [];
              const newDebuffs = Array(poisonCount).fill({ status: "poison", duration: 10 });
              get().updateEnemy(mainTarget.id, { savedStatuses: [...currentStatuses, ...newDebuffs] });
              get().addPopup({ id: Math.random(), x: mainTarget.x, y: FIXED_Y - 80, value: "POISONED!", color: "#2ecc71" });
              await delay(500);
            }

            // 🌟 แก้ไข Bleed: ลดเหลือ 3 เทิร์น และระเบิดทันทีเมื่อครบ 3
            if (bleedCount > 0) {
              const currentStatuses = mainTarget.savedStatuses || [];
              const newDebuffs = Array(bleedCount).fill({ status: "bleed", duration: 3 });
              let updatedStatuses = [...currentStatuses, ...newDebuffs];
              
              const totalBleed = updatedStatuses.filter(s => s.status === "bleed").length;

              if (totalBleed >= 3) {
                // ระเบิดเลือดทันที
                updatedStatuses = updatedStatuses.filter(s => s.status !== "bleed");
                get().updateEnemy(mainTarget.id, { savedStatuses: updatedStatuses });
                get().addPopup({ id: Math.random(), x: mainTarget.x, y: FIXED_Y - 80, value: "BLEEDING!", color: "#e74c3c" });
                await delay(500);

                const bDmg = Math.max(1, Math.floor(mainTarget.max_hp * 0.3));
                get().addPopup({ id: Math.random(), x: mainTarget.x, y: FIXED_Y - 60, value: "BLOOD EXPLOSION!", color: "#c0392b" });
                if (isSfxOn && sfx.playHit) sfx.playHit();
                get().damageEnemy(mainTarget.id, bDmg);
                await delay(800);
              } else {
                get().updateEnemy(mainTarget.id, { savedStatuses: updatedStatuses });
                get().addPopup({ id: Math.random(), x: mainTarget.x, y: FIXED_Y - 80, value: "BLEEDING!", color: "#e74c3c" });
                await delay(500);
              }
            }

            if (stunCount > 0) {
              const currentStatuses = mainTarget.savedStatuses || [];
              const newDebuffs = Array(stunCount).fill({ status: "stun", duration: 1 });
              get().updateEnemy(mainTarget.id, { savedStatuses: [...currentStatuses, ...newDebuffs] });
              get().addPopup({ id: Math.random(), x: mainTarget.x, y: FIXED_Y - 80, value: "STUNNED!", color: "#f1c40f" });
              await delay(500);
            }

            if (blindCount > 0) {
              const currentStatuses = mainTarget.savedStatuses || [];
              const newDebuffs = Array(blindCount).fill({ status: "blind", duration: 2 });
              get().updateEnemy(mainTarget.id, { savedStatuses: [...currentStatuses, ...newDebuffs] });
              get().addPopup({ id: Math.random(), x: mainTarget.x, y: FIXED_Y - 80, value: "BLINDED!", color: "#8e44ad" });
              await delay(500);
            }
          }

          if (bonusShield > 0) {
            set({ playerData: { ...get().playerData, shield: get().playerData.shield + bonusShield } });
            get().addPopup({ id: Math.random(), x: get().playerX, y: FIXED_Y - 60, value: `+${bonusShield} SHIELD`, color: "#2e75cc" });
            await delay(500);
          }

          if (actionType !== "Skill") {
            get().gainMana(5);
            await delay(400);
          }

        } else {
          set({ playerShoutText: "" }); 
          if (meaningStr) {
             get().updateEnemy(targetId, { shoutText: meaningStr });
             await delay(1200); 
             get().updateEnemy(targetId, { shoutText: "" });
          }

          get().addPopup({ id: Math.random(), x: target.x, y: FIXED_Y - 60, value: "MISSED!", color: "#95a5a6" });
          if (isSfxOn && sfx.playMiss) sfx.playMiss();
          await delay(500);
        }
        
        set({ playerX: PLAYER_X_POS, playerVisual: "walk" });
        await delay(500);
      }
    }

    if (recoilDamage > 0) {
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 90, value: `Recoil!`, color: "#c0392b" });
      if (isSfxOn && sfx.playHit) sfx.playHit();
      get().damagePlayer(recoilDamage, true);
      await delay(800);
      if (get().playerData.hp <= 0) return;
    }

    set({ playerVisual: "idle-1", playerShoutText: "" });
    
    const stillAliveEnemies = get().enemies.filter((e) => e.hp > 0);
    if (stillAliveEnemies.length === 0) {
       if (actionType === "Skill") set({ playerData: { ...get().playerData, mana: 0 } });
       get().handleWaveClear();
       return;
    }
    
    if (actionType === "Skill") {
       set({ playerData: { ...get().playerData, mana: 0 } });
       await get().fillInventorySlots();
       set({ gameState: "PLAYERTURN" });
    } else {
       get().endTurn();
    }
  },

  updateEnemy: (id, data) =>
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),

  damageEnemy: (id, dmg) => {
    const target = get().enemies.find((e) => e.id === id);
    if (!target) return;
    
    let remainingDmg = dmg;
    let currentShield = target.shield || 0;
    
    if (currentShield > 0) {
      const blockAmount = Math.min(currentShield, remainingDmg);
      currentShield -= blockAmount;
      remainingDmg -= blockAmount;
      
      get().addPopup({
        id: Math.random(),
        x: target.x,
        y: FIXED_Y - 60,
        value: "BLOCK!",
        color: "#ffffff",
      });
      
      get().updateEnemy(id, { shield: currentShield });
    }
    
    const newHp = Math.max(0, target.hp - remainingDmg);
    const newMana = Math.min(target.quiz_move_cost, target.mana + remainingDmg);
    get().updateEnemy(id, { hp: newHp, mana: newMana });
    
    if (remainingDmg > 0) {
      get().addPopup({
        id: Math.random(),
        x: target.x - 2,
        y: FIXED_Y - 80,
        value: remainingDmg,
        color: "#cc2e2e",
      });
    }
    
    if (newHp <= 0)
      set((state) => ({
        receivedCoin: Number(state.receivedCoin || 0) + Number(target.exp || 0),
      }));
  },

  damagePlayer: (dmg, ignoreShield = false) => {
    const { playerData: stat, isSfxOn } = get();
    // 🌟 เช็คเลือดก่อน เผื่อโดนหลายเด้งจะได้ไม่ยิง API รัวๆ
    if (stat.hp <= 0) return; 

    let remainingDmg = dmg;
    let newShield = stat.shield;
    if (!ignoreShield && newShield > 0) {
      const blockAmount = Math.min(newShield, remainingDmg);
      newShield -= blockAmount;
      remainingDmg -= blockAmount;
      get().addPopup({
        id: Math.random(),
        x: PLAYER_X_POS ,
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
        x: PLAYER_X_POS + 3,
        y: FIXED_Y - 50,
        value: remainingDmg,
        color: "#cc2e2e",
      });
      get().gainMana(remainingDmg);
    }
    // 🌟 พอเลือดเหลือน้อยกว่า 0 โยนไปให้ saveQuitGame รวบยอดจัดการทั้งหมด (รวมถึงเปลี่ยนสถานะหน้า)
    if (newHp <= 0) {
        bgm.stop();
        const halfCoins = Math.floor((get().receivedCoin || 0) / 2);
        get().saveQuitGame(halfCoins); 
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

    const currentShield = en.shield || 0;
    const newShield = 0; 
    const lostShield = currentShield;

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

    await get().fillInventorySlots();
    
    currentInv = [...get().playerData.inventory];

    const actionType = en.nextAction || "strike";
    get().updateEnemy(en.id, { nextAction: actionType === "strike" ? "guard" : "strike" });

    if (en.mana >= en.quiz_move_cost) {
      await get().performEnemySkill(en.id);
      // 🌟 ให้ return ไปเลย เพราะกลไกแพ้ถูกโยนไปที่ damagePlayer แล้ว
      if (get().playerData.hp <= 0) return;
      
      en = get().enemies.find((e) => e.id === enemyId);
      if (!en || en.hp <= 0) {
        get().endTurn();
        return;
      }
    }

    const { placements, newDrawPile } = GameLogic.calculateZoneBuffs(
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
    const { bestWord, usedItems } = WordSystem.findBestWordFromLetters(
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
      let enemyHasVampire = false;

      let enemyHealAmount = 0;
      let enemyBlessCount = 0;

      for (let i = 0; i < usedItems.length; i++) {
        const targetItem = usedItems[i];
        const invIdx = currentInv.findIndex(
          (item) => item?.id === targetItem.id,
        );
        if (invIdx !== -1) {
          let letterDmg = DeckManager.getLetterDamage(targetItem.char);

          if (targetItem.buff === "double-dmg" && actionType === "strike") letterDmg *= 2;
          if ((targetItem.buff === "double-guard" || targetItem.buff === "double-shield") && actionType === "guard") letterDmg *= 2;

          if (targetItem.buff === "mana-plus") bonusMana += 5;
          if (targetItem.buff === "shield-plus" && actionType === "strike") bonusShield += 1;

          if (targetItem.buff === "add_poison" || targetItem.buff === "add_posion") enemyPoisonCount++;
          if (targetItem.buff === "add_bleed") enemyBleedCount++;
          if (targetItem.buff === "add_stun") enemyStunCount++;
          if (targetItem.buff === "add_blind") enemyBlindCount++;
          if (targetItem.buff === "vampire_fang" && actionType === "strike") enemyHasVampire = true;

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
      
      if (enemyHasVampire && actionType === "strike" && finalValue > 0) {
        const stealAmount = Math.ceil(finalValue / 2);
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
        // 🌟 แก้ไข Bleed: ลดเหลือ 3 เทิร์น และตรวจสอบการระเบิดให้ผู้เล่นทันที
        if (enemyBleedCount > 0) {
          get().applyStatusToPlayer("bleed", 100, enemyBleedCount, 3);
          await delay(500);

          const pStatuses = get().playerData.savedEffects?.statuses || [];
          const pBleeds = pStatuses.filter(s => s.status === "bleed").length;
          
          if (pBleeds >= 3) {
            const filteredStatuses = pStatuses.filter(s => s.status !== "bleed");
            set({
              playerData: {
                ...get().playerData,
                savedEffects: { ...get().playerData.savedEffects, statuses: filteredStatuses }
              }
            });

            const bDmg = Math.max(1, Math.floor(get().playerData.max_hp * 0.3));
            get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: "BLOOD EXPLOSION!", color: "#c0392b", fontSize: "20px" });
            if (store.isSfxOn && sfx.playHit) sfx.playHit();
            get().damagePlayer(bDmg, true);
            await delay(800);
          }
        }
        if (enemyStunCount > 0) {
          get().applyStatusToPlayer("stun", 100, enemyStunCount, 1);
          await delay(500);
        }
        if (enemyBlindCount > 0) {
          get().applyStatusToPlayer("blind", 100, enemyBlindCount, 2);
          await delay(500);
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
    let hasInvUpdate = false;

    if (currentInv.some((s) => s?.status === "poison")) {
      poisonDmg = Math.max(1, Math.floor(en.max_hp * 0.1));
    }

    currentInv = currentInv.map((slot) => {
      if (!slot || !slot.status) return slot;
      hasInvUpdate = true;
      // 🌟 นำ Bleed มารวมไว้ที่เดียวกันสำหรับการลด duration ช่วงจบเทิร์น
      if (["poison", "stun", "blind", "bleed"].includes(slot.status)) {
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

    // 🌟 ให้ return ไปเลย เพราะกลไกแพ้ถูกโยนไปที่ damagePlayer แล้ว
    if (get().playerData.hp <= 0) return;

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