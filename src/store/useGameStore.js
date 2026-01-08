// src/store/useGameStore.js
import { create } from "zustand";
import { PLAYER_X_POS, FIXED_Y, ipAddress } from "../const/index";
// ✅ Import ค่าคงที่ตัวอักษร (สมมติว่าเอาไปไว้ใน gameSystem หรือ const)
import { getLetterDamage } from "../const/letterValues"; 
import { sfx } from "../utils/sfx";
import { 
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

// ✅ ฟังก์ชันคำนวณ Modifier: (Stat - 10) / 2 ปัดลง
const getStatModifier = (val) => Math.floor((val - 10) / 2);

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
  animResolver: null,
  animTimer: 0, 
  animFrame: 1, 

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
    name: "chara",
    // Base Stats (1-20)
    stats: {
      STR: 20, // Strength: เพิ่มดาเมจตัวอักษร
      WIT: 20, // Wit: เพิ่ม Max HP
      INT: 20, // Intelligence: เพิ่มช่อง Inventory
      DEX: 20, // Dexterity: เพิ่ม Speed
      LUCK: 20 // Luck: เพิ่ม Max RP และ Cri Rate
    },
    // Derived Stats (ค่าที่คำนวณจาก Stats ด้านบน)
    max_hp: 100, hp: 100, shield: 0,
    max_rp: 3, rp: 3,
    speed: 6,
    unlockedSlots: 10,
    critChance: 0, // % โอกาสติดคริ
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

  // ✅ ฟังก์ชันสำหรับคำนวณค่าพลังใหม่ทั้งหมด (เรียกใช้ตอนเริ่มเกม หรือตอนอัปเลเวล/ใส่ของ)
  recalculatePlayerStats: () => {
    set((state) => {
      const s = state.playerData.stats;
      
      const witMod = getStatModifier(s.WIT);
      const dexMod = getStatModifier(s.DEX);
      const luckMod = getStatModifier(s.LUCK);

      // 1. WIT -> HP
      const newMaxHp = 20 + (witMod * 10);
      
      // 2. INT -> Slots (ใช้สูตรปัดเศษลงให้เป็นเลขคู่)
      // Math.floor(s.INT / 2) * 2 จะทำให้เลขคี่กลายเป็นเลขคู่ก่อนหน้าเสมอ
      const newSlots = Math.floor(s.INT / 2) * 2; 

      // 3. DEX -> Speed
      const newSpeed = Math.max(1, 6 + dexMod);

      // 4. LUCK -> RP & Crit
      const newMaxRp = Math.max(1, 3 + luckMod);
      const newCrit = Math.max(0, 5 + (luckMod * 2)); 

      return {
        playerData: {
          ...state.playerData,
          max_hp: newMaxHp,
          hp: Math.min(state.playerData.hp, newMaxHp),
          
          unlockedSlots: newSlots, // ✅ อัปเดตสูตรใหม่ที่นี่
          
          speed: newSpeed,
          max_rp: newMaxRp,
          critChance: newCrit
        }
      };
    });
  },

  initializeGame: async () => {
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
          const selectedPatternNo = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

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
            speed: data.speed || 3 
          });
        });
      }

      const sortedStageEvents = Object.keys(groupedEvents)
        .map(key => Number(key))
        .sort((a, b) => a - b)
        .map(dist => ({
          distance: dist,
          monsters: groupedEvents[dist]
        }));

      DeckManager.init();

      set({ 
        dictionary: dictData,
        stageData: sortedStageEvents,
        currentEventIndex: 0,
        loadingProgress: 100,
        gameState: "ADVANTURE" 
      });

      // ✅ คำนวณ Stats ครั้งแรก
      get().recalculatePlayerStats();

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

  reset: () => {
    set({
      gameState: "ADVANTURE",
      currentEventIndex: 0,
      playerData: {
          name: "chara",
          // Reset กลับไปเป็นค่า 10
          stats: {      
            STR: 20, // Strength: เพิ่มดาเมจตัวอักษร
            WIT: 20, // Wit: เพิ่ม Max HP
            INT: 20, // Intelligence: เพิ่มช่อง Inventory
            DEX: 20, // Dexterity: เพิ่ม Speed
            LUCK: 20 // Luck: เพิ่ม Max RP และ Cri Rate
      },
          max_hp: 100, hp: 100, 
          max_rp: 3, rp: 3,
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
      activeCombatant: null
    });
    // คำนวณค่าพลังใหม่หลังจาก Reset
    get().recalculatePlayerStats();
  },

  // 🔄 MAIN UPDATE LOOP
  update: (dt) =>
    set((state) => {
      let updates = {}; 

      const ANIM_SPEED = 300; 
      let newTimer = (state.animTimer || 0) + dt;
      if (newTimer >= ANIM_SPEED) {
        newTimer -= ANIM_SPEED; 
        updates.animFrame = state.animFrame === 1 ? 2 : 1; 
        if (state.gameState === "ADVANTURE") {
             sfx.playWalk();
        }
      }
      updates.animTimer = newTimer;

      if (state.gameState === "ADVANTURE") {
        const speed = 0.001; 
        const newDist = state.distance + dt * speed;
        
        let nextTargetDist = Infinity;
        if (state.stageData && state.stageData[state.currentEventIndex]) {
            nextTargetDist = state.stageData[state.currentEventIndex].distance;
        }

        if (newDist >= nextTargetDist) {
          const finalDist = nextTargetDist;
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
  // ⚔️ ACTIONS: COMBAT
  // ==========================================================================

  spawnEnemies: (loot) => {
    const store = get();
    const currentEvent = store.stageData[store.currentEventIndex];
    const waveData = currentEvent ? currentEvent.monsters : [];

    if (!waveData || waveData.length === 0) {
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
      enemies: enemiesWithPos,
      playerData: {
        ...store.playerData,
        rp: store.playerData.max_rp, // รีเซ็ต RP ตามค่า Max ที่คำนวณจาก LUCK
        inventory: loot,
      },
    });

    get().startCombatRound(); 
  },

  startCombatRound: async () => {
    const store = get();
    set({ playerShoutText: "New Round!", gameState: "PROCESSING_QUEUE" });
    await delay(1000);
    set({ playerShoutText: "" });

    // ✅ ใช้ค่า Speed ที่คำนวณมาจาก DEX
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
      }
    ];

    store.enemies.filter(e => e.hp > 0).forEach(e => {
      const baseSpeed = e.speed || 3;
      const init = Math.max(1, baseSpeed + (Math.floor(Math.random() * 3) - 1));

      pool.push({
        id: e.id,
        type: "enemy",
        name: e.name,
        initiative: init,          
        originalInitiative: init,  
        uniqueId: `${e.id}-${Math.random()}`
      });
    });

    const minInitiativeInRound = Math.min(...pool.map(u => u.initiative));

    const finalQueue = [];
    while (pool.length > 0) {
      pool.sort((a, b) => b.initiative - a.initiative);
      const winner = pool.shift(); 
      finalQueue.push(winner);
      const nextInit = Math.floor(winner.initiative / 2);

      if (nextInit > minInitiativeInRound) {
        pool.push({
          ...winner,            
          initiative: nextInit, 
          uniqueId: `${winner.id}-${Math.random()}` 
        });
      }
    }

    set({ turnQueue: finalQueue });
    get().processNextTurn();
  },

  processNextTurn: async () => {
    const store = get();
    const queue = store.turnQueue;

    if (queue.length === 0) {
        const aliveEnemies = store.enemies.filter(e => e.hp > 0).length;
        if (aliveEnemies > 0 && store.playerData.hp > 0) {
            get().startCombatRound();
        }
        return;
    }

    const activeUnit = queue[0]; 

    set({ activeCombatant: activeUnit });

    if (activeUnit.type === "enemy") {
        const enemyExists = store.enemies.find(e => e.id === activeUnit.id && e.hp > 0);
        if (!enemyExists) {
            get().endTurn(); 
            return;
        }
    }

    if (activeUnit.type === "player") {
        get().startPlayerTurn();
    } else {
        get().runSingleEnemyTurn(activeUnit.id);
    }
  },

  endTurn: () => {
    const store = get();
    
    const aliveEnemies = store.enemies.filter(e => e.hp > 0).length;
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
            activeCombatant: null
        });
      } else {
        set({ gameState: "GAME_CLEARED", enemies: [], playerShoutText: "All Clear!" });
      }
  },

  // ==========================================================================
  // ⚡ ACTIONS: PLAYER (ATTACK / SHIELD / SPIN)
  // ==========================================================================

  startPlayerTurn: () => {
    const store = get();
    // ✅ ใช้ unlockedSlots ที่คำนวณจาก INT
    const newInventory = InventoryUtils.fillEmptySlots(store.playerData.inventory, [], store.playerData.unlockedSlots);

    set((s) => ({
      gameState: "PLAYERTURN",
      playerVisual: "idle",
      playerData: {
        ...s.playerData,
        rp: s.playerData.max_rp, // รีเซ็ต RP ตาม LUCK
        inventory: newInventory,
      }
    }));
    get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 90, value: "YOUR TURN", isPlayer: true });
  },

  performPlayerAction: async (actionType, word, targetId, usedIndices) => {
    const store = get();
    
    const activeSlots = store.playerData.unlockedSlots;
    const currentInv = [...store.playerData.inventory];
    usedIndices.forEach((idx) => { currentInv[idx] = null; });
    for (let i = 0; i < activeSlots; i++) {
      if (currentInv[i] === null) currentInv[i] = DeckManager.createItem(i);
    }

    set((s) => ({
      playerShoutText: actionType,
      gameState: "ACTION",
      playerVisual: "idle",
      playerData: {
        ...s.playerData,
        inventory: currentInv, 
      },
    }));

    await store.waitAnim(300);

    const wordLength = word.length;
    
    // ✅ คำนวณ Modifier ของ STR สำหรับใช้คิดดาเมจ
    const strMod = getStatModifier(store.playerData.stats.STR);

    // 🛡️ SHIELD ACTION
    if (actionType === "SHIELD") {
       // สูตรโล่: (จำนวนตัวอักษร * 3) + STR Bonus นิดหน่อยก็ได้
       const shieldAmount = (wordLength * 3) + Math.max(0, strMod);
       
       set({ playerVisual: "guard-1" });
       set((s) => ({ playerData: { ...s.playerData, shield: s.playerData.shield + shieldAmount } }));
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
            set({ playerX: target.x - 10, playerVisual: "walk" }); 
            await delay(200);

            // ✅ คำนวณดาเมจแบบละเอียด: รวมค่าแต่ละตัวอักษร + STR Modifier
            let totalDmg = 0;
            for (let char of word) {
                totalDmg += getLetterDamage(char, strMod);
            }
            // คูณ Multiplier เพิ่มเติมจากความยาวคำ (เช่น คำยาวคูณแรงขึ้น)
            // หรือใช้สูตรพื้นฐานแค่บวกกันก็ได้
            // สมมติ: TotalDmg = ผลรวมพลังตัวอักษร
            totalDmg = Math.floor(totalDmg);

            // คำนวณ Critical (LUCK)
            const isCrit = Math.random() * 100 < store.playerData.critChance;
            if (isCrit) {
                totalDmg = Math.floor(totalDmg * 1.5);
                get().addPopup({ id: Math.random(), x: target.x, y: FIXED_Y - 100, value: "CRITICAL!", isPlayer: true });
            }

            set({ playerVisual: "attack-1" }); 
            await delay(400);
            sfx.playHit(); 
            set({ playerVisual: "attack-2" }); 

            get().damageEnemy(targetId, totalDmg);
            await delay(400);
         }
       }
       await delay(200);
       set({ playerX: originalX, playerVisual: "walk" });
       await delay(500);
    }

    set({ playerVisual: "idle", playerShoutText: "" });
    await delay(200);

    get().endTurn();
  },

  actionSpin: async (newInventory) => {
    const store = get();
    if (store.playerData.rp < 1) return;
    set((s) => ({
      playerData: { ...s.playerData, rp: s.playerData.rp - 1, inventory: newInventory },
      playerShoutText: "SPIN!",
      gameState: "ACTION",
    }));
    await store.waitAnim(600);
    
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },

  // ==========================================================================
  // ⚡ ACTIONS: ENEMY
  // ==========================================================================

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

    const en = store.enemies.find(e => e.id === enemyId);
    if (!en || en.hp <= 0) {
        get().endTurn(); 
        return;
    }

    get().updateEnemy(en.id, { shield: 0 });

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
    }
    else if (actionMove === "ATTACK") {
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
    }
    else if (actionMove === "WAIT") {
        get().updateEnemy(en.id, { shoutText: "...", currentStep: nextStep });
        await delay(800);
        get().updateEnemy(en.id, { shoutText: "" });
    }
    else if (actionMove === "SKILL") {
        const originalX = en.x;
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

        get().updateEnemy(en.id, {
          x: PLAYER_X_POS + 25, 
          shoutText: correctEntry.meaning,
          atkFrame: 1, 
        });

        await delay(1000); 
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
        
        get().updateEnemy(en.id, { x: PLAYER_X_POS + 10, atkFrame: 2 }); 

        if (isCorrect) {
          set({ isDodging: true });
          get().updateEnemy(en.id, { shoutText: "MISSED!" });
          sfx.playMiss();
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
        setTimeout(() => { set({ isGuarding: false, playerVisual: "idle" }); }, 600);
      }
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 70, value: 0, isPlayer: true });
    }

    const newHp = Math.max(0, stat.hp - remainingDmg);

    set({ playerData: { ...stat, hp: newHp, shield: newShield } });

    if (remainingDmg > 0) {
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS - 2, y: FIXED_Y - 50, value: remainingDmg, isPlayer: true });
    }
    
    if (newHp <= 0) set({ gameState: "OVER" });
  },

  setInventory: (items) => set({ playerData: { ...get().playerData, inventory: items } }),
  
  resolveQuiz: (answer) => {
    const store = get();
    if (!store.currentQuiz || !store.quizResolver) return;
    const isCorrect = answer === store.currentQuiz.correctAnswer;
    store.quizResolver(isCorrect);
    set({ currentQuiz: null, quizResolver: null });
  },

}));