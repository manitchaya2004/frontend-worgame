import React from "react";
import { motion } from "framer-motion";
import {
  DISPLAY_NORMAL, DISPLAY_WIDE, FIXED_Y, PLAYER_X_POS, ipAddress
} from "../../../../const/index";
import { usePreloadFrames } from "../../../HomePage/hook/usePreloadFrams";
import { useIdleFrame } from "../../../HomePage/hook/useIdleFrame";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";

export const PlayerEntity = ({ store }) => {
  // 1. ดึงค่าจาก Store
  const { 
    gameState, playerX, playerData, playerVisual, 
    animFrame, isDodging, playerShoutText
  } = store;

  // 2. คำนวณชื่อไฟล์
  // 1. ระบุ Action หลัก (เช่น walk หรือ idle) โดยไม่เอาเลขเฟรมพ่วงไป
  // 1. ทำให้ชื่อ Action สะอาด (เช่น "attack-1" -> "attack")
  const actionBase = (gameState === "ADVANTURE") ? "walk" : (playerVisual || "idle");
  const cleanAction = actionBase.split("-")[0];

  // 2. โหลดเป็นชุดเฟรม (2 เฟรม) เพื่อเก็บ Cache ไว้ในเครื่อง
  const frames = usePreloadFrames("img_hero", playerData.name, 2, cleanAction);
  
  // 3. ดึงรูปจาก Cache ตาม animFrame ของ Store
  const currentSrc = frames[animFrame - 1] 
    ? frames[animFrame - 1].src 
    : `${ipAddress}/img_hero/${playerData.name}-${cleanAction}-${animFrame}.png`;
    
  return (
    <motion.div
      animate={{ left: `${playerX ?? PLAYER_X_POS}%` }}
      // ถ้าเดินเล่น (Adventure) ให้เลื่อนแบบ Linear (ลื่นๆ) ถ้าสู้ให้ใช้ Spring
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
        animate={{ x: isDodging ? -50 : 0 }}
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
               // ✅ ใส่ Logic Width กลับคืนมา (เดิน = เต็มกล่องปกติ, ตี = กล่องกว้าง)
               scale:2.0,
               width: DISPLAY_NORMAL,
               height: DISPLAY_NORMAL,
               position: "absolute",
               bottom: 0,
               left: "50%",
               x: "-50%",
               // ตรงนี้จะเปลี่ยนรูปเองตาม animFrame (walk-1 <-> walk-2)
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
  );
};