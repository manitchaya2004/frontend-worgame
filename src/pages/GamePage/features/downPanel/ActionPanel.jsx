import React from "react";
import { motion } from "framer-motion";
import { getLetterDamage } from "../../../../const/letterValues";
// 1. Import Icons
import { 
  GiBroadsword, 
  GiShield, 
  GiRollingDices, 
  GiSandsOfTime, 
  GiHearts, 
  GiCheckedShield 
} from "react-icons/gi";

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

// --- 🎨 Sub-Component: RetroButton (Updated for Icons) ---
const RetroButton = ({
  label,
  subLabel,
  color,
  shadowColor,
  icon, // รับเป็น Component แล้ว
  onClick,
  disabled,
  highlight,
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { y: -2, filter: "brightness(1.1)" } : {}}
      whileTap={!disabled ? { y: 2, boxShadow: "0 0 0 rgba(0,0,0,0)" } : {}}
      onClick={(e) => {
        if (!disabled && onClick) onClick();
      }}
      disabled={disabled}
      style={{
        position: "relative",
        border: "none",
        outline: "none",
        background: "transparent",
        padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%", // ให้ยืดเต็ม Grid
        width: "100%",  // ให้ยืดเต็ม Grid
        minHeight: "75px", // ความสูงขั้นต่ำเพื่อให้ปุ่มดูใหญ่
      }}
    >
      {/* 3D Shadow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: disabled ? "#333" : shadowColor,
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
            ? "#555" 
            : highlight 
                ? `linear-gradient(to bottom, ${color}, ${shadowColor})`
                : color,
          borderRadius: "8px",
          border: "2px solid #1a120b",
          boxShadow: disabled 
            ? "inset 2px 2px 0px rgba(255,255,255,0.05)"
            : "inset 2px 2px 0px rgba(255,255,255,0.25), inset -2px -2px 0px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: disabled ? "#888" : "#fff",
          opacity: disabled ? 0.9 : 1,
          padding: "4px",
          gap: "2px"
        }}
      >
        {/* Render Icon Component */}
        <div style={{ fontSize: "24px", filter: disabled ? "grayscale(100%)" : "drop-shadow(0 2px 0 rgba(0,0,0,0.3))" }}>
            {icon}
        </div>
        
        <span style={{ 
          fontSize: "12px", 
          fontWeight: "900", 
          fontFamily: '"Courier New", monospace',
          textTransform: "uppercase", 
          letterSpacing: "1px",
          textShadow: "1px 1px 0 #000",
          lineHeight: 1,
          marginTop: "2px"
        }}>
          {label}
        </span>

        {subLabel && (
          <div style={{ 
            marginTop: "2px",
            fontSize: "10px", 
            fontWeight: "bold", 
            fontFamily: 'monospace',
            color: "#fff", 
            background: "rgba(0,0,0,0.4)", 
            padding: "2px 6px", 
            borderRadius: "4px",
            border: "1px solid rgba(0,0,0,0.3)",
            boxShadow: "0 1px 0 rgba(0,0,0,0.2)"
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
  validWordInfo, 
  onAttackClick,
  onShieldClick,
  onSpinClick,
  onEndTurnClick,
}) => {
  const isPlayerTurn = gameState === "PLAYERTURN";
  const hasWord = !!validWordInfo;
  
  const strMod = getStatModifier(playerData.stats.STR || 10);
  const wordText = validWordInfo?.word || "";
  const wordLen = wordText.length;

  const realDmg = calculateTotalDamage(wordText, strMod);
  const realDef = (wordLen * 3) + Math.max(0, strMod);

  return (
    <div
      style={{
        // ใช้ Style เดียวกับ BattleLog
        boxSizing: "border-box",
        flex: 1, 
        height: "100%",
        background: "#1e1e1e", // พื้นหลังเดียวกับ BattleLog
        border: "3px solid #5c4033",
        borderRadius: "8px",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.9)",
        fontFamily: "'Courier New', monospace",
        minWidth: "240px", // ความกว้างขั้นต่ำเท่า BattleLog
      }}
    >
      {/* 1. HEADER: Player Info */}
      <div style={{ 
          background: "#2d2d2d", 
          padding: "8px", 
          borderRadius: "6px",
          border: "1px solid #444",
          marginBottom: "10px",
          boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ 
                color: "#f1c40f", fontWeight: "bold", fontSize: "14px", 
                textShadow: "1px 1px 0 #000", display: "flex", alignItems: "center", gap: "5px"
            }}>
                {playerData.name.toUpperCase()} <span style={{fontSize: "10px", color: "#888", background:"#111", padding:"1px 4px", borderRadius:"3px"}}>LV.1</span>
            </span>
            
            {/* Shield Stat */}
            <div style={{ 
                display: "flex", alignItems: "center", gap: "4px", 
                background: "#1e3799", padding: "2px 6px", borderRadius: "4px", 
                border: "1px solid #74b9ff", boxShadow: "1px 1px 0 #000"
            }}>
                <GiCheckedShield size={14} color="#fff"/>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>{playerData.shield}</span>
            </div>
        </div>

        {/* HP Bar */}
        <div style={{ position: "relative", height: "16px", background: "#111", borderRadius: "4px", border: "1px solid #555", overflow:"hidden" }}>
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (playerData.hp / playerData.max_hp) * 100)}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                style={{ 
                    height: "100%", 
                    background: "linear-gradient(to bottom, #e74c3c, #c0392b)",
                    borderRight: "1px solid #8B0000",
                }} 
            />
            <div style={{ 
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", 
                fontSize: "10px", fontWeight: "bold", color: "#fff", textShadow: "1px 1px 0 #000", gap: "4px"
            }}>
                <GiHearts color="#ff7675" /> {playerData.hp} / {playerData.max_hp}
            </div>
        </div>
      </div>

      {/* 2. BUTTONS GRID */}
      {/* เปลี่ยนจาก Flex Row เป็น Grid เพื่อให้ปุ่มใหญ่และเต็มพื้นที่ในแนวตั้ง */}
      <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", // แบ่งเป็น 2 คอลัมน์เท่ากัน
          gridTemplateRows: "1fr 1fr",    // แบ่งเป็น 2 แถวเท่ากัน
          gap: "8px",
          flex: 1, // ขยายให้เต็มพื้นที่ที่เหลือ
      }}>
        
        {/* ⚔️ ATTACK */}
        <RetroButton 
            label="ATK"
            icon={<GiBroadsword />}
            subLabel={hasWord ? `${realDmg} DMG` : null} 
            color="#c0392b"
            shadowColor="#7f1d1d"
            disabled={!isPlayerTurn || !hasWord}
            highlight={hasWord}
            onClick={onAttackClick}
        />

        {/* 🛡️ DEFEND */}
        <RetroButton 
            label="DEF"
            icon={<GiShield />}
            subLabel={hasWord ? `+${realDef} SHD` : null}
            color="#2980b9"
            shadowColor="#1c4e80"
            disabled={!isPlayerTurn || !hasWord}
            highlight={hasWord}
            onClick={onShieldClick}
        />

        {/* 🎲 SPIN */}
        <RetroButton 
            label="SPIN"
            icon={<GiRollingDices />}
            subLabel={`x${playerData.rp}`}
            color="#f39c12"
            shadowColor="#b3541e"
            disabled={!isPlayerTurn || playerData.rp <= 0}
            onClick={onSpinClick}
        />

        {/* ⏭️ END */}
        <RetroButton 
            label="END"
            icon={<GiSandsOfTime />}
            color="#34495e"
            shadowColor="#1a252f"
            disabled={!isPlayerTurn}
            onClick={onEndTurnClick}
        />

      </div>
    </div>
  );
};