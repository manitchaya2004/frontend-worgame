import { useState, useEffect, useMemo } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import { motion } from "framer-motion";
import {
  usePreloadFrames,
  LoadImage,
  preloadImage,
} from "../../hook/usePreloadFrams";
import { useIdleFrame } from "../../hook/useIdleFrame";
import { backgroundStage, name } from "../../hook/const";
import "./style.css"
// import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import SwitchAccountIcon from "../../../../assets/icons/changeHero.png";
import { THEMES } from "../../hook/const";
import { width } from "@mui/system";
// 🪵 สไตล์ป้ายชื่อด่าน (ปรับใหม่ตามธีม)
// 🪵 สไตล์ป้ายชื่อด่านแบบใหม่ (Big Center Sign)
const stageNameStyle = {
  position: "absolute",
  top: 24, // ขยับลงมาจากขอบบนหน่อยให้ดูมีมิติ
  left: "50%", // จัดกึ่งกลางแนวนอน
  transform: "translateX(-50%)", // ดึงกลับให้กลางเป๊ะ
  zIndex: 20,

  // Design: ป้ายไม้สีเข้ม ขอบทอง
  backgroundColor: "#3e2723", // สีไม้เข้ม (Dark Wood)
  border: `3px solid ${THEMES.accent}`, // ขอบสีทอง (ตาม Theme)
  borderRadius: "12px", // มุมมนขึ้นหน่อยให้ดูเป็นป้าย

  padding: "12px 40px", // เพิ่มพื้นที่รอบตัวอักษรให้ดูโปร่งและใหญ่
  width: "fit-content", // ให้ความกว้างพอดีกับข้อความ
  minWidth: "150px", // กำหนดความกว้างขั้นต่ำ ป้ายจะได้ไม่หดเล็กเกินไป
  textAlign: "center",

  // Shadow: เงาหนาๆ ให้ดูลอยออกมาจากพื้นหลัง
  boxShadow: `
    0 6px 0 #271c19, 
    0 15px 20px rgba(0,0,0,0.5)
  `,

  display: "flex",
  flexDirection: "column", // เผื่อใส่ sub-text ในอนาคต
  alignItems: "center",
  justifyContent: "center",

  // mobile landscape
  "@media (orientation: landscape) and (max-height: 450px)": {
    top: 12,
    padding: "8px 20px",
    border: `2px solid ${THEMES.accent}`,
    boxShadow: `0 3px 0 #271c19, 0 8px 10px rgba(0,0,0,0.5)`,
  },
};

// เพิ่มสไตล์สำหรับ "โซ่" หรือ "เชือก" ที่แขวนป้าย (Optional: เพื่อความสวยงาม)
const chainStyle = {
  position: "absolute",
  top: -24, // ให้พุ่งขึ้นไปข้างบน
  width: "4px",
  height: "28px",
  backgroundColor: "#1a120b",
  borderLeft: "1px solid #5d4037",
  borderRight: "1px solid #5d4037",
  zIndex: 19,
};

// สไตล์หมุดตอกป้าย (Nail)
const nailStyle = {
  position: "absolute",
  width: 4,
  height: 4,
  borderRadius: "50%",
  backgroundColor: THEMES.bgPanel, // สีหมุดจางกว่าพื้นนิดหน่อย
  boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.5)", // เงาในหมุด
};

const stampStyle = {
  position: "absolute",
  top: "35%",
  left: "25%",
  zIndex: 30, // อยู่บนสุด
  /* === Pixel Stamp Look === */
  border: "4px solid #00e676",
  borderRadius: "4px", // จากมน → เหลี่ยม
  padding: "10px 28px",

  backgroundColor: "rgba(0, 230, 118, 0.12)",
  backdropFilter: "blur(2px)",

  /* เงาแข็งแบบ pixel */
  boxShadow: `
    4px 4px 0 rgba(0,0,0,0.6),
    0 0 14px rgba(0, 230, 118, 0.5)
  `,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
};

// ⭐ Animation Definition
const stampVariants = {
  start: { opacity: 0, scale: 2, rotate: -30 }, // ท่าเริ่มกระแทก (แบบที่คุณชอบ)
  end: { opacity: 1, scale: 1, rotate: -5 },
};

