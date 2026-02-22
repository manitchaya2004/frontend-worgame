import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaSkullCrossbones, FaEyeSlash, FaTint, FaInfoCircle } from "react-icons/fa";
import { INVENTORY_COUNT } from "../../../../const/index";
import { useGameStore, getLetterDamage } from "../../../../store/useGameStore"; 
import { GiBrain, GiBroadsword, GiShield, GiStarShuriken, GiSparkles } from "react-icons/gi";

/* =========================
   SINGLE SLOT 
========================= */
const SingleSlot = ({ index }) => {
  const store = useGameStore();
  const [isHovered, setIsHovered] = useState(false);

  const inventory = store.playerData.inventory;
  const playerSlots = store.playerData.unlockedSlots;
  const isPlayerTurn = store.gameState === "PLAYERTURN";

  const item = inventory[index] ?? null;
  const isLocked = index >= playerSlots;
  const isDisabled = !isPlayerTurn;

  let displayDamage = 0;
  if (item) {
    displayDamage = getLetterDamage(item.char);
  }

  const isStunned = item?.status === "stun";
  const isPoisoned = item?.status === "poison";
  const isBlind = item?.status === "blind";
  const isBleed = item?.status === "bleed";
  const duration = item?.statusDuration || 0;
  const buffType = item?.buff || null;

  // เช็คว่าเป็นสระหรือพยัญชนะ
  const isVowel = item ? ['A', 'E', 'I', 'O', 'U'].includes(item.char.toUpperCase()) : false;
  const letterType = isBlind ? "Unknown" : (isVowel ? "Vowel" : "Consonant");

  // ฟังก์ชันดึงข้อมูลบัฟสำหรับ Badge นอกการ์ด
  const getBuffBadgeData = () => {
    if (isBlind || !buffType) return null;
    switch (buffType) {
      case "STRIKE_x2": return { icon: <GiBroadsword />, bgColor: "#c0392b" }; // แดง
      case "GUARD_x2": return { icon: <GiShield />, bgColor: "#2980b9" };  // ฟ้า
      case "MANA_PLUS": return { icon: <GiStarShuriken />, bgColor: "#8e44ad" }; // ม่วง
      default: return null;
    }
  };

  const buffBadge = getBuffBadgeData();

  const getSlotBackground = () => {
    if (isBlind) return "linear-gradient(145deg,#2c003e,#000000)";
    if (isStunned) return "linear-gradient(145deg,#bdc3c7,#95a5a6)";
    if (isPoisoned) return "linear-gradient(145deg,#d4fcd4,#a2e0a2)";
    if (isBleed) return "linear-gradient(145deg,#e74c3c,#922b21)";
    return "linear-gradient(145deg,#ffffff,#e8dcc4)";
  };

  const onSelect = () => {
    if (isDisabled || isStunned || isLocked || !item) return;
    store.selectLetter(item, index);
  };

  // --- ข้อมูลสำหรับ Tooltip (แบบย่อยง่ายๆ) ---
  const getTooltipBuffInfo = () => {
    switch (buffType) {
      case "STRIKE_x2": return { desc: " Double score when strike", color: "#e74c3c", icon: <GiBroadsword /> };
      case "GUARD_x2": return { desc: " Double score when guard", color: "#3498db", icon: <GiShield /> };
      case "MANA_PLUS": return { desc: " Gain 5 mana", color: "#9b59b6", icon: <GiStarShuriken /> };
      default: return null;
    }
  };

  const getTooltipDebuffInfo = () => {
    if (isStunned) return { desc: ` Stunned for ${duration} turn(s)`, color: "#7f8c8d", icon: <FaLock /> };
    if (isPoisoned) return { desc: ` Takes damage (${duration} turns left)`, color: "#2ecc71", icon: <FaSkullCrossbones /> };
    if (isBlind) return { desc: ` Blinded (${duration} turns left)`, color: "#8e44ad", icon: <FaEyeSlash /> };
    if (isBleed) return { desc: ` Bleeding (${duration} turns left)`, color: "#e74c3c", icon: <FaTint /> };
    return null;
  };

  const tooltipBuff = getTooltipBuffInfo();
  const tooltipDebuff = getTooltipDebuffInfo();
  const hasSpecialEffect = tooltipBuff || tooltipDebuff;

  return (
    <div 
      style={{ 
        position: "relative", 
        padding: "2px",
        width: "100%", 
        height: "100%",
        boxSizing: "border-box" 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: isLocked ? "rgba(10,10,10,0.8)" : "rgba(30,30,30,0.3)",
          border: `1px solid ${isLocked ? "#333" : "#5c4033"}`,
          borderRadius: "6px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "visible", 
        }}
      >
        <AnimatePresence mode="popLayout">
          {item && !isLocked && (
            <motion.div
              key={`${item.id}-${item.char}-${item.buff || 'nobuff'}`}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: isStunned ? "brightness(0.7) grayscale(0.3)" : "none",
              }}
              exit={{ opacity: 0, scale: 0.2 }}
              whileHover={!isDisabled && !isStunned ? { scale: 1.05 } : {}}
              onClick={onSelect}
              style={{
                width: "92%",
                height: "94%",
                background: getSlotBackground(),
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                cursor: (isDisabled || isStunned) ? "not-allowed" : "pointer"
              }}
            >
              {/* ตัวอักษรสีน้ำตาลมาตรฐาน */}
              <span style={{ 
                zIndex: 1, 
                fontWeight: 900,
                fontSize: isBlind ? "32px" : "24px",
                fontFamily: "'Palatino', serif",
                color: isBlind ? "#fff" : (isPoisoned ? "#1b5e20" : isBleed ? "#fadbd8" : isStunned ? "#2c3e50" : "#3e2723"),
                textShadow: isBlind ? "0px 0px 8px rgba(255,255,255,0.4)" : "0.5px 1px 0px rgba(255,255,255,0.5)",
                lineHeight: 1,
              }}>
                {isBlind ? "?" : item.char}
              </span>

              {/* ✅ Buff Badge */}
              {buffBadge && (
                <div style={{
                  position: "absolute",
                  bottom: "-6px", 
                  left: "-6px",   
                  width: "18px",
                  height: "18px",
                  backgroundColor: buffBadge.bgColor,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff", 
                  fontSize: "11px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  border: "1.5px solid #fff", 
                  zIndex: 10, 
                }}>
                  {buffBadge.icon}
                </div>
              )}

              {/* Status Duration Bubble */}
              {item.status && (
                <div style={{
                  position: "absolute", top: "-2px", left: "-2px",
                  width: "14px", height: "14px",
                  background: isBlind ? "#8e44ad" : (isPoisoned ? "#2ecc71" : (isBleed ? "#c0392b" : "#7f8c8d")),
                  borderRadius: "50%", fontSize: "8px", color: "#fff", fontWeight: "bold",
                  display: "flex", justifyContent: "center", alignItems: "center",
                  border: "1px solid #fff", zIndex: 11,
                }}>
                  {duration}
                </div>
              )}

              {/* Debuff Icons */}
              <div style={{ position: "absolute", top: "3px", right: "3px", zIndex: 2 }}>
                {isPoisoned && !isBlind && !isBleed && <FaSkullCrossbones style={{ color: "#27ae60", fontSize: "11px" }} />}
                {isStunned && <FaLock style={{ color: "#34495e", fontSize: "11px" }} />}
                {isBlind && <FaEyeSlash style={{ color: "#bdc3c7", fontSize: "12px" }} />}
                {isBleed && <FaTint style={{ color: "#922b21", fontSize: "11px" }} />}
              </div>

              {/* Damage Info */}
              {!isBlind && (
                <div style={{
                  position: "absolute", bottom: "1px", right: "3px",
                  fontSize: "10px", fontWeight: 800, opacity: 0.6, zIndex: 2,
                  color: "#3e2723"
                }}>
                  {displayDamage}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {isLocked && <div style={{ opacity: 0.3, color: "#555", fontSize: "12px" }}><FaLock /></div>}
      </div>

      {/* =========================
            CUSTOM FANTASY TOOLTIP (Minimalist)
      ========================= */}
      <AnimatePresence>
        {isHovered && item && !isLocked && (
          <motion.div
            // แก้ไขตรงนี้: สั่งให้ x: "-50%" ในการ Animate ด้วย ป้องกัน Framer Motion ลบค่าจาก CSS ทิ้ง
            initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)", // ขยับขึ้นมาจากกรอบนิดนึงกันทับ
              left: "50%",
              // ไม่ต้องใส่ transform: "translateX(-50%)" ตรงนี้แล้ว เพราะ Framer Motion คุมให้ด้านบนแล้ว
              background: "rgba(15, 11, 8, 0.95)", 
              border: "1px solid #d4af37", 
              borderRadius: "6px",
              padding: "8px 10px",
              minWidth: "160px",
              zIndex: 100, 
              pointerEvents: "none", 
              boxShadow: "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              whiteSpace: "nowrap"
            }}
          >
            {/* ตัวลูกศรชี้ลง */}
            <div style={{
              position: "absolute",
              bottom: "-5px",
              left: "50%",
              marginLeft: "-5px", 
              width: "10px",
              height: "10px",
              background: "rgba(15, 11, 8, 0.95)",
              borderRight: "1px solid #d4af37",
              borderBottom: "1px solid #d4af37",
              transform: "rotate(45deg)",
            }} />

            {/* Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              borderBottom: "1px solid rgba(212,175,55,0.3)",
              paddingBottom: "4px"
            }}>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: "bold", fontFamily: "'Palatino', serif" }}>
                {isBlind ? "?" : `${item.char} - ${letterType}`}
              </span>
              <span style={{ color: "#d4af37", fontSize: "12px", fontWeight: "900" }}>
                Score: {isBlind ? "?" : displayDamage}
              </span>
            </div>

            {/* Body: คำอธิบายบัฟ/ดีบัฟสั้นๆ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              
              {tooltipBuff && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ color: tooltipBuff.color, fontSize: "12px" }}>{tooltipBuff.icon}</div>
                  <span style={{ color: "#bdc3c7", fontSize: "11px", fontWeight: "bold" }}>{tooltipBuff.desc}</span>
                </div>
              )}

              {tooltipDebuff && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ color: tooltipDebuff.color, fontSize: "12px" }}>{tooltipDebuff.icon}</div>
                  <span style={{ color: "#bdc3c7", fontSize: "11px", fontWeight: "bold" }}>{tooltipDebuff.desc}</span>
                </div>
              )}

              {!hasSpecialEffect && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ color: "#7f8c8d", fontSize: "12px" }}><FaInfoCircle /></div>
                  <span style={{ color: "#bdc3c7", fontSize: "11px" }}>
                     Standard letter
                  </span>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =========================
   INVENTORY SLOT CONTAINER
========================= */
export const InventorySlot = () => {
  const store = useGameStore();
  const isPlayerTurn = store.gameState === "PLAYERTURN";

  return (
    <div style={{
        width: "30%", height: "95%", background: "rgba(0,0,0,0.4)",
        border: "1px solid #4d3a2b", borderRadius: "10px",
        display: "flex", flexDirection: "column", padding: "10px",
        filter: isPlayerTurn ? "none" : "grayscale(0.6) brightness(0.7)",
        transition: "all 0.3s ease",
    }}>
      <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "8px", borderBottom: "1px solid #4d3a2b",
          paddingBottom: "8px", marginBottom: "10px",
      }}>
        <GiBrain style={{ color: "#d4af37", fontSize: "18px" }} />
        <div style={{
            color: "#d4af37", fontSize: "15px", fontWeight: "900",
            letterSpacing: "2px", textTransform: "uppercase", textShadow: "0 2px 0 #000",
        }}>
          BRAIN SLOT
        </div>
        <GiBrain style={{ color: "#d4af37", fontSize: "18px", transform: "scaleX(-1)" }} />
      </div>

      <div style={{
          flex: 1, display: "grid", gridTemplateColumns: "repeat(5,1fr)",
          gridTemplateRows: "repeat(4,1fr)", gap: "6px", padding: "4px",
          background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid #333",
      }}>
        {Array.from({ length: INVENTORY_COUNT }).map((_, index) => (
          <SingleSlot key={index} index={index} />
        ))}
      </div>
    </div>
  );
};