// src/hook/useGameSfx.js
import { Howl } from 'howler';
import { useAuthStore } from '../store/useAuthStore';

const sfxCache = {};

const getSfx = (src) => {
  if (!sfxCache[src]) {
    sfxCache[src] = new Howl({
      src: [src],
      html5: false,
    });
  }
  return sfxCache[src];
};

export const useGameSfx = (soundFile) => {
  return () => {
    const { sfxVolume, isSfxMuted } = useAuthStore.getState();
    if (isSfxMuted || !soundFile) return;

    try {
      const sound = getSfx(soundFile);
      sound.volume(sfxVolume);
      sound.play();
    } catch (err) {
      console.warn("Failed to play SFX:", err);
    }
  };
};