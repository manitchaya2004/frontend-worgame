import React from "react";
import { motion } from "framer-motion";
import { getLetterDamage } from "../../../../const/letterValues";
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

const calculateRawValue = (word, strMod) => {
  if (!word) return 0;
  return word
    .split("")
    .reduce((acc, char) => acc + getLetterDamage(char, strMod), 0);
};

/**
 * แสดงผล DMG/DEF 
 * ปรับปรุง: ถ้าค่าลงตัวพอดี หรือโอกาสปัดขึ้นเป็น 0% จะแสดงแค่ค่าเดียว
 */
const formatSubLabel = (
  type, // "DMG" หรือ "DEF"
  lowValue,
  lowChance,
  highValue,
  highChance,
  highColor = "#4cd137",
  lowColor = "#ff7675"
) => {
  // กรณีเลขลงตัวพอดี หรือไม่มีโอกาสปัดขึ้น
  if (lowValue === highValue || highChance <= 0) {
    return ( <>
      <span style={{ fontSize: "11px", fontWeight: "bold" }}>

        <span style={{color: "#00ffcc"}}>{type}: </span>
      <span style={{color: "#eae133" }}>
        {lowValue}
        {/* (100%) */}
      </span>
      </span>
      </>
    );
  }

  // กรณีมีเศษและมีการสุ่ม
  return (
    <span style={{ fontSize: "11px", fontWeight: "bold" }}>
      <span style={{color: "#50d3dc" }} >{type}: </span>
      <span style={{color: "#eae133" }}>
        {lowValue}
        {/* ({lowChance}%) */}
      </span>
      <span style={{color: "#aaa" }}>-</span>
      <span style={{color: "#eae133" }}>
        {highValue}
        {/* ({highChance}%) */}
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
          background: `linear-gradient(90deg, ${color}44 0%, transparent 100%)`,
          borderLeft: `4px solid ${color}`,
          zIndex: 1
        }}
      />
    )}

    <div
      style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        paddingLeft: "20px",
        width: "100%",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "36px",
          height: "36px",
          background: disabled ? "#222" : "#2a1e15",
          border: `2px solid ${disabled ? "#444" : "#8a6d3b"}`,
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "15px",
          fontSize: "20px",
          color: disabled ? "#555" : "#fff",
          boxShadow: highlight && !disabled ? `0 0 10px ${color}` : "none"
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div
          style={{
            fontSize: "15px",
            fontWeight: "bold",
            color: disabled ? "#444" : (highlight ? "#fff" : "#c2a37d"),
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontFamily: "serif",
            textShadow: "2px 2px 2px #000"
          }}
        >
          {label}
        </div>
        {subLabel && (
          <div style={{ fontFamily: "monospace" }}>
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

  // คำนวณค่าดิบ
  const rawDmg = calculateRawValue(wordText, playerData.atk);
  const rawDef = hasWord ? (wordText.length * 1.5) : 0;

  /**
   * Logic: คำนวณโอกาส %
   * ถ้าไม่มีเศษ (decimal === 0) โอกาส High จะเป็น 0 ทันที (Luck ไม่ถูกนำมาคิด)
   */
  const getChance = (val) => {
    const decimal = val % 1;
    if (decimal === 0) return 0; // เลขลงตัวพอดี ไม่สุ่มปัดเศษ
    
    return Math.min(
      100,
      Math.round((decimal) * 100)
    );
  };

  const dmgChanceHigh = getChance(rawDmg);
  const dmgChanceLow = 100 - dmgChanceHigh;

  const defChanceHigh = getChance(rawDef);
  const defChanceLow = 100 - defChanceHigh;

  return (
    <div
      style={{
        margin: "4px",
        background: "#1a120b",
        border: "4px solid #3d2b1f",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: "0 0 20px rgba(0,0,0,0.8)",
        width: "25%",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#3d2b1f",
          padding: "8px 0",
          borderBottom: "2px solid #5c4033",
          display: "flex",
          alignItems: "center",
          paddingLeft: "20px",
        }}
      >
        <div
          style={{
            color: "#d4af37",
            fontSize: "13px",
            fontWeight: "bold",
            letterSpacing: "5px",
            textTransform: "uppercase",
          }}
        >
          ⚔ COMMANDS
        </div>
      </div>

      {/* Buttons Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "10px 0",
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
                  Math.floor(rawDmg),
                  dmgChanceLow,
                  Math.ceil(rawDmg),
                  dmgChanceHigh
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
                  Math.floor(rawDef),
                  defChanceLow,
                  Math.ceil(rawDef),
                  defChanceHigh,
                  "#4facfe",
                  "#aaa"
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
          label="SPIN"
          icon={<GiRollingDices />}
          subLabel={`MANA: ${playerData.rp}`}
          color="#f1c40f"
          disabled={!isPlayerTurn || playerData.rp <= 0}
          highlight={isPlayerTurn && playerData.rp > 0}
          onClick={onSpinClick}
        />

        {/* PASS BUTTON */}
        <FantasyListButton
          label="PASS"
          icon={<GiSandsOfTime />}
          color="#7f8c8d"
          disabled={!isPlayerTurn}
          highlight={isPlayerTurn}
          onClick={onEndTurnClick}
        />
      </div>
    </div>
  );
};