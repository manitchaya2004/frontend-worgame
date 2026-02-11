import React from "react";
import { motion } from "framer-motion";
import {
  GiCheckedShield,
  GiHealthPotion,
  GiMagicPotion,
  GiStandingPotion,
  GiVisoredHelm
} from "react-icons/gi";
import { useGameStore } from "../../../../store/useGameStore";

/* ===== Reusable Pixel Bar (ปรับปรุงให้ชิดเป๊ะและเข้าธีม) ===== */
const PixelBar = ({ current, max, color, height = "18px", labelColor = "#fff", labelText = "" }) => {
  const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "row", 
      alignItems: "center", 
      width: "100%",
      gap: "4px" // ลดช่องว่างให้ชิดที่สุด
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
  );
};

/* ===== Potion Slot (ปรับขอบให้เข้าธีม) ===== */
const PotionSlot = ({ icon, count, color, label, onClick }) => {
  const isDisabled = count <= 0;
  return (
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
      <div style={{ fontSize: "60px", color: count > 0 ? color : "#444", filter: count > 0 ? "drop-shadow(0px 0px 8px rgba(255,255,255,0.2))" : "grayscale(100%) opacity(0.5)", transform: "translateY(5px)" }}>{icon}</div>
      <div style={{ position: "absolute", bottom: "8px", right: "8px", background: count > 0 ? "#c0392b" : "#555", color: "#fff", fontSize: "14px", fontWeight: "900", borderRadius: "6px", padding: "2px 8px", boxShadow: "0 2px 4px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)" }}>x{count}</div>
    </motion.div>
  );
};

export const PlayerStatusCard = ({ onHeal, onCure, onReroll }) => {
  const { playerData, username } = useGameStore();

  if (!playerData) return null;

  const {
    name = "Hero", hp = 0, max_hp = 0, mana = 0, max_mana = 0, shield = 0, potions = { health: 0, reroll: 0, cure: 0 }
  } = playerData;

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
        <div style={{ position: "relative", width: "32px", height: "32px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <GiCheckedShield style={{ fontSize: "32px", color: shield > 0 ? "#3498db" : "#444" }} />
          <span style={{ position: "absolute", fontSize: "12px", fontWeight: "900", color: "#fff", zIndex: 2, marginTop: "2px", textShadow: "0px 0px 3px #000" }}>{shield}</span>
        </div>
      </div>

      {/* HP & MANA BARS (ชิดกันและสูงเท่ากัน) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "10px" }}>
        <PixelBar labelText="HP" current={hp} max={max_hp} color="#4dff8b" height="18px" />
        <PixelBar labelText="MP" current={mana} max={max_mana} color="#4dcdff" height="18px" />
      </div>

      {/* Potions Grid */}
      <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        <PotionSlot label="HEAL" icon={<GiHealthPotion />} color="#e74c3c" count={potions.health || 0} onClick={onHeal} />
        <PotionSlot label="CLEAN" icon={<GiStandingPotion />} color="#ffffff" count={potions.cure || 0} onClick={onCure} />
        <PotionSlot label="ROLL" icon={<GiMagicPotion />} color="#3498db" count={potions.reroll || 0} onClick={onReroll} />
      </div>
    </div>
  );
};