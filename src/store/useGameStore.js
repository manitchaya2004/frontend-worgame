// src/store/useGameStore.js
import { create } from "zustand";
import { createGameSlice } from "./slices/createGameSlice";
import { createEnemySlice } from "./slices/createEnemySlice";
import { createPlayerSlice } from "./slices/createPlayerSlice";

/**
 * Main Store ที่รวม Slices ทั้งหมดเข้าด้วยกัน
 * แบ่งเป็น:
 * - GameSlice: จัดการสถานะหลัก, Loading, การ Update Loop
 * - EnemySlice: จัดการศัตรู, Wave, AI, และ Quiz Mode
 * - PlayerSlice: จัดการเลือด, มานา, กระเป๋า (Inventory), และการใช้สกิล
 */
export const useGameStore = create((...a) => ({
  ...createGameSlice(...a),
  ...createEnemySlice(...a),
  ...createPlayerSlice(...a),
}));