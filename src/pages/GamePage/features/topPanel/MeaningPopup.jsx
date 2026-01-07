import React from "react";
import { motion } from "framer-motion";

/**
 * MeaningPopup Component
 * แสดงความหมายของคำศัพท์ที่ผู้เล่นประกอบร่างได้สำเร็จ
 * @param {string} meaning - ความหมายของคำศัพท์ที่ต้องการแสดง
 */
export const MeaningPopup = ({ meaning }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "30%",
        left: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        pointerEvents: "none", // ป้องกันไม่ให้บังการคลิกศัตรู
      }}
    >
      {/* ส่วนเว้นระยะเผื่อความสวยงาม */}
      <div style={{ height: "65px" }} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.85, y: 0 }}
        exit={{ opacity: 0 }}
        style={{
          background: "rgba(244, 228, 188)",
          border: "2px solid #5c4033",
          padding: "10px 25px",
          borderRadius: "4px",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "#8d6e63",
            fontWeight: "bold",
            textTransform: "uppercase",
            display: "block", // ปรับเป็น block เพื่อให้ <br /> ทำงานได้ดีขึ้น
          }}
        >
          — Meaning —
        </span>
        <span
          style={{
            fontSize: "16px",
            color: "#3e2723",
            fontWeight: "bold",
          }}
        >
          {meaning}
        </span>
      </motion.div>
    </div>
  );
};