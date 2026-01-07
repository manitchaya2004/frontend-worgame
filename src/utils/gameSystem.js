import { LETTER_DATA } from "../const/index";

// --- 🎴 Deck & Inventory Systems ---
// ระบบจัดการสำรับตัวอักษรและการสร้างไอเทม
export const DeckManager = {
  deck: [],
  
  // สร้างสำรับเริ่มต้นตามจำนวน count ที่กำหนดไว้ใน LETTER_DATA
  init() {
    this.deck = [];
    Object.keys(LETTER_DATA).forEach((char) => {
      for (let i = 0; i < LETTER_DATA[char].count; i++) {
        this.deck.push(char);
      }
    });
  },

  // สุ่มหยิบตัวอักษรจากสำรับ
  getRandomChar() {
    if (this.deck.length === 0) this.init();
    return this.deck[Math.floor(Math.random() * this.deck.length)];
  },

  // สร้างไอเทมใหม่ลงใน Inventory
  createItem(index) {
    return {
      id: Math.random(),
      char: this.getRandomChar(),
      visible: true,
      originalIndex: index,
    };
  },

  // สร้างรายการไอเทมตามจำนวนที่ต้องการ
  generateList(count, startIndex = 0) {
    return Array.from({ length: count }).map((_, i) =>
      this.createItem(startIndex + i)
    );
  },
};

// --- 🎒 Inventory Utils ---
// เครื่องมือจัดการตำแหน่งไอเทมในกระเป๋า
export const InventoryUtils = {
  // เติมช่องว่างที่ไม่มีไอเทมให้เต็ม
  fillEmptySlots: (
    currentInv,
    reservedIndices,
    limit,
    forceReplace = false
  ) => {
    const nextInv = [...currentInv];
    for (let i = 0; i < limit; i++) {
      const isReserved = reservedIndices.includes(i);
      const isEmpty = nextInv[i] === null;
      if (!isReserved && (isEmpty || forceReplace)) {
        nextInv[i] = DeckManager.createItem(i);
      }
    }
    return nextInv;
  },

  // คืนไอเทมที่เคยเลือกไว้กลับเข้าช่องเดิม (หรือช่องว่างที่ใกล้ที่สุด)
  returnItems: (
    currentInv,
    itemsToReturn,
    limit
  ) => {
    const nextInv = [...currentInv];
    itemsToReturn.forEach((item) => {
      let targetIdx = item.originalIndex;
      // ถ้าช่องเดิมไม่ว่าง ให้หาช่องว่างแรกที่เจอ
      if (nextInv[targetIdx] !== null) {
        const emptyIdx = nextInv.findIndex((x, i) => x === null && i < limit);
        if (emptyIdx !== -1) targetIdx = emptyIdx;
      }
      nextInv[targetIdx] = item;
    });
    return nextInv;
  },
};

// --- 🗺️ Stage & Enemy Processing ---
// จัดการข้อมูลด่านและศัตรูที่ได้จาก API
export const StageProcessor = {
  processStageData: (apiData) => {
    const waves = {};
    
    apiData.forEach((data) => {
      // ✅ บังคับให้เป็น Number เพื่อป้องกันบั๊ก Type Mismatch (1 vs "1")
      const waveNo = Number(data.wave_no); 
      
      if (!waves[waveNo]) waves[waveNo] = [];

      // สุ่มเลือก Pattern เริ่มต้น
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
        // เช็คว่ามี pattern_list ไหม ถ้าไม่มีให้ใส่ Array ว่างป้องกันพัง
        patternList: data.pattern_list || [] 
      });
    });
    
    console.log("Processed Stage Data:", waves); // ดูโครงสร้างหลังแปลงเสร็จ
    return waves;
  }
};

// --- ⚔️ Combat Logic ---
// ระบบคำนวณความแรงตามตัวอักษรและจุดอ่อนศัตรู
export const CombatSystem = {
  calculateDamage: (
    skill,  
    inputWord = "", 
    targetEnemy
  ) => {
    // 1. คำนวณแต้มของคำ (Weighted Length)
    let weightedLength = 0;
    const lowerWord = inputWord.toLowerCase();

    if (targetEnemy && targetEnemy.weakness_list && lowerWord.length > 0) {
        for (const char of lowerWord) {
            // เช็คว่าตัวอักษรแต่ละตัวในคำ เป็นจุดอ่อนของศัตรูหรือไม่
            const weakData = targetEnemy.weakness_list.find((w) => w.alphabet.toLowerCase() === char);
            
            if (weakData) {
                // ถ้าแพ้ทาง ให้บวกคะแนนตามตัวคูณ (Multiplier)
                weightedLength += weakData.multiplier;
            } else {
                weightedLength += 1;
            }
        }
    } else {
        weightedLength = lowerWord.length;
    }

    let baseDamage = 0;
    
    // ⚔️ กรณี Basic Attack (MP Cost = 0): คำนวณจากความยาวคำ * Power
    if ((skill.mpCost || 0) === 0 && skill.effectType === "DAMAGE") {
        const power = skill.basePower || 1;
        baseDamage = (weightedLength * power);
    } 
    // 🚀 กรณี Skill (ใช้ MP): ใช้ความแรงคงที่ตามฐานข้อมูล
    else if (skill.damageMin !== undefined) {
        baseDamage = skill.damageMin;
    } 
    else {
        baseDamage = 1;
    }

    // คืนค่าเป็นทศนิยม 1 ตำแหน่ง
    return parseFloat(baseDamage.toFixed(1));
  },

  // คำนวณแต้มดิบของคำ (Scrabble Style)
  calculateWordScore: (word) => {
    return word
      .toUpperCase()
      .split("")
      .reduce((total, char) => {
        const data = LETTER_DATA[char];
        const score = data ? data.score : 0;
        return total + score;
      }, 0);
  },
};

// --- 🗣️ Word System ---
export const WordSystem = {
  // สุ่มคำศัพท์จาก Dictionary ตามความยาวที่ต้องการ (ใช้สำหรับคำพูดศัตรู)
  getRandomWordByLength: (dictionary, length) => {
    const candidates = dictionary.filter((d) => d.word.length === length);
    if (candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      return candidates[randomIndex].word.toUpperCase();
    }
    
    // Fallback กรณีหาคำใน Dictionary ไม่เจอ
    const fallbackChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += fallbackChars.charAt(
        Math.floor(Math.random() * fallbackChars.length)
      );
    }
    return result;
  },
};