import { Typography, Box, LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

// ------------------------------------------------
// 1. แบบกล่องตัวเลข (Numeric Box) 
// ------------------------------------------------
export const StatNumericBox = ({ label, value, icon, color }) => (
  <Box
    sx={{
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      borderRadius: "6px",
      // ปรับ padding ให้กระชับขึ้นเพื่อให้ความสูงใกล้เคียงหลอด
      py: 0.8, 
      px: 1.5,
      mb: 1, // เว้นระยะห่างด้านล่างเหมือนหลอด
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between", // 🟢 ดันซ้ายขวาแยกกัน
      gap: 1.5,
      border: "1px solid rgba(255,255,255,0.05)",
      boxShadow: `inset 0 0 10px rgba(0,0,0,0.5)`,
      transition: "all 0.2s"
    }}
  >
    {/* LEFT: Icon & Label */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ color: color, display: "flex", "& svg": { fontSize: 18 } }}>
            {icon}
        </Box>
        <Typography
            sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 8,
            color: "#aaa",
            textTransform: "uppercase",
            mt: "2px"
            }}
        >
            {label}
        </Typography>
    </Box>

    {/* RIGHT: Value (ตัวเลขใหญ่) */}
    <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: 10,
          color: "#fff",
          textShadow: `1px 1px 0 ${color}`,
        }}
    >
        {value}
    </Typography>
  </Box>
);

// ---------------------------------
// 2. แบบหลอดภาพรวม (Visual Bar) 
// ---------------------------------
const PixelLinearProgress = styled(LinearProgress)(({ theme, barcolor }) => ({
  height: 14,
  borderRadius: 4,
  backgroundColor: "#2b1d14",
  border: "2px solid #5a3e2b",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)",
  "& .MuiLinearProgress-bar": {
    backgroundColor: barcolor,
    borderRadius: 2,
    backgroundImage: `linear-gradient(
      45deg, 
      rgba(255, 255, 255, 0.2) 25%, 
      transparent 25%, 
      transparent 50%, 
      rgba(255, 255, 255, 0.2) 50%, 
      rgba(255, 255, 255, 0.2) 75%, 
      transparent 75%, 
      transparent
    )`,
    backgroundSize: "10px 10px",
    boxShadow: `0 0 5px ${barcolor}`,
  },
}));

export const StatVisualBar = ({ label, value, max = 100, icon, color }) => {
  const progress = Math.min((value / max) * 100, 100);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      {/* Icon & Label */}
      <Box 
        sx={{ 
            display: "flex", 
            alignItems: "center", 
            width: "70px", 
            gap: 0.8,
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "4px",
            padding: "2px 4px"
        }}
      >
        <Box sx={{ color: color, display: "flex", "& svg": { fontSize: 12 } }}>
            {icon}
        </Box>
        <Typography
            sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 7,
            color: "#ccc",
            mt: "2px"
            }}
        >
            {label}
        </Typography>
      </Box>

      {/* Bar */}
      <Box sx={{ flex: 1 }}>
        <PixelLinearProgress 
            variant="determinate" 
            value={progress} 
            barcolor={color} 
        />
      </Box>
    </Box>
  );
};