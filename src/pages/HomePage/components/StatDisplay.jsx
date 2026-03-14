import {
  Typography,
  Box,
  LinearProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import { THEME, getStatIcon } from "../hook/const";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
        },
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
              },
            },
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
            },
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
          },
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
      slotProps={{
        tooltip: {
          sx: {
            fontSize: "12px",
            fontFamily: "'Verdana', sans-serif",
            // fontWeight: "bold",
            backgroundColor: "#2a160f",
            border: `1px solid black`,
          },
        },
        arrow: { sx: { color: "#000000" } },
      }}
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
        },
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
          },
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
              },
            },
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
            },
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
          },
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

// 3 stat ของ monster ย้าย
export const StatTextBox = ({
  label,
  value,
  showTooltip = false,
  tooltipText = "",
  isUnlocked = true, // เพิ่ม prop เพื่อเช็คปลดล็อค
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
    }}
  >
    {/* LABEL + INFO ICON */}
    <Box
      sx={{
        width: "140px",
        display: "flex",
        alignItems: "center",
        gap: 0.8,
        flexShrink: 0,
        // เพิ่มเฉพาะจอใหญ่
        "@media (min-width: 1800px)": {
          width: "200px",
        },
        // บีบความกว้าง Label ฝั่งซ้าย
        "@media (orientation: landscape) and (max-height: 450px)": {
          // width: "90px",
          gap: 0.5,
        },
      }}
    >
      {getStatIcon(label)}

      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: { xs: 7, md: 10 },
          color: isUnlocked ? THEME.accent : "#777", // สีเทาถ้ายังล็อค
          textShadow: `1px 1px 0 ${THEME.shadow}`,
          letterSpacing: "1px",
          // ขยายฟอนต์เฉพาะจอใหญ่
          "@media (min-width: 1800px)": {
            fontSize: 12,
          },
          // ย่อฟอนต์ใน Mobile Landscape
          "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 8,
          },
        }}
      >
        {label}
      </Typography>

      {showTooltip && isUnlocked && (
        <Tooltip title={tooltipText} arrow placement="top">
          <IconButton
            size="small"
            sx={{
              p: 0,
              color: THEME.accent,
              "&:hover": {
                color: "#ffd966",
              },
            }}
          >
            <InfoOutlinedIcon
              sx={{ 
                fontSize: 12, 
                "@media (min-width: 1800px)": { fontSize: 16 },
                "@media (orientation: landscape) and (max-height: 450px)": { fontSize: 8 }
              }}
            />
          </IconButton>
        </Tooltip>
      )}
    </Box>

    {/* VALUE BOX */}
    <Box
      sx={{
        ml: { xs: 0, md: 3 },
        flex: 1,
        backgroundColor: "#1a120b",
        color: isUnlocked ? THEME.accent : "#555",
        border: `2px solid ${isUnlocked ? THEME.border : "#333"}`,
        borderRadius: "4px",
        py: 0.5,
        px: 2,
        textAlign: "center",
        boxShadow: "inset 0 2px 5px rgba(0,0,0,0.8)",
        fontFamily: "'Verdana', sans-serif",
        fontWeight: "bold",
        fontSize: { xs: 9, xl: 13 },
        // ยืดเฉพาะจอใหญ่
        "@media (min-width: 1800px)": {
          py: 1,
          fontSize: 15,
         
        },
        // ย่อกล่อง Value บน Mobile Landscape ให้แบนที่สุด
        "@media (orientation: landscape) and (max-height: 450px)": {
          ml: 0,
          px: 0.5,
          fontSize: 7,
          border: `1px solid ${isUnlocked ? THEME.border : "#333"}`,
           borderRadius: "2px",
        },
      }}
    >
      {isUnlocked ? value : "???"}
    </Box>
  </Box>
);