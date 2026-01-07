import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * QuizOverlay Component
 * หน้าจอคำถามที่จะปรากฏขึ้นระหว่างการเล่นเกม (เช่น ช่วง Quiz Mode)
 * @param {Object} data - ข้อมูลคำถาม { question, choices, correctAnswer }
 * @param {function} onAnswer - ฟังก์ชันเรียกเมื่อตอบคำถาม
 * @param {function} onTimeout - ฟังก์ชันเรียกเมื่อหมดเวลา
 */
export const QuizOverlay = ({ data, onAnswer, onTimeout }) => {
  const DURATION_MS = 5000; // เวลาในการตอบ 5 วินาที
  const [timeLeft, setTimeLeft] = useState(DURATION_MS);
  
  // State สำหรับติดตามการเลือกคำตอบและการจบ Logic
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    // ถ้าตอบแล้ว ให้หยุดการทำงานของ Timer
    if (isAnswered) return;

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, DURATION_MS - elapsed);
      
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(intervalId);
        if (!isAnswered) {
           handleChoice("TIMEOUT"); // หมดเวลาถือว่าตอบผิด
        }
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isAnswered]);

  // Handler จัดการการเลือกคำตอบและหน่วงเวลาแสดงผล
  const handleChoice = (choice) => {
    if (isAnswered) return; // ป้องกันการกดเบิ้ล

    setSelectedChoice(choice);
    setIsAnswered(true);

    // แสดงผลลัพธ์ค้างไว้ 1.5 วินาทีเพื่อให้ผู้เล่นเห็นว่าถูกหรือผิด ก่อนแจ้ง Parent
    setTimeout(() => {
        if (choice === "TIMEOUT") {
            onTimeout();
        } else {
            onAnswer(choice);
        }
    }, 1500); 
  };

  // Helper สำหรับจัดการ Style ของปุ่มตามสถานะ (ปกติ / ถูก / ผิด)
  const getButtonStyle = (choice) => {
    const isCorrect = choice === data.correctAnswer;
    const isSelected = choice === selectedChoice;

    let bgColor = "#4E342E"; // น้ำตาล (Default)
    let textColor = "#F2A654"; // ทอง (Default)
    let borderColor = "#8D6E63";

    if (isAnswered) {
        if (isCorrect) {
            bgColor = "#00b894"; // เขียว (ถูก)
            textColor = "#fff";
            borderColor = "#00cec9";
        } else if (isSelected) {
            bgColor = "#ff4d4d"; // แดง (เลือกผิด)
            textColor = "#fff";
            borderColor = "#ff7675";
        } else {
            // หม่นปุ่มอื่นๆ ลง
            bgColor = "#2d3436"; 
            textColor = "#636e72";
            borderColor = "#2d3436";
        }
    }

    return {
        padding: "18px",
        fontSize: "1.2rem",
        fontWeight: "bold",
        backgroundColor: bgColor, 
        color: textColor,
        border: `3px solid ${borderColor}`,
        borderRadius: "8px",
        cursor: isAnswered ? "default" : "pointer",
        boxShadow: isAnswered ? "none" : "0 5px 0 #281812",
        textTransform: "lowercase",
        position: "relative",
        fontFamily: "inherit",
        transition: "all 0.3s ease"
    };
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        backdropFilter: "blur(2px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        style={{
          background: "#261C15",
          padding: "5px",
          borderRadius: "12px",
          width: "95%",
          maxWidth: "800px",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 0 4px #000",
          border: "3px solid #5C4033",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Courier New', Courier, monospace",
        }}
      >
        <div style={{
            border: "3px solid #F2A654",
            borderRadius: "8px",
            padding: "30px",
            background: "linear-gradient(180deg, #3E2723 0%, #261C15 100%)",
            position: 'relative'
        }}>

            {/* Time Bar (แถบเวลาด้านบน) */}
            <div 
            style={{ 
                position: 'absolute', 
                top: '12px', 
                left: '20px', 
                right: '20px',
                height: '8px', 
                background: '#1a1a1a',
                borderRadius: '4px',
                border: '1px solid #5C4033',
                overflow: 'hidden'
            }}
            >
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: isAnswered ? `${(timeLeft / DURATION_MS) * 100}%` : "0%" }}
                transition={{ duration: isAnswered ? 0 : DURATION_MS / 1000, ease: "linear" }}
                style={{
                    height: "100%",
                    background: timeLeft < 1500 
                        ? "linear-gradient(90deg, #ff4d4d, #e74c3c)" // กระพริบแดงเมื่อใกล้หมดเวลา
                        : "linear-gradient(90deg, #00b894, #00cec9)",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.3)"
                }}
            />
            </div>

            <h3 style={{ 
                color: "#F2A654",
                marginTop: "25px",
                marginBottom: "15px", 
                textTransform: "uppercase", 
                fontSize: '1rem',
                letterSpacing: '2px',
                textShadow: "1px 1px 0 #000"
            }}>
                Meaning Logic
            </h3>
            
            <h1 style={{ 
                fontSize: "2.5rem",
                margin: "0 0 35px 0",
                color: "#fff",
                lineHeight: 1.4,
                textShadow: "3px 3px 0 #000",
                fontWeight: "bold"
            }}>
                "{data.question}"
            </h1>

            {/* Choices Grid */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "20px",
                padding: "0 20px"
            }}>
            {data.choices.map((choice, i) => (
                <motion.button
                key={i}
                whileHover={!isAnswered ? { scale: 1.02, backgroundColor: "#5D4037", translateY: -2 } : {}}
                whileTap={!isAnswered ? { scale: 0.98, translateY: 0 } : {}}
                onClick={() => handleChoice(choice)}
                style={getButtonStyle(choice)}
                >
                {choice}
                </motion.button>
            ))}
            </div>

            {/* Status Footer (แสดงผลถูก/ผิด หรือ เวลาที่เหลือ) */}
            <div style={{ marginTop: '30px', fontSize: '1rem', color: '#8D6E63', fontWeight: 'bold' }}>
                {isAnswered ? (
                    <span style={{ 
                        color: selectedChoice === data.correctAnswer ? "#00b894" : "#ff4d4d",
                        fontSize: "1.2rem",
                        textTransform: "uppercase" 
                    }}>
                        {selectedChoice === data.correctAnswer ? "CORRECT!" : "WRONG!"}
                    </span>
                ) : (
                    <>Time Left: <span style={{ color: timeLeft < 1500 ? '#ff4d4d' : '#F2A654' }}>{(timeLeft / 1000).toFixed(1)}s</span></>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
};