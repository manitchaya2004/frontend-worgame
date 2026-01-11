import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import { Title } from "./AdvantureFeature";
import BackArrow from "../components/BackArrow";
import arrowRight from "../../../assets/icons/arrowRight.png";
import arrowLeft from "../../../assets/icons/arrowLeft.png";
import StarBackground from "../components/StarBackground";
import { useData } from "../hook/useData";
import { usePreloadFrames } from "../hook/usePreloadFrams";
import { useIdleFrame } from "../hook/useIdleFrame";

import HardwareIcon from "@mui/icons-material/Hardware";
import SpeedIcon from "@mui/icons-material/Speed";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ShieldIcon from "@mui/icons-material/Shield";
import CasinoIcon from "@mui/icons-material/Casino";
import StarIcon from "@mui/icons-material/Star";

import LoadingScreen from "../../../components/Loading/LoadingPage";
const MAX_STAT = 20;
const MAX_LEVEL = 5;

// Config สีและ Icon (คงเดิม แต่ปรับสี Label ให้เข้ากับธีมเข้มในกล่อง Stat)
const STAT_CONFIG = {
  STR: {
    color: "#c45a3c",
    icon: <HardwareIcon sx={{ fontSize: 12 }} />,
    labelBg: "#f3e5d8",
  },
  DEX: {
    color: "#7ba98b",
    icon: <SpeedIcon sx={{ fontSize: 12 }} />,
    labelBg: "#e7f0ea",
  },
  INT: {
    color: "#6a8caf",
    icon: <AutoFixHighIcon sx={{ fontSize: 12 }} />,
    labelBg: "#e6edf5",
  },
  CON: {
    color: "#c9a24d",
    icon: <ShieldIcon sx={{ fontSize: 12 }} />,
    labelBg: "#f6edd8",
  },
  LUCK: {
    color: "#9c7bb0",
    icon: <CasinoIcon sx={{ fontSize: 12 }} />,
    labelBg: "#efe6f3",
  },
};

const getNextLevelExp = (level) => {
  if (level >= MAX_LEVEL) return 100;
  return level * 100;
};

// --- LevelBar (ปรับสี Text ให้สว่างขึ้นเพราะจะไปอยู่บนพื้นเข้ม) ---
const LevelBar = ({ level = 1, currentExp = 0 }) => {
  const maxExp = getNextLevelExp(level);
  const isMax = level >= MAX_LEVEL;
  const percentage = isMax
    ? 100
    : Math.min(100, Math.max(0, (currentExp / maxExp) * 100));

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 0.3, alignItems: "center" }}>
        {/* Label LV */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            background: "#8b5a2b",
            boxShadow: "1px 1px 0 #4e2f18",
            px: 0.5,
            py: 0.2,
            borderRadius: 1,
            // boxShadow: '1px 1px 0 #000'
          }}
        >
          <StarIcon sx={{ fontSize: 10, color: "#ffe8a3" }} />
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 8,
              color: "#fff",
            }}
          >
            LV
          </Typography>
        </Box>

        {/* BAR CONTAINER */}
        <Box
          sx={{
            flex: 1,
            height: 14,
            borderRadius: 4,
            backgroundColor: "#3b2a1a",
            border: "2px solid #2a1b10",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
            position: "relative",
            // boxShadow: "inset 0 0 5px #000",
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: "100%",
              background: isMax
                ? "linear-gradient(180deg, #ffe082, #d4a437)"
                : "linear-gradient(180deg, #d8b07a, #b8894a)",
              transition: "width 0.5s ease-out",
            }}
          />
          {/* Text Overlay บนหลอด */}
          {!isMax && (
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 7,
                color: "#fff6d8",
                textShadow: "1px 1px 0 #4e2f18",
                position: "absolute",
                width: "100%",
                textAlign: "center",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
            >
              {currentExp}/{maxExp}
            </Typography>
          )}
        </Box>

        {/* Level Number */}
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: isMax ? "#ffd54f" : "#f5e6c8",
            width: "25px",
            textAlign: "right",
            textShadow: "1px 1px 0 #000",
          }}
        >
          {level}
        </Typography>
      </Box>
    </Box>
  );
};

