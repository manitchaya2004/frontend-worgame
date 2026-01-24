import { Box, Typography, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { MAX_LEVEL } from "../../hook/const";
// --- LevelBar ---
const LevelBar = ({ level = 1, canUpgrade, onUpgrade, isOwned }) => {
  const TOTAL_BLOCKS = 10; // แบ่งเป็น 10 ช่อง
  const displayLevel = Math.min(level, TOTAL_BLOCKS);
  const isMax = level >= TOTAL_BLOCKS;

  return (
    <Box sx={{ mb: 1, width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* 1. LABEL LV */}
        <Box sx={{ minWidth: 60, display: "flex", justifyContent: "center" }}>
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 10,
              color: "#ffd54f",
              textShadow: "1px 1px 0 #000",
              lineHeight: 1,
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

        {/* 3. UPGRADE BUTTON */}
        {isOwned && (
          <Box
            onClick={canUpgrade ? onUpgrade : undefined}
            sx={{
              width: 50,
              height: 25,
              backgroundColor: canUpgrade ? "#66bb6a" : "#3e2723",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: canUpgrade ? "pointer" : "not-allowed",
              boxShadow: canUpgrade ? "0 2px 0 #1b5e20" : "none",
              opacity: canUpgrade ? 1 : 0.6,
              transition: "all 0.1s",
              "&:hover": canUpgrade
                ? {
                    backgroundColor: "#81c784",
                    transform: "translateY(-1px)",
                  }
                : {},
              "&:active": canUpgrade
                ? {
                    transform: "translateY(1px)",
                    boxShadow: "none",
                  }
                : {},
            }}
          >
            <AddIcon
              sx={{ fontSize: 14, color: canUpgrade ? "#fff" : "#aaa" }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LevelBar;
