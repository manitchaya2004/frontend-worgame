import React from "react";

export function MpBar({ mp, max, color = "#3b82f6" }) {
  // คำนวณเปอร์เซ็นต์
  const percent = Math.max(0, Math.min(100, (mp / max) * 100));

  return (
    <div
      style={{
        position: "relative",
        width: "70px",       // ปรับให้เท่ากับความกว้างของ HpBar
        height: "3px",       // ความสูงที่ต้องการ (บางกว่า HP)
        background: "#333",
        border: "2px solid #000",
        borderRadius: "0 0 4px 4px", // ให้ขอบล่างมน รับกับหลอด HP
        overflow: "hidden",
        boxShadow: "0 1px 0 rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${percent}%`,
          background: color,
          transition: "width 0.3s ease-out",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      />
    </div>
  );
}