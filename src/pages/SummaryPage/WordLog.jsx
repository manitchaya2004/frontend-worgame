import React, { useMemo } from "react";
import { Box, Typography, Button, Paper, Chip } from "@mui/material";
import { motion } from "framer-motion";
import BoltIcon from "@mui/icons-material/Bolt";
import { THEMES } from "../HomePage/hook/const";

// Variants สำหรับ Animation (เหมือนเดิม)
const containerVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, staggerChildren: 0.05 },
  },
  exit: { opacity: 0, x: -50 },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const listContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 150, damping: 12 },
  },
};

export default function WordLog({ wordLog, isWin, onBack, onExit }) {
  const wordList = useMemo(() => {
    if (!wordLog) return [];
    // เรียงลำดับตามจำนวนครั้งที่ใช้ (count) จากมากไปน้อย
    return Object.values(wordLog).sort((a, b) => b.count - a.count);
  }, [wordLog]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        width: "90%",
        maxWidth: "600px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        alignItems: "center",
        // 💡 เพิ่มการจัดการความสูงและการเลื่อนสำหรับ Mobile Landscape
        maxHeight: "100vh",
        padding: "10px 0",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Typography
          sx={{
            fontFamily: '"Press Start 2P"',
            fontSize: "1.5rem",
            color: THEMES.textMain,
            textAlign: "center",
            textShadow: `2px 2px 0 ${THEMES.shadow}`,
            // 💡 ย่อฟอนต์
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: "1rem",
              textShadow: `1px 1px 0 ${THEMES.shadow}`,
            },
          }}
        >
          BATTLE LOG
        </Typography>
      </motion.div>

      {/* List Container */}
      <motion.div variants={itemVariants} style={{ width: "100%" }}>
        <Paper
          sx={{
            backgroundColor: THEMES.bgPanel,
            border: `3px solid ${THEMES.border}`,
            borderRadius: "12px",
            padding: "16px",
            maxHeight: "60vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            boxShadow: `0 8px 0 ${THEMES.shadow}`,
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": {
              background: THEMES.bgMain,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: THEMES.border,
              borderRadius: "4px",
            },
            // 💡 บีบ Padding และ Shadow ลง
            "@media (orientation: landscape) and (max-height: 450px)": {
              padding: "8px",
              boxShadow: `0 4px 0 ${THEMES.shadow}`,
              borderWidth: "2px",
              maxHeight: "50vh",
            },
          }}
        >
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {wordList.map((entry, index) => {
              // ✅ ปรับการดึงคำแปล: โครงสร้างใหม่ meaning อยู่ข้างใน entries[0]
              const displayMeaning = entry.entries && entry.entries[0] 
                ? entry.entries[0].meaning 
                : "No meaning available";
              
              const displayType = entry.type || (entry.entries && entry.entries[0]?.type) || "unknown";

              return (
                <motion.div
                  key={index}
                  variants={listItemVariants}
                  style={{ width: "100%" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: THEMES.bgMain,
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: `1px solid ${THEMES.border}`,
                      transition: "transform 0.1s",
                      "&:hover": {
                        transform: "translateX(4px)",
                        borderColor: THEMES.accent,
                      },
                      // 💡 บีบ Padding รายการคำศัพท์
                      "@media (orientation: landscape) and (max-height: 450px)": {
                        padding: "6px 8px",
                      },
                    }}
                  >
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Typography
                        sx={{
                          fontFamily: '"Press Start 2P"',
                          fontSize: "0.9rem",
                          color: THEMES.accent,
                          textTransform: "uppercase",
                          // 💡 ย่อคำศัพท์
                          "@media (orientation: landscape) and (max-height: 450px)": {
                            fontSize: "0.6rem",
                          },
                        }}
                      >
                        {entry.word}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          color: THEMES.textMain,
                          mt: 0.5,
                          // ป้องกันคำแปลยาวเกินไปจนเบียด Chip
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          // 💡 ย่อความหมาย
                          "@media (orientation: landscape) and (max-height: 450px)": {
                            fontSize: "0.6rem",
                            mt: 0.2,
                          },
                        }}
                      >
                        <span style={{ opacity: 0.7, marginRight: 6 }}>
                          {displayType}. 
                        </span>
                        {displayMeaning}{" "}
                      </Typography>
                    </Box>

                    <Chip
                      icon={<BoltIcon style={{ fontSize: 14, color: "#fff" }} />}
                      label={`x${entry.count}`}
                      size="small"
                      sx={{
                        backgroundColor: "#5d4037",
                        color: "#fff",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        height: "24px",
                        flexShrink: 0,
                        "& .MuiChip-label": { paddingLeft: 1, paddingRight: 1 },
                        "@media (orientation: landscape) and (max-height: 450px)": {
                          height: "18px",
                          fontSize: "0.6rem",
                          "& .MuiChip-icon": { fontSize: 10 }
                        },
                      }}
                    />
                  </Box>
                </motion.div>
              );
            })}
          </motion.div>

          {wordList.length === 0 && (
            <Typography
              sx={{
                textAlign: "center",
                color: "#777",
                fontFamily: "monospace",
                mt: 2,
              }}
            >
              No words recorded.
            </Typography>
          )}
        </Paper>
      </motion.div>

      {/* Buttons */}
      <motion.div
        variants={itemVariants}
        style={{ width: "100%", display: "flex", gap: 10, marginBottom: "auto" }}
      >
        <Button
          onClick={onBack}
          variant="outlined"
          sx={{
            fontFamily: '"Press Start 2P"',
            fontSize: "0.9rem",
            padding: "16px 0",
            borderRadius: "12px",
            boxShadow: `0 6px 0 ${THEMES.shadow}`,
            transition: "transform 0.1s",
            "&:hover": {
              transform: "translateY(2px)",
              boxShadow: `0 4px 0 ${THEMES.shadow}`,
              filter: "brightness(1.1)",
            },
            "&:active": { transform: "translateY(6px)", boxShadow: "none" },
            // สไตล์พื้นฐานของปุ่ม BACK
            flex: 1,
            backgroundColor: "transparent",
            border: `2px solid ${THEMES.border}`,
            color: THEMES.textMain,
            // 💡 ย่อปุ่มใน Landscape
            "@media (orientation: landscape) and (max-height: 450px)": {
              padding: "8px 0",
              fontSize: "0.6rem",
              boxShadow: `0 4px 0 ${THEMES.shadow}`,
              borderRadius: "8px",
              "&:hover": {
                boxShadow: `0 4px 0 ${THEMES.shadow}`,
              }
            },
          }}
        >
          BACK
        </Button>
      </motion.div>
    </motion.div>
  );
}