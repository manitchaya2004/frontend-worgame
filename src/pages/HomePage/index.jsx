import { useLocation } from "react-router-dom";
import { useEffect , useState} from "react";
import { Box, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";
import GameAppBar from "../../components/AppBar";
import StarBackground from "./components/StarBackground";
import MagicCursor from "../../components/Cursor";
import { motion } from "framer-motion";
import background2 from "../../assets/icons/background2.png";
import { useLoginPlayer } from "../AuthPage/LoginPage/hook/useLoginPlayer";
import { useAuthStore } from "../../store/useAuthStore";
import { useStageStore } from "../../store/useStageStore";
import { useMonsterStore } from "../../store/useMonsterStore";
import { useHeroStore } from "../../store/useHeroStroe";
import LoadingScreen from "../../components/Loading/LoadingPage";
const HomePage = () => {
  const { currentUser } = useLoginPlayer();
  const { refreshUser } = useAuthStore();
  const { getMonsters } = useMonsterStore();
  const { getAllHeros } = useHeroStore();
  const { getAllStage } = useStageStore();


  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const loadAllGameData = async () => {
      try {
        setIsInitializing(true);
        // ใช้ Promise.all เพื่อดึงข้อมูลทุก Store พร้อมกัน
        await Promise.all([
          refreshUser(),
          getAllStage(),
          getMonsters(),
          getAllHeros(),
        ]);
      } catch (error) {
        console.error("Error loading game data:", error);
      } finally {
        // ไม่ว่าจะโหลดสำเร็จหรือพัง ก็ให้ปิดหน้า Loading (อาจจะเพิ่มการดัก Error ไปโชว์ทีหลังได้)
        setIsInitializing(false);
      }
    };

    loadAllGameData();
  }, []);

  if (isInitializing) {
    return <LoadingScreen open={true}/>;
  }

  return (
    <>
      <MagicCursor />
      <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <GameAppBar />
        {/* <LeftFeatureBar/> */}

        {/* 🌌 Sky */}
        <Box
          sx={{
            position: "relative",
            height: "calc(100% - 65px)", // หัก AppBar
            backgroundColor: "#16141A",
            overflow: "hidden",
          }}
        >
          {/* ⭐ Stars (ลอยอย่างเดียว) */}
          <StarBackground />

          {/* 🌙 Moon (ตัว C) */}
          <motion.div
            initial={{ opacity: 0.7, scale: 0.95 }}
            animate={{
              opacity: [0.6, 1, 0.7],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: 32,
              right: 64,
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Cinzel', serif",
                fontSize: "96px",
                color: "#FFE066",
                lineHeight: 1,
                textShadow: `
        0 0 6px #FFE066,
        0 0 14px #FFD54F,
        0 0 28px rgba(255, 213, 79, 0.8)
      `,
                userSelect: "none",
              }}
            >
              C
            </Typography>
          </motion.div>

          {/* 🏰 Magic School Castle */}
          <Box
            component="img"
            src={background2} // หรือ import มาก็ได้
            alt="Magic School"
            sx={{
              position: "absolute",
              bottom: 0,
              left: -100,
              width: { xs: "500px", md: "900px" },
              imageRendering: "pixelated",
              filter: "brightness(0.9)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          {/* 🎮 เนื้อหาเกม */}
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              height: "100%",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
