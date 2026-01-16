import React from "react";

export const BossHpBar = ({ boss }) => {
  if (!boss || boss.hp <= 0) return null;

  const percent = Math.max(
    0,
    Math.min(100, (boss.hp / boss.max_hp) * 100)
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        maxWidth: "1000px",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      {/* === Boss Name === */}
      <div
        style={{
          position: "absolute",
          top: "-20px",                // 👈 ลอยอยู่เหนือหลอด
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "14px",
          fontWeight: "900",
          color: "#fff",
          textShadow: "2px 2px 0 #000",
          fontFamily: "monospace, sans-serif",
          letterSpacing: "1px",
          whiteSpace: "nowrap",
        }}
      >
        {boss.name}
      </div>

      {/* === HP Bar === */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "15px",
          background: "#333",
          border: "3px solid #000",
          borderRadius: "6px",
          overflow: "hidden",
          boxShadow: "0 3px 0 rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${percent}%`,
            background: "linear-gradient(90deg, #ff2d2d, #ff8080)",
            transition: "width 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)",
            boxShadow: "inset 0 2px 0 rgba(255,255,255,0.25)",
          }}
        />

        {/* HP Text */}
        <span
          style={{
            position: "relative",
            zIndex: 5,
            fontSize: "10px",
            fontWeight: "900",
            color: "#fff",
            textShadow: "1px 1px 0 #000",
            fontFamily: "monospace, sans-serif",
          }}
        >
          {Math.ceil(boss.hp)}/{boss.max_hp}
        </span>
      </div>
    </div>
  );
};
