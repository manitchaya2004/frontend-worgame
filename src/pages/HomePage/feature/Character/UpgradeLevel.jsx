import React, { useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Divider,
} from "@mui/material";
import { THEMES } from "../../hook/const";
import { LoadImage } from "../../hook/usePreloadFrams";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

//icon stat
import FavoriteIcon from "@mui/icons-material/Favorite"; // HP
import SpeedIcon from "@mui/icons-material/Speed"; // Speed
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"; // Common (วงกลมโปร่ง หรือจะใช้ Circle ก็ได้)
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory"; // Uncommon (สามเหลี่ยม สื่อถึงความคม/พิเศษขึ้น)
import DiamondIcon from "@mui/icons-material/Diamond";
import BackpackIcon from "@mui/icons-material/Backpack"; // Fallback Slot Icon

// Import Store & Constants
import { useAuthStore } from "../../../../store/useAuthStore";
import { LOADING, LOADED, FAILED } from "../../../../store/const";

const STAT_CONFIG = {
  HP: { icon: <FavoriteIcon fontSize="inherit" />, color: "#ff5252" },
  SPD: { icon: <SpeedIcon fontSize="inherit" />, color: "#00e5ff" },
  SLOT: { icon: <BackpackIcon fontSize="inherit" />, color: "#d1c4e9" },
  COM: {
    icon: <RadioButtonUncheckedIcon fontSize="inherit" />,
    color: "#cd7f32",
  },
  UNC: { icon: <ChangeHistoryIcon fontSize="inherit" />, color: "#b0bec5" },
  RARE: { icon: <DiamondIcon fontSize="inherit" />, color: "#ffd700" },
};

// 2. ปรับ StatLine ให้โชว์ Icon
const StatLine = ({ label, value, isImproved }) => {
  // ดึง Config ตาม Label (ถ้าไม่มีให้ใช้ Default)
  const config = STAT_CONFIG[label] || { icon: null, color: "#aaa" };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 0.8,
        alignItems: "center",
      }}
    >
      {/* ฝั่งซ้าย: Icon + Label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* กล่อง Icon */}
        <Box
          sx={{
            color: config.color,
            display: "flex",
            fontSize: "12px", // ขนาดไอคอน
            filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.3))",
          }}
        >
          {config.icon}
        </Box>

        {/* ชื่อ Stat */}
        <Typography
          sx={{ fontFamily: "'Press Start 2P'", fontSize: 9, color: "#aaa" }}
        >
          {label}
        </Typography>
      </Box>

      {/* ฝั่งขวา: ค่าตัวเลข */}
      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: 9,
          color: isImproved ? "#69f0ae" : "#fff",
          textShadow: isImproved ? "0 0 5px rgba(105, 240, 174, 0.4)" : "none",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

