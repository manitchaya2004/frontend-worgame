import { useAuthStore } from "../../../../store/useAuthStore";
import React, { useState, useEffect } from "react";
import { Box, Typography, Tooltip, Divider, CircularProgress } from "@mui/material";
import { usePreloadFrames, LoadImage } from "../../hook/usePreloadFrams";
import { useIdleFrame } from "../../hook/useIdleFrame";
import { GameDialog } from "../../../../components/GameDialog";
import UpgradeDialog from "./UpgradeLevel";
import { LOADING } from "../../../../store/const";

import { StatVisualBar, StatLine } from "../../components/StatDisplay";
import LevelBar from "../../components/LevelBar";
import correct from "../../../../assets/icons/correct.png";
import { getDeckIconData } from "../../hook/const";
// Icons
import {
  GiHearts,
  GiBroadsword, // 🟢 เพิ่มไอคอนดาบ
  GiLeatherBoot, // 🟢 เพิ่มไอคอนรองเท้า
} from "react-icons/gi";

// Icons สำหรับปุ่ม Switch
import ViewListIcon from "@mui/icons-material/ViewList"; // ดูแบบหลอด (List)
import ViewModuleIcon from "@mui/icons-material/ViewModule"; // ดูแบบกล่อง (Grid)

// --- ShopHeroCard (ปรับปรุง: รับ Point และรวม Stat) ---
const HeroCard = ({
  hero,
  playerHeroes,
  money,
  playClickSound,
  playAgreeSound,
}) => {
  const { selectHero, buyHero, fetchPreviewData, buyHeroState, selectHeroState } =
    useAuthStore();

  // dialog buyhero
  const [openBuy, setOpenBuy] = useState(false);
  const [openUpgrade, setOpenUpgrade] = useState(false);

  //  swip stat ว่าจะดูแบบ หลอดหรือกล่อง
  const [showDetail, setShowDetail] = useState(false);
  
  // Local State เอาไว้เช็คว่า "ปุ่มของการ์ดใบนี้" ถูกคลิกใช่หรือไม่
  const [isLocalSelecting, setIsLocalSelecting] = useState(false);
  
  // Local State สำหรับตอนซื้อ
  const [isLocalBuying, setIsLocalBuying] = useState(false);

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

  // เคลียร์สถานะการคลิกปุ่มของการ์ดใบนี้เมื่อ Global โหลดเสร็จแล้ว
  useEffect(() => {
    if (selectHeroState !== LOADING) {
      setIsLocalSelecting(false);
    }
  }, [selectHeroState]);

  // status 
  const isGlobalSelecting = selectHeroState === LOADING;
  const isSelecting = isGlobalSelecting && isLocalSelecting;
  
  // เช็คว่าตัวนี้คือตัวที่ "กำลังจะเสียตำแหน่ง Selected" ให้ตัวอื่นที่กำลังโหลดอยู่หรือไม่
  const isLosingSelection = isSelected && isGlobalSelecting && !isLocalSelecting;

  // 🟢 เช็คสถานะตอนซื้อ
  const isGlobalBuying = buyHeroState === LOADING;
  // 🟢 ให้เชื่อ isLocalBuying ไปเลย พอกดปุ๊บจะได้ขึ้น LOADING ทันทีแบบไม่ต้องรอ Store
  const isBuying = isLocalBuying; 

  // อัปเดตเงื่อนไข isDisabled ไม่ให้กดได้ถ้ามีการซื้อ/เลือกเกิดขึ้นอยู่
  const isDisabled = isSelected || (!isOwned && !canBuy) || isGlobalBuying || isGlobalSelecting;

  // === ดึงข้อมูลมาแสดง (ถ้ามี playerHero ใช้ของ playerHero ถ้าไม่มีใช้ base ของ hero) ===
  const currentLevel = playerHero?.level || 1;
  const currentExp = isOwned ? playerHero?.current_exp || 0 : 0;
  const nextExp = playerHero?.next_exp || 100;

  // 💡 THE FIX: ป้องกัน undefined โดยการบังคับให้เป็น Array ว่าง [] เสมอถ้าไม่มีข้อมูล
  const rawDeck = (isOwned ? playerHero?.deck_list : hero?.hero_deck) || [];

  const game_stats = isOwned
    ? {
        hp: playerHero?.stats?.hp || 0,
        speed: playerHero?.stats?.speed || 0,
        power: playerHero?.stats?.power || 0,
      }
    : {
        hp: hero.hp || 0,
        speed: hero.speed || 0,
        power: hero.power || 0,
      };

  const handleConfirmBuy = async () => {
    setOpenBuy(false); // ปิด Dialog ทันทีให้ผู้เล่นรู้สึกตอบสนองไว
    setIsLocalBuying(true); // 🟢 บังคับเปิดสถานะ Loading ที่ปุ่มทันที
    
    try {
      await buyHero(hero.id); // รอ API จนกว่าจะเสร็จ
    } finally {
      setIsLocalBuying(false); // 🟢 ไม่ว่าจะซื้อสำเร็จหรือพัง ก็ให้ปิด Loading เสมอ
    }
  };

  const handleCancelBuy = () => {
    setOpenBuy(false);
  };

  const handleOpenUpgrade = () => {
    playClickSound();
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

          {/* ส่วนแสดงไอคอน Deck */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              backgroundColor: "rgba(0,0,0,0.2)",
              border: "1px solid #5a3e2b",
              borderRadius: "4px",
              padding: "4px 8px",
              minHeight: "28px",
              flexWrap: "wrap", // เผื่อฮีโร่มีการ์ดหลายประเภทจะได้ปัดขึ้นบรรทัดใหม่ได้
              "@media (orientation: landscape) and (max-height: 450px)": {
                minHeight: "10px",
                padding: "2px 4px",
              },
            }}
          >
            {/* 💡 THE FIX: ป้องกัน undefined โดยการใช้ rawDeck?.length (ถึงบรรทัดบนจะแก้เป็น [] แล้วก็ใส่กันเหนียวไว้) */}
            {rawDeck?.length > 0 ? (
              rawDeck.map((effect, index) => {
                const iconData = getDeckIconData(effect.effect);
                return (
                  <Tooltip
                    key={index}
                    title={iconData.desc}
                    placement="top"
                    arrow
                    slotProps={{
                      tooltip: {
                        sx: {
                          fontSize: "12px",
                          fontFamily: "'Verdana', sans-serif",
                          // fontWeight: "bold",
                          backgroundColor: "#2a160f",
                          border: `1px solid ${iconData.color}`,
                          color: iconData.color,
                        },
                      },
                      arrow: { sx: { color: "#2a160f" } },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: { xs: 16, md: 18 },
                        height: { xs: 16, md: 18 },
                        borderRadius: "50%",
                        backgroundColor: iconData.color,
                        color: "#fff",
                        border: "1.5px solid #fff",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.5)",
                        fontSize: { xs: 12, md: 14 },
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.2)",
                        },
                        "@media (orientation: landscape) and (max-height: 450px)":
                          {
                            width: 9,
                            height: 9,
                            fontSize: 8,
                            justifyContent: "center",
                            border: "0.2px solid #fff",
                          },
                      }}
                    >
                      {iconData.icon}
                    </Box>
                  </Tooltip>
                );
              })
            ) : (
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
                No deck info available
              </Typography>
            )}
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
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
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
                icon={<GiHearts />}
                color="#ff4d4d"
                description="Maximum health points."
              />
              <StatLine
                label="ATK"
                value={game_stats.power}
                icon={<GiBroadsword />}
                color="#e67e22"
                description="Letter limit. Exceeding this causes recoil damage."
              />
              <StatLine
                label="SPEED"
                value={game_stats.speed}
                icon={<GiLeatherBoot />}
                color="#f1c40f"
                description="Determines turn order in battle."
              />
            </Box>
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

            // ปรับสีปุ่ม: ถ้าเป็นตัวเลือกเดิมแต่กำลังจะถูกแย่งตำแหน่ง ให้สีกลับไปเป็นปุ่มเขียวธรรมดา
            background: (isSelected && !isLosingSelection)
              ? "linear-gradient(180deg, #aed2af, #427d45)"
              : isOwned
                ? "linear-gradient(180deg, #81c784, #388e3c)"
                : !canBuy
                  ? "linear-gradient(180deg, #757575, #424242)"
                  : "linear-gradient(180deg, #c49a3a, #8b5a1e)",

            opacity: isDisabled || isSelecting || isBuying ? 0.7 : 1,
            cursor: (isSelecting || isBuying) ? "wait" : isDisabled ? "not-allowed" : "pointer",
            pointerEvents: isDisabled || isSelecting || isBuying ? "none" : "auto",
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
            playClickSound();
            if (isGlobalSelecting || isGlobalBuying) return; // ถ้าตัวไหนสักตัวโหลดหรือซื้ออยู่ ห้ามกดซ้ำ
            if (isSelected) return;
            if (isOwned) {
              setIsLocalSelecting(true); // ให้การ์ดใบนี้รู้ตัวว่า "ฉันโดนกดอยู่นะ"
              selectHero(hero.id);
              return;
            }
            if (canBuy) setOpenBuy(true);
          }}
        >
          {isSelecting ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <CircularProgress size={14} />

              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: { xs: 10, md: 12 },
                }}
              >
                ...SELECTING
              </Typography>
            </Box>
          ) : isBuying ? ( // เคสกำลังซื้อ
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <CircularProgress size={14} sx={{ color: "#3e2723" }} />

              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: { xs: 10, md: 12 },
                }}
              >
                ...BUYING
              </Typography>
            </Box>
          ) : (isSelected && !isLosingSelection) ? ( 
            // ถ้าเคยเลือกไว้ และไม่ได้กำลังโดนแย่งตำแหน่ง ถึงจะโชว์คำว่า SELECTED
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
            // โชว์ข้อความ SELECT ธรรมดาสำหรับปุ่มที่เพิ่งโดนแย่งตำแหน่งไปหมาดๆ หรือปุ่มปกติ
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
        onConfirm={() => handleConfirmBuy()}
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