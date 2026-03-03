import React from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { motion } from "framer-motion";
import { THEMES } from "../../hook/const";
export const LetterPool = ({ poolLetters, onSelectLetter, onHint, hintsRemaining, status }) => {
  return (
    <Box sx={{ mt: "auto" }}>
      
      <Box 
        sx={{ 
          display: "flex", 
          flexWrap: "wrap",
          justifyContent: "center", 
          gap: { xs: 1, sm: 1.5 }, 
          mb: 3,
          maxWidth: "400px", 
          mx: "auto"
        }}
      >
        {poolLetters.map((item) => {
          // ถ้าปุ่มถูกใช้ไปแล้ว ให้โชว์เป็นหลุมดำมืดๆ
          if (item.isUsed) {
            return (
              <Box
                key={item.id}
                sx={{
                  width: { xs: 45, sm: 55 },
                  height: { xs: 45, sm: 55 },
                  background: "rgba(10,10,10,0.8)",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ opacity: 0.1, color: "#fff", fontSize: 16 }}>
                  {item.char}
                </Typography>
              </Box>
            );
          }

          // ปุ่มปกติที่ยังไม่โดนกด (สไตล์เดียวกับ Inventory Slot)
          return (
            <Box
              key={item.id}
              component={motion.div}
              whileHover={status === "playing" ? { scale: 1.05 } : {}}
              whileTap={status === "playing" ? { scale: 0.95 } : {}}
              onClick={() => onSelectLetter(item)}
              sx={{
                width: { xs: 45, sm: 55 },
                height: { xs: 45, sm: 55 },
                background: "linear-gradient(145deg, #ffffff, #e8dcc4)",
                border: "1px solid #5c4033",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.4)",
                cursor: status === "playing" ? "pointer" : "default",
                opacity: status === "playing" ? 1 : 0.6,
                // กรอบแวววาวเวลาเอาเมาส์ไปชี้
                "&:hover": {
                   border: status === "playing" ? "1px solid #d4af37" : "1px solid #5c4033",
                   boxShadow: status === "playing" ? "0 4px 8px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.6)" : "none",
                }
              }}
            >
              <Typography 
                sx={{ 
                  zIndex: 1, 
                  fontWeight: 900, 
                  fontSize: { xs: "20px", sm: "24px" },
                  fontFamily: "'Palatino', serif", // ใช้ฟอนต์เดียวกับโค้ดตัวอย่าง
                  color: "#3e2723", // สีน้ำตาลเข้ม
                  textShadow: "0.5px 1px 0px rgba(255,255,255,0.8)", 
                  lineHeight: 1,
                }}
              >
                {item.char}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* ปุ่ม HINT (ปรับสไตล์ให้กลมกลืนขึ้น) */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
                }
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