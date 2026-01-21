import { useNavigate, useLocation } from "react-router-dom"; //เปลี่ยน หน้า
import { useEffect, useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useData } from "../../hook/useData";
import { motion } from "framer-motion";
import { useLoadData } from "../../../AuthPage/LoginPage/hook/useLoadData";
import { Loading } from "../../../../components/Loading/Loading";
import { useLoginPlayer } from "../../../AuthPage/LoginPage/hook/useLoginPlayer";
import { THEMES } from "../../hook/const";
import ListSection from "./AdvantureList";
import { useGameStore } from "../../../../store/useGameStore";

import { preloadImage } from "../../hook/usePreloadFrams";
import { backgroundStage } from "../../hook/const";
const MotionBox = motion(Box);

const AdvantureFeature = () => {
  const { currentUser } = useLoginPlayer();
  const { stages, loadingStage } = useData();
  const store  = useGameStore();
  const { fetchAllStage } = useLoadData();
  const navigate = useNavigate();
  const location = useLocation();

  const completedStageId = location.state?.completedStageId;

  const [isEntering, setIsEntering] = useState(false);

  const handleStageClick = (stage) => {
    store.reset();
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

    // สำหรับเมื่อเล่นด่านจบ หลังจากกลับมาหน้านี้จะเล่นอนิเมชั่นแล้วเปลี่ยนเป็นด่านล่าสุด
    if (completedStageId) {
      const foundIndex = playableStages.findIndex(
        (s) => s.id === completedStageId,
      );
      if (foundIndex !== -1) return foundIndex;
    }

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

    return 0;
  }, [playableStages, currentUser, completedStageId]);

  // โหลดข้อมูลตอนเปิดหน้า
  useEffect(() => {
    fetchAllStage();
  }, [fetchAllStage]);

  // preload background ของ stage
  useEffect(() => {
    if (!stages || stages.length === 0) return;

    stages.forEach((stage) => {
      const src = backgroundStage(stage.id);
      preloadImage(src);
    });
  }, [stages]);

  // const preloadStages = (stages = []) => {
  //   stages.forEach((stage) => {
  //     const src = backgroundStage(stage.id);
  //     preloadImage(src);
  //   });
  // };

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
        initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
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
          completedStageId={completedStageId}
        />
      </MotionBox>
    </Box>
  );
};

export default AdvantureFeature;
