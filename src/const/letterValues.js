// src/const/letterValues.js

// ค่าดาเมจพื้นฐานของแต่ละตัวอักษร (ตามความยากง่าย)
export const LETTER_BASE_VALUES = {
  // สระ (Vowels) = 0
  A: 0, E: 0, I: 0, O: 0, U: 0,
  
  // พยัญชนะเจอบ่อย (Common) = 0.5
  L: 0.5, N: 0.5, S: 0.5, T: 0.5, R: 0.5,
  
  // กลางๆ (Medium) = 1.0
  D: 1.0, G: 1.0, B: 1.0, C: 1.0, M: 1.0, P: 1.0, F: 1.0, H: 1.0, V: 1.0, W: 1.0, Y: 1.0,
  
  // ยาก (Hard) = 1.5 - 2.0
  K: 1.5, J: 2.0, X: 2.0, Q: 2.0, Z: 2.0
};

export const getLetterDamage = (char, strModifier) => {
  const upperChar = char.toUpperCase();
  const base = LETTER_BASE_VALUES[upperChar] !== undefined ? LETTER_BASE_VALUES[upperChar] : 0.5;
  
  // สูตร: Base + (STR Mod * 0.5)
  // ตัวอย่าง: ถ้า Mod คือ +2 (STR 14) -> ดาเมจเพิ่ม 1 หน่วยต่อตัวอักษร
  const bonus = strModifier * 0.5;
  
  // ห้ามต่ำกว่า 0
  return Math.max(0, base + bonus);
};