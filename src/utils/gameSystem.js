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
    //console.log(`🎴 Deck Initialized: ${this.activeDeck.length} cards.`);
  },

  draw(currentInventory = [], unlockedSlots = 10) {
    if (this.activeDeck.length === 0) this.init();

    // กรองเอาเฉพาะตัวอักษรที่มีค่าจริงๆ มาเช็คเงื่อนไข Vowel
    const existingChars = currentInventory
      .filter((slot) => slot && slot.char)
      .map((slot) => slot.char.toUpperCase());

    const vowelCount = existingChars.filter((c) => VOWELS.includes(c)).length;
    const vowelCeiling = Math.max(2, Math.floor(unlockedSlots / 2));
    
    let foundIdx = -1;

    for (let i = this.activeDeck.length - 1; i >= 0; i--) {
      const candidate = this.activeDeck[i]?.toUpperCase();
      if (!candidate) continue;

      const isVowel = VOWELS.includes(candidate);
      // Desperate Mode: ถ้าวนหาเกิน 15 ใบแล้วยังไม่เจอที่ถูกใจ ให้หยิบใบนี้เลย
      const isDesperate = i < this.activeDeck.length - 15;

      if (!isDesperate) {
        if (vowelCount >= vowelCeiling && isVowel) continue;
        if (vowelCount < 2 && !isVowel && this.activeDeck.length > 10) continue;
      }

      foundIdx = i;
      break;
    }

    let pickedChar = "";
    if (foundIdx !== -1) {
      pickedChar = this.activeDeck.splice(foundIdx, 1)[0];
    } else {
      pickedChar = this.activeDeck.pop();
    }
    
    return pickedChar || "E"; // ป้องกันขั้นสุด ถ้าไม่ได้อะไรเลยให้คืน "E"
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
      result += fallbackChars.charAt(Math.floor(Math.random() * fallbackChars.length));
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
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  },
  findBestWordFromLetters: (letters, dictionary, maxLetters) => {
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
  }
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
  }
}