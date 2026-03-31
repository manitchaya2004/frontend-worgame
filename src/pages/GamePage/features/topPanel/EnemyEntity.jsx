import React, { useMemo, memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";
import { MpBar } from "./MpBar";
import { DISPLAY_NORMAL, FIXED_Y } from "../../../../const/index";

import { FaLock, FaSkullCrossbones, FaEyeSlash, FaTint } from "react-icons/fa";
import { GiBroadsword, GiShield } from "react-icons/gi";

export const EnemyEntity = memo(
  ({
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
    // 1. ตั้งค่า Base URL สำหรับ Monster ให้ตรงกับใน useGameStore
    const STORAGE_BASE_URL =
      "https://qsopjsioqmqtyaocqmmx.supabase.co/storage/v1/object/public/asset/img_monster/";

    const [showIntentTooltip, setShowIntentTooltip] = useState(false);

    const isBoss = enemy.isBoss;
    const isAttack = enemy.atkFrame > 0;
    const actionName = isAttack ? "attack" : "idle";
    const frameNum = isAttack ? enemy.atkFrame : (animFrame % 2) + 1;

    // 2. คำนวณ URL รูปภาพ (ใช้ null แทน "" เพื่อป้องกัน Warning)
    const imagePath = useMemo(() => {
      if (!enemy?.monster_id) return null;
      return `${STORAGE_BASE_URL}${enemy.monster_id}-${actionName}-${frameNum}.png`;
    }, [enemy.monster_id, actionName, frameNum]);

    // --- LOGIC: Status Effects ---
    const statuses = enemy?.statuses || [];
    const getEffectData = (type) => {
      switch (type) {
        case "stun":
          return { icon: <FaLock />, bgColor: "#34495e" };
        case "poison":
          return { icon: <FaSkullCrossbones />, bgColor: "#2ecc71" };
        case "blind":
          return { icon: <FaEyeSlash />, bgColor: "#8e44ad" };
        case "bleed":
          return { icon: <FaTint />, bgColor: "#c0392b" };
        default:
          return null;
      }
    };

    const movementTransition =
      gameState === "QUIZ_MODE"
        ? { duration: 5, ease: "linear" }
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
        }}
        exit={{
          x: 500,
          y: -1000,
          rotate: 1800,
          scale: 1,
          opacity: 1,
          transition: { duration: 0.2 },
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          cursor: "pointer",
          ...style,
        }}
      >
        {enemy.hp > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "55px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              pointerEvents: "none",
            }}
          >
            {/* Target Circle */}
            {(isTargeted || selectionCount > 0) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
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

            {/* Shout Bubble */}
            <div
              style={{
                marginBottom: isBoss ? "200px" : "10px",
                height: "20px",
                zIndex: 100000,
              }}
            >
              <ShoutBubble text={enemy.shoutText} />
            </div>

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
              }}
            >
              {/* Intent Tooltip (Action Icon) */}
              <AnimatePresence>
                {enemy.hp > 0 && gameState === "PLAYERTURN" && (
                  <motion.div
                    onMouseEnter={() => setShowIntentTooltip(true)}
                    onMouseLeave={() => setShowIntentTooltip(false)}
                    initial={{ opacity: 0, scale: 0.5, x: "-50%" }}
                    animate={{ opacity: 1, scale: 1, y: [0, -4, 0], x: "-50%" }}
                    exit={{ opacity: 0, scale: 0.5, x: "-50%" }}
                    transition={{
                      y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    }}
                    style={{
                      position: "absolute",
                      top: "-45px",
                      left: "50%",
                      zIndex: 110,
                      pointerEvents: "auto",
                      cursor: "help",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        background: "rgba(20, 15, 10, 0.95)",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: `2px solid ${enemy.nextAction === "guard" ? "#3498db" : "#e74c3c"}`,
                        boxShadow: `0 0 10px ${enemy.nextAction === "guard" ? "rgba(52, 152, 219, 0.4)" : "rgba(231, 76, 60, 0.4)"}`,
                      }}
                    >
                      {enemy.nextAction === "guard" ? (
                        <GiShield size={18} color="#3498db" />
                      ) : (
                        <GiBroadsword size={18} color="#e74c3c" />
                      )}
                    </div>

                    <AnimatePresence>
                      {showIntentTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, x: "-50%" }}
                          animate={{ opacity: 1, y: 0, x: "-50%" }}
                          exit={{ opacity: 0, y: 5, x: "-50%" }}
                          style={{
                            position: "absolute",
                            bottom: "120%",
                            left: "50%",
                            padding: "4px 10px",
                            background: "rgba(0, 0, 0, 0.95)",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: "bold",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                            border: `1px solid ${enemy.nextAction === "guard" ? "#3498db" : "#e74c3c"}`,
                            zIndex: 1001,
                            boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                            pointerEvents: "none",
                          }}
                        >
                          {enemy.nextAction === "guard"
                            ? "Planning to GUARD"
                            : "Preparing to STRIKE"}
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "0",
                              height: "0",
                              borderLeft: "5px solid transparent",
                              borderRight: "5px solid transparent",
                              borderTop: `5px solid ${enemy.nextAction === "guard" ? "#3498db" : "#e74c3c"}`,
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isBoss && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: "-28px",
                      display: "flex",
                      gap: "4px",
                      zIndex: 20,
                    }}
                  >
                    <AnimatePresence>
                      {statuses.map((effect, idx) => {
                        const data = getEffectData(effect.type);
                        if (!data) return null;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              width: "18px",
                              height: "18px",
                              background: data.bgColor,
                              borderRadius: "50%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              border: "1px solid #fff",
                              fontSize: "10px",
                              color: "#fff",
                              position: "relative",
                            }}
                          >
                            {data.icon}
                            {effect.duration > 0 && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "-5px",
                                  right: "-5px",
                                  background: "#000",
                                  fontSize: "8px",
                                  padding: "0 3px",
                                  borderRadius: "3px",
                                  border: "1px solid #fff",
                                }}
                              >
                                {effect.duration}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                  <HpBar hp={enemy.hp} max={enemy.max_hp} color="#ff4d4d" />
                  <MpBar
                    mp={enemy.mana}
                    max={enemy.quiz_move_cost}
                    color="#3b82f6"
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "-18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      zIndex: 20,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: enemy.shield > 0 ? "#ff9800" : "#888",
                      }}
                    >
                      🛡
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: "#fff",
                        textShadow: "1px 1px 0 #000",
                      }}
                    >
                      {enemy.shield || 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 3. แสดงรูปภาพโดยใช้ URL ตรงๆ เพื่อดึงจาก Cache (ลบ useEffect เดิมออก) */}
        <motion.div
          animate={
            enemy.isHit
              ? {
                  filter: [
                    "brightness(1)",
                    "brightness(2.5) saturate(3) hue-rotate(320deg) drop-shadow(0 0 15px red)",
                    "brightness(1)",
                  ],
                  scaleY: [1, 0.85, 1.05, 1],
                  scaleX: [1, 1.05, 0.95, 1],
                }
              : { filter: "brightness(1)", scaleY: 1, scaleX: 1 }
          }
          transition={{ duration: 0.2 }}
          style={{
            position: "relative",
            width: DISPLAY_NORMAL,
            height: DISPLAY_NORMAL,
            transformOrigin: "bottom center",
          }}
        >
          {imagePath && (
            <motion.div
              key={imagePath}
              style={{
                scale: isBoss ? 4.0 : 2.0,
                width: DISPLAY_NORMAL,
                height: DISPLAY_NORMAL,
                position: "absolute",
                bottom: isBoss ? -10 : 0,
                left: "50%",
                x: "-50%",
                backgroundImage: `url(${imagePath})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "bottom center",
                imageRendering: "pixelated",
                transformOrigin: "bottom center",
                zIndex: 10,
              }}
            />
          )}
        </motion.div>
      </motion.div>
    );
  },
);
