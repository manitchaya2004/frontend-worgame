// --- ตำแหน่งและขนาด (Layout) ---
export const FIXED_Y = 280;         // ความสูงจากขอบบนที่เท้าตัวละครวางอยู่
export const PLAYER_X_POS = 10;     // ตำแหน่งแกน X ของผู้เล่น (%)

export const DISPLAY_NORMAL = 16 * 3.5;  // ขนาด Sprite ปกติ (16px scaled)
export const DISPLAY_WIDE = 32 * 3.5;    // ขนาด Sprite ตอนโจมตี (กว้างกว่าปกติ)

// --- ระบบกระเป๋า (Inventory) ---
export const INVENTORY_COUNT = 20;  // จำนวนช่องในกระเป๋าทั้งหมด (รวมที่ล็อคอยู่)

// --- ข้อมูลตัวอักษร (Letter Pool) ---
// count: จำนวนแผ่นที่มีใน Deck (ช่วยเรื่องโอกาสสุ่มเจอ)
// score: แต้มพื้นฐานของตัวอักษรนั้นๆ
export const LETTER_DATA = {
  A: { count: 3, score: 1 },
  E: { count: 3, score: 1 },
  I: { count: 3, score: 1 },
  O: { count: 3, score: 1 },
  U: { count: 3, score: 1 },
  L: { count: 2, score: 1 },
  N: { count: 2, score: 1 },
  R: { count: 2, score: 1 },
  S: { count: 2, score: 1 },
  T: { count: 2, score: 1 },
  D: { count: 2, score: 1 },
  G: { count: 2, score: 1 },
  B: { count: 2, score: 1 },
  C: { count: 2, score: 1 },
  M: { count: 2, score: 1 },
  P: { count: 2, score: 1 },
  F: { count: 2, score: 1 },
  H: { count: 2, score: 1 },
  V: { count: 1, score: 2 },
  W: { count: 2, score: 1 },
  Y: { count: 2, score: 1 },
  K: { count: 2, score: 1 },
  J: { count: 1, score: 2 },
  X: { count: 1, score: 3 },
  Q: { count: 1, score: 3 },
  Z: { count: 1, score: 3 },
};

// --- การเชื่อมต่อ (Networking) ---
export const ipAddress = "http://25.16.201.205:3000";
export const mapID = "green-grass-1";