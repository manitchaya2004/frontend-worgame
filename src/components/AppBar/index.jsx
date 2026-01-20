import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button,
  Tooltip,
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
// Assets เดิมของคุณ
import coin from "../../assets/icons/coin.svg";
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

const AnimatedMoney = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [status, setStatus] = useState("idle"); // idle, increase, decrease
  const prevValue = useRef(value);

  useEffect(() => {
    // กำหนดสีตามการเปลี่ยนแปลง
    if (value > prevValue.current) setStatus("increase");
    else if (value < prevValue.current) setStatus("decrease");

    // อนิเมชั่นตัวเลขวิ่ง
    const controls = animate(prevValue.current, value, {
      duration: 1, // วิ่งภายใน 1 วินาที
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
      animate={status !== "idle" ? { scale: [1, 1.2, 1] } : {}} // เด้งเบาๆ เวลาเปลี่ยน
      sx={{
        fontFamily: "'Press Start 2P'",
        fontSize: { xs: 8, md: 10 },
        // เปลี่ยนสี: เพิ่ม=เขียว, ลด=แดงสว่าง, ปกติ=ดำ
        color:
          status === "increase"
            ? "#4caf50"
            : status === "decrease"
              ? "#ff1744"
              : "rgba(0, 0, 0, 1)",
        width: "60px",
        textAlign: "center",
        transition: "color 0.3s ease",
      }}
    >
      {displayValue.toLocaleString()}
    </Typography>
  );
};

const GameAppBar = () => {
  const { currentUser ,logout} = useLoginPlayer();
  const activeHero = currentUser?.heroes?.find((h) => h.is_selected);
  const heroId = activeHero?.hero_id;
  const currentLevel = activeHero?.level || 1;

  const navigate = useNavigate();
  const location = useLocation();

  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
      logout();
      navigate("/login");
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
  const MENU_ITEMS = [
    {
      id: "item",
      label: "ITEM",
      path: "/home/item",
      icon: <InventoryIcon />,
    },
    {
      id: "character",
      label: "CHARACTER",
      path: "/home/character",
      icon: <PersonIcon />,
    },
    {
      id: "adventure",
      label: "ADVENTURE",
      path: "/home",
      icon: <ShieldIcon sx={{ fontSize: 24 }} />, // ไอคอนใหญ่ขึ้นนิดหน่อย
      isMain: true, // กำหนด flag ว่าเป็นปุ่มหลัก
    },
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
        backgroundColor: "rgba(14, 14, 18, 0.74)", // สีพื้นหลังจางๆ ของ Appbar ใหญ่
        boxShadow: "none",
        borderBottom: `1px solid ${THEME.border}`,
        // py: 1,
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
        {/* 🔹 LEFT : PROFILE SECTION */}
        <Box sx={{ display: "flex", alignItems: "center", width: "250px" }}>
          <Box
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              // cursor: "pointer",
            }}
          >
            {/* Name & Level Bar */}
            <Box
              sx={{
                pl: "45px",
                pr: 2,
                py: 0.8,
                backgroundColor: "#E8E9CD",
                borderRadius: "20px",
                border: "4px solid #5A3A2E",
                boxShadow: "0 4px 0 #2b1a12",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: "120px",
                maxWidth: "200px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 10,
                  color: "#3e2615",
                  lineHeight: 1.5,
                }}
              >
                {currentUser?.username}
              </Typography>
              <Typography
                sx={{
                  fontSize: 8,
                  color: "#4caf50",
                  fontWeight: "bold",
                  textShadow: "1px 1px 0px rgba(0,0,0,0.2)",
                  fontFamily: "'Press Start 2P'",
                }}
              >
                Lv.{currentLevel}
              </Typography>
            </Box>

            {/* Avatar */}
            <Box
              sx={{
                position: "absolute",
                left: "-10px",
                width: 48,
                height: 48,
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
                  width: 60,
                  height: 60,
                  imageRendering: "pixelated",
                  mb: 1,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* 🔹 CENTER : NAVIGATION TABS */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            gap: 1.5,
            // overflowX: "auto", // กันล้นจอเล็ก
          }}
        >
          {MENU_ITEMS.map((item) => {
            // เช็คว่า Route ปัจจุบันตรงกับปุ่มไหม
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
                  letterSpacing:2,
                  color: isActive ? THEME.bgDark : "#d7ccc8", // Active: สีเข้ม, Inactive: สีขาวจาง
                  backgroundColor: isActive
                    ? THEME.accent
                    : "rgba(43, 29, 20, 0.6)",
                  border: `2px solid ${isActive ? THEME.activeBorder : "#5a3e2b"}`,
                  borderRadius: "8px",
                  px: 2,
                  py: 1,
                  minWidth: "120px",
                  boxShadow: isActive
                    ? `0 0 10px ${THEME.accent}` // Active glow
                    : "0 4px 0 #1a120b", // Inactive shadow
                  transform: isActive ? "translateY(2px)" : "translateY(0)", // กดลงเมื่อ Active
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

        {/* 🔹 RIGHT : MONEY & SETTINGS */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            width: "250px",
            pr: 2,
          }}
        >
          {/* กล่องเงิน */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              }}
            >
              <Box
                component="img"
                src={coin}
                sx={{ position: "absolute", left: -12, width: 32 }}
              />
              <AnimatedMoney value={currentUser?.money || 0} />
            </Box>
          </Box>

          {/* ถ้าอยากใส่ปุ่ม Setting เพิ่ม ต่อท้ายตรงนี้ได้เลย */}
          <SettingsIcon onClick={handleConfirmLogout}/>

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
