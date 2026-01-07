import React from "react";

/**
 * TargetSelectionOverlay Component
 * ใช้แสดงแถบแจ้งเตือนด้านบนเมื่ออยู่ในโหมดเลือกเป้าหมายการโจมตี
 * @param {string} skillName - ชื่อสกิลที่กำลังร่าย
 * @param {number} current - จำนวนเป้าหมายที่เลือกไปแล้ว
 * @param {number} max - จำนวนเป้าหมายสูงสุดที่สกิลนี้ต้องการ
 * @param {function} onCancel - ฟังก์ชันสำหรับยกเลิกโหมดเลือกเป้าหมาย
 */
export const TargetSelectionOverlay = ({
  skillName,
  current,
  max,
  onCancel,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 0,
        width: "100%",
        textAlign: "center",
        zIndex: 999,
        pointerEvents: "none", // ป้องกันไม่ให้บล็อกการคลิกส่วนอื่น ยกเว้นปุ่มภายใน
      }}
    >
      <span
        style={{
          background: "rgba(0,0,0,0.85)",
          color: "#ff9f43",
          padding: "8px 16px",
          borderRadius: 20,
          border: "2px solid #fff",
          fontWeight: "bold",
          pointerEvents: "auto", // ให้ span รับ event ได้ตามปกติ (ถ้ามี)
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        {skillName}: SELECT TARGET {current + 1} / {max}
      </span>
      
      <button
        onClick={(e) => {
          e.stopPropagation(); // กันการคลิกทะลุไปโดนตัวละครด้านหลัง
          onCancel();
        }}
        style={{
          marginLeft: 10,
          padding: "5px 15px",
          borderRadius: "10px",
          background: "#fff",
          color: "#333",
          border: "2px solid #333",
          fontWeight: "bold",
          cursor: "pointer",
          pointerEvents: "auto", // ให้ปุ่มคลิกได้
          transition: "all 0.1s",
        }}
      >
        CANCEL
      </button>
    </div>
  );
};