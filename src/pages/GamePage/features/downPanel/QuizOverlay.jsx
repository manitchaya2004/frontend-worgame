import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const QuizOverlay = ({ data, onAnswer, onTimeout }) => {
  const DURATION_MS = 5000;
  const [timeLeft, setTimeLeft] = useState(DURATION_MS);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // --- 🛠️ Logic การจัดการพื้นที่ (Responsive Grid) ---
  const count = data.choices.length;
  
  // ถ้าตัวเลือกเยอะ (6 ข้อขึ้นไป) ให้แบ่งเป็น 3 คอลัมน์เพื่อใช้ความกว้างให้เต็มที่
  let gridCols = "1fr 1fr"; 
  if (count > 4) gridCols = "1fr 1fr 1fr";
  if (count > 9) gridCols = "1fr 1fr 1fr 1fr"; // ถ้าเยอะมากแบ่ง 4

  // ปรับขนาดฟอนต์ตามจำนวนข้อ
  const fontSize = count > 6 ? "0.9rem" : "1.1rem";
  const paddingSize = count > 6 ? "10px 5px" : "15px";

  useEffect(() => {
    if (isAnswered) return;
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, DURATION_MS - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(intervalId);
        if (!isAnswered) handleChoice("TIMEOUT");
      }
    }, 100);
    return () => clearInterval(intervalId);
  }, [isAnswered]);

  const handleChoice = (choice) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
    setIsAnswered(true);
    setTimeout(() => {
      if (choice === "TIMEOUT") onTimeout();
      else onAnswer(choice);
    }, 1200);
  };

  const getButtonStyle = (choice) => {
    const isCorrect = choice === data.correctAnswer;
    const isSelected = choice === selectedChoice;
    let bgColor = "#4E342E"; 
    let textColor = "#F2A654";
    let borderColor = "#8D6E63";

    if (isAnswered) {
      if (isCorrect) { bgColor = "#00b894"; textColor = "#fff"; borderColor = "#00cec9"; }
      else if (isSelected) { bgColor = "#ff4d4d"; textColor = "#fff"; borderColor = "#ff7675"; }
      else { bgColor = "#2d3436"; textColor = "#636e72"; borderColor = "#2d3436"; }
    }

    return {
      padding: paddingSize,
      fontSize: fontSize,
      fontWeight: "bold",
      backgroundColor: bgColor,
      color: textColor,
      border: `2px solid ${borderColor}`,
      borderRadius: "6px",
      cursor: isAnswered ? "default" : "pointer",
      boxShadow: isAnswered ? "none" : "0 3px 0 #281812",
      textTransform: "lowercase",
      transition: "all 0.2s ease",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "45px"
    };
  };

  return (
    <div style={styles.overlay}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={styles.container}
      >
        <div style={styles.inner}>
          {/* แถบเวลาแบบยาวเต็มความกว้าง */}
          <div style={styles.timeBarBg}>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: isAnswered ? `${(timeLeft / DURATION_MS) * 100}%` : "0%" }}
              transition={{ duration: isAnswered ? 0 : DURATION_MS / 1000, ease: "linear" }}
              style={{
                height: "100%",
                background: timeLeft < 1500 ? "#ff4757" : "#2ecc71",
              }}
            />
          </div>

          <h3 style={styles.subTitle}>MEANING LOGIC</h3>
          <h1 style={{ ...styles.question, fontSize: count > 6 ? "1.6rem" : "2.2rem" }}>
            "{data.question}"
          </h1>

          {/* 🧩 Grid Layout ที่ใช้ความกว้างให้เป็นประโยชน์ */}
          <div style={{ 
            ...styles.grid, 
            gridTemplateColumns: gridCols,
          }}>
            {data.choices.map((choice, i) => (
              <motion.button
                key={i}
                whileHover={!isAnswered ? { scale: 1.03, backgroundColor: "#5D4037" } : {}}
                onClick={() => handleChoice(choice)}
                style={getButtonStyle(choice)}
              >
                {choice}
              </motion.button>
            ))}
          </div>

          <div style={styles.footer}>
            {isAnswered ? (
              <span style={{ color: selectedChoice === data.correctAnswer ? "#2ecc71" : "#ff4757", fontSize: "1.2rem" }}>
                {selectedChoice === data.correctAnswer ? "✔ CORRECT" : "✘ WRONG"}
              </span>
            ) : (
              <span style={{ color: "#888" }}>
                TIME: <span style={{ color: timeLeft < 1500 ? "#ff4757" : "#F2A654" }}>{(timeLeft/1000).toFixed(1)}s</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.9)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, backdropFilter: "blur(4px)"
  },
  container: {
    width: "95%", maxWidth: "900px", background: "#261C15", padding: "4px", borderRadius: "10px", border: "2px solid #5C4033"
  },
  inner: {
    background: "linear-gradient(180deg, #3E2723 0%, #1a120b 100%)", borderRadius: "8px", padding: "20px", border: "2px solid #F2A654", textAlign: "center"
  },
  timeBarBg: {
    width: "100%", height: "6px", background: "#111", borderRadius: "3px", overflow: "hidden", marginBottom: "15px", border: "1px solid #444"
  },
  subTitle: { color: "#888", fontSize: "0.7rem", letterSpacing: "2px", margin: "0 0 5px 0" },
  question: { color: "#fff", margin: "0 0 20px 0", textShadow: "2px 2px 0 #000", fontWeight: "bold", lineHeight: "1.2" },
  grid: {
    display: "grid", gap: "10px", width: "100%", padding: "5px"
  },
  footer: { marginTop: "20px", fontWeight: "bold", fontFamily: "monospace" }
};