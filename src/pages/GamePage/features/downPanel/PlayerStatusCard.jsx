import React from "react";
import { motion } from "framer-motion";
import {
  GiHearts,
  GiStarShuriken,
  GiWalkingBoot,
  GiBroadsword,
  GiBrain,
  GiCheckedShield,
} from "react-icons/gi";
import { useGameStore } from "../../../../store/useGameStore";

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

export const PlayerStatusCard = () => {
  // 🟢 ดึงข้อมูลทั้งหมดจาก playerData เลย ไม่ต้องคำนวณใหม่
  const store = useGameStore();
  const { playerData, accumulatedExp } = store;
  const { 
      name, 
      hp, max_hp, 
      shield, 
      atk,          // ค่า ATK (Bonus) ที่คำนวณมาแล้ว
      speed,        // ค่า Speed
      unlockedSlots,// ค่า Slot
  } = playerData;

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
            {name.toUpperCase()}
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
          {shield}
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
          animate={{ width: `${(hp / max_hp) * 100}%` }}
          style={{
            height: "100%",
            background: "linear-gradient(180deg,#ff6b6b,#c0392b,#7f1d1d)",
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
          {hp} / {max_hp}
        </div>
      </div>

{/* ===== Stats ===== */}
      <div
        style={{
          display: "grid",
          // 🔴 แก้ตรงนี้: มี StatItem 4 อัน ก็ใส่แค่ 4 พอครับ มันจะเฉลี่ยเต็มพื้นที่พอดี
          gridTemplateColumns: "repeat(4, 1fr)", 
          
          gap: "8px", // ขยับ Gap ให้ห่างขึ้นนิดนึงดูสบายตา
          width: "100%", // บังคับให้ Grid กว้างเต็มพื้นที่พ่อ
          
          // จัดให้ของในแต่ละช่อง อยู่กึ่งกลางทั้งแนวตั้งและแนวนอน
          justifyItems: "center", 
          alignItems: "center",
        }}
      >
        <StatItem
          icon={<GiHearts />}
          label="HP"
          value={max_hp}
          color="#ff6b6b"
        />
        <StatItem
          icon={<GiBrain />}
          label="SLOT"
          value={unlockedSlots}
          color="#74b9ff"
        />
        <StatItem
          icon={<GiBroadsword />}
          label="ATK"
          // โชว์ค่าที่คำนวณมาแล้ว
          value={`+${(atk).toFixed(2)}`} 
          color="#ff7675"
        />
        <StatItem
          icon={<GiWalkingBoot />}
          label="SPD"
          value={`${speed-1}-${speed+1}`}
          color="#feca57"
        />
      </div>
    </div>
  );
};