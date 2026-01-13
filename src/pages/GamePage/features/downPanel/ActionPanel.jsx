import React from "react";
import { motion } from "framer-motion";
import { getLetterDamage } from "../../../../const/letterValues";
import { 
  GiBroadsword, GiShield, GiRollingDices, GiSandsOfTime, 
  GiCheckedShield, GiClover, GiMuscleUp, GiScrollUnfurled, 
  GiCrystalBall, GiStarShuriken, GiHearts 
} from "react-icons/gi";

// ✅ Helper สำหรับหา Bonus จาก Stat
const getStatBonus = (val) => Math.max(0, val - 10);

// ✅ คำนวณค่าดาเมจดิบ (ทศนิยม)
const calculateRawValue = (word, strMod) => {
  if (!word) return 0;
  return word.split('').reduce((acc, char) => acc + getLetterDamage(char, strMod), 0);
};

// --- StatMiniBox: ออกแบบใหม่ให้เป็นแนวนอน (Row) เพื่อประหยัดพื้นที่แนวตั้ง ---
const StatMiniBox = ({ icon, label, value, color = "#fff" }) => (
  <div style={{ 
    display: "flex", 
    alignItems: "center", 
    gap: "4px", 
    background: "rgba(0,0,0,0.5)", 
    padding: "4px 6px", 
    borderRadius: "4px", 
    border: "1px solid rgba(255,255,255,0.1)",
    minWidth: 0
  }}>
    <div style={{ fontSize: "12px", display: "flex", flexShrink: 0, filter: `drop-shadow(0 0 2px ${color})` }}>
      {icon}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", overflow: "hidden" }}>
      <span style={{ fontSize: "7px", color: "#888", fontWeight: "bold", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ fontSize: "10px", color: color, fontWeight: "900", lineHeight: "1" }}>
        {value}
      </span>
    </div>
  </div>
);

// --- RetroButton: ปุ่มกดที่ปรับขนาดให้ยืดหยุ่นตามพื้นที่ที่เหลือ ---
const RetroButton = ({ label, subLabel, color, shadowColor, icon, onClick, disabled, highlight }) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.02 } : {}}
    whileTap={!disabled ? { scale: 0.98 } : {}}
    onClick={onClick}
    disabled={disabled}
    style={{ 
      position: "relative", border: "none", background: "transparent", 
      padding: 0, cursor: disabled ? "not-allowed" : "pointer", 
      width: "100%", height: "100%", display: "flex", flexDirection: "column"
    }}
  >
    <div style={{ position: "absolute", inset: 0, background: disabled ? "#1a1a1a" : shadowColor, borderRadius: "6px", top: "2px" }} />
    <div style={{
      position: "relative", flex: 1, width: "100%",
      background: disabled ? "#333" : highlight ? `linear-gradient(135deg, ${color}, ${shadowColor})` : color,
      borderRadius: "6px", border: `1px solid ${highlight ? '#fff' : '#000'}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      color: disabled ? "#666" : "#fff", padding: "4px"
    }}>
      <div style={{ fontSize: "22px", marginBottom: "-2px", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }}>
        {icon}
      </div>
      <span style={{ fontSize: "11px", fontWeight: "900", textShadow: "1px 1px 0 #000" }}>
        {label}
      </span>
      {subLabel && (
        <div style={{ 
          fontSize: "8.5px", background: "rgba(0,0,0,0.4)", 
          padding: "1px 5px", borderRadius: "3px", color: "#eebb55", marginTop: "1px",
          border: "1px solid rgba(238,187,85,0.2)"
        }}>
          {subLabel}
        </div>
      )}
    </div>
  </motion.button>
);

export const ActionPanel = ({ playerData, gameState, validWordInfo, onAttackClick, onShieldClick, onSpinClick, onEndTurnClick }) => {
  const isPlayerTurn = gameState === "PLAYERTURN";
  const hasWord = !!validWordInfo;
  
  const strBonus = getStatBonus(playerData.stats.STR || 10);
  const luckBonus = getStatBonus(playerData.stats.LUCK || 10);
  
  const wordText = validWordInfo?.word || "";
  const rawDmg = calculateRawValue(wordText, strBonus);
  const dmgFloor = Math.floor(rawDmg);
  const dmgChance = Math.min(100, Math.round(((rawDmg - dmgFloor) + (luckBonus * 0.02)) * 100));

  const rawDef = hasWord ? (wordText.length * 1.5 + strBonus) : 0;
  const defFloor = Math.floor(rawDef);
  const defChance = Math.min(100, Math.round(((rawDef - defFloor) + (luckBonus * 0.02)) * 100));

  const formatSubLabel = (floor, chance) => {
    if (chance <= 0) return `${floor}`;
    if (chance >= 100) return `${floor + 1}`;
    return `${floor} (+${chance}%)`;
  };

  return (
    <div style={{
      boxSizing: "border-box", width: "100%", height: "100%",
      background: "linear-gradient(180deg, #2c1e15 0%, #1a0f0a 100%)",
      border: "3px solid #eebb55", borderRadius: "10px", padding: "10px",
      display: "flex", flexDirection: "column", gap: "8px",
      minWidth: "300px", maxWidth: "300px", overflow: "hidden"
    }}>
      
      {/* 🟢 ส่วนบน: ข้อมูลตัวละครและ Status Dashboard */}
      <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "8px", border: "1px solid #4d3a2b" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <div style={{ color: "#eebb55", fontWeight: "900", fontSize: "14px", textShadow: "1px 1px 0 #000" }}>
            {playerData.name.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "3px", background: "#1e3799", padding: "2px 8px", borderRadius: "4px" }}>
            <GiCheckedShield size={12} color="#fff"/>
            <span style={{ fontSize: "12px", fontWeight: "900", color: "#fff" }}>{playerData.shield}</span>
          </div>
        </div>

        {/* HP Bar */}
        <div style={{ 
          height: "20px", background: "#000", borderRadius: "4px", padding: "1.5px", 
          border: "1.5px solid #3d2b1f", position: "relative", marginBottom: "8px",
        }}>
          <div style={{ width: "100%", height: "100%", background: "#440000", borderRadius: "2px" }} />
          <motion.div 
            animate={{ width: `${(playerData.hp / playerData.max_hp) * 100}%` }}
            style={{ 
              position: "absolute", top: "1.5px", left: "1.5px", bottom: "1.5px",
              background: `linear-gradient(180deg, #ff4d4d 0%, #cc0000 50%, #880000 100%)`,
              borderRadius: "2px"
            }}
          />
          <div style={{ 
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", 
            fontSize: "10px", fontWeight: "900", color: "#fff", textShadow: "1px 1px 1px #000" 
          }}>
            {playerData.hp} / {playerData.max_hp}
          </div>
        </div>

        {/* 📊 Stat Dashboard: 3 หลัก 2 แถว แบบแนวนอน (Row) */}
        <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "4px" 
        }}>
          <StatMiniBox icon={<GiHearts color="#ff4d4d"/>} label="HP" value={playerData.max_hp} color="#ff4d4d" />
          <StatMiniBox icon={<GiStarShuriken color="#fab1a0"/>} label="SPD" value={playerData.speed} color="#fab1a0" />
          <StatMiniBox icon={<GiMuscleUp color="#ff7675"/>} label="ATK" value={`+${(strBonus * 0.25).toFixed(2)}`} color="#ff7675" />
          <StatMiniBox icon={<GiScrollUnfurled color="#74b9ff"/>} label="SLOT" value={playerData.unlockedSlots} color="#74b9ff" />
          <StatMiniBox icon={<GiCrystalBall color="#a29bfe"/>} label="RP" value={playerData.max_rp} color="#a29bfe" />
          <StatMiniBox icon={<GiClover color="#55efc4"/>} label="LCK" value={`+${luckBonus * 2}%`} color="#55efc4" />
        </div>
      </div>

      {/* 🔴 ส่วนล่าง: ปุ่มการกระทำ (ใช้พื้นที่เต็มที่) */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gridTemplateRows: "1fr 1fr", 
        gap: "8px", 
        flex: 1 
      }}>
        <RetroButton 
          label="ATTACK" icon={<GiBroadsword />} 
          subLabel={hasWord ? formatSubLabel(dmgFloor, dmgChance) : null} 
          color="#d63031" shadowColor="#8b0000" 
          disabled={!isPlayerTurn || !hasWord} highlight={isPlayerTurn && hasWord} 
          onClick={onAttackClick} 
        />
        <RetroButton 
          label="DEFEND" icon={<GiShield />} 
          subLabel={hasWord ? formatSubLabel(defFloor, defChance) : null} 
          color="#0984e3" shadowColor="#0056b3" 
          disabled={!isPlayerTurn || !hasWord} highlight={isPlayerTurn && hasWord} 
          onClick={onShieldClick} 
        />
        <RetroButton 
          label="SPIN" icon={<GiRollingDices />} 
          subLabel={`RP: ${playerData.rp}`} 
          color="#fdcb6e" shadowColor="#b8860b" 
          disabled={!isPlayerTurn || playerData.rp <= 0} 
          onClick={onSpinClick} 
        />
        <RetroButton 
          label="PASS" icon={<GiSandsOfTime />} 
          color="#636e72" shadowColor="#2d3436" 
          disabled={!isPlayerTurn} 
          onClick={onEndTurnClick} 
        />
      </div>
    </div>
  );
};