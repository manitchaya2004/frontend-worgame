import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const MeaningPopup = ({ entries }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const types = entries ? Object.keys(entries) : [];
  const currentTypeName = types[currentIndex] || "";
  const currentMeanings = entries && currentTypeName ? entries[currentTypeName] : [];

  useEffect(() => {
    setCurrentIndex(0);
  }, [JSON.stringify(entries)]);

  if (types.length === 0) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % types.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + types.length) % types.length);
  };

  const customScrollbar = `
    .retro-scroll::-webkit-scrollbar {
      width: 3px; /* ✅ บีบ Scrollbar ให้เล็กที่สุด */
    }
    .retro-scroll::-webkit-scrollbar-track {
      background: rgba(92, 64, 51, 0.05);
      border-radius: 4px;
    }
    .retro-scroll::-webkit-scrollbar-thumb {
      background: #b89768;
      border-radius: 4px;
    }
    .retro-scroll::-webkit-scrollbar-thumb:hover {
      background: #5c4033;
    }
  `;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "150px", // ✅ ล็อกจุดยึด (Anchor) ไว้ที่ขอบบนของกล่องเดิม (กะระยะ 100px + ความสูงกล่อง)
        left: 0,
        width: "100%",
        zIndex: 999,
        pointerEvents: "none",
      }}
    >
      <style>{customScrollbar}</style>

      {/* เอา div เว้นระยะข้างบนออกไปแล้ว เพราะเราอิงตำแหน่งจากด้านล่างแทน */}

      <div style={{ 
        position: "absolute", 
        top: 0, // ✅ บังคับให้เนื้อหาขยายตัว "ลงด้านล่าง" จากจุดยึด
        left: "50%", // ✅ จัดตำแหน่งให้อยู่กึ่งกลางหน้าจอ
        transform: "translateX(-50%)", 
        pointerEvents: "auto", 
        display: "flex", 
        alignItems: "center" 
      }}>
        
        {types.length > 1 && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev} 
            style={{ ...outerArrowStyle, left: "-30px" }} // ✅ ขยับปุ่มให้ชิดกล่องมากขึ้น
          >
            {"<"}
          </motion.button>
        )}

        <motion.div
          key={currentTypeName}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 0.95, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{
            background: "rgba(244, 228, 188, 0.95)", 
            border: "2px solid #5c4033", // ✅ ลดความหนาขอบลง
            padding: "5px 12px 14px 12px", // ✅ ปรับ Padding ด้านล่างเพิ่มนิดหน่อยเพื่อไม่ให้ตัวเลขหน้าทับคำแปลเมื่อมีหลายบรรทัด
            borderRadius: "4px", 
            textAlign: "center",
            boxShadow: "0 3px 0 rgba(92, 64, 51, 0.3)", 
            width: "fit-content", 
            minWidth: "200px",
            maxWidth: "400px", // ✅ ให้ขยายออกข้างได้นิดหน่อย จะได้ไม่ต้อง Scroll บ่อย
            minHeight: "40px", // ✅ ลดความสูงขั้นต่ำลง
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <span style={{ 
            fontSize: "9px", // ✅ ลดขนาดตัวอักษรหัวข้อ
            color: "#8d6e63", 
            fontWeight: "900", 
            textTransform: "uppercase", 
            marginBottom: "3px",
            letterSpacing: "1px",
            borderBottom: "1px dashed rgba(92, 64, 51, 0.3)", // ✅ ลดความหนาเส้นประ
            paddingBottom: "2px",
            width: "80%",
            flexShrink: 0 
          }}>
            — {currentTypeName} —
          </span>

          <div 
            className="retro-scroll"
            style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "4px", // ✅ ลดช่องว่างระหว่างป้ายคำแปล
              justifyContent: "center", 
              alignItems: "center",     
              width: "100%",
              maxHeight: "75px", // ✅ ปรับให้แสดงได้สูงสุดประมาณ 3 แถว ถ้าเกินนี้จะเกิด Scroll
              overflowY: "auto",
              margin: "0 auto",        
              padding: "0 2px"
            }}
          >
            {currentMeanings.map((m, idx) => (
              <span 
                key={idx}
                style={{
                  background: "#e8d5b5", 
                  border: "1px solid #b89768", // ✅ ลดขอบของป้ายคำแปล
                  padding: "2px 6px", // ✅ บีบตัวป้ายให้เล็กลง
                  borderRadius: "2px", 
                  fontSize: "12px", // ✅ ลดขนาดฟอนต์คำแปลลงให้อ่านง่ายแต่ไม่เกะกะ
                  color: "#4a2c11", 
                  fontWeight: "bold",
                  boxShadow: "0 1px 0 rgba(92, 64, 51, 0.2)", 
                  whiteSpace: "nowrap"
                }}
              >
                {m}
              </span>
            ))}
          </div>

          {types.length > 1 && (
            <div style={{ position: "absolute", bottom: "1px", right: "4px", fontSize: "7px", color: "#8d6e63", fontWeight: "bold" }}>
              {currentIndex + 1}/{types.length}
            </div>
          )}
        </motion.div>

        {types.length > 1 && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext} 
            style={{ ...outerArrowStyle, right: "-30px" }} // ✅ ขยับปุ่มให้ชิดกล่องมากขึ้น
          >
            {">"}
          </motion.button>
        )}
      </div>
    </div>
  );
};

// ✅ ปรับปุ่มลูกศรให้เล็กลงตามสัดส่วนกล่อง
const outerArrowStyle = {
  position: "absolute",
  background: "#5c4033",
  color: "#f4e4bc",
  border: "2px solid #3a251c", 
  borderRadius: "3px",
  width: "24px", // เล็กลง
  height: "28px", // เล็กลง
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px", // ไอคอนลูกศรเล็กลง
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 0 rgba(92, 64, 51, 0.4)", 
  zIndex: 10
};