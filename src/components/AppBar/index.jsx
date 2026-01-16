import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Popover,
  IconButton,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, animate } from "framer-motion"; // 👈 เพิ่ม animate เข้ามา
import SettingsIcon from "@mui/icons-material/Settings";
import sword from "../../assets/icons/sword.svg";
import store from "../../assets/icons/store.svg";
import monster from "../../assets/icons/monster.svg";
import quest from "../../assets/icons/quest.svg";
import SettingsFeature from "../../pages/HomePage/feature/SettingFeature";
import taro from "../../assets/icons/taro.jpg";
import coin from "../../assets/icons/coin.svg";
import { useLoginPlayer } from "../../pages/AuthPage/LoginPage/hook/useLoginPlayer";
import { LoadImage } from "../../pages/HomePage/hook/usePreloadFrams";
import bag from "../../assets/icons/bag.png";
const name = "img_hero";

// --- ส่วน AnimatedMoney สำหรับจัดการตัวเลขวิ่งและสี ---
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
  const { currentUser } = useLoginPlayer();
  const navigate = useNavigate();

  const activeHero = currentUser?.heroes?.find((h) => h.is_selected);
  const heroId = activeHero?.hero_id;
  const currentLevel = activeHero?.level || 1;

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "transparent", boxShadow: "none" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* 🔹 LEFT: Profile Group (Clickable -> Go to Bag) */}
        <Box sx={{ flex: 1, ml: 2 }}>
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

        {/* 🔹 RIGHT: Money */}
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
      </Toolbar>
    </AppBar>
  );
};

export default GameAppBar;
