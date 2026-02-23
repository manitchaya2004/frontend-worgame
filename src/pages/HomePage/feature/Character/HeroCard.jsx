import { useAuthStore } from "../../../../store/useAuthStore";
import React, { useState } from "react";
import { Box, Typography, Tooltip, Divider, IconButton } from "@mui/material";
import { usePreloadFrames, LoadImage } from "../../hook/usePreloadFrams";
import { useIdleFrame } from "../../hook/useIdleFrame";
import { GameDialog } from "../../../../components/GameDialog";
import UpgradeDialog from "./UpgradeLevel";

import { StatVisualBar, StatLine } from "../../components/StatDisplay";
import LevelBar from "../../components/LevelBar";
import correct from "../../../../assets/icons/correct.png";

// Icons
import FavoriteIcon from "@mui/icons-material/Favorite"; // HP
import FlashOnIcon from "@mui/icons-material/FlashOn"; // Power
import SpeedIcon from "@mui/icons-material/Speed"; // Speed
import BackpackIcon from "@mui/icons-material/Backpack"; // Fallback Slot Icon
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Icons สำหรับปุ่ม Switch
import ViewListIcon from "@mui/icons-material/ViewList"; // ดูแบบหลอด (List)
import ViewModuleIcon from "@mui/icons-material/ViewModule"; // ดูแบบกล่อง (Grid)

