import React from "react";
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

  if (!turnQueue || turnQueue.length === 0 || gameState === "ADVANTURE")
    return null;

  const visibleQueue = turnQueue.filter((unit) => {
    if (unit.type === "player") return playerData.hp > 0;
    const enemyData = enemies.find((e) => e.id === unit.id);
    return enemyData && enemyData.hp > 0;
  });

  return (
    <div
      style={styles.queueContainer}
      onPointerLeave={() => setHoveredEnemyId(null)} // ✅ ออกจากแถบ = หายทันที
    >
      <div style={styles.queueList}>
        <AnimatePresence mode="popLayout">
          {visibleQueue.map((unit, index) => {
            const isCurrentTurn = index === 0;
            let imgSrc = "";

            if (unit.type === "player") {
              imgSrc = `${ipAddress}/img_hero/${playerData.name}-idle-1.png`;
            } else {
              const enemyData = enemies.find((e) => e.id === unit.id);
              imgSrc = enemyData
                ? `${ipAddress}/img_monster/${enemyData.monster_id}-idle-1.png`
                : "https://via.placeholder.com/40";
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
                  zIndex: isCurrentTurn ? 10 : 1,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={styles.queueCard}
                onPointerEnter={() => {
                  if (unit.type === "player") {
                    setHoveredEnemyId("PLAYER");
                  } else {
                    setHoveredEnemyId(unit.id);
                  }
                }}
              >
                {isCurrentTurn && (
                  <div style={styles.activeArrow}>▼</div>
                )}

                <div style={styles.queueImgFrame}>
                  <img
                    src={imgSrc}
                    alt=""
                    style={styles.queueImg}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/40?text=?";
                    }}
                  />
                </div>

                <div style={styles.queueSpeedBadge}>
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

// ===============================
// STYLES
// ===============================
const styles = {
  queueContainer: {
    position: "absolute",
    top: "15px",
    left: "50%",
    transform: "translateX(-50%)",
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
    cursor: "pointer",
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
  },
  activeArrow: {
    position: "absolute",
    top: "-14px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "#f1c40f",
    fontSize: "12px",
  },
};
