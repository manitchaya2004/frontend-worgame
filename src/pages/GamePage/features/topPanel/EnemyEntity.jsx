import React, { useMemo, memo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";
import { MpBar } from "./MpBar";
import { DISPLAY_NORMAL, FIXED_Y } from "../../../../const/index";

// ✅ Icons
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
    const [showIntentTooltip, setShowIntentTooltip] = useState(false);
    const [displayUrl, setDisplayUrl] = useState("");
    const cache = useRef({});
    const loadingPath = useRef(""); // 🌟 เพิ่มตัวแปรเช็คสถานะการโหลด

    const isBoss = enemy.isBoss;
    const isAttack = enemy.atkFrame > 0;
    const actionName = isAttack ? "attack" : "idle";
    const frameNum = isAttack ? enemy.atkFrame : (animFrame % 2) + 1;

    const imagePath = useMemo(() => {
      return `/api/img_monster/${enemy.monster_id}-${actionName}-${frameNum}.png`;
    }, [enemy.monster_id, actionName, frameNum]);

    useEffect(() => {
      // 🌟 ถ้ามีใน Cache แล้ว ให้สลับรูปทันที (กันกระพริบ)
      if (cache.current[imagePath]) {
        setDisplayUrl(cache.current[imagePath]);
        return;
      }

      // 🌟 ถ้า Path นี้กำลังโหลดอยู่แล้ว ไม่ต้องสั่ง Fetch ซ้ำ
      if (loadingPath.current === imagePath) return;

      let isMounted = true;
      loadingPath.current = imagePath;

      const fetchMonsterImage = async () => {
        try {
          const response = await fetch(imagePath, {
            headers: { "ngrok-skip-browser-warning": "69420" },
          });
          if (!response.ok) throw new Error("Monster image fetch failed");

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);

          if (isMounted) {
            cache.current[imagePath] = objectUrl;
            // 🌟 สำคัญ: setDisplayUrl หลังจากโหลดเสร็จเท่านั้น เพื่อให้รูปเก่าคาไว้ก่อน
            setDisplayUrl(objectUrl);
            loadingPath.current = "";
          }
        } catch (err) {
          console.error("Failed to load monster image:", err);
          if (isMounted) loadingPath.current = "";
        }
      };

      fetchMonsterImage();
      return () => {
        isMounted = false;
      };
    }, [imagePath]);

    useEffect(() => {
      return () => {
        Object.values(cache.current).forEach((url) => URL.revokeObjectURL(url));
      };
    }, []);

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
                  {/* 🛡/⚔️ ตัวไอคอนวงกลม */}
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

                  {/* 💬 ส่วนที่หายไป: กล่อง Tooltip ข้อความอธิบาย */}
                  <AnimatePresence>
                    {showIntentTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 5, x: "-50%" }}
                        style={{
                          position: "absolute",
                          bottom: "120%", // ให้ลอยอยู่เหนือไอคอน
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

                        {/* ▽ ติ่งแหลมชี้ลง */}
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

        <div
          style={{
            position: "relative",
            width: DISPLAY_NORMAL,
            height: DISPLAY_NORMAL,
          }}
        >
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
              backgroundImage: `url(${displayUrl})`,
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
  },
);
