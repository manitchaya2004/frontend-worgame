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

// สร้าง Pool สำหรับการจั่วโดยแยกตามกลุ่ม (แปลง Q เป็น QU สำหรับใช้เป็นตัวหมากในเกม)
const G1_POOL = [...POWER_GROUPS.G1];
const G2_POOL = [...POWER_GROUPS.G2];
const G3_POOL = POWER_GROUPS.G3.map((char) => (char === "Q" ? "QU" : char));

export const DeckManager = {
  // ไม่ใช้ระบบกองการ์ดแล้ว ปล่อยว่างไว้เผื่อระบบเก่าเรียกใช้จะได้ไม่พัง
  activeDeck: [],

  init() {
    // เอา DECK_COMPOSITION ออกตามที่คุณต้องการ ไม่ต้องใช้ฟังก์ชันนี้จัดการกองการ์ดแล้ว
  },

  draw(currentInventory = [], unlockedSlots = 10) {
    const existingChars = currentInventory
      .filter((slot) => slot && slot.char)
      .map((slot) => slot.char.toUpperCase());

    // นับจำนวนไอเทมที่มีอยู่ในมือเพื่อดูว่าใบต่อไปที่จะจั่วคือลำดับที่เท่าไหร่ในชุด 4 ตัว
    const existingCount = existingChars.length;
    const positionInChunk = existingCount % 4;

    let pickedChar = "";

    // ลำดับ: 0, 1, 2 เป็นพยัญชนะ | ลำดับ 3 เป็นสระ (วนลูปทุกๆ 4 ใบ)
    if (positionInChunk === 3) {
      // จั่วสระ G1 (ใบที่ 4)
      pickedChar = G1_POOL[Math.floor(Math.random() * G1_POOL.length)];
    } else {
      // จั่วพยัญชนะ (ใบที่ 1, 2, 3)
      const chunkStart = Math.floor(existingCount / 4) * 4;
      const currentChunkChars = existingChars.slice(chunkStart);

      // เช็คว่าในกลุ่ม 4 ตัวนี้ (ที่จั่วมาก่อนหน้า) มี G3 ไปแล้วหรือยัง
      const hasG3InChunk = currentChunkChars.some((char) => {
        return G3_POOL.includes(char) || POWER_GROUPS.G3.includes(char);
      });

      let availableConsonants = [];
      if (hasG3InChunk) {
        // มี G3 ในกลุ่มนี้ไปแล้ว ห้ามเอา G3 อีก ให้สุ่มเฉพาะจาก G2 เท่านั้น
        availableConsonants = [...G2_POOL];
      } else {
        // ยังไม่มี G3 ให้สุ่มรวมกันระหว่าง G2 และ G3
        availableConsonants = [...G2_POOL, ...G3_POOL];
      }

      pickedChar =
        availableConsonants[
          Math.floor(Math.random() * availableConsonants.length)
        ];
    }

    return pickedChar;
  },

  createItem(index, currentInv = [], unlockedSlots = 10) {
    const char = this.draw(currentInv, unlockedSlots);
    return {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      char: String(char),
      status: null,
      statusDuration: 0,
      visible: true,
      originalIndex: index,
    };
  },

  generateList(count) {
    let list = new Array(count).fill(null);
    for (let i = 0; i < count; i++) {
      list[i] = this.createItem(i, list, count);
    }
    return list;
  },

  fillEmptySlots(currentInv, reservedIndices, limit) {
    let nextInv = [...currentInv];
    for (let i = 0; i < limit; i++) {
      if (!reservedIndices.includes(i) && nextInv[i] === null) {
        nextInv[i] = this.createItem(i, nextInv, limit);
      }
    }
    return nextInv;
  },

  returnItems(currentInv, itemsToReturn, limit) {
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

  getLetterDamage: (char) => {
    if (!char) return 0;
    let upperChar = char.toUpperCase();
    if (upperChar === "QU") upperChar = "Q";
    const value = GLOBAL_POWER_MAP[upperChar];
    return value !== undefined ? Number(value) : 0;
  },
};

export const WordSystem = {
  getRandomWordByLength: (dictionary, length) => {
    const candidates = dictionary.filter((d) => d.word.length === length);
    if (candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      return candidates[randomIndex].word.toUpperCase();
    }
    const fallbackChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += fallbackChars.charAt(
        Math.floor(Math.random() * fallbackChars.length),
      );
    }
    return result;
  },
  getLevenshteinDistance: (a, b) => {
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
            matrix[i - 1][j] + 1,
          );
        }
      }
    }
    return matrix[b.length][a.length];
  },
  findBestWordFromLetters: (letters, dictionary, maxLetters) => {
    if (!letters || letters.length === 0)
      return { bestWord: "", usedItems: [] };

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
  },
};

export const GameLogic = {
  calculateZoneBuffs: (
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

      let validInPile = drawPile.filter(
        (c) => (c.size || 10) <= remainingSpace,
      );

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
  },

  applyRandomBuffs: (inventory, deckList = [], drawPile = []) => {
    const newItems = inventory.map((item) =>
      item ? { ...item, buff: null, buffId: null } : null,
    );
    let validIndices = newItems
      .map((item, idx) => (item ? idx : null))
      .filter((i) => i !== null);

    let updatedDrawPile = [...drawPile];

    if (validIndices.length > 0 && deckList.length > 0) {
      // 🌟 FIX: ระบุชื่อ Object GameLogic นำหน้าฟังก์ชันเสมอ
      let result = GameLogic.calculateZoneBuffs(
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
  },
};
