import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Tooltip Component
 * แสดงข้อมูลศัตรู หรือตัวเลขคาดการณ์ความเสียหาย/เกราะ เมื่อเอาเมาส์ไปชี้ที่ศัตรู
 * @param {Object} hoveredEnemy - ข้อมูลศัตรูที่กำลังถูกชี้
 * @param {Object} castingSkill - ข้อมูลสกิลที่ผู้เล่นกำลังเลือกใช้
 * @param {Object} damageInfo - ข้อมูลตัวเลขที่คำนวณมาแล้ว { text, value, isWeak }
 */
export const Tooltip = ({ hoveredEnemy, castingSkill, damageInfo }) => {
  return (
    <AnimatePresence>
      {hoveredEnemy && (
        <motion.div
          key="tooltip"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: "absolute",
            left: `${hoveredEnemy.x - 10}%`,
            top: "5%",
            transform: "translate(-50%, -115%)",
            zIndex: 9999,
            pointerEvents: "none",
            minWidth: "200px",
            maxWidth: "220px",
          }}
        >
          {/* Main Container Box */}
          <div
            style={{
              background: "#2e2019",
              border: "3px double #eebb55",
              borderRadius: "8px",
              padding: "12px",
              boxShadow: "0 6px 0 #1a0f0a, 0 15px 20px rgba(0,0,0,0.6)",
              color: "#f0e6d2",
              fontFamily: "'Courier New', Courier, serif",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            {castingSkill ? (
              // 🔥 PREVIEW MODE: แสดงตัวเลขความเสียหาย/เกราะที่จะได้รับ
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#eebb55",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    borderBottom: "1px solid rgba(238, 187, 85, 0.3)",
                    paddingBottom: "5px",
                    marginBottom: "8px",
                  }}
                >
                  {castingSkill.name}
                </div>

                {(() => {
                  const isShield = castingSkill.effectType === "SHIELD";
                  const mainColor = isShield ? "#81ecec" : "#ff7675";
                  return (
                    <>
                      <div
                        style={{
                          fontSize: "36px",
                          fontWeight: "900",
                          lineHeight: "1",
                          color: mainColor,
                          textShadow: "2px 2px 0 #000",
                        }}
                      >
                        {damageInfo.text}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#aaa",
                          marginBottom: "8px",
                          fontStyle: "italic",
                        }}
                      >
                        {isShield ? "- SHIELD GAIN -" : "- ESTIMATED DAMAGE -"}
                      </div>
                      {damageInfo.isWeak && (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          style={{
                            background: "#8b0000",
                            border: "1px solid #ff0000",
                            color: "#ffd700",
                            fontWeight: "bold",
                            fontSize: "12px",
                            padding: "4px 10px",
                            borderRadius: "4px",
                            display: "inline-block",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
                          }}
                        >
                          ⚡ WEAKNESS HIT!
                        </motion.div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              // ℹ️ INFO MODE: แสดง Stat พื้นฐานของศัตรู
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#eebb55",
                    textTransform: "uppercase",
                    borderBottom: "2px solid #eebb55",
                    paddingBottom: "6px",
                    marginBottom: "10px",
                    letterSpacing: "1px",
                    textShadow: "1px 1px 0 #000",
                  }}
                >
                  {hoveredEnemy.name}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: "6px",
                      borderRadius: "4px",
                      border: "1px solid #5c4033",
                    }}
                  >
                    <div
                      style={{
                        color: "#aaa",
                        fontSize: "10px",
                        textTransform: "uppercase",
                      }}
                    >
                      Health
                    </div>
                    <div
                      style={{
                        color: "#ff7675",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {hoveredEnemy.hp}{" "}
                      <span style={{ fontSize: "10px", color: "#888" }}>
                        / {hoveredEnemy.maxHp}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: "6px",
                      borderRadius: "4px",
                      border: "1px solid #5c4033",
                    }}
                  >
                    <div
                      style={{
                        color: "#aaa",
                        fontSize: "10px",
                        textTransform: "uppercase",
                      }}
                    >
                      Attack
                    </div>
                    <div
                      style={{
                        color: "#ffeaa7",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {hoveredEnemy.atk_power_min}-{hoveredEnemy.atk_power_max}
                    </div>
                  </div>
                </div>

                {/* ✅ Weakness Scrolling List (แสดงตัวอักษรที่ศัตรูแพ้ทาง) */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px dashed #5c4033",
                  }}
                >
                  <div
                    style={{
                      color: "#bfbfbf",
                      fontSize: "10px",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    Weakness
                  </div>

                  {hoveredEnemy.weakness_list &&
                  hoveredEnemy.weakness_list.length > 0 ? (
                    <div
                      style={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        maxWidth: "180px",
                        margin: "0 auto",
                        position: "relative",
                      }}
                    >
                      <motion.div
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                          repeat: Infinity,
                          ease: "linear",
                          duration: Math.max(
                            5,
                            hoveredEnemy.weakness_list.length * 2
                          ),
                        }}
                        style={{ display: "inline-flex", gap: "6px" }}
                      >
                        {/* Double the list for seamless looping */}
                        {[
                          ...hoveredEnemy.weakness_list,
                          ...hoveredEnemy.weakness_list,
                        ].map((w, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: "#581919",
                              border: "1px solid #a33838",
                              color: "#fff",
                              padding: "2px 8px",
                              borderRadius: "2px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              boxShadow: "1px 1px 0 #000",
                              flexShrink: 0,
                            }}
                          >
                            {w.alphabet.toUpperCase()}{" "}
                            <span style={{ color: "#ffd700" }}>
                              x{w.multiplier}
                            </span>
                          </span>
                        ))}
                      </motion.div>
                    </div>
                  ) : (
                    <span
                      style={{
                        color: "#666",
                        fontSize: "11px",
                        fontStyle: "italic",
                      }}
                    >
                      - None -
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Arrow (สามเหลี่ยมชี้ลงด้านล่างของ Tooltip) */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "10px solid #eebb55",
              margin: "0 auto",
              position: "relative",
              top: "-2px",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                borderTop: "7px solid #2e2019",
                position: "absolute",
                top: "-10px",
                left: "-7px",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};