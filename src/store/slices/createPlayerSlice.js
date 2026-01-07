import { PLAYER_X_POS, FIXED_Y } from "../../const/index";
import { sfx } from "../../utils/sfx";
import { CombatSystem, InventoryUtils, DeckManager } from "../../utils/gameSystem";

// ✅ ฟังก์ชันหน่วงเวลา (Helper)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const createPlayerSlice = (set, get) => ({
  // --------------------------------------------------------------------------
  // 🟢 STATE
  // --------------------------------------------------------------------------
  playerData: {
    name: "chara",
    max_hp: 100,
    hp: 100,
    shield: 0,
    max_rp: 3,
    rp: 3,
    mp: 0,
    max_mp: 25,
    unlockedSlots: 10,
    manaRegen: 5,
    max_ap: 3,
    ap: 3,
    inventory: [],
  },
  playerX: PLAYER_X_POS,
  playerShoutText: "",
  
  // ✅ เก็บแค่ Visual (ชื่อท่า) ส่วน animFrame ให้ GameSlice จัดการ
  playerVisual: "idle", 

  isGuarding: false, 
  actionPhase: "IDLE", 

  // --------------------------------------------------------------------------
  // 🔵 ACTIONS
  // --------------------------------------------------------------------------

  // ❌ ลบ tickGameAnim ออก (เพราะ GameSlice ทำหน้าที่นี้แทนแล้ว)

  updatePlayer: (data) =>
    set((s) => ({
      playerData: { ...s.playerData, ...data }
    })),

  damagePlayer: (dmg) => {
    const { playerData: stat } = get();
    let remainingDmg = dmg;
    let newShield = stat.shield;

    // --- LOGIC BLOCK (โล่) ---
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
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 70, value: 0, isPlayer: true });
    }

    const newHp = Math.max(0, stat.hp - remainingDmg);
    let newMp = stat.mp;

    // --- LOGIC HIT (โดนตี) ---
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
    const currentInv = store.playerData.inventory;
    const activeSlots = store.playerData.unlockedSlots;
    const newInventory = InventoryUtils.fillEmptySlots(currentInv, [], activeSlots);

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

  // -----------------------------------------------------
  // ✅ ส่วนควบคุม Animation ขั้นตอนการโจมตี
  // -----------------------------------------------------
  castSkill: async (skill, chosenWord, targetIds, usedIndices) => {
    const store = get();
    const finalApCost = skill.apCost || 1;

    if (store.playerData.mp < (skill.mpCost || 0)) return;
    if (store.playerData.ap < finalApCost) return; 

    // 1. จัดการ Inventory
    const activeSlots = store.playerData.unlockedSlots;
    const currentInv = [...store.playerData.inventory];
    usedIndices.forEach((idx) => { currentInv[idx] = null; });
    for (let i = 0; i < activeSlots; i++) {
      if (currentInv[i] === null) currentInv[i] = DeckManager.createItem(i);
    }

    // 2. เริ่มต้น Action State
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

    // --- CASE 1: SHIELD ---
    if (skill.effectType === "SHIELD") {
      let shieldAmount = isBasicMove 
        ? chosenWord.length * skill.basePower 
        : skill.basePower;
      
      set({ playerVisual: "guard-1" });
      set((s) => ({ playerData: { ...s.playerData, shield: s.playerData.shield + shieldAmount } }));
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: shieldAmount, isPlayer: false });
      
      await delay(500);
      set({ playerVisual: "idle" });
    } 
    
    // --- CASE 2: DAMAGE ---
    else if (skill.effectType === "DAMAGE") {
      const originalX = PLAYER_X_POS;
      const firstTarget = get().enemies.find(e => e.id === targetIds[0]);
      
      // 🟢 STEP 1: RUSH
      if (firstTarget) {
        set({ 
          playerX: firstTarget.x - 10,
          playerVisual: "walk"
        }); 
        await delay(200); 
      }

      // 🔴 STEP 2: ATTACK
      const hitsPerTarget = skill.hitCount || 1;
      for (const targetId of targetIds) {
        for (let i = 0; i < hitsPerTarget; i++) {
          const target = get().enemies.find((e) => e.id === targetId);
          if (!target || target.hp <= 0) break;

          set({ playerVisual: "attack-1" }); // ง้าง
          await delay(400);

          sfx.playHit(); 
          set({ playerVisual: "attack-2" }); // ฟัน
          let finalDamage = CombatSystem.calculateDamage(skill, chosenWord, target);
          get().damageEnemy(targetId, finalDamage);

          await delay(400); 
        }
      }

      await delay(200);

      // 🔵 STEP 3: RETURN
      set({ 
        playerX: originalX, 
        playerVisual: "walk"
      });
      await delay(500);
    }

    // STEP 4: FINISH
    set({ playerVisual: "idle" });
    set({ playerShoutText: "" });
    await delay(200);

    // ตรวจสอบจบเกม
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
});