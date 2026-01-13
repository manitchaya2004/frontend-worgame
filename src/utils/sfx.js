// src/utils/sfx.js

// 1. Import ไฟล์เสียง (Bundler อย่าง Vite หรือ Webpack จะจัดการแปลงเป็น URL ให้)
import hitSoundUrl from "../assets/sound/hit.wav";
import block from "../assets/sound/block.wav"
import miss from "../assets/sound/miss.wav"
import walk from "../assets/sound/walk.wav"

/**
 * ฟังก์ชันกลางสำหรับเล่นเสียง
 * @param {string} audioUrl - URL ของไฟล์เสียงที่ได้จากการ import
 * @param {number} volume - ระดับเสียง (0.0 - 1.0)
 */
const playSound = (audioUrl, volume = 0.5) => {
  // 2. ใช้ URL จากการ Import โดยตรง
  const audio = new Audio(audioUrl); 
  audio.volume = volume;
  
  // จัดการเรื่อง Browser นโยบายการ Auto-play (ต้องมีการคลิกจอก่อน 1 ครั้งถึงจะดัง)
  audio.play().catch(e => {
    // console.log("Audio play blocked by browser policy", e);
  });
};

export const sfx = {
  /** เล่นเสียงเมื่อโจมตีโดนศัตรู */
  playHit: () => playSound(hitSoundUrl),
  playBlock: () => playSound(block),
  playMiss: () => playSound(miss),
  playWalk: () => playSound(walk),
};