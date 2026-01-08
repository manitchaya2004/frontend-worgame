import React from "react";
import { motion } from "framer-motion";
// ✅ Import ฟังก์ชันคำนวณ (ตรวจสอบ path ให้ถูกต้องตาม project structure ของคุณ)
import { getLetterDamage } from "../../../../const/letterValues"; 

// ==========================================
// 🛠️ Helper Functions
// ==========================================
const getStatModifier = (val) => Math.floor((val - 10) / 2);

const calculateTotalDamage = (word, strMod) => {
  if (!word) return 0;
  let total = 0;
  for (let char of word) {
    total += getLetterDamage(char, strMod);
  }
  return Math.floor(total);
};

// --- 🎨 Sub-Component: RetroButton (เหมือนเดิม) ---
const RetroButton = ({
  label,
  subLabel,
  color,
  shadowColor,
  icon,
  onClick,
  disabled,
  highlight,
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { y: -2 } : {}}
      whileTap={!disabled ? { y: 2, boxShadow: "0 0 0 rgba(0,0,0,0)" } : {}}
      onClick={(e) => {
        if (!disabled && onClick) onClick();
      }}
      disabled={disabled}
      style={{
        flex: 1,
        position: "relative",
        border: "none",
        outline: "none",
        background: "transparent",
        padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%", 
        minHeight: "70px",
      }}
    >
      {/* 3D Shadow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: disabled ? "#555" : shadowColor,
          borderRadius: "8px",
          top: "4px",
          zIndex: 0,
        }}
      />
      
      {/* Face */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          background: disabled 
            ? "#777" 
            : highlight 
                ? `linear-gradient(to bottom, ${color}, ${shadowColor})`
                : color,
          borderRadius: "8px",
          border: "2px solid #1a120b",
          boxShadow: disabled 
            ? "inset 2px 2px 0px rgba(255,255,255,0.1), inset -2px -2px 0px rgba(0,0,0,0.2)"
            : "inset 3px 3px 0px rgba(255,255,255,0.25), inset -3px -3px 0px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: disabled ? "#aaa" : "#fff",
          opacity: disabled ? 0.8 : 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <span style={{ fontSize: "20px", filter: disabled ? "grayscale(100%)" : "none" }}>{icon}</span>
          <span style={{ 
            fontSize: "14px", 
            fontWeight: "900", 
            fontFamily: '"Courier New", Courier, monospace',
            textTransform: "uppercase", 
            letterSpacing: "1px",
            textShadow: "2px 2px 0 #000"
          }}>
            {label}
          </span>
        </div>

        {subLabel && (
          <div style={{ 
            fontSize: "10px", 
            fontWeight: "bold", 
            fontFamily: 'monospace',
            color: "#fff", 
            background: "rgba(0,0,0,0.4)", 
            padding: "2px 6px", 
            borderRadius: "4px",
            border: "1px solid rgba(0,0,0,0.5)"
          }}>
            {subLabel}
          </div>
        )}
      </div>
    </motion.button>
  );
};

// --- 🎮 Main Component: ActionPanel ---
export const ActionPanel = ({
  playerData,
  gameState,
  validWordInfo, // { word: "CAT", meaning: "แมว" }
  onAttackClick,
  onShieldClick,
  onSpinClick,
  onEndTurnClick,
}) => {
  const isPlayerTurn = gameState === "PLAYERTURN";
  const hasWord = !!validWordInfo;
  
  // ✅ 1. เตรียมค่า Modifier
  const strMod = getStatModifier(playerData.stats.STR || 10);
  const wordText = validWordInfo?.word || "";
  const wordLen = wordText.length;

  // ✅ 2. คำนวณค่าพลังจริงที่จะแสดงบนปุ่ม
  // Damage: ผลรวมพลังตัวอักษร
  const realDmg = calculateTotalDamage(wordText, strMod);
  
  // Shield: (Len * 3) + Max(0, StrMod)
  const realDef = (wordLen * 3) + Math.max(0, strMod);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#1a120b",
        border: "2px solid #ffd700",
        borderRadius: "12px",
        boxShadow: "0 0 0 2px #5c4033, 0 8px 0 #3e2723",
        padding: "4px",
        overflow: "hidden",
      }}
    >
      {/* 1. HEADER: Player Info */}
      <div style={{ 
          background: "#2e2019", 
          padding: "8px 12px", 
          borderRadius: "8px 8px 0 0",
          borderBottom: "2px solid #5c4033",
          marginBottom: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ 
                color: "#f1c40f", 
                fontWeight: "bold", 
                fontSize: "14px", 
                fontFamily: '"Courier New", Courier, monospace', 
                textShadow: "1px 1px 0 #000" 
            }}>
                {playerData.name.toUpperCase()} <span style={{fontSize: "10px", color: "#aaa"}}>LV.1</span>
            </span>
            
            <div style={{ 
                display: "flex", alignItems: "center", gap: "4px", 
                background: "#1e3799", 
                padding: "2px 6px", borderRadius: "4px", 
                border: "1px solid #fff", boxShadow: "1px 1px 0 #000"
            }}>
                <span style={{ fontSize: "12px" }}>🛡️</span>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", fontFamily: 'monospace' }}>{playerData.shield}</span>
            </div>
        </div>

        {/* HP Bar */}
        <div style={{ position: "relative", width: "100%", height: "16px", background: "#444", borderRadius: "4px", border: "2px solid #000" }}>
            <div 
                style={{ 
                    width: `${Math.min(100, (playerData.hp / playerData.max_hp) * 100)}%`, 
                    height: "100%", 
                    background: "#e74c3c",
                    borderRight: "2px solid #8B0000",
                    transition: "width 0.4s ease-out"
                }} 
            />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "#fff", textShadow: "1px 1px 0 #000", fontFamily: 'monospace' }}>
                {playerData.hp}/{playerData.max_hp}
            </div>
        </div>
      </div>

      {/* 2. BUTTONS GRID */}
      <div style={{ 
          flex: 1, 
          padding: "0 8px 12px 8px", 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gridTemplateRows: "1fr 1fr",
          gap: "8px",
      }}>
        
        {/* ⚔️ ATTACK */}
        <RetroButton 
            label="ATTACK"
            icon="⚔️"
            subLabel={hasWord ? `${realDmg} DMG` : null} // ✅ โชว์ดาเมจจริง
            color="#c0392b"
            shadowColor="#7f1d1d"
            disabled={!isPlayerTurn || !hasWord}
            highlight={hasWord}
            onClick={onAttackClick}
        />

        {/* 🛡️ DEFEND */}
        <RetroButton 
            label="DEFEND"
            icon="🛡️"
            subLabel={hasWord ? `+${realDef} DEF` : null} // ✅ โชว์เกราะจริง
            color="#2980b9"
            shadowColor="#1c4e80"
            disabled={!isPlayerTurn || !hasWord}
            highlight={hasWord}
            onClick={onShieldClick}
        />

        {/* 🎲 SPIN */}
        <RetroButton 
            label="SPIN"
            icon="🎲"
            subLabel={`RP: ${playerData.rp}`}
            color="#f39c12"
            shadowColor="#b3541e"
            disabled={!isPlayerTurn || playerData.rp <= 0}
            onClick={onSpinClick}
        />

        {/* ⏭️ END */}
        <RetroButton 
            label="END"
            icon="⏭️"
            color="#34495e"
            shadowColor="#1a252f"
            disabled={!isPlayerTurn}
            onClick={onEndTurnClick}
        />

      </div>
    </div>
  );
};