const UpgradeDialog = ({ open, onClose, heroId, heroName, upgradeCost }) => {
  const {
    upgradeStatus,
    previewData,
    upgradeHero,
    clearUpgradeStatus,
    currentUser,
  } = useAuthStore();

  const isLoading = upgradeStatus === LOADING;
  const isSuccess = upgradeStatus === LOADED && !previewData;
  const isPreviewReady = upgradeStatus === LOADED && previewData;
  const isError = upgradeStatus === FAILED;

  const userMoney = currentUser?.money || 0;
  const canUpgrade = userMoney >= upgradeCost;

  useEffect(() => {
    if (!open) {
      setTimeout(() => clearUpgradeStatus(), 200);
    }
  }, [open, clearUpgradeStatus]);

  const handleConfirmUpgrade = async () => {
    if (!canUpgrade) return;
     await upgradeHero(heroId);
  };

  return (
    <Dialog
      open={open}
      //   onClose={isLoading ? undefined : onClose}
      PaperProps={{
        sx: {
          backgroundColor: "#2b1d14",
          border: "4px solid #5d4037",
          borderRadius: "12px", // มุมมนแบบ Cookie Run
          width: "100%",
          maxWidth: "sm",
          height: "500px",
          boxShadow: "0 8px 0 #1a120b", // เงาหนาด้านล่าง
          overflow: "visible",
        },
      }}
    >
      {/* === HEADER (Hero Name) === */}
      <Box
        sx={{
          p: 1.5,
          textAlign: "center",
          position: "relative",
          //   backgroundColor: "#3e2723",
          borderRadius: "12px 12px 0 0",
          //   borderBottom: "2px solid #5d4037",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 16,
            color: "#ffecb3",
            textShadow: "2px 2px 0 #000",
            mt: 1,
          }}
        >
          {heroName.toUpperCase()}
        </Typography>

        {/* Close Button */}
        {!isLoading && !isSuccess && (
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#d7ccc8",
              backgroundColor: "rgba(0,0,0,0.2)",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.4)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* === BODY === */}
      <Box
        sx={{
          p: 3,
          minHeight: "260px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 1. LOADING */}
        {isLoading && (
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={40} sx={{ color: "#ffca28", mb: 2 }} />
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 10,
                color: "#ccc",
              }}
            >
              Calculating...
            </Typography>
          </Box>
        )}

        {/* 2. SUCCESS */}
        {isSuccess && (
          <Box sx={{ textAlign: "center", animation: "popIn 0.3s ease" }}>
            <CheckCircleIcon
              sx={{
                fontSize: 80,
                color: "#66bb6a",
                mb: 2,
                filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.3))",
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 16,
                color: "#fff",
                mb: 1,
              }}
            >
              LEVEL UP!
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 10,
                color: "#aaa",
              }}
            >
              Stats Increased
            </Typography>
          </Box>
        )}

        {/* 3. PREVIEW (2 Boxes Layout) */}
        {isPreviewReady && previewData && (
          <Box sx={{ width: "100%", animation: "fadeIn 0.3s ease" }}>
            {/* Image Placeholder (ตรงกลางบน) */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Box
                component="img"
                src={LoadImage("img_hero", heroId, 1)}
                sx={{
                  width: 140,
                  height: 140,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: "12px",
                  border: "2px dashed #5d4037",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#5d4037",
                  imageRendering: "pixelated",
                }}
              >
                {/* ใส่ <img /> ตรงนี้ได้เลยถ้ามีรูปส่งเข้ามา */}
              </Box>
            </Box>

            {/* --- THE 2 BOXES --- */}
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                justifyContent: "center",
                alignItems: "stretch",
              }}
            >
              {/* BOX 1: CURRENT */}
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: "#23160e",
                  borderRadius: "12px",
                  border: "2px solid #3e2723",
                  p: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: 10,
                    color: "#aaa",
                    textAlign: "center",
                    mb: 1.5,
                  }}
                >
                  Lv.{previewData.level.current}
                </Typography>
                <Divider sx={{ borderColor: "#3e2723", mb: 1.5 }} />

                <StatLine label="HP" value={previewData.hp.current} />
                <StatLine label="SPD" value={previewData.speed.current} />
                <StatLine label="SLOT" value={previewData.slot.current} />
                <StatLine label="COM" value={previewData.power_G1.current} />
                <StatLine label="UNC" value={previewData.power_G2.current} />
                <StatLine label="RARE" value={previewData.power_G3.current} />
              </Box>

              {/* Arrow Icon */}
              <Box
                sx={{ display: "flex", alignItems: "center", color: "#5d4037" }}
              >
                <ArrowRightAltIcon />
              </Box>

              {/* BOX 2: NEXT (Highlighted) */}
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: "#2e1e14", // สว่างกว่านิดนึง
                  borderRadius: "12px",
                  border: "2px solid #69f0ae", // ขอบสีเขียวเน้น Upgrade
                  boxShadow: "0 0 10px rgba(105, 240, 174, 0.1)",
                  p: 1.5,
                  position: "relative",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: 10,
                    color: "#69f0ae",
                    textAlign: "center",
                    mb: 1.5,
                  }}
                >
                  Lv.{previewData.level.next}
                </Typography>
                <Divider
                  sx={{ borderColor: "#69f0ae", opacity: 0.3, mb: 1.5 }}
                />

                <StatLine label="HP" value={previewData.hp.next} isImproved />
                <StatLine
                  label="SPD"
                  value={previewData.speed.next}
                  isImproved
                />
                <StatLine
                  label="SLOT"
                  value={previewData.slot.next}
                  isImproved
                />
                <StatLine
                  label="COM"
                  value={previewData.power_G1.next}
                  isImproved
                />
                <StatLine
                  label="UNC"
                  value={previewData.power_G2.next}
                  isImproved
                />
                <StatLine
                  label="RARE"
                  value={previewData.power_G3.next}
                  isImproved
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* === FOOTER ACTION === */}
      {isPreviewReady && (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center", pb: 3 , }}>
          <Button
            onClick={handleConfirmUpgrade}
            disabled={!canUpgrade}
            sx={{
              // 🟡 ใช้ Gradient ตามที่คุณขอ
              background: canUpgrade 
                ? "linear-gradient(180deg, #f2dfb6, #d9b97a)" 
                : "#3e2723",
                
              // 🟤 ตัวหนังสือสีน้ำตาลเข้ม (เพราะพื้นหลังสว่าง)
              color: canUpgrade ? "#2b1d14" : "#795548",
              
              fontFamily: "'Press Start 2P'",
              fontSize: 14,
              py: 1.5,
              px: 4,
              gap: 2,
              width: "100%",
              
              // 🧱 ปรับสีเงาด้านล่าง (Border Bottom) ให้เข้ากับ Gradient
              // ใช้สีน้ำตาลทองเข้มๆ (#af8f52) ตัดกับสี #d9b97a
              borderBottom: canUpgrade
                ? "6px solid #886d3a" 
                : "6px solid #271c19",
                
              borderRadius: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              
              // ✨ Hover: ปรับให้สว่างขึ้นนิดหน่อย
              "&:hover": {
                background: canUpgrade 
                  ? "linear-gradient(180deg, #ebd29b, #ba9d61)" 
                  : "#3e2723",
               
              },
              
              // 👇 Active: กดแล้วยุบ
              "&:active": {
                borderBottom: "0px solid transparent",
                transform: "translateY(6px)",
              },
            }}
          >
            <Typography sx={{ fontFamily: "inherit", fontSize: "inherit" ,color: canUpgrade ? "#2b1d14" : "#7b7677"}}>
              UPGRADE
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: "8px",
                px: 1, 
                py: 0.5
              }}
            >
              <MonetizationOnIcon
                sx={{
                  mr: 1,
                  fontSize: 16,
                  color: "#FFD700", 
                  filter: "drop-shadow(1px 1px 0px #B8860B)",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  border: "1px solid #B8860B",
                }}
              />
              <Typography sx={{ fontFamily: "inherit", fontSize: 14, lineHeight: 1 ,color: canUpgrade ? "#2b1d14" : "#ff1744"}}>
                {upgradeCost}
              </Typography>
            </Box>
          </Button>
        </Box>
      )}
    </Dialog>
  );
};

export default UpgradeDialog;
