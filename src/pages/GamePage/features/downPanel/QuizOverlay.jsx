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
        {/* Time Bar แบบ Black Theme */}
        <div style={styles.timeBarBg}>
          <motion.div
            initial={{ width: "100%" }}
            animate={{ 
              width: isAnswered ? `${(timeLeft / DURATION_MS) * 100}%` : "0%",
              backgroundColor: timeLeft < 1500 ? "#c0392b" : "#27ae60" // แดงเข้ม/เขียวเข้ม
            }}
            transition={{ duration: isAnswered ? 0.3 : DURATION_MS / 1000, ease: "linear" }}
            style={{
              ...styles.timeBarFill,
              boxShadow: `0 0 10px ${timeLeft < 1500 ? "#c0392b" : "#27ae60"}`
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
                  style={{ 
                    color: selectedChoice === data.correctAnswer ? "#2ecc71" : "#e74c3c",
                    textShadow: "0 2px 2px #000"
                  }}
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

/* =========================================
   CHOICE BUTTON (Black Tone)
   ========================================= */
const ChoiceButton = ({ choice, isCorrect, isSelected, isAnswered, onClick }) => {
  const status = isAnswered 
    ? (isCorrect ? 'correct' : isSelected ? 'wrong' : 'dimmed') 
    : 'idle';

  const stylesMap = {
    // Idle: ดำโปร่ง + ขอบน้ำตาล
    idle: { 
        bg: "rgba(30, 30, 30, 0.6)", 
        border: "#4d3a2b", 
        text: "#d4af37", // สีทอง
        shadow: "none"
    },
    // Correct: เขียวเข้ม
    correct: { 
        bg: "rgba(39, 174, 96, 0.8)", 
        border: "#2ecc71", 
        text: "#fff",
        shadow: "0 0 10px #2ecc71"
    },
    // Wrong: แดงเข้ม
    wrong: { 
        bg: "rgba(192, 57, 43, 0.8)", 
        border: "#c0392b", 
        text: "#fff",
        shadow: "0 0 10px #c0392b"
    },
    // Dimmed: จางลงไปเลย
    dimmed: { 
        bg: "rgba(0,0,0,0.2)", 
        border: "transparent", 
        text: "#555",
        shadow: "none"
    }
  };

  return (
    <motion.button
      whileHover={!isAnswered ? { 
          scale: 1.02, 
          backgroundColor: "rgba(60, 60, 60, 0.8)", 
          borderColor: "#8a6d3b" 
      } : {}}
      whileTap={!isAnswered ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={isAnswered}
      style={{
        ...styles.btnBase,
        backgroundColor: stylesMap[status].bg,
        borderColor: stylesMap[status].border,
        color: stylesMap[status].text,
        boxShadow: stylesMap[status].shadow
      }}
    >
      {choice}
    </motion.button>
  );
};

/* =========================================
   STYLES (Black Tone Theme)
   ========================================= */
const styles = {
  relativeWrapper: {
    position: "relative",
    width: "100%",
    height: "100%", // เต็มพื้นที่
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px", // ลด padding ลงหน่อยจะได้ไม่กินที่มาก
    boxSizing: "border-box"
  },
  card: {
    width: "100%",
    maxWidth: "800px",
    // ✅ Black Tone Theme: ดำโปร่งแสง + ขอบน้ำตาลเข้ม
    background: "rgba(0, 0, 0, 0.85)", 
    borderRadius: "12px",
    overflow: "hidden",
    border: "2px solid #4d3a2b",
    boxShadow: "0 0 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)",
    backdropFilter: "blur(5px)"
  },
  timeBarBg: {
    width: "100%",
    height: "6px",
    background: "rgba(255,255,255,0.1)",
    borderBottom: "1px solid #333"
  },
  timeBarFill: {
    height: "100%",
    transition: "background-color 0.3s ease"
  },
  content: {
    padding: "20px 30px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  header: {
    textAlign: "center",
    borderBottom: "1px solid #4d3a2b", // เส้นคั่นบางๆ
    paddingBottom: "15px",
    marginBottom: "5px"
  },
  label: {
    fontSize: "0.75rem",
    letterSpacing: "2px",
    color: "#888",
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  questionText: {
    color: "#f1c40f", // สีทองสว่าง
    fontSize: "1.8rem",
    margin: 0,
    fontFamily: '"Cinzel", serif', // ใช้ Font เดียวกับเกม
    textShadow: "0 2px 5px rgba(0,0,0,1)",
    lineHeight: "1.3"
  },
  btnBase: {
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid", // ขอบบางลงเพื่อให้ดู Elegant
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1.1rem",
    textTransform: "uppercase",
    transition: "all 0.2s ease",
    fontFamily: '"Cinzel", serif', // ใช้ Font เดียวกับเกม
    letterSpacing: "1px"
  },
  footer: {
    textAlign: "center",
    height: "24px",
    fontWeight: "900",
    fontSize: "1.2rem",
    marginTop: "5px"
  }
};