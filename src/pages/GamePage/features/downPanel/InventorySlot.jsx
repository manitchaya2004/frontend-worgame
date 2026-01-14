import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaSkullCrossbones } from "react-icons/fa";
import { INVENTORY_COUNT } from "../../../../const/index";
import { getLetterDamage } from "../../../../const/letterValues";

const getStatBonus = (val) => Math.max(0, val - 10);

const SingleSlot = ({
  item,
  index,
  isLocked,
  onSelect,
  totalModifier,
  isDisabled,
}) => {
  const displayDamage = item ? getLetterDamage(item.char, totalModifier) : 0;

  const isStunned = item?.status === "stun";
  const isPoisoned = item?.status === "poison";
  const duration = item?.statusDuration || 0;

  return (
    <div
      style={{ position: "relative", padding: "2px", boxSizing: "border-box" }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: isLocked ? "#120a07" : "rgba(20, 10, 5, 0.6)",
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
          boxShadow: isPoisoned
            ? "inset 0 0 10px #2ecc71"
            : "inset 0 2px 8px rgba(0,0,0,0.8)",
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
                // ถ้าติด Stun ให้ตัวการ์ดดูมืดลงนิดหน่อยแต่ยังเห็นตัวอักษร
                filter: isStunned ? "brightness(0.7) grayscale(0.3)" : "none",
              }}
              exit={{ opacity: 0, scale: 0.2 }}
              whileHover={!isDisabled && !isStunned ? { scale: 1.05 } : {}}
              onClick={() => !isDisabled && !isStunned && onSelect(item, index)}
              style={{
                width: "92%",
                height: "94%",
                background: isPoisoned
                  ? "linear-gradient(145deg, #d4fcd4 0%, #a2e0a2 100%)"
                  : isStunned
                  ? "linear-gradient(145deg, #bdc3c7 0%, #95a5a6 100%)"
                  : "linear-gradient(145deg, #ffffff 0%, #e8dcc4 100%)",
                border: isStunned ? "2px solid #34495e" : "2px solid #8b4513",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "900",
                fontSize: "25px",
                fontFamily: "'Palatino', serif",
                color: isPoisoned
                  ? "#1b5e20"
                  : isStunned
                  ? "#2c3e50"
                  : "#3e2723",
                cursor: isDisabled || isStunned ? "not-allowed" : "pointer",
                position: "relative",
                pointerEvents: isDisabled || isStunned ? "none" : "auto",
                boxShadow: isPoisoned
                  ? "0 0 8px #2ecc71"
                  : "0 4px 8px rgba(0,0,0,0.3)",
              }}
            >
              {item.char === "QU" ? "Qu" : item.char}

              {/* 1. วงกลมบอกรอบสถานะ (มุมบนซ้าย) */}
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
                    border: "1.5px solid #fff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "9px",
                    color: "#fff",
                    fontWeight: "bold",
                    zIndex: 10,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {duration}
                </div>
              )}

              {/* 2. Icon สถานะ (มุมบนขวา) - แยกตาม Poison หรือ Stun */}
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  zIndex: 5,
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

              {/* 3. ตัวเลขดาเมจมุมขวาล่าง */}
              <div
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "4px",
                  fontSize: "10px",
                  fontWeight: "900",
                  color: isPoisoned ? "#2e7d32" : "#5d4037",
                  zIndex: 2,
                }}
              >
                {displayDamage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* กรณี Slot โดนล็อคจากเลเวล (ไม่ได้เกี่ยวกับ Stun) */}
        {isLocked && (
          <div style={{ fontSize: "14px", opacity: 0.3, color: "#eebb55" }}>
            <FaLock />
          </div>
        )}
      </div>
    </div>
  );
};

export const InventorySlot = ({
  inventory,
  onSelectLetter,
  playerSlots = 10,
  playerStats = { STR: 10 },
  gameState,
}) => {
  const isPlayerTurn = gameState === "PLAYERTURN";
  const totalModifier = getStatBonus(playerStats.STR || 10);

  return (
    <div
      id="inventory"
      style={{
        boxSizing: "border-box",
        width: "30%",
        height: "95%",
        background: "linear-gradient(180deg, #2d1e15 0%, #1a0f0a 100%)",

        border: "3px solid #573a29",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        boxShadow: "0 15px 35px rgba(0,0,0,0.8)",
        filter: isPlayerTurn ? "none" : "grayscale(0.4) brightness(0.8)",
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
          borderBottom: "2px double rgba(238, 187, 85, 0.4)",
          flexShrink: 0,
          textShadow: "2px 2px 4px #000",
        }}
      >
        — INVENTORY —
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gridTemplateRows: "repeat(4, 1fr)",
          gap: "5px",
          width: "100%",
          height: "100%",
          minHeight: 0,
        }}
      >
        {Array.from({ length: INVENTORY_COUNT }).map((_, index) => {
          const item = inventory[index] ?? null;
          const isLocked = index >= playerSlots;

          return (
            <SingleSlot
              key={`slot-${index}`}
              item={item}
              index={index}
              isLocked={isLocked}
              isDisabled={!isPlayerTurn}
              onSelect={onSelectLetter}
              totalModifier={totalModifier}
            />
          );
        })}
      </div>
    </div>
  );
};
