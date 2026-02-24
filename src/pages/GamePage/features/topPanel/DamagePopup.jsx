import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 🌟 แยก Component ย่อยเพื่อจัดการ Animation รายตัว
const SingleRORPopup = ({ popup, removePopup }) => {
  const isNumber = typeof popup.value === "number";
  const isHeal = popup.color === "#2ecc71" || (isNumber && popup.value > 0 && popup.isPlayer); // เช็คว่าเป็นฮีลหรือไม่ (จากสี หรือ logic)

  // จัดการเครื่องหมาย + หรือ - ตามสไตล์ RO
  let displayText = popup.value;
  if (isNumber) {
      if (isHeal) {
          displayText = `+${popup.value}`; // ฮีลมี +
      } else if (popup.value > 0) {
          displayText = `${popup.value}`; // ดาเมจปกติใน RO มักไม่มีเครื่องหมายลบ (หรือถ้าอยากได้ก็ใส่ - ตรงนี้)
      }
  }

  // สุ่มตำแหน่ง X เล็กน้อยเพื่อให้ตัวเลขไม่ทับกันเป๊ะๆ เวลาเด้งรัวๆ
  const randomXOffset = useMemo(() => (Math.random() - 0.5) * 40, []);

  // 🎨 กำหนดสีตามสไตล์ RO
  let finalColor = popup.color;
  if (!finalColor) {
      if (popup.value === "MISSED!") finalColor = "#ff0000"; // Miss สีแดง
      else if (isHeal) finalColor = "#00ff00"; // Heal สีเขียวสด
      else if (isNumber) finalColor = "#ff0000"; // Damage ปกติสีแดงสด
      else finalColor = "#ffffff"; // ข้อความอื่นๆ สีขาว
  }

  return (
    <motion.div
      layout // ช่วยจัดระเบียบถ้ามีหลายอัน
      initial={{ 
        opacity: 1, 
        scale: 0.8, 
        y: 20, // เริ่มต้นต่ำกว่าจุดจริงนิดหน่อย
        x: `calc(-50% + ${randomXOffset}px)` 
      }}
      animate={{
        opacity: [1, 1, 1, 0],
        scale: [1.5, 1.0, 1.0, 0.8], // เด้งใหญ่สุด -> หดมาปกติ -> ค้างไว้ -> เล็กลงตอนหาย
        // 🌟 หัวใจสำคัญของ RO Motion: เด้งขึ้นสูงเร็วๆ -> ตกลงมานิดนึงเหมือนมีแรงโน้มถ่วง -> ค่อยๆ ไหลลงต่อแล้วหายไป
        y: [0, -90, -65, -80],  
      }}
      transition={{
        // 🌟 ปรับเวลาให้อยู่นานขึ้นเป็น 2.0 วินาที (จากเดิม 1.0)
        duration: 2.0, 
        ease: "easeOut",
        // 🌟 ปรับจังหวะให้ค้างนานขึ้น: 
        // 0.08 แรกคือตอนเด้ง (ไวมาก), จาก 0.08 ถึง 0.85 คือช่วงที่ตัวเลขลอยค้างนิ่งๆ ให้อ่าน, 0.85-1 คือตอนจางหาย
        times: [0, 0.08, 0.85, 1], 
      }}
      onAnimationComplete={() => removePopup(popup.id)}
      style={{
        position: "absolute",
        left: `${popup.x}%`,
        bottom: "35%", // จุดเริ่มเด้ง
        color: finalColor,
        // ฟอนต์หนาๆ ตันๆ แบบ Arial Black หรือ Impact
        fontFamily: 'Impact, "Arial Black", sans-serif', 
        fontSize: popup.fontSize ? popup.fontSize : (isNumber ? "36px" : "24px"),
        fontWeight: "900",
        textAlign: "center",
        whiteSpace: "nowrap",
        zIndex: 2000,
        pointerEvents: "none",
        letterSpacing: "0px",
        
        // 🌟 หัวใจสำคัญของ RO Style: ขอบดำคมกริบ (Hard Border)
        // ใช้ text-shadow แบบไม่มีความเบลอ (0px blur) ซ้อนกัน 8 ทิศทาง
        textShadow: `
           1px  1px 0 #000,
          -1px  1px 0 #000,
           1px -1px 0 #000,
          -1px -1px 0 #000,
           0px  1px 0 #000,
           0px -1px 0 #000,
           1px  0px 0 #000,
          -1px  0px 0 #000,
           2px  2px 0 rgba(0,0,0,0.5) /* เงาตกกระทบเล็กน้อยด้านหลัง */
        `,
      }}
    >
      {displayText}
    </motion.div>
  );
};

export const DamagePopup = ({ popups, removePopup }) => {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      <AnimatePresence mode="popLayout">
        {popups.map((p) => (
          <SingleRORPopup key={p.id} popup={p} removePopup={removePopup} />
        ))}
      </AnimatePresence>
    </div>
  );
};