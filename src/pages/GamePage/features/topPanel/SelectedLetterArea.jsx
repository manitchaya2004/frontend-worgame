import React from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { FaLock, FaSkullCrossbones, FaEyeSlash, FaTint } from "react-icons/fa"; // ✅ เพิ่ม Icon ครบชุด
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
            // ✅ เช็คสถานะทั้งหมด
            const isStunned = item?.status === "stun";
            const isPoisoned = item?.status === "poison";
            const isBlind = item?.status === "blind";
            const isBleed = item?.status === "bleed";
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
                <div
                  style={{
                    ...styles.cardBase,
                    // ✅ ปรับสีขอบ Container ตามสถานะ
                    border: isStunned
                      ? "2px solid #7f8c8d"
                      : isPoisoned
                      ? "2px solid #2ecc71"
                      : isBlind
                      ? "2px solid #8e44ad"
                      : isBleed
                      ? "2px solid #c0392b"
                      : "1.5px solid #3d2b1f",
                    
                    boxShadow: isPoisoned
                      ? "inset 0 0 10px #2ecc71"
                      : "inset 0 2px 8px rgba(0,0,0,0.8)",
                  }}
                >
                  {/* ชั้นที่ 2: หน้าการ์ด (motion.div) */}
                  <div
                    style={{
                      ...styles.cardContent,
                      // ✅ ปรับสีพื้นหลังการ์ด
                      background: isStunned
                        ? "linear-gradient(145deg, #bdc3c7 0%, #95a5a6 100%)"
                        : isBlind
                        ? "linear-gradient(145deg, #2c003e 0%, #000000 100%)"
                        : isPoisoned
                        ? "linear-gradient(145deg, #d4fcd4 0%, #a2e0a2 100%)"
                        : isBleed
                        ? "linear-gradient(145deg, #e74c3c 0%, #922b21 100%)"
                        : "linear-gradient(145deg, #ffffff 0%, #e8dcc4 100%)",

                      // ✅ ปรับสีขอบการ์ด
                      border: isStunned
                        ? "1.5px solid #34495e"
                        : isBlind
                        ? "1.5px solid #4a148c"
                        : isBleed
                        ? "1.5px solid #641e16"
                        : "1.5px solid #8b4513",

                      filter: isStunned
                        ? "brightness(0.7) grayscale(0.3)"
                        : "none",
                        
                      // ✅ ปรับสีตัวอักษร
                      color: isBlind
                        ? "#dcdde1"
                        : isBleed
                        ? "#fadbd8"
                        : isPoisoned
                        ? "#1b5e20"
                        : isStunned
                        ? "#2c3e50"
                        : "#3e2723",
                    }}
                  >
                    <span style={{ marginTop: "-2px" }}>
                      {/* ✅ Logic Blind: โชว์ ? */}
                      {isBlind ? "?" : item.char === "QU" ? "Qu" : item.char}
                    </span>

                    {/* วงกลมรอบสถานะ Duration */}
                    {item.status && (
                      <div
                        style={styles.statusDurationBadge(
                          isPoisoned,
                          isBlind,
                          isBleed
                        )}
                      >
                        {duration}
                      </div>
                    )}

                    {/* Icon สถานะ (มุมขวาบน) */}
                    <div style={styles.statusIconPos}>
                      {isPoisoned && !isBlind && !isBleed && (
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          style={{ color: "#27ae60", fontSize: "11px" }}
                        >
                          <FaSkullCrossbones />
                        </motion.div>
                      )}
                      {isStunned && (
                        <div style={{ color: "#34495e", fontSize: "11px" }}>
                          <FaLock />
                        </div>
                      )}
                      {isBlind && (
                        <div style={{ color: "#bdc3c7", fontSize: "11px" }}>
                          <FaEyeSlash />
                        </div>
                      )}
                      {isBleed && (
                        <motion.div
                          animate={{ scale: [1, 1.25, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          style={{ color: "#922b21", fontSize: "11px" }}
                        >
                          <FaTint />
                        </motion.div>
                      )}
                    </div>

                    {/* ดาเมจมุมขวาล่าง */}
                    <div style={styles.damageTextPos(isPoisoned, isBlind, isBleed)}>
                      {/* ✅ Logic Blind: ซ่อนดาเมจ */}
                      {isBlind ? "?" : displayDamage}
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
    height: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  reorderGroup: {
    display: "flex",
    gap: "6px",
    padding: "0px",
    listStyle: "none",
    margin: 0,
    pointerEvents: "auto",
  },
  letterItemWrapper: {
    width: "54px",
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
    padding: "2px",
  },
  cardContent: {
    width: "100%",
    height: "100%",
    // background & border ย้ายไปทำ inline style ด้านบนเพื่อให้รองรับ logic
    borderRadius: "4px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900",
    fontSize: "22px",
    fontFamily: "'Palatino', serif",
    position: "relative",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  // ✅ ปรับสี Badge Duration ตามสถานะ
  statusDurationBadge: (isPoisoned, isBlind, isBleed) => ({
    position: "absolute",
    top: "-3px",
    left: "-3px",
    width: "14px",
    height: "14px",
    background: isBlind
      ? "#8e44ad"
      : isPoisoned
      ? "#2ecc71"
      : isBleed
      ? "#c0392b"
      : "#7f8c8d",
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
  // ✅ ปรับสีตัวเลขดาเมจ
  damageTextPos: (isPoisoned, isBlind, isBleed) => ({
    position: "absolute",
    bottom: "1px",
    right: "3px",
    fontSize: "9px",
    fontWeight: "900",
    color: isBlind
      ? "#bdc3c7"
      : isBleed
      ? "#fadbd8"
      : isPoisoned
      ? "#2e7d32"
      : "#5d4037",
    zIndex: 2,
  }),
};