import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import arrowRight from "../../../../assets/icons/arrowRight.png";
import arrowLeft from "../../../../assets/icons/arrowLeft.png";
import { useLoginPlayer } from "../../../AuthPage/LoginPage/hook/useLoginPlayer";
import { useHeroStore } from "../../../../store/useHeroStroe";
import { THEMES } from "../../hook/const";
import HeroCard from "./HeroCard";
import { preloadImageAsync, LoadImage } from "../../hook/usePreloadFrams";
import "./style.css";

//sound
import { useGameSfx } from "../../../../hook/useGameSfx";
import clickSfx from "../../../../assets/sound/click1.ogg";
import clickAgreeSfx from "../../../../assets/sound/click3.ogg";

const MotionBox = motion(Box);
const ShopHeroFeature = () => {
  const { currentUser } = useLoginPlayer();
  const { heros } = useHeroStore();

  const scrollRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const playClickSound = useGameSfx(clickSfx);
  const playAgreeSound = useGameSfx(clickAgreeSfx);

  useEffect(() => {
    if (!heros || heros.length === 0) return;

    let isMounted = true;

    const prepareData = async () => {
      // 1. สั่งพรีโหลด "รูปภาพเฟรมแรก" ของฮีโร่ทุกตัว ให้ลงไปอยู่ใน Cache ของ Browser ทันที
      const imagePromises = heros.map((hero) =>
        preloadImageAsync(LoadImage("img_hero", hero.id, 1)),
      );

      // 2. รอให้รูปโหลดเสร็จ "และ" รอให้แอนิเมชัน 300ms เล่นจบไปพร้อมๆ กัน
      await Promise.all([
        Promise.all(imagePromises),
        new Promise((resolve) => setTimeout(resolve, 300)),
      ]);

      if (isMounted) {
        setIsReady(true);
      }
    };

    prepareData();

    return () => {
      isMounted = false;
    };
  }, [heros]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    // ปรับระยะการเลื่อนให้พอดีกับขนาดการ์ดที่เล็กลง
    scrollRef.current.scrollBy({
      left: dir === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    console.log("user", currentUser);
    console.log("heros", heros);
  }, []);

  return (
    <Box sx={{ height: "100vh" }}>
      <MotionBox
        className="character-feature"
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

          width: { xs: "90%", sm: "80%", md: "80%", lg: "80%" },
          height: { xs: "70%", sm: "70%", md: "570px", xl: "82%" },

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

            //mobile landscape
            "@media (orientation: landscape) and (max-height: 430px)": {
              py: 1,
              mb: 0,
              borderBottom: `2px solid ${THEMES.border}`,
              borderTopRightRadius: "8px",
              borderTopLeftRadius: "8px",
            },
          }}
        >
          {/* Title กลางจริง */}
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEMES.accent,
              fontSize: { xs: 16, sm: 20, md: 26 },
              letterSpacing: "2px",
              textTransform: "uppercase",
              textShadow: `3px 3px 0 #000, 0 0 10px ${THEMES.accent}`,

              //mobile landscape
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 12,
                textShadow: `2px 2px 0 #000, 0 0 6px ${THEMES.accent}`,
              },
            }}
          >
            CHARACTER
          </Typography>
        </Box>

        {/* Horizontal List */}
        <Box
          className="list-container"
          sx={{
            // position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            height: "100%",
            overflow: "hidden", // กันส่วนเกินทะลุ
          }}
        >
          {/* LEFT */}
          <Box
            className="scroll-left"
            onClick={() => {scroll("left"); playClickSound();}}
            sx={{
              // position: "absolute",
              // left: { xs: "-10px", lg: "10px" },
              // top: "50%",
              // transform: "translateY(-50%)",
              // zIndex: 2,
              height: "100%",
              alignItems: "center",
              display: "flex",
              cursor: "pointer",
              p: 0.5,
            }}
          >
            <img
              className="img-scroll"
              src={arrowLeft}
              style={{ width: 40, imageRendering: "pixelated" }}
            />
          </Box>

          {/* LIST */}
          <Box
            className="list-charcter"
            ref={scrollRef}
            sx={{
              display: "flex",
              alignItems: "center",
              // backgroundColor:'pink',
              gap: { xs: 1, md: 1 },
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              "&::-webkit-scrollbar": { display: "none" },
              height: "100%",
              width: "100%",

              // "@media (orientation: landscape) and (max-height: 450px)": {
              //   gap: 1,
              // },
            }}
          >
            {/* ตรวจสอบ isReady ก่อนค่อยเรนเดอร์การ์ดจริงๆ */}
            {!isReady ? (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress sx={{ color: THEMES.accent }} />
              </Box>
            ) : (
              heros?.map((hero) => (
                <Box
                  key={hero.id || hero.name}
                  sx={{ scrollSnapAlign: "start" }} // Snap กลางจอให้สวยงาม
                >
                  <HeroCard
                    hero={hero}
                    playerHeroes={currentUser?.heroes}
                    money={currentUser?.money}
                    playClickSound={playClickSound}
                    playAgreeSound={playAgreeSound}
                  />
                </Box>
              ))
            )}
          </Box>

          {/* RIGHT */}
          <Box
            className="scroll-right"
            onClick={() => {
              scroll("right");
              playClickSound();
            }}
            sx={{
              // position: "absolute",
              // left: { xs: "-10px", lg: "10px" },
              // top: "50%",
              // transform: "translateY(-50%)",
              // zIndex: 2,
              height: "100%",
              alignItems: "center",
              display: "flex",
              cursor: "pointer",
              p: 0.5,
            }}
          >
            <img
              src={arrowRight}
              className="img-scroll"
              style={{ width: 40, imageRendering: "pixelated" }}
            />
          </Box>
        </Box>
      </MotionBox>
    </Box>
  );
};
export default ShopHeroFeature;
