import React from "react";
import { motion } from "framer-motion";
import {
  GiBroadsword,
  GiShield,
  GiStarsStack,
  GiSandsOfTime
} from "react-icons/gi";
import { useGameStore } from "../../../../store/useGameStore";

const formatSubLabel = (text) => {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "flex-start",
      width: "100%",
      marginTop: "2px" 
    }}>
      <span style={{ 
        fontSize: "10px", // ขยายกลับมานิดนึงให้อ่านง่าย
        fontWeight: "normal",
        color: "#bdc3c7",
        fontFamily: "sans-serif",
        fontStyle: "normal",
        letterSpacing: "0.5px",
        lineHeight: "1"
      }}>
        {text}
      </span>
    </div>
  );
};

const FantasyListButton = ({
  label,
  subLabel,
  color,
  icon,
  onClick,
  disabled,
  highlight
}) => (
  <motion.button
    whileHover={!disabled ? { x: 8, filter: "brightness(1.2)" } : {}}
    whileTap={!disabled ? { x: 4 } : {}}
    onClick={onClick}
    disabled={disabled}
    style={{
      position: "relative",
      border: "none",
      background: "transparent",
      width: "100%",
      height: "54px", // 🌟 ปรับเพิ่มความสูงเป็น 54px เพื่อให้รวมแล้วเท่ากล่องซ้าย
      cursor: disabled ? "not-allowed" : "pointer",
      padding: 0,
      display: "flex",
      alignItems: "center",
      borderRadius: "6px" 
    }}
  >
    {highlight && !disabled && (
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, ${color}66 0%, transparent 100%)`,
          borderLeft: `4px solid ${color}`,
          zIndex: 1,
          borderRadius: "6px",
          boxShadow: `inset 0 0 15px ${color}88, 0 0 10px ${color}44`
        }}
      />
    )}

    <div
      style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        paddingLeft: "12px", 
        width: "100%",
      }}
    >
      <motion.div
        animate={highlight && !disabled ? { 
          scale: [1, 1.15, 1],
          boxShadow: [`0 0 5px ${color}44`, `0 0 15px ${color}`, `0 0 5px ${color}44`]
        } : {}}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        style={{
          width: "36px", // ขยายกล่องไอคอนให้รับกับปุ่มที่สูงขึ้น
          height: "36px", 
          background: disabled ? "rgba(30,30,30,0.5)" : "rgba(0,0,0,0.6)",
          border: `1px solid ${disabled ? "#444" : (highlight ? color : "#4d3a2b")}`,
          borderRadius: "6px", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "14px", 
          fontSize: "18px", // ขยายไอคอน
          color: disabled ? "#555" : (highlight ? "#fff" : color), 
          flexShrink: 0
        }}
      >
        {icon}
      </motion.div>

      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center",
        alignItems: "flex-start", 
        width: "100%", 
        overflow: "hidden" 
      }}>
        <div
          style={{
            fontSize: "14px", // ขยายขนาดตัวหนังสือกลับขึ้นมาให้สมดุล
            fontWeight: "bold",
            color: disabled ? "#555" : (highlight ? "#fff" : "#c2a37d"),
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: "sans-serif",
            textShadow: disabled ? "none" : "1px 1px 2px #000",
            lineHeight: "1.2"
          }}
        >
          {label}
        </div>
        
        {subLabel && (
          <div style={{ width: "100%" }}>
            {formatSubLabel(subLabel)}
          </div>
        )}
      </div>
    </div>
  </motion.button>
);

export const ActionControls = ({
  onAttackClick,
  onShieldClick,
  onSkillClick,
  onEndTurnClick
}) => {
  const store = useGameStore();
  const { playerData, gameState, validWordInfo } = store;
  const isPlayerTurn = gameState === "PLAYERTURN";
  const hasWord = !!validWordInfo;

  const { ability, mana } = playerData;
  const skillName = ability?.code || "SKILL"; 
  const skillCost = ability?.cost || 0;
  const skillDesc = ability?.description || ""; 
  const isManaEnough = mana >= skillCost;

  return (
    <div
      style={{
        width: "25%",
        background: "#0c0a09", 
        border: "2px solid #3d2e24", 
        borderRadius: "8px", 
        boxShadow: "0 4px 20px rgba(0,0,0,0.6), inset 0 0 15px rgba(61,46,36,0.1)", 
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        height: "fit-content" 
      }}
    >
      <div
        style={{
          display: "flex", 
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #3d2e24", 
          paddingBottom: "8px",
          marginBottom: "2px" // เพิ่มระยะห่างนิดหน่อยให้สวยงาม
        }}
      >
        <div
          style={{
            color: "#d4af37", 
            fontSize: "16px",
            fontWeight: "900",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            fontFamily: "sans-serif"
          }}
        >
          ACTION
        </div>
        <div style={{ fontSize: "11px", color: isPlayerTurn ? "#4cd137" : "#888", fontWeight: "bold" }}>
            {isPlayerTurn ? "● ACTIVE" : "○ WAITING"}
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "6px" // 🌟 เพิ่มช่องว่างระหว่างปุ่มเป็น 6px เพื่อดันให้เต็มพอดี
      }}> 
        <FantasyListButton
          label="STRIKE"
          icon={<GiBroadsword />}
          subLabel="Deal damage to enemy"
          color="#e63946"
          disabled={!isPlayerTurn || !hasWord}
          highlight={isPlayerTurn && hasWord}
          onClick={onAttackClick}
        />
        
        <FantasyListButton
          label="GUARD"
          icon={<GiShield />}
          subLabel="Gain shield to yourself"
          color="#4361ee"
          disabled={!isPlayerTurn || !hasWord}
          highlight={isPlayerTurn && hasWord}
          onClick={onShieldClick}
        />

        <FantasyListButton
          label={"SKILL"}
          icon={<GiStarsStack />}
          subLabel={"Deal double damage to enemy"}
          color="#9b59b6" 
          disabled={!isPlayerTurn || !isManaEnough || !hasWord} 
          highlight={isPlayerTurn && isManaEnough && hasWord} 
          onClick={onSkillClick}
        />

        <FantasyListButton
          label="PASS"
          icon={<GiSandsOfTime />}
          color="#95a5a6"
          disabled={!isPlayerTurn}
          highlight={false}
          onClick={onEndTurnClick}
          subLabel="Shuffle and end turn"
        />
      </div>
    </div>
  );
};