import { Typography, Box, LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

// ------------------------------------------------
// 1. แบบกล่องตัวเลข (Numeric Row) - กลับมาใช้แบบกล่องเดียว
// ------------------------------------------------
export const StatNumericBox = ({ label, value, icon, color }) => (
  <Box
    sx={{
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      borderRadius: "6px",
      py: 0.2, // ความสูงแนวตั้ง
      px: 1.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between", // 🟢 ดันซ้ายสุด-ขวาสุด เหมือนเดิม
      gap: 1.5,
      border: "1px solid rgba(255,255,255,0.05)",
      boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderColor: "rgba(255,255,255,0.2)",
      },
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
          mt: "2px",
        }}
      >
        {label}
      </Typography>
    </Box>

    {/* RIGHT: Value */}
    <Typography
      sx={{
        // 🟢 ใช้ฟอนต์ปกติให้อ่านเลข 8 ชัดๆ ตามที่ขอ
        fontFamily: "'Verdana', sans-serif",
        fontWeight: "bold",
        fontSize: 12,
        color: "#fff",
        textShadow: `0 0 5px ${color}`, // เรืองแสงตามสี Stat
      }}
    >
      {value}
    </Typography>
  </Box>
);

// ------------------------------------------------
// 2. แบบหลอดภาพรวม (Visual Bar Row) - 20 ช่อง สไตล์เดียวกับ LevelBar
// ------------------------------------------------
export const StatVisualBar = ({ label, value, max = 100, icon, color }) => {
  const TOTAL_BLOCKS = 20; // 20 ช่อง
  // คำนวณจำนวนช่องที่ Active
  const filledCount = Math.min(
    TOTAL_BLOCKS,
    Math.ceil((value / max) * TOTAL_BLOCKS),
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {/* Icon & Label (Box ซ้าย) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "75px",
          gap: 0.8,
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "4px",
          padding: "2px 4px",
        }}
      >
        <Box sx={{ color: color, display: "flex", "& svg": { fontSize: 18 } }}>
          {icon}
        </Box>
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 8,
            color: "#ccc",
            mt: "2px",
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Bar (ขวา) */}
      <Box
        sx={{
          flex: 1,
          // --- Style Container เดิม ---
          height: 18, // ความสูงตามโค้ด Stat เดิมของคุณ
          borderRadius: 4,
          backgroundColor: "#2b1d14",
          border: "2px solid #5a3e2b",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)",
          position: "relative",

          // การจัดเรียงภายใน (ตัดขอบมนด้วย overflow: hidden)
          display: "flex",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: TOTAL_BLOCKS }).map((_, index) => {
          const isActive = index < filledCount;
          const isLast = index === TOTAL_BLOCKS - 1;

          return (
            <Box
              key={index}
              sx={{
                flex: 1, // แบ่ง 20 ช่องเท่าๆ กัน
                height: "100%",

                // สี Active: ใช้สีที่ส่งมา / Inactive: ใสเห็นพื้นหลัง
                backgroundColor: isActive ? color : "transparent",

                // Effect เรืองแสงเฉพาะช่องที่ Active
                boxShadow: isActive ? `0 0 5px ${color}` : "none",

                // เส้นแบ่ง: ขีดเส้นขวาสีดำจางๆ (ยกเว้นช่องสุดท้าย)
                borderRight: !isLast ? "1px solid rgba(0, 0, 0, 0.5)" : "none",

                // เส้นไฮไลท์ซ้ายจางๆ ให้ดูนูน (Optional)
                borderLeft:
                  !isLast && index !== 0
                    ? "1px solid rgba(255, 255, 255, 0.05)"
                    : "none",

                transition: "all 0.2s",
                opacity: isActive ? 1 : 0.5,
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};
