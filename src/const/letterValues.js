// src/const/letterValues.js

// ค่าดาเมจพื้นฐานของแต่ละตัวอักษร (ตามความยากง่าย)
export const LETTER_BASE_VALUES = {
  // สระ (Vowels) = 0
  A: 0.25, E: 0.25, I: 0.25, O: 0.25, U: 0.25,
  
  // พยัญชนะเจอบ่อย (Common) = 0.5
  L: 0.5, N: 0.5, S: 0.5, T: 0.5, R: 0.5,
  
  // กลางๆ (Medium) = 1.0
  D: 0.75, G: 0.75, B: 0.75, C: 0.75, M: 0.75, P: 0.75, F: 0.75, H: 0.75, V: 0.75, W: 0.75, Y: 0.75,
  
  // ยาก (Hard) = 1.5 - 2.0
  K: 1.0, J: 1.0, X: 1.0, Q: 1.0, Z: 1.0
};

export const getLetterDamage = (char, strModifier = 0) => {
  const upperChar = char.toUpperCase();
  const base = LETTER_BASE_VALUES[upperChar] !== undefined ? LETTER_BASE_VALUES[upperChar] : 0.5;
  
  // strModifier คือ (STR - 10) 
  // ดังนั้นแต่ละหน่วยจะบวก 0.25
  return base + (strModifier * 0.25); 
};