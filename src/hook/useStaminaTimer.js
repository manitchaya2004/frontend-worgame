import { useState, useEffect, useRef } from "react";

export const useStaminaTimer = (stamina) => {
  const currentStamina = stamina?.current ?? 0;
  const maxStamina = stamina?.max ?? 3;
  const timeToNextEnergy = stamina?.timeToNext ?? 0;
  const isFull = currentStamina >= maxStamina;

  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStatus, setTimerStatus] = useState("idle");
  
  // ตัวแปรไว้จำค่าสายฟ้าล่าสุด เพื่อดูว่าสายฟ้าเพิ่งเด้งเพิ่มหรือไม่
  const prevStaminaRef = useRef(currentStamina);

  useEffect(() => {
    if (isFull) {
      setTimeLeft(0);
      return;
    }

    let targetTimestamp = parseInt(localStorage.getItem("stamina_target_time"), 10);
    const lastTimeToNext = parseInt(localStorage.getItem("stamina_last_time_to_next"), 10);

    // ลอจิกใหม่ เช็คให้ครอบคลุมทุกสถานการณ์
    const isStaminaChanged = currentStamina !== prevStaminaRef.current; // สายฟ้าเปลี่ยน?
    const isTimeUpdated = timeToNextEnergy > 0 && timeToNextEnergy !== lastTimeToNext; // เวลาจากหลังบ้านเปลี่ยนแบบตรงๆ?
    
    // 💡 THE FIX: เอา isTimerExpired ออก เพราะมันเป็นต้นเหตุที่ทำให้เวลา Frontend แอบต่ออายุ 30 นาทีเอง ทั้งที่ยังไม่ได้ยืนยันจาก Backend

    // ถ้าเวลาอัปเดตจากการเล่นมินิเกม หรือ สายฟ้าเพิ่งเด้งเพิ่ม (อิงจาก Backend ล้วนๆ)
    if (isTimeUpdated || isStaminaChanged) {
      const oldTarget = targetTimestamp;
      targetTimestamp = Date.now() + timeToNextEnergy;

      // เช็คการโดนหักเวลา (ทำอนิเมชันเด้งเฉพาะตอนที่เวลาหดฮวบ และสายฟ้าต้องไม่ได้เพิ่งเพิ่ม เพื่อกันเด้งผิดจังหวะ)
      if (!isStaminaChanged && oldTarget && oldTarget - targetTimestamp > 5000) {
        setTimerStatus("reduced");
        setTimeout(() => setTimerStatus("idle"), 1000);
      }

      localStorage.setItem("stamina_target_time", targetTimestamp.toString());
      localStorage.setItem("stamina_last_time_to_next", timeToNextEnergy.toString());
    } 
    else if (!targetTimestamp || isNaN(targetTimestamp)) {
      // Fallback กรณีไม่มีค่าเก่าเลย
      targetTimestamp = Date.now() + (timeToNextEnergy > 0 ? timeToNextEnergy : 30 * 60 * 1000); 
      localStorage.setItem("stamina_target_time", targetTimestamp.toString());
      localStorage.setItem("stamina_last_time_to_next", timeToNextEnergy.toString()); // Init ค่านี้ด้วยกันบัค
    }

    // อัปเดตค่าสายฟ้าเก็บไว้เทียบในรอบถัดไป
    prevStaminaRef.current = currentStamina;

    const calculateRemain = () => Math.max(0, Math.floor((targetTimestamp - Date.now()) / 1000));
    setTimeLeft(calculateRemain());

    // 💡 THE FIX: ปรับการนับถอยหลังเป็นทุกๆ 200 มิลลิวินาที เพื่อให้ 2 จอ Sync กันเป๊ะระดับเสี้ยววินาที
    const interval = setInterval(() => {
      setTimeLeft(calculateRemain());
    }, 200);

    return () => clearInterval(interval);
  }, [currentStamina, maxStamina, timeToNextEnergy, isFull]);

  return { timeLeft, isFull, timerStatus };
};