// สร้างไฟล์ใหม่ src/hook/useGameSfx.js
import useSound from 'use-sound';
import { useAuthStore } from '../store/useAuthStore';

export const useGameSfx = (soundFile) => {
  // ดึงค่าความดังและการ Mute ของ SFX มาจาก Store แบบ Real-time
  const { sfxVolume, isSfxMuted } = useAuthStore();

  const [play] = useSound(soundFile, {
    volume: isSfxMuted ? 0 : sfxVolume, // ถ้ายกเลิกเสียง ให้ความดังเป็น 0
  });

  return play;
};