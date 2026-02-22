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
import ShieldIcon from "@mui/icons-material/Shield";
import PersonIcon from "@mui/icons-material/Person";
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

// Assets
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
              : "#3e2615",
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

const GameAppBar = () => {
  const { currentUser, logout } = useLoginPlayer();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

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

  const MAIN_NAV_ITEMS = [
    { id: "item", label: "ITEM", path: "/home/item", icon: <InventoryIcon /> },
    {
      id: "adventure",
      label: "ADVENTURE",
      path: "/home",
      icon: <ShieldIcon />,
      isMain: true,
    },
    {
      id: "character",
      label: "CHARACTER",
      path: "/home/character",
      icon: <PersonIcon />,
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
            px: { xs: 1, sm: 2 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 0.5, sm: 2 },
          }}
        >
          {/* 🔹 LEFT : PROFILE & MONEY */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minWidth: { xs: "auto", sm: "180px", md: "240px" },
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
                  pl: { xs: "45px", sm: "55px" },
                  pr: { xs: 1.5, sm: 2.5 },
                  py: 0.5,
                  backgroundColor: "#E8E9CD",
                  borderRadius: "15px",
                  border: "3px solid #5A3A2E",
                  boxShadow: "0 3px 0 #2b1a12",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: { xs: "90px", sm: "120px", md: "140px" },
                  width: "fit-content",
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: { xs: 6, sm: 8, md: 9 },
                    color: "#3e2615",
                    mb: 0.2,
                  }}
                >
                  {currentUser?.username}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
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
                    fontSize={isMobile ? 7 : 9}
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
          </Box>

          {/* 🔹 CENTER : NAVIGATION (Adventure ใหญ่สุดบนจอใหญ่) */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1.5 },
            }}
          >
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive =
                item.path === "/home"
                  ? location.pathname === "/home"
                  : location.pathname.includes(item.path);

              // Logic ขนาดปุ่ม: ถ้าเป็น Adventure และไม่ใช่ Mobile ให้ขยายใหญ่
              const isMainAndNotMobile = item.isMain && !isMobile;

              return (
                <Button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  sx={{
                    // ปรับความกว้าง: Adventure (160px) vs อื่นๆ (120px)
                    minWidth: isMobile
                      ? "40px"
                      : item.isMain
                        ? "160px"
                        : "120px",
                    height: isMobile ? "40px" : item.isMain ? "52px" : "45px",
                    flexDirection: { xs: "column", sm: "row" },
                    fontFamily: "'Press Start 2P'",
                    // ปรับ Font: Adventure (12px) vs อื่นๆ (8px)
                    fontSize: isMobile ? 0 : item.isMain ? 12 : 8,
                    color: isActive ? THEME.bgDark : "#d7ccc8",
                    backgroundColor: isActive
                      ? THEME.accent
                      : "rgba(43, 29, 20, 0.6)",
                    border: `2px solid ${isActive ? THEME.activeBorder : "#5a3e2b"}`,
                    borderRadius: "8px",
                    boxShadow: isActive
                      ? `0 0 12px ${THEME.accent}`
                      : "0 3px 0 #1a120b",
                    p: { xs: 0, sm: 1.5 },
                    transition: "all 0.1s",
                    "& .MuiButton-startIcon": {
                      margin: isMobile ? 0 : "0 8px 0 0",
                      "& > *:nth-of-type(1)": {
                        // Icon Adventure จะใหญ่กว่านิดหน่อยบน Desktop
                        fontSize: isMobile ? 20 : item.isMain ? 26 : 22,
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
                  {!isMobile && item.label}
                </Button>
              );
            })}
          </Box>

          {/* 🔹 RIGHT : LIBRARY & SETTINGS */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              minWidth: { xs: "auto", sm: "120px", md: "200px" },
              gap: { xs: 0.2, sm: 1 },
            }}
          >
            {!isMobile && (
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
      />
    </>
  );
};

export default GameAppBar;
