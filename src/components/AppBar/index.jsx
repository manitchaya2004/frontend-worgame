import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, animate } from "framer-motion";

// Icons (MUI Icons เพื่อความชัวร์ หรือใช้ SVG ที่คุณ import มา)
import AutoStoriesIcon from "@mui/icons-material/AutoStories"; // Dictionary
import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon"; // Monster
import ShieldIcon from "@mui/icons-material/Shield"; // Adventure
import PersonIcon from "@mui/icons-material/Person"; // Character
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";


// Assets เดิมของคุณ
import { useLoginPlayer } from "../../pages/AuthPage/LoginPage/hook/useLoginPlayer";
import { LoadImage } from "../../pages/HomePage/hook/usePreloadFrams";
import { GameDialog } from "../GameDialog";

// --- THEME CONFIG (เพื่อให้แก้สีง่ายๆ) ---
const THEME = {
  bgMain: "#E8E9CD", // สีพื้นหลังแท่งบาร์
  bgDark: "#2b1d14", // สีพื้นหลังปุ่ม
  border: "#5A3A2E", // สีขอบ
  text: "#3e2615", // สีตัวหนังสือเข้ม
  accent: "#ffecb3", // สีทอง (Active)
  activeBorder: "#FFD700", // สีขอบตอนเลือก
};

const name = "img_hero";

const AnimatedMoney = ({ value, fontSize = 13 }) => {
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
              : "#3e2615", // ใช้สีน้ำตาลเข้มให้เข้ากับพื้นหลัง
        // width: "60px", // เอา width fix ออกเพื่อให้ text ไหลตามความยาวเงิน
        textAlign: "left",
        transition: "color 0.3s ease",
        lineHeight: 0, // ตัดขอบบนล่างทิ้ง
        
      }}
    >
      {displayValue.toLocaleString()}
    </Typography>
  );
};

const GameAppBar = () => {
  const { currentUser, logout } = useLoginPlayer();
  const activeHero = currentUser?.heroes?.find((h) => h.is_selected);
  const heroId = activeHero?.hero_id;
  const currentLevel = activeHero?.level || 1;

  const navigate = useNavigate();
  const location = useLocation();

  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
    setConfirmLogout(false);
  };

  const handleConfirmLogout = () => {
    setConfirmLogout(true);
  };

  const handleCancelLogout = () => {
    setConfirmLogout(false);
  };

  // --- MENU CONFIGURATION ---
  // แก้ไข Path ตรงนี้ให้ตรงกับ Route ของคุณ
  // --- MENU CONFIGURATION ---
  // 1. ปุ่มหลักตรงกลาง (Gameplay)
  const MAIN_NAV_ITEMS = [
    {
      id: "item",
      label: "ITEM",
      path: "/home/item",
      icon: <InventoryIcon />,
    },
    {
      id: "adventure",
      label: "ADVENTURE",
      path: "/home",
      icon: <ShieldIcon sx={{ fontSize: 24 }} />,
      isMain: true,
    },
    {
      id: "character",
      label: "CHARACTER",
      path: "/home/character",
      icon: <PersonIcon />,
    },
  ];

  // 2. ปุ่ม Library ย้ายไปไว้ด้านขวา (Reference)
  const LIBRARY_ITEMS = [
    {
      id: "monster",
      label: "MONSTERS",
      path: "/home/monster",
      icon: <CatchingPokemonIcon />,
    },
    {
      id: "dict",
      label: "DICTIONARY",
      path: "/home/dictionary",
      icon: <AutoStoriesIcon />,
    },
  ];

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "rgba(14, 14, 18, 0.74)",
          boxShadow: "none",
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <Toolbar
          sx={{
            minHeight: "70px !important",
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* 🔹 LEFT : PROFILE & MONEY SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", width: "280px" }}>
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {/* Box หลัง: ชื่อ + เงิน */}
              <Box
                sx={{
                  pl: "60px", // เว้นที่ให้ Avatar
                  pr: 3,
                  py: 1,
                  backgroundColor: "#E8E9CD",
                  borderRadius: "20px",
                  border: "4px solid #5A3A2E",
                  boxShadow: "0 4px 0 #2b1a12",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  width: "140px",
                }}
              >
                {/* ชื่อผู้เล่น */}
                <Typography
                  sx={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: 10,
                    color: "#3e2615",
                    mb: 0.5,
                  }}
                >
                  {currentUser?.username}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MonetizationOnIcon
                    sx={{
                      fontSize: 14,
                      color: "#FFD700", // สีทองอร่าม
                      // ใส่เงา Drop Shadow สีน้ำตาลทองเข้มๆ ให้ดูนูนๆ แบบเกม
                      filter: "drop-shadow(1px 2px 0px #B8860B)",
                      borderRadius: "50%",
                      backgroundColor: "#fff", // พื้นหลังขาวช่วยดันให้ทองเด่น
                      border: "1px solid #B8860B", // ขอบตัด
                    }}
                  />
                  <AnimatedMoney value={currentUser?.money || 0} fontSize={10} />
                </Box>
              </Box>

              {/* Avatar + Level Badge */}
              <Box
                sx={{
                  position: "absolute",
                  left: "-5px",
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  backgroundColor: "#E8E9CD",
                  border: "4px solid #5A3A2E",
                  boxShadow: "0 4px 0 #2b1a12",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >
                <Avatar
                  src={LoadImage(name, heroId, 1)}
                  sx={{
                    width: 65,
                    height: 65,
                    imageRendering: "pixelated",
                    mb: 1,
                  }}
                />

                {/* 📌 LEVEL BADGE: ย้าย Level มาแปะตรงนี้แทน */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -5,
                    right: -5,
                    backgroundColor: THEME.bgDark,
                    border: `2px solid ${THEME.activeBorder}`,
                    borderRadius: "8px",
                    padding: "2px 4px",
                    zIndex: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 7,
                      color: "#FFD700",
                      fontFamily: "'Press Start 2P'",
                    }}
                  >
                    Lv.{currentLevel}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 🔹 CENTER : NAVIGATION TABS (เหลือแค่ 3 อันหลัก) */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              gap: 1.5,
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
                  startIcon={item.icon}
                  sx={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: item.isMain ? 12 : 8,
                    letterSpacing: 2,
                    color: isActive ? THEME.bgDark : "#d7ccc8",
                    backgroundColor: isActive
                      ? THEME.accent
                      : "rgba(43, 29, 20, 0.6)",
                    border: `2px solid ${
                      isActive ? THEME.activeBorder : "#5a3e2b"
                    }`,
                    borderRadius: "8px",
                    px: 2,
                    py: 1,
                    minWidth: "120px",
                    boxShadow: isActive
                      ? `0 0 10px ${THEME.accent}`
                      : "0 4px 0 #1a120b",
                    transform: isActive ? "translateY(2px)" : "translateY(0)",
                    transition: "all 0.1s",
                    "&:hover": {
                      backgroundColor: isActive
                        ? THEME.accent
                        : "rgba(43, 29, 20, 0.9)",
                      transform: "translateY(2px)",
                      boxShadow: "none",
                      borderColor: THEME.accent,
                    },
                    "& .MuiButton-startIcon": {
                      mr: 1,
                      mb: 0.5,
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* 🔹 RIGHT : LIBRARY ICONS, MONEY & SETTINGS */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "300px", // เพิ่มความกว้างเผื่อไอคอนใหม่
              pr: 2,
              gap: 1.5, // ระยะห่างระหว่าง elements ด้านขวา
            }}
          >
            {/* กล่องเงิน
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                pl: 4,
                pr: 2,
                py: 0.8,
                backgroundColor: "#E8E9CD",
                border: "4px solid #5A3A2E",
                borderRadius: "15px",
                boxShadow: "0 4px 0 #2b1a12",
                mr: 1, // เว้นระยะห่างจากปุ่ม Library
              }}
            >
              <Box
                component="img"
                src={coin}
                sx={{ position: "absolute", left: -12, width: 32 }}
              />
              <AnimatedMoney value={currentUser?.money || 0} />
            </Box> */}

            {/* --- SEPARATOR --- */}
            {/* เส้นแบ่งจางๆ (Optional) */}
            <Box
              sx={{
                width: "1px",
                height: "30px",
                bgcolor: "rgba(255,255,255,0.2)",
                mx: 0.5,
              }}
            />

            {/* LIBRARY ICONS (Monsters & Dictionary) */}
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
                      border: `2px solid ${
                        isActive ? THEME.activeBorder : "transparent"
                      }`,
                      borderRadius: "8px", // เป็นสี่เหลี่ยมมนๆ ให้เข้ากับธีม
                      padding: "8px",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(43, 29, 20, 0.6)",
                        transform: "scale(1.1)",
                        color: THEME.accent,
                      },
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              );
            })}

            {/* SETTINGS LOGOUT */}
            <Tooltip title="Logout" arrow>
              <IconButton
                onClick={handleConfirmLogout}
                sx={{
                  color: "#d7ccc8",
                  "&:hover": { color: "#ff1744", transform: "rotate(90deg)" },
                  transition: "all 0.3s",
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <GameDialog
        open={confirmLogout}
        title="Confirm Logout"
        description="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onCancel={handleCancelLogout}
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
};

export default GameAppBar;
