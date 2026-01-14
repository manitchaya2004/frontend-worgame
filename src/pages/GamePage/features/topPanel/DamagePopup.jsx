import { motion, AnimatePresence } from "framer-motion";

export const DamagePopup = ({ popups, removePopup }) => {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            // 🎬 ตั้งค่า Animation ให้ "ชัดและนาน"
            initial={{ opacity: 0, scale: 0.5, y: 0 }} 
            animate={{ 
              opacity: [0, 1, 1, 0], // จางเข้า -> สว่างค้างไว้ -> จางออก
              scale: [0.5, 1.3, 1],  // เอฟเฟกต์เด้งตอนโผล่ (Punchy)
              y: -150                // ลอยสูงขึ้นกว่าเดิมเพื่อให้เห็นชัด
            }}
            exit={{ opacity: 0 }}
            // ⏱️ เพิ่ม duration เป็น 1.5 - 2.0 วินาทีตามต้องการ
            transition={{ 
              duration: 1.8, 
              ease: "easeOut",
              times: [0, 0.1, 0.8, 1] // ช่วงเวลาที่ให้ Opacity ค้างไว้ (0.1 ถึง 0.8 คือช่วงที่สว่างชัด)
            }}
            onAnimationComplete={() => removePopup(p.id)}
            style={{
              position: "absolute",
              left: `${p.x}%`, 
              bottom: "25%", 
              // 🎨 ใช้สีจาก p.color ถ้าไม่มีให้ใช้ Logic สีเดิม
              color: p.color ? p.color : (p.value === "MISSED!" || p.value === "YOUR TURN" ? "#fff" : p.isPlayer ? "#ff4d4d" : "#f1c40f"),
              fontSize: p.fontSize ? p.fontSize : (p.isPlayer ? "36px" : "32px"), // ขยายขนาดให้ใหญ่ขึ้น
              fontWeight: "900",
              // 🌑 ใส่เงาหลายชั้นเพื่อให้ตัวหนังสือ "ชัด" ไม่ว่าจะอยู่บนพื้นหลังสีอะไร (Stroke Effect)
              textShadow: `
                3px 3px 0 #000, 
                -3px -3px 0 #000, 
                3px -3px 0 #000, 
                -3px 3px 0 #000,
                0px 4px 10px rgba(0,0,0,0.5)
              `,
              whiteSpace: "nowrap",
              textAlign: "center",
              transform: "translateX(-50%)",
              fontFamily: "'Press Start 2P', cursive, sans-serif",
              zIndex: 100,
            }}
          >
            {/* ตรวจสอบประเภทข้อมูล ถ้าเป็นตัวเลขและ > 0 ให้ใส่เครื่องหมาย - หรือ + ตามความเหมาะสม */}
            {typeof p.value === "number" && p.value > 0 ? `-${p.value}` : p.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};