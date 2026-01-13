import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INVENTORY_COUNT } from "../../../../const/index";
import { getLetterDamage } from "../../../../const/letterValues"; 

const getStatBonus = (val) => Math.max(0, val - 10);

// ... (SingleSlot Code เหมือนเดิม ไม่ต้องแก้) ...
const SingleSlot = ({ item, index, isLocked, onSelect, totalModifier }) => {
  const displayDamage = item ? getLetterDamage(item.char, totalModifier) : 0;
  return (
    <div
      style={{
        width: "100%", // ✅ ปรับเป็น 100% ของ Grid Cell
        height: "100%", // ✅ ปรับเป็น 100% ของ Grid Cell
        padding: "2px", // เพิ่ม Padding เล็กน้อยเพื่อให้มีช่องไฟ
        boxSizing: "border-box", // สำคัญมาก เพื่อไม่ให้ padding ดันจนล้น
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
        {/* Background ของ Slot */}
        <div style={{
            width: "100%", height: "100%", 
            background: isLocked ? "#1a0f0a" : "rgba(0, 0, 0, 0.3)",
            border: isLocked ? "2px solid #3d2b1f" : "2px inset #2a1a10",
            borderRadius: "4px",
            display: "flex", justifyContent: "center", alignItems: "center",
            position: "relative"
        }}>
             {isLocked && <div style={{ fontSize: "12px", opacity: 0.3, filter: "grayscale(1)" }}>🔒</div>}

             <AnimatePresence>
                {item && !isLocked && (
                <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    whileHover={{ scale: 1.05, zIndex: 100 }}
                    onClick={() => onSelect(item, index)}
                    style={{
                        width: "90%",
                        height: "90%",
                        background: "#fdf5e6",
                        border: "2px solid #8b4513",
                        borderBottomWidth: "4px",
                        borderRadius: "4px",
                        display: "flex", justifyContent: "center", alignItems: "center",
                        fontWeight: "900", fontSize: "20px", // ปรับลด Font นิดหน่อยเผื่อช่องเล็ก
                        color: "#3e2723",
                        cursor: "pointer",
                        boxShadow: "0 2px 3px rgba(0,0,0,0.2)",
                        position: "relative"
                    }}
                >
                    {item.char}
                    <span style={{
                        position: "absolute", bottom: "1px", right: "2px",
                        fontSize: "9px", color: "#8b4513", fontWeight: "bold",
                        background: "rgba(255,255,255,0.7)", padding: "0 2px", borderRadius: "2px"
                    }}>
                        {displayDamage}
                    </span>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};


// ==========================================
// 2. ส่วนหลัก: Inventory Container (แก้ไข Layout)
// ==========================================
export const InventorySlot = ({ 
  inventory, 
  onSelectLetter, 
  playerSlots = 10,
  playerStats = { STR: 10 },
  playerLevel = 1 
}) => {

  const strBonus = getStatBonus(playerStats.STR || 10);
  const totalModifier = strBonus;

  return (
    <div
      id="inventory"
      style={{
        boxSizing: "border-box",
        // ✅ 1. ยืดเต็มพื้นที่ Flex
        flex: 1, 
        // ✅ 2. เอา maxWidth ออก หรือตั้งเป็น 100% เพื่อให้ขยายสุด
        width: "100%", 
        height: "100%", // ✅ ยืดความสูงให้เต็ม Parent (280px)
        
        background: "linear-gradient(180deg, #3d2b1f 0%, #2e2019 100%)",
        borderRadius: "12px",
        border: "3px solid #eebb55",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          color: "#eebb55",
          fontSize: "11px",
          fontWeight: 900,
          letterSpacing: "2px",
          borderBottom: "2px solid #eebb55",
          width: "90%",
          textAlign: "center",
          paddingBottom: "4px",
          marginBottom: "6px",
          flexShrink: 0 // ห้าม Header หด
        }}
      >
        INVENTORY
      </div>

      {/* GRID CONTAINER */}
      <div
        style={{
          flex: 1, // ✅ ให้พื้นที่ Grid ยืดเต็มส่วนที่เหลือของกล่อง
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center", // จัดกึ่งกลาง
          overflow: "hidden" 
        }}
      >
        <motion.div
          layout
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)", // ✅ บังคับให้แบ่งเป็น 4 แถวเท่าๆ กัน
            gap: "4px",
            padding: "4px",
            background: "#3e2723",
            border: "2px solid #d4af37",
            borderRadius: "5px",
            
            // ✅ จุดสำคัญ: สั่งให้ Grid ขยายเต็มพื้นที่
            width: "100%", 
            height: "100%", 
            
            // ❌ เอา aspectRatio ออก! (ตัวการที่ทำให้เหลือที่ว่าง)
            // aspectRatio: "5/4", 
          }}
        >
          {Array.from({ length: INVENTORY_COUNT }).map((_, index) => {
            const item = inventory[index] ?? undefined;
            const isLocked = index >= playerSlots;

            return (
              <SingleSlot
                key={`slot-${index}`}
                item={item}
                index={index}
                isLocked={isLocked}
                onSelect={onSelectLetter}
                totalModifier={totalModifier} 
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};