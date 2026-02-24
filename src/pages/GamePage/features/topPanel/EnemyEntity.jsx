import React, { useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";
import { MpBar } from "./MpBar";
import { DISPLAY_NORMAL, FIXED_Y } from "../../../../const/index";
import { usePreloadFrames } from "../../../HomePage/hook/usePreloadFrams";

// ✅ นำเข้าไอคอนสถานะและบัฟแบบเดียวกับผู้เล่น
import { FaLock, FaSkullCrossbones, FaEyeSlash, FaTint } from "react-icons/fa";

export const EnemyEntity = memo(({
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
  // -------------------------------------------------------------
  // ✅ 1. Logic คำนวณชื่อรูปภาพ (ใช้ useMemo ป้องกันการวาร์ป)
  // -------------------------------------------------------------
  const isBoss = enemy.isBoss;
  const isAttack = enemy.atkFrame > 0;
  const actionName = isAttack ? "attack" : "idle";
  const frameNum = isAttack ? enemy.atkFrame : (animFrame % 2) + 1;

  // โหลดเฟรมจาก Hook (ยังคงไว้ตามโครงสร้างเดิม)
  const monsterFrames = usePreloadFrames("img_monster", enemy.monster_id, 2, actionName);

  const currentSpriteUrl = useMemo(() => {
    if (monsterFrames[frameNum - 1]?.src) {
      return monsterFrames[frameNum - 1].src;
    }
    return `/api/img_monster/${enemy.monster_id}-${actionName}-${frameNum}.png`;
  }, [enemy.monster_id, actionName, frameNum, monsterFrames]);

  // -------------------------------------------------------------
  // 🔮 LOGIC: จัดการไอคอนสถานะของศัตรู
  // -------------------------------------------------------------
  const statuses = enemy?.statuses || [];

  const getEffectData = (type) => {
    switch (type) {
      case "stun": return { icon: <FaLock />, bgColor: "#34495e" };
      case "poison": return { icon: <FaSkullCrossbones />, bgColor: "#2ecc71" };
      case "blind": return { icon: <FaEyeSlash />, bgColor: "#8e44ad" };
      case "bleed": return { icon: <FaTint />, bgColor: "#c0392b" };
      default: return null;
    }
  };

  const QUIZ_DURATION = 5;

  const movementTransition =
    gameState === "QUIZ_MODE"
      ? { duration: QUIZ_DURATION, ease: "linear" }
      : { type: "spring", stiffness: 300, damping: 25 };

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
      transition={{
        default: { type: "spring", stiffness: 300, damping: 15 },
        left: movementTransition,
        opacity: { duration: 0.3 },
      }}
      exit={{
        x: 500,
        y: -1000,
        rotate: 1800,
        scale: 1,
        opacity: 1,
        transition: { duration: 0.2, ease: "easeIn" },
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
        zIndex: isBoss
          ? isAttack
            ? 2000
            : 50 - index
          : isAttack
          ? 2000
          : 100 - index,
        transformOrigin: "center center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "pointer",
        ...style,
      }}
    >
      {/* --- HUD --- */}
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
          {/* เป้าหมายการโจมตี */}
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

          {/* คำพูดมอนสเตอร์ */}
          <div
            style={{
              marginBottom: isBoss ? "200px" : "10px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100000,
            }}
          >
            <ShoutBubble text={enemy.shoutText} />
          </div>

          {/* ZONE: HP & MP BARS บนหัวมอนสเตอร์ */}
          <div
            style={{
              position: "relative",
              width: isBoss ? "1000px" : "100px",
              marginBottom: isBoss ? "-130px" : "35px",
              marginRight: isBoss ? "780px" : "0px",
              zIndex: 15,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!isBoss && (
              <>
                {/* ✅ จุดแสดงไอคอนสถานะของศัตรู (ลอยอยู่เหนือ HpBar เหมือนผู้เล่น) */}
                <div style={{ position: "absolute", top: "-28px", display: "flex", gap: "6px", justifyContent: "center", width: "100%", zIndex: 20 }}>
                  <AnimatePresence>
                    {statuses.map((effect, idx) => {
                      const data = getEffectData(effect.type);
                      if (!data) return null;
                      return (
                        <motion.div
                          key={`${effect.type}-${idx}`}
                          initial={{ scale: 0, opacity: 0, y: 5 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0, opacity: 0, y: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          style={{
                            width: "20px", height: "20px", background: data.bgColor,
                            borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center",
                            border: "1.5px solid #fff", fontSize: "11px", color: "#fff", position: "relative",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.6)"
                          }}
                        >
                          {data.icon}
                          {/* ป้ายบอกจำนวนเทิร์นที่เหลือ */}
                          {effect.duration > 0 && (
                            <div style={{
                              position: "absolute", bottom: "-6px", right: "-6px", background: "#000",
                              fontSize: "9px", fontWeight: "900", padding: "1px 4px", borderRadius: "4px",
                              border: "1px solid #fff", lineHeight: 1
                            }}>
                              {effect.duration}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <HpBar hp={enemy.hp} max={enemy.max_hp} color="#ff4d4d" />
                <MpBar mp={enemy.mana} max={enemy.quiz_move_cost} color="#3b82f6" />

                {/* ตัวเลข Shield */}
                <div
                  style={{
                    position: "absolute",
                    right: isBoss ? "150px" : "10px",
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
                  <span style={{ fontSize: "12px", color: enemy.shield > 0 ? "#ff9800" : "#888", fontWeight: "bold", lineHeight: 1 }}>
                    🛡
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", textShadow: "1px 1px 0 #000", lineHeight: 1 }}>
                    {enemy.shield || 0}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- CHARACTER SPRITE --- */}
      <div
        style={{
          position: "relative",
          width: DISPLAY_NORMAL,
          height: DISPLAY_NORMAL,
        }}
      >
        <motion.div
          key={currentSpriteUrl} // ✅ ใช้ key เพื่อให้ React สลับรูปอย่างถูกต้องเมื่อ URL เปลี่ยน
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.05 }}
          style={{
            scale: isBoss ? 4.0 : 2.0,
            width: DISPLAY_NORMAL,
            height: DISPLAY_NORMAL,
            position: "absolute",
            bottom: isBoss ? -10 : 0,
            left: "50%",
            x: "-50%",
            backgroundImage: `url(${currentSpriteUrl})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
            imageRendering: "pixelated",
            transformOrigin: "bottom center",
          }}
        />
      </div>
    </motion.div>
  );
});