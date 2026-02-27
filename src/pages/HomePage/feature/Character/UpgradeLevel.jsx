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
import FlashOnIcon from "@mui/icons-material/FlashOn"; // Power

// Import Store & Constants
import { useAuthStore } from "../../../../store/useAuthStore";
import { LOADING, LOADED, FAILED } from "../../../../store/const";

const STAT_CONFIG = {
  HP: { icon: <FavoriteIcon fontSize="inherit" />, color: "#ff5252" },
  POWER: { icon: <FlashOnIcon fontSize="inherit" />, color: "#ffeb3b" },
  SPEED: { icon: <SpeedIcon fontSize="inherit" />, color: "#00e5ff" },
};

const StatLine = ({ label, value, isImproved }) => {
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            color: config.color,
            display: "flex",
            fontSize: "12px",
            filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.3))",
            "@media (orientation: landscape) and (max-height: 430px)": {
              fontSize: 10,
            },
          }}
        >
          {config.icon}
        </Box>

        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 9,
            color: "#aaa",
            "@media (orientation: landscape) and (max-height: 430px)": {
              fontSize: 8,
            },
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: 9,
          color: isImproved ? "#69f0ae" : "#fff",
          textShadow: isImproved ? "0 0 5px rgba(105, 240, 174, 0.4)" : "none",
          "@media (orientation: landscape) and (max-height: 430px)": {
            fontSize: 7,
          },
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
    fetchPreviewData,
  } = useAuthStore();

  const isLoading = upgradeStatus === LOADING;
  const isSuccess = upgradeStatus === LOADED && !previewData;
  const isPreviewReady = upgradeStatus === LOADED && previewData;
  const isError = upgradeStatus === FAILED;

  const userMoney = currentUser?.money || 0;
  const canUpgrade = userMoney >= upgradeCost;

  // เช็คเงื่อนไข Max Level
  const isMaxLevel = previewData?.level?.current >= 10;

  useEffect(() => {
    if (!open) {
      setTimeout(() => clearUpgradeStatus(), 200);
    }
  }, [open, clearUpgradeStatus]);

  const handleConfirmUpgrade = async () => {
    if (!canUpgrade || isLoading || isMaxLevel) return;

    await upgradeHero(heroId);
    await fetchPreviewData(heroId);
  };

  useEffect(() => {
    if (open && heroId) {
      fetchPreviewData(heroId);
    }
  }, [open, heroId, fetchPreviewData]);

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: "#2b1d14",
          border: "4px solid #5d4037",
          borderRadius: "12px",
          width: "95%",
          maxHeight: "90vh", // ป้องกันทะลุขอบบนล่าง
          height: "auto", // ให้ความสูงยืดตาม Content
          boxShadow: "0 8px 0 #1a120b",
          overflow: "hidden", // ให้ตัว Scroll ไปอยู่ที่ Body แทน
          "@media (orientation: landscape) and (max-height: 430px)": {
            border: "3px solid #5d4037",
          },
        },
      }}
    >
      {/* === HEADER === */}
      <Box
        sx={{
          p: 1.5,
          textAlign: "center",
          position: "relative",
          flexShrink: 0, // หัวห้ามหด
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 16,
            color: "#ffecb3",
            textShadow: "2px 2px 0 #000",
            mt: 1,
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 12,
              mt: 0.5,
            },
          }}
        >
          {heroName.toUpperCase()}
        </Typography>

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
              "@media (orientation: landscape) and (max-height: 450px)": {
                top: 4,
                right: 4,
                padding: "4px",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* === BODY (ใส่ Scroll ได้ถ้าจอเตี้ยเกินไป) === */}
      <Box
        sx={{
          p: 2,
          flexGrow: 1,
          overflowY: "auto", // กรณีจอแนวนอนเตี้ยมากๆ จะเลื่อนดูได้
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          scrollbarWidth: "none", // ซ่อน scrollbar (Firefox)
          "&::-webkit-scrollbar": { display: "none" }, // ซ่อน scrollbar (Chrome/Safari)
          "@media (orientation: landscape) and (max-height: 430px)": {
            py: 1,
          },
        }}
      >
        {isLoading && (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              height: { xs: "auto", sm: "250px" },
            }}
          >
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

        {isSuccess && !isLoading && !isMaxLevel && (
          <Box
            sx={{ textAlign: "center", animation: "popIn 0.3s ease", py: 2 }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 60,
                color: "#66bb6a",
                mb: 2,
                filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.3))",
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 14,
                color: "#fff",
                mb: 1,
              }}
            >
              LEVEL UP!
            </Typography>
          </Box>
        )}

        {isPreviewReady && (
          <Box sx={{ width: "100%", animation: "fadeIn 0.3s ease" }}>
            {/* Image Placeholder */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 2,
                "@media (orientation: landscape) and (max-height: 450px)": {
                  mb: 1,
                },
              }}
            >
              <Box
                component="img"
                src={LoadImage("img_hero", heroId, 1)}
                sx={{
                  width: 120,
                  height: 120,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: "12px",
                  border: "2px dashed #5d4037",
                  imageRendering: "pixelated",
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    width: 70,
                    height: 70,
                  },
                }}
              />
            </Box>

            {/* --- THE 2 BOXES --- */}
            {isMaxLevel ? (
              /* โชว์แค่กล่องเดียวตรงกลางเมื่อถึง Max Level */
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Box
                  sx={{
                    width: "65%",
                    backgroundColor: "#2e1e14",
                    borderRadius: "12px",
                    border: "2px solid #ffd700",
                    boxShadow: "0 0 10px rgba(255, 215, 0, 0.2)",
                    p: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: 10,
                      color: "#ffd700",
                      textAlign: "center",
                      mb: 1.5,
                      textShadow: "1px 1px 0 #000",
                    }}
                  >
                    MAX LEVEL (Lv.{previewData.level.current})
                  </Typography>
                  <Divider
                    sx={{ borderColor: "#ffd700", opacity: 0.3, mb: 1.5 }}
                  />

                  <StatLine label="HP" value={previewData.hp.current} />
                  <StatLine label="POWER" value={previewData.power.current} />
                   <StatLine label="SPEED" value={previewData.speed.current} />
                </Box>
              </Box>
            ) : (
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
                    "@media (orientation: landscape) and (max-height: 450px)": {
                      p: 1,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: 10,
                      color: "#aaa",
                      textAlign: "center",
                      mb: 1,
                      "@media (orientation: landscape) and (max-height: 450px)":
                        {
                          fontSize: 8,
                        },
                    }}
                  >
                    Lv.{previewData.level.current}
                  </Typography>
                  <Divider sx={{ borderColor: "#3e2723", mb: 1 }} />
                  <StatLine label="HP" value={previewData.hp.current} />
                  <StatLine label="POWER" value={previewData.power.current} />
                  <StatLine label="SPEED" value={previewData.speed.current} />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "#5d4037",
                  }}
                >
                  <ArrowRightAltIcon />
                </Box>

                {/* BOX 2: NEXT */}
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor: "#2e1e14",
                    borderRadius: "12px",
                    border: "2px solid #69f0ae",
                    boxShadow: "0 0 10px rgba(105, 240, 174, 0.1)",
                    p: 1.5,
                    "@media (orientation: landscape) and (max-height: 450px)": {
                      p: 1,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: 10,
                      color: "#69f0ae",
                      textAlign: "center",
                      mb: 1,
                      "@media (orientation: landscape) and (max-height: 450px)":
                        {
                          fontSize: 8,
                        },
                    }}
                  >
                    Lv.{previewData.level.next}
                  </Typography>
                  <Divider
                    sx={{ borderColor: "#69f0ae", opacity: 0.3, mb: 1 }}
                  />
                  <StatLine label="HP" value={previewData.hp.next} isImproved />
                  <StatLine
                    label="POWER"
                    value={previewData.power.next}
                    isImproved
                  />
                  <StatLine
                    label="SPEED"
                    value={previewData.speed.next}
                    isImproved
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* === FOOTER ACTION === */}
      {isPreviewReady && !isMaxLevel && (
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            pb: 3,
            flexShrink: 0, // ท้ายห้ามหด
            "@media (orientation: landscape) and (max-height: 450px)": {
              p: 1,
              pb: 1.5,
            },
          }}
        >
          <Button
            onClick={handleConfirmUpgrade}
            disabled={!canUpgrade}
            sx={{
              background: canUpgrade
                ? "linear-gradient(180deg, #f2dfb6, #d9b97a)"
                : "#3e2723",
              color: canUpgrade ? "#2b1d14" : "#795548",
              fontFamily: "'Press Start 2P'",
              fontSize: 14,
              py: 1.2,
              px: 4,
              width: "100%",
              borderBottom: canUpgrade
                ? "6px solid #886d3a"
                : "6px solid #271c19",
              borderRadius: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              "@media (orientation: landscape) and (max-height: 450px)": {
                py: 0.8,
                fontSize: 11,
                borderBottomWidth: "4px",
              },
              "&:hover": {
                background: canUpgrade
                  ? "linear-gradient(180deg, #ebd29b, #ba9d61)"
                  : "#3e2723",
              },
              "&:active": {
                borderBottomWidth: "0px",
                transform: "translateY(4px)",
              },
            }}
          >
            <Typography sx={{ fontFamily: "inherit", fontSize: "inherit" }}>
              UPGRADE
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <MonetizationOnIcon
                sx={{
                  mr: 1,
                  fontSize: 16,
                  color: "#FFD700",
                  filter: "drop-shadow(1px 1px 0px #B8860B)",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  border: "1px solid #B8860B",
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: 14,
                  },
                }}
              />
              <Typography
                sx={{
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  color: canUpgrade ? "#2b1d14" : "#ff1744",
                }}
              >
                {upgradeCost}
              </Typography>
            </Box>
          </Button>
        </Box>
      )}

      {/* ปุ่มโชว์ตอนตันแล้ว (Disable) */}
      {isPreviewReady && isMaxLevel && (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center", pb: 3 }}>
           <Button
            disabled
            sx={{
              backgroundColor: "#1a120b",
              color: "#5d4037",
              fontFamily: "'Press Start 2P'",
              fontSize: 14,
              py: 1.5,
              px: 4,
              width: "100%",
              border: "2px solid #3e2723",
              borderRadius: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontFamily: "inherit", fontSize: "inherit", color: "#6d4c41" }}>
              MAX LEVEL REACHED
            </Typography>
          </Button>
        </Box>
      )}

    </Dialog>
  );
};

export default UpgradeDialog;
