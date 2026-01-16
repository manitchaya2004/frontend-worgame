import { useNavigate, useLocation } from "react-router-dom"; //เปลี่ยน หน้า
import { memo, useEffect, useState, useMemo, useRef } from "react";
import { HoverListItem } from "../components/HoverListItem";
import { Box, Typography, IconButton, Button } from "@mui/material";
import { useData } from "../hook/useData";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { GameDialog } from "../../../components/GameDialog";
import BackArrow from "../components/BackArrow";
import { useLoadData } from "../../AuthPage/LoginPage/hook/useLoadData";
import { Loading } from "../../../components/Loading/Loading";
import StarBackground from "../components/StarBackground";
import { useLoginPlayer } from "../../AuthPage/LoginPage/hook/useLoginPlayer";
import { THEME } from "../hook/const";
import { usePreloadFrames, LoadImage } from "../hook/usePreloadFrams";
import { useIdleFrame } from "../hook/useIdleFrame";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import GameAppBar from "../../../components/AppBar";
import { API_URL } from "../../../store/const";
const name = "img_hero";

const backgroundStage = () => {
  return `${API_URL}/img_map/grassland.png`;
};
export const Title = ({ title }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "-50px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        pointerEvents: "none",
        width: { xs: "90vw", sm: "90%", md: "90%" },
      }}
    >
      <motion.div
        initial={
          // { opacity: 0, scale: 0.6, y: -10 }
          false
        }
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -4, 0], // ลอยขึ้นลง
        }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 },
          y: {
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut",
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: `"Press Start 2P", monospace`,
            fontSize: { xs: 20, md: 28 },
            color: "#fffbe6",
            paddingX: 3,
            paddingY: 2,
            background: "#3a1c14",
            border: "3px solid #b22222",
            textAlign: "center",
            boxShadow: `
              0 0 0 2px #000,
              4px 4px 0 #000,
              0 0 12px rgba(255,80,80,0.8)
            `,
            textShadow: `
              2px 2px 0 #000,
              0 0 8px rgba(255,80,80,0.9)
            `,
            letterSpacing: 2,
          }}
        >
          {title}
        </Typography>
      </motion.div>
    </Box>
  );
};

