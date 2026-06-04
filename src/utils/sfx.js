// src/utils/sfx.js
import { Howl } from "howler";

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
import advantureUrl from "../assets/music/advanture.mp3"; 

import { useAuthStore } from "../store/useAuthStore";

// =========================================================
// 2. SFX SYSTEM (เสียงเอฟเฟกต์)
// =========================================================
const sfxCache = {};

const getSfx = (url) => {
  if (!sfxCache[url]) {
    sfxCache[url] = new Howl({
      src: [url],
      html5: false, // Low latency for SFX
    });
  }
  return sfxCache[url];
};

const playSound = (audioUrl, volume = 0.5) => {
  const { sfxVolume, isSfxMuted } = useAuthStore.getState();
  if (isSfxMuted) return;

  try {
    const sound = getSfx(audioUrl);
    sound.volume(sfxVolume * volume);
    sound.play();
  } catch (err) {
    console.warn("Failed to play sound:", err);
  }
};

export const sfx = {
  playHit: () => playSound(hitSoundUrl),
  playBlock: () => playSound(block),
  playMiss: () => playSound(miss),
  playWalk: () => playSound(walk, 0.1), 
  playPoison: () => playSound(poison),
  playGameOver: () => playSound(gameOver, 0.7),
  speakWord: (word) => {
    return new Promise((resolve) => {
      const { sfxVolume, isSfxMuted } = useAuthStore.getState();
      if (isSfxMuted || !word) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.volume = sfxVolume;
      utterance.pitch = 1.3; 
      utterance.rate = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const cuteVoice = voices.find(v => v.name.includes("Samantha")) || 
                       voices.find(v => v.name.includes("Google US English")) ||
                       voices.find(v => v.name.toLowerCase().includes("female")) ||
                       voices[0];
      
      if (cuteVoice) utterance.voice = cuteVoice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }
};

// =========================================================
// 3. BGM SYSTEM (เพลงประกอบ - เล่นวนลูป)
// =========================================================

let currentBgm = null;
let currentBgmUrl = null;
let currentBgmVolume = 0.1;

export const bgm = {
  play: (url, volume = 0.1) => {
    const { volume: globalVolume, isMuted } = useAuthStore.getState();
    const targetVolume = isMuted ? 0 : (globalVolume * volume);

    if (currentBgm) {
      if (currentBgmUrl === url) {
        // Just update volume if playing the same track
        currentBgm.volume(targetVolume);
        return;
      }
      currentBgm.stop();
      currentBgm.unload();
    }

    currentBgmUrl = url;
    currentBgmVolume = volume;
    currentBgm = new Howl({
      src: [url],
      loop: true,
      html5: true, // Stream larger audio files
      volume: targetVolume,
    });

    currentBgm.play();
  },

  stop: () => {
    if (currentBgm) {
      currentBgm.stop();
      currentBgm.unload();
      currentBgm = null;
      currentBgmUrl = null;
    }
  },

  setVolume: (vol) => {
    if (currentBgm) currentBgm.volume(vol);
  },

  updateLiveVolume: () => {
    const { volume: globalVolume, isMuted } = useAuthStore.getState();
    if (currentBgm) {
      currentBgm.volume(isMuted ? 0 : (globalVolume * currentBgmVolume));
    }
  },

  playAdvanture: () => bgm.play(advantureUrl, 0.2),
};