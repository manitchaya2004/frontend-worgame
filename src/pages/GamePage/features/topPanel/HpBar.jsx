import React from "react";

/**
 * HpBar Component
 * @param {number} hp - พลังชีวิตปัจจุบัน
 * @param {number} max - พลังชีวิตสูงสุด
 * @param {string} color - สีของแถบ HP (เช่น #ff4d4d สำหรับศัตรู, #4dff8b สำหรับผู้เล่น)
 */
export function HpBar({ hp, max, color }) {
  // คำนวณเปอร์เซ็นต์ โดยจำกัดค่าให้อยู่ระหว่าง 0 - 100
  const percent = Math.max(0, Math.min(100, (hp / max) * 100));

  return (
    <div
      style={{
        position: "relative",
        width: "70%", 
        height: "100%", 
        background: "#333",
        border: "2px solid #000",
        borderRadius: "4px",
        overflow: "hidden",
        boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Bar Fill (ส่วนที่แสดงสีตาม HP ที่เหลือ) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${percent}%`,
          background: color,
          transition: "width 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3)",
        }}
      />

      {/* Text Overlay (ตัวเลข HP/Max) */}
      <span
        style={{
          position: "relative",
          fontSize: "9px",
          fontWeight: "900",
          color: "#fff",
          textShadow: "1px 1px 0 #000",
          zIndex: 5,
          lineHeight: 1,
          fontFamily: "monospace, sans-serif"
        }}
      >
        {/* แสดงทศนิยม 1 ตำแหน่ง และเอา 0 ที่ไม่จำเป็นออก */}
        {parseFloat(hp.toFixed(1))}/{max}
      </span>
    </div>
  );
}