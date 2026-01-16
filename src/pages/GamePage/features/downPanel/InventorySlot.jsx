import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaSkullCrossbones } from "react-icons/fa";
import { INVENTORY_COUNT } from "../../../../const/index";
import { getLetterDamage } from "../../../../const/letterValues";
import { useGameStore } from "../../../../store/useGameStore";

const getStatBonus = (val) => Math.max(0, val - 10);

/* =========================
   SINGLE SLOT (ดูด store เอง)
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
          background: isLocked ? "#120a07" : "rgba(20,10,5,0.6)",
          border: isStunned
            ? "2px solid #7f8c8d"
            : isPoisoned
            ? "2px solid #2ecc71"
            : "1.5px solid #3d2b1f",
          borderRadius: "6px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
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
                background: isPoisoned
                  ? "linear-gradient(145deg,#d4fcd4,#a2e0a2)"
                  : isStunned
                  ? "linear-gradient(145deg,#bdc3c7,#95a5a6)"
                  : "linear-gradient(145deg,#ffffff,#e8dcc4)",
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
                color: isPoisoned
                  ? "#1b5e20"
                  : isStunned
                  ? "#2c3e50"
                  : "#3e2723",
                cursor:
                  isDisabled || isStunned ? "not-allowed" : "pointer",
                position: "relative",
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
          <div style={{ opacity: 0.3, color: "#eebb55" }}>
            <FaLock />
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================
   INVENTORY SLOT (ไม่รับ props)
========================= */
export const InventorySlot = () => {
  const store = useGameStore();
  const isPlayerTurn = store.gameState === "PLAYERTURN";

  return (
    <div
      style={{
        width: "30%",
        height: "95%",
        background: "linear-gradient(180deg,#2d1e15,#1a0f0a)",
        border: "3px solid #573a29",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        filter: isPlayerTurn
          ? "none"
          : "grayscale(0.4) brightness(0.8)",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          color: "#eebb55",
          fontSize: "14px",
          fontWeight: 900,
          letterSpacing: "4px",
          textAlign: "center",
          paddingBottom: "8px",
          marginBottom: "10px",
          borderBottom: "2px double rgba(238,187,85,0.4)",
        }}
      >
        — BRAIN SLOT —
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gridTemplateRows: "repeat(4,1fr)",
          gap: "5px",
        }}
      >
        {Array.from({ length: INVENTORY_COUNT }).map((_, index) => (
          <SingleSlot key={index} index={index} />
        ))}
      </div>
    </div>
  );
};
