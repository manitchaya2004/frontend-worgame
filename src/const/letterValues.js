// src/const/letterValues.js

// ค่าดาเมจพื้นฐานของแต่ละตัวอักษร (ตามความยากง่าย)
export const LETTER_BASE_VALUES = {
  // สระ (Vowels) = 0
  A: 0, E: 0, I: 0, O: 0, U: 0,

  // พยัญชนะเจอบ่อย (Common) = 0.5
  L: 0.25, N: 0.25, S: 0.25, T: 0.25, R: 0.25,
  
  // กลางๆ (Medium) = 1.0
  D: 0.5, G: 0.5, B: 0.5, C: 0.5, M: 0.5, P: 0.5, F: 0.5, H: 0.5, V: 0.5, W: 0.5, Y: 0.5,
  
  // ยาก (Hard) = 1.5 - 2.0
  K: 0.75, J: 0.75, X: 0.75, "Qu": 0.75, Z: 0.75
};

export const getLetterDamage = (char, atk) => {
  const upperChar = char.toUpperCase();
  const base = LETTER_BASE_VALUES[upperChar] !== undefined ? LETTER_BASE_VALUES[upperChar] : 0.5;
  
  // strModifier คือ (STR - 10) 
  // ดังนั้นแต่ละหน่วยจะบวก 0.25
  return base + atk ; 
};