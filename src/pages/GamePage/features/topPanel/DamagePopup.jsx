import { motion, AnimatePresence } from "framer-motion";

export const DamagePopup = ({ popups, removePopup }) => {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            // เปลี่ยนจากพิกัด Absolute เป็นพิกัดอ้างอิง
            initial={{ opacity: 1, y: 0 }} 
            animate={{ opacity: 0, y: -120 }} // พุ่งขึ้นฟ้า 120px
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => removePopup(p.id)}
            style={{
              position: "absolute",
              // ใช้ left เป็นเปอร์เซ็นต์ตามที่ store ส่งมา
              left: `${p.x}%`, 
              // ⚡️ สำคัญ: ใช้ bottom แทน top และคำนวณระยะห่างจากพื้น
              bottom: "25%", // ปรับตรงนี้ให้ตรงกับเท้าของ Player/Enemy
              fontSize: p.isPlayer ? "32px" : "28px",
              fontWeight: "900",
              color: p.value === "MISSED!" || p.value === "YOUR TURN" ? "#fff" : p.isPlayer ? "#ff4d4d" : "#f1c40f",
              textShadow: "3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
              whiteSpace: "nowrap",
              textAlign: "center",
              transform: "translateX(-50%)", // จัดให้อยู่กึ่งกลางตัวละคร
              fontFamily: "'Press Start 2P', cursive", // ถ้ามีฟอนต์แนวเกม
            }}
          >
            {typeof p.value === "number" && p.value > 0 ? `-${p.value}` : p.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};