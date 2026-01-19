import { Box, Button, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useStore } from "../../hook/useStore"; // เช็ค Path ให้ถูกนะ
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { THEMES } from "../../hook/const"; // หรือสีที่คุณใช้ประจำ

// Animation สำหรับตัวหนังสือเด้งๆ
const bounceVariant = {
  hidden: { scale: 0 },
  visible: { 
    scale: [0, 1.2, 1],
    transition: { type: "spring", stiffness: 200, damping: 10 }
  }
};

export const VictoryScreen = ({ onExit }) => {
  // ดึงข้อมูลจาก Store
  const { stageData, coin } = useStore((state) => ({
    stageData: state.stageData,
    coin: state.coin, // เงินที่ได้ในด่านนี้
  }));

  const handleContinue = () => {
    // ⭐ KEY POINT: ส่ง ID ด่านที่เพิ่งชนะออกไป
    // เพื่อให้ handleExit ส่งต่อไปหน้า Adventure -> เกิดอนิเมชั่น Stamp
    onExit(stageData?.id);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.85)", // พื้นหลังมืด
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* 1. กล่อง Victory */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        style={{
          width: "90%",
          maxWidth: "400px",
          backgroundColor: "#3e2723", // สีไม้เข้ม
          border: "4px solid #ffd700", // ขอบทอง
          borderRadius: "16px",
          padding: "32px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
          position: "relative",
        }}
      >
        {/* Ribbon / Header */}
        <motion.div variants={bounceVariant} initial="hidden" animate="visible">
          <Typography
            sx={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: { xs: "28px", md: "36px" },
              color: "#ffd700", // สีทอง
              textShadow: "4px 4px 0 #000",
              textAlign: "center",
              mb: 3,
              lineHeight: 1.5,
            }}
          >
             VICTORY!
          </Typography>
        </motion.div>

        {/* 2. ชื่อด่าน */}
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: "14px",
            color: "#fffbe6",
            mb: 4,
            opacity: 0.8,
            textAlign: "center"
          }}
        >
          {stageData?.name || "Unknown Stage"} - CLEARED
        </Typography>

        {/* 3. สรุปรางวัล (Money) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
            padding: "16px 24px",
            borderRadius: "12px",
            border: "2px solid #5d4037",
            mb: 4,
            width: "100%",
            justifyContent: "center"
          }}
        >
           <EmojiEventsIcon sx={{ fontSize: 40, color: "#ffb74d", mr: 2 }} />
           <Box>
             <Typography sx={{ color: "#aaa", fontSize: 12, fontFamily: "monospace" }}>REWARDS</Typography>
             <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography 
                    sx={{ 
                        fontFamily: "'Press Start 2P'", 
                        color: "#fff", 
                        fontSize: 20,
                        mr: 1
                    }}
                >
                    +{coin || 0}
                </Typography>
                <MonetizationOnIcon sx={{ color: "#ffd700", fontSize: 20 }} />
             </Box>
           </Box>
        </Box>

        {/* 4. ปุ่ม Continue */}
        <Button
          onClick={handleContinue}
          variant="contained"
          sx={{
            fontFamily: "'Press Start 2P'",
            backgroundColor: "#43a047",
            color: "#fff",
            fontSize: "16px",
            py: 2,
            px: 4,
            width: "100%",
            borderBottom: "6px solid #1b5e20", // ปุ่มนูนแบบ 3D
            borderRadius: "12px",
            transition: "all 0.1s",
            "&:hover": {
              backgroundColor: "#4caf50",
              transform: "translateY(2px)",
              borderBottom: "4px solid #1b5e20",
            },
            "&:active": {
              transform: "translateY(6px)",
              borderBottom: "0px solid #1b5e20",
            },
          }}
        >
          CONTINUE
        </Button>

      </motion.div>

      {/* พลุ (Particle Effect ง่ายๆ) */}
      <Confetti /> 
    </Box>
  );
};

// แถม: Component พลุวิบวับแบบง่ายๆ
const Confetti = () => {
    return (
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: "100vh", x: Math.random() * 100 + "vw", opacity: 0 }}
                    animate={{ 
                        y: "-10vh", 
                        opacity: [0, 1, 0],
                        rotate: 360 
                    }}
                    transition={{ 
                        duration: 2 + Math.random() * 2, 
                        repeat: Infinity,
                        delay: Math.random() * 2 
                    }}
                    style={{
                        position: "absolute",
                        width: 10,
                        height: 10,
                        backgroundColor: ["#f00", "#0f0", "#00f", "#ff0"][Math.floor(Math.random() * 4)],
                    }}
                />
            ))}
        </Box>
    )
}