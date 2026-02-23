import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ipAddress } from "../../../../const/index";

export const TurnQueueBar = ({ store }) => {
  const {
    turnQueue,
    enemies,
    gameState,
    playerData,
    setHoveredEnemyId,
  } = store;

  // State สำหรับคุม Tooltip ของกล่องลำดับเทิร์น
  const [isHovered, setIsHovered] = useState(false);

  // ถ้าไม่มีคิว หรือไม่ใช่หน้าต่อสู้ ไม่ต้องแสดง
  if (!turnQueue || turnQueue.length === 0 || gameState === "ADVANTURE")
    return null;

  // กรองเฉพาะตัวที่ยังมีชีวิตอยู่
  const visibleQueue = turnQueue.filter((unit) => {
    if (unit.type === "player") return playerData.hp > 0;
    const enemyData = enemies.find((e) => e.id === unit.id);
    return enemyData && enemyData.hp > 0;
  });

  return (
    <div
      style={styles.queueContainer}
      // เมื่อเมาส์เข้า/ออก ให้จัดการ Tooltip และ Hover State
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setHoveredEnemyId(null);
      }}
    >
      <div style={styles.queueList}>
        <AnimatePresence mode="popLayout">
          {visibleQueue.map((unit, index) => {
            const isCurrentTurn = index === 0;
            let imgSrc = "";

            // 1. จัดการรูปภาพตามประเภท (Player vs Enemy)
            if (unit.type === "player") {
              imgSrc = `/api/img_hero/${playerData.img_path}-idle-1.png`;
            } else {
              const enemyData = enemies.find((e) => e.id === unit.id);
              imgSrc = enemyData
                ? `/api/img_monster/${enemyData.monster_id}-idle-1.png`
                : "https://via.placeholder.com/40";
            }

            // 2. จัดการตัวเลข Speed (Initiative)
            const speedValue =
              unit.originalInitiative ??
              unit.initiative ??
              unit.speed ??
              "?";

            return (
              <motion.div
                key={unit.uniqueId || unit.id} // ใช้ uniqueId ถ้ามี
                layout
                initial={{ opacity: 0, scale: 0.5, x: 50 }}
                animate={{
                  opacity: 1,
                  scale: isCurrentTurn ? 1.3 : 1, // ตัวปัจจุบันใหญ่ขึ้น
                  x: 0,
                  zIndex: isCurrentTurn ? 100 : 10, // ตัวปัจจุบันอยู่หน้าสุด
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={styles.queueCard}
                
                // 3. LOGIC สำคัญสำหรับการชี้เมาส์บอกเป้าหมาย
                onPointerEnter={() => {
                  if (unit.type === "player") {
                    setHoveredEnemyId("PLAYER");
                  } else {
                    setHoveredEnemyId(unit.id);
                  }
                }}
              >
                {/* ลูกศรชี้ว่าตาใคร */}
                {isCurrentTurn && <div style={styles.activeArrow}>▼</div>}

                {/* กรอบรูปภาพ */}
                <div style={styles.queueImgFrame}>
                  <img
                    src={imgSrc}
                    alt=""
                    style={styles.queueImg}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/40?text=?";
                    }}
                  />
                </div>

                {/* Badge บอกความเร็ว */}
                <div style={styles.queueSpeedBadge}>{speedValue}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* =========================
          CUSTOM FANTASY TOOLTIP (ชี้ลงมาด้านล่าง)
      ========================= */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -10, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 16px)", // ลอยอยู่ด้านล่างกรอบคิว
              left: "50%",
              background: "rgba(15, 11, 8, 0.95)", 
              border: "1px solid #d4af37", 
              borderRadius: "6px",
              padding: "8px 10px",
              minWidth: "140px",
              zIndex: 999, 
              pointerEvents: "none", 
              boxShadow: "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              whiteSpace: "nowrap"
            }}
          >
            {/* ลูกศรชี้ขึ้นด้านบน */}
            <div style={{
              position: "absolute",
              top: "-6px",
              left: "50%",
              marginLeft: "-5px", 
              width: "10px",
              height: "10px",
              background: "rgba(15, 11, 8, 0.95)",
              borderLeft: "1px solid #d4af37",
              borderTop: "1px solid #d4af37",
              transform: "rotate(45deg)",
            }} />

            {/* หัวข้อ */}
            <span style={{ color: "#ffd700", fontSize: "12px", fontWeight: "bold", fontFamily: "'Palatino', serif", textAlign: "center" }}>
              Turn Order
            </span>
            {/* คำอธิบาย */}
            <span style={{ color: "#bdc3c7", fontSize: "11px", textAlign: "center" }}>
              Shows the attack sequence.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===============================
// STYLES
// ===============================
const styles = {
  queueContainer: {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 50,
    background: "rgba(0,0,0,0.6)",
    padding: "8px 12px",
    borderRadius: "12px",
    border: "2px solid #ecf0f1",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
    pointerEvents: "auto", 
  },
  queueList: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  queueCard: {
    position: "relative",
    width: "45px",
    height: "45px",
    background: "#34495e",
    border: "2px solid #bdc3c7",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer", // เปลี่ยนรูปเมาส์เป็นนิ้วชี้
    userSelect: "none",
  },
  queueImgFrame: {
    width: "100%",
    height: "100%",
    overflow: "hidden", // ตัดส่วนเกินรูปภาพ
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2c3e50",
    pointerEvents: "none", // ให้เมาส์ทะลุไปโดน Card แม่
  },
  queueImg: {
    width: "90%",
    height: "90%",
    objectFit: "contain",
    imageRendering: "pixelated",
  },
  queueSpeedBadge: {
    position: "absolute",
    bottom: "-8px",
    right: "-8px",
    background: "#e67e22",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "bold",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #fff",
    zIndex: 20, // อยู่บนรูปภาพเสมอ
    boxShadow: "0px 2px 4px rgba(0,0,0,0.3)",
    pointerEvents: "none",
  },
  activeArrow: {
    position: "absolute",
    top: "-18px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "#f1c40f",
    fontSize: "14px",
    textShadow: "0px 0px 4px rgba(0,0,0,1)",
    pointerEvents: "none",
  },
};