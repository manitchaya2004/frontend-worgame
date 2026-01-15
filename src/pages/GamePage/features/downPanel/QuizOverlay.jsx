import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const QuizOverlay = ({ data, onAnswer, onTimeout }) => {
  const DURATION_MS = 5000;
  const [timeLeft, setTimeLeft] = useState(DURATION_MS);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const gridStyle = useMemo(() => {
    const count = data.choices.length;
    let cols = "1fr 1fr";
    if (count > 4) cols = "1fr 1fr 1fr";
    return {
      display: "grid",
      gap: "10px",
      width: "100%",
      gridTemplateColumns: cols,
    };
  }, [data.choices.length]);

  const handleChoice = useCallback((choice) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
    setIsAnswered(true);
    setTimeout(() => {
      if (choice === "TIMEOUT") {
        if (typeof onTimeout === "function") onTimeout();
        else onAnswer(null); 
      } else onAnswer(choice);
    }, 1200);
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.card}
      >
        {/* Time Bar แบบเด่น (หนาขึ้น + มีแสง) */}
        <div style={styles.timeBarBg}>
          <motion.div
            initial={{ width: "100%" }}
            animate={{ 
              width: isAnswered ? `${(timeLeft / DURATION_MS) * 100}%` : "0%",
              backgroundColor: timeLeft < 1500 ? "#ff4757" : "#2ecc71" 
            }}
            transition={{ duration: isAnswered ? 0.3 : DURATION_MS / 1000, ease: "linear" }}
            style={{
              ...styles.timeBarFill,
              boxShadow: `0 0 15px ${timeLeft < 1500 ? "#ff4757" : "#2ecc71"}`
            }}
          />
        </div>

        <div style={styles.content}>
          <div style={styles.header}>
            <span style={styles.label}>TIME REMAINING: {(timeLeft / 1000).toFixed(1)}s</span>
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
              {isAnswered && (
                <motion.span
                  key="status"
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  style={{ color: selectedChoice === data.correctAnswer ? "#2ecc71" : "#ff4d4d" }}
                >
                  {selectedChoice === data.correctAnswer ? "✦ CORRECT ✦" : "✘ INCORRECT"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ChoiceButton = ({ choice, isCorrect, isSelected, isAnswered, onClick }) => {
  const status = isAnswered 
    ? (isCorrect ? 'correct' : isSelected ? 'wrong' : 'dimmed') 
    : 'idle';

  const stylesMap = {
    idle: { bg: "rgba(78, 52, 46, 0.9)", border: "#8d6e63", text: "#F2A654" },
    correct: { bg: "#2ecc71", border: "#2ecc71", text: "#fff" },
    wrong: { bg: "#ff4757", border: "#ff4757", text: "#fff" },
    dimmed: { bg: "rgba(0,0,0,0.3)", border: "transparent", text: "#555" }
  };

  return (
    <motion.button
      whileHover={!isAnswered ? { scale: 1.02, backgroundColor: "#5d4037" } : {}}
      onClick={onClick}
      disabled={isAnswered}
      style={{
        ...styles.btnBase,
        backgroundColor: stylesMap[status].bg,
        borderColor: stylesMap[status].border,
        color: stylesMap[status].text,
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box"
  },
  card: {
    width: "100%",
    maxWidth: "850px",
    background: "#1a120b",
    borderRadius: "12px",
    overflow: "hidden",
    border: "2px solid #5d4037",
    boxShadow: "0 15px 50px rgba(0,0,0,0.7)"
  },
  timeBarBg: {
    width: "100%",
    height: "10px", // หนาขึ้นเพื่อให้เด่น
    background: "rgba(0,0,0,0.5)",
    borderBottom: "1px solid #333"
  },
  timeBarFill: {
    height: "100%",
    transition: "background-color 0.3s ease"
  },
  content: {
    padding: "20px 30px", // ปรับ Padding ให้สมดุล
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },
  header: {
    textAlign: "center"
  },
  label: {
    fontSize: "0.75rem",
    letterSpacing: "2px",
    color: "#888",
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold"
  },
  questionText: {
    color: "#fff",
    fontSize: "1.6rem", // ใหญ่ขึ้นกว่าแบบที่แล้วให้อ่านง่าย
    margin: 0,
    fontFamily: "serif",
    textShadow: "2px 2px 4px #000"
  },
  btnBase: {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "2px solid",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    textTransform: "uppercase",
    transition: "all 0.2s ease"
  },
  footer: {
    textAlign: "center",
    height: "24px", // ล็อคความสูงฟุตเตอร์ไม่ให้ขยับไปมา
    fontWeight: "bold",
    fontSize: "1.1rem"
  }
};