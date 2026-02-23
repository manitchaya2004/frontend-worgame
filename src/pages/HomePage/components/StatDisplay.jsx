import { Typography, Box, LinearProgress, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";

// ------------------------------------------------
// 1. แบบกล่องตัวเลข (Numeric Row) - กลับมาใช้แบบกล่องเดียว
// ------------------------------------------------
export const StatNumericBox = ({ label, value, icon, color, description }) => {
  const content = (
    <Box
      sx={{
        // --- Layout ---
        width: "95px", // 🟢 ยืดเต็มช่อง Grid (xs=4) เสมอ
        height: "35px", // สูงเท่ากัน
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // ดันซ้าย-ขวา

        // --- Appearance ---
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: "6px",
        border: `1px solid ${color}40`, // ขอบสีจาง

        // --- Spacing (หัวใจสำคัญ: ลด Padding เพื่อไม่ให้ล้น) ---
        py: 0.5,
        px: 0.8, // ลดขอบข้างลงนิดนึงจะได้ไม่เบียด

        boxShadow: "inset 0 0 5px rgba(0,0,0,0.5)",
        boxSizing: "border-box", // 🟢 กันไม่ให้ Padding ดันจนกล่องบวม

        transition: "all 0.2s",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderColor: color,
          transform: "translateY(-1px)",
        },
        
        // 💡 THE FIX: Responsive Landscape
        "@media (orientation: landscape) and (max-height: 450px)": {
          height: "24px",
          width: "70px",
          px: 0.5,
        }
      }}
    >
      {/* LEFT: Icon & Label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {/* Icon: ปรับขนาดให้เล็กลงนิดนึงจะได้ไม่กินที่ */}
        <Box 
          sx={{ 
            color: color, 
            display: "flex", 
            "& svg": { 
              fontSize: 16,
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 12,
              } 
            } 
          }}
        >
          {icon}
        </Box>

        {/* Label: ย่อฟอนต์ลงเล็กน้อยเพื่อความปลอดภัย */}
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 8, // ลดเหลือ 8px (จาก 9px) กันล้น
            color: "#bbb",
            textTransform: "uppercase",
            mt: "2px",
            whiteSpace: "nowrap", // 🟢 ห้ามขึ้นบรรทัดใหม่
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 6,
            }
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* RIGHT: Value */}
      <Typography
        sx={{
          fontFamily: "'Verdana', sans-serif",
          fontWeight: "bold",
          fontSize: 12,
          color: "#fff",
          textShadow: `0 0 5px ${color}`,
          ml: 0.5, // ดันห่างจาก Label นิดนึง
          "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 10,
          }
        }}
      >
        {value}
      </Typography>
    </Box>
  );
  if (!description) return content;

  return (
    <Tooltip
      title={
        <Typography sx={{ fontSize: 12, fontFamily: "'Verdana'" }}>
          {description}
        </Typography>
      }
      arrow
      placement="top"
    >
      {content}
    </Tooltip>
  );
};

export const StatLine = ({
  label,
  value,
  isImproved,
  icon,
  color,
  description,
}) => {
  const content = (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: "22px",
        
        // py:0.30,
        // px:0.20,
        
         // --- Appearance ---
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: "6px",
        border: `1px solid ${color}40`, // ขอบสีจาง

        "@media (orientation: landscape) and (max-height: 450px)": {
          height: "10px", // บีบความสูงกล่อง List Detail
          borderRadius: "4px",
        }
      }}
    >
      {/* ฝั่งซ้าย: Icon + Label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
        {/* กล่อง Icon */}
        <Box 
          sx={{ 
            color: color, 
            display: "flex", 
            "& svg": { 
              fontSize: 16,
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 8.5,
              }  
            } 
          }}
        >
          {icon}
        </Box>

        {/* ชื่อ Stat */}
         <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 8, // ลดเหลือ 8px (จาก 9px) กันล้น
            color: "#bbb",
            textTransform: "uppercase",
            mt: "2px",
            whiteSpace: "nowrap", // 🟢 ห้ามขึ้นบรรทัดใหม่
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 5,
            }
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* ฝั่งขวา: ค่าตัวเลข */}
      <Typography
        sx={{
          fontFamily: "'Verdana', sans-serif",
          fontWeight: "bold",
          fontSize: 11,
          color: "#fff",
          textShadow: `0 0 5px ${color}`,
           mr: 1,
          // color: isImproved ? "#69f0ae" : "#fff",
          // textShadow: isImproved ? "0 0 5px rgba(105, 240, 174, 0.4)" : "none",
          "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 6,
          }
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  if (!description) return content;
  return (
    <Tooltip
      title={
        <Typography sx={{ fontSize: 12, fontFamily: "'Verdana'" }}>
          {description}
        </Typography>
      }
      arrow
      placement="top"
    >
      {content}
    </Tooltip>
  );
};

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
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 1,
        // ลดช่องว่างระหว่างหลอดเล็กน้อย
        "@media (orientation: landscape) and (max-height: 450px)": {
          gap: 0.5, 
        }
      }}
    >
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
          "@media (orientation: landscape) and (max-height: 450px)": {
            width: "55px",
            gap: 0.4,
            padding: "1px 2px",
          }
        }}
      >
        <Box 
          sx={{ 
            color: color, 
            display: "flex", 
            "& svg": { 
              fontSize: 18,
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 9,
              }
            } 
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 8,
            color: "#ccc",
            mt: "2px",
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 5,
            }
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

          "@media (orientation: landscape) and (max-height: 450px)": {
            height: 9, // ย่อหลอด Stat ลง
            border: "1px solid #5a3e2b",
          }
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