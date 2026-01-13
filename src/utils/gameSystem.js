// ============================================================================
// 📊 DECK CONFIGURATION
// ============================================================================
const DECK_COMPOSITION = {
  E: 8, A: 8, I: 8, O: 8, N: 6, R: 6, T: 6, 
  L: 4, S: 4, U: 4, D: 4, G: 3, B: 2, C: 2, 
  M: 2, P: 2, F: 2, H: 2, V: 2, W: 2, Y: 2, 
  K: 1, J: 1, X: 1, QU: 1, Z: 1 
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

export const DeckManager = {
  activeDeck: [],

  init() {
    let tempDeck = [];
    Object.keys(DECK_COMPOSITION).forEach((char) => {
      for (let i = 0; i < DECK_COMPOSITION[char]; i++) {
        tempDeck.push(char);
      }
    });

    for (let i = tempDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tempDeck[i], tempDeck[j]] = [tempDeck[j], tempDeck[i]];
    }

    this.activeDeck = tempDeck;
    console.log(`🎴 Deck Initialized: ${this.activeDeck.length} cards.`);
  },

  draw(currentInventory = [], unlockedSlots = 10) {
    if (this.activeDeck.length === 0) this.init();

    // ดึงรายชื่อตัวอักษรที่มีอยู่ในมือจำลอง
    const existingChars = currentInventory
      .filter(slot => slot !== null)
      .map(slot => slot.char.toUpperCase());
    
    const vowelCount = existingChars.filter(c => VOWELS.includes(c)).length;
    const vowelCeiling = Math.max(2, Math.floor(unlockedSlots / 2));
    const hardChars = ['K', 'J', 'X', 'QU', 'Z'];
    const hasHardInHand = existingChars.some(c => hardChars.includes(c));

    let foundIdx = -1;

    for (let i = this.activeDeck.length - 1; i >= 0; i--) {
      const candidate = this.activeDeck[i].toUpperCase();
      const isVowel = VOWELS.includes(candidate);
      
      // เช็คตัวซ้ำ
      const countInHand = existingChars.filter(c => c === candidate).length;
      
      // ✅ Logic ใหม่: 
      // 1. ถ้าสระล้น (>= Ceiling) ห้ามหยิบสระเด็ดขาด
      if (vowelCount >= vowelCeiling && isVowel) continue;
      
      // 2. ถ้าขาดสระ (< 2) และตัวนี้ไม่ใช่สระ ให้ข้ามไปหาตัวอื่นก่อน (แต่ถ้าหาไม่ได้จริงๆ ค่อยว่ากัน)
      if (vowelCount < 2 && !isVowel && this.activeDeck.length > 10) continue;

      // 3. กฎเหล็ก: ห้ามซ้ำเกิน 2 และ ห้ามตัวยากซ้ำ
      const isTooManyIdentical = countInHand >= 2;
      const isTooManyHard = hasHardInHand && hardChars.includes(candidate);

      if (!isTooManyIdentical && !isTooManyHard) {
        foundIdx = i;
        break;
      }
    }

    // ถ้าวนหาใน 15 ใบสุดท้ายไม่เจอใบที่ถูกกฎเลย ให้หยิบใบสุดท้ายตามดวง
    if (foundIdx !== -1) {
      return this.activeDeck.splice(foundIdx, 1)[0];
    } else {
      return this.activeDeck.pop();
    }
  },

  createItem(index, currentInv = [], unlockedSlots = 10) {
    // ใช้ currentInv ให้ตรงกับที่รับเข้ามาใน Parameter
    const char = this.draw(currentInv, unlockedSlots); 
    
    return {
      id: Math.random(),
      char: char, 
      status: null,         
      statusDuration: 0,
      visible: true,
      originalIndex: index,
    };
  },

  // ✅ เพิ่มฟังก์ชันที่หายไปเพื่อแก้ Uncaught TypeError
  generateList(count) {
    // สร้าง Array เปล่าเพื่อใช้เช็คตัวซ้ำระหว่างสร้าง List
    let list = new Array(count).fill(null);
    for (let i = 0; i < count; i++) {
      // ส่ง list เข้าไปเพื่อให้ createItem รู้ว่าตอนนี้มีตัวอะไรใน "มือจำลอง" บ้าง
      list[i] = {
        id: Math.random(),
        char: this.draw(list, count),
        status: null,
        statusDuration: 0,
        visible: true,
        originalIndex: i,
      };
    }
    return list;
  },
};

// ============================================================================
// 🎒 Inventory Utils
// ============================================================================
export const InventoryUtils = {
  fillEmptySlots: (currentInv, reservedIndices, limit) => {
    let nextInv = [...currentInv];
    for (let i = 0; i < limit; i++) {
      if (!reservedIndices.includes(i) && nextInv[i] === null) {
        // ✅ ส่ง nextInv และ limit (unlockedSlots) เข้าไปคำนวณสระและตัวซ้ำ
        const char = DeckManager.draw(nextInv, limit);
        nextInv[i] = {
            id: Math.random(),
            char: char,
            status: null,
            statusDuration: 0,
            visible: true,
            originalIndex: i,
        };
      }
    }
    return nextInv;
  },

  returnItems: (currentInv, itemsToReturn, limit) => {
    const nextInv = [...currentInv];
    itemsToReturn.forEach((item) => {
      let targetIdx = item.originalIndex;
      if (nextInv[targetIdx] !== null) {
        const emptyIdx = nextInv.findIndex((x, i) => x === null && i < limit);
        if (emptyIdx !== -1) targetIdx = emptyIdx;
      }
      nextInv[targetIdx] = item;
    });
    return nextInv;
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