const DetailItem = ({ stage, currentUser, isEntering }) => {
  const activeHero = currentUser?.heroes?.find((h) => h.is_selected);
  const heroId = activeHero?.hero_id;

  const frames = usePreloadFrames("img_hero", heroId, 2, "walk");
  const frame = useIdleFrame(frames.length, 200);

  return (
    <Box
      sx={{
        position: "relative",
        height: 380,
        width: { xs: "100%", md: "720px", lg: "80%" },
        // margin: "0 auto",
        borderRadius: 2,
        overflow: "hidden",

        // 📕 กรอบหนังสือ
        background: "#d8c3a5",
        border: "4px solid #3e2723",
        boxShadow: `
          inset 0 0 0 2px #000,
          6px 6px 0 #000
        `,
      }}
    >
      {/* ===== MAP AREA ===== */}
      <Box
        sx={{
          position: "relative",
          height: "100%",
          backgroundImage: `url(${backgroundStage()})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center", // ⭐ จัดกลางจริง
        }}
      >
        {/* 🌫️ Fog / Light layer */}
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

        {/* 🌑 Vignette */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.45), transparent 45%)",
            zIndex: 2,
          }}
        />

        {/* ===== Stage Title ===== */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
            background: "#3a1c14",
            px: 3,
            py: 1,
            border: "2px solid #b22222",
            boxShadow: "2px 2px 0 #000",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 14,
              color: "#fffbe6",
              textShadow: "2px 2px 0 #000",
            }}
          >
            {stage?.name}
          </Typography>
        </Box>

        {/* ===== Character ===== */}
        <motion.img
          key={isEntering ? "walk" : "idle"}
          src={isEntering ? frames[frame - 1]?.src : LoadImage(name, heroId, 1)}
          alt="character"
          initial={{ y: 0, x: 0 }}
          animate={isEntering ? { y: [0, -140, 0, 0], x: [0, 0, 0, 600] } : ""}
          transition={
            isEntering ? { duration: 2.5, times: [0, 0.2, 0.4, 1] } : ""
          }
          style={{
            position: "relative",
            top:60,
            transform: "translateX(-50%)",
            height: "55%",
            imageRendering: "pixelated",
            filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.6))",
            zIndex: 4,
          }}
        />

        {/* 👤 Shadow */}
        {!isEntering && (
          <Box
            sx={{
              position: "absolute",
              bottom: 50,
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
  );
};

const ListSection = memo(
  ({
    stages,
    initialIndex = 0,
    currentUser,
    handleStageClick,
    changeCharacter,
    isEntering,
  }) => {
    const [index, setIndex] = useState(initialIndex);

    //stage
    const sortedStages = useMemo(() => {
      return [...stages].sort((a, b) => a.orderNo - b.orderNo);
    }, [stages]);

    // 🔁 sync เมื่อ user เปลี่ยนด่าน
    useEffect(() => {
      setIndex(initialIndex);
    }, [initialIndex]);

    const currentStage = sortedStages[index];

    if (!currentStage) return null;

    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between", // ⭐ แยกบน-ล่าง
          alignItems: "center",
          py: 1.5,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* ◀ ปุ่มซ้าย */}
          {!isEntering && index > 0 && (
            <IconButton
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              sx={{ position: "absolute", left: 16 }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}

          {/* 🗺️ ด่านปัจจุบัน */}
          <DetailItem
            stage={currentStage}
            currentUser={currentUser}
            isEntering={isEntering}
          />

          {/* ▶ ปุ่มขวา */}
          {!isEntering && index < sortedStages.length - 1 && (
            <IconButton
              onClick={() =>
                setIndex((i) => Math.min(i + 1, sortedStages.length - 1))
              }
              sx={{ position: "absolute", right: 16 }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            mt: 1,
          }}
        >
          <Button
            disabled={isEntering}
            onClick={changeCharacter}
            sx={{
              px: 3,
              py: 0.8,
              fontFamily: "'Press Start 2P'",
              fontSize: "11px",
              color: "#3e2723",
              backgroundColor: "#e6d3b1",
              border: isEntering ? "2px solid #766866" : "2px solid #3e2723",
              boxShadow: isEntering ? "" : "2px 2px 0 #3e2723",
              opacity: 0.85,
              "&:hover": { opacity: 1, backgroundColor: "#f0dec2" },
            }}
          >
            CHANGE CHARACTER
          </Button>
          <Button
            variant="contained"
            disabled={isEntering}
            onClick={() => handleStageClick(currentStage?.id)}
            sx={{
              backgroundColor: "#5d4037",
              color: "#fff",
              fontFamily: "'Press Start 2P'",
              fontSize: "16px", // ลดนิดนึง
              px: 5,
              py: 1.2,
              border: isEntering ? "4px solid #a4a3a3" : "4px solid #000",
              boxShadow: "inset -4px -4px 0px 0px #3e2723",
              "&:hover": { backgroundColor: "#4e342e" },
            }}
          >
            START GAME{" "}
          </Button>{" "}
        </Box>
      </Box>
    );
  }
);

const AdvantureFeature = () => {
  const { currentUser } = useLoginPlayer();
  const { stages, loadingStage } = useData();
  const { fetchAllStage } = useLoadData();
  const navigate = useNavigate();
  const location = useLocation();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isEntering, setIsEntering] = useState(false);

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    setIsEntering(true);

    setTimeout(() => {
      navigate("/battle", {
        state: {
          currentUser: currentUser,
          selectedStage: stage,
        },
      });
    }, 2500);
  };

  const handleConfirmStage = () => {
    setOpenConfirm(false);
    setIsEntering(true);

    // setTimeout(() => {
    //   navigate("/battle", {
    //     state: {
    //       currentUser: currentUser,
    //       selectedStage: selectedStage,
    //     },
    //   });
    // }, 2500);
  };

  const changeCharacter = () => {
    navigate("/home/character", {
      state: {
        from: location.pathname,
      },
    });
  };

  const MotionBox = motion(Box);
  const playableStages = useMemo(() => {
    if (!stages || !currentUser?.stages) return [];

    // map user stages by stage_id
    const userStageMap = new Map(
      currentUser.stages.map((s) => [s.stage_id, s])
    );

    // sort stage ตาม order
    const sortedStages = [...stages].sort((a, b) => a.orderNo - b.orderNo);

    const result = [];

    for (let i = 0; i < sortedStages.length; i++) {
      const stage = sortedStages[i];
      const userStage = userStageMap.get(stage.id);

      // ถ้า user มี stage นี้อยู่แล้ว → แสดง
      if (userStage) {
        result.push(stage);
        continue;
      }

      // ถ้า user ไม่มี แต่ stage ก่อนหน้า "ผ่านแล้ว" → unlock
      const prevStage = sortedStages[i - 1];
      const prevUserStage = prevStage ? userStageMap.get(prevStage.id) : null;

      if (prevUserStage?.is_completed) {
        result.push(stage);
        break; // 🚨 แสดงแค่ด่านถัดไปพอ
      }

      break;
    }

    return result;
  }, [stages, currentUser]);

  const initialStageIndex = useMemo(() => {
    if (!playableStages.length || !currentUser?.stages) return 0;

    const userStageMap = new Map(
      currentUser.stages.map((s) => [s.stage_id, s])
    );

    // หา is_current ก่อน
    const currentIndex = playableStages.findIndex(
      (s) => userStageMap.get(s.id)?.is_current
    );

    if (currentIndex !== -1) return currentIndex;

    // fallback: ด่านแรกที่ยังไม่ผ่าน
    const firstUncompleted = playableStages.findIndex(
      (s) => !userStageMap.get(s.id)?.is_completed
    );

    return firstUncompleted !== -1 ? firstUncompleted : 0;
  }, [playableStages, currentUser]);

  // โหลดข้อมูลตอนเปิดหน้า
  useEffect(() => {
    fetchAllStage();
  }, [fetchAllStage]);

  // loading
  if (loadingStage === "LOADING") {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <Loading />
      </Box>
    );
  }

  console.log("stage na", stages);
  console.log("select stage", selectedStage);

  return (
    <Box sx={{ m: 2 }}>
      <StarBackground />
      <BackArrow onClick={() => navigate("/home")} />
      <MotionBox
        initial={false}
        animate={{
          opacity: 1,
          scale: 1,
          y: "-50%",
          x: "-50%",
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",

          // Container Design (Book/Panel style)
          background: THEME.cream,
          border: `8px solid ${THEME.brownLight}`,
          borderRadius: "12px",
          boxShadow: `
            0 0 0 4px ${THEME.brownDark},
            0 20px 60px rgba(49, 49, 49, 0.8)
          `,
          width: { xs: "90%", sm: "80%", md: "80%", lg: "65%" },
          height: "570px",
          p: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* <Title title="ADVENTURE" /> */}
        {/* Header Title */}
        <Box
          sx={{
            py: 2,
            textAlign: "center",
            background: THEME.brownDark,
            mx: -1,
            mt: -1,
            // mb: 2,
            borderBottom: `4px solid ${THEME.brownLight}`,
          }}
        >
          {/* Title กลางจริง */}
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEME.textLight,
              fontSize: { xs: 16, md: 26 },
              textShadow: "2px 2px 0 #000",
              pointerEvents: "none", // กันโดน arrow ทับ
            }}
          >
            ADVANTURE
          </Typography>
        </Box>
        {/* <ListSection
          stages={stages}
          handleStageClick={(stage) => handleStageClick(stage)}
        /> */}
        <ListSection
          stages={playableStages}
          initialIndex={initialStageIndex}
          currentUser={currentUser}
          handleStageClick={(stage) => handleStageClick(stage)}
          changeCharacter={changeCharacter}
          isEntering={isEntering}
        />
      </MotionBox>

      <GameDialog
        open={openConfirm}
        title="READY TO START?"
        // description={
        //   selectedStage ? `Enemy Lv. ${selectedStage.orderNo * 5}` : ""
        // }
        confirmText="START"
        cancelText="BACK"
        onConfirm={handleConfirmStage}
        onCancel={() => setOpenConfirm(false)}
      />
    </Box>
  );
};

export default AdvantureFeature;
