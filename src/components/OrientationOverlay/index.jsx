import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";
import { motion } from "framer-motion";

const OrientationOverlay = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      const isMobile = window.innerWidth < 1024; // triggers for tablets and phones
      setIsPortrait(portrait && isMobile);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 10, 8, 0.95)",
        backdropFilter: "blur(12px)",
        zIndex: 99999, // Ensure it is on top of everything
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#f1c40f",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          border: "4px solid #d4af37",
          borderRadius: "16px",
          padding: "40px 30px",
          background: "linear-gradient(180deg, #1e120b 0%, #0c0705 100%)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(212,175,55,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          maxWidth: "320px",
          width: "90%",
        }}
      >
        <motion.div
          animate={{ rotate: [0, -90, -90, 0] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.5
          }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(212, 175, 55, 0.1)",
            border: "2px dashed #d4af37",
          }}
        >
          <ScreenRotationIcon sx={{ fontSize: 42, color: "#ffd700" }} />
        </motion.div>

        <Typography
          sx={{
            fontFamily: "'Press Start 2P', sans-serif",
            fontSize: "14px",
            lineHeight: 1.6,
            color: "#ffd700",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          ROTATE DEVICE
        </Typography>

        <Typography
          sx={{
            fontFamily: "'Kanit', sans-serif",
            fontSize: "15px",
            color: "#e8dcc4",
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          โปรดหมุนหน้าจออุปกรณ์ของคุณเป็นแนวนอน เพื่อการเล่นเกมที่เหมาะสมที่สุด
        </Typography>

        <Typography
          sx={{
            fontFamily: "sans-serif",
            fontSize: "12px",
            color: "#8b7355",
            fontStyle: "italic",
            lineHeight: 1.4,
          }}
        >
          Please rotate your device to landscape mode for the best gaming experience.
        </Typography>
      </Box>
    </Box>
  );
};

export default OrientationOverlay;