// --- StatBar (ปรับปรุงเล็กน้อยเพื่อให้เข้ากับพื้นหลังมืด) ---
const StatBar = ({ label, value }) => {
  const config = STAT_CONFIG[label] || {
    color: "gray",
    icon: null,
    labelBg: "#eee",
  };
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: "flex", gap: 1, mb: 0.3, alignItems: "center" }}>
        {/* LABEL Box */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            width: "65px",
            backgroundColor: config.labelBg,
            boxShadow: "1px 1px 0 #6b4a2f",
            px: 0.5,
            py: 0.4,
            boxShadow: "1px 1px 0 rgba(0,0,0,0.5)",
          }}
        >
          <Box sx={{ color: "#2b1d14", display: "flex" }}>{config.icon}</Box>
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 8.5,
              color: "#4b2e1a",
              textAlign: "left",
            }}
          >
            {label}
          </Typography>
        </Box>

        {/* BAR */}
        <Box
          sx={{
            display: "flex",
            flex: 1,
            height: 12,
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "#4a3523",
            border: "1px solid #2f1d12",
          }}
        >
          {Array.from({ length: MAX_STAT }).map((_, index) => {
            const active = index < value;
            return (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  backgroundColor: active ? config.color : "transparent",
                  opacity: active ? 1 : 0.15,
                  borderRight:
                    index !== 19 ? "1px solid rgba(0,0,0,0.25)" : "none",
                }}
              />
            );
          })}
        </Box>

        {/* Value */}
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 9,
            color: "#f5e6c8",
            textShadow: "1px 1px 0 #3b2415", // สีขาว
            width: "25px",
            textAlign: "right",
            // textShadow: "1px 1px 0 #000",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