// --- ShopHeroCard (ปรับปรุง: รับ Point และรวม Stat) ---
const HeroCard = ({ hero, playerHeroes, money }) => {
  const { selectHero, buyHero, fetchPreviewData, previewData } = useAuthStore();

  // dialog buyhero
  const [openBuy, setOpenBuy] = useState(false);
  const [openUpgrade, setOpenUpgrade] = useState(false);

  //  swip stat ว่าจะดูแบบ หลอดหรือกล่อง
  const [showDetail, setShowDetail] = useState(false);

  const frames = usePreloadFrames("img_hero", hero.id, 2);
  const frame = useIdleFrame(frames.length, 450);

  const imgSrc =
    frames.length > 0
      ? frames[frame - 1]?.src
      : LoadImage("img_hero", hero.id, 1);

  // ตรวจสอบสถานะการเป็นเจ้าของ
  const playerHero = playerHeroes?.find((h) => h.hero_id === hero.id);
  const isOwned = !!playerHero;
  const isSelected = playerHero?.is_selected === true;
  const canBuy = !isOwned && money > hero.price;
  const upgradeCost = playerHero?.next_upgrade || 0;

  // === ดึงข้อมูลมาแสดง (ถ้ามี playerHero ใช้ของ playerHero ถ้าไม่มีใช้ base ของ hero) ===
  const currentLevel = playerHero?.level || 1;
  const currentExp = isOwned ? playerHero?.current_exp || 0 : 0;
  const nextExp = playerHero?.next_exp || 100;

  // Map ข้อมูล 5 ตัวตามที่ขอ
  const base_stats = {
    hp: isOwned ? playerHero?.stats?.levels?.hp_lv : hero.hp_lv,
    power: isOwned ? playerHero?.stats?.levels?.power_lv : hero.power_lv,
    speed: isOwned ? playerHero?.stats?.levels?.speed_lv : hero.speed_lv,
    // slot: isOwned ? playerHero?.stats?.levels?.slot_lv : hero.slot_lv,
  };

  const game_stats = isOwned
    ? {
        hp: playerHero?.stats?.hp || 0,
        speed: playerHero?.stats?.speed || 0,
        power: playerHero?.stats?.power || 0,
      }
    : {};

  // เดี๋ยวมาปรับ
  const MAX_STATS_REF = {
    hp: 20,
    power: 20,
    speed: 20,
    slot: 20,
  };

  const handleConfirmBuy = async () => {
    await buyHero(hero.id);
    setOpenBuy(false);
  };

  const handleCancelBuy = () => {
    setOpenBuy(false);
  };

  const handleOpenUpgrade = () => {
    // ถ้าเวลตันแล้วไม่ให้กดเปิด (ป้องกันกรณีเผื่อกดได้)
    if (currentLevel >= 10) return;
    setOpenUpgrade(true);
    fetchPreviewData(hero.id); // ยิง API ขอ Preview ทันที
  };

  return (
    <>
      <Box
        sx={{
          // ⭐ THE FIX: ทำให้กว้าง/สูง ยืดหยุ่นตามหน้าจอ
          width: { xs: 250, sm: 320, md: 360 },
          height: "100%",
          background: isOwned
            ? "#eaddcf"
            : "linear-gradient(180deg, #f2dfb6, #d9b97a)",
          border: "3px solid #6b3f1f",
          borderRadius: 3,

          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // ตัดส่วนเกินทิ้ง ป้องกันการหลุดกรอบ
          transform: "translateZ(0)",
          willChange: "transform",

          // ⭐ บีบอัดขนาดสำหรับ Mobile Landscape
          
          "@media (orientation: landscape) and (max-height: 450px)": {
            width: 200,

            borderRadius: 2,
          },
        }}
      >
        {/* === SECTION 1: HEADER (Static Flow) === */}
        <Box
          sx={{
            height: { xs: "40px", md: "48px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.2,
            background: "#5d4037",
            borderBottom: "2px solid #3e2723",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            zIndex: 100,
            mx: 0, // ชิดขอบซ้ายขวา
            "@media (orientation: landscape) and (max-height: 450px)": {
              height: "20px",
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: `"Press Start 2P", monospace`,
              fontSize: { xs: "12px", md: "14px" },
              color: "#ffecb3",
              textShadow: "2px 2px 0 #000",
              textTransform: "uppercase",
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: "7px",
              },
            }}
          >
            {hero.name}
          </Typography>
        </Box>

        {/* === SECTION 2: IMAGE (Static Flow) === */}
        <Box
          sx={{
            height: { xs: "120px", md: "180px" }, // กำหนดพื้นที่ให้รูป
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
            mb: 1,
            "@media (orientation: landscape) and (max-height: 450px)": {
              height: "80px",
            },
          }}
        >
          {/* ⭐ เปลี่ยนจาก <img> ธรรมดาเป็น Box component="img" เพื่อให้คุม sx ได้ */}
          <Box
            component="img"
            key={hero.id}
            src={imgSrc}
            alt={hero.name}
            sx={{
              width: { xs: "110px", md: "150px" },
              height: { xs: "110px", md: "140px" },
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.4))",
              "@media (orientation: landscape) and (max-height: 450px)": {
                width: "80px",
                height: "80px",
              },
            }}
            onError={(e) => {
              e.currentTarget.src = "/fallback/unknown-hero.png";
            }}
          />
        </Box>

        {/* === SECTION 3: CONTENT BOX (Flex Grow) === */}
        <Box
          sx={{
            flex: 1,
            background: "#3a2416", // พื้นหลังน้ำตาลเข้มเฉพาะส่วนนี้
            borderRadius: "16px", // มนทั้ง 4 มุม หรือจะมนแค่บนก็ได้
            border: isOwned ? "none" : "2px solid #2a160f",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",

            mx: { xs: 1, md: 1.5 }, // ระยะห่างซ้ายขวา
            p: { xs: 1, md: 1.5 }, // Padding ภายใน
            display: "flex",
            flexDirection: "column",
            marginTop: { xs: "-20px", md: "-38px" }, // ดึงขึ้นไปเกยรูปนิดหน่อย
            zIndex: 10, // อยู่ต่ำกว่ารูป (รูป z-index 5)

            "@media (orientation: landscape) and (max-height: 450px)": {
              marginTop: "-20px",
              p: 0.8,
              borderRadius: "10px",
            },
          }}
        >
          <LevelBar
            level={currentLevel}
            currentExp={currentExp}
            nextExp={nextExp}
            isOwned={isOwned}
            canUpgrade={isOwned} // ตรงนี้เดี๋ยวไปเช็คด้านใน LevelBar
            onUpgrade={handleOpenUpgrade}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              backgroundColor: "rgba(0,0,0,0.2)",
              border: "1px solid #5a3e2b",
              borderRadius: "4px",
              padding: "4px 8px",
              minHeight: "28px",
              "@media (orientation: landscape) and (max-height: 450px)": {
                minHeight: "10px",
                padding: "2px 4px",
              },
            }}
          >
            <InfoOutlinedIcon
              sx={{ fontSize: { xs: 12, md: 14 }, color: "#8d6e63" }}
            />
            <Typography
              sx={{
                fontFamily: "'Verdana', sans-serif",
                fontSize: { xs: 9, md: 11 },
                color: "#d7ccc8",
                lineHeight: 1.2,
                textAlign: "center",
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 7,
                },
              }}
            >
              {hero.ability_description || "No ability description"}
            </Typography>
          </Box>

          {/* ส่วน Divider และ ปุ่ม Toggle */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: { xs: 0.5, md: 1 },
              mb: 0.5,
              minHeight: { xs: "24px", md: "30px" },
              "@media (orientation: landscape) and (max-height: 450px)": {
                minHeight: "18px",
                mt: 0.1,
              },
            }}
          >
            {/* เส้นประ (จะยืดเต็มถ้าไม่มีปุ่ม หรือหดเองถ้ามีปุ่ม) */}
            <Divider
              sx={{ borderColor: "#444", borderStyle: "dashed", flex: 1 }}
            />

            {/* แสดงปุ่มเฉพาะตอนเป็นเจ้าของ (isOwned) */}
            {isOwned && (
              <Tooltip
                title={showDetail ? "Switch to Bars" : "Switch to Details"}
              >
                <IconButton
                  onClick={() => setShowDetail(!showDetail)}
                  size="small"
                  sx={{
                    color: "#8d6e63",
                    ml: 1,
                    border: "1px solid #5a3e2b",
                    borderRadius: "4px",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    // เพิ่มความสูง/กว้างที่แน่นอนให้ปุ่ม
                    width: { xs: "22px", md: "25px" },
                    height: { xs: "22px", md: "25px" },
                    "& .MuiSvgIcon-root": {
                      fontSize: { xs: "14px", md: "18px" },
                    },
                    "@media (orientation: landscape) and (max-height: 450px)": {
                      width: "18px",
                      height: "18px",
                      "& .MuiSvgIcon-root": { fontSize: "12px" },
                    },
                  }}
                >
                  {showDetail ? <ViewListIcon /> : <ViewModuleIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {showDetail ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.7,
                  // mobile landscape อาจจะดูแน่นๆ หน่อย แต่ยังพอไหว
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    gap: 0,
                  },
                }}
              >
                <StatLine
                  label="HP"
                  value={game_stats.hp}
                  icon={<FavoriteIcon />}
                  color="#ff5252"
                  description="Max Health. 0 = Game Over."
                />
                <StatLine
                  label="POWER"
                  value={game_stats.power}
                  icon={<BackpackIcon />}
                  color="#d1c4e9"
                  description="Bag Size. Max letters you can hold in hand."
                />
                <StatLine
                  label="SPEED"
                  value={game_stats.speed}
                  icon={<SpeedIcon />}
                  color="#00e5ff"
                  description="Turn Speed. Faster acts first."
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 0.5, md: 1 },
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    gap: 0.25,
                  },
                }}
              >
                <StatVisualBar
                  label="HP"
                  value={base_stats.hp}
                  max={MAX_STATS_REF.hp}
                  icon={<FavoriteIcon />}
                  color="#ff5252"
                />
                <StatVisualBar
                  label="POWER"
                  value={base_stats.power}
                  max={MAX_STATS_REF.power}
                  icon={<FlashOnIcon />}
                  color="#ffca28"
                />
                <StatVisualBar
                  label="SPEED"
                  value={base_stats.speed}
                  max={MAX_STATS_REF.speed}
                  icon={<SpeedIcon />}
                  color="#00e5ff"
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* === 4. BUTTON (แยกออกมาอยู่ข้างนอก Stats Box แล้ว) === */}
        {/* ตรงนี้ Background จะเป็นของ Card หลัก ไม่ใช่สีน้ำตาลเข้ม */}
        <Box
          sx={{
            mx: { xs: 1, md: 1.5 }, // ให้กว้างเท่ากับ Box ข้างบน
            mb: { xs: 1, md: 1.5 }, // ระยะห่างจากขอบล่าง
            mt: { xs: 0.5, md: 1 }, // ระยะห่างจาก Stats Box
            py: { xs: 0.5, md: 1 },
            textAlign: "center",

            // สีปุ่ม (Background) ของตัวเอง
            background: isSelected
              ? "linear-gradient(180deg, #aed2af, #427d45)"
              : isOwned
                ? "linear-gradient(180deg, #81c784, #388e3c)"
                : !canBuy
                  ? "linear-gradient(180deg, #757575, #424242)"
                  : "linear-gradient(180deg, #c49a3a, #8b5a1e)",

            cursor:
              isSelected || (!isOwned && !canBuy) ? "not-allowed" : "pointer",
            opacity: isSelected || (!isOwned && !canBuy) ? 0.7 : 1,
            border: "3px solid #5a3312",
            borderRadius: 2,
            color: "#2a160a",
            boxShadow: "0 4px 0 #3a1f0b",
            zIndex: 20,

            "@media (orientation: landscape) and (max-height: 450px)": {
              py: 0.45,
              mb: 0.9,
            },
          }}
          onClick={() => {
            if (isSelected) return;
            if (isOwned) {
              selectHero(hero.id);
              return;
            }
            if (canBuy) setOpenBuy(true);
          }}
        >
          {isSelected ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={correct}
                sx={{
                  position: "absolute",
                  left: { xs: 45, sm: 60, md: 80 },
                  bottom: 0,
                  width: { xs: "32px", md: "42px" },
                  height: { xs: "32px", md: "42px" },
                  zIndex: 30,
                  transform: "rotate(5deg)",
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    width: "24px",
                    height: "24px",
                    left: 35,
                    bottom: 0,
                  },
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: { xs: 10, md: 12 },
                  ml: 3,
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: 7,
                    ml: 2,
                  },
                }}
              >
                SELECTED
              </Typography>
            </Box>
          ) : (
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: { xs: 10, md: 12 },
                color: !isOwned && !canBuy ? "#ff1744" : "#2a160a",
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 7,
                },
              }}
            >
              {isOwned ? "SELECT" : `💰 ${hero.price}`}
            </Typography>
          )}
        </Box>
      </Box>

      <GameDialog
        open={openBuy}
        title={`BUY HERO`}
        description={`${hero.name}\nCost: ${hero.price} 💰`}
        confirmText="BUY"
        cancelText="NO"
        onConfirm={handleConfirmBuy}
        onCancel={handleCancelBuy}
      />

      <UpgradeDialog
        open={openUpgrade}
        onClose={() => setOpenUpgrade(false)}
        heroId={hero.id}
        heroName={hero.name}
        upgradeCost={upgradeCost}
      />
    </>
  );
};

export default React.memo(HeroCard);
