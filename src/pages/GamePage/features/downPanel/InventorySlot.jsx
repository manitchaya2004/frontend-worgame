import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaSkullCrossbones, FaEyeSlash, FaTint } from "react-icons/fa";
import { INVENTORY_COUNT } from "../../../../const/index";
import { useGameStore, getLetterDamage } from "../../../../store/useGameStore"; 
import { GiBrain, GiBroadsword, GiShield, GiStarShuriken } from "react-icons/gi";

/* =========================
   SINGLE SLOT 
========================= */
const SingleSlot = ({ index }) => {
  const store = useGameStore();

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

  return (
    <div style={{ position: "relative", padding: "2px" }}>
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
          // ✅ เอา overflow: hidden ออกเพื่อให้ไอคอนบัฟยื่นออกไปได้
          overflow: "visible", 
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

              {/* ✅ Buff Badge (วงกลมสี แปะอยู่นอกขอบสล็อตล่างซ้าย) */}
              {buffBadge && (
                <div style={{
                  position: "absolute",
                  bottom: "-6px", // ยื่นลงข้างล่าง
                  left: "-6px",   // ยื่นออกทางซ้าย
                  width: "18px",
                  height: "18px",
                  backgroundColor: buffBadge.bgColor,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff", // ไอคอนข้างในสีขาว
                  fontSize: "11px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  border: "1.5px solid #fff", // ขอบขาวให้ตัดกับพื้นหลังกระดาษ
                  zIndex: 10, // ให้อยู่บนสุด
                }}>
                  {buffBadge.icon}
                </div>
              )}

              {/* Status Duration Bubble (มุมบนซ้าย) */}
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

              {/* Debuff Icons (มุมบนขวา) */}
              <div style={{ position: "absolute", top: "3px", right: "3px", zIndex: 2 }}>
                {isPoisoned && !isBlind && !isBleed && <FaSkullCrossbones style={{ color: "#27ae60", fontSize: "11px" }} />}
                {isStunned && <FaLock style={{ color: "#34495e", fontSize: "11px" }} />}
                {isBlind && <FaEyeSlash style={{ color: "#bdc3c7", fontSize: "12px" }} />}
                {isBleed && <FaTint style={{ color: "#922b21", fontSize: "11px" }} />}
              </div>

              {/* Damage Info (มุมล่างขวา) */}
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