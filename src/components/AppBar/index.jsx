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
  Menu,
  MenuItem,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, memo } from "react";
import { motion, animate, useAnimation } from "framer-motion";

// Icons
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import AddIcon from "@mui/icons-material/Add";
import ErrorIcon from "@mui/icons-material/Error";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import MenuIcon from "@mui/icons-material/Menu"; // 💡 นำเข้าไอคอน Menu เพิ่มสำหรับยุบ Nav
import { MdInventory } from "react-icons/md";
import { GiBroadsword } from "react-icons/gi";
import {
  FaCrown,
  FaSuitcase,
  FaUserAlt,
  FaTrophy,
  FaBook,
} from "react-icons/fa";
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

//style admin
import "../../pages/AdminBoss/AdminBoss.css";

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

    const hasTriggeredRef = useRef(false);

    useEffect(() => {
      if (timerStatus === "reduced") {
        controls.start({
          scale: [1, 1.3, 1],
          transition: { duration: 0.5 },
        });
      }
    }, [timerStatus, controls]);

    useEffect(() => {
      let retryTimer;

      if (timeLeft > 0) {
        hasTriggeredRef.current = false;
      } else if (timeLeft <= 0 && !isFull) {
        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          if (onTimerEnd) {
            onTimerEnd();
          }
        }

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

  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const playClickSound = useGameSfx(clickSfx);

  const isMobileWidth = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const isMdWidth = useMediaQuery(muiTheme.breakpoints.down("md"));
  const isLandscapeMobile = useMediaQuery(
    "(orientation: landscape) and (max-height: 450px)",
  );

  // 💡 ตรวจสอบว่าเป็น "แนวตั้ง" หรือไม่
  const isPortrait = useMediaQuery("(orientation: portrait)");
  
  // 💡 ยุบเมนูเฉพาะตอนมือถือ + แนวตั้ง เท่านั้น
  const shouldCollapseNav = isPortrait && isMobileWidth;
  const isCompact = isMobileWidth || isLandscapeMobile;

  const activeHero = currentUser?.heroes?.find((h) => h.is_selected);
  const heroId = activeHero?.hero_id;
  const currentLevel = activeHero?.level || 1;

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "adminBoss";

  const [openSettings, setOpenSettings] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isMiniGameOpen, setIsMiniGameOpen] = useState(false);
  const [libraryAnchorEl, setLibraryAnchorEl] = useState(null);
  // 💡 State สำหรับควบคุมตำแหน่งของ Menu Navigation เวลาย่อ
  const [navAnchorEl, setNavAnchorEl] = useState(null);

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
      id: "character",
      label: "CHARACTER",
      path: "/home/character",
      icon: <FaUserAlt />,
    },
    {
      id: "adventure",
      label: "ADVENTURE",
      path: "/home",
      icon: <GiBroadsword />,
      isMain: true,
    },
    {
      id: "wordlog",
      label: "WORDLOG",
      path: "/home/wordlog",
      icon: <FaBook />,
    },
    {
      id: "scoreboard",
      label: "SCOREBOARD",
      path: "/home/scoreboard",
      icon: <FaTrophy />,
    },
  ];

  const LIBRARY_ITEMS = [
    {
      id: "monster",
      label: "MONSTERS",
      path: "/home/monster",
      icon: (
        <CatchingPokemonIcon
          sx={{ mr: 1.5, fontSize: "22px", color: "#ffecb3" }}
        />
      ),
    },
    {
      id: "dict",
      label: "DICTIONARY",
      path: "/home/dictionary",
      icon: (
        <AutoStoriesIcon sx={{ mr: 1.5, fontSize: "22px", color: "#ffecb3" }} />
      ),
    },
  ];

  const isLibraryActive =
    location.pathname.includes("/home/monster") ||
    location.pathname.includes("/home/dictionary");

  // 💡 เช็คว่าหน้าปัจจุบันที่ Active อยู่ในกลุ่ม Nav ที่จะโดนยุบหรือไม่
  const isNavMenuActive = MAIN_NAV_ITEMS.some(
    (item) => !item.isMain && location.pathname.includes(item.path)
  );

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
                  pl: { xs: "40px", sm: "45px", md: "50px" },
                  pr: { xs: 1.5, sm: 2 },
                  py: 0.5,
                  backgroundColor: "rgba(43, 29, 20, 0.6)",
                  borderRadius: "15px",
                  border: "3px solid #5A3A2E",
                  boxShadow: "0 3px 0 #2b1a12",
                  display: "flex",
                  flexDirection: "column",
                  width: "fit-content",
                  minWidth: "0px",
                  maxWidth: { xs: "120px", sm: "160px", md: "200px" },
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    pl: "40px",
                    maxWidth: "140px",
                    borderRadius: "12px",
                  },
                }}
              >
                <Tooltip title={currentUser?.username}>
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: { xs: 6, sm: 8, md: 9 },
                      color: "#E8E9CD",
                      mb: 0.5,
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {currentUser?.username}{" "}
                  </Typography>
                </Tooltip>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    width: "fit-content",
                  }}
                >
                  <MonetizationOnIcon
                    sx={{
                      fontSize: { xs: 10, sm: 11 },
                      color: "#FFD700",
                      filter: "drop-shadow(1px 2px 0px #B8860B)",
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      border: "1px solid #B8860B",
                      flexShrink: 0,
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
            {/* 💡 THE FIX: ยุบเฉพาะมือถือตอนเป็น "แนวตั้ง" เท่านั้น */}
            {shouldCollapseNav ? (
              <>
                {/* 1. ปุ่มหลัก ADVENTURE ให้คงไว้เสมอ */}
                {MAIN_NAV_ITEMS.filter((item) => item.isMain).map((item) => {
                  const isActive = location.pathname === "/home";
                  return (
                    <Button
                      key={item.id}
                      onClick={() => {
                        playClickSound();
                        navigate(item.path);
                      }}
                      sx={{
                        position: "relative",
                        overflow: "visible",
                        minWidth: "120px",
                        height: "36px",
                        flexDirection: "row",
                        fontFamily: "'Press Start 2P'",
                        fontSize: 8,
                        color: isActive ? THEME.bgDark : "#d7ccc8",
                        backgroundColor: isActive ? THEME.accent : "rgba(43, 29, 20, 0.6)",
                        border: `2px solid ${isActive ? THEME.activeBorder : "#5a3e2b"}`,
                        borderRadius: "8px",
                        boxShadow: isActive ? `0 0 12px ${THEME.accent}` : "0 3px 0 #1a120b",
                        p: { xs: 0, sm: 1.5 },
                        transition: "all 0.1s",
                        "&:hover": {
                          backgroundColor: isActive ? THEME.accent : "rgba(43, 29, 20, 0.9)",
                          transform: "translateY(1px)",
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}

                {/* 2. ปุ่มเมนูยุบรวม สำหรับรายการที่เหลือ */}
                <Tooltip title="Menu" arrow>
                  <IconButton
                    onClick={(e) => {
                      playClickSound();
                      setNavAnchorEl(e.currentTarget);
                    }}
                    sx={{
                      position: "relative",
                      color: isNavMenuActive ? THEME.bgDark : "#d7ccc8",
                      backgroundColor: isNavMenuActive ? THEME.accent : "rgba(43, 29, 20, 0.6)",
                      border: `2px solid ${isNavMenuActive ? THEME.activeBorder : "#5a3e2b"}`,
                      borderRadius: "8px",
                      boxShadow: isNavMenuActive ? `0 0 12px ${THEME.accent}` : "0 3px 0 #1a120b",
                      width: "36px",
                      height: "36px",
                      transition: "all 0.1s",
                      "&:hover": {
                        backgroundColor: isNavMenuActive ? THEME.accent : "rgba(43, 29, 20, 0.9)",
                        transform: "translateY(1px)",
                      },
                      "& .MuiSvgIcon-root": {
                        fontSize: 20,
                      },
                    }}
                  >
                    {hasEmptySlot ? ( 
                       <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        variant="dot"
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor: "#ff1744",
                            boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                            right: 2,
                            top: 2,
                          }
                        }}
                      >
                        <MenuIcon />
                      </Badge>
                    ) : (
                      <MenuIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              /* แสดงปุ่มปกติทั้งหมดถ้าเป็นจอใหญ่ หรือเป็น "แนวนอน" */
              MAIN_NAV_ITEMS.map((item) => {
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
                      // 💡 ทำให้แนวนอนเล็กบีบ Width ให้พอดีจอ
                      minWidth: isLandscapeMobile ? (item.isMain ? "90px" : "40px") : (item.isMain ? "160px" : "60px"),
                      height: isLandscapeMobile ? "32px" : (item.isMain ? { xs: "40px", sm: "45px", md: "52px" } : { xs: "36px", md: "40px" }),
                      flexDirection: { xs: "column", sm: "row" },
                      fontFamily: "'Press Start 2P'",
                      fontSize: item.isMain ? { xs: 7, sm: 8, md: 13 } : { xs: 6, sm: 8 },
                      color: isActive ? THEME.bgDark : "#d7ccc8",
                      backgroundColor: isActive ? THEME.accent : "rgba(43, 29, 20, 0.6)",
                      border: `2px solid ${isActive ? THEME.activeBorder : "#5a3e2b"}`,
                      borderRadius: "8px",
                      boxShadow: isActive ? `0 0 12px ${THEME.accent}` : "0 3px 0 #1a120b",
                      p: isLandscapeMobile ? 0 : { xs: 0, sm: 1.5 },
                      transition: "all 0.1s",
                      "& .MuiButton-startIcon": {
                        margin: 0,
                        "& > *:nth-of-type(1)": {
                          fontSize: isLandscapeMobile ? (item.isMain ? 16 : 14) : (item.isMain ? 26 : 22),
                        },
                      },
                      "&:hover": {
                        backgroundColor: isActive ? THEME.accent : "rgba(43, 29, 20, 0.9)",
                        transform: "translateY(1px)",
                      },
                      "@media (orientation: landscape) and (max-height: 450px)": {
                        fontSize: item.isMain ? 6 : 5,
                      }
                    }}
                    startIcon={!item.isMain ? item.icon : null}
                  >
                    {item.isMain ? item.label : null}{" "}
                  </Button>
                );

                let renderedContent = buttonContent;

                if (item.id === "item" && hasEmptySlot) {
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
                        {buttonContent}{" "}
                      </Badge>
                    </Tooltip>
                  );
                } else if (!item.isMain) {
                  renderedContent = (
                    <Tooltip title={item.label} arrow placement="top">
                      <Box>{buttonContent}</Box>{" "}
                    </Tooltip>
                  );
                } else {
                  renderedContent = buttonContent;
                }

                return (
                  <Box key={item.id} sx={{ position: "relative" }}>
                    {renderedContent}
                  </Box>
                );
              })
            )}
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
            
            <Tooltip title="Library" arrow>
              <IconButton
                onClick={(e) => {
                  playClickSound();
                  setLibraryAnchorEl(e.currentTarget);
                }}
                sx={{
                  color: isLibraryActive ? THEME.activeBorder : "#d7ccc8",
                  backgroundColor: isLibraryActive
                    ? "rgba(255, 236, 179, 0.1)"
                    : "transparent",
                  border: `2px solid ${isLibraryActive ? THEME.activeBorder : "transparent"}`,
                  borderRadius: "8px",
                  p: { xs: 0.5, sm: 1 },
                  "& .MuiSvgIcon-root": {
                    fontSize: !isLandscapeMobile ? { xs: 20, sm: 24 } : 18,
                  },
                }}
              >
                <MenuBookIcon />
              </IconButton>
            </Tooltip>

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

            {!isAdmin ? (
              <Tooltip title="Logout" arrow>
                <IconButton
                  onClick={() => {
                    playClickSound();
                    setConfirmLogout(true);
                  }}
                  sx={{
                    color: "#d7ccc8",
                    p: { xs: 0.5, sm: 1 },
                    "&:hover": {
                      color: "#ff1744",
                      transform: "translateX(2px)",
                    },
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
            ) : (
              <button
                className="server-mini-btn"
                onClick={() => navigate("/")}
                type="button"
                title="Go to Game Page"
              >
                Admin
              </button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* 🧭 MUI Menu สำหรับยุบ Navigation (ทำงานเมื่อหน้าจอเล็กแนวตั้ง) */}
      <Menu
        anchorEl={navAnchorEl}
        open={Boolean(navAnchorEl)}
        onClose={() => setNavAnchorEl(null)}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        PaperProps={{
          sx: {
            backgroundColor: "#19120e",
            border: "3px solid #8c734b",
            borderRadius: "8px",
            boxShadow: "0 0 0 5px #0f0a08, 0 10px 40px rgba(0,0,0,0.9)",
            mt: 1,
            width: "200px",
            "& .MuiList-root": {
              padding: "12px",
            },
          },
        }}
      >
        {MAIN_NAV_ITEMS.filter((item) => !item.isMain).map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <MenuItem
              key={item.id}
              onClick={() => {
                playClickSound();
                setNavAnchorEl(null);
                navigate(item.path);
              }}
              sx={{
                background: isActive ? "linear-gradient(to bottom, #d6b46a, #b3904a)" : "linear-gradient(to bottom, #4a3b2a, #2b2218)",
                border: `2px solid ${isActive ? "#f1c40f" : "#6b543a"}`,
                borderBottom: `4px solid ${isActive ? "#b38b1d" : "#6b543a"}`,
                borderRadius: "6px",
                color: isActive ? "#1a120b" : "#d1c4b6",
                fontFamily: "'Press Start 2P'",
                fontSize: "10px",
                py: 1.5,
                mb: 1,
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 1.5,
                transition: "all 0.1s",
                "&:hover": {
                  filter: "brightness(1.2)",
                  transform: "translateY(-2px)",
                  backgroundColor: "transparent",
                },
                "&:active": {
                  transform: "translateY(2px)",
                  borderBottom: `2px solid ${isActive ? "#b38b1d" : "#6b543a"}`,
                },
                "&:last-child": {
                  mb: 0,
                },
                "& > svg": {
                  fontSize: "16px",
                  color: isActive ? "#1a120b" : "#ffecb3",
                }
              }}
            >
              {item.id === "item" && hasEmptySlot ? (
                <Badge
                  color="error"
                  variant="dot"
                  overlap="circular"
                  sx={{ "& .MuiBadge-badge": { right: -2, top: 0 } }}
                >
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
              {item.label}
            </MenuItem>
          );
        })}
      </Menu>

      {/* 📚 MUI Menu สำหรับเลือก Library */}
      <Menu
        anchorEl={libraryAnchorEl}
        open={Boolean(libraryAnchorEl)}
        onClose={() => setLibraryAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            backgroundColor: "#19120e",
            border: "3px solid #8c734b",
            borderRadius: "8px",
            boxShadow: "0 0 0 5px #0f0a08, 0 10px 40px rgba(0,0,0,0.9)",
            mt: 1,
            width: { xs: "200px", sm: "240px" },
            "& .MuiList-root": {
              padding: "12px",
            },
          },
        }}
      >
        {LIBRARY_ITEMS.map((item) => (
          <MenuItem
            key={item.id}
            onClick={() => {
              playClickSound();
              setLibraryAnchorEl(null);
              navigate(item.path);
            }}
            sx={{
              background: "linear-gradient(to bottom, #4a3b2a, #2b2218)",
              border: "2px solid #6b543a",
              borderBottom: "4px solid #6b543a",
              borderRadius: "6px",
              color: "#d1c4b6",
              fontFamily: "'Press Start 2P'",
              fontSize: { xs: "10px", sm: "11px" },
              py: 1.5,
              mb: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "all 0.1s",
              "&:hover": {
                filter: "brightness(1.2)",
                transform: "translateY(-2px)",
                backgroundColor: "transparent",
              },
              "&:active": {
                transform: "translateY(2px)",
                borderBottom: "2px solid #6b543a",
              },
              "&:last-child": {
                mb: 0,
              },
            }}
          >
            {item.icon} {item.label}
          </MenuItem>
        ))}
      </Menu>

      {/* ⚙️ 1. Dialog สำหรับ "ตั้งค่าเสียง" */}
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
      
      {/* 🚪 2. Dialog สำหรับ "ยืนยันการล็อคเอาท์" */}
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
      />{" "}
    </>
  );
};

export default React.memo(GameAppBar);