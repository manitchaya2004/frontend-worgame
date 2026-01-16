import React from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";
import { DISPLAY_NORMAL, FIXED_Y, ipAddress } from "../../../../const/index";
import { usePreloadFrames } from "../../../HomePage/hook/usePreloadFrams";
export const EnemyEntity = ({
  enemy,
  index,
  animFrame, // รับค่ามา (จะเป็น 0, 1 หรือ 1, 2 ก็ได้ เดี๋ยวสูตรข้างล่างจัดการให้)
  isTargeted,
  gameState,
  onSelect,
  style,
  onHover,
  selectionCount = 0,
}) => {
  // -------------------------------------------------------------
  // ✅ 1. Logic คำนวณชื่อรูปภาพ (สูตรกันเหนียว)
  // -------------------------------------------------------------
  const isBoss = enemy.isBoss;
  const isAttack = enemy.atkFrame > 0;
  const actionName = isAttack ? "attack" : "idle";

  // ถ้าโจมตี ใช้เฟรมโจมตี (1, 2)
  // ถ้ายืนเฉยๆ ใช้สูตร (animFrame % 2) + 1 เพื่อแปลงเป็น 1 หรือ 2 เสมอ
  const monsterFrames = usePreloadFrames("img_monster", enemy.monster_id, 2, actionName);

  // 2. คำนวณเลขเฟรม
  const frameNum = isAttack ? enemy.atkFrame : (animFrame % 2) + 1;

  // 3. ดึงจาก Cache
  const currentSpriteUrl = monsterFrames[frameNum - 1]
    ? monsterFrames[frameNum - 1].src
    : `${ipAddress}/img_monster/${enemy.monster_id}-${actionName}-${frameNum}.png`;
  // -------------------------------------------------------------

  const QUIZ_DURATION = 5;

  const movementTransition =
    gameState === "QUIZ_MODE"
      ? { duration: QUIZ_DURATION, ease: "linear" } // 🐢 ถ้าเป็น Quiz ให้เดินช้าๆ คงที่
      : { type: "spring", stiffness: 300, damping: 25 }; // 🐇 ถ้าโหมดอื่น (เช่น เดินกลับ/พุ่งตี) ให้เร็วและเด้ง

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
        left: movementTransition, // ✅ ถูกต้อง
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
      {enemy.hp > 0 && !isBoss && (
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

          <div
            style={{
              position: "relative",
              width: isBoss ? "1000px" : "100px",
              height: isBoss ? "20px" : "16px",
              marginBottom: isBoss ? "-130px" : "35px",
              marginRight:  isBoss ? "780px" : "0px",
              zIndex: 15,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <HpBar hp={enemy.hp} max={enemy.max_hp} color="#ff4d4d" />
            <div
              style={{
                position: "absolute",
                right: isBoss ? "150px" :"10px",
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
              <span
                style={{
                  fontSize: "12px",
                  color: enemy.shield > 0 ? "#ff9800" : "#888",
                  fontWeight: "bold",
                  lineHeight: 1,
                }}
              >
                🛡
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#fff",
                  textShadow: "1px 1px 0 #000",
                  lineHeight: 1,
                }}
              >
                {enemy.shield || 0}
              </span>
            </div>
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
};
