import { PLAYER_X_POS, FIXED_Y } from "../../const/index";
import { sfx } from "../../utils/sfx";
import { CombatSystem, InventoryUtils, DeckManager } from "../../utils/gameSystem";

// ✅ ฟังก์ชันหน่วงเวลา
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const createPlayerSlice = (set, get) => ({
  // --- STATE ---
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
  isGuarding: false,
  actionPhase: "IDLE", // IDLE | RUSH | ATTACK

  // --- ACTIONS ---

  updatePlayer: (data) =>
    set((s) => ({
      playerData: { ...s.playerData, ...data }
    })),

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
        set({ isGuarding: true });
        setTimeout(() => { set({ isGuarding: false }); }, 600);
      }
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 70, value: 0, isPlayer: true });
    }

    const newHp = Math.max(0, stat.hp - remainingDmg);
    let newMp = stat.mp;
    if (remainingDmg > 0) {
      set({ isGuarding: false }); 
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
  // ✅ ส่วนที่ปรับจังหวะอนิเมชั่น (STEP-BY-STEP)
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
      playerData: {
        ...s.playerData,
        inventory: currentInv, 
        mp: s.playerData.mp - (skill.mpCost || 0),
        ap: s.playerData.ap - finalApCost, 
      },
    }));

    await store.waitAnim(300); // รอ UI อัปเดตแป๊บนึง

    const isBasicMove = (skill.mpCost || 0) === 0;

    // --- CASE 1: SHIELD (อยู่กับที่) ---
    if (skill.effectType === "SHIELD") {
      let shieldAmount = isBasicMove 
        ? chosenWord.length * skill.basePower 
        : skill.basePower;
      set((s) => ({ playerData: { ...s.playerData, shield: s.playerData.shield + shieldAmount } }));
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: shieldAmount, isPlayer: false });
    } 
    
    // --- CASE 2: DAMAGE (มีการเคลื่อนที่) ---
    else if (skill.effectType === "DAMAGE") {
      const originalX = PLAYER_X_POS;
      const firstTarget = get().enemies.find(e => e.id === targetIds[0]);
      
      // ============================================
      // 🟢 STEP 1: RUSH (พุ่งไปหา)
      // ============================================
      if (firstTarget) {
        set({ 
          playerX: firstTarget.x - 10, // หยุดหน้าศัตรู
          actionPhase: "RUSH"          // เปลี่ยนท่าเป็นวิ่ง
        }); 
        
        // ⏳ รอให้ตัวละครวิ่งไปถึงจริงๆ (เพิ่มเวลาเผื่อไว้ให้ถึงชัวร์ๆ)
        await delay(500); 
      }

      // ============================================
      // 🔴 STEP 2: ATTACK (ยืนนิ่งแล้วโจมตี)
      // ============================================
      set({ actionPhase: "ATTACK" }); // เปลี่ยนท่าเป็นง้างโจมตี
      
      const hitsPerTarget = skill.hitCount || 1;
      for (const targetId of targetIds) {
        for (let i = 0; i < hitsPerTarget; i++) {
          const target = get().enemies.find((e) => e.id === targetId);
          if (!target || target.hp <= 0) break;

          let finalDamage = CombatSystem.calculateDamage(skill, chosenWord, target);
          sfx.playHit(); 
          get().damageEnemy(targetId, finalDamage);

          // ⏳ รอให้ Animation โจมตีเล่น (ง้าง -> ฟัน)
          await delay(400); 
        }
      }

      // รอหลังโจมตีเสร็จนิดนึง ก่อนจะวิ่งกลับ
      await delay(200);

      // ============================================
      // 🔵 STEP 3: RETURN (วิ่งกลับ)
      // ============================================
      set({ 
        playerX: originalX, 
        actionPhase: "RUSH" // เปลี่ยนท่าเป็นวิ่งกลับ
      });
      
      // ⏳ รอให้ตัวละครวิ่งกลับมาถึงที่เดิม
      await delay(500);
    }

    // ============================================
    // STEP 4: FINISH (จบเทิร์น)
    // ============================================
    set({ actionPhase: "IDLE" }); // กลับมายืนท่าปกติ
    set({ playerShoutText: "" });
    await delay(200);

    // ตรวจสอบจบเกม / จบเวฟ
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