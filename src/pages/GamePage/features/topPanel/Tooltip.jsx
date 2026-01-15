import React from "react";
// ตรวจสอบ path รูปภาพให้ถูกต้องตามโปรเจคของคุณ
import arrowImg from "../../../../assets/icons/arrowDown.png"; 

export const Tooltip = ({ target }) => {
  // ถ้าไม่มี target ส่งมา (เป็น null) ไม่ต้องแสดงผล
  if (!target) return null;

  // กำหนดตำแหน่งความสูง (Top)
  let topPos = "50%"; // ค่าเริ่มต้นสำหรับ Monster ปกติ
  let arrowColorFilter = ""; // ฟิลเตอร์สี (เผื่ออยากเปลี่ยนสีลูกศร)

  if (target.isBoss) {
    topPos = "40%"; // บอสตัวใหญ่ ลูกศรอยู่สูงขึ้น
  } else if (target.isPlayer) {
    topPos = "55%"; // ผู้เล่น (ปรับให้พอดีกับหัวตัวละคร)
    // (Optional) ถ้าอยากให้ลูกศรชี้ผู้เล่นเป็นสีอื่น เช่น สีทอง
    // arrowColorFilter = "hue-rotate(45deg) brightness(1.2)"; 
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${target.x}%`, // ใช้ค่า X จาก target ที่ส่งมา
        top: topPos,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
        pointerEvents: "none",
        animation: "floatArrow 1s ease-in-out infinite",
        filter: `drop-shadow(0 4px 4px rgba(0,0,0,0.6)) ${arrowColorFilter}`,
      }}
    >
      <img
        src={arrowImg}
        alt="tooltip-arrow"
        style={{
          width: "24px",  // ปรับขนาดให้เห็นชัดขึ้นเล็กน้อย
          height: "24px",
          imageRendering: "pixelated",
        }}
      />

      {/* Keyframes Animation */}
      <style>
        {`
          @keyframes floatArrow {
            0%   { transform: translate(-50%, -100%) translateY(0); }
            50%  { transform: translate(-50%, -100%) translateY(10px); }
            100% { transform: translate(-50%, -100%) translateY(0); }
          }
        `}
      </style>
    </div>
  );
};