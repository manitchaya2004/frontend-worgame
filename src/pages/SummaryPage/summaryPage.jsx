// SummaryPage.jsx
 // ถ้าไม่มีข้อมูล ให้ดีดกลับหน้าเลือกด่าน
  // if (!result) {
  //   navigate("/home");
  //   return null;
  // }
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Grid, Chip, Paper } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "../HomePage/hook/const"; // หรือ path ที่คุณเก็บ theme
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReplayIcon from "@mui/icons-material/Replay";
import HomeIcon from "@mui/icons-material/Home";
import SkullIcon from "@mui/icons-material/SentimentVeryDissatisfied"; // สำหรับตอนแพ้

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.3, // เว้นระยะห่างการโชว์ทีละ 0.3 วิ
    },
  },
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 12 },
  },
};

const dropInVariants = {
  hidden: { y: "-100vh", opacity: 0 },
  visible: {
    y: "0",
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

export default function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 📥 รับค่าจากหน้า Battle
  // อย่าลืมส่ง stageId มาด้วย ถ้าอยากให้กลับไปแล้ว Auto Stamp
  const { result, earnedCoins, wordLog, stageId } = location.state || {};
  
  // Mock Exp (ถ้าในอนาคตมีระบบ Exp)
  const earnedExp = 150; 

  const isWin = result === "WIN";

  // ฟังก์ชันกลับหน้าแผนที่
  const handleExit = () => {
    // ส่ง stageId กลับไป เพื่อให้ Adventure รู้ว่าด่านนี้เพิ่งเล่นจบ
    // ถ้าชนะ -> ส่ง justCompletedStageId เพื่อไปทำอนิเมชั่น Stamp
    if (isWin && stageId) {
      navigate("/home", {
        state: { justCompletedStageId: stageId },
      });
    } else {
      // ถ้าแพ้ หรือไม่มี stageId ก็กลับไปเฉยๆ
      navigate("/home");
    }
  };

  // ดึงรายการคำศัพท์ (รองรับทั้ง Array และ Object keys)
  const wordList = React.useMemo(() => {
    if (!wordLog) return [];
    return Array.isArray(wordLog) ? wordLog : Object.keys(wordLog);
  }, [wordLog]);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.9)", // พื้นหลังมืด
        backgroundImage: "radial-gradient(circle, rgba(62,39,35,0.4) 0%, rgba(0,0,0,1) 100%)",
        overflow: "hidden",
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: "90%",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* =======================
            1. HEADER: WIN / LOSE
        ======================= */}
        <motion.div variants={dropInVariants}>
          <Typography
            sx={{
              fontFamily: '"Press Start 2P", serif',
              fontSize: { xs: "2rem", md: "3.5rem" },
              color: isWin ? "#ffd700" : "#ef5350",
              textShadow: isWin
                ? "4px 4px 0px #b8860b, 0 0 20px rgba(255, 215, 0, 0.6)"
                : "4px 4px 0px #b71c1c, 0 0 20px rgba(239, 83, 80, 0.6)",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {isWin ? "MISSION\nCOMPLETE" : "GAME\nOVER"}
          </Typography>
        </motion.div>

        {/* =======================
            2. REWARD CARD
        ======================= */}
        <motion.div variants={itemVariants} style={{ width: "100%" }}>
          <Paper
            elevation={6}
            sx={{
              backgroundColor: "rgba(30, 30, 30, 0.8)",
              border: `4px solid ${isWin ? "#ffd700" : "#555"}`,
              borderRadius: "16px",
              padding: "24px",
              backdropFilter: "blur(5px)",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Rewards Title */}
            <Typography
              sx={{
                fontFamily: '"Press Start 2P"',
                fontSize: "1rem",
                color: "#fff",
                textAlign: "center",
                opacity: 0.8,
                mb: 1,
              }}
            >
              {isWin ? "- BATTLE REWARDS -" : "- RESULT -"}
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              {/* COINS */}
              <Grid item>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MonetizationOnIcon
                    sx={{ color: "#ffd700", fontSize: 40 }}
                  />
                  <Box>
                    <Typography sx={{ color: "#aaa", fontSize: "0.7rem", fontFamily: "monospace" }}>
                      COINS
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Press Start 2P"',
                        fontSize: "1.5rem",
                        color: "#fff",
                      }}
                    >
                      +{earnedCoins || 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* EXP (Optional) */}
              <Grid item>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmojiEventsIcon
                    sx={{ color: "#42a5f5", fontSize: 40 }}
                  />
                  <Box>
                    <Typography sx={{ color: "#aaa", fontSize: "0.7rem", fontFamily: "monospace" }}>
                      EXP
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Press Start 2P"',
                        fontSize: "1.5rem",
                        color: "#fff",
                      }}
                    >
                      +{earnedExp}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* =======================
            3. WORD LOG SECTION
        ======================= */}
        <motion.div variants={itemVariants} style={{ width: "100%" }}>
           <Paper
            sx={{
              backgroundColor: "#3e2723", // สีไม้เข้ม
              border: "3px solid #6d4c41",
              borderRadius: "12px",
              padding: "16px",
              maxHeight: "150px", // จำกัดความสูงถ้าคำเยอะ
              overflowY: "auto",
              // Custom Scrollbar
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-thumb": { background: "#8d6e63", borderRadius: "4px" },
            }}
           >
              <Typography sx={{ fontFamily: '"Press Start 2P"', fontSize: "0.8rem", color: "#d7ccc8", mb: 2, textAlign: "center" }}>
                 VOCABULARY USED ({wordList.length})
              </Typography>
              
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                 {wordList.length > 0 ? (
                    wordList.map((word, index) => (
                      <Chip 
                        key={index} 
                        label={word} 
                        sx={{ 
                          backgroundColor: "#5d4037", 
                          color: "#fff",
                          fontFamily: "monospace",
                          border: "1px solid #8d6e63"
                        }} 
                      />
                    ))
                 ) : (
                    <Typography sx={{ color: "#aaa", fontSize: "0.8rem", fontStyle: "italic" }}>
                      No words used...
                    </Typography>
                 )}
              </Box>
           </Paper>
        </motion.div>

        {/* =======================
            4. ACTION BUTTON
        ======================= */}
        <motion.div variants={itemVariants} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleExit}
            variant="contained"
            startIcon={isWin ? <HomeIcon /> : <ReplayIcon />} // ชนะกลับบ้าน แพ้ลองใหม่(สัญลักษณ์สื่อความหมาย)
            sx={{
              fontFamily: '"Press Start 2P"',
              fontSize: "1rem",
              padding: "15px 40px",
              width: "100%",
              maxWidth: "300px",
              borderRadius: "12px",
              backgroundColor: isWin ? "#43a047" : "#c62828",
              borderBottom: "6px solid rgba(0,0,0,0.3)", // 3D Effect
              boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
              transition: "transform 0.1s",
              "&:hover": {
                backgroundColor: isWin ? "#2e7d32" : "#b71c1c",
                transform: "translateY(2px)",
                borderBottom: "4px solid rgba(0,0,0,0.3)",
              },
              "&:active": {
                transform: "translateY(6px)",
                borderBottom: "0px solid rgba(0,0,0,0.3)",
              },
            }}
          >
            {isWin ? "CONTINUE" : "BACK TO ADVENTURE"}
          </Button>
        </motion.div>

      </motion.div>
    </Box>
  );
}