import React from "react";
import { motion } from "framer-motion";
import {
  DISPLAY_NORMAL, FIXED_Y, PLAYER_X_POS, ipAddress
} from "../../../../const/index";
import { usePreloadFrames } from "../../../HomePage/hook/usePreloadFrams";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";

export const PlayerEntity = ({ store }) => {
  // 1. ดึงค่าทั้งหมดจาก Store
  const { 
    gameState, playerX, playerData, playerVisual, 
    animFrame , playerShoutText
  } = store;

  // =========================================================
  // 🧠 LOGIC: แปลงคำสั่งจาก Store เป็น Action และ Frame
  // =========================================================
  
  let currentAction = "idle";
  let targetFrame = 1;

  // กรณี 1: เดินในฉากแผนที่ (Adventure) -> บังคับ walk + ใช้ animFrame
  if (gameState === "ADVANTURE") {
    currentAction = "walk";
    targetFrame = animFrame; 
  } 
  // กรณี 2: ฉากต่อสู้ -> ดูค่า playerVisual จาก Store เป็นหลัก
  else {
    // playerVisual อาจเป็น "idle", "walk", "attack-1", "guard-1", "hurt"
    const split = (playerVisual || "idle").split("-");
    
    currentAction = split[0]; // ได้คำว่า "attack", "guard", "idle"

    // เช็คว่า Store สั่งเลขเฟรมมาด้วยไหม? (เช่น -1, -2)
    if (split[1]) {
      // ถ้ามีเลข: Store สั่งล็อคเฟรมนี้ (เช่น attack-1 ก็ต้องโชว์เฟรม 1)
      targetFrame = parseInt(split[1]);
    } else {
      // ถ้าไม่มีเลข: ให้ขยับตามจังหวะชีพจรเกม (animFrame)
      targetFrame = animFrame;
    }
  }

  // =========================================================

  // 2. โหลดรูป (ใช้แค่ชื่อ Action หลัก ไม่เอาเลข)
  const frames = usePreloadFrames("img_hero", playerData.img_path, 2, currentAction);
  
  // 3. เลือกรูปที่จะโชว์ตาม targetFrame ที่คำนวณมา
  const currentSrc = frames[targetFrame - 1] 
    ? frames[targetFrame - 1].src 
    : `${ipAddress}/img_hero/${playerData.img_path}-${currentAction}-${targetFrame}.png`;
  
  return (
    <>
    <pre>{}</pre>
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
        
        <div style={{ position: "relative", width: "100px", height: "16px", marginBottom: "35px", zIndex: 15, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <HpBar hp={playerData.hp} max={playerData.max_hp} color="#4dff8b" />
          <div style={{ position: "absolute", right: "10px", top: "-20px", color: playerData.shield > 0 ? "#00bcd4" : "#888", fontWeight: 'bold', fontSize: "12px", display: "flex", gap: "2px" }}>
             🛡 <span style={{ color: "#fff", textShadow: "1px 1px 0 #000" }}>{playerData.shield}</span>
          </div>
        </div>

        {/* CHARACTER SPRITE */}
        <div style={{ position: "relative", width: DISPLAY_NORMAL, height: DISPLAY_NORMAL }}>
           <motion.div
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
};