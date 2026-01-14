import React from "react";
import { motion } from "framer-motion";
import {
  GiHearts,
  GiStarShuriken,
  GiMuscleUp,
  GiScrollUnfurled,
  GiCrystalBall,
  GiClover,
  GiCheckedShield,
} from "react-icons/gi";

const getStatBonus = (val) => Math.max(0, val - 10);

/* ===== Stat Item (Simplified) ===== */
const StatItem = ({ icon, label, value, color }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "rgba(0,0,0,0.35)",
      padding: "6px 8px",
      borderRadius: "6px",
    }}
  >
    <div style={{ fontSize: "14px", color }}>{icon}</div>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <span style={{ fontSize: "9px", color: "#888", letterSpacing: "1px" }}>
        {label}
      </span>
      <span style={{ fontSize: "13px", fontWeight: "900", color }}>
        {value}
      </span>
    </div>
  </div>
);

export const PlayerStatusCard = ({ store }) => {
  const { playerData, accumulatedExp } = store;
  const strBonus = getStatBonus(playerData.stats.STR || 10);
  const luckBonus = getStatBonus(playerData.stats.LUCK || 10);

  return (
    <div
      style={{
        width: "25%",
        background: "rgba(0,0,0,0.4)",
        border: "1px solid #4d3a2b",
        borderRadius: "10px",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* ===== Header ===== */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "900", color: "#f5d76e" }}>
            {playerData.name.toUpperCase()}
          </div>
          <div style={{ fontSize: "10px", color: "#aaa" }}>
            EXP {accumulatedExp || 0}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "900",
            color: "#fff",
          }}
        >
          <GiCheckedShield />
          {playerData.shield}
        </div>
      </div>

      {/* ===== HP Bar ===== */}
      <div
        style={{
          height: "22px",
          background: "#220000",
          borderRadius: "6px",
          position: "relative",
          overflow: "hidden",
          border: "1px solid #3d2b1f",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(playerData.hp / playerData.max_hp) * 100}%` }}
          style={{
            height: "100%",
            background:
              "linear-gradient(180deg,#ff6b6b,#c0392b,#7f1d1d)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "11px",
            fontWeight: "900",
            color: "#fff",
          }}
        >
          {playerData.hp} / {playerData.max_hp}
        </div>
      </div>

      {/* ===== Stats ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,2fr)",
          gap: "0px",
        }}
      >
        <StatItem
          icon={<GiHearts />}
          label="HP"
          value={playerData.max_hp}
          color="#ff6b6b"
        />
        <StatItem
          icon={<GiMuscleUp />}
          label="ATK"
          value={`+${(strBonus * 0.25).toFixed(2)}`}
          color="#ff7675"
        />
        <StatItem
          icon={<GiStarShuriken />}
          label="SPD"
          value={`${playerData.speed-1}-${playerData.speed+1}`}
          color="#feca57"
        />
        <StatItem
          icon={<GiScrollUnfurled />}
          label="SLOT"
          value={playerData.unlockedSlots}
          color="#74b9ff"
        />
        <StatItem
          icon={<GiCrystalBall />}
          label="RP"
          value={playerData.max_rp}
          color="#a29bfe"
        />
        <StatItem
          icon={<GiClover />}
          label="LCK"
          value={`+${luckBonus * 2}%`}
          color="#55efc4"
        />
      </div>
    </div>
  );
};
