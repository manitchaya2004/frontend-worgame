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
        fontSize: "10px", 
        fontWeight: "normal",
        color: "#bdc3c7",
        fontFamily: "sans-serif",
        fontStyle: "normal",
        letterSpacing: "0.5px"
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
      height: "58px",
      cursor: disabled ? "not-allowed" : "pointer",
      padding: 0,
      display: "flex",
      alignItems: "center",
      marginBottom: "4px"
    }}
  >
    {highlight && !disabled && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, ${color}33 0%, transparent 100%)`,
          borderLeft: `3px solid ${color}`,
          zIndex: 1,
          borderRadius: "4px"
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
      <div
        style={{
          width: "38px",
          height: "38px",
          background: disabled ? "rgba(30,30,30,0.5)" : "rgba(0,0,0,0.6)",
          border: `1px solid ${disabled ? "#444" : "#4d3a2b"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "15px",
          fontSize: "20px",
          color: disabled ? "#555" : color, 
          boxShadow: highlight && !disabled ? `0 0 10px ${color}66` : "none",
          flexShrink: 0
        }}
      >
        {icon}
      </div>

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
            fontSize: "15px",
            fontWeight: "bold",
            color: disabled ? "#555" : (highlight ? "#fff" : "#c2a37d"),
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: "sans-serif",
            textShadow: disabled ? "none" : "1px 1px 2px #000"
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
        background: "rgba(0,0,0,0.5)",
        border: "1px solid #4d3a2b",
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
          borderBottom: "1px solid #4d3a2b",
          paddingBottom: "8px",
          marginBottom: "6px"
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

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
          label={skillName} 
          icon={<GiStarsStack />}
          color="#9b59b6" 
          disabled={!isPlayerTurn || !isManaEnough || !hasWord} 
          highlight={isPlayerTurn && isManaEnough && hasWord}
          onClick={onSkillClick}
          subLabel={skillDesc || "Use special ability"}
        />

        <FantasyListButton
          label="PASS"
          icon={<GiSandsOfTime />}
          color="#95a5a6"
          disabled={!isPlayerTurn}
          highlight={isPlayerTurn}
          onClick={onEndTurnClick}
          subLabel="Shuffle and end turn"
        />
      </div>
    </div>
  );
};