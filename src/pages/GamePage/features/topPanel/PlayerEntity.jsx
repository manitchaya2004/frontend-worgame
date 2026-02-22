import React, { useMemo, memo } from "react";
import { motion } from "framer-motion";
import {
  DISPLAY_NORMAL, FIXED_Y, PLAYER_X_POS
} from "../../../../const/index";
import { usePreloadFrames } from "../../../HomePage/hook/usePreloadFrams";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";
import { MpBar } from "./MpBar";

export const PlayerEntity = memo(({ store }) => {
  // 1. ดึงค่าทั้งหมดจาก Store
  const { 
    gameState, playerX, playerData, playerVisual, 
    animFrame , playerShoutText
  } = store;

  // =========================================================
  // 🧠 LOGIC: แปลงคำสั่งจาก Store เป็น Action และ URL (ใช้ useMemo ป้องกันรูปวาป)
  // =========================================================
  
  const currentSrc = useMemo(() => {
    let currentAction = "idle";
    let targetFrame = 1;

    // กรณี 1: เดินในฉากแผนที่
    if (gameState === "ADVANTURE") {
      currentAction = "walk";
      targetFrame = animFrame; 
    } 
    // กรณี 2: ฉากต่อสู้
    else {
      const split = (playerVisual || "idle").split("-");
      currentAction = split[0];
      targetFrame = split[1] ? parseInt(split[1]) : animFrame;
    }

    // 🛑 แก้ไขปัญหา 404: ถ้าเป็นท่า guard ให้บังคับใช้เฟรม 1 เสมอ
    if (currentAction === "guard") {
      targetFrame = 1;
    }

    // สร้าง URL หรือดึงจาก Preload (ถ้ามี)
    return `/api/img_hero/${playerData.img_path}-${currentAction}-${targetFrame}.png`;
  }, [gameState, animFrame, playerVisual, playerData.img_path]);

  // 🛑 แก้ไขปัญหาพรีโหลด: ถ้าเป็น guard ให้โหลดแค่ 1 ภาพ นอกนั้นโหลด 2 ภาพตามปกติ
  const currentActionBase = (playerVisual || "idle").split("-")[0];
  const preloadFrameCount = currentActionBase === "guard" ? 1 : 2;
  
  // ยังคงเรียก Hook เพื่อให้ Browser ทำการ Fetch ข้อมูลไว้ (ตามโครงสร้างเดิมของคุณ)
  usePreloadFrames("img_hero", playerData.img_path, preloadFrameCount, gameState === "ADVANTURE" ? "walk" : currentActionBase);

  // =========================================================

  return (
    <>
    <motion.div
      animate={{ left: `${playerX ?? PLAYER_X_POS}%` }}
      transition={
         gameState === "ADVANTURE" 
         ? { duration: 2.0, ease: "linear" } 
         : { type: "spring", stiffness: 300, damping: 30 }
      }
      style={{
        position: "absolute", top: FIXED_Y, transform: "translateY(-100%)",
        zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center",
      }}
    >
      <motion.div
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
      >
        {/* UI Elements */}
        <div style={{ zIndex: 20, marginBottom: "10px", height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoutBubble text={playerShoutText} />
        </div>
        
        {/* --- HUD ZONE (อยู่บนหัวผู้เล่น) --- */}
        <div 
          style={{ 
            position: "relative", 
            width: "100px", 
            marginBottom: "35px", 
            zIndex: 15, 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center"
          }}
        >
          <HpBar hp={playerData.hp} max={playerData.max_hp} color="#4dff8b" />
          <MpBar mp={playerData.mana} max={playerData.max_mana} color="#3b82f6" />

          <div style={{ position: "absolute", right: "10px", top: "-20px", color: playerData.shield > 0 ? "#00bcd4" : "#888", fontWeight: 'bold', fontSize: "12px", display: "flex", gap: "2px" }}>
              🛡 <span style={{ color: "#fff", textShadow: "1px 1px 0 #000" }}>{playerData.shield}</span>
          </div>
        </div>

        {/* CHARACTER SPRITE */}
        <div style={{ position: "relative", width: DISPLAY_NORMAL, height: DISPLAY_NORMAL }}>
           <motion.div
             key={currentSrc} // ✅ ใช้ key เพื่อลดอาการภาพกะพริบตอนเปลี่ยนเฟรม/ท่าทาง
             initial={{ opacity: 0.9 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.05 }}
             style={{
               scale: 2.0,
               width: DISPLAY_NORMAL,
               height: DISPLAY_NORMAL,
               position: "absolute",
               bottom: 0,
               left: "50%",
               x: "-50%",
               backgroundImage: `url(${currentSrc})`,
               backgroundSize: "auto 100%",
               backgroundRepeat: "no-repeat",
               backgroundPosition: "center bottom 0px",
               imageRendering: "pixelated",
               transformOrigin: "bottom center",
             }}
           />
        </div>

      </motion.div>
    </motion.div>
    </>
  );
});