import { useNavigate, useLocation } from "react-router-dom"; //เปลี่ยน หน้า
import { memo, useEffect, useState, useMemo, useRef } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import { useData } from "../../hook/useData";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { GameDialog } from "../../../../components/GameDialog";
import BackArrow from "../../components/BackArrow";
import { useLoadData } from "../../../AuthPage/LoginPage/hook/useLoadData";
import { Loading } from "../../../../components/Loading/Loading";
import StarBackground from "../../components/StarBackground";
import { useLoginPlayer } from "../../../AuthPage/LoginPage/hook/useLoginPlayer";
import GameAppBar from "../../../../components/AppBar";
import { THEME, THEMES } from "../../hook/const";
import ListSection from "./AdvantureList";
const MotionBox = motion(Box);
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

  const playableStages = useMemo(() => {
    if (!stages || !currentUser?.stages) return [];

    // map user stages by stage_id
    const userStageMap = new Map(
      currentUser.stages.map((s) => [s.stage_id, s]),
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
      currentUser.stages.map((s) => [s.stage_id, s]),
    );

    // หา is_current ก่อน
    const currentIndex = playableStages.findIndex(
      (s) => userStageMap.get(s.id)?.is_current,
    );

    if (currentIndex !== -1) return currentIndex;

    // fallback: ด่านแรกที่ยังไม่ผ่าน
    const firstUncompleted = playableStages.findIndex(
      (s) => !userStageMap.get(s.id)?.is_completed,
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
  console.log("user", currentUser);

  return (
    <Box sx={{ display: "flex" }}>
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
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",

          // Container Design (Book/Panel style)
          background: `linear-gradient(${THEMES.bgMain}, #1a120b)`,
          border: `8px solid ${THEMES.border}`,
          borderRadius: "12px",
          boxShadow: `
            0 0 0 4px #1a120b,
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
            background: "#1a120b",
            mx: -1,
            mt: -1,
            mb: 2,
            borderBottom: `4px solid ${THEMES.border}`,
          }}
        >
          {/* Title กลางจริง */}
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEMES.accent,
              fontSize: { xs: 16, md: 26 },
              letterSpacing: "2px",
              textTransform: "uppercase",
              textShadow: `3px 3px 0 #000, 0 0 10px ${THEMES.accent}`,
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
