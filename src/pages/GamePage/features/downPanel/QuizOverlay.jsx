import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const QuizOverlay = ({ data, onAnswer, onTimeout }) => {
  const DURATION_MS = 5000;
  const [timeLeft, setTimeLeft] = useState(DURATION_MS);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // คำนวณ Grid ให้เหมาะสมกับจำนวนข้อมูลและขนาดหน้าจอ
  const gridStyle = useMemo(() => {
    const count = data.choices.length;
    return {
      display: "grid",
      gap: "10px",
      width: "100%",
      gridTemplateColumns: count <= 4 ? "repeat(auto-fit, minmax(200px, 1fr))" : "repeat(auto-fit, minmax(150px, 1fr))",
    };
  }, [data.choices.length]);

const handleChoice = useCallback((choice) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
    setIsAnswered(true);

    setTimeout(() => {
      if (choice === "TIMEOUT") {
        // 1. เช็คก่อนว่ามี function ส่งมาไหม ถ้ามีให้เรียก (ป้องกัน Error)
        if (typeof onTimeout === "function") {
          onTimeout();
        } else {
          // 2. ถ้าไม่มี ให้ส่งผลลัพธ์ "null" ไปที่ onAnswer แทน
          // เพื่อให้ Logic ฝั่ง Game Store มองว่าตอบผิด (isCorrect จะเป็น false)
          onAnswer(null); 
        }
      } else {
        onAnswer(choice);
      }
    }, 1500);
  }, [isAnswered, onAnswer, onTimeout]);

  useEffect(() => {
    if (isAnswered) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, DURATION_MS - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        handleChoice("TIMEOUT");
      }
    }, 50);
    return () => clearInterval(timer);
  }, [isAnswered, handleChoice]);

  return (
    <div style={styles.relativeWrapper}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.card}
      >
        {/* Progress Bar ด้านบนสุดของ Card */}
        <div style={styles.progressContainer}>
          <motion.div
            initial={{ width: "100%" }}
            animate={{ 
              width: isAnswered ? `${(timeLeft / DURATION_MS) * 100}%` : "0%",
              backgroundColor: timeLeft < 1500 ? "#ff4757" : "#F2A654" 
            }}
            transition={{ duration: isAnswered ? 0.3 : DURATION_MS / 1000, ease: "linear" }}
            style={styles.progressBar}
          />
        </div>

        <div style={styles.content}>
          <div style={styles.header}>
            <span style={styles.label}>LOGIC CHALLENGE</span>
            <h2 style={styles.questionText}>"{data.question}"</h2>
          </div>

          <div style={gridStyle}>
            {data.choices.map((choice, i) => (
              <ChoiceButton
                key={i}
                choice={choice}
                isCorrect={choice === data.correctAnswer}
                isSelected={choice === selectedChoice}
                isAnswered={isAnswered}
                onClick={() => handleChoice(choice)}
              />
            ))}
          </div>

          <div style={styles.footer}>
            <AnimatePresence mode="wait">
              {isAnswered ? (
                <motion.span
                  key="status"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ color: selectedChoice === data.correctAnswer ? "#2ecc71" : "#ff4d4d" }}
                >
                  {selectedChoice === data.correctAnswer ? "CORRECT!" : "WRONG!"}
                </motion.span>
              ) : (
                <span key="timer" style={styles.timerText}>
                  Time: {(timeLeft / 1000).toFixed(1)}s
                </span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ChoiceButton = ({ choice, isCorrect, isSelected, isAnswered, onClick }) => {
  const getVariant = () => {
    if (!isAnswered) return "idle";
    if (isCorrect) return "correct";
    if (isSelected) return "wrong";
    return "disabled";
  };

  const colors = {
    idle: { bg: "rgba(62, 39, 35, 0.7)", border: "#5D4037", text: "#F2A654" },
    correct: { bg: "#2ecc71", border: "#27ae60", text: "#fff" },
    wrong: { bg: "#ff4d4d", border: "#c0392b", text: "#fff" },
    disabled: { bg: "rgba(0,0,0,0.2)", border: "transparent", text: "#555" }
  };

  const current = colors[getVariant()];

  return (
    <motion.button
      whileHover={!isAnswered ? { scale: 1.02, backgroundColor: "rgba(93, 64, 55, 0.9)" } : {}}
      whileTap={!isAnswered ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={isAnswered}
      style={{
        ...styles.btnBase,
        backgroundColor: current.bg,
        borderColor: current.border,
        color: current.text,
        opacity: getVariant() === "disabled" ? 0.5 : 1
      }}
    >
      {choice}
    </motion.button>
  );
};

const styles = {
  relativeWrapper: {
    position: "relative",
    width: "100%",
    height: "100%", // หรือกำหนดเป็น min-height
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    boxSizing: "border-box"
  },
  card: {
    width: "100%",
    maxWidth: "700px",
    background: "#1a120b",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(242, 166, 84, 0.2)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
  },
  progressContainer: {
    width: "100%",
    height: "4px",
    background: "rgba(255,255,255,0.05)"
  },
  progressBar: {
    height: "100%",
    boxShadow: "0 0 10px rgba(242, 166, 84, 0.3)"
  },
  content: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  header: {
    textAlign: "center"
  },
  label: {
    fontSize: "0.7rem",
    letterSpacing: "3px",
    color: "#888",
    display: "block",
    marginBottom: "0.5rem"
  },
  questionText: {
    color: "#fff",
    fontSize: "clamp(1.2rem, 4vw, 1.8rem)", // ปรับขนาดตัวอักษรตามหน้าจออัตโนมัติ
    margin: 0,
    fontFamily: "serif"
  },
  btnBase: {
    padding: "15px 10px",
    borderRadius: "10px",
    border: "2px solid",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.2s ease",
    fontSize: "1rem"
  },
  footer: {
    textAlign: "center",
    minHeight: "1.5rem",
    fontWeight: "bold",
    fontFamily: "monospace"
  },
  timerText: {
    color: "#666",
    fontSize: "0.9rem"
  }
};