import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button,
  Tooltip,
  IconButton,
  Badge,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, memo } from "react";
import { motion, animate, useAnimation } from "framer-motion";

// Icons
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import AddIcon from "@mui/icons-material/Add";
import ErrorIcon from "@mui/icons-material/Error";
import { MdInventory } from "react-icons/md";
import { GiBroadsword } from "react-icons/gi";
import { FaCrown, FaSuitcase, FaUserAlt } from "react-icons/fa";
// Assets
import { useAuthStore } from "../../store/useAuthStore";
import { useLoginPlayer } from "../../pages/AuthPage/LoginPage/hook/useLoginPlayer";
import { LoadImage } from "../../pages/HomePage/hook/usePreloadFrams";
import { GameDialog } from "../GameDialog";
import MiniGame from "../../pages/HomePage/feature/MiniGame/MiniGame";
import { useStaminaTimer } from "../../hook/useStaminaTimer";
//sound
import { useGameSfx } from "../../hook/useGameSfx";
import clickSfx from "../../assets/sound/click1.ogg";

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
        "@media (orientation: landscape) and (max-height: 450px)": {
          fontSize: 6,
        },
      }}
    >
      {formatGameMoney(displayValue)}
    </Typography>
  );
};

const EnergyBar = React.memo(
  ({
    currentStamina = 0,
    maxStamina = 3,
    timeToNextEnergy = 0,
    onAddClick,
    onTimerEnd,
  }) => {
    const staminaObj = React.useMemo(
      () => ({
        current: currentStamina,
        max: maxStamina,
        timeToNext: timeToNextEnergy,
      }),
      [currentStamina, maxStamina, timeToNextEnergy],
    );

    const { timeLeft, isFull, timerStatus } = useStaminaTimer(staminaObj);
    const controls = useAnimation();
    
    // 💡 THE FIX: เปลี่ยนมาใช้ useRef แทน State เพื่อไม่ให้เกิด Render loop กวนใจ
    const hasTriggeredRef = useRef(false);

    useEffect(() => {
      if (timerStatus === "reduced") {
        controls.start({
          scale: [1, 1.3, 1], 
          transition: { duration: 0.5 },
        });
      }
    }, [timerStatus, controls]);

    // 💡 THE FIX: ลอจิกจับเวลาหมดที่ปรับปรุงใหม่ (ป้องกันค้างที่ 0:00)
    useEffect(() => {
      let retryTimer;
      
      if (timeLeft > 0) {
        // เมื่อเวลามีมากกว่า 0 (คือเวลายังเดินอยู่ หรือเพิ่งได้สายฟ้ามาใหม่)
        hasTriggeredRef.current = false;
      } else if (timeLeft <= 0 && !isFull) {
        if (!hasTriggeredRef.current) {
          // เมื่อเวลาแตะ 0 พอดี และยังไม่เต็ม และยังไม่ได้ยิงคำสั่ง
          hasTriggeredRef.current = true; // สับล็อคเพื่อกันการยิงรัวๆ ทันที
          if (onTimerEnd) {
            onTimerEnd(); // เรียกฟังก์ชัน refreshUser() ขอสายฟ้าจาก Backend!
          }
        }
        
        // 💡 THE FIX: Retry Mechanism!
        // ถ้า UI ค้างที่ 0:00 นานเกิน 2.5 วินาที แสดงว่า Backend ตอบกลับมาไม่ทันเวลา
        // ให้ปลดล็อคเพื่อยิง API ขอเช็คสายฟ้าอีกรอบอัตโนมัติ!
        retryTimer = setTimeout(() => {
          hasTriggeredRef.current = false;
        }, 2500);
      }

      return () => {
        if (retryTimer) clearTimeout(retryTimer);
      };
    }, [timeLeft, isFull, onTimerEnd]);

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
          "@media (orientation: landscape) and (max-height: 450px)": {
            height: "35px",
            borderRadius: "13px",
            px: 0.5,
            mr: 1,
            gap: 0.5,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[...Array(maxStamina)].map((_, index) => {
            const isActive = index < currentStamina;
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
                  stroke: "#B8860B",
                  strokeWidth: 2,
                  paintOrder: "stroke fill",
                  transition: "all 0.3s",
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: 13,
                  },
                }}
              />
            );
          })}
        </Box>

        {!isFull && (
          <Box
            sx={{
              minWidth: { xs: "30px", sm: "40px" },
              textAlign: "center",
              mx: { xs: 0.5, sm: 1 },
              "@media (orientation: landscape) and (max-height: 450px)": {
                mx: 0,
              },
            }}
          >
            <Typography
              component={motion.span}
              animate={controls}
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: { xs: 7.5, sm: 9 },
                opacity: 0.9,
                color: timerStatus === "reduced" ? "#69f0ae" : "#E8E9CD",
                letterSpacing: "-0.5px",
                transition: "color 0.3s ease",
                display: "inline-block",
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 7,
                },
              }}
            >
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        )}

        <Tooltip
          title="Play Minigame to get Energy!"
          arrow
          placement="bottom"
          slotProps={{
            tooltip: {
              sx: {
                fontSize: "12px",
                fontFamily: "'Verdana', sans-serif",
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
            disabled={isFull}
            sx={{
              backgroundColor: "#66bb6a",
              border: "1.5px solid #2e7d32",
              boxShadow: "0 0 6px rgba(102,187,106,0.6)",
              p: 0,
              width: { xs: 18, sm: 22 },
              height: { xs: 18, sm: 22 },
              "&:hover": {
                backgroundColor: "#66bb6a",
                transform: "translateY(1px)",
                boxShadow: "0 1px 0 #1b5e20",
              },
              "&:active": {
                transform: "translateY(2px)",
                boxShadow: "none",
              },
              "@media (orientation: landscape) and (max-height: 450px)": {
                width: 16,
                height: 16,
                borderRadius: "6px",
              },
            }}
          >
            <AddIcon
              sx={{
                color: "#fff",
                fontSize: { xs: 14, sm: 18 },
                fontWeight: "bold",
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 12,
                },
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>
    );
  },
);

const GameAppBar = () => {
  const { currentUser, logout } = useLoginPlayer();
  const {
    volume,
    isMuted,
    setVolume,
    toggleMute,
    sfxVolume,
    isSfxMuted,
    setSfxVolume,
    toggleSfxMute,
    refreshUser,
  } = useAuthStore();

  const muiTheme = useMuiTheme();
  const playClickSound = useGameSfx(clickSfx);

  const isMobileWidth = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const isMdWidth = useMediaQuery(muiTheme.breakpoints.down("md"));
  const isLandscapeMobile = useMediaQuery(
    "(orientation: landscape) and (max-height: 450px)",
  );

  const isCompact = isMobileWidth || isLandscapeMobile;

  const isLandscape = useMediaQuery("(orientation: landscape)");
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  // 💡 กลยุทธ์: ถ้าจอเล็กมาก ให้รวม Monsters กับ Dictionary เข้าด้วยกัน
  const showCompactLibrary = isMobile || isLandscapeMobile;

  const activeHero = currentUser?.heroes?.find((h) => h.is_selected);
  const heroId = activeHero?.hero_id;
  const currentLevel = activeHero?.level || 1;

  const navigate = useNavigate();
  const location = useLocation();

  const [openSettings, setOpenSettings] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const [isMiniGameOpen, setIsMiniGameOpen] = useState(false);

  const handleSaveSettings = (newSettings) => {
    if (!newSettings) return;

    setVolume(newSettings.volume);
    if (newSettings.isMuted !== isMuted) {
      toggleMute();
    }

    setSfxVolume(newSettings.sfxVolume);
    if (newSettings.isSfxMuted !== isSfxMuted) {
      toggleSfxMute();
    }

    setOpenSettings(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
    setConfirmLogout(false);
  };

  const currentItemsCount = currentUser?.potion
    ? (currentUser.potion.cure || 0) +
      (currentUser.potion.health || 0) +
      (currentUser.potion.reroll || 0)
    : 0;

  const maxItemsSlot = currentUser?.potion?.max_slot || 0;
  const hasEmptySlot = currentItemsCount < maxItemsSlot;

  const MAIN_NAV_ITEMS = [
    { id: "item", label: "ITEM", path: "/home/item", icon: <FaSuitcase /> },
    {
      id: "adventure",
      label: "ADVENTURE",
      path: "/home",
      icon: <GiBroadsword />, // 💡 ไม่ถูกโชว์แล้ว แต่ทิ้งไว้เป็นข้อมูลเฉยๆ
      isMain: true,
    },
    {
      id: "character",
      label: "CHARACTER",
      path: "/home/character",
      icon: <FaUserAlt />,
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
          height: isLandscapeMobile ? "50px" : "auto",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: "60px", md: "70px" },
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
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: { xs: 0.5, sm: 1 },
              "@media (orientation: landscape) and (max-height: 450px)": {
                gap: 0.5,
              },
            }}
          >
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
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    pl: "45px",
                    minWidth: "auto",
                    borderRadius: "12px",
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
                      "@media (orientation: landscape) and (max-height: 450px)":
                        {
                          fontSize: 6,
                          width:
                            currentUser?.username.length > 6 ? "100px" : "auto",
                        },
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
                      "@media (orientation: landscape) and (max-height: 450px)":
                        {
                          fontSize: 8,
                        },
                    }}
                  />
                  <AnimatedMoney
                    value={currentUser?.money || 0}
                    fontSize={isCompact ? 7 : 9}
                  />
                </Box>
              </Box>

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
                    width: 35,
                    height: 35,
                  },
                }}
              >
                <Avatar
                  src={LoadImage(name, heroId, 1)}
                  sx={{
                    width: !isLandscapeMobile ? "120%" : "110%",
                    height: !isLandscapeMobile ? "120%" : "110%",
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
                      fontSize: !isLandscapeMobile ? { xs: 5, sm: 7 } : 6.5,
                      color: "#FFD700",
                      fontFamily: "'Press Start 2P'",
                    }}
                  >
                    Lv.{currentLevel}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <EnergyBar
              currentStamina={currentUser?.stamina?.current ?? 0}
              maxStamina={currentUser?.stamina?.max ?? 3}
              timeToNextEnergy={currentUser?.stamina?.timeToNext ?? 0}
              onAddClick={() => {
                playClickSound();
                setIsMiniGameOpen(true);
              }}
              onTimerEnd={() => refreshUser()}
            />
          </Box>

          {/* 🔹 CENTER : NAVIGATION */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              "@media (orientation: landscape) and (max-height: 450px)": {
                gap: 1,
              },
            }}
          >
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive =
                item.path === "/home"
                  ? location.pathname === "/home"
                  : location.pathname.includes(item.path);

              const buttonContent = (
                <Button
                  onClick={() => {
                    playClickSound();
                    navigate(item.path);
                  }}
                  sx={{
                    position: "relative",
                    overflow: "visible",
                    // 💡 THE FIX: Adventure ใหญ่คงที่ (160px) ส่วน Item/Character บนคอมเล็กลง (60px)
                    minWidth: isCompact
                      ? "40px"
                      : item.isMain
                        ? "160px"
                        : "60px",
                    height: isCompact
                      ? "36px"
                      : item.isMain
                        ? { xs: "40px", sm: "45px", md: "52px" }
                        : { xs: "36px", md: "40px" },
                    flexDirection: { xs: "column", sm: "row" },
                    fontFamily: "'Press Start 2P'",
                    // 💡 THE FIX: ปรับขนาดฟอนต์ของ Adventure ให้เล็กลงนิดหน่อย
                    fontSize: item.isMain
                      ? { xs: 7, sm: 8, md: 13 }
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
                      // 💡 THE FIX: เอา margin ออกเมื่อโชว์แค่ไอคอนอย่างเดียว หรือ ไม่มีไอคอนเลย
                      margin: 0,
                      "& > *:nth-of-type(1)": {
                        fontSize: isCompact ? 18 : item.isMain ? 26 : 22,
                      },
                    },
                    "&:hover": {
                      backgroundColor: isActive
                        ? THEME.accent
                        : "rgba(43, 29, 20, 0.9)",
                      transform: "translateY(1px)",
                    },
                  }}
                  // 💡 THE FIX: โชว์ไอคอนเฉพาะปุ่มที่ไม่ได้เป็นหน้าหลัก (Item / Character)
                  startIcon={!item.isMain ? item.icon : null}
                >
                  {/* 💡 THE FIX: โชว์ Text เฉพาะปุ่มหน้าหลัก (Adventure) */}
                  {item.isMain ? item.label : null}
                </Button>
              );

              // 💡 THE FIX: ระบบห่อ Tooltip ให้ Item กับ Character
              let renderedContent = buttonContent;

              if (item.id === "item" && hasEmptySlot) {
                // ถ้าเป็น Item และมีช่องว่าง โชว์ Tooltip ข้อมูลช่องว่าง
                renderedContent = (
                  <Tooltip
                    title={`You have empty slots! (${currentItemsCount}/${maxItemsSlot})`}
                    arrow
                    placement="top"
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      badgeContent={
                        <ErrorIcon
                          sx={{
                            color: "#ff1744",
                            fontSize: "1.2rem",
                            backgroundColor: "#fff",
                            borderRadius: "50%",
                            boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                          }}
                        />
                      }
                    >
                      {buttonContent}
                    </Badge>
                  </Tooltip>
                );
              } else if (!item.isMain) {
                // ถ้าเป็น Item (ตอนเต็ม) หรือ Character โชว์ Tooltip เป็นชื่อของเมนู
                renderedContent = (
                  <Tooltip title={item.label} arrow placement="top">
                    {/* ห่อ Box กันเหนียวเผื่อ Tooltip งงกับ Button */}
                    <Box>{buttonContent}</Box>
                  </Tooltip>
                );
              } else {
                // ส่วน Adventure เป็นปุ่มใหญ่มี Text อยู่แล้ว ปล่อยโล่ง
                renderedContent = buttonContent;
              }

              return (
                <Box key={item.id} sx={{ position: "relative" }}>
                  {renderedContent}
                </Box>
              );
            })}
          </Box>

          {/* 🔹 RIGHT : LIBRARY & SETTINGS & LOGOUT */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: { xs: 0.2, sm: 1 },
              "@media (orientation: landscape) and (max-height: 450px)": {
                gap: 0,
              },
            }}
          >
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
                    onClick={() => {
                      playClickSound();
                      navigate(item.path);
                    }}
                    sx={{
                      color: isActive ? THEME.activeBorder : "#d7ccc8",
                      backgroundColor: isActive
                        ? "rgba(255, 236, 179, 0.1)"
                        : "transparent",
                      border: `2px solid ${isActive ? THEME.activeBorder : "transparent"}`,
                      borderRadius: "8px",
                      p: { xs: 0.5, sm: 1 },
                      "& .MuiSvgIcon-root": {
                        fontSize: !isLandscapeMobile ? { xs: 20, sm: 24 } : 18,
                      },
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              );
            })}

            <Tooltip title="Settings" arrow>
              <IconButton
                onClick={() => {
                  playClickSound();
                  setOpenSettings(true);
                }}
                sx={{
                  color: "#d7ccc8",
                  p: { xs: 0.5, sm: 1 },
                  "&:hover": { color: "#f1c40f", transform: "rotate(90deg)" },
                  transition: "all 0.3s",
                }}
              >
                <SettingsIcon
                  sx={{
                    fontSize: !isLandscapeMobile ? { xs: 20, sm: 24 } : 18,
                  }}
                />
              </IconButton>
            </Tooltip>

            <Tooltip title="Logout" arrow>
              <IconButton
                onClick={() => {
                  playClickSound();
                  setConfirmLogout(true);
                }}
                sx={{
                  color: "#d7ccc8",
                  p: { xs: 0.5, sm: 1 },
                  "&:hover": { color: "#ff1744", transform: "translateX(2px)" },
                  transition: "all 0.3s",
                }}
              >
                <LogoutIcon
                  sx={{
                    fontSize: !isLandscapeMobile ? { xs: 20, sm: 24 } : 18,
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ⚙️ 1. Dialog สำหรับ "ตั้งค่าเสียง" เท่านั้น (ไม่ถามเรื่อง Logout) */}
      <GameDialog
        open={openSettings}
        title="SETTINGS"
        onConfirm={handleSaveSettings}
        onCancel={() => setOpenSettings(false)}
        confirmText="SAVE"
        showAudioSettings={true}
        volume={volume}
        isMuted={isMuted}
        sfxVolume={sfxVolume}
        isSfxMuted={isSfxMuted}
      />

      {/* 🚪 2. Dialog สำหรับ "ยืนยันการล็อคเอาท์" แยกออกมาเป็นอีกหน้าต่าง */}
      <GameDialog
        open={confirmLogout}
        title="LOGOUT"
        description="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
        confirmText="YES"
        cancelText="NO"
        cancelColor="wood"
      />

      <MiniGame
        open={isMiniGameOpen}
        onClose={() => setIsMiniGameOpen(false)}
        currentStamina={currentUser?.stamina?.current}
        maxStamina={currentUser?.stamina?.max}
      />
    </>
  );
};

export default React.memo(GameAppBar);