// --- ShopHeroCard (พระเอกของเรา ปรับดีไซน์ใหม่) ---
const ShopHeroCard = ({ hero }) => {
  const frames = usePreloadFrames("img_hero",hero.name, 2);
  const frame = useIdleFrame(frames.length, 450);
  const currentLevel = hero.level || 1;
  const currentExp = hero.exp || 45;

  return (
    <Box
      sx={{
        width: 340,
        height: 455, // ขยายความสูง
        // พื้นหลังการ์ด: ทองไล่เฉด + กรอบซ้อน
        background: "linear-gradient(180deg, #f2dfb6, #d9b97a)",
        border: "3px solid #6b3f1f",
        borderRadius: 3,
        boxShadow: `
    inset 0 0 0 2px rgba(255,255,255,0.25),
    0 6px 0 #4a2b16,
    0 10px 20px rgba(0,0,0,0.5)
  `,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        // boxShadow: `
        //     inset 0 0 0 4px #ffca28,
        //     0 10px 20px rgba(0,0,0,0.5)
        // `, // เงา Inset สีทองเข้ม + เงาตกกระทบ
        overflow: "hidden",
      }}
    >
      {/* === IMAGE AREA === */}
      <Box
        sx={{
          flex: "0 0 200px", // ความสูงคงที่
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          background:
            "radial-gradient(circle, #fff8e1 10%, rgba(255,255,255,0) 70%)", // แสงสว่างหลังตัวละคร
          top: 20,
        }}
      >
        {frames.length > 0 ? (
          <img
            src={frames[frame - 1].src}
            alt={hero.name}
            style={{
              width: "160px",
              height: "160px",
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.4))", // เงาตัวละคร
            }}
            onError={(e) => {
              e.currentTarget.src = "/fallback/unknown-monster.png";
            }}
          />
        ) : null}
      </Box>
      {/* === HEADER / NAME === */}
      <Box
        sx={{
          background: "#5d4037",
          py: 1.5,
          textAlign: "center",
          borderBottom: "2px solid #3e2723",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          position: "relative",
          bottom: "44%",
        }}
      >
        <Typography
          sx={{
            fontFamily: `"Press Start 2P", monospace`,
            fontSize: "14px",
            color: "#ffecb3", // ตัวหนังสือสีทองอ่อน
            textShadow: "2px 2px 0 #000",
            textTransform: "uppercase",
          }}
        >
          {hero.name}
        </Typography>
      </Box>

      {/* === DARK STATS PANEL === */}
      <Box
        sx={{
          flex: 1,
          background: "#3a2416",
          borderRadius: 2,
          border: "2px solid #2a160f",
          boxShadow: "inset 0 0 8px rgba(0,0,0,0.6)", // สีน้ำตาลเข้มเกือบดำ (Dark Theme Panel)
          mx: 1.5,
          mb: 1.5,
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          bottom: 50,
        }}
      >
        {/* Stats Content */}
        <Box>
          <LevelBar level={currentLevel} currentExp={currentExp} />
          <Divider
            sx={{ borderColor: "#5d4037", mb: 1.5, borderStyle: "dashed" }}
          />
          <StatBar label="STR" value={hero.base_str} />
          <StatBar label="DEX" value={hero.base_dex} />
          <StatBar label="INT" value={hero.base_int} />
          <StatBar label="CON" value={hero.base_con} />
          <StatBar label="LUCK" value={hero.base_luck} />
        </Box>
      </Box>
      {/* Price Button (วางไว้ใน Panel หรือ Card ก็ได้ แต่อันนี้วางใน Panel ล่างสุด) */}
      <Box
        sx={{
          position: "relative",
          bottom: "12%",
          mx: "10px",
          py: 1,
          background: "linear-gradient(180deg, #c49a3a, #8b5a1e)",
          border: "3px solid #5a3312",
          borderRadius: 2,
          color: "#2a160a",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.12s ease-out",
          boxShadow: `
      inset 0 1px 0 rgba(255,255,255,0.25),
      inset 0 -2px 0 rgba(0,0,0,0.35),
      0 5px 0 #3a1f0b,
      0 8px 14px rgba(0,0,0,0.45)
    `,
          "&:hover": {
            background: "linear-gradient(180deg, #d6ab45, #9b6424)",
            filter: "brightness(1.05)",
          },
          "&:active": {
            transform: "translateY(3px)",
            boxShadow: `
        inset 0 2px 0 rgba(0,0,0,0.4),
        0 2px 0 #3a1f0b
      `,
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: "11px",
            color: "#2b170b",
            textShadow: "1px 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          💰 {hero.price}
        </Typography>
      </Box>
    </Box>
  );
};

const ShopHeroFeature = () => {
  const navigate = useNavigate();
  const { heros, getAllHeros, heroState } = useData();
  const scrollRef = useRef(null);

  const [isMinLoading, setIsMinLoading] = useState(true);

  useEffect(() => {
    // เรียก API ตามปกติ
    getAllHeros();

    // ตั้งเวลา Delay (เช่น 1500 ms = 1.5 วินาที)
    const timer = setTimeout(() => {
      setIsMinLoading(false);
    }, 2000);

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

  console.log(heros);

  return (
    <Box sx={{ m: 2 }}>
      <StarBackground />
      <BackArrow onClick={() => navigate("/home")} />
      <Box
        sx={{
          position: "fixed",
          top: "55%",
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
          width: { xs: "90%", sm: "80%", md: "80%", lg: "80%" },
          height: "550px",
          padding: 2,
        }}
      >
        <Title title="SHOP CHARACTER" />
        {/* Horizontal List */}
        <Box
          sx={{
            position: "relative",
            mt: 4,
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
              style={{ width: 50, imageRendering: "pixelated" }}
            />
          </Box>

          {/* LIST */}
          <Box
            ref={scrollRef}
            sx={{
              display: "flex",
              gap: 3,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              px: 4,
              py: 2,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {heros?.map((hero) => (
              <Box key={hero.id || hero.name} sx={{ scrollSnapAlign: "start" }}>
                <ShopHeroCard hero={hero} />
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
              p: 0.5,
            }}
          >
            <img
              src={arrowRight}
              style={{ width: 50, imageRendering: "pixelated" }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default ShopHeroFeature;
