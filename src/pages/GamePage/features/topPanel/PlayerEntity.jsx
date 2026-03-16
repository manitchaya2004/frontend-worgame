import React, { useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DISPLAY_NORMAL, FIXED_Y, PLAYER_X_POS } from "../../../../const/index";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";
import { MpBar } from "./MpBar";

// ✅ Icons
import { FaLock, FaSkullCrossbones, FaEyeSlash, FaTint } from "react-icons/fa";
import {
  GiBroadsword,
  GiShield,
  GiStarShuriken,
  GiTrident,
} from "react-icons/gi";

export const PlayerEntity = memo(({ store }) => {
  const {
    gameState,
    playerX,
    playerData,
    playerVisual,
    animFrame,
    playerShoutText,
  } = store;

  // 1. ตั้งค่า Base URL ให้ตรงกับที่ทำ Preload ไว้
  const STORAGE_BASE_URL =
    "https://qsopjsioqmqtyaocqmmx.supabase.co/storage/v1/object/public/asset/img_hero/";

  // 2. คำนวณ Path รูปภาพ (เหมือนเดิม แต่ตรวจสอบค่า null เพื่อกัน Warning)
  const imagePath = useMemo(() => {
    if (!playerData?.img_path) return null;

    let currentAction = "idle";
    let targetFrame = 1;

    if (gameState === "ADVANTURE") {
      currentAction = "walk";
      targetFrame = (animFrame % 2) + 1;
    } else {
      const visualState = playerVisual || "idle";
      const split = visualState.split("-");
      currentAction = split[0];

      if (currentAction === "idle") {
        targetFrame = (animFrame % 2) + 1;
      } else {
        targetFrame = split[1] ? parseInt(split[1]) : 1;
      }
    }

    if (currentAction === "guard") targetFrame = 1;

    return `${STORAGE_BASE_URL}${playerData.img_path}-${currentAction}-${targetFrame}.png`;
  }, [gameState, animFrame, playerVisual, playerData?.img_path]);

  // --- LOGIC: Status & Buffs ---
  const statuses = playerData?.statuses || [];
  const buffs = playerData?.buffs || [];
  if (statuses.length === 0 && playerData?.status) {
    statuses.push({
      type: playerData.status,
      duration: playerData.statusDuration || 0,
    });
  }
  if (buffs.length === 0 && playerData?.buff) {
    buffs.push({
      type: playerData.buff,
      duration: playerData.buffDuration || 0,
    });
  }
  const allEffects = [...statuses, ...buffs];

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
      case "double-dmg":
        return { icon: <GiBroadsword />, bgColor: "#c0392b" };
      case "double-guard":
      case "double-shield":
        return { icon: <GiShield />, bgColor: "#2980b9" };
      case "mana-plus":
        return { icon: <GiStarShuriken />, bgColor: "#8e44ad" };
      case "shield-plus":
        return { icon: <GiTrident />, bgColor: "#e67e22" };
      default:
        return null;
    }
  };

  return (
    <motion.div
      animate={{ left: `${playerX ?? PLAYER_X_POS}%` }}
      transition={
        gameState === "ADVANTURE"
          ? { duration: 2.0, ease: "linear" }
          : { type: "spring", stiffness: 300, damping: 30 }
      }
      style={{
        position: "absolute",
        top: FIXED_Y,
        transform: "translateY(-100%)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <motion.div
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            zIndex: 20,
            marginBottom: "10px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoutBubble text={playerShoutText} />
        </div>

        <div
          style={{
            position: "relative",
            width: "100px",
            marginBottom: "35px",
            zIndex: 15,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-32px",
              display: "flex",
              gap: "6px",
              justifyContent: "center",
              width: "100%",
              zIndex: 20,
            }}
          >
            <AnimatePresence>
              {allEffects.map((effect, idx) => {
                const data = getEffectData(effect.type);
                if (!data) return null;
                return (
                  <motion.div
                    key={`${effect.type}-${idx}`}
                    initial={{ scale: 0, opacity: 0, y: 5 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 5 }}
                    style={{
                      width: "20px",
                      height: "20px",
                      background: data.bgColor,
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      border: "1.5px solid #fff",
                      fontSize: "11px",
                      color: "#fff",
                      position: "relative",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.6)",
                    }}
                  >
                    {data.icon}
                    {effect.duration > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-6px",
                          right: "-6px",
                          background: "#000",
                          fontSize: "9px",
                          fontWeight: "900",
                          padding: "1px 4px",
                          borderRadius: "4px",
                          border: "1px solid #fff",
                          lineHeight: 1,
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
          <HpBar hp={playerData.hp} max={playerData.max_hp} color="#4dff8b" />
          <MpBar
            mp={playerData.mana}
            max={playerData.max_mana}
            color="#3b82f6"
          />
          <div
            style={{
              position: "absolute",
              right: "10px",
              top: "-20px",
              color: playerData.shield > 0 ? "#00bcd4" : "#888",
              fontWeight: "bold",
              fontSize: "12px",
              display: "flex",
              gap: "2px",
            }}
          >
            🛡{" "}
            <span style={{ color: "#fff", textShadow: "1px 1px 0 #000" }}>
              {playerData.shield}
            </span>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            width: DISPLAY_NORMAL,
            height: DISPLAY_NORMAL,
          }}
        >
          {/* 3. ใช้ imagePath ตรงๆ และเช็คค่า null เพื่อกัน Error */}
          {imagePath && (
            <motion.div
              key={imagePath}
              style={{
                scale: 2.0,
                width: DISPLAY_NORMAL,
                height: DISPLAY_NORMAL,
                position: "absolute",
                bottom: 0,
                left: "50%",
                x: "-50%",
                backgroundImage: `url(${imagePath})`,
                backgroundSize: "auto 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center bottom 0px",
                imageRendering: "pixelated",
                transformOrigin: "bottom center",
              }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});
