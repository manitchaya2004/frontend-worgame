import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
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
import GameAppBar from "../../../components/AppBar";
import LoadingScreen from "../../../components/Loading/LoadingPage";
import { useLoginPlayer } from "../../AuthPage/LoginPage/hook/useLoginPlayer";
import { THEME } from "../hook/const";
import { useAuthStore } from "../../../store/useAuthStore";
import { useHeroStore } from "../../../store/useHeroStroe";
import { GameDialog } from "../../../components/GameDialog";
const MAX_STAT = 20;
const MAX_LEVEL = 5;

// Config สีและ Icon
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
  FTH: {
    color: "#ffd700", // สีทองสำหรับ Faith
    icon: <AutoFixHighIcon sx={{ fontSize: 12 }} />, // หรือเปลี่ยน Icon ตามต้องการ
    labelBg: "#fff8e1",
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

// --- LevelBar ---
const LevelBar = ({ level = 1, currentExp = 0, nextExp = 100 }) => {
  const maxExp = nextExp || (level >= MAX_LEVEL ? 100 : level * 100);
  const isMax = level >= MAX_LEVEL;

  // คำนวณ % หลอด
  const percentage = isMax
    ? 100
    : Math.min(100, Math.max(0, (currentExp / maxExp) * 100));

  // คำนวณ exp ที่ขาด
  const expNeeded = Math.max(0, maxExp - currentExp);

  return (
    <Box sx={{ mb: 1.5, width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* 1. SHOW LV [Number] */}
        <Box
          sx={{
            minWidth: 55,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // backgroundColor:'red'
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 11,
              color: "#ffd54f", // สีเหลืองทอง
              textShadow: "1px 1px 0 #000",
              lineHeight: 1,
              display: "block",
              letterSpacing: "-0.5px",
            }}
          >
            LV {level}
          </Typography>
        </Box>

        {/* 2. THE BAR */}
        <Box
          sx={{
            height: 14,
            borderRadius: 4,
            backgroundColor: "#3b2a1a",
            border: "2px solid #2a1b10",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
            position: "relative",
            width: "100%",
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
              borderRadius: percentage >= 100 ? 2 : "2px 0 0 2px",
            }}
          />
          {/* ตัวเลขในหลอด (ถ้าอยากเอาออก ลบส่วนนี้ได้เลย) */}
          {!isMax && (
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 7,
                color: "rgba(255, 246, 216, 0.6)", // จางๆ หน่อยจะได้ไม่กวนตา
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
      </Box>
    </Box>
  );
};

// --- StatBar (แก้ไข: เพิ่มปุ่ม Upgrade) ---
const StatBar = ({ label, value, onUpgrade, showUpgrade }) => {
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
            width: "53px",
            backgroundColor: config.labelBg,
            boxShadow: "1px 1px 0 #6b4a2f",
            px: 0.4,
            py: 0.4,
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
            textShadow: "1px 1px 0 #3b2415",
            width: "20px",
            textAlign: "right",
          }}
        >
          {value}
        </Typography>

        {/* ปุ่ม Upgrade (+ Button)
        {showUpgrade && (
          <Box
            onClick={onUpgrade}
            sx={{
              width: 16,
              height: 16,
              ml: 0.5,
              backgroundColor: "#81c784", // สีเขียว Pixel
              border: "1px solid #2e7d32",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 0 #1b5e20",
              "&:hover": {
                filter: "brightness(1.1)",
                backgroundColor: "#a5d6a7",
              },
              "&:active": {
                transform: "translateY(1px)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: "bold",
                color: "#003300",
                lineHeight: 1,
                mb: "1px",
                fontFamily: "monospace",
              }}
            >
              +
            </Typography>
          </Box>
        )} */}
      </Box>
    </Box>
  );
};

// --- ShopHeroCard (ปรับปรุง: รับ Point และรวม Stat) ---
const ShopHeroCard = ({ hero, playerHeroes, money }) => {
  const { selectHero,buyHero, buyHeroState  } = useAuthStore();
  const [open, setOpen] = useState(false);

  const frames = usePreloadFrames("img_hero", hero.id, 2);
  const frame = useIdleFrame(frames.length, 450);

  // ตรวจสอบสถานะการเป็นเจ้าของ
  const playerHero = playerHeroes?.find((h) => h.hero_id === hero.id);
  const isOwned = !!playerHero;
  const isSelected = playerHero?.is_selected === true;
  const canBuy = !isOwned && money > hero.price;

  // === เงื่อนไขข้อมูล ===
  const currentLevel = playerHero?.level || 1;
  const currentExp = isOwned ? playerHero?.current_exp || 0 : 0;
  const nextExp = playerHero?.next_exp || 100;

  // 4. Points: ถ้ายังไม่ซื้อ ให้เป็น 0 ไปเลย (ห้ามอัปเกรด)
  const availablePoints = isOwned ? playerHero?.point_for_added || 0 : 0;

  const getTotalStat = (baseValue, addedKey) => {
    if (isOwned && playerHero) {
      // ถ้าเป็นเจ้าของ: Base + Added (แปลงเป็น Number กัน Error)
      return playerHero[addedKey] || 0;
    }
    // ถ้าไม่ใช่เจ้าของ: ใช้ค่า Base เดิมๆ จาก Hero List
    return baseValue;
  };

  const handleConfirmBuy = async () => {
    await buyHero(hero.id);
    setOpen(false);
  };

  const handleCancelBuy = () => {
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          width: 360,
          height: 480,
          background: "linear-gradient(180deg, #f2dfb6, #d9b97a)",
          border: "3px solid #6b3f1f",
          borderRadius: 3,
          boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.25), 0 6px 0 #4a2b16, 0 10px 20px rgba(0,0,0,0.5)`,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ... (IMAGE AREA & HEADER NAME เหมือนเดิม ไม่ต้องแก้) ... */}
        <Box
          sx={{
            flex: "0 0 200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            background:
              "radial-gradient(circle, #fff8e1 10%, rgba(255,255,255,0) 70%)",
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
                filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.4))",
              }}
              onError={(e) => {
                e.currentTarget.src = "/fallback/unknown-monster.png";
              }}
            />
          ) : null}
        </Box>
        <Box
          sx={{
            background: "#5d4037",
            py: 1.5,
            textAlign: "center",
            borderBottom: "2px solid #3e2723",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            position: "relative",
            bottom: "42%",
          }}
        >
          <Typography
            sx={{
              fontFamily: `"Press Start 2P", monospace`,
              fontSize: "14px",
              color: "#ffecb3",
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
            boxShadow: "inset 0 0 8px rgba(0,0,0,0.6)",
            mx: 1.5,
            mb: 1.5,
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            bottom: 60,
          }}
        >
          <Box>
            {/* Level Bar ใหม่ */}
            <LevelBar
              level={currentLevel}
              currentExp={currentExp}
              nextExp={nextExp}
            />

            <Divider
              sx={{ borderColor: "#5d4037", mb: 1, borderStyle: "dashed" }}
            />

            {/* Stat Bars (โชว์ปุ่ม Upgrade เฉพาะมี Point และเป็นเจ้าของ) */}
            <StatBar
              label="STR"
              value={getTotalStat(hero.base_str, "base_str")}
            />
            <StatBar
              label="DEX"
              value={getTotalStat(hero.base_dex, "base_dex")}
            />
            <StatBar
              label="INT"
              value={getTotalStat(hero.base_int, "base_int")}
            />
            <StatBar
              label="FTH"
              value={getTotalStat(hero.base_faith, "base_faith")}
            />
            <StatBar
              label="CON"
              value={getTotalStat(hero.base_con, "base_con")}
            />
            <StatBar
              label="LUCK"
              value={getTotalStat(hero.base_luck, "base_luck")}
              // showUpgrade={availablePoints > 0}
              // onUpgrade={() => handleUpgrade("cur_luck")}
            />
          </Box>
        </Box>

        {/* Price / Select Button (เหมือนเดิม) */}
        {/* Price / Select Button */}
        <Box
          sx={{
            position: "absolute",
            bottom: 15,
            left: 12,
            right: 12,
            zIndex: 10,
            py: 1,
            textAlign: "center",

            background: isSelected
              ? "linear-gradient(180deg, #9e9e9e, #616161)" // selected
              : isOwned
              ? "linear-gradient(180deg, #81c784, #388e3c)" // owned
              : !canBuy
              ? "linear-gradient(180deg, #757575, #424242)" // เงินไม่พอ
              : "linear-gradient(180deg, #c49a3a, #8b5a1e)", // buy ได้

            cursor:
              isSelected || (!isOwned && !canBuy) ? "not-allowed" : "pointer",

            opacity: isSelected || (!isOwned && !canBuy) ? 0.7 : 1,

            border: "3px solid #5a3312",
            borderRadius: 2,
            color: "#2a160a",

            boxShadow:
              isSelected || (!isOwned && !canBuy)
                ? "inset 0 2px 4px rgba(0,0,0,0.5)"
                : `inset 0 1px 0 rgba(255,255,255,0.25),
           inset 0 -2px 0 rgba(0,0,0,0.35),
           0 5px 0 #3a1f0b,
           0 8px 14px rgba(0,0,0,0.45)`,

            "&:hover":
              !isSelected && (isOwned || canBuy)
                ? { filter: "brightness(1.05)" }
                : {},
          }}
          onClick={() => {
            if (isSelected) return;

            if (isOwned) {
              selectHero(hero.id);
              return;
            }

            if (!canBuy) return; // 💥 เงินไม่พอ → ไม่ยิง API

            setOpen(true);
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 12,

              color:
                !isOwned && !canBuy
                  ? "#930606" // 🔴 แดงเงินไม่พอ
                  : "#2a160a",
            }}
          >
            {isSelected
              ? "✓ SELECTED"
              : isOwned
              ? "SELECT"
              : `💰 ${hero.price}`}
          </Typography>
        </Box>
      </Box>

      <GameDialog
        open={open}
        title={`BUY HERO`}
        description={`${hero.name}\nCost: ${hero.price} 💰`}
        confirmText="BUY"
        cancelText="NO"
        onConfirm={handleConfirmBuy}
        onCancel={handleCancelBuy}
      />
    </>
  );
};

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
                  <ShopHeroCard
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
