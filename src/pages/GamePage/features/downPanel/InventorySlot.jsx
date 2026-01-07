import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LETTER_DATA, INVENTORY_COUNT } from "../../../../const/index";

// ==========================================
// 1. ส่วนย่อย: Single Slot (Logic ของช่อง 1 ช่อง)
// ==========================================
/**
 * @param {Object} item - ข้อมูลไอเทม (ตัวอักษร)
 * @param {number} index - ลำดับของช่อง
 * @param {boolean} isLocked - สถานะการล็อคช่อง
 * @param {function} onSelect - ฟังก์ชันเมื่อคลิกเลือกตัวอักษร
 */
const SingleSlot = ({ item, index, isLocked, onSelect }) => {
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
      {/* สัญลักษณ์แม่กุญแจ (แสดงเมื่อช่องยังไม่ถูกปลดล็อค) */}
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
            {/* คะแนนของตัวอักษรที่มุมขวาล่าง */}
            <span
              style={{
                position: "absolute",
                bottom: "1px",
                right: "2px",
                fontSize: "12px",
                color: "#8b4513",
                fontWeight: "bold",
              }}
            >
              {LETTER_DATA[item.char]?.score}
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
 * @param {number} playerSlots - จำนวนช่องที่ปลดล็อคแล้ว (Default: 10)
 */
export const InventorySlot = ({ 
  inventory, 
  onSelectLetter, 
  playerSlots = 10 
}) => {
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
          {/* วนลูปตาม INVENTORY_COUNT (เช่น 20 ช่อง) เพื่อวาด Grid ทั้งหมด */}
          {Array.from({ length: INVENTORY_COUNT }).map((_, index) => {
            // ดึงไอเทมจาก Array ถ้าช่องนั้นว่างจะเป็น undefined
            const item = inventory[index] ?? undefined;
            
            // เช็คว่าช่องนี้ล็อคอยู่หรือไม่ตาม Progress ของผู้เล่น
            const isLocked = index >= playerSlots;

            return (
              <SingleSlot
                key={`slot-${index}`}
                item={item}
                index={index}
                isLocked={isLocked}
                onSelect={onSelectLetter}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};