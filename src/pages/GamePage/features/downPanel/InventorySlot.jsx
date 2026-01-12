import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INVENTORY_COUNT } from "../../../../const/index";
// ✅ Import ฟังก์ชันคำนวณดาเมจ
import { getLetterDamage } from "../../../../const/letterValues"; 

// ==========================================
// 🛠️ Helper: คำนวณ Bonus จาก Stat (ทุก 1 แต้มที่เกิน 10 นับเป็น 1 Bonus)
// ==========================================
const getStatBonus = (val) => Math.max(0, val - 10);

// ==========================================
// 1. ส่วนย่อย: Single Slot (Logic ของช่อง 1 ช่อง)
// ==========================================
/**
 * @param {Object} item - ข้อมูลไอเทม (ตัวอักษร)
 * @param {number} index - ลำดับของช่อง
 * @param {boolean} isLocked - สถานะการล็อคช่อง
 * @param {function} onSelect - ฟังก์ชันเมื่อคลิกเลือกตัวอักษร
 * @param {number} totalModifier - (NEW) ค่า Modifier รวม (STR Bonus)
 */
const SingleSlot = ({ item, index, isLocked, onSelect, totalModifier }) => {
  
  // ✅ ใช้ทศนิยมตามปกติ (เช่น 0.5, 1.5)
  const displayDamage = item ? getLetterDamage(item.char, totalModifier) : 0;

  return (
    <div
      style={{
        width: "90%",
        height: "90%",
        background: isLocked ? "#1a0f0a" : "rgba(0, 0, 0, 0.3)",
        border: isLocked ? "2px solid #3d2b1f" : "2px inset #2a1a10",
        borderRadius: "4px",
        boxShadow: "inset 1px 1px 4px rgba(0,0,0,0.5)",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* สัญลักษณ์แม่กุญแจ */}
      {isLocked && (
        <div
          style={{
            fontSize: "12px",
            opacity: 0.3,
            filter: "grayscale(1)",
            userSelect: "none",
          }}
        >
          🔒
        </div>
      )}

      {/* ตัวอักษร (Tile) */}
      <AnimatePresence>
        {item && !isLocked && (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1, zIndex: 100 }}
            onClick={() => onSelect(item, index)}
            style={{
              width: "92%",
              height: "92%",
              background: "#fdf5e6",
              border: "2px solid #8b4513",
              borderBottomWidth: "4px",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "900",
              fontSize: "24px",
              color: "#3e2723",
              cursor: "pointer",
              userSelect: "none",
              boxShadow: "0 2px 3px rgba(0,0,0,0.2)",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {item.char}
            
            {/* ✅ แสดงคะแนนดาเมจ */}
            <span
              style={{
                position: "absolute",
                bottom: "1px",
                right: "2px",
                fontSize: "10px",
                color: "#8b4513",
                fontWeight: "bold",
                background: "rgba(255,255,255,0.7)",
                padding: "0 2px",
                borderRadius: "2px",
                minWidth: "12px",
                textAlign: "center"
              }}
            >
              {displayDamage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 2. ส่วนหลัก: Inventory Container
// ==========================================
/**
 * @param {Array} inventory - รายการไอเทมในตัวละคร
 * @param {function} onSelectLetter - ฟังก์ชันส่งค่าตัวอักษรกลับไปที่หน้าหลัก
 * @param {number} playerSlots - จำนวนช่องที่ปลดล็อคแล้ว
 * @param {Object} playerStats - ค่า Stat ของผู้เล่น { STR, ... }
 * @param {number} playerLevel - (ไม่ใช้คำนวณดาเมจแล้ว)
 */
export const InventorySlot = ({ 
  inventory, 
  onSelectLetter, 
  playerSlots = 10,
  playerStats = { STR: 10 },
  playerLevel = 1 
}) => {

  // ✅ 1. คำนวณ STR Bonus (ค่าที่เกิน 10)
  const strBonus = getStatBonus(playerStats.STR || 10);
  
  // ✅ 2. Modifier ใช้แค่ STR Bonus อย่างเดียว (เอา Level ออกแล้ว)
  const totalModifier = strBonus;

  return (
    <div
      id="inventory"
      style={{
        boxSizing: "border-box",
        flex: 1.5,
        maxWidth: "380px",
        minWidth: "250px",
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
          marginBottom: "4px",
        }}
      >
        INVENTORY
      </div>

      {/* GRID CONTAINER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <motion.div
          layout
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
            gap: "4px",
            padding: "6px",
            background: "#3e2723",
            border: "3px solid #d4af37",
            borderRadius: "5px",
            height: "auto",
            aspectRatio: "5/4",
            width: "98%",
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
                totalModifier={totalModifier} // ✅ ส่งค่า Modifier (STR Only)
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};