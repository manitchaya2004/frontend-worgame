import React from "react";
import arrowImg from "../../../../assets/icons/arrowDown.png"; 

export const Tooltip = ({ hoveredEnemy }) => {
  if (!hoveredEnemy) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${hoveredEnemy.x }%`,
        top: hoveredEnemy.isBoss ? "40%" : "50%",
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
        pointerEvents: "none",
        animation: "floatArrow 1s ease-in-out infinite",
        filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.6))",
      }}
    >
      <img
        src={arrowImg}
        alt="tooltip-arrow"
        style={{
          width: "20px",
          height: "20px",
          imageRendering: "pixelated",
        }}
      />

      {/* keyframes ใส่ตรงนี้เลย จะได้ไม่ต้องไปยุ่งไฟล์อื่น */}
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
