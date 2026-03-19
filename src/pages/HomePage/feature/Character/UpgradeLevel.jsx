import React, { useEffect, useCallback, useState } from "react";
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
import {
  GiHearts,
  GiBroadsword, // 🟢 เพิ่มไอคอนดาบ
  GiLeatherBoot, // 🟢 เพิ่มไอคอนรองเท้า
} from "react-icons/gi";

// Import Store & Constants
import { useAuthStore } from "../../../../store/useAuthStore";
import { LOADING, LOADED, FAILED } from "../../../../store/const";
import { useGameSfx } from "../../../../hook/useGameSfx";
import closeSfx from "../../../../assets/sound/rollover6.ogg";
const STAT_CONFIG = {
  HP: { icon: <GiHearts fontSize="inherit" />, color: "#ff4d4d" },
  ATK: { icon: <GiBroadsword fontSize="inherit" />, color: "#e67e22" },
  SPEED: { icon: <GiLeatherBoot fontSize="inherit" />, color: "#f1c40f" },
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

let audioCtx = null;

const UpgradeDialog = ({ open, onClose, heroId, heroName, upgradeCost }) => {
  const {
    upgradeStatus,
    previewData,
    upgradeHero,
    clearUpgradeStatus,
    currentUser,
    fetchPreviewData,
    sfxVolume,
    isSfxMuted,
  } = useAuthStore();

  //sound
  const soundClose = useGameSfx(closeSfx);

  // 💡 THE FIX: เพิ่ม State ควบคุมการโชว์หน้า Success ชั่วคราว
  const [showSuccess, setShowSuccess] = useState(false);

  const isLoading = upgradeStatus === LOADING;
  const isPreviewReady = upgradeStatus === LOADED && previewData;
  const isError = upgradeStatus === FAILED;

  const userMoney = currentUser?.money || 0;
  const canUpgrade = userMoney >= upgradeCost;
  const isMaxLevel = previewData?.level?.current >= 10;

  const playUpgradeSfx = useCallback(() => {
    if (isSfxMuted || sfxVolume <= 0) return;

    try {
      const AudioContextClass =
        window.AudioContext || window["webkitAudioContext"];
      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      const targetVol = 0.15 * sfxVolume;

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(523.25, now);
      oscillator.frequency.setValueAtTime(659.25, now + 0.1);
      oscillator.frequency.setValueAtTime(783.99, now + 0.2);
      oscillator.frequency.setValueAtTime(1046.5, now + 0.3);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(targetVol, now + 0.05);
      gainNode.gain.setValueAtTime(targetVol, now + 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      oscillator.start(now);
      oscillator.stop(now + 0.8);
    } catch (error) {
      console.error("Web Audio API Error:", error);
    }
  }, [sfxVolume, isSfxMuted]);

  useEffect(() => {
    if (!open) {
      setShowSuccess(false); // รีเซ็ตหน้า Success ตอนปิด Dialog
      setTimeout(() => clearUpgradeStatus(), 200);
    }
  }, [open, clearUpgradeStatus]);

  // 💡 THE FIX: ปรับลอจิกการกดอัปเกรดให้หน่วงเวลา
  const handleConfirmUpgrade = async () => {
    if (!canUpgrade || isLoading || isMaxLevel || showSuccess) return;

    // 1. สั่ง API อัปเกรด
    await upgradeHero(heroId);

    // 2. โชว์หน้าติ๊กถูก + เล่นเสียง
    setShowSuccess(true);
    playUpgradeSfx();

    // 3. หน่วงเวลา 1.5 วินาที เพื่อให้เห็นอนิเมชัน
    setTimeout(async () => {
      setShowSuccess(false);
      // 4. ค่อยดึงข้อมูลอัปเกรดใหม่มาโชว์ (มันจะไม่วาร์ปข้ามแล้ว)
      await fetchPreviewData(heroId);
    }, 700);
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
          maxHeight: "90vh",
          height: "auto",
          boxShadow: "0 8px 0 #1a120b",
          overflow: "hidden",
          "@media (orientation: landscape) and (max-height: 450px)": {
            border: "3px solid #5d4037",
            width: "80%",
            height: "80vh",
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
          flexShrink: 0,
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

        {/* ซ่อนปุ่มปิดตอนกำลังโหลดหรือกำลังโชว์ Success */}
        {!isLoading && !showSuccess && (
          <IconButton
            onClick={() => {
              onClose();
              soundClose();
            }}
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

      {/* === BODY === */}
      <Box
        sx={{
          p: 2,
          flexGrow: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          "@media (orientation: landscape) and (max-height: 430px)": {
            py: 1,
          },
        }}
      >
        {/* 💡 THE FIX: แสดงสถานะ Loading เฉพาะตอนที่ไม่ได้โชว์ Success*/}
        {isLoading && !showSuccess && (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              height: { xs: "auto", sm: "340px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 0,
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

        {/* 💡 THE FIX: แสดงหน้า Success ค้างไว้ */}
        {showSuccess && (
          <Box
            sx={{
              textAlign: "center",
              animation: "popIn 0.5s ease",
              py: 4,
              height: { xs: "auto", sm: "340px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "center",
              gap: 5,
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: { xs: 70, sm: 100 },
                color: "#66bb6a",
                mb: 2,
                filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.3))",
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: { xs: 10, sm: 14 },
                color: "#fff",
                mb: 1,
              }}
            >
              LEVEL UP!
            </Typography>
          </Box>
        )}

        {/* 💡 THE FIX: แสดงข้อมูล Preview เฉพาะตอนที่ไม่ได้โหลดและไม่ได้โชว์ Success */}
        {isPreviewReady && !showSuccess && !isLoading && (
          <Box sx={{ width: "100%", animation: "fadeIn 0.3s ease" }}>
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

            {isMaxLevel ? (
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
                  <StatLine label="ATK" value={previewData.power.current} />
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
                  <StatLine label="ATK" value={previewData.power.current} />
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
                    label="ATK"
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
      {isPreviewReady && !isMaxLevel && !showSuccess && !isLoading && (
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            pb: 3,
            flexShrink: 0,
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

      {/* ปุ่มโชว์ตอนตันแล้ว */}
      {isPreviewReady && isMaxLevel && !showSuccess && (
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
            <Typography
              sx={{
                fontFamily: "inherit",
                fontSize: "inherit",
                color: "#6d4c41",
              }}
            >
              MAX LEVEL REACHED
            </Typography>
          </Button>
        </Box>
      )}
    </Dialog>
  );
};

export default UpgradeDialog;
