import { useNavigate, useLocation } from "react-router-dom"; //เปลี่ยน หน้า
import { memo, useEffect, useState, useMemo,useRef } from "react";
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
import { LoadImage } from "../hook/usePreloadFrams";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import GameAppBar from "../../../components/AppBar";
import { API_URL } from "../../../store/const";
const name = "img_hero";
const MotionBox = motion(Box);

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

const DetailItem = ({ stage, currentUser,}) => {
  const activeHero = currentUser?.heroes?.find((h) => h.is_selected);
  const heroId = activeHero?.hero_id;

  return (
    <Box
      sx={{
        position: "relative",
        height: 380, // ปรับความสูงตามความเหมาะสม
        width: { xs: "100%", md: "700px", lg: "80%" },
        // maxWidth: "600px",
        margin: "0 auto",
        overflow: "hidden",
        border: "1px solid #000", // เส้นขอบนอกสุด
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ส่วนบน: สีดำ + ชื่อด่าน + ตัวละคร */}
      <Box
        sx={{
          flex: 3,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center", // ⭐ จัดกลางจริง
          pt: 1, // ลด padding บน
          backgroundImage: `url(${backgroundStage()})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, transparent 55%, rgba(84, 82, 82, 0.35) 100%)",
            zIndex: 1,
          }}
        />

        <Typography
          sx={{
            // fontFamily: "'Press Start 2P'",
            fontFamily: "'Anuphan', sans-serif",
            fontSize: { xs: 18, md: 24 },
            color: "#2d2b2b",
            textAlign: "center",
            mb: 4,
          }}
        >
          {stage?.name}
        </Typography>

        {/* ตัวละคร */}
        <motion.img
          src={LoadImage(name, heroId, 1)}
          alt="character"
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          style={{
            height: "55%", // ลดนิดนึง
            filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.6))",
            imageRendering: "pixelated",
            position: "relative",
            zIndex: 2,
            top: 30,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 55,
            width: 120,
            height: 20,
            background: "rgba(0,0,0,0.35)",
            filter: "blur(6px)",
            borderRadius: "50%",
            zIndex: 2,
          }}
        />
      </Box>
    </Box>
  );
};

const ListSection = memo(
  ({ stages, currentUser, handleStageClick, changeCharacter }) => {
    const sortedStages = useMemo(() => {
      if (!stages) return [];
      return [...stages].sort((a, b) => a.orderNo - b.orderNo);
    }, [stages]);

    const [index, setIndex] = useState(0);

    const canPrev = index > 0;
    const canNext = index < sortedStages.length - 1;
    const stage = sortedStages[index];

    const controls = useAnimation();
    const prevIndex = useRef(index);

    useEffect(() => {
  if (prevIndex.current !== index) {
    const direction = index > prevIndex.current ? 1 : -1;

    controls.set({
      x: direction * 80,
      opacity: 0,
      scale: 0.96,
    });

    controls.start({
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    });

    prevIndex.current = index;
  }
}, [index, controls]);



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
            // position: "relative",
            width: "100%",
            flex: 1,
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* ลูกศรซ้าย */}
          <IconButton
            onClick={() => setIndex((i) => i - 1)}
            disabled={!canPrev}
            sx={{
              // justifySelf: "center",
              position: "relative",
              left: { xs: -1, md: 45, lg: 80 },
              opacity: canPrev ? 1 : 0.2,
              backgroundColor: "#fff",
              border: "3px solid #000",
              borderRadius: 1,
              width: { xs: 36, md: 44 },
              height: { xs: 36, md: 44 },
              zIndex: 10, 
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          {/* หน้าจอแสดงผล */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <motion.div
              animate={controls}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <DetailItem stage={stage} currentUser={currentUser} />
            </motion.div>
          </Box>

          {/* ลูกศรขวา */}
          <IconButton
            onClick={() => setIndex((i) => i + 1)}
            disabled={!canNext}
            sx={{
              position: "relative",
              right: { xs: 1, md: 15, lg: 80 },
              opacity: canNext ? 1 : 0.2,
              backgroundColor: "#fff",
              border: "3px solid #000",
              borderRadius: 1,
              width: { xs: 36, md: 39, lg: 44 },
              height: { xs: 36, md: 39, lg: 44 },
              zIndex: 10, 
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
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
            onClick={changeCharacter}
            sx={{
              px: 3,
              py: 0.8,
              fontFamily: "'Press Start 2P'",
              fontSize: "11px",
              color: "#3e2723",
              backgroundColor: "#e6d3b1",
              border: "2px solid #3e2723",
              boxShadow: "2px 2px 0 #3e2723",
              opacity: 0.85,
              "&:hover": {
                opacity: 1,
                backgroundColor: "#f0dec2",
              },
            }}
          >
            CHANGE CHARACTER
          </Button>

          <Button
            variant="contained"
            onClick={() => handleStageClick(stage?.id)}
            sx={{
              backgroundColor: "#5d4037",
              color: "#fff",
              fontFamily: "'Press Start 2P'",
              fontSize: "16px", // ลดนิดนึง
              px: 5,
              py: 1.2,
              border: "4px solid #000",
              boxShadow: "inset -4px -4px 0px 0px #3e2723",
              "&:hover": {
                backgroundColor: "#4e342e",
              },
            }}
          >
            START GAME
          </Button>
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

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    setOpenConfirm(true);
  };

  const handleConfirmStage = () => {
    setOpenConfirm(false);
    navigate("/battle", {
      state: {
        currentUser: currentUser, // ส่งข้อมูลผู้เล่น
        selectedStage: selectedStage, // แนะนำให้ส่งข้อมูลด่านที่เลือกไปด้วย
      },
    });
  };

  const changeCharacter = () => {
    navigate("/home/character", {
      state: {
        from: location.pathname,
      },
    });
  };

  const MotionBox = motion(Box);

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
    <Box>
      <GameAppBar />
      <Box sx={{ m: 2 }}>
        <StarBackground />

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
            top: "52%",
            left: "50%",
            transform: "translate(-50%, -50%)",

            // Container Design (Book/Panel style)
            background: THEME.cream,
            border: `8px solid ${THEME.brownLight}`,
            borderRadius: "12px",
            boxShadow: `
                    0 0 0 4px ${THEME.brownDark},
                    0 20px 60px rgba(0,0,0,0.8)
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
              position: "relative",
              py: 2,
              textAlign: "center",
              background: THEME.brownDark,
              mx: -1,
              mt: -1,
              // mb: 2,
              borderBottom: `4px solid ${THEME.brownLight}`,
            }}
          >
            {/* Arrow ริมกรอบ */}
            <Box
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <BackArrow onClick={() => navigate("/home")} />
            </Box>

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
            stages={stages}
            currentUser={currentUser}
            handleStageClick={(stage) => handleStageClick(stage)}
            changeCharacter={changeCharacter}
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
    </Box>
  );
};

export default AdvantureFeature;
