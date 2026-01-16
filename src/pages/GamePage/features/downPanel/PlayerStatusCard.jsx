import React from "react";
import { motion } from "framer-motion";
import {
  GiHearts,
  GiBroadsword,
  GiBrain,
  GiWalkingBoot,
  GiCheckedShield,
  GiHealthPotion,
  GiMagicPotion,
  GiBubblingFlask,
  GiVisoredHelm
} from "react-icons/gi";
import { useGameStore } from "../../../../store/useGameStore";

/* ===== Reusable Pixel Bar ===== */
const PixelBar = ({ current, max, color, height = "24px", labelColor = "#fff" }) => {
  const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  return (
    <div style={{ position: "relative", width: "100%", height: height, background: "#333", border: "2px solid #000", borderRadius: "4px", overflow: "hidden", boxShadow: "0 2px 0 rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${percent}%`, background: color, transition: "width 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.4)" }} />
      <span style={{ position: "relative", fontSize: parseInt(height) < 20 ? "9px" : "10px", fontWeight: "900", color: labelColor, textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000", zIndex: 5, lineHeight: 1, fontFamily: "monospace, sans-serif", letterSpacing: "0.5px" }}>
        {Number.isInteger(current) ? current : parseFloat(current.toFixed(1))} / {max}
      </span>
    </div>
  );
};

/* ===== Stat Item ===== */
const StatItem = ({ icon, label, value, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.35)", border: "1px solid #444", padding: "6px 8px", borderRadius: "6px" }}>
    <div style={{ fontSize: "14px", color }}>{icon}</div>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <span style={{ fontSize: "9px", color: "#888", letterSpacing: "1px" }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: "900", color }}>{value}</span>
    </div>
  </div>
);

/* ===== 🧪 Potion Slot ===== */
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
            : "linear-gradient(180deg, rgba(50,50,50,0.4) 0%, rgba(20,20,20,0.9) 100%)",
        border: `2px solid ${isDisabled ? "#333" : "#4d3a2b"}`,
        borderRadius: "12px",
        height: "130px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDisabled ? "default" : "pointer",
        boxShadow: isDisabled ? "none" : "inset 0 0 15px rgba(0,0,0,0.8)",
        transition: "border 0.2s",
        opacity: isDisabled ? 0.6 : 1
      }}
    >
      <div style={{ position: "absolute", top: "10px", fontSize: "10px", color: "#aaa", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "60px", color: count > 0 ? color : "#444", filter: count > 0 ? "drop-shadow(0px 0px 8px rgba(255,255,255,0.3))" : "grayscale(100%) opacity(0.5)", transform: "translateY(5px)", transition: "transform 0.2s" }}>{icon}</div>
      <div style={{ position: "absolute", bottom: "8px", right: "8px", background: count > 0 ? "#c0392b" : "#555", color: "#fff", fontSize: "14px", fontWeight: "900", borderRadius: "6px", padding: "2px 8px", boxShadow: "0 2px 4px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.3)" }}>x{count}</div>
    </motion.div>
  );
};

// ✅ เพิ่ม onHeal, onReroll ใน Props
export const PlayerStatusCard = ({ onHeal, onReroll }) => {
  const store = useGameStore();
  const { playerData } = store;

  if (!playerData) return null;

  const {
    name = "Hero", 
    hp = 0, 
    max_hp = 100, 
    shield = 0, 
    atk = 0, 
    speed = 0, 
    unlockedSlots = 0,
    potions = { health: 0, reroll: 0, buff: 0 }
  } = playerData;

  return (
    <div
      style={{
        width: "25%",
        background: "rgba(0,0,0,0.4)",
        border: "1px solid #4d3a2b",
        padding: "10px", 
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* ===== HEADER BAR ===== */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderBottom: "1px solid #4d3a2b", 
          paddingBottom: "8px",
          marginBottom: "4px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <GiVisoredHelm style={{ fontSize: "18px", color: "#d4af37" }} />
          <div 
            style={{ 
              fontSize: "15px", 
              fontWeight: "900", 
              color: "#f5d76e", 
              letterSpacing: "2px", 
              textTransform: "uppercase",
              textShadow: "0 2px 0 #000"
            }}
          >
            {name || "UNKNOWN"}
          </div>
        </div>

        {/* Shield Icon */}
        <div style={{ position: "relative", width: "32px", height: "32px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <GiCheckedShield style={{ fontSize: "32px", color: shield > 0 ? "#3498db" : "#555", filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.5))" }} />
          <span style={{ position: "absolute", fontSize: "12px", fontWeight: "900", color: "#fff", zIndex: 2, marginTop: "2px", textShadow: "0px 0px 3px #000, 0px 0px 1px #000" }}>
            {shield}
          </span>
        </div>
      </div>

      {/* ===== HP Bar ===== */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <PixelBar current={hp} max={max_hp} color="#4dff8b" height="24px" />
      </div>

      {/* ===== Stats Grid ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", width: "100%", justifyItems: "center", alignItems: "center" }}>
        <StatItem icon={<GiHearts />} label="HP" value={max_hp} color="#ff6b6b" />
        <StatItem icon={<GiBrain />} label="SLOT" value={unlockedSlots} color="#74b9ff" />
        <StatItem icon={<GiBroadsword />} label="ATK" value={`+${(atk).toFixed(2)}`} color="#ff7675" />
        <StatItem icon={<GiWalkingBoot />} label="SPD" value={`${speed - 1}-${speed + 1}`} color="#feca57" />
      </div>

      {/* ===== Potions Grid ===== */}
      <div 
        style={{ 
            marginTop: "10px", 
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr", 
            gap: "10px", 
        }}
      >
        {/* ✅ ผูก onClick กับ onHeal */}
        <PotionSlot 
            label="HEAL"
            icon={<GiHealthPotion />} 
            color="#e74c3c"
            count={potions.health || 0}
            onClick={onHeal}
        />

        {/* Buff ยังไม่มี Logic */}
        <PotionSlot 
            label="BUFF"
            icon={<GiBubblingFlask />} 
            color="#2ecc71"
            count={potions.buff || 0}
            onClick={() => console.log("Use Buff")}
        />

        {/* ✅ ผูก onClick กับ onReroll */}
        <PotionSlot 
            label="ROLL"
            icon={<GiMagicPotion />} 
            color="#3498db"
            count={potions.reroll || 0}
            onClick={onReroll}
        />
      </div>

    </div>
  );
};