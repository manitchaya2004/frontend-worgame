import { useState,useEffect } from "react";

export const useStaminaTimer = (stamina) => {
  const currentStamina = stamina?.current ?? 0;
  const maxStamina = stamina?.max ?? 3;
  const timeToNextEnergy = stamina?.timeToNext ?? 0;
  const isFull = currentStamina >= maxStamina;

  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStatus, setTimerStatus] = useState("idle");

  useEffect(() => {
    if (isFull) {
      setTimeLeft(0);
      return;
    }

    let targetTimestamp = parseInt(localStorage.getItem("stamina_target_time"), 10);
    const lastTimeToNext = parseInt(localStorage.getItem("stamina_last_time_to_next"), 10);

    // ถ้า Store ได้รับค่าเวลาอัปเดตใหม่มาจาก Backend
    if (timeToNextEnergy > 0 && timeToNextEnergy !== lastTimeToNext) {
      const oldTarget = targetTimestamp;
      targetTimestamp = Date.now() + timeToNextEnergy;

      // ถ้าเวลาเป้าหมายใหม่ น้อยกว่าเวลาเดิมเกิน 5 วินาที แปลว่า "โดนหักเวลา!" ให้เล่นอนิเมชัน
      if (oldTarget && oldTarget - targetTimestamp > 5000) {
        setTimerStatus("reduced");
        setTimeout(() => setTimerStatus("idle"), 1000);
      }

      localStorage.setItem("stamina_target_time", targetTimestamp.toString());
      localStorage.setItem("stamina_last_time_to_next", timeToNextEnergy.toString());
    } 
    else if (!targetTimestamp || isNaN(targetTimestamp)) {
      targetTimestamp = Date.now() + 30 * 60 * 1000; // Fallback 30 นาที
      localStorage.setItem("stamina_target_time", targetTimestamp.toString());
    }

    const calculateRemain = () => Math.max(0, Math.floor((targetTimestamp - Date.now()) / 1000));
    setTimeLeft(calculateRemain());

    // นับถอยหลังทีละวินาที
    const interval = setInterval(() => {
      setTimeLeft(calculateRemain());
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStamina, maxStamina, timeToNextEnergy]);

  return { timeLeft, isFull, timerStatus };
};