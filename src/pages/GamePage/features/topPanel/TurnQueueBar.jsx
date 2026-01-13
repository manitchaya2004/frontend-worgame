import React from "react";
import { motion, AnimatePresence } from "framer-motion";
// ⚠️ เช็ค path ของ const ให้ถูกต้องตามโครงสร้างโฟลเดอร์ของคุณ
import { ipAddress } from "../../../../const/index"; 

export const TurnQueueBar = ({ store }) => {
  const { turnQueue, enemies, gameState, playerData } = store;

  // ไม่แสดงถ้าไม่มีคิว หรือยังเดิน Adventure อยู่
  if (!turnQueue || turnQueue.length === 0 || gameState === "ADVANTURE")
    return null;

  // กรองคนที่ตาย (HP <= 0) ออกทันที
  const visibleQueue = turnQueue.filter((unit) => {
    if (unit.type === "player") return playerData.hp > 0;
    const enemyData = enemies.find((e) => e.id === unit.id);
    return enemyData && enemyData.hp > 0;
  });

  return (
    <div style={styles.queueContainer}>
      <div style={styles.queueList}>
        <AnimatePresence mode="popLayout">
          {visibleQueue.map((unit, index) => {
            const isCurrentTurn = index === 0;
            let imgSrc = "";
            
            // Logic เลือกรูปภาพ
            if (unit.type === "player")
              imgSrc = `${ipAddress}/img_hero/${playerData.name}-idle-1.png`;
            else {
              const enemyData = enemies.find((e) => e.id === unit.id);
              if (enemyData)
                imgSrc = `${ipAddress}/img_monster/${enemyData.monster_id}-idle-1.png`;
              else
                imgSrc = "https://via.placeholder.com/40/000000/ffffff?text=X";
            }

            return (
              <motion.div
                key={unit.uniqueId}
                layout
                initial={{ opacity: 0, scale: 0.5, x: 50 }}
                animate={{
                  opacity: 1,
                  scale: isCurrentTurn ? 1.3 : 1,
                  x: 0,
                  borderColor: isCurrentTurn ? "#f1c40f" : "#7f8c8d",
                  zIndex: isCurrentTurn ? 10 : 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  y: 50,
                  transition: { duration: 0.4, ease: "backIn" },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                  ...styles.queueCard,
                  boxShadow: isCurrentTurn
                    ? "0 0 15px #f1c40f, 0 4px 0 #000"
                    : "0 3px 0 #000",
                }}
              >
                {/* ลูกศรชี้คนปัจจุบัน */}
                {isCurrentTurn && (
                  <motion.div
                    layoutId="activeArrow"
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 0.5,
                    }}
                    style={styles.activeArrow}
                  >
                    ▼
                  </motion.div>
                )}

                <div style={styles.queueImgFrame}>
                  <img
                    src={imgSrc}
                    alt={unit.name}
                    style={styles.queueImg}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/40?text=?";
                    }}
                  />
                </div>

                <div
                  style={{
                    ...styles.queueSpeedBadge,
                    background: isCurrentTurn ? "#e74c3c" : "#e67e22",
                  }}
                >
                  {unit.originalInitiative}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// 🎨 STYLES (เฉพาะส่วนของ Queue Bar)
// ============================================================================
const styles = {
  queueContainer: {
    position: "absolute",
    top: "15px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 50,
    background: "rgba(0,0,0,0.4)",
    padding: "5px 10px",
    borderRadius: "10px",
    border: "2px solid #000",
  },
  queueList: {
    display: "flex",
    gap: "8px",
  },
  queueCard: {
    position: "relative",
    width: "45px",
    height: "45px",
    background: "#2c3e50",
    border: "2px solid #7f8c8d",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 3px 0 #000",
  },
  queueImgFrame: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: "3px",
  },
  queueImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    imageRendering: "pixelated",
  },
  queueSpeedBadge: {
    position: "absolute",
    bottom: "-5px",
    right: "-5px",
    background: "#e67e22",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "bold",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
  },
  activeArrow: {
    position: "absolute",
    top: "-15px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "#f1c40f",
    fontSize: "12px",
    animation: "bounce 0.5s infinite",
  },
};