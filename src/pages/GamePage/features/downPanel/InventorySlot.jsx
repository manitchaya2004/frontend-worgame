import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaSkullCrossbones, FaEyeSlash, FaTint } from "react-icons/fa"; // ✅ เพิ่ม FaTint
import { INVENTORY_COUNT } from "../../../../const/index";
import { getLetterDamage } from "../../../../const/letterValues";
import { useGameStore } from "../../../../store/useGameStore";
import { GiBrain } from "react-icons/gi";

/* =========================
   SINGLE SLOT (Container: Dark, Card: Original Colors)
========================= */
const SingleSlot = ({ index }) => {
  const store = useGameStore();

  const inventory = store.playerData.inventory;
  const playerSlots = store.playerData.unlockedSlots;
  const atk = store.playerData.atk;
  const isPlayerTurn = store.gameState === "PLAYERTURN";

  const item = inventory[index] ?? null;
  const isLocked = index >= playerSlots;
  const isDisabled = !isPlayerTurn;

  const displayDamage = item ? getLetterDamage(item.char, atk) : 0;

  // ✅ เช็คสถานะต่างๆ
  const isStunned = item?.status === "stun";
  const isPoisoned = item?.status === "poison";
  const isBlind = item?.status === "blind";
  const isBleed = item?.status === "bleed"; // ✅ เพิ่มสถานะ Bleed
  const duration = item?.statusDuration || 0;

  const onSelect = () => {
    // ✅ Blind และ Bleed ไม่ห้ามกด (กดได้ปกติ)
    if (isDisabled || isStunned || isLocked || !item) return;
    store.selectLetter(item, index);
  };

  return (
    <div style={{ position: "relative", padding: "2px" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: isLocked ? "rgba(10,10,10,0.8)" : "rgba(30,30,30,0.3)",
          // ✅ ปรับสีขอบกล่อง (Container Border)
          border: isStunned
            ? "2px solid #7f8c8d"
            : isPoisoned
            ? "2px solid #2ecc71"
            : isBlind
            ? "2px solid #8e44ad"
            : isBleed
            ? "2px solid #c0392b" // ✅ สีแดงเลือดหมู
            : `1px solid ${isLocked ? "#333" : "#5c4033"}`,
          borderRadius: "6px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: isLocked ? "none" : "inset 0 0 5px rgba(0,0,0,0.5)",
        }}
      >
        <AnimatePresence mode="popLayout">
          {item && !isLocked && (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: isStunned
                  ? "brightness(0.7) grayscale(0.3)"
                  : "none",
              }}
              exit={{ opacity: 0, scale: 0.2 }}
              whileHover={!isDisabled && !isStunned ? { scale: 1.05 } : {}}
              onClick={onSelect}
              style={{
                width: "92%",
                height: "94%",
                // ✅ จัดการสีพื้นหลัง (Priority: Stun > Blind > Poison > Bleed > Normal)
                background: isStunned
                  ? "linear-gradient(145deg,#bdc3c7,#95a5a6)"
                  : isBlind
                  ? "linear-gradient(145deg,#2c003e,#000000)"
                  : isPoisoned
                  ? "linear-gradient(145deg,#d4fcd4,#a2e0a2)"
                  : isBleed
                  ? "linear-gradient(145deg,#e74c3c,#922b21)" // ✅ สีแดงไล่เฉดเลือด
                  : "linear-gradient(145deg,#ffffff,#e8dcc4)",

                // ✅ จัดการสีขอบการ์ด (Card Border)
                border: isStunned
                  ? "2px solid #34495e"
                  : isBlind
                  ? "2px solid #4a148c"
                  : isBleed
                  ? "2px solid #641e16" // ✅ ขอบแดงเข้มเกือบดำ
                  : "2px solid #8b4513",

                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 900,
                fontSize: "25px",
                fontFamily: "'Palatino', serif",

                // ✅ เปลี่ยนสีตัวอักษรให้ตัดกับพื้นหลัง
                color: isBlind
                  ? "#dcdde1"
                  : isPoisoned
                  ? "#1b5e20"
                  : isBleed
                  ? "#fadbd8" // ✅ สีชมพูซีด/ขาวบนพื้นแดง
                  : isStunned
                  ? "#2c3e50"
                  : "#3e2723",

                cursor: isDisabled || isStunned ? "not-allowed" : "pointer",
                position: "relative",
                boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
              }}
            >
              {/* Logic การแสดงตัวอักษร: ถ้า Blind ให้โชว์ ? */}
              {isBlind ? "?" : item.char === "QU" ? "Qu" : item.char}

              {/* Status Duration Bubble */}
              {item.status && (
                <div
                  style={{
                    position: "absolute",
                    top: "-2px",
                    left: "-2px",
                    width: "16px",
                    height: "16px",
                    // ✅ สี Bubble ตามสถานะ
                    background: isBlind
                      ? "#8e44ad"
                      : isPoisoned
                      ? "#2ecc71"
                      : isBleed
                      ? "#c0392b" // ✅ แดงเข้ม
                      : "#7f8c8d",
                    borderRadius: "50%",
                    fontSize: "9px",
                    color: "#fff",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "1px solid #fff",
                  }}
                >
                  {duration}
                </div>
              )}

              {/* Status Icon (มุมขวาบน) */}
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                }}
              >
                {/* 1. Poison Icon */}
                {isPoisoned && !isBlind && !isBleed && (
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ color: "#27ae60", fontSize: "12px" }}
                  >
                    <FaSkullCrossbones />
                  </motion.div>
                )}
                
                {/* 2. Stun Icon */}
                {isStunned && (
                  <div style={{ color: "#34495e", fontSize: "12px" }}>
                    <FaLock />
                  </div>
                )}
                
                {/* 3. Blind Icon */}
                {isBlind && (
                  <div style={{ color: "#bdc3c7", fontSize: "12px" }}>
                    <FaEyeSlash />
                  </div>
                )}

                {/* 4. ✅ Bleed Icon (เต้นตุบๆ) */}
                {isBleed && (
                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }} // อนิเมชั่นหัวใจเต้น
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ color: "#922b21", fontSize: "12px" }}
                  >
                    <FaTint />
                  </motion.div>
                )}
              </div>

              {/* Damage Display (มุมขวาล่าง) */}
              <div
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "4px",
                  fontSize: "10px",
                  fontWeight: 900,
                  opacity: 0.8,
                }}
              >
                {/* ถ้า Blind ให้ซ่อนดาเมจ */}
                {isBlind ? "?" : displayDamage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLocked && (
          <div style={{ opacity: 0.3, color: "#555", fontSize: "12px" }}>
            <FaLock />
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================
   INVENTORY SLOT (Container: Dark Tone)
========================= */
export const InventorySlot = () => {
  const store = useGameStore();
  const isPlayerTurn = store.gameState === "PLAYERTURN";

  return (
    <div
      style={{
        width: "30%",
        height: "95%",
        background: "rgba(0,0,0,0.4)",
        border: "1px solid #4d3a2b",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        filter: isPlayerTurn ? "none" : "grayscale(0.6) brightness(0.7)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          borderBottom: "1px solid #4d3a2b",
          paddingBottom: "8px",
          marginBottom: "10px",
        }}
      >
        <GiBrain style={{ color: "#d4af37", fontSize: "18px" }} />
        <div
          style={{
            color: "#d4af37",
            fontSize: "15px",
            fontWeight: "900",
            letterSpacing: "2px",
            textTransform: "uppercase",
            textShadow: "0 2px 0 #000",
          }}
        >
          BRAIN SLOT
        </div>
        <GiBrain
          style={{ color: "#d4af37", fontSize: "18px", transform: "scaleX(-1)" }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gridTemplateRows: "repeat(4,1fr)",
          gap: "6px",
          padding: "4px",
          background: "rgba(0,0,0,0.2)",
          borderRadius: "8px",
          border: "1px solid #333",
        }}
      >
        {Array.from({ length: INVENTORY_COUNT }).map((_, index) => (
          <SingleSlot key={index} index={index} />
        ))}
      </div>
    </div>
  );
};