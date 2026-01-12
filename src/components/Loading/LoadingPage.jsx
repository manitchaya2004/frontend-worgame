import { Backdrop, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import StarBackground from "../../pages/HomePage/components/StarBackground";
// สุ่มคำแนะนำเกม (แก้ข้อความได้ตามใจชอบ)
const TIPS = [
  "Tip: Strength increases your physical damage.",
  "Tip: Intelligence boosts your magical power.",
  "Tip: Don't forget to check the shop for new heroes.",
  "Tip: Higher Luck gives you better critical hit chances.",
  "Tip: Constitution helps you survive longer in battle.",
  "Tip: Pressing buttons harder does not increase damage.",
];

const LoadingScreen = ({ open }) => {
  const [dots, setDots] = useState("");
  const [tip, setTip] = useState("");

  // Random Tip เมื่อ component mount (แสดงครั้งเดียวตอนโหลด)
  useEffect(() => {
    if (open) {
      const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
      setTip(randomTip);
    }
  }, [open]);

  // Animation จุดวิ่ง (...)
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [open]);

  return (
    <Backdrop
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 100, // ทับทุกอย่าง
        
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
      open={open}
    >
    <StarBackground/>
      {/* 1. Custom Pixel Spinner (สี่เหลี่ยมหมุน) */}
      <Box
        sx={{
          width: 50,
          height: 50,
          border: "4px solid #ffd700", // สีทอง
          backgroundColor: "transparent",
          animation: "spin 1.5s infinite steps(8)", // steps(8) ทำให้หมุนแบบกระตุกๆ เหมือน 8-bit
          boxShadow: "0 0 15px #ffd700",
        }}
      >
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </Box>

      {/* 2. Loading Text */}
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: '"Press Start 2P", cursive',
            fontSize: "24px",
            color: "#ffd700",
            textShadow: "2px 2px #000",
            letterSpacing: "2px",
          }}
        >
          LOADING{dots}
        </Typography>
      </Box>

      {/* 3. Random RPG Tip Box */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          border: "2px solid #5d4037",
          backgroundColor: "#2b1d14",
          borderRadius: "8px",
          maxWidth: "80%",
          textAlign: "center",
          boxShadow: "0 5px 15px rgba(0,0,0,0.5)"
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Press Start 2P", cursive',
            fontSize: "10px",
            color: "#bcaaa4",
            lineHeight: 1.8,
          }}
        >
          {tip}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default LoadingScreen;