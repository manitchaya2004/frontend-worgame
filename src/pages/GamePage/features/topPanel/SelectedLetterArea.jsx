import React from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { FaLock, FaSkullCrossbones } from "react-icons/fa";
import { getLetterDamage } from "../../../../const/letterValues";


export const SelectedLetterArea = ({ store, constraintsRef }) => {
  const activeSelectedItems = store.selectedLetters.filter((i) => i !== null);

  return (
    <div ref={constraintsRef} style={styles.reorderContainer}>
      <Reorder.Group
        axis="x"
        values={activeSelectedItems}
        onReorder={(newOrder) => store.reorderLetters(newOrder)}
        style={styles.reorderGroup}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {activeSelectedItems.map((item) => {
            const isStunned = item?.status === "stun";
            const isPoisoned = item?.status === "poison";
            const duration = item?.statusDuration || 0;
            const displayDamage = getLetterDamage(item.char, store.playerData.atk);

            return (
              <Reorder.Item
                key={item.id}
                value={item}
                dragConstraints={constraintsRef}
                onTap={() => store.deselectLetter(item)}
                style={styles.letterItemWrapper}
              >
                {/* ชั้นที่ 1: กรอบหลัง (SingleSlot) */}
                <div style={{
                  ...styles.cardBase,
                  border: isStunned ? "2px solid #7f8c8d" : isPoisoned ? "2px solid #2ecc71" : "1.5px solid #3d2b1f",
                  boxShadow: isPoisoned ? "inset 0 0 10px #2ecc71" : "inset 0 2px 8px rgba(0,0,0,0.8)",
                }}>
                  {/* ชั้นที่ 2: หน้าการ์ด (motion.div) */}
                  <div style={{
                    ...styles.cardContent,
                    background: isPoisoned 
                      ? "linear-gradient(145deg, #d4fcd4 0%, #a2e0a2 100%)" 
                      : isStunned
                      ? "linear-gradient(145deg, #bdc3c7 0%, #95a5a6 100%)"
                      : "linear-gradient(145deg, #ffffff 0%, #e8dcc4 100%)",
                    filter: isStunned ? "brightness(0.7) grayscale(0.3)" : "none",
                  }}>
                    <span style={{ marginTop: "-2px" }}>
                      {item.char === "QU" ? "Qu" : item.char}
                    </span>

                    {/* วงกลมรอบสถานะ */}
                    {item.status && (
                      <div style={styles.statusDurationBadge(isPoisoned)}>
                        {duration}
                      </div>
                    )}

                    {/* Icon สถานะ */}
                    <div style={styles.statusIconPos}>
                      {isPoisoned && (
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ color: "#27ae60", fontSize: "11px" }}>
                          <FaSkullCrossbones />
                        </motion.div>
                      )}
                      {isStunned && <div style={{ color: "#34495e", fontSize: "11px" }}><FaLock /></div>}
                    </div>

                    {/* ดาเมจมุมขวาล่าง */}
                    <div style={styles.damageTextPos(isPoisoned)}>
                      {displayDamage.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
};

const styles = {
  reorderContainer: {
    position: "absolute",
    top: "30%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    width: "max-content",
    height: "60px", // บีบความสูง container ลง
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  reorderGroup: {
    display: "flex",
    gap: "6px", // ลดช่องว่างระหว่างการ์ดให้ดูแน่นเหมือนในมือ
    padding: "0px",
    listStyle: "none",
    margin: 0,
    pointerEvents: "auto"
  },
  letterItemWrapper: {
    width: "54px", // ปรับเป็นจัตุรัสเป๊ะๆ
    height: "54px", 
    position: "relative",
    flexShrink: 0,
  },
  cardBase: {
    width: "100%",
    height: "100%",
    background: "rgba(20, 10, 5, 0.6)",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    boxSizing: "border-box",
    padding: "2px", // ระยะห่างขอบมืดกับหน้าการ์ด
  },
  cardContent: {
    width: "100%",
    height: "100%",
    border: "1.5px solid #8b4513", // ลดความหนาเส้นขอบให้เท่า inventory
    borderRadius: "4px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900",
    fontSize: "22px", // ปรับลดขนาดตัวอักษรลงเล็กน้อยให้ดูพอดีกับกล่องที่เล็กลง
    fontFamily: "'Palatino', serif",
    color: "#3e2723",
    position: "relative",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  statusDurationBadge: (isPoisoned) => ({
    position: "absolute",
    top: "-3px",
    left: "-3px",
    width: "14px",
    height: "14px",
    background: isPoisoned ? "#2ecc71" : "#7f8c8d",
    borderRadius: "50%",
    border: "1px solid #fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "8px",
    color: "#fff",
    fontWeight: "bold",
    zIndex: 10,
  }),
  statusIconPos: {
    position: "absolute",
    top: "2px",
    right: "3px",
    zIndex: 5,
  },
  damageTextPos: (isPoisoned) => ({
    position: "absolute",
    bottom: "1px",
    right: "3px",
    fontSize: "9px", // ลดขนาดตัวเลขดาเมจ
    fontWeight: "900",
    color: isPoisoned ? "#2e7d32" : "#5d4037",
    zIndex: 2,
  }),
};