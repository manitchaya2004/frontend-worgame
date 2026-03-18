import { useMemo, memo, useState, useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import arrowRight from "../../../../assets/icons/arrowRight.png";
import arrowLeft from "../../../../assets/icons/arrowLeft.png";
import DetailItem from "./AdvantureDetail";
import { THEMES } from "../../hook/const";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import { useNavigate } from "react-router-dom";
// --- Config Animation สำหรับ Slide ---
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 700 : -700,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    // scale: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 700 : -700,
    opacity: 0,
    position: "absolute",
  }),
};
const ListSection = memo(
  ({
    stages,
    initialIndex = 0,
    currentUser,
    handleStageClick,
    changeCharacter,
    isEntering,
    completedStageId,
    playClickSound,
  }) => {
    const navigate = useNavigate();
    const [index, setIndex] = useState(initialIndex);
    const [direction, setDirection] = useState(0);

    const sortedStages = useMemo(() => {
      return [...stages].sort((a, b) => a.orderNo - b.orderNo);
    }, [stages]);

    const canGoPrev = index > 0 && !isEntering;
    const canGoNext = index < sortedStages.length - 1 && !isEntering;

    const currentStage = sortedStages[index];

    // ตัวกัน Slide ซ้ำ
    const isInitialized = useRef(false);
    const hasAutoSlided = useRef(false);

    useEffect(() => {
      // เงื่อนไข: ถ้ายังไม่เคย Init และได้ค่า initialIndex มาแล้ว (ไม่ใช่ 0)
      if (!isInitialized.current && initialIndex !== 0) {
        setIndex(initialIndex);
        isInitialized.current = true; // จำไว้ว่าทำแล้ว จะได้ไม่ทำซ้ำอีก
      }
    }, [initialIndex]); // เอา isEntering ออกจาก dependency เพื่อกันเหนียว

    useEffect(() => {
      const isTargetStage =
        currentStage && currentStage.id === completedStageId;
      // เงื่อนไข: มี ID เพิ่งจบ + เป็นด่านที่แสดงอยู่ + ยังไม่เคย Slide + ไม่ได้กำลังเข้าเกม
      if (
        completedStageId &&
        isTargetStage &&
        !hasAutoSlided.current &&
        !isEntering
      ) {
        const timer = setTimeout(() => {
          // ถ้ามีด่านถัดไป ให้เลื่อน
          if (index < sortedStages.length - 1) {
            paginate(1);
          }

          hasAutoSlided.current = true; // ล็อกไม่ให้ทำซ้ำ

          // 🧹 ล้าง State ทิ้ง เพื่อไม่ให้รีเฟรชแล้วทำอีก
          navigate(location.pathname, { replace: true, state: {} });
        }, 1500); // รอ 1.5 วินาที (ให้ Stamp โชว์ก่อนค่อยเลื่อน)

        return () => clearTimeout(timer);
      }
    }, [
      completedStageId,
      index,
      sortedStages.length,
      isEntering,
      navigate,
      location.pathname,
      currentStage,
    ]);

    // เช็ค Completed
    const isCompleted = useMemo(() => {
      if (!currentStage || !currentUser?.stages) return false;
      const userStage = currentUser.stages.find(
        (s) => s.stage_id === currentStage.id,
      );
      return userStage?.is_completed === true;
    }, [currentStage, currentUser]);

    const paginate = (newDirection) => {
      setDirection(newDirection);
      setIndex((prev) => {
        if (newDirection === 1)
          return Math.min(prev + 1, sortedStages.length - 1);
        return Math.max(prev - 1, 0);
      });
    };

    if (!currentStage) return null;

    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 1.5,
          position: "relative", // for arrows
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%", // เต็มพื้นที่
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* ◀ ลูกศรซ้าย */}
          <Box
            component="img"
            src={arrowLeft}
            onClick={
              canGoPrev
                ? () => {
                    paginate(-1);
                    playClickSound();
                  }
                : undefined
            }
            sx={{
              width: { xs: 36, sm: 44 },
              position: "absolute",
              left: { xs: -3, sm: 10 },
              zIndex: 100,
              imageRendering: "pixelated",

              opacity: canGoPrev ? 1 : 0.25,
              cursor: canGoPrev ? "pointer" : "default",
              pointerEvents: canGoPrev ? "auto" : "none",

              transition: "all 0.15s ease",
              "&:active": canGoPrev ? { transform: "scale(0.9)" } : {},

              //mobile landscape
              "@media (orientation: landscape) and (max-height: 450px)": {
                width: 30,
              },
            }}
          />

          <Box
            sx={{
              position: "relative",
              height: "100%",
              width: { xs: "80%", md: "85%", lg: "85%" },
              borderRadius: 2,
              overflow: "hidden",
              background: `linear-gradient(${THEMES.bgMain}, #1a120b)`,
              border: `4px solid ${THEMES.border}`,
              boxShadow: `6px 6px 0 ${THEMES.shadow}, 0 0 20px rgba(0,188,212,0.2)`,
            }}
          >
            {/* Animation Slide */}
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              <motion.div
                key={currentStage.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", duration: 0.35, ease: "easeInOut" },
                  opacity: { duration: 0.2 },
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* ส่ง function การกดปุ่มลงไปให้ DetailItem จัดการ */}
                <DetailItem
                  stage={currentStage}
                  currentUser={currentUser}
                  isEntering={isEntering}
                  isCompleted={isCompleted}
                  onStartClick={() => handleStageClick(currentStage?.id)}
                  onChangeCharClick={changeCharacter}
                  isJustCompleted={currentStage.id === completedStageId}
                />
              </motion.div>
            </AnimatePresence>
          </Box>

          {/* ▶ ลูกศรขวา */}
          <Box
            component="img"
            src={arrowRight}
            onClick={
              canGoNext
                ? () => {
                    paginate(1);
                    playClickSound();
                  }
                : undefined
            }
            sx={{
              width: { xs: 36, sm: 44 },
              position: "absolute",
              right: { xs: -3, sm: 10 },
              zIndex: 100,
              imageRendering: "pixelated",

              opacity: canGoNext ? 1 : 0.25,
              cursor: canGoNext ? "pointer" : "default",
              pointerEvents: canGoNext ? "auto" : "none",

              transition: "all 0.15s ease",
              "&:active": canGoNext ? { transform: "scale(0.9)" } : {},

              //mobile landscape
              "@media (orientation: landscape) and (max-height: 450px)": {
                width: 30,
              },
            }}
          />
        </Box>

        {/* ลบ Box ปุ่มเดิมออกไปเลย เพราะย้ายไปอยู่ใน DetailItem แล้ว */}
        {/* ⭐ NEW: Start Game Button (Bottom Center) */}
        <Box
          sx={{
            width: "100%",
            height: "80px", // 👈 กำหนดความสูงตายตัวไปเลย (ปรับเลขตามขนาดปุ่มจริง)
            flexShrink: 0,
            display: "flex",
            alignItems: "center", // จัดให้อยู่กลางแนวตั้งของพื้นที่นี้
            justifyContent: "center",

            //mobile landscape
            "@media (orientation: landscape) and (max-height: 450px)": {
              height: "35px",
            },
          }}
        >
          {!isEntering && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }} // Animation ปุ่มเต้นตุบๆ
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                // position: "absolute",
                // bottom: 10,
                // left: "50%",
                // translateX: "-50%",
                // zIndex: 10,
                // transform: "translateX(-50%)", // Fix center
                display: "flex",
              }}
            >
              <Button
                onClick={() => handleStageClick(currentStage?.id)}
                startIcon={isCompleted ? <ReplayIcon /> : <PlayArrowIcon />}
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: { xs: 12, sm: 16 }, // ปรับขนาดฟอนต์ตามขนาดหน้าจอ
                  color: "#fff",
                  backgroundColor: isCompleted ? "#26a69a" : "#43a047", // ยังคงสีเขียวไว้ เพื่อให้เด่นสุด (Call to Action)
                  border: isCompleted
                    ? "3px solid #00695c"
                    : "3px solid #1b5e20",
                  borderRadius: "12px",
                  px: 5,
                  py: 1.5,
                  boxShadow: isCompleted
                    ? "0 6px 0 #00695c, 0 10px 10px rgba(0,0,0,0.35)"
                    : "0 6px 0 #1b5e20, 0 10px 10px rgba(0,0,0,0.4)",
                  "&:hover": isCompleted
                    ? {
                        backgroundColor: "#4db6ac",
                        transform: "translateY(2px)",
                        boxShadow: "0 4px 0 #00695c",
                      }
                    : {
                        backgroundColor: "#66bb6a",
                        transform: "translateY(2px)",
                        boxShadow: "0 4px 0 #1b5e20",
                      },
                  "&:active": isCompleted
                    ? {
                        transform: "translateY(6px)",
                        boxShadow: "none",
                      }
                    : { transform: "translateY(6px)", boxShadow: "none" },
                  //mobile landscape
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    mt:1.5,
                    fontSize: 10,
                    px: 3,
                    py: 1,
                    border: isCompleted
                      ? "2px solid #00695c"
                      : "2px solid #1b5e20",
                  },
                }}
              >
                {isCompleted ? "PLAY AGAIN" : "START"}
              </Button>
            </motion.div>
          )}
        </Box>
      </Box>
    );
  },
);

export default ListSection;
