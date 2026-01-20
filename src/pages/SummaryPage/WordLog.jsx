import React, { useMemo } from "react";
import { Box, Typography, Button, Paper, Chip } from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoltIcon from "@mui/icons-material/Bolt";
import { THEMES } from "../HomePage/hook/const";

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
      // ไล่ลำดับตัวลูกทีละ 0.05 วิ (เร็วๆ เพื่อความลื่นไหล)
      staggerChildren: 0.05,
      delayChildren: 0.2, // รอให้กล่องขยายเสร็จก่อนค่อยโผล่
    },
  },
};
const listItemVariants = {
  hidden: { opacity: 0, x: -20 }, // เริ่มจากจางและเยื้องซ้าย
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 150, damping: 12 }, // เด้งนิดๆ
  },
};

export default function WordLog({ wordLog, isWin, onBack, onExit }) {
  const wordList = useMemo(() => {
    if (!wordLog) return [];
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
          }}
        >
          {/* ✅ หุ้มด้วย motion.div เพื่อสั่ง Stagger */}
          <motion.div
            variants={listContainerVariants} // สั่งให้ลูกๆ ไล่ลำดับ
            initial="hidden"
            animate="visible"
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {wordList.map((entry, index) => (
              // ✅ เปลี่ยนแต่ละ Item เป็น motion.div
              <motion.div
                key={index}
                variants={listItemVariants} // รับคำสั่งจากตัวแม่
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
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: '"Press Start 2P"',
                        fontSize: "0.9rem",
                        color: THEMES.accent,
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
                      }}
                    >
                      {entry.meaning}{" "}
                      <span style={{ opacity: 0.5 }}>({entry.type})</span>
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
                      height: "24px",
                      "& .MuiChip-label": { paddingLeft: 1, paddingRight: 1 },
                    }}
                  />
                </Box>
              </motion.div>
            ))}
          </motion.div>

          {/* ถ้าไม่มีคำศัพท์ */}
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
        style={{ width: "100%", display: "flex", gap: 10 }}
      >
        <Button
          onClick={onBack}
          variant="outlined"
          sx={{
            ...commonButtonStyle,
            flex: 1,
            backgroundColor: "transparent",
            border: `2px solid ${THEMES.border}`,
            color: THEMES.textMain,
            boxShadow: "none",
          }}
        >
          BACK
        </Button>

        {/* <Button
          onClick={onExit}
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            ...commonButtonStyle,
            flex: 2,
            backgroundColor: isWin ? "#43a047" : "#c62828",
          }}
        >
          FINISH
        </Button> */}
      </motion.div>
    </motion.div>
  );
}

const commonButtonStyle = {
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
};
