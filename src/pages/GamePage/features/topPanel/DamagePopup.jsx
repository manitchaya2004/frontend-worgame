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

  const isCritical = popup.isCritical || false;

  // 🎨 กำหนดสีตามสไตล์ RO
  let finalColor = popup.color;
  if (!finalColor) {
      if (popup.value === "MISSED!") finalColor = "#ff0000"; 
      else if (isHeal) finalColor = "#00ff00"; 
      else if (isCritical) finalColor = "#ffaa00"; 
      else if (isNumber) finalColor = "#ff0000"; 
      else finalColor = "#ffffff"; 
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
      animate={
        isCritical
          ? {
              opacity: [1, 1, 1, 0],
              scale: [2.5, 1.3, 1.4, 1.0], // ใหญ่กระแทกตากว่าปกติ
              y: [0, -110, -85, -100], 
            }
          : {
              opacity: [1, 1, 1, 0],
              scale: [1.5, 1.0, 1.0, 0.8], // ปกติ
              y: [0, -90, -65, -80],  
            }
      }
      transition={{
        duration: isCritical ? 2.5 : 2.0, 
        ease: "easeOut",
        times: [0, 0.08, 0.85, 1], 
      }}
      onAnimationComplete={() => removePopup(popup.id)}
      style={{
        position: "absolute",
        left: `${popup.x}%`,
        bottom: "35%", // จุดเริ่มเด้ง
        color: isCritical && popup.color === "#cc2e2e" ? "#ff3300" : finalColor, // ถ้าโดนยัดสีแดงมาแล้วเป็นคริ ให้สีเจ็บจี๊ดขึ้น
        fontFamily: 'Impact, "Arial Black", sans-serif', 
        fontSize: popup.fontSize ? popup.fontSize : (isCritical ? "60px" : (isNumber ? "36px" : "24px")), // ใหญ่เบ้อเริ่ม
        fontWeight: "900",
        textAlign: "center",
        whiteSpace: "nowrap",
        zIndex: isCritical ? 2001 : 2000,
        pointerEvents: "none",
        letterSpacing: "0px",
        
        // 🌟 แบบเดียวกับ RO, ถ้าคริติคอลให้เงาหนาและอลังการ
        textShadow: isCritical ? `
           2px  2px 0 #000,
          -2px  2px 0 #000,
           2px -2px 0 #000,
          -2px -2px 0 #000,
           0px  2px 0 #000,
           0px -2px 0 #000,
           2px  0px 0 #000,
          -2px  0px 0 #000,
           4px  4px 0 rgba(255,0,0,0.8),
           0px  0px 15px rgba(255,165,0,0.8)
        ` : `
           1px  1px 0 #000,
          -1px  1px 0 #000,
           1px -1px 0 #000,
          -1px -1px 0 #000,
           0px  1px 0 #000,
           0px -1px 0 #000,
           1px  0px 0 #000,
          -1px  0px 0 #000,
           2px  2px 0 rgba(0,0,0,0.5)
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