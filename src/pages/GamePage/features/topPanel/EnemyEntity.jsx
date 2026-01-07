import React from "react";
import { motion } from "framer-motion";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";
import { DISPLAY_NORMAL, FIXED_Y, ipAddress } from "../../../../const/index";

export const EnemyEntity = ({
  enemy,
  index,
  animFrame,
  isTargeted,
  gameState,
  onSelect,
  style,
  onHover,
  selectionCount = 0,
}) => {
  
  // --- LOGIC: การสลับ Sprite ---
  const isAtk = enemy.atkFrame > 0;
  let sprite = "";

  if (isAtk) {
    // ท่าโจมตี
    sprite = enemy.atkFrame === 2
      ? `${ipAddress}/img_monster/${enemy.monster_id}-attack-2.png`
      : `${ipAddress}/img_monster/${enemy.monster_id}-attack-1.png`;
  } else {
    // ท่า Idle: สลับ 1 กับ 2 ตาม animFrame (0/1) ที่ส่งมาจาก Parento
    const frameNumber = animFrame === 0 ? "1" : "2";
    sprite = `${ipAddress}/img_monster/${enemy.monster_id}-idle-${frameNumber}.png`;
  }

  // การเคลื่อนที่ซ้าย-ขวา
  const movementTransition =
    gameState === "QUIZ_MODE"
      ? { duration: 10, ease: "linear" }
      : { type: "tween", duration: 0.2 };

  return (
    <motion.div
      initial={{
        left: `${enemy.x}%`,
        x: "-50%",
        y: "-100%",
        scale: 0,
        opacity: 0,
      }}
      animate={{
        left: `${enemy.x}%`,
        x: "-50%",
        y: "-100%",
        scale: 1,
        opacity: 1,
      }}
      exit={{
        x: 500,
        y: -1000,
        rotate: 1800,
        scale: 1,
        opacity: 1,
        transition: { duration: 0.2, ease: "easeIn" },
      }}
      transition={{
        default: { type: "spring", stiffness: 300, damping: 15 },
        left: movementTransition,
        opacity: { duration: 0.3 },
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(enemy.id);
      }}
      onMouseEnter={() => onHover && onHover(true)}
      onMouseLeave={() => onHover && onHover(false)}
      style={{
        position: "absolute",
        top: FIXED_Y,
        width: DISPLAY_NORMAL,
        height: DISPLAY_NORMAL,
        zIndex: 100 - index,
        transformOrigin: "center center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "pointer",
        ...style,
      }}
    >
      {/* --- HUD (HP Bar, Shield, Target) --- */}
      {enemy.hp > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "55px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            pointerEvents: "none",
          }}
        >
          {/* Target Overlay */}
          {(isTargeted || selectionCount > 0) && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 200,
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  border: "4px solid red",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(255, 0, 0, 0.2)",
                  boxShadow: "0 0 15px red",
                }}
              >
                {selectionCount > 0 && (
                  <span
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "24px",
                      textShadow: "2px 2px 0 #000",
                    }}
                  >
                    {selectionCount > 1 ? `x${selectionCount}` : "TARGET"}
                  </span>
                )}
              </div>
            </motion.div>
          )}

          <div
            style={{
              marginBottom: "10px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoutBubble text={enemy.shoutText} />
          </div>

          {/* Wrapper สำหรับ HP + Shield */}
          <div style={{ position: "relative", width: "100px", height: "16px", marginBottom: "35px", zIndex: 15, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <HpBar hp={enemy.hp} max={enemy.maxHp} color="#ff4d4d" />

            {/* Shield Badge */}
            <div
              style={{
                position: "absolute",
                right: "10px", 
                top: "-20px", 
                padding: "0 6px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                zIndex: 20,
                minWidth: "24px",
              }}
            >
              <span style={{ fontSize: "12px", color: enemy.shield > 0 ? "#ff9800" : "#888", fontWeight:'bold', lineHeight: 1 }}>🛡</span>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", textShadow: "1px 1px 0 #000", lineHeight: 1 }}>
                {enemy.shield || 0} 
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- Sprite มอนสเตอร์ --- */}
      <motion.div
        key={sprite} 
        initial={{ scaleX: 1.5, scaleY: 1.5 }} 
        animate={{
          scaleX: 1.5, // หน้าปกติ (ถ้าจะหันซ้ายให้ใช้ -1.5)
          scaleY: isAtk ? [1.5, 1.8, 1.5] : [1.5, 1.58, 1.5], // เอฟเฟกต์หายใจยืดหด
        }}
        transition={{ 
          duration: isAtk ? 0.4 : 0.8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{
          backgroundImage: `url(${sprite})`,
          width: isAtk ? "160%" : "100%",
          height: "100%",
          position: "absolute",
          bottom: 0,
          left: "50%",
          marginLeft: isAtk ? "-80%" : "-50%",
          backgroundSize: "contain",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          transformOrigin: "bottom center",
        }}
      />
    </motion.div>
  );
};