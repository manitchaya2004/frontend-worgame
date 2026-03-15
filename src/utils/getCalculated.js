export function getCalculatedStats(baseHp, basePower, baseSpeed, currentLevel) {
  const hp = Number(baseHp) || 0;
  const power = Number(basePower) || 0;
  const speed = Number(baseSpeed) || 0;
  const level = Number(currentLevel) || 1;

  const levelModifier = level - 1;

  // ⚙️ ตั้งค่าการเติบโตของ Status ต่อ 1 เลเวล
  const hpGrowthPerLevel = 3;
  const powerGrowthPerLevel = 1;
  const speedGrowthPerLevel = 1;

  const finalHp = hp + levelModifier * hpGrowthPerLevel;
  const finalSpeed = speed + levelModifier * speedGrowthPerLevel;
  const finalPower = power + levelModifier * powerGrowthPerLevel;

  return {
    hp: finalHp,
    speed: finalSpeed,
    power: finalPower,
    base: { hp, speed, power },
  };
}

// ✨ ฟังก์ชันใหม่สำหรับคำนวณ Deck Size ตาม Level
export function getCalculatedDeck(deckList, level) {
  if (!deckList) return [];

  // คำนวณส่วนลด: ทุกๆ 4 เลเวล ลดลง 1 (เลเวล 4 = -1, เลเวล 8 = -2)
  const sizeReduction = Math.floor(level / 4);

  return deckList.map((card) => ({
    ...card,
    // ลด size ลง แต่ห้ามต่ำกว่า 1
    size: Math.max(1, card.size - sizeReduction),
  }));
}

export function calculateStaminaRegen(currentStamina, maxStamina, lastUpdateStr) {
  let stamina = Number(currentStamina);
  let max = Number(maxStamina);
  
  if (isNaN(stamina)) stamina = 0;
  if (isNaN(max)) max = 3;

  let lastUpdate = lastUpdateStr ? new Date(lastUpdateStr) : new Date();
  let timeToNext = 0;
  const now = new Date();
  let hasChanged = false;

  // ถ้าสายฟ้าเต็มอยู่แล้ว
  if (stamina >= max) {
    return { current: max, max, timeToNext: 0, newUpdateDate: now, hasChanged: true };
  }

  // คำนวณระยะเวลาที่ผ่านไป (มิลลิวินาที)
  const diffMs = now.getTime() - lastUpdate.getTime();
  const staminaToAdd = Math.floor(diffMs / STAMINA_REGEN_MS);

  let newUpdateDate = lastUpdate;

  if (staminaToAdd > 0) {
    stamina += staminaToAdd;
    // ขยับเวลาอัปเดตล่าสุดไปข้างหน้าตามจำนวนรอบที่เพิ่มมา
    newUpdateDate = new Date(lastUpdate.getTime() + (staminaToAdd * STAMINA_REGEN_MS));
    hasChanged = true;

    // ถ้าเพิ่มจนล้น ให้ล็อกไว้ที่ Max และรีเซ็ตเวลา
    if (stamina >= max) {
      stamina = max;
      newUpdateDate = now; 
    }
  }

  // คำนวณเวลาที่เหลือสำหรับดวงถัดไป
  if (stamina < max) {
    const nextRegenTime = newUpdateDate.getTime() + STAMINA_REGEN_MS;
    timeToNext = Math.max(0, nextRegenTime - now.getTime());
  }

  return { current: stamina, max, timeToNext, newUpdateDate, hasChanged };
}