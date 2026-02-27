import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, animate } from "framer-motion";

// Icons
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon";
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import AddIcon from "@mui/icons-material/Add"; // ➕ ปุ่มบวก
import CloseIcon from "@mui/icons-material/Close"; // 💡 Icon ปิดหน้าต่าง
import LogoutIcon from "@mui/icons-material/Logout"; // 💡 Icon Logout

import { GiBroadsword, GiBackpack } from "react-icons/gi";
import { FaCrown } from "react-icons/fa";
// Assets
import { useAuthStore } from "../../store/useAuthStore";
import { useLoginPlayer } from "../../pages/AuthPage/LoginPage/hook/useLoginPlayer";
import { LoadImage } from "../../pages/HomePage/hook/usePreloadFrams";
import { GameDialog } from "../GameDialog";

const THEME = {
  bgMain: "#E8E9CD",
  bgDark: "#2b1d14",
  border: "#5A3A2E",
  text: "#3e2615",
  accent: "#ffecb3",
  activeBorder: "#FFD700",
};

const name = "img_hero";

// --- HELPER: ฟังก์ชันจัดการแสดงผลตัวเลขเงิน ---
const formatGameMoney = (value) => {
  if (value < 1000000000) {
    return value.toLocaleString();
  }
  const suffixes = [
    { value: 1e18, symbol: "Qi" },
    { value: 1e15, symbol: "Qa" },
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },
  ];
  const suffix = suffixes.find((s) => value >= s.value);
  if (suffix) {
    return (
      (value / suffix.value).toFixed(2).replace(/\.00$/, "") + suffix.symbol
    );
  }
  return value.toLocaleString();
};

const AnimatedMoney = ({ value, fontSize = 10 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [status, setStatus] = useState("idle");
  const prevValue = useRef(value);

  useEffect(() => {
    if (value > prevValue.current) setStatus("increase");
    else if (value < prevValue.current) setStatus("decrease");

    const controls = animate(prevValue.current, value, {
      duration: 1,
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      onComplete: () => {
        setStatus("idle");
        prevValue.current = value;
      },
    });

    return () => controls.stop();
  }, [value]);

  return (
    <Typography
      component={motion.span}
      animate={status !== "idle" ? { scale: [1, 1.2, 1] } : {}}
      sx={{
        fontFamily: "'Press Start 2P'",
        fontSize: fontSize,
        color:
          status === "increase"
            ? "#4caf50"
            : status === "decrease"
              ? "#ff1744"
              : "#E8E9CD",
        textAlign: "left",
        transition: "color 0.3s ease",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {formatGameMoney(displayValue)}
    </Typography>
  );
};

// ==========================================
// ⚡ COMPONENT: Energy Bar (สายฟ้า + เวลานับถอยหลัง + ปุ่มบวก)
// ==========================================
const EnergyBar = ({ energy = 5, timeToNextEnergy = 0, onAddClick }) => {
  const MAX_ENERGY = 5;
  const isFull = energy >= MAX_ENERGY;
  const [timeLeft, setTimeLeft] = useState(Math.floor(timeToNextEnergy / 1000));

  // อัปเดตเวลาตั้งต้นเมื่อได้รับค่าใหม่จาก Store / Backend
  useEffect(() => {
    setTimeLeft(Math.floor(timeToNextEnergy / 1000));
  }, [timeToNextEnergy]);

  // นับถอยหลังทุกๆ 1 วินาที
  useEffect(() => {
    if (energy >= MAX_ENERGY || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [energy, timeLeft]);

  // ฟอร์แมตเวลา นาที:วินาที
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgba(43, 29, 20, 0.6)",
        border: "3px solid #5A3A2E",
        boxShadow: "0 3px 0 #2b1a12",
        borderRadius: "15px",
        height: { xs: "32px", sm: "40px" },
        px: { xs: 0.5, sm: 1 },
        gap: { xs: 0.5, sm: 1 },

        //mobile landscape
        "@media (orientation: landscape) and (max-height: 450px)": {
          height: "35px",
          borderRadius: "13px",
          px: 0.5,
          mr: 1,
        },
      }}
    >
      {/* ⚡ แสดงสายฟ้า 5 ดวง */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
        {[...Array(MAX_ENERGY)].map((_, index) => {
          const isActive = index < energy;
          return (
            <FlashOnIcon
              key={index}
              sx={{
                fontSize: { xs: 12, sm: 22 },
                color: isActive ? "#ffd000" : "#3e2615",
                filter: isActive
                  ? isFull
                    ? "drop-shadow(0 0 6px #FFD700)"
                    : "drop-shadow(1px 2px 0px #B8860B)"
                  : "none",
                // ⭐ เส้นขอบตามรูปสายฟ้า
                stroke: "#B8860B",
                strokeWidth: 2,
                paintOrder: "stroke fill", // ให้เส้นขอบอยู่ใต้สี
                transition: "all 0.3s",

                //mobile landscape
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 16,
                },
              }}
            />
          );
        })}
      </Box>

      {/* ⏳ เวลานับถอยหลัง */}
      {energy < MAX_ENERGY && (
        <Box
          sx={{
            minWidth: { xs: "30px", sm: "40px" },
            textAlign: "center",
            mx: { xs: 0.5, sm: 1 },
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: { xs: 5.5, sm: 7 },
              opacity: 0.8,
              color: "#3e2615",
              letterSpacing: "-0.5px",
            }}
          >
            {formatTime(timeLeft)}
          </Typography>
        </Box>
      )}

      {/* ➕ ปุ่มบวก สำหรับเล่นมินิเกม */}
      <Tooltip
        title="Play Minigame to get Energy!"
        arrow
        placement="bottom"
        slotProps={{
          tooltip: {
            sx: {
              fontSize: "12px",
              fontFamily: "'Verdana', sans-serif",
              // fontWeight: "bold",
              backgroundColor: "#2a160f",
              border: `1px solid black`,
              color: "gray",
            },
          },
          arrow: { sx: { color: "#000000" } },
        }}
      >
        <IconButton
          onClick={onAddClick}
          sx={{
            backgroundColor: "#66bb6a",
            border: "1.5px solid #2e7d32",
            boxShadow: "0 0 6px rgba(102,187,106,0.6)",
            p: 0,
            width: { xs: 18, sm: 22 },
            height: { xs: 18, sm: 22 },
            // boxShadow: "0 2px 0 #1b5e20",
            "&:hover": {
              backgroundColor: "#66bb6a",
              transform: "translateY(1px)",
              boxShadow: "0 1px 0 #1b5e20",
            },
            "&:active": {
              transform: "translateY(2px)",
              boxShadow: "none",
            },

            //mobile landscape
            "@media (orientation: landscape) and (max-height: 450px)": {
              width: 18,
              height: 18,
              borderRadius: "4px",
            },
          }}
        >
          <AddIcon
            sx={{
              color: "#fff",
              fontSize: { xs: 14, sm: 18 },
              fontWeight: "bold",

              //mobile landscape
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 14,
              },
            }}
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const GameAppBar = () => {
  const { currentUser, logout } = useLoginPlayer();
  const { volume, isMuted, setVolume, toggleMute } = useAuthStore();

  const muiTheme = useMuiTheme();

  // 💡 THE FIX: จับทั้งหน้าจอเล็ก (xs) และ หน้าจอมือถือแนวนอน (landscape)
  const isMobileWidth = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const isMdWidth = useMediaQuery(muiTheme.breakpoints.down("md"));
  const isLandscapeMobile = useMediaQuery(
    "(orientation: landscape) and (max-height: 450px)",
  );
  const isCompact = isMobileWidth || isLandscapeMobile; // ถ้าย่อจอ หรือตะแคงมือถือ จะยุบปุ่มเหลือแค่ไอคอน

  const activeHero = currentUser?.heroes?.find((h) => h.is_selected);
  const heroId = activeHero?.hero_id;
  const currentLevel = activeHero?.level || 1;

  const navigate = useNavigate();
  const location = useLocation();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (newValue > 0 && isMuted) {
      toggleMute();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
    setConfirmLogout(false);
  };

  const MAIN_NAV_ITEMS = [
    { id: "item", label: "ITEM", path: "/home/item", icon: <InventoryIcon /> },
    {
      id: "adventure",
      label: "ADVENTURE",
      path: "/home",
      icon: <GiBroadsword />,
      isMain: true,
    },
    {
      id: "character",
      label: "CHARACTER",
      path: "/home/character",
      icon: <FaCrown />,
    },
  ];

  const LIBRARY_ITEMS = [
    {
      id: "monster",
      label: "MONSTERS",
      path: "/home/monster",
      icon: <CatchingPokemonIcon />,
    },
    {
      id: "dict",
      label: "DICT",
      path: "/home/dictionary",
      icon: <AutoStoriesIcon />,
    },
  ];

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "rgba(14, 14, 18, 0.85)",
          boxShadow: "none",
          borderBottom: `2px solid ${THEME.border}`,
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: "60px", md: "70px" },
            // ลดความสูงแถบบาร์เฉพาะตอนแนวนอน
            "@media (orientation: landscape) and (max-height: 450px)": {
              minHeight: "48px",
            },
            px: { xs: 1, sm: 2 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* 🔹 LEFT : PROFILE & MONEY & ENERGY */}
          {/* 💡 THE FIX: เพิ่ม flex: 1 และ justifyContent: "flex-start" เพื่อถ่วงน้ำหนักกับฝั่งขวา */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: { xs: 0.5, sm: 1 },

              //mobile landscape
              "@media (orientation: landscape) and (max-height: 450px)": {
                gap: 0.5,
              },
            }}
          >
            {/* กล่อง 1: Profile & Money (เอาสายฟ้าออกไปแล้ว) */}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  pl: { xs: "45px", sm: "50px", md: "55px" },
                  pr: { xs: 1.5, sm: 2.5 },
                  py: 0.5,
                  backgroundColor: "rgba(43, 29, 20, 0.6)",
                  borderRadius: "15px",
                  border: "3px solid #5A3A2E",
                  boxShadow: "0 3px 0 #2b1a12",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: { xs: "90px", sm: "110px", md: "130px" },
                  width: "fit-content",
                  // หดป้ายโปรไฟล์ตอนแนวนอนไม่ให้กินพื้นที่มากไป
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    pl: "45px",
                    minWidth: "90px",
                  },
                }}
              >
                <Tooltip>
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: { xs: 6, sm: 8, md: 9 },
                      color: "#E8E9CD",
                      mb: 0.5,
                      width: { xs: "90px", sm: "110px", md: "130px" },
                    }}
                  >
                    {currentUser?.username}
                  </Typography>
                </Tooltip>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MonetizationOnIcon
                    sx={{
                      fontSize: { xs: 10, sm: 12 },
                      color: "#FFD700",
                      filter: "drop-shadow(1px 2px 0px #B8860B)",
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      border: "1px solid #B8860B",
                    }}
                  />
                  <AnimatedMoney
                    value={currentUser?.money || 0}
                    fontSize={isCompact ? 7 : 9}
                  />
                </Box>
              </Box>

              {/* Avatar Container */}
              <Box
                sx={{
                  position: "absolute",
                  left: "-5px",
                  width: { xs: 40, sm: 48, md: 52 },
                  height: { xs: 40, sm: 48, md: 52 },
                  borderRadius: "50%",
                  backgroundColor: "#E8E9CD",
                  border: "3px solid #5A3A2E",
                  boxShadow: "0 3px 0 #2b1a12",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    width: 40,
                    height: 40,
                  },
                }}
              >
                <Avatar
                  src={LoadImage(name, heroId, 1)}
                  sx={{
                    width: "120%",
                    height: "120%",
                    imageRendering: "pixelated",
                    mb: 1,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -4,
                    right: -4,
                    backgroundColor: THEME.bgDark,
                    border: `1.5px solid ${THEME.activeBorder}`,
                    borderRadius: "4px",
                    px: 0.5,
                    zIndex: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 5, sm: 7 },
                      color: "#FFD700",
                      fontFamily: "'Press Start 2P'",
                    }}
                  >
                    Lv.{currentLevel}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* กล่อง 2: Energy Bar วางแยกออกมาด้านขวา */}
            <EnergyBar
              energy={currentUser?.energy ?? 5}
              timeToNextEnergy={currentUser?.timeToNextEnergy ?? 0}
              onAddClick={() => {
                // เปลี่ยน Path ไปที่มินิเกมของคุณได้เลย
                navigate("/home/minigame-vocab");
              }}
            />
          </Box>

          {/* 🔹 CENTER : NAVIGATION (Adventure ใหญ่สุดบนจอใหญ่) */}
          {/* 💡 THE FIX: เอา flex: 1 ออกไป เพื่อให้มันจัดตัวเองอยู่กึ่งกลางจริงๆ */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1, md: 1.5 },
            }}
          >
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive =
                item.path === "/home"
                  ? location.pathname === "/home"
                  : location.pathname.includes(item.path);

              return (
                <Button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  sx={{
                    // 💡 เปลี่ยนมาใช้ isCompact ทั้งหมดในการเช็คเพื่อยุบปุ่ม
                    minWidth: isCompact
                      ? "40px"
                      : item.isMain
                        ? "160px"
                        : "120px",
                    height: isCompact
                      ? "36px"
                      : item.isMain
                        ? { xs: "40px", sm: "45px", md: "52px" }
                        : { xs: "36px", md: "40px" },
                    flexDirection: { xs: "column", sm: "row" },
                    fontFamily: "'Press Start 2P'",
                    fontSize: item.isMain
                      ? { xs: 8, sm: 10, md: 12 }
                      : { xs: 6, sm: 8 },
                    color: isActive ? THEME.bgDark : "#d7ccc8",
                    backgroundColor: isActive
                      ? THEME.accent
                      : "rgba(43, 29, 20, 0.6)",
                    border: `2px solid ${isActive ? THEME.activeBorder : "#5a3e2b"}`,
                    borderRadius: "8px",
                    boxShadow: isActive
                      ? `0 0 12px ${THEME.accent}`
                      : "0 3px 0 #1a120b",
                    p: isCompact ? 0 : { xs: 0, sm: 1.5 },
                    transition: "all 0.1s",
                    "& .MuiButton-startIcon": {
                      margin: isCompact ? 0 : "0 8px 0 0",

                      "& > *:nth-of-type(1)": {
                        fontSize: isCompact ? 22 : item.isMain ? 26 : 22,
                      },
                    },
                    "&:hover": {
                      backgroundColor: isActive
                        ? THEME.accent
                        : "rgba(43, 29, 20, 0.9)",
                      transform: "translateY(1px)",
                    },
                  }}
                  startIcon={item.icon}
                >
                  {/* แสดง Label เฉพาะตอนที่ไม่ถูกยุบ (ไม่กะทัดรัด) */}
                  {!isCompact && item.label}
                </Button>
              );
            })}
          </Box>

          {/* 🔹 RIGHT : LIBRARY & SETTINGS */}
          {/* 💡 THE FIX: เพิ่ม flex: 1 และ justifyContent: "flex-end" เพื่อถ่วงน้ำหนักกับฝั่งซ้าย */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: { xs: 0.2, sm: 1 },
            }}
          >
            {/* ซ่อนเส้นคั่นตอนยุบจอ */}
            {!isCompact && (
              <Box
                sx={{
                  width: "1px",
                  height: "24px",
                  bgcolor: "rgba(255,255,255,0.2)",
                  mx: 0.5,
                }}
              />
            )}
            {LIBRARY_ITEMS.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Tooltip key={item.id} title={item.label} arrow>
                  <IconButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: isActive ? THEME.activeBorder : "#d7ccc8",
                      backgroundColor: isActive
                        ? "rgba(255, 236, 179, 0.1)"
                        : "transparent",
                      border: `2px solid ${isActive ? THEME.activeBorder : "transparent"}`,
                      borderRadius: "8px",
                      p: { xs: 0.5, sm: 1 },
                      "& .MuiSvgIcon-root": { fontSize: { xs: 20, sm: 24 } },
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              );
            })}
            <IconButton
              onClick={() => setConfirmLogout(true)}
              sx={{
                color: "#d7ccc8",
                p: { xs: 0.5, sm: 1 },
                "&:hover": { color: "#ff1744", transform: "rotate(90deg)" },
                transition: "all 0.3s",
              }}
            >
              <SettingsIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <GameDialog
        open={confirmLogout}
        title="Confirm Logout"
        description="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
        confirmText="Logout"
        cancelText="Cancel"
        showAudioSettings={true}
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
      />
    </>
  );
};

export default GameAppBar;
