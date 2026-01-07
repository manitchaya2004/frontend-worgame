import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BattleLog Component
 * แสดงประวัติการต่อสู้และเหตุการณ์ต่างๆ ในเกม
 * @param {Array} logs - รายการ Log { id, type, timestamp, message, combat }
 */
export const BattleLog = ({ logs }) => {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom เมื่อมี Log ใหม่เข้ามา
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // ฟังก์ชันเลือกสีและไอคอนตามประเภทของเหตุการณ์
  const getLogStyle = (type) => {
    switch (type) {
      case "combat":
        return { bg: "#4a2c2c", border: "#ff7675", icon: "⚔️" }; // แดงเข้ม
      case "success":
        return { bg: "#2d4a3e", border: "#00b894", icon: "✅" }; // เขียวเข้ม
      case "danger":
        return { bg: "#572b2b", border: "#ff4757", icon: "💀" }; // แดงเลือดหมู
      case "warning":
        return { bg: "#5e4e24", border: "#fdcb6e", icon: "⚠️" }; // เหลืองทอง
      case "special":
        return { bg: "#3c2c5e", border: "#a29bfe", icon: "✨" }; // ม่วง
      default:
        return { bg: "#2d3436", border: "#74b9ff", icon: "ℹ️" }; // เทา/ฟ้า
    }
  };

  return (
    <div
      style={{
        boxSizing: "border-box",
        flex: 1,
        height: "100%",
        background: "#1e1e1e",
        border: "3px solid #5c4033",
        borderRadius: "8px",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.9)",
        overflow: "hidden",
        fontFamily: "'Courier New', monospace",
        minWidth: "240px",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "2px dashed #555",
          marginBottom: "10px",
          paddingBottom: "5px",
          color: "#ccc",
          fontWeight: "bold",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontSize: "14px",
        }}
      >
        📜 Battle Log
      </div>

      {/* Log Area */}
      <div
        className="custom-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            const style = getLogStyle(log.type);

            return (
              <motion.div
                key={log.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                style={{
                  background: style.bg,
                  borderLeft: `4px solid ${style.border}`,
                  borderRadius: "6px",
                  padding: "8px 10px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
                  position: "relative",
                  color: "#eee",
                  fontSize: "12px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Time & Icon Wrapper */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                    opacity: 0.6,
                    fontSize: "10px",
                  }}
                >
                  <span>
                    {style.icon} {log.type.toUpperCase()}
                  </span>
                  <span>
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour12: false,
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>

                {/* Log Content Section */}
                {log.type === "combat" && log.combat ? (
                  <div>
                    <div>
                      <span style={{ color: "#74b9ff", fontWeight: "bold" }}>
                        {log.combat.attacker}
                      </span>{" "}
                      ใช้{" "}
                      <span style={{ color: "#ffeaa7", fontWeight: "bold" }}>
                        [{log.combat.skill}]
                      </span>
                    </div>
                    <div style={{ marginTop: "2px" }}>
                      👉{" "}
                      <span style={{ color: "#ff7675" }}>
                        {log.combat.target}
                      </span>{" "}
                      โดน{" "}
                      <span
                        style={{
                          color: "#ff4757",
                          fontWeight: "bold",
                          fontSize: "13px",
                        }}
                      >
                        -{log.combat.damage}
                      </span>{" "}
                      HP
                    </div>
                  </div>
                ) : (
                  <div style={{ lineHeight: "1.4" }}>{log.message}</div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Invisible element to anchor the scroll */}
        <div ref={bottomRef} style={{ height: "1px" }} />
      </div>
    </div>
  );
};