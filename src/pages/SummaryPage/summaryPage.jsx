import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReplayIcon from "@mui/icons-material/Replay";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BoltIcon from "@mui/icons-material/Bolt";
import WordLog from "./WordLog";
import RewardMoney from "./RewardMoney";

export default function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, earnedCoins, stageCoins, wordLog, stageId } =
    location.state || {};

  const [step, setStep] = useState(1); // 1 = Money, 2 = Log
  const isWin = result === "WIN";

  const handleExit = () => {
    if (isWin && stageId) {
      navigate("/home", { state: { completedStageId: stageId } });
    } else {
      navigate("/home");
    }
  };

  // ถ้าไม่มี state (เช่น refresh หน้า) ให้กัน error ไว้
  if (!location.state) {
    navigate("/home");
    return null;
  }

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // พื้นหลังเรนเดอร์ทันที ไม่ต้องรอ Animation
        overflow: "hidden",
      }}
    >
    
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <RewardMoney
            key="reward"
            isWin={isWin}
            earnedCoins={earnedCoins}
            stageCoins={stageCoins}
            hasWordLog={wordLog && Object.keys(wordLog).length > 0}
            onNextStep={() => setStep(2)}
            onExit={handleExit}
          />
        ) : (
          <WordLog
            key="log"
            wordLog={wordLog}
            isWin={isWin}
            onBack={() => setStep(1)}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
