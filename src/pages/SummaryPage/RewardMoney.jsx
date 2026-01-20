import React from "react";
import { Box, Typography, Button, Paper, Divider } from "@mui/material";
import { motion } from "framer-motion";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReplayIcon from "@mui/icons-material/Replay";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied"; // ไอคอนหน้าเศร้า
import { THEMES } from "../HomePage/hook/const";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, staggerChildren: 0.1 },
  },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 150 } },
};

export default function RewardMoney({
  isWin,
  earnedCoins,
  stageCoins,
  hasWordLog,
  onNextStep,
  onExit,
}) {
  const monsterMoney = earnedCoins || 0;
  const rewardMoney = stageCoins || 0;
  const totalMoney = monsterMoney + rewardMoney;

  // ✅ เงื่อนไข: จะโชว์การ์ดเงินก็ต่อเมื่อมีเงินมากกว่า 0
  const showRewardCard = totalMoney > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        width: "90%",
        maxWidth: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        alignItems: "center",
      }}
    >
      {/* 1. Header (Victory/Defeat) */}
      <motion.div variants={itemVariants} style={{ textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: '"Press Start 2P", serif',
            fontSize: { xs: "2rem", md: "3.5rem" },
            color: isWin ? THEMES.accent : "#ef5350",
            textShadow: `4px 4px 0px ${THEMES.shadow}`,
            mb: 1,
          }}
        >
          {isWin ? "VICTORY!" : "DEFEAT"}
        </Typography>
        <Typography
          sx={{
            fontFamily: "monospace",
            color: THEMES.textMain,
            fontSize: "0.9rem",
          }}
        >
          {isWin ? "Splendid performance!" : "You fought bravely..."}
        </Typography>
      </motion.div>

      {/* 2. Money Card OR Empty State */}
      <motion.div variants={itemVariants} style={{ width: "100%" }}>
        <Paper
          elevation={6}
          sx={{
            backgroundColor: THEMES.bgPanel,
            border: `4px solid ${isWin ? THEMES.accent : THEMES.border}`,
            borderRadius: "16px",
            padding: "24px",
            boxShadow: `0 10px 0 ${THEMES.shadow}`,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Press Start 2P"',
              fontSize: "0.9rem",
              color: THEMES.textMain,
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            - REWARDS -
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <RowLabelValue label="Monster Coins" value={`+${monsterMoney}`} />
            <RowLabelValue
              label="Stage Bonus"
              value={rewardMoney > 0 ? `+${rewardMoney}` : "0"}
              highlight={rewardMoney > 0}
            />

            <Divider
              sx={{
                borderColor: THEMES.border,
                my: 1,
                borderStyle: "dashed",
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  color: "#fff",
                  fontFamily: '"Press Start 2P"',
                  fontSize: "1rem",
                }}
              >
                TOTAL
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MonetizationOnIcon sx={{ color: "#ffd700", fontSize: 28 }} />
                <Typography
                  sx={{
                    color: "#ffd700",
                    fontFamily: '"Press Start 2P"',
                    fontSize: "1.5rem",
                  }}
                >
                  {totalMoney}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* 3. Action Buttons */}
      <motion.div
        variants={itemVariants}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* ปุ่มดูคำศัพท์ (ยังคงโชว์อยู่ แม้ไม่ได้เงิน เพื่อให้เข้าไปดูได้) */}
        {hasWordLog && (
          <Button
            onClick={onNextStep}
            variant="contained"
            startIcon={<MenuBookIcon />}
            sx={{
              ...commonButtonStyle,
              backgroundColor: THEMES.border,
              color: THEMES.accent,
              border: `2px solid ${THEMES.shadow}`,
              // ถ้าไม่ได้เงิน ปุ่มนี้จะเด่นขึ้นมาหน่อย
              animation: !showRewardCard ? "pulse 2s infinite" : "none",
            }}
          >
            REVIEW BATTLE LOG
          </Button>
        )}

        {/* ปุ่มจบ/เล่นใหม่ */}
        <Button
          onClick={onExit}
          variant="contained"
          endIcon={isWin ? <ArrowForwardIcon /> : <ReplayIcon />}
          sx={{
            ...commonButtonStyle,
            backgroundColor: isWin ? "#43a047" : "#c62828",
          }}
        >
          BACK TO ADVENTURE
        </Button>
      </motion.div>
    </motion.div>
  );
}

// Sub-components
const RowLabelValue = ({ label, value, highlight }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography
      sx={{ color: THEMES.textMain, fontFamily: "monospace", fontSize: "1rem" }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        color: highlight ? THEMES.accent : "#fff",
        fontFamily: '"Press Start 2P"',
        fontSize: "0.9rem",
      }}
    >
      {value}
    </Typography>
  </Box>
);

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
