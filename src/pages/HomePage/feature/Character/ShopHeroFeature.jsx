import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, Divider, Tooltip , CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import arrowRight from "../../../../assets/icons/arrowRight.png";
import arrowLeft from "../../../../assets/icons/arrowLeft.png";
import StarBackground from "../../components/StarBackground";
import { useData } from "../../hook/useData";
import GameAppBar from "../../../../components/AppBar";
import LoadingScreen from "../../../../components/Loading/LoadingPage";
import { useLoginPlayer } from "../../../AuthPage/LoginPage/hook/useLoginPlayer";
import { THEMES } from "../../hook/const";
import HeroCard from "./HeroCard";

const MotionBox = motion(Box);
const ShopHeroFeature = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useLoginPlayer();
  const { heros, getAllHeros, heroState } = useData();
  
  const scrollRef = useRef(null);

  const [isMinLoading, setIsMinLoading] = useState(true);
  
const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // ปล่อยให้ React วาดโครงสร้างกล่องและเล่นแอนิเมชันไปก่อน 300ms
    // จากนั้นค่อยสับสวิตช์เริ่ม Render การ์ดฮีโร่ทั้งหมด
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  // useEffect(() => {
  //   // เรียก API ตามปกติ
  //   getAllHeros();

  //   // ตั้งเวลา Delay (เช่น 1500 ms = 1.5 วินาที)
  //   const timer = setTimeout(() => {
  //     setIsMinLoading(false);
  //   }, 1000);

  //   // Cleanup timer ถ้า user เปลี่ยนหน้าก่อน
  //   return () => clearTimeout(timer);
  // }, [getAllHeros]);

  // 2. ปรับเงื่อนไข: แสดง Loading ถ้า (API กำลังโหลด) หรือ (เวลายังไม่ครบ)
  // if (heroState === "LOADING" || isMinLoading) {
  //   return <LoadingScreen open={true} />;
  // }

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  const handleBack = () => {
    navigate(location.state?.from || "/home");
    // console.log(location.state?.from)
  };


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
            width: { xs: "90%", sm: "80%", md: "80%", lg: "80%" },
            height: "570px",
            p: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header Title */}
          <Box
            sx={{
              py: 2,
              textAlign: "center",
              background: "#1a120b",
              mx: -1,
              mt: -1,
              
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
              CHARACTER
            </Typography>
          </Box>
          {/* Horizontal List */}
          <Box
            sx={{
              position: "relative",
              mt: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* LEFT */}
            <Box
              onClick={() => scroll("left")}
              sx={{
                position: "absolute",
                left: { xs: "-10px", lg: "10px" },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                cursor: "pointer",
                p: 0.5,
              }}
            >
              <img
                src={arrowLeft}
                style={{ width: 40, imageRendering: "pixelated" }}
              />
            </Box>

            {/* LIST */}
            <Box
              ref={scrollRef}
              sx={{
                display: "flex",
                gap: 1,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                px: 4,
                py: 2,
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {/* ตรวจสอบ isReady ก่อนค่อยเรนเดอร์การ์ดจริงๆ */}
              {!isReady ? (
                <Box sx={{ width: "100%", height: "480px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <CircularProgress sx={{ color: THEMES.accent }} />
                </Box>
              ) : (
                heros?.map((hero) => (
                  <Box
                    key={hero.id || hero.name}
                    sx={{ scrollSnapAlign: "start" }}
                  >
                    <HeroCard
                      hero={hero}
                      playerHeroes={currentUser?.heroes}
                      money={currentUser?.money}
                    />
                  </Box>
                ))
              )}
            </Box>

            {/* RIGHT */}
            <Box
              onClick={() => scroll("right")}
              sx={{
                position: "absolute",
                right: { xs: -10, lg: 10 },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                cursor: "pointer",
              }}
            >
              <img
                src={arrowRight}
                style={{ width: 40, imageRendering: "pixelated" }}
              />
            </Box>
          </Box>
        </MotionBox>
      </Box>
  );
};
export default ShopHeroFeature;