const DetailItem = ({
  stage,
  currentUser,
  isEntering,
  onStartClick,
  onChangeCharClick,
  isCompleted,
  isJustCompleted,
}) => {
  const activeHero = currentUser?.heroes?.find((h) => h.is_selected);
  const heroId = activeHero?.hero_id;

  const frames = usePreloadFrames("img_hero", heroId, 2, "walk");
  const frame = useIdleFrame(frames.length, 200);

  const [isLanded, setIsLanded] = useState(false);
  const isGrayscale = isCompleted && !isEntering;

  useEffect(() => {
    let timer;
    if (isEntering) {
      timer = setTimeout(() => {
        setIsLanded(true);
      }, 1050);
    } else {
      setIsLanded(false);
    }
    return () => clearTimeout(timer);
  }, [isEntering]);

  return (
    <>
      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: "100%",

          overflow: "hidden", // กันภาพล้น
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${backgroundStage(stage.id)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0, // อยู่ล่างสุด
            filter: isGrayscale
              ? "grayscale(100%) brightness(0.6) sepia(0.2)"
              : "none",
            transition: "filter 0.5s ease",
          }}
        >
          {/* Background Effects */}
          <motion.div
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ repeat: Infinity, duration: 4 }}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)",
              zIndex: 1,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.45), transparent 45%)",
              zIndex: 2,
            }}
          />

          {/* Stage Name (Top Center) */}
          {!isEntering && (
            <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {/* Container สำหรับอนิเมชั่นป้าย */}
              <motion.div
                initial={isCompleted ? false : { y: -100, opacity: 0 }} // เริ่มต้น: ลอยอยู่ข้างบน มองไม่เห็น
                animate={isCompleted ? false : { y: 0, opacity: 1 }} // จบ: หล่นลงมาที่เดิม
                transition={
                  isCompleted
                    ? false
                    : {
                        type: "spring", // ใช้แบบสปริง
                        stiffness: 300,
                        damping: 15, // ให้เด้งดึ๋งนิดนึงตอนกระแทกจบ
                        delay: 0.2, // รอแป๊บนึงค่อยหล่น ให้คนมองภาพรวมก่อน
                      }
                }
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  zIndex: 20,
                }}
              >
                <Box sx={stageNameStyle}>
                  {/* โซ่แขวนป้าย 2 ข้าง (ซ้าย-ขวา) */}
                  <Box sx={{ ...chainStyle, left: 20 }} />
                  <Box sx={{ ...chainStyle, right: 20 }} />

                  {/* ชื่อด่าน */}
                  <Typography
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: { xs: 12, sm: 16, md: 18, xl: 20 }, // ใหญ่ขึ้น!
                      color: "#fffbe6", // สีขาวครีม อ่านง่าย
                      textShadow: `2px 2px 0 #000`,
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      lineHeight: 1.5,

                      // mobile landscape
                      "@media (orientation: landscape) and (max-height: 450px)":
                        {
                          fontSize: 8,
                        },
                    }}
                  >
                    {stage?.name || "UNKNOWN STAGE"}
                  </Typography>

                  {/* (Optional) Subtitle เช่น Level หรือ Zone */}
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: THEMES.accent,
                      opacity: 0.8,
                      mt: 0.5,
                      letterSpacing: 1,

                      // mobile landscape
                      "@media (orientation: landscape) and (max-height: 450px)":
                        {
                          fontSize: 6,
                        },
                    }}
                  >
                    Stage {stage?.orderNo || 1}
                  </Typography>

                  {/* หมุดตอกป้าย (Nails) */}
                  <Box
                    sx={{ ...nailStyle, top: 6, left: 6, width: 6, height: 6 }}
                  />
                  <Box
                    sx={{ ...nailStyle, top: 6, right: 6, width: 6, height: 6 }}
                  />
                  <Box
                    sx={{
                      ...nailStyle,
                      bottom: 6,
                      left: 6,
                      width: 6,
                      height: 6,
                    }}
                  />
                  <Box
                    sx={{
                      ...nailStyle,
                      bottom: 6,
                      right: 6,
                      width: 6,
                      height: 6,
                    }}
                  />
                </Box>
              </motion.div>
            </Box>
          )}

          {/* ⭐ NEW: Change Character Button (Top Right) */}
          {!isEntering && (
            <IconButton
              onClick={onChangeCharClick}
              sx={{
                position: "absolute",
                bottom: 15,
                right: 30,
                zIndex: 25,
                backgroundColor: "rgba(43, 29, 20, 0.9)", // bgMain แบบใสๆ
                border: `2px solid ${THEMES.accent}`, // ขอบสีทอง
                borderRadius: "8px",
                color: THEMES.accent, // ไอคอนสีทอง
                width: 44,
                height: 44,
                boxShadow: `2px 2px 0 ${THEMES.shadow}`,
                "&:hover": {
                  backgroundColor: THEMES.bgPanel,
                  transform: "scale(1.05)",
                  borderColor: "#fff",
                },

                //mobile landscape
                "@media (orientation: landscape) and (max-height: 450px)": {
                  width: 25,
                  height: 25,
                  right: 10,
                  bottom: 8,
                  border: `1px solid ${THEMES.accent}`,
                  borderRadius: "6px",
                },
              }}
            >
              {/* <SwitchAccountIcon sx={{ fontSize: 20 }} /> */}
              <img
                className="switch-icon"
                src={SwitchAccountIcon}
                style={{ 
                  height: 40, 
                  width: 40, 
                  imageRendering: "pixelated" 
                  
                 }}
              />
            </IconButton>
          )}

          {/* Character Animation */}
          <motion.img
            className="character-anim"
            key="character-anim"
            src={
              isEntering && isLanded
                ? frames[frame - 1]?.src
                : LoadImage(name, heroId, 1)
            }
            alt="character"
            initial={{ y: 0, x: 0 }}
            animate={
              isEntering
                ? { y: [0, -150, 0, 0], x: [0, 0, 0, 1000] } // 1. ถ้ากำลังเข้าเกม (ไม่ว่าจะ Start หรือ Play Again) ให้วิ่ง
                : isCompleted
                  ? false // 2. ถ้าไม่ได้เข้าเกม และด่านจบแล้ว ให้นิ่ง
                  : { y: [0, -2, 0] } // 3. ถ้าด่านยังไม่จบ ให้เด้งดุ๊กดิ๊ก
            }
            transition={
              isEntering
                ? { duration: 3.5, times: [0, 0.15, 0.3, 1], ease: "easeInOut" }
                : { repeat: Infinity, duration: 2.5 }
            }
            style={{
              position: "relative",
              top: 70, // ขยับตัวละครขึ้นนิดนึง เพื่อเปิดทางให้ปุ่ม Start ด้านล่าง
              transform: "translateX(-50%)",
              height: "55%",
              imageRendering: "pixelated",
              filter: isCompleted
                ? null
                : "drop-shadow(0 6px 6px rgba(255, 255, 255, 0.6))",
              zIndex: 4,
            }}
          />

          {/* Shadow */}
          {!isEntering && (
            <Box
              sx={{
                position: "absolute",
                bottom: 70, // ขยับเงาตามตัวละคร
                left: "50%",
                transform: "translateX(-50%)",
                width: 120,
                height: 18,
                background: "rgba(0,0,0,0.4)",
                filter: "blur(6px)",
                borderRadius: "50%",
                zIndex: 3,
              }}
            />
          )}
        </Box>
      </Box>
      {/* Completed Text (ถ้าผ่านแล้ว) */}
      {/* ⭐ STAMP COMPLETED (อยู่นอก Box ที่เป็น Grayscale เพื่อให้สีสดใส) */}
      {isCompleted && !isEntering && (
        <motion.div
          className="stamp-completed"
          variants={stampVariants}
          initial={{ opacity: 0, scale: 2, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: -5 }} // หมุน -15 องศา
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2, // หน่วงนิดนึงให้พื้นหลังเทาก่อนค่อยปั๊ม
          }}
          style={stampStyle}
        >
          <Typography
            className="stamp-text"
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: { xs: "22px", md: "36px" },
              color: "#00e676",

              /* pixel text shadow */
              textShadow: `
      2px 2px 0 #000,
      0 0 10px rgba(0, 230, 118, 0.8)
    `,

              letterSpacing: "3px",
              textTransform: "uppercase",

              /* เส้น stamp ด้านใน */
              borderTop: "2px dashed rgba(0,230,118,0.6)",
              borderBottom: "2px dashed rgba(0,230,118,0.6)",
              padding: "6px 0",

              // mobile landscape
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 14,
                padding: "4px 0",

              },
            }}
          >
            COMPLETED
          </Typography>
        </motion.div>
      )}
    </>
  );
};

export default DetailItem;
