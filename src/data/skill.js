// src/data/skills.js

/**
 * ฐานข้อมูลสกิล (Skill Database)
 * * แบ่งประเภทหลักๆ เป็น:
 * 1. Basic Attack/Defense (mpCost: 0): 
 * ความแรงขึ้นอยู่กับความยาวคำศัพท์ (Word Length) และจุดอ่อนศัตรู
 * 2. Active Skill (mpCost > 0): 
 * ความแรงคงที่ (Fixed Damage) หรือตามค่า Min-Max ที่กำหนด
 */
export const SKILL_DATABASE = [
  // ⚔️ BASIC ATTACK (O-BALL)
  {
    id: "o_ball",
    name: "O-BALL",
    icon: "🔥",
    description: "Dmg based on Word Length. (+5 MP)", 
    apCost: 2,
    mpCost: 0,           // 0 MP = ใช้ระบบคำนวณจากคำศัพท์
    minWordLength: 2,    // ต้องมีอย่างน้อย 2 ตัวอักษร
    targetType: "SINGLE",
    maxTargets: 1,
    effectType: "DAMAGE",
    
    // ✅ ตัวคูณความแรง: Dmg = (Weighted Length * basePower)
    basePower: 1, 
    
    hitChanceBonus: 0,
    projectileVisual: "FIREBALL",
    damageMin: 0, 
    damageMax: 0,
    hitCount: 1,
  },

  // 🛡️ BASIC DEFENSE (SHIELD)
  {
    id: "shield",
    name: "SHIELD",
    icon: "🛡",
    description: "Shield based on Word Length. (+5 MP)",
    apCost: 1,
    mpCost: 0,           // 0 MP = ใช้ระบบคำนวณจากคำศัพท์
    minWordLength: 2,
    targetType: "SELF",
    maxTargets: 0,
    effectType: "SHIELD",
    
    // ✅ ตัวคูณเกราะ: Shield = Length * basePower
    basePower: 1, 
    hitChanceBonus: 0,
    projectileVisual: "NONE",
  },

  // 🚀 SKILL ATTACK (V-MISSILE)
  {
    id: "v_missile",
    name: "V-MISSILE",
    icon: "🚀",
    description: "Ultimate! 3 Hits (Fixed Dmg).",
    apCost: 1,
    mpCost: 25,          // ใช้ MP ในการร่าย
    minWordLength: 0,    // กดใช้ได้เลย (หรือจะตั้งให้ใช้คำยาวๆ เพื่อความแรงก็ได้)
    targetType: "MULTI",
    maxTargets: 1,
    effectType: "DAMAGE",
    basePower: 0, 
    hitChanceBonus: 100, 
    projectileVisual: "V_SHAPE",
    
    // ✅ Logic สกิล: ดาเมจคงที่ต่อฮิต
    damageMin: 3, 
    damageMax: 3,
    hitCount: 3,         // ยิง 3 นัด รวม 9 ดาเมจ
  },
];