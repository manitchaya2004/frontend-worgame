import { useNavigate } from "react-router-dom"; //เปลี่ยน หน้า
import { memo, useEffect, useState } from "react";
import { HoverListItem } from "../components/HoverListItem";
import { Box, Typography } from "@mui/material";
import { useData } from "../hook/useData";
import { motion } from "framer-motion";
import { GameDialog } from "../../../components/GameDialog";
import BackArrow from "../components/BackArrow";
import { useLoadData } from "../../AuthPage/LoginPage/hook/useLoadData";
import { Loading } from "../../../components/Loading/Loading";
import StarBackground from "../components/StarBackground";
import { useLoginPlayer } from "../../AuthPage/LoginPage/hook/useLoginPlayer";
const DetailItem = memo(({ orderNo, name, handleStageClick,stageID }) => {
  return (
    <HoverListItem onClick={() => handleStageClick(stageID)}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        {/* เลขด่าน */}
        <Box
          sx={{
            width: 40,
            height: 40,
            border: "3px solid #2b1d14",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: `"Press Start 2P"`,
            fontSize: 14,
            backgroundColor: "#fff",
          }}
        >
          {orderNo}
        </Box>

        {/* ชื่อด่าน */}
        <Box>
          <div>{name}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Enemy Lv. {orderNo * 5}
          </div>
        </Box>
      </Box>
    </HoverListItem>
  );
});

const ListSection = memo(({ stages, handleStageClick }) => {
  return (
    <Box sx={{ overflowY: "auto", height: "100%" }} role="listbox-1">
      {stages.map((item) => (
        <DetailItem
          orderNo={item.orderNo}
          name={item.name}
          handleStageClick={handleStageClick}
          stageID={item.id}
        />
      ))}
    </Box>
  );
});
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
            textAlign:'center',
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
  const {currentUser} = useLoginPlayer();
  const { stages, loadingStage } = useData();
  const { fetchAllStage } = useLoadData();
  const navigate = useNavigate();

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
        currentUser: currentUser,       // ส่งข้อมูลผู้เล่น
        selectedStage: selectedStage    // แนะนำให้ส่งข้อมูลด่านที่เลือกไปด้วย
      } 
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

  console.log("stage na",stages)
  console.log("select stage",selectedStage)

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
          paddingTop: 6, // เผื่อหัว
          background: "linear-gradient(#7b4a3b, #5a3328)",
          border: "6px solid #7a1f1f",
          boxShadow: `
    inset 0 0 0 3px #d6b46a,
    0 0 20px rgba(180,40,40,0.5),
    0 20px 40px rgba(0,0,0,0.8)
  `,
          width: { xs: "90vw", sm: "400px", md: "80%" },
          height: "550px",
          padding: 2,
        }}
      >
        {/* <Title title="ADVENTURE" /> */}
        <Box
          sx={{
            mt: 3,
            mb: 3,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: "#fffbe6",
              fontSize: { xs: 14, md: 28 },
            }}
          >
            Choose your adventure
          </Typography>
        </Box>{" "}
        <ListSection
          stages={stages}
          handleStageClick={(stage) => handleStageClick(stage)}
        />
      </MotionBox>

      <GameDialog
        open={openConfirm}
        title="READY TO START?"
        description={
          selectedStage ? `Enemy Lv. ${selectedStage.orderNo * 5}` : ""
        }
        confirmText="START"
        cancelText="BACK"
        onConfirm={handleConfirmStage}
        onCancel={() => setOpenConfirm(false)}
      />
    </Box>
  );
};

export default AdvantureFeature;
