import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, Divider , Tooltip } from "@mui/material";
import BackArrow from "../../components/BackArrow";
import arrowRight from "../../../../assets/icons/arrowRight.png";
import arrowLeft from "../../../../assets/icons/arrowLeft.png";
import StarBackground from "../../components/StarBackground";
import { useData } from "../../hook/useData";
import GameAppBar from "../../../../components/AppBar";
import LoadingScreen from "../../../../components/Loading/LoadingPage";
import { useLoginPlayer } from "../../../AuthPage/LoginPage/hook/useLoginPlayer";
import { THEME } from "../../hook/const";
import HeroCard from "./HeroCard";


const ShopHeroFeature = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useLoginPlayer();
  const { heros, getAllHeros, heroState } = useData();

  const scrollRef = useRef(null);

  const [isMinLoading, setIsMinLoading] = useState(true);

  useEffect(() => {
    // เรียก API ตามปกติ
    getAllHeros();

    // ตั้งเวลา Delay (เช่น 1500 ms = 1.5 วินาที)
    const timer = setTimeout(() => {
      setIsMinLoading(false);
    }, 1000);

    // Cleanup timer ถ้า user เปลี่ยนหน้าก่อน
    return () => clearTimeout(timer);
  }, [getAllHeros]);

  // 2. ปรับเงื่อนไข: แสดง Loading ถ้า (API กำลังโหลด) หรือ (เวลายังไม่ครบ)
  if (heroState === "LOADING" || isMinLoading) {
    return <LoadingScreen open={true} />;
  }

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

  console.log(heros);

  return (
    <Box sx={{ display: "flex" }}>
      <GameAppBar />
      <StarBackground />
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            position: "fixed",
            top: "53%",
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
            width: { xs: "90%", sm: "80%", md: "80%", lg: "80%" },
            height: "580px",
            p: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
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
              <BackArrow onClick={handleBack} />
            </Box>

            {/* Title กลางจริง */}
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                color: THEME.textLight,
                fontSize: { xs: 16, md: 24 },
                textShadow: "2px 2px 0 #000",
                pointerEvents: "none", // กันโดน arrow ทับ
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
              {heros?.map((hero) => (
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
              ))}
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
        </Box>
      </Box>
    </Box>
  );
};
export default ShopHeroFeature;
