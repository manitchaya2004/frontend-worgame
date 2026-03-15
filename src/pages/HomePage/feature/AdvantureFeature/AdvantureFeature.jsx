import { useNavigate, useLocation } from "react-router-dom"; //เปลี่ยน หน้า
import React, { useEffect, useState, useMemo, memo } from "react";
import { Box, Typography } from "@mui/material";
import { useData } from "../../hook/useData";
import { motion } from "framer-motion";
import { Loading } from "../../../../components/Loading/Loading";

import { GameDialog } from "../../../../components/GameDialog";
import MiniGame from "../MiniGame/MiniGame";
import { THEMES } from "../../hook/const";
import ListSection from "./AdvantureList";
import { useGameStore } from "../../../../store/useGameStore";
import { useAuthStore } from "../../../../store/useAuthStore";

import { preloadImage } from "../../hook/usePreloadFrams";
import { backgroundStage } from "../../hook/const";

//sound
import { useGameSfx } from "../../../../hook/useGameSfx";
import clickSfx from "../../../../assets/sound/click3.ogg";
import clickSfx2 from "../../../../assets/sound/click1.ogg";

const MotionBox = motion(Box);

const AdvantureFeature = () => {
  const { currentUser, updateStamina } = useAuthStore();

  console.log("user",currentUser)
  const { stages, loadingStage } = useData();
  const store = useGameStore();
  const navigate = useNavigate();
  const location = useLocation();

  const playClickSound = useGameSfx(clickSfx);
  const playClickSound2 = useGameSfx(clickSfx2);

  const completedStageId = location.state?.completedStageId;

  const [isEntering, setIsEntering] = useState(false);
  // 💡 THE FIX: ใช้ State นี้สำหรับเปิดปิด Dialog แจ้งเตือนสายฟ้าหมด
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlayingMiniGame, setIsPlayingMiniGame] = useState(false);

  const handleStageClick = async (stage) => {
    playClickSound();
    // เช็ค Stamina ปัจจุบันก่อนเลย
    if (!currentUser?.stamina || currentUser.stamina.current <= 0) {
      // 💡 THE FIX: แทนที่จะใช้ window.confirm ให้เปิด GameDialog แทน
      setIsDialogOpen(true);
      return;
    }

    const result = await updateStamina(-1);

    if (result.success) {
      store.reset();
      setIsEntering(true);

      setTimeout(() => {
        navigate("/battle", {
          state: {
            currentUser: currentUser,
            selectedStage: stage,
          },
        });
      }, 2000);
    } else {
      alert("Failed to consume stamina. Please try again.");
    }
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

    const userStageMap = new Map(
      currentUser.stages.map((s) => [s.stage_id, s]),
    );

    const sortedStages = [...stages].sort((a, b) => a.orderNo - b.orderNo);

    const result = [];

    for (let i = 0; i < sortedStages.length; i++) {
      const stage = sortedStages[i];
      const userStage = userStageMap.get(stage.id);

      if (userStage) {
        result.push(stage);
        continue;
      }

      const prevStage = sortedStages[i - 1];
      const prevUserStage = prevStage ? userStageMap.get(prevStage.id) : null;

      if (prevUserStage?.is_completed) {
        result.push(stage);
        break;
      }

      break;
    }

    return result;
  }, [stages, currentUser]);

  const initialStageIndex = useMemo(() => {
    if (!playableStages.length || !currentUser?.stages) return 0;

    if (completedStageId) {
      const foundIndex = playableStages.findIndex(
        (s) => s.id === completedStageId,
      );
      if (foundIndex !== -1) return foundIndex;
    }

    const userStageMap = new Map(
      currentUser.stages.map((s) => [s.stage_id, s]),
    );

    const currentIndex = playableStages.findIndex(
      (s) => userStageMap.get(s.id)?.is_current,
    );

    if (currentIndex !== -1) return currentIndex;

    const firstUncompleted = playableStages.findIndex(
      (s) => !userStageMap.get(s.id)?.is_completed,
    );

    return 0;
  }, [playableStages, currentUser, completedStageId]);

  useEffect(() => {
    if (!stages || stages.length === 0) return;

    stages.forEach((stage) => {
      const src = backgroundStage(stage.id);
      preloadImage(src);
    });
  }, [stages]);

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

  return (
    <>
      <Box sx={{ height: "100vh" }}>
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
            background: `linear-gradient(${THEMES.bgMain}, #1a120b)`,
            border: `8px solid ${THEMES.border}`,
            borderRadius: "12px",
            boxShadow: `
            0 0 0 4px #1a120b,
            0 20px 60px rgba(49, 49, 49, 0.8)
          `,
            width: { xs: "80%", sm: "80%", md: "80%", lg: "70%" },
            height: { xs: "70%", sm: "70%", md: "670px",xl: "80%" },
            p: 1,
            display: "flex",
            flexDirection: "column",
            "@media (orientation: landscape) and (max-height: 450px)": {
              top: "55%",
              transform: "translate(-50%, -50%)",
              height: "80%",
              border: `4px solid ${THEMES.border}`,
              borderRadius: "6px",
            },
          }}
        >
          <Box
            sx={{
              py: 2,
              textAlign: "center",
              background: "#1a120b",
              mx: -1,
              mt: -1,
              mb: 2,
              borderBottom: `4px solid ${THEMES.border}`,
              "@media (orientation: landscape) and (max-height: 450px)": {
                py: 1,
                mb: 1,
                borderBottom: `2px solid ${THEMES.border}`,
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                color: THEMES.accent,
                fontSize: { xs: 16, md: 26 },
                letterSpacing: "2px",
                textTransform: "uppercase",
                textShadow: `3px 3px 0 #000, 0 0 10px ${THEMES.accent}`,
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 12,
                  textShadow: `2px 2px 0 #000, 0 0 6px ${THEMES.accent}`,
                },
              }}
            >
              ADVENTURE
            </Typography>
          </Box>
          <ListSection
            stages={playableStages}
            initialIndex={initialStageIndex}
            currentUser={currentUser}
            handleStageClick={(stage) => handleStageClick(stage)}
            changeCharacter={changeCharacter}
            isEntering={isEntering}
            completedStageId={completedStageId}
            playClickSound={playClickSound2}
          />
        </MotionBox>
      </Box>

      {/* 💡 THE FIX: เรียกใช้ GameDialog แจ้งเตือนสายฟ้าหมด กำหนดสีปุ่มผ่าน Props ใหม่ */}
      <GameDialog
        open={isDialogOpen}
        title="OUT OF STAMINA"
        description="Not enough Stamina! Play mini-game to recharge?"
        confirmText="PLAY MINIGAME"
        cancelText="LATER"
        confirmColor="green" // 🟢 ทำให้ปุ่มลุยเกมเป็นสีเขียว
        cancelColor="red"
        onConfirm={() => {
          setIsDialogOpen(false);
          // ใส่ Path ที่ถูกต้องของมินิเกมคุณ
          setIsPlayingMiniGame(true);
          playClickSound();
        }}
        onCancel={() => {
          setIsDialogOpen(false);
          playClickSound2();
        }}
      />

      <MiniGame
        open={isPlayingMiniGame}
        onClose={() => setIsPlayingMiniGame(false)}
        currentStamina={currentUser?.stamina?.current}
        maxStamina={currentUser?.stamina?.max}
      />
    </>
  );
};

export default React.memo(AdvantureFeature);
