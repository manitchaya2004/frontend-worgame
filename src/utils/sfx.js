// src/utils/sfx.js

// =========================================================
// 1. IMPORT ASSETS
// =========================================================

// --- Sound Effects (SFX) ---
import hitSoundUrl from "../assets/sound/hit.wav";
import block from "../assets/sound/block.wav";
import miss from "../assets/sound/miss.wav";
import walk from "../assets/sound/walk.wav";
import poison from "../assets/sound/poison.wav";

// --- Background Music (BGM) ---
// ✅ Import ไฟล์เพลงใหม่ตรงนี้ (ตรวจสอบ path ให้ชัวร์ว่าไฟล์อยู่ที่นี่จริง)
import greenGrassUrl from "../assets/music/green-grass.mp3"; 
import battleUrl from "../assets/music/battle.mp3"

// =========================================================
// 2. SFX SYSTEM (เสียงเอฟเฟกต์)
// =========================================================
const playSound = (audioUrl, volume = 0.5) => {
  const audio = new Audio(audioUrl); 
  audio.volume = volume;
  audio.play().catch(e => {
    // console.warn("SFX blocked", e);
  });
};

export const sfx = {
  playHit: () => playSound(hitSoundUrl),
  playBlock: () => playSound(block),
  playMiss: () => playSound(miss),
  playWalk: () => playSound(walk, 0.3), // เดินอาจจะปรับเบาหน่อย
  playPoison: () => playSound(poison),
};

// =========================================================
// 3. BGM SYSTEM (เพลงประกอบ - เล่นวนลูป)
// =========================================================

let currentBgmAudio = null; // ตัวแปรเก็บเพลงปัจจุบัน

export const bgm = {
  /**
   * เล่นเพลง (จะหยุดเพลงเก่าให้อัตโนมัติ)
   * @param {string} url - URL ของไฟล์เพลง
   * @param {number} volume - ความดัง (0.0 - 1.0)
   */
  play: (url, volume = 0.1) => {
    // 1. เช็คว่ามีเพลงเดิมเล่นอยู่ไหม
    if (currentBgmAudio) {
      // ถ้าสั่งเล่นเพลงเดิมซ้ำ -> ไม่ทำอะไร (เล่นต่อเลย)
      if (currentBgmAudio.src.includes(url)) return;
      
      // ถ้าเป็นเพลงใหม่ -> หยุดเพลงเก่า
      currentBgmAudio.pause();
      currentBgmAudio.currentTime = 0;
    }

    // 2. สร้าง Audio ใหม่
    const audio = new Audio(url);
    audio.volume = volume;
    audio.loop = true; // ✅ สั่งให้เล่นวนซ้ำ

    // 3. เล่นเพลง
    audio.play().catch(e => {
      console.warn("BGM Autoplay blocked by browser. User needs to click first.");
    });

    // 4. จำไว้ในตัวแปร global
    currentBgmAudio = audio;
  },

  /** หยุดเพลงทั้งหมด */
  stop: () => {
    if (currentBgmAudio) {
      currentBgmAudio.pause();
      currentBgmAudio.currentTime = 0;
      currentBgmAudio = null;
    }
  },

  /** ปรับความดัง */
  setVolume: (vol) => {
    if (currentBgmAudio) currentBgmAudio.volume = vol;
  },

  // ------------------------------------
  // ✅ PRESETS: เรียกใช้ง่ายๆ
  // ------------------------------------
  playGreenGrass: () => bgm.play(greenGrassUrl, 0.08), // ปรับความดังตรงนี้ (0.2 = 20%)
  playBattle: () => bgm.play(battleUrl, 0.08)
};