import { Box,Typography } from "@mui/material";
import { MAX_LEVEL } from "../../hook/const";
// --- LevelBar ---
const LevelBar = ({ level = 1, currentExp = 0, nextExp = 100 }) => {
  const maxExp = nextExp || (level >= MAX_LEVEL ? 100 : level * 100);
  const isMax = level >= MAX_LEVEL;

  // คำนวณ % หลอด
  const percentage = isMax
    ? 100
    : Math.min(100, Math.max(0, (currentExp / maxExp) * 100));

  // คำนวณ exp ที่ขาด
  const expNeeded = Math.max(0, maxExp - currentExp);

  return (
    <Box sx={{ mb: 1.5, width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* 1. SHOW LV [Number] */}
        <Box
          sx={{
            minWidth: 55,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // backgroundColor:'red'
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 11,
              color: "#ffd54f", // สีเหลืองทอง
              textShadow: "1px 1px 0 #000",
              lineHeight: 1,
              display: "block",
              letterSpacing: "-0.5px",
            }}
          >
            LV {level}
          </Typography>
        </Box>

        {/* 2. THE BAR */}
        <Box
          sx={{
            height: 14,
            borderRadius: 4,
            backgroundColor: "#3b2a1a",
            border: "2px solid #2a1b10",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
            position: "relative",
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: "100%",
              background: isMax
                ? "linear-gradient(180deg, #ffe082, #d4a437)"
                : "linear-gradient(180deg, #d8b07a, #b8894a)",
              transition: "width 0.5s ease-out",
              borderRadius: percentage >= 100 ? 2 : "2px 0 0 2px",
            }}
          />
          {/* ตัวเลขในหลอด (ถ้าอยากเอาออก ลบส่วนนี้ได้เลย) */}
          {!isMax && (
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 7,
                color: "rgba(255, 246, 216, 0.6)", // จางๆ หน่อยจะได้ไม่กวนตา
                position: "absolute",
                width: "100%",
                textAlign: "center",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
            >
              {currentExp}/{maxExp}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LevelBar;