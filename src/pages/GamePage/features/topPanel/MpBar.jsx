import React from "react";

export function MpBar({ mp, max, color = "#3b82f6" }) {
  // คำนวณเปอร์เซ็นต์
  const percent = Math.max(0, Math.min(100, (mp / max) * 100));

  return (
    <div
      style={{
        position: "relative",
        width: "70px",       // เท่ากับความกว้างของ HpBar
        height: "8px",       // เพิ่มความสูงจาก 3px เป็น 8px ให้มองเห็นชัดขึ้น
        background: "rgba(0, 0, 0, 0.5)", // พื้นหลังจางลงหน่อยเพื่อให้หลอดเด่น
        border: "1.5px solid #000",      // ลดความหนาเส้นขอบลงเล็กน้อย
        borderRadius: "4px",             // ปรับให้มนรอบด้านเพื่อความสวยงาม
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
      }}
    >
      {/* ส่วนของแถบสีมานา */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${percent}%`,
          background: color,
          transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)", // ปรับ Transition ให้สมูทขึ้น
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.4)",   // เพิ่มแสงสะท้อนด้านบนหลอด
        }}
      />
      
      {/* เพิ่มเส้นขีดจางๆ เพื่อให้ดูเป็นหลอดเกม (Optional) */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
          backgroundSize: "20% 100%",
          pointerEvents: "none"
        }}
      />
    </div>
  );
}