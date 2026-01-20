import React from "react";
import { motion } from "framer-motion";
// ❌ ลบ import getLetterDamage ออก
import {
  GiBroadsword,
  GiShield,
  GiRollingDices,
  GiSandsOfTime
} from "react-icons/gi";
import { useGameStore } from "../../../../store/useGameStore";

/* =========================
   Helper Functions 
========================= */

// ✅ สร้าง Helper function ไว้ใช้คำนวณ Preview ในนี้
const getLetterDamage = (char, powerMap) => {
  if (!char || !powerMap) return 0;
  const upperChar = char.toUpperCase();
  const value = powerMap[upperChar];
  return value !== undefined ? Number(value) : 0;
};

const calculateRawValue = (word, powerMap) => {
  if (!word) return 0;
  return word
    .split("")
    .reduce((acc, char) => acc + getLetterDamage(char, powerMap), 0);
};

const formatSubLabel = (
  type,
  value,
) => {
  return (
    <span style={{ fontSize: "11px", fontWeight: "bold" }}>
      <span style={{color: type === "DMG" ? "#ff7675" : "#74b9ff"}}>{type}: </span>
      <span style={{color: "#eae133" }}>
        {value}
      </span>
    </span>
  );
};

/* =========================
   Fantasy List Button 
========================= */
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
      height: "54px",
      cursor: disabled ? "not-allowed" : "pointer",
      padding: 0,
      display: "flex",
      alignItems: "center",
      marginBottom: "4px"
    }}
  >
    {/* Active Bar */}
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
        paddingLeft: "10px",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          background: disabled ? "rgba(30,30,30,0.5)" : "rgba(0,0,0,0.6)",
          border: `1px solid ${disabled ? "#444" : "#4d3a2b"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "15px",
          fontSize: "20px",
          color: disabled ? "#555" : color, 
          boxShadow: highlight && !disabled ? `0 0 8px ${color}44` : "none"
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            color: disabled ? "#555" : (highlight ? "#fff" : "#c2a37d"),
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontFamily: "serif",
            textShadow: disabled ? "none" : "1px 1px 2px #000"
          }}
        >
          {label}
        </div>
        {subLabel && (
          <div style={{ fontFamily: "monospace", opacity: disabled ? 0.5 : 1 }}>
            {subLabel}
          </div>
        )}
      </div>
    </div>
  </motion.button>
);

/* =========================
   Action Controls Main
========================= */
export const ActionControls = ({
  onAttackClick,
  onShieldClick,
  onSpinClick,
  onEndTurnClick
}) => {
  const store = useGameStore();
  const { playerData, gameState, validWordInfo } = store;
  const isPlayerTurn = gameState === "PLAYERTURN";
  const hasWord = !!validWordInfo;

  const wordText = validWordInfo?.word || "";

  // ✅ เปลี่ยนจาก atk เป็น power
  const rawDmg = calculateRawValue(wordText, playerData.power);
  const rawDef = calculateRawValue(wordText, playerData.power);

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
          marginBottom: "4px"
        }}
      >
        <div
          style={{
            color: "#d4af37", 
            fontSize: "15px",
            fontWeight: "900",
            letterSpacing: "2px",
            textTransform: "uppercase",
            textShadow: "0 2px 0 #000"
          }}
        >
          COMMANDS
        </div>
        <div style={{ fontSize: "10px", color: isPlayerTurn ? "#4cd137" : "#888", fontWeight: "bold" }}>
            {isPlayerTurn ? "ACTIVE" : "WAITING"}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px"
        }}
      >
        {/* STRIKE BUTTON */}
        <FantasyListButton
          label="STRIKE"
          icon={<GiBroadsword />}
          subLabel={
            hasWord
              ? formatSubLabel(
                  "DMG",
                  rawDmg,
                )
              : null
          }
          color="#e63946"
          disabled={!isPlayerTurn || !hasWord}
          highlight={isPlayerTurn && hasWord}
          onClick={onAttackClick}
        />
        {/* GUARD BUTTON */}
        <FantasyListButton
          label="GUARD"
          icon={<GiShield />}
          subLabel={
            hasWord
              ? formatSubLabel(
                  "DEF",
                  rawDef,
                )
              : null
          }
          color="#4361ee"
          disabled={!isPlayerTurn || !hasWord}
          highlight={isPlayerTurn && hasWord}
          onClick={onShieldClick}
        />
        {/* SPIN BUTTON */}
        <FantasyListButton
          label="REROLL" 
          icon={<GiRollingDices />}
          color="#f1c40f"
          onClick={onSpinClick}
        />
        {/* PASS BUTTON */}
        <FantasyListButton
          label="PASS"
          icon={<GiSandsOfTime />}
          color="#95a5a6"
          disabled={!isPlayerTurn}
          highlight={isPlayerTurn}
          onClick={onEndTurnClick}
          subLabel={
            <span style={{ fontSize: "10px", color: "#666" }}>END TURN</span>
          }
        />
      </div>
    </div>
  );
};