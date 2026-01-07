import React, { useState } from "react";
import { motion } from "framer-motion";

// ✅ Import ข้อมูลสกิล
import { SKILL_DATABASE } from "../../../../data/skill"; 

// --- Sub-Component: SkillButton ---
// ตัวปุ่มสกิลที่ใช้แสดงในรายการ
const SkillButton = ({
  label,
  subLabel,
  cost,
  color,
  onClick,
  disabled,
  icon,
  height = "50px", 
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, filter: "brightness(1.1)" } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      style={{
        width: "100%",
        height: height,
        minHeight: height,
        border: `2px solid ${disabled ? "#444" : "#000"}`,
        borderRadius: "6px",
        background: disabled
          ? "#2a2a2a"
          : `linear-gradient(135deg, #2e2019 0%, ${color} 100%)`,
        color: disabled ? "#555" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: disabled ? "none" : "0 4px 6px rgba(0,0,0,0.3)",
        opacity: disabled ? 0.7 : 1,
        marginBottom: "0", 
        padding: 0,
        flexShrink: 0,
      }}
    >
      {/* Icon Area */}
      <div
        style={{
          width: "40px",
          height: "100%",
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          borderRight: "1px solid rgba(0,0,0,0.2)",
        }}
      >
        {icon || "⚔️"}
      </div>

      {/* Text Area */}
      <div
        style={{
          flex: 1,
          padding: "0 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          overflow: "hidden", 
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: "bold",
            textShadow: "1px 1px 0 #000",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
            textAlign: "left"
          }}
        >
          {label}
        </span>
        {subLabel && (
          <span style={{ fontSize: "9px", opacity: 0.8 }}>{subLabel}</span>
        )}
      </div>

      {/* Cost Area (เช่น 10 MP) */}
      {cost && (
        <div
          style={{
            padding: "4px 6px",
            fontSize: "10px",
            fontWeight: "bold",
            background: "rgba(0,0,0,0.4)",
            borderRadius: "4px",
            marginRight: "5px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {cost}
        </div>
      )}
    </motion.button>
  );
};

// --- Main Component: SkillBar ---
export const SkillBar = ({
  playerData,
  gameState,
  validWordInfo,
  currentWordLength,
  targetingMode,
  onSkillClick,
  onSpin,
  onEndTurn,
}) => {
  const isPlayerTurn = gameState === "PLAYERTURN";
  const hasWord = !!validWordInfo;
  const [activeTab, setActiveTab] = useState("ACTION");

  const getSkillColor = (type) => {
    switch (type) {
      case "DAMAGE": return "#d32f2f";
      case "SHIELD": return "#1976d2";
      case "SPIN": return "#fbc02d";
      case "HEAL": return "#388e3c";
      default: return "#5d4037";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#2e2019",
        border: "3px solid #5c4033",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
      }}
    >
      {/* 1. HEADER (Stats: HP, MP, AP, RP) */}
      <div style={{ background: "#1a120b", padding: "10px", borderBottom: "2px solid #5c4033", display: "flex", flexDirection: "column", gap: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#fff", fontWeight: "bold", fontFamily: "monospace" }}>
          <span>{playerData.name}</span><span>LV. 1</span>
        </div>
        
        {/* --- HP Bar --- */}
        <div style={{ position: "relative", width: "100%", height: "14px", background: "#444", borderRadius: "7px", overflow: "hidden", border: "1px solid #000" }}>
          <div style={{ width: `${Math.max(0, (playerData.hp / playerData.max_hp) * 100)}%`, height: "100%", background: "#ff4d4d", transition: "width 0.3s" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "#fff", textShadow: "1px 1px 0 #000" }}>
            {playerData.hp} / {playerData.max_hp}
          </div>
        </div>
        
        {/* --- MP Bar --- */}
        <div style={{ position: "relative", width: "100%", height: "14px", background: "#222", borderRadius: "7px", overflow: "hidden", border: "1px solid #000", marginTop: "2px" }}>
           <div style={{ width: `${Math.min(100, (playerData.mp / (playerData.max_mp || 1)) * 100)}%`, height: "100%", background: "#2979ff", transition: "width 0.3s" }} />
           <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "#fff", textShadow: "1px 1px 0 #000" }}>
            {playerData.mp} / {playerData.max_mp}
          </div>
        </div>

        {/* --- ROW 3: AP (Action Point) & RP (Reroll Point) & Shield --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", gap: "8px" }}>
          
          {/* LEFT GROUP: AP & RP Indicators */}
          <div style={{ display: "flex", gap: "4px", flex: 1 }}>
            
            {/* AP Dots */}
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                <span style={{ fontSize: "10px", color: "#00e5ff", fontWeight: "bold", marginRight: "2px" }}>AP:</span>
                {Array.from({ length: playerData.max_ap || 3 }).map((_, i) => (
                <div 
                    key={`ap-${i}`} 
                    style={{ 
                    width: "8px", 
                    height: "8px", 
                    borderRadius: "50%", 
                    background: i < playerData.ap ? "#00e5ff" : "#444", 
                    border: "1px solid #000", 
                    boxShadow: i < playerData.ap ? "0 0 5px #00e5ff" : "none",
                    transition: "background 0.2s"
                    }} 
                />
                ))}
            </div>

            {/* RP Dots */}
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                <span style={{ fontSize: "10px", color: "#ffd700", marginRight: "2px" }}>RP:</span>
                {Array.from({ length: playerData.max_rp || 3 }).map((_, i) => (
                <div 
                    key={`rp-${i}`} 
                    style={{ 
                    width: "8px", 
                    height: "8px", 
                    borderRadius: "50%", 
                    background: i < playerData.rp ? "#ffd700" : "#444", 
                    border: "1px solid #000", 
                    boxShadow: i < playerData.rp ? "0 0 4px #ffd700" : "none" 
                    }} 
                />
                ))}
            </div>

          </div>

          {/* RIGHT GROUP: Shield Status */}
          <div style={{ 
              background: playerData.shield > 0 ? "#00bcd4" : "#2a2a2a", 
              padding: "4px 8px", 
              borderRadius: "4px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              minWidth: "50px",
              border: playerData.shield > 0 ? "1px solid #fff" : "1px solid #444",
              transition: "background 0.3s"
          }}>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: playerData.shield > 0 ? "#000" : "#666" }}>
                🛡 {playerData.shield}
              </span>
          </div>

        </div>
      </div>

      {/* 2. TABS (Action / Bag) */}
      <div style={{ display: "flex", background: "#3e2723", borderBottom: "2px solid #5c4033" }}>
        <div style={{ flex: 1, padding: "8px 0", textAlign: "center", cursor: "pointer", fontWeight: "bold", fontSize: "12px", color: activeTab === "ACTION" ? "#fff" : "#8d6e63", background: activeTab === "ACTION" ? "#5c4033" : "transparent" }} onClick={() => setActiveTab("ACTION")}>ACTION</div>
        <div style={{ flex: 1, padding: "8px 0", textAlign: "center", cursor: "pointer", fontWeight: "bold", fontSize: "12px", color: activeTab === "BAG" ? "#fff" : "#8d6e63", background: activeTab === "BAG" ? "#5c4033" : "transparent" }} onClick={() => setActiveTab("BAG")}>BAG</div>
      </div>

      {/* 3. CONTENT AREA (Skills List) */}
      <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", overflowY: "auto", background: "linear-gradient(180deg, #3e2723 0%, #2e2019 100%)", gap: "8px" }}>
        {activeTab === "ACTION" ? (
          <>
            {SKILL_DATABASE.map((skill) => {
              // Logic การตรวจสอบเงื่อนไขการใช้สกิล
              let isDisabled = !isPlayerTurn || targetingMode;

              if (playerData.ap < (skill.apCost || 1)) isDisabled = true;
              if ((skill.mpCost || 0) > 0 && playerData.mp < skill.mpCost) isDisabled = true;

              if ((skill.minWordLength || 0) > 0) {
                if (!hasWord) isDisabled = true;
                if (currentWordLength < skill.minWordLength) isDisabled = true;
              }

              let costText = "";
              if (skill.mpCost > 0) costText += `${skill.mpCost} MP`; 
              
              let subText = skill.description;
              if (skill.mpGain > 0) subText = `(+${skill.mpGain} MP) ${subText}`;

              return (
                <SkillButton
                  key={skill.id}
                  label={skill.name}
                  subLabel={subText}
                  cost={costText}
                  color={getSkillColor(skill.effectType)}
                  icon={skill.icon}
                  disabled={isDisabled}
                  onClick={() => onSkillClick(skill)}
                />
              );
            })}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
            <div style={{ fontSize: "30px", marginBottom: "10px" }}>🎒</div>
            <div style={{ color: "#aaa", fontSize: "12px" }}>Inventory Empty</div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM ACTION ROW (Spin & End Turn) */}
      <div style={{ padding: "10px", background: "#1a120b", borderTop: "2px solid #5c4033", display: "flex", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <SkillButton
                label={`SPIN (${playerData.rp})`}
                color="#fbc02d" 
                icon="🎲"
                disabled={!isPlayerTurn || targetingMode || playerData.rp <= 0}
                onClick={onSpin}
                height="45px" 
            />
          </div>
          <div style={{ flex: 1 }}>
            <SkillButton
                label="END"
                color="#d32f2f" 
                icon="⏳"
                disabled={!isPlayerTurn || targetingMode}
                onClick={onEndTurn}
                height="45px"
            />
          </div>
      </div>
    </div>
  );
};