import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ShoutBubble Component
 * แสดงกล่องคำพูด (Speech Bubble) เหนือหัวตัวละครหรือศัตรู
 * @param {string|null|undefined} text - ข้อความที่ต้องการแสดง ถ้าไม่มีจะไม่เรนเดอร์คอมโพเนนต์
 */
export const ShoutBubble = ({ text }) => {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          style={{
            backgroundColor: "white",
            color: "#333",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            border: "2px solid #000",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            position: "relative", // เปลี่ยนเป็น relative เพื่อให้สามเหลี่ยมอ้างอิงตำแหน่งได้ถูกต้อง
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {text}
          
          {/* สามเหลี่ยมชี้ลง (Tail) */}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #000",
            }}
          />
          {/* ส่วนไส้ในของสามเหลี่ยม (สีขาว) เพื่อให้ดูเหมือนเป็นกรอบเดียวกัน */}
          <div
            style={{
              position: "absolute",
              bottom: "-5px",
              left: "50%",
              transform: "translateX(-50%)",
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid white",
              zIndex: 1,
            }}
          />
        </motion.div>
      )} 
    </AnimatePresence>
  );
};