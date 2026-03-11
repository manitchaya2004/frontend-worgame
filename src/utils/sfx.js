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
import gameOver from "../assets/sound/game-over.mp3";

// --- Background Music (BGM) ---
// ✅ Import ไฟล์เพลงใหม่ตรงนี้ (ตรวจสอบ path ให้ชัวร์ว่าไฟล์อยู่ที่นี่จริง)
import advantureUrl from "../assets/music/advanture.mp3"; 

import { useAuthStore } from "../store/useAuthStore";
// =========================================================
// 2. SFX SYSTEM (เสียงเอฟเฟกต์)
// =========================================================
const playSound = (audioUrl, volume = 0.5) => {
  const { sfxVolume, isSfxMuted } = useAuthStore.getState();
  
  if (isSfxMuted) return; // ถ้า Mute อยู่ ไม่ต้องเล่นเสียงเลย

  const audio = new Audio(audioUrl); 
  audio.volume = sfxVolume * volume;
  audio.play().catch(e => {
    // console.warn("SFX blocked", e);
  });
};

export const sfx = {
  playHit: () => playSound(hitSoundUrl),
  playBlock: () => playSound(block),
  playMiss: () => playSound(miss),
  playWalk: () => playSound(walk, 0.1), // เดินอาจจะปรับเบาหน่อย
  playPoison: () => playSound(poison),
  playGameOver: () => playSound(gameOver, 0.7)
};

// =========================================================
// 3. BGM SYSTEM (เพลงประกอบ - เล่นวนลูป)
// =========================================================

let currentBgmAudio = null; // ตัวแปรเก็บเพลงปัจจุบัน
let currentBaseVolume = 0.1; // จำค่าความดังมาตรฐานของเพลงนั้นๆ

export const bgm = {
  play: (url, volume = 0.1) => {
    // 💡 ดึงสถานะปัจจุบันจาก Store
    const { volume: globalVolume, isMuted } = useAuthStore.getState();

    if (currentBgmAudio) {
      if (currentBgmAudio.src.includes(url)) {
        // ถ้าเป็นเพลงเดิมที่เล่นอยู่ ให้เล่นต่อและปรับแค่ความดัง
        currentBgmAudio.volume = isMuted ? 0 : (globalVolume * volume);
        return;
      }
      currentBgmAudio.pause();
      currentBgmAudio.currentTime = 0;
    }

    currentBaseVolume = volume;
    const audio = new Audio(url);
    audio.volume = isMuted ? 0 : (globalVolume * volume);
    audio.loop = true;

    audio.play().catch(e => {
      console.warn("BGM Autoplay blocked by browser. User needs to click first.");
    });

    currentBgmAudio = audio;
  },

  stop: () => {
    if (currentBgmAudio) {
      currentBgmAudio.pause();
      currentBgmAudio.currentTime = 0;
      currentBgmAudio = null;
    }
  },

  setVolume: (vol) => {
    if (currentBgmAudio) currentBgmAudio.volume = vol;
  },

  // 💡 ฟังก์ชันใหม่สำหรับอัปเดตเสียงแบบเรียลไทม์เมื่อกดจาก AppBar
  updateLiveVolume: () => {
    const { volume: globalVolume, isMuted } = useAuthStore.getState();
    if (currentBgmAudio) {
      currentBgmAudio.volume = isMuted ? 0 : (globalVolume * currentBaseVolume);
    }
  },

  playAdvanture: () => bgm.play(advantureUrl, 0.2),
};