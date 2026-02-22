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
};