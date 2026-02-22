import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GiCheckedShield,
  GiHealthPotion,
  GiMagicPotion,
  GiStandingPotion,
  GiVisoredHelm
} from "react-icons/gi";
import { useGameStore } from "../../../../store/useGameStore";

/* ===== Reusable Pixel Bar (เพิ่มระบบ Tooltip อธิบายสถานะ) ===== */
const PixelBar = ({ current, max, color, height = "18px", labelColor = "#fff", labelText = "", tooltipTitle = "", tooltipDesc = "" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  
  return (
    <div 
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ 
        display: "flex", 
        flexDirection: "row", 
        alignItems: "center", 
        width: "100%",
        gap: "4px",
        cursor: "default"
      }}>
        {/* Label: บีบ minWidth ให้เหลือพื้นที่ว่างน้อยที่สุด */}
        <span 
          style={{ 
            fontSize: "14px", 
            fontWeight: "900", 
            color: color, 
            textShadow: "1px 1px 0 #000",
            fontFamily: "monospace",
            minWidth: "22px", // บีบให้ชิดหลอด
            textAlign: "left",
            lineHeight: 1
          }}
        >
          {labelText}
        </span>
        
        {/* ตัวหลอด: ปรับธีมขอบและเงาตามกล่อง BRAIN SLOT */}
        <div style={{ 
          position: "relative", 
          flex: 1, 
          height: height, 
          background: "#1a1a1a", 
          border: "1px solid #3d2e24", // ขอบสีน้ำตาลทอง
          borderRadius: "4px", 
          overflow: "hidden", 
          boxShadow: "inset 0 0 5px rgba(0,0,0,0.8)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <div style={{ 
            position: "absolute", 
            left: 0, 
            top: 0, 
            height: "100%", 
            width: `${percent}%`, 
            background: color, 
            transition: "width 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)", 
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" 
          }} />
          
          <span style={{ 
            position: "relative", 
            fontSize: "10px", 
            fontWeight: "900", 
            color: labelColor, 
            textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000", 
            zIndex: 5, 
            lineHeight: 1, 
            fontFamily: "monospace, sans-serif" 
          }}>
            {Number.isInteger(current) ? current : parseFloat(current.toFixed(1))} / {max}
          </span>
        </div>
      </div>

      {/* Tooltip อธิบายหลอดเลือด/มานา */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)", // ลอยอยู่ด้านบน
              left: "50%",
              background: "rgba(15, 11, 8, 0.95)", 
              border: "1px solid #d4af37", 
              borderRadius: "6px",
              padding: "8px 10px",
              minWidth: "140px",
              zIndex: 100, 
              pointerEvents: "none", 
              boxShadow: "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              whiteSpace: "nowrap"
            }}
          >
            {/* ลูกศรชี้ลงด้านล่าง */}
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

            {/* หัวข้อ */}
            <span style={{ color: color, fontSize: "12px", fontWeight: "bold", fontFamily: "'Palatino', serif" }}>
              {tooltipTitle}
            </span>
            {/* คำอธิบาย */}
            <span style={{ color: "#bdc3c7", fontSize: "11px" }}>
              {tooltipDesc}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ===== Potion Slot (เพิ่มระบบ Tooltip อธิบายผลลัพธ์) ===== */
const PotionSlot = ({ icon, count, color, label, description, onClick, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // เช็คทั้งจำนวนที่เหลือและสถานะ disabled ที่ส่งเข้ามา
  const isDisabled = count <= 0 || disabled;
  
  return (
    <div 
      style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        onClick={!isDisabled ? onClick : undefined}
        whileHover={!isDisabled ? { scale: 1.02, filter: "brightness(1.15)" } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        style={{
          position: "relative",
          background: isDisabled 
              ? "rgba(20,20,20,0.6)" 
              : "linear-gradient(180deg, rgba(30,30,30,0.5) 0%, rgba(10,10,10,0.9) 100%)",
          border: `1px solid #3d2e24`, // ขอบน้ำตาลทอง
          borderRadius: "8px",
          height: "130px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: isDisabled ? "default" : "pointer",
          boxShadow: isDisabled ? "none" : "inset 0 0 10px rgba(0,0,0,0.8)",
          transition: "border 0.2s",
          opacity: isDisabled ? 0.6 : 1
        }}
      >
        <div style={{ position: "absolute", top: "10px", fontSize: "10px", color: "#8b7355", fontWeight: "bold", letterSpacing: "1px" }}>{label}</div>
        <div style={{ fontSize: "60px", color: !isDisabled ? color : "#444", filter: !isDisabled ? "drop-shadow(0px 0px 8px rgba(255,255,255,0.2))" : "grayscale(100%) opacity(0.5)", transform: "translateY(5px)" }}>{icon}</div>
        <div style={{ position: "absolute", bottom: "8px", right: "8px", background: count > 0 ? "#c0392b" : "#555", color: "#fff", fontSize: "14px", fontWeight: "900", borderRadius: "6px", padding: "2px 8px", boxShadow: "0 2px 4px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)" }}>x{count}</div>
      </motion.div>

      {/* Tooltip อธิบายยา */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)", // ลอยอยู่ด้านบน
              left: "50%",
              background: "rgba(15, 11, 8, 0.95)", 
              border: "1px solid #d4af37", 
              borderRadius: "6px",
              padding: "8px 10px",
              minWidth: "120px",
              zIndex: 100, 
              pointerEvents: "none", 
              boxShadow: "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              whiteSpace: "nowrap"
            }}
          >
            {/* ลูกศรชี้ลงด้านล่าง */}
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

            {/* หัวข้อ (ชื่อยา) */}
            <span style={{ color: color, fontSize: "12px", fontWeight: "bold", fontFamily: "'Palatino', serif" }}>
              {label} POTION
            </span>
            {/* คำอธิบาย */}
            <span style={{ color: "#bdc3c7", fontSize: "11px" }}>
              {description}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const PlayerStatusCard = ({ onHeal, onCure, onReroll }) => {
  // ดึง gameState มาใช้ตรวจสอบสถานะการต่อสู้
  const { playerData, username, gameState } = useGameStore();
  const [isShieldHovered, setIsShieldHovered] = useState(false);

  if (!playerData) return null;

  const {
    name = "Hero", hp = 0, max_hp = 0, mana = 0, max_mana = 0, shield = 0, potions = { health: 0, reroll: 0, cure: 0 }
  } = playerData;

  // กำหนดเงื่อนไข: ถ้าไม่ใช่เทิร์นเพลเยอร์ ถือว่ากดไม่ได้ (อยู่นอกการต่อสู้ หรือเป็นเทิร์นศัตรู)
  const isActionDisabled = gameState !== "PLAYERTURN";

  return (
    <div style={{ 
      width: "25%", 
      background: "#0c0a09", // พื้นหลังดำน้ำตาลเข้ม
      border: "2px solid #3d2e24", // ขอบธีม COMMANDS
      borderRadius: "8px",
      padding: "12px", 
      display: "flex", 
      flexDirection: "column", 
      gap: "8px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.6), inset 0 0 15px rgba(61,46,36,0.1)"
    }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #3d2e24", paddingBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <GiVisoredHelm style={{ fontSize: "24px", color: "#d4af37" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "10px", color: "#8b7355", fontWeight: "bold", textTransform: "uppercase" }}>{username || "PLAYER"}</span>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#f5d76e", textShadow: "0 2px 0 #000" }}>{name || "UNKNOWN"}</div>
          </div>
        </div>
        
        {/* Shield Icon กับ Tooltip */}
        <div 
          style={{ position: "relative" }}
          onMouseEnter={() => setIsShieldHovered(true)}
          onMouseLeave={() => setIsShieldHovered(false)}
        >
          <div style={{ position: "relative", width: "32px", height: "32px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "default" }}>
            <GiCheckedShield style={{ fontSize: "32px", color: shield > 0 ? "#3498db" : "#444" }} />
            <span style={{ position: "absolute", fontSize: "12px", fontWeight: "900", color: "#fff", zIndex: 2, marginTop: "2px", textShadow: "0px 0px 3px #000" }}>{shield}</span>
          </div>

          <AnimatePresence>
            {isShieldHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)", 
                  left: "50%",
                  background: "rgba(15, 11, 8, 0.95)", 
                  border: "1px solid #d4af37", 
                  borderRadius: "6px",
                  padding: "8px 10px",
                  minWidth: "120px",
                  zIndex: 100, 
                  pointerEvents: "none", 
                  boxShadow: "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  whiteSpace: "nowrap"
                }}
              >
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

                <span style={{ color: "#3498db", fontSize: "12px", fontWeight: "bold", fontFamily: "'Palatino', serif" }}>
                  SHIELD: {shield}
                </span>
                <span style={{ color: "#bdc3c7", fontSize: "11px" }}>
                  Absorbs incoming damage.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* HP & MANA BARS (ชิดกันและสูงเท่ากัน) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "10px" }}>
        <PixelBar 
          labelText="HP" 
          current={hp} 
          max={max_hp} 
          color="#4dff8b" 
          height="18px" 
          tooltipTitle={`Health: ${hp}/${max_hp}`}
          tooltipDesc="Your life points."
        />
        <PixelBar 
          labelText="MP" 
          current={mana} 
          max={max_mana} 
          color="#4dcdff" 
          height="18px" 
          tooltipTitle={`Mana: ${mana}/${max_mana}`}
          tooltipDesc="Used to cast special skills."
        />
      </div>

      {/* Potions Grid */}
      <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        <PotionSlot 
          label="HEAL" 
          icon={<GiHealthPotion />} 
          color="#e74c3c" 
          count={potions.health || 0} 
          description="Restores 30 HP."
          onClick={onHeal} 
          disabled={isActionDisabled} 
        />
        <PotionSlot 
          label="CLEAN" 
          icon={<GiStandingPotion />} 
          color="#ffffff" 
          count={potions.cure || 0} 
          description="Cures all negative status."
          onClick={onCure} 
          disabled={isActionDisabled} 
        />
        <PotionSlot 
          label="ROLL" 
          icon={<GiMagicPotion />} 
          color="#3498db" 
          count={potions.reroll || 0} 
          description="Rerolls all brain slots."
          onClick={onReroll} 
          disabled={isActionDisabled} 
        />
      </div>
    </div>
  );
};