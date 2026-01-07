import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DISPLAY_NORMAL, DISPLAY_WIDE, FIXED_Y, PLAYER_X_POS, ipAddress
} from "../../../../const/index";

import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";

export const PlayerEntity = ({
  store,
  isPlayerAttacking,
  playerAtkFrame,
  animFrame,
  onAnimationComplete,
}) => {
  const isAdventure = store.gameState === "ADVANTURE";
  const currentX = store.playerX !== undefined ? store.playerX : PLAYER_X_POS;
  let playerSprite = "";
  const frame = animFrame === 0 ? "1" : "2";

  // Check Phase
  const isAttackingNow = store.actionPhase === "ATTACK" || (isPlayerAttacking && store.actionPhase !== "RUSH");

  if (isAttackingNow) {
    playerSprite = playerAtkFrame === 1 
      ? `${ipAddress}/img_hero/${store.playerData.name}-attack-1.png` //แก้ไข ตรงนี้แหละ เปลี่ยนเป็น playerAction ตัวแปรใหม่ที่เก็บ attack-1 ไรงี้
      : `${ipAddress}/img_hero/${store.playerData.name}-attack-2.png`;
  } else if (store.actionPhase === "RUSH") {
    playerSprite = `${ipAddress}/img_hero/${store.playerData.name}-walk-${frame}.png`;
  } else if (store.isGuarding) {
    playerSprite = `${ipAddress}/img_hero/${store.playerData.name}-guard-1.png`;
  } else if (isAdventure) {
    playerSprite = `${ipAddress}/img_hero/${store.playerData.name}-walk-${frame}.png`;
  } else {
    playerSprite = `${ipAddress}/img_hero/${store.playerData.name}-idle-${frame}.png`;
  }

  return (
    <motion.div
      animate={{ left: `${currentX}%` }}
      // ✅ FIX SLIDING: ใช้ duration แทน spring ตอนพุ่ง
      transition={
        isAdventure
          ? { duration: 1.0, ease: "linear" }
          : store.actionPhase === "RUSH"
            ? { duration: 0.4, ease: "easeInOut" } // พุ่งคมๆ ไม่เด้งเลย
            : { type: "spring", stiffness: 300, damping: 30 }
      }
      style={{
        position: "absolute", top: FIXED_Y, transform: "translateY(-100%)",
        zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center",
      }}
    >
      <motion.div
        animate={{ x: store.isDodging ? -50 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
      >
        <div style={{ zIndex: 20, marginBottom: "10px", height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoutBubble text={store.playerShoutText} />
        </div>
        <div style={{ position: "relative", width: "100px", height: "16px", marginBottom: "35px", zIndex: 15, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <HpBar hp={store.playerData.hp} max={store.playerData.max_hp} color="#4dff8b" />
          <motion.div style={{ position: "absolute", right: "10px", top: "-20px", padding: "0 6px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px", zIndex: 20, minWidth: "24px" }}>
            <span style={{ fontSize: "12px", color: store.playerData.shield > 0 ? "#00bcd4" : "#888", fontWeight: 'bold' }}>🛡</span>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", textShadow: "1px 1px 0 #000" }}>{store.playerData.shield}</span>
          </motion.div>
        </div>
        <div style={{ position: "relative", width: DISPLAY_NORMAL, height: DISPLAY_NORMAL }}>
          <div style={{ position: "relative", zIndex: 5, width: "100%", height: "100%" }}>
            {isAttackingNow ? (
              <motion.div
                key="atk"
                initial={{ scale: 1.5 }} animate={{ scale: [1.5, 2.0, 1.5] }}
                transition={{ duration: 0.4 }} onAnimationComplete={onAnimationComplete}
                style={{
                  x: "-50%", left: "50%", bottom: 0, position: "absolute",
                  width: DISPLAY_WIDE, height: DISPLAY_NORMAL,
                  backgroundImage: `url(${playerSprite})`, backgroundSize: "auto 100%",
                  backgroundRepeat: "no-repeat", imageRendering: "pixelated",
                  transformOrigin: "bottom center", backgroundPosition: "center bottom 0px", 
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%", height: "100%", backgroundImage: `url(${playerSprite})`,
                  backgroundSize: "auto 100%", backgroundRepeat: "no-repeat",
                  imageRendering: "pixelated", transform: "scale(1.5)",
                  transformOrigin: "bottom center", backgroundPosition: "center bottom 0px",
                }}
              />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};