import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaLock, FaSkullCrossbones, FaEyeSlash, FaTint } from "react-icons/fa";
import { GiBroadsword, GiShield, GiStarShuriken } from "react-icons/gi";
import { getLetterDamage } from "../../../../store/useGameStore"; 

export const SelectedLetterArea = ({ store, constraintsRef }) => {
  const activeSelectedItems = store.selectedLetters.filter((i) => i !== null);

  return (
    <div ref={constraintsRef} style={styles.reorderContainer}>
      <div style={styles.flexGroup}>
        <AnimatePresence initial={false} mode="popLayout">
          {activeSelectedItems.map((item) => {
            const isStunned = item?.status === "stun";
            const isPoisoned = item?.status === "poison";
            const isBlind = item?.status === "blind";
            const isBleed = item?.status === "bleed";
            const duration = item?.statusDuration || 0;
            const buffType = item?.buff || null;

            const displayDamage = getLetterDamage(item.char);

            // ฟังก์ชันดึงข้อมูลบัฟสำหรับ Badge นอกการ์ด (ล่างซ้าย)
            const getBuffBadgeData = () => {
              if (isBlind || !buffType) return null;
              switch (buffType) {
                case "STRIKE_x2": return { icon: <GiBroadsword />, bgColor: "#c0392b" };
                case "GUARD_x2": return { icon: <GiShield />, bgColor: "#2980b9" };
                case "MANA_PLUS": return { icon: <GiStarShuriken />, bgColor: "#8e44ad" };
                default: return null;
              }
            };

            const buffBadge = getBuffBadgeData();

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.5 }}
                animate={{ 
                  opacity: 1, y: 0, scale: 1,
                  transition: { type: "spring", stiffness: 500, damping: 25, mass: 0.8 }
                }}
                exit={{ opacity: 0, scale: 0.2, y: -20, transition: { duration: 0.15 } }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => store.deselectLetter(item)}
                style={styles.letterItemWrapper}
              >
                <div style={{
                    ...styles.cardBase,
                    border: `1.5px solid ${isBlind ? "#8e44ad" : "#5c4033"}`,
                    overflow: "visible", // สำคัญมาก: เพื่อให้ Badge ยื่นออกไปได้
                }}>
                  <div style={{
                      ...styles.cardContent,
                      background: isStunned ? "linear-gradient(145deg, #bdc3c7, #95a5a6)"
                        : isBlind ? "linear-gradient(145deg, #2c003e, #000000)"
                        : isPoisoned ? "linear-gradient(145deg, #d4fcd4, #a2e0a2)"
                        : isBleed ? "linear-gradient(145deg, #e74c3c, #922b21)"
                        : "linear-gradient(145deg, #ffffff, #e8dcc4)",
                  }}>
                    
                    {/* ✅ ตัวอักษรตรงกลาง (ไม่มีไอคอนพื้นหลังแล้ว) */}
                    <span style={{ 
                      ...styles.mainChar,
                      color: isBlind ? "#fff" : (isPoisoned ? "#1b5e20" : isBleed ? "#fadbd8" : isStunned ? "#2c3e50" : "#3e2723"),
                      textShadow: isBlind ? "0px 0px 8px rgba(255,255,255,0.4)" : "0.5px 1px 0px rgba(255,255,255,0.7)",
                    }}>
                      {isBlind ? "?" : (item.char === "QU" ? "Qu" : item.char)}
                    </span>

                    {/* ✅ Buff Badge (วงกลมสี แปะอยู่นอกขอบล่างซ้าย) */}
                    {buffBadge && (
                      <div style={{ ...styles.buffBadgeBase, backgroundColor: buffBadge.bgColor }}>
                        {buffBadge.icon}
                      </div>
                    )}

                    {/* Status Duration (บนซ้าย) */}
                    {item.status && (
                      <div style={styles.statusDurationBadge(isPoisoned, isBlind, isBleed)}>
                        {duration}
                      </div>
                    )}

                    {/* Debuff Icons (บนขวา) */}
                    <div style={styles.statusIconPos}>
                      {isPoisoned && !isBlind && !isBleed && (
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ color: "#27ae60", fontSize: "11px" }}>
                          <FaSkullCrossbones />
                        </motion.div>
                      )}
                      {isStunned && <div style={{ color: "#34495e", fontSize: "11px" }}><FaLock /></div>}
                      {isBlind && <div style={{ color: "#bdc3c7", fontSize: "12px" }}><FaEyeSlash /></div>}
                      {isBleed && (
                        <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ color: "#922b21", fontSize: "11px" }}>
                          <FaTint />
                        </motion.div>
                      )}
                    </div>

                    {/* Damage Info (ล่างขวา) */}
                    {!isBlind && (
                      <div style={styles.damageTextPos}>
                        {displayDamage}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

const styles = {
  reorderContainer: {
    position: "absolute",
    top: "32%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    width: "max-content",
    pointerEvents: "none",
  },
  flexGroup: {
    display: "flex",
    gap: "8px",
    padding: "10px",
    pointerEvents: "auto",
    justifyContent: "center",
    alignItems: "center",
  },
  letterItemWrapper: {
    width: "58px",
    height: "58px",
    cursor: "pointer",
    position: "relative",
  },
  cardBase: {
    width: "100%",
    height: "100%",
    background: "rgba(30, 20, 10, 0.4)",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2px",
    boxSizing: "border-box",
    position: "relative",
  },
  cardContent: {
    width: "100%",
    height: "100%",
    borderRadius: "4px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
  },
  mainChar: {
    zIndex: 1,
    fontWeight: 900,
    fontSize: "26px",
    fontFamily: "'Palatino', serif",
    lineHeight: 1,
    textAlign: "center",
  },
  buffBadgeBase: {
    position: "absolute",
    bottom: "-6px",
    left: "-6px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff", // ไอคอนสีขาว
    fontSize: "11px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
    border: "1.5px solid #fff",
    zIndex: 10,
  },
  statusDurationBadge: (isPoisoned, isBlind, isBleed) => ({
    position: "absolute",
    top: "-3px",
    left: "-3px",
    width: "15px",
    height: "15px",
    background: isBlind ? "#8e44ad" : isPoisoned ? "#2ecc71" : isBleed ? "#c0392b" : "#7f8c8d",
    borderRadius: "50%",
    border: "1px solid #fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "8px",
    color: "#fff",
    fontWeight: "bold",
    zIndex: 11,
  }),
  statusIconPos: {
    position: "absolute",
    top: "3px",
    right: "3px",
    zIndex: 5,
  },
  damageTextPos: {
    position: "absolute",
    bottom: "2px",
    right: "4px",
    fontSize: "10px",
    fontWeight: 900,
    opacity: 0.8,
    color: "#3e2723",
    textShadow: "1px 1px 0px rgba(255,255,255,0.7)",
    zIndex: 2,
  },
};