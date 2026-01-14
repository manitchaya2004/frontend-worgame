import React from "react";
import { motion } from "framer-motion";
import { getLetterDamage } from "../../../../const/letterValues";
import {
  GiBroadsword,
  GiShield,
  GiRollingDices,
  GiSandsOfTime
} from "react-icons/gi";

/* =========================
   Helper Functions
========================= */
const getStatBonus = (val) => Math.max(0, val - 10);

const calculateRawValue = (word, strMod) => {
  if (!word) return 0;
  return word
    .split("")
    .reduce((acc, char) => acc + getLetterDamage(char, strMod), 0);
};

/**
 * แสดงผลแบบ 1(21%) - 2(79%)
 */
const formatSubLabel = (
  lowValue,
  lowChance,
  highValue,
  highChance,
  highColor = "#4cd137",
  lowColor = "#ff7675"
) => {
  return (
    <span style={{ fontSize: "11px", fontWeight: "bold" }}>
      <span style={{ color: lowColor }}>
        {lowValue} ({lowChance}%)
      </span>
      <span style={{ margin: "0 4px", color: "#aaa" }}>-</span>
      <span style={{ color: highColor }}>
        {highValue} ({highChance}%)
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
          <div
            style={{
              fontSize: "11px",
              color: disabled ? "#333" : "#00ffcc",
              fontWeight: "bold",
              fontFamily: "monospace"
            }}
          >
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
  store,
  onAttackClick,
  onShieldClick,
  onSpinClick,
  onEndTurnClick
}) => {
  const { playerData, gameState, validWordInfo } = store;
  const isPlayerTurn = gameState === "PLAYERTURN";
  const hasWord = !!validWordInfo;

  const strBonus = getStatBonus(playerData.stats?.STR || 10);
  const luckBonus = getStatBonus(playerData.stats?.LUCK || 10);
  const wordText = validWordInfo?.word || "";

  const rawDmg = calculateRawValue(wordText, strBonus);
  const rawDef = hasWord ? wordText.length * 1.5 + strBonus : 0;

  // chance คำนวณรวม
  const chanceHigh = Math.min(
    100,
    Math.round(((rawDmg % 1) + luckBonus * 0.02) * 100)
  );
  const chanceLow = 100 - chanceHigh;

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

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "10px 0",
        }}
      >
        <FantasyListButton
          label="STRIKE"
          icon={<GiBroadsword />}
          subLabel={
            hasWord
              ? formatSubLabel(
                  Math.floor(rawDmg),
                  chanceLow,
                  Math.ceil(rawDmg),
                  chanceHigh
                )
              : null
          }
          color="#e63946"
          disabled={!isPlayerTurn || !hasWord}
          highlight={isPlayerTurn && hasWord}
          onClick={onAttackClick}
        />

        <FantasyListButton
          label="GUARD"
          icon={<GiShield />}
          subLabel={
            hasWord
              ? formatSubLabel(
                  Math.floor(rawDef),
                  chanceLow,
                  Math.ceil(rawDef),
                  chanceHigh,
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

        <FantasyListButton
          label="SPIN"
          icon={<GiRollingDices />}
          subLabel={`MANA: ${playerData.rp}`}
          color="#f1c40f"
          disabled={!isPlayerTurn || playerData.rp <= 0}
          highlight={isPlayerTurn && playerData.rp > 0}
          onClick={onSpinClick}
        />

        <FantasyListButton
          label="PASS"
          icon={<GiSandsOfTime />}
          color="#7f8c8d"
          disabled={!isPlayerTurn}
          highlight={true}
          onClick={onEndTurnClick}
        />
      </div>
    </div>
  );
};
