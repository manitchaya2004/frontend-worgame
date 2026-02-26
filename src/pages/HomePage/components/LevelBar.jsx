import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ArrowUp, ArrowBigUp } from "lucide-react";
import { MAX_LEVEL } from "../hook/const";

// --- LevelBar ---
const LevelBar = ({ level = 1, canUpgrade, onUpgrade, isOwned }) => {
  const muiTheme = useMuiTheme();
  const TOTAL_BLOCKS = 10; // แบ่งเป็น 10 ช่อง
  const displayLevel = Math.min(level, TOTAL_BLOCKS);
  const isMax = level >= TOTAL_BLOCKS;

  const isMobile = useMediaQuery(muiTheme.breakpoints.down("xs"));

  return (
    <Box
      sx={{
        mb: isOwned ? 1 : 2,
        width: "100%",
        "@media (orientation: landscape) and (max-height: 450px)": {
          mb: 0.5, // ลด margin bottom เมื่อตะแคงจอ
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* 1. LABEL LV */}
        <Box
          sx={{
            minWidth: 60,
            display: "flex",
            justifyContent: "center",
            "@media (orientation: landscape) and (max-height: 450px)": {
              minWidth: 40, // ลดความกว้างป้าย Level
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: level >= MAX_LEVEL ? 9 : 10,
              color: isMax ? "#ffca28" : "#ffd54f",
              textShadow: "1px 1px 0 #000",
              lineHeight: 1,
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 6, // ย่อฟอนต์ Level
              },
            }}
          >
            LV. {level}
          </Typography>
        </Box>
        {/* 2. THE BAR (ทรงเดิมเป๊ะ) */}
        <Box
          sx={{
            // --- Style เดิมจากโค้ดที่คุณส่งมา ---
            height: 12,
            borderRadius: 4,
            backgroundColor: "#3b2a1a",
            border: "2px solid #2a1b10",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
            position: "relative",
            width: "100%",
            // ----------------------------------

            // เพิ่ม: จัดเรียง Flex และซ่อนส่วนเกินเพื่อให้ขอบมนทำงาน
            display: "flex",
            overflow: "hidden",

            // 💡 THE FIX: ย่อความสูงของหลอดเมื่อตะแคงมือถือ
            "@media (orientation: landscape) and (max-height: 450px)": {
              height: 6,
              border: "1px solid #2a1b10", // ลดความหนาเส้นขอบ
            },
          }}
        >
          {Array.from({ length: TOTAL_BLOCKS }).map((_, index) => {
            const isActive = index < displayLevel;
            const isLast = index === TOTAL_BLOCKS - 1;

            return (
              <Box
                key={index}
                sx={{
                  flex: 1, // ยืดเต็ม 10 ช่องเท่ากัน
                  height: "100%",

                  // สี Active ใช้ Gradient เดิม / Inactive ปล่อยใสให้เห็นพื้นหลังหลอด
                  background: isActive
                    ? isMax
                      ? "linear-gradient(180deg, #ffe082, #d4a437)"
                      : "linear-gradient(180deg, #d8b07a, #b8894a)"
                    : "transparent",

                  // เส้นแบ่ง: ขีดเส้นขวาสีเข้ม (ยกเว้นช่องสุดท้าย)
                  borderRight: !isLast
                    ? "1px solid rgba(70, 68, 68, 0.5)"
                    : "none",

                  // (Optional) เส้นไฮไลท์จางๆ ด้านซ้ายให้ดูนูนขึ้นนิดนึง
                  borderLeft:
                    !isLast && index !== 0
                      ? "1px solid rgba(70, 68, 68, 0.5)"
                      : "none",
                }}
              />
            );
          })}
        </Box>
        {/* 3. UPGRADE BUTTON (ดักเงื่อนไข MAX) */}
        {isOwned ? (
          isMax ? (
            // ถ้า MAX แล้ว โชว์กล่องข้อความเท่ๆ แทนปุ่มอัปเกรด
            <Box
              sx={{
                width: 50,
                height: 25,
                backgroundColor: "#3e2723", // สีพื้นหลังทึบๆ
                border: "1px solid #5a3e2b",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "inset 0 0 5px rgba(0,0,0,0.5)",
                "@media (orientation: landscape) and (max-height: 450px)": {
                  width: 35,
                  height: 16, // ลดขนาดกล่อง MAX
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 8,
                  color: "#ffca28",
                  textShadow: "1px 1px 0px #000",
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: 6,
                  },
                }}
              >
                MAX
              </Typography>
            </Box>
          ) : (
            // ปุ่มอัปเกรดแบบเดิม
            <Box
              onClick={onUpgrade}
              sx={{
                width: 50,
                height: 25,
                backgroundColor: "#66bb6a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                boxShadow: "0 2px 0 #1b5e20",
                opacity: 1,
                transition: "all 0.1s",
                "&:hover": {
                  backgroundColor: "#81c784",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(1px)",
                  boxShadow: "none",
                },
                "@media (orientation: landscape) and (max-height: 450px)": {
                  width: 35,
                  height: 16, // ลดขนาดปุ่ม UP
                  boxShadow: "0 1px 0 #1b5e20", // ลดเงาปุ่ม
                },
              }}
            >
              <ArrowBigUp
                fill={canUpgrade ? "#FFD54F" : "#4a3b31"}
                stroke={canUpgrade ? "#997c26" : "#2d1b10"} // ขอบน้ำตาลเข้มให้ดูมีมิติ
                strokeWidth={1}
                style={{
                  height: isMobile ? 14 : 20,
                  width: isMobile ? 14 : 20,
                  filter: canUpgrade
                    ? "drop-shadow(0px 1px 0px rgba(0,0,0,0.4))"
                    : "none",
                  zIndex: 1,
                  // ปรับขนาดไอคอนลูกศรตอนแนวนอน (ใช้ transform เพื่อบังคับย่อตัว)
                  transform: "scale(0.8)",
                }}
              />
            </Box>
          )
        ) : (
          <Box sx={{ height: 15 }} />
        )}{" "}
        {/* ถ้าไม่ owned แค่เว้นที่ว่างไว้ให้เท่ากับปุ่ม/กล่อง MAX */}
      </Box>
    </Box>
  );
};
export default LevelBar;
