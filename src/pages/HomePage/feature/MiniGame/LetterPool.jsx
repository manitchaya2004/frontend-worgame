import React from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import FastForwardIcon from '@mui/icons-material/FastForward';
import { motion, AnimatePresence } from "framer-motion";

export const LetterPool = ({ poolLetters, onSelectLetter, onHint, onReveal, hintsRemaining, status }) => {
  // กรองเอาเฉพาะตัวที่ยังไม่ถูกใช้งานมาแสดง
  const availableLetters = poolLetters.filter(item => !item.isUsed);

  return (
    <Box 
      sx={{ 
        mt: "auto", 
        // 💡 ใน Landscape ปรับลดขอบล่างไม่ให้ล้นกล่อง
        "@media (orientation: landscape) and (max-height: 450px)": { mt: "auto" } 
      }}
    >
      <Box 
        sx={{ 
          display: "flex", 
          flexWrap: "wrap",
          justifyContent: "center", 
          gap: { xs: 1, sm: 1.5 }, 
          mb: 3,
          maxWidth: "100%", 
          px: 1,
          mx: "auto",
          // 💡 ย่อระยะห่างตัวอักษรด้านล่างสุด
          "@media (orientation: landscape) and (max-height: 450px)": {
            gap: 0.5,
            mb: 1,
          },
        }}
      >
        <AnimatePresence>
          {availableLetters.map((item) => (
            <Box
              key={item.id}
              // 💡 THE FIX: ใช้ layout ให้มันเลื่อนสไลด์เข้าหากันตอนมีตัวหายไป
              component={motion.div}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0, transition: { duration: 0.15 } }}
              whileHover={status === "playing" ? { scale: 1.1 } : {}}
              whileTap={status === "playing" ? { scale: 0.9 } : {}}
              onClick={() => onSelectLetter(item)}
              sx={{
                width: { xs: 40, sm: 50 },
                height: { xs: 40, sm: 50 },
                background: "linear-gradient(145deg, #ffffff, #e8dcc4)",
                border: "2px solid #5c4033",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                boxShadow: "0 4px 6px rgba(0,0,0,0.5), inset 0 -3px 0 rgba(0,0,0,0.1)",
                cursor: status === "playing" ? "pointer" : "default",
                opacity: status === "playing" ? 1 : 0.6,
                "&:hover": {
                   border: status === "playing" ? "2px solid #d4af37" : "2px solid #5c4033",
                   boxShadow: status === "playing" ? "0 6px 12px rgba(0,0,0,0.6), inset 0 -3px 0 rgba(212,175,55,0.3)" : "none",
                },
                // 💡 ย่อขนาดตัวอักษรให้พอดีกับจอแคบ
                "@media (orientation: landscape) and (max-height: 450px)": {
                  width: 32,
                  height: 32,
                },
              }}
            >
              <Typography 
                sx={{ 
                  zIndex: 1, 
                  fontWeight: 900, 
                  fontSize: { xs: "18px", sm: "22px" },
                  fontFamily: "'Palatino', serif", 
                  color: "#3e2723", 
                  textShadow: "0.5px 1px 0px rgba(255,255,255,0.8)", 
                  lineHeight: 1,
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: "14px",
                  },
                }}
              >
                {item.char}
              </Typography>
            </Box>
          ))}
        </AnimatePresence>
      </Box>

      {/* แถบปุ่มช่วยเหลือ (REVEAL & HINT) */}
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          px: { xs: 1, sm: 3 },
          "@media (orientation: landscape) and (max-height: 450px)": {
            px: 1,
          },
        }}
      >
        <Button
          onClick={onReveal}
          disabled={status !== "playing"}
          startIcon={<FastForwardIcon sx={{ color: "#ff8a65" }} />}
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: "#ff8a65", 
            border: `2px solid #555`,
            borderRadius: "20px",
            backgroundColor: "rgba(0,0,0,0.6)",
            "&:hover": {
              backgroundColor: "rgba(255, 138, 101, 0.1)",
              border: `2px solid #ff8a65`,
            },
            // 💡 ย่อปุ่มให้บางลง
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 8,
              padding: "4px 8px",
            },
          }}
        >
          REVEAL
        </Button>

        <Tooltip title={hintsRemaining > 0 ? "Use Hint" : "No hints left!"} arrow placement="top">
          <span>
            <Button
              onClick={onHint}
              disabled={hintsRemaining <= 0 || status !== "playing"}
              startIcon={<LightbulbIcon sx={{ color: hintsRemaining > 0 ? "#FFD700" : "inherit" }} />}
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 10,
                color: hintsRemaining > 0 ? "#FFD700" : "#777",
                border: `2px solid ${hintsRemaining > 0 ? "#FFD700" : "#555"}`,
                borderRadius: "20px",
                backgroundColor: "rgba(0,0,0,0.6)",
                boxShadow: hintsRemaining > 0 ? "0 2px 8px rgba(255, 215, 0, 0.2)" : "none",
                "&:hover": {
                  backgroundColor: hintsRemaining > 0 ? "rgba(255, 215, 0, 0.1)" : "rgba(0,0,0,0.6)",
                },
                // 💡 ย่อปุ่มให้บางลง
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 8,
                  padding: "4px 8px",
                },
              }}
            >
              HINT ({hintsRemaining})
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};