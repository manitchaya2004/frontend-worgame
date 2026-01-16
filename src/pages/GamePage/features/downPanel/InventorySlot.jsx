import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaSkullCrossbones } from "react-icons/fa";
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
  const atk = store.playerData.atk ;
  const isPlayerTurn = store.gameState === "PLAYERTURN";

  const item = inventory[index] ?? null;
  const isLocked = index >= playerSlots;
  const isDisabled = !isPlayerTurn;

  const displayDamage = item
    ? getLetterDamage(item.char, atk)
    : 0;

  const isStunned = item?.status === "stun";
  const isPoisoned = item?.status === "poison";
  const duration = item?.statusDuration || 0;

  const onSelect = () => {
    if (isDisabled || isStunned || isLocked || !item) return;
    store.selectLetter(item, index);
  };

  return (
    <div style={{ position: "relative", padding: "2px" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          // พื้นหลังช่องว่างๆ ยังคงเป็น Dark Tone เพื่อให้กลืนกับกรอบใหญ่
          background: isLocked ? "rgba(10,10,10,0.8)" : "rgba(30,30,30,0.3)",
          border: isStunned
            ? "2px solid #7f8c8d"
            : isPoisoned
            ? "2px solid #2ecc71"
            : `1px solid ${isLocked ? "#333" : "#5c4033"}`,
          borderRadius: "6px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: isLocked ? "none" : "inset 0 0 5px rgba(0,0,0,0.5)"
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
                // ✅ กลับมาใช้สีเดิม (Original Colors)
                background: isPoisoned
                  ? "linear-gradient(145deg,#d4fcd4,#a2e0a2)"
                  : isStunned
                  ? "linear-gradient(145deg,#bdc3c7,#95a5a6)"
                  : "linear-gradient(145deg,#ffffff,#e8dcc4)", // สีครีม/ขาวเดิม
                
                border: isStunned
                  ? "2px solid #34495e"
                  : "2px solid #8b4513",
                
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 900,
                fontSize: "25px",
                fontFamily: "'Palatino', serif",
                
                // ✅ กลับมาใช้สีตัวอักษรเดิม
                color: isPoisoned
                  ? "#1b5e20"
                  : isStunned
                  ? "#2c3e50"
                  : "#3e2723", // สีน้ำตาลเข้มเดิม
                
                cursor: isDisabled || isStunned ? "not-allowed" : "pointer",
                position: "relative",
                boxShadow: "0 2px 4px rgba(0,0,0,0.4)" // เพิ่มเงานิดหน่อยให้ลอยขึ้นจากพื้นหลังดำ
              }}
            >
              {item.char === "QU" ? "Qu" : item.char}

              {/* status duration */}
              {item.status && (
                <div
                  style={{
                    position: "absolute",
                    top: "-2px",
                    left: "-2px",
                    width: "16px",
                    height: "16px",
                    background: isPoisoned ? "#2ecc71" : "#7f8c8d",
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

              {/* status icon */}
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                }}
              >
                {isPoisoned && (
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ color: "#27ae60", fontSize: "12px" }}
                  >
                    <FaSkullCrossbones />
                  </motion.div>
                )}
                {isStunned && (
                  <div style={{ color: "#34495e", fontSize: "12px" }}>
                    <FaLock />
                  </div>
                )}
              </div>

              {/* damage */}
              <div
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "4px",
                  fontSize: "10px",
                  fontWeight: 900,
                }}
              >
                {displayDamage}
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
        // ✅ ใช้ Black Tone Theme: พื้นหลังดำโปร่ง
        background: "rgba(0,0,0,0.4)",
        border: "1px solid #4d3a2b",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        filter: isPlayerTurn
          ? "none"
          : "grayscale(0.6) brightness(0.7)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header Style ใหม่ (เหมือน Command/Status) */}
      <div
        style={{
            display: "flex", 
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            borderBottom: "1px solid #4d3a2b",
            paddingBottom: "8px",
            marginBottom: "10px"
        }}
      >
        <GiBrain style={{ color: "#d4af37", fontSize: "18px" }} />
        <div
          style={{
            color: "#d4af37", // สีทอง
            fontSize: "15px",
            fontWeight: "900",
            letterSpacing: "2px",
            textTransform: "uppercase",
            textShadow: "0 2px 0 #000"
          }}
        >
          BRAIN SLOT
        </div>
        <GiBrain style={{ color: "#d4af37", fontSize: "18px", transform: "scaleX(-1)" }} />
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gridTemplateRows: "repeat(4,1fr)",
          gap: "6px",
          padding: "4px",
          background: "rgba(0,0,0,0.2)", // พื้นหลังรองจางๆ
          borderRadius: "8px",
          border: "1px solid #333"
        }}
      >
        {Array.from({ length: INVENTORY_COUNT }).map((_, index) => (
          <SingleSlot key={index} index={index} />
        ))}
      </div>
    </div>
  );
};