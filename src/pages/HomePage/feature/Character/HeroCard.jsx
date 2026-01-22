import { useAuthStore } from "../../../../store/useAuthStore";
import { useState } from "react";
import { Box, Typography, Tooltip, Divider, Grid ,IconButton} from "@mui/material";
import { usePreloadFrames } from "../../hook/usePreloadFrams";
import { useIdleFrame } from "../../hook/useIdleFrame";
import { GameDialog } from "../../../../components/GameDialog";
import StatBar from "./StatBar";
import { StatNumericBox, StatVisualBar } from "./StatDisplay";
import LevelBar from "./LevelBar";
import iconic from "../../../../assets/icons/iconic.png";
import correct from "../../../../assets/icons/correct.png";

// Icons
import FavoriteIcon from "@mui/icons-material/Favorite"; // HP
import FlashOnIcon from "@mui/icons-material/FlashOn"; // Power
import SpeedIcon from "@mui/icons-material/Speed"; // Speed
import AutorenewIcon from "@mui/icons-material/Autorenew"; // Spin
import BackpackIcon from "@mui/icons-material/Backpack"; // Fallback Slot Icon
// Icons สำหรับปุ่ม Switch
import ViewListIcon from '@mui/icons-material/ViewList'; // ดูแบบหลอด (List)
import ViewModuleIcon from '@mui/icons-material/ViewModule'; // ดูแบบกล่อง (Grid)

// --- ShopHeroCard (ปรับปรุง: รับ Point และรวม Stat) ---
const HeroCard = ({ hero, playerHeroes, money }) => {
  const { selectHero, buyHero } = useAuthStore();
  // dialog buyhero
  const [open, setOpen] = useState(false);

  //  swip stat ว่าจะดูแบบ หลอดหรือกล่อง 
  const [showDetail, setShowDetail] = useState(false);

  const frames = usePreloadFrames("img_hero", hero.id, 2);
  const frame = useIdleFrame(frames.length, 450);

  // ตรวจสอบสถานะการเป็นเจ้าของ
  const playerHero = playerHeroes?.find((h) => h.hero_id === hero.id);
  const isOwned = !!playerHero;
  const isSelected = playerHero?.is_selected === true;
  const canBuy = !isOwned && money > hero.price;

  // === ดึงข้อมูลมาแสดง (ถ้ามี playerHero ใช้ของ playerHero ถ้าไม่มีใช้ base ของ hero) ===
  const currentLevel = playerHero?.level || 1;
  const currentExp = isOwned ? playerHero?.current_exp || 0 : 0;
  const nextExp = playerHero?.next_exp || 100;

  // Map ข้อมูล 5 ตัวตามที่ขอ
  const stats = {
    hp: isOwned ? playerHero?.hp_lv : hero.hp_lv,
    power: isOwned ? playerHero?.power_lv : hero.power_lv, 
    speed: isOwned ? playerHero?.speed_lv : hero.speed_lv,
    slot: isOwned ? playerHero?.slot_lv : hero.slot_lv
  };

  // เดี๋ยวมาปรับ
  const MAX_STATS_REF = {
      hp: 500,   
      power: 100, 
      speed: 100,
      slot: 20
  };

  const handleConfirmBuy = async () => {
    await buyHero(hero.id);
    setOpen(false);
  };

  const handleCancelBuy = () => {
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          width: 360,
          height: 480,
          // background: "#eaddcf",
          background: isOwned
            ? "#eaddcf"
            : "linear-gradient(180deg, #f2dfb6, #d9b97a)",

          border: isOwned ? "3px solid #6b3f1f" : "3px solid #6b3f1f",
          // borderRight: isOwned ? "3px solid #6b3f1f" : "3px solid #6b3f1f",
          borderRadius: isOwned ? 3 : 3,

    //       boxShadow: isOwned
    //         ? "none"
    //         : `inset 0 0 0 2px rgba(255,255,255,0.25),
    //  0 6px 0 #4a2b16,
    //  0 10px 20px rgba(0,0,0,0.5)`,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* === PART 1: IMAGE === */}
        <Box
          sx={{
            flex: "0 0 200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            background:
              "radial-gradient(circle, #fff8e1 10%, rgba(255,255,255,0) 70%)",
            top: 20,
          }}
        >
          {frames.length > 0 && (
            <img
              src={frames[frame - 1].src}
              alt={hero.name}
              style={{
                width: "160px",
                height: "160px",
                objectFit: "contain",
                imageRendering: "pixelated",
                filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.4))",
              }}
              onError={(e) => {
                e.currentTarget.src = "/fallback/unknown-monster.png";
              }}
            />
          )}
        </Box>

        {/* === PART 2: NAME HEADER === */}
        <Box
          sx={{
            // background: "#5d4037",
            py: 1.5,
            textAlign: "center",
            // borderBottom: isOwned ? "none" : "2px solid #3e2723",
            // boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            position: "relative",
            bottom: "42%",
            display: "flex",
            justifyContent: "center",
            gap: 1.2,
            background: isOwned ? "#5d4037" : "#5d4037",
            borderBottom: isOwned ? "2px solid #3e2723" : "2px solid #3e2723",
            boxShadow: isOwned ? "none" : "0 2px 5px rgba(0,0,0,0.3)",
          }}
        >
          <Typography
            sx={{
              fontFamily: `"Press Start 2P", monospace`,
              fontSize: "14px",
              color: "#ffecb3",
              textShadow: "2px 2px 0 #000",
              textTransform: "uppercase",
            }}
          >
            {hero.name}
          </Typography>
          <Tooltip title="Rare Hero">
            <Box
              component="img"
              src={iconic}
              sx={{
                width: "20px",
                height: "20px",
                imageRendering: "pixelated",
              }}
            />
          </Tooltip>
        </Box>

        {/* === PART 3: NEW STATS PANEL === */}
        <Box
          sx={{
            flex: 1,
            
            background: isOwned ? "#3a2416" : "#3a2416",
            borderRadius: 2,
            border: isOwned ? "none" : "2px solid #2a160f",
            boxShadow: isOwned ? "none" : "inset 0 0 8px rgba(0,0,0,0.8)",
            mx: 1.5,
            mb: 1.5,
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            bottom: 60,
          }}
        >
          {/* Level Bar (แบบช่องๆ) */}
          <LevelBar
            level={currentLevel}
            currentExp={currentExp}
            nextExp={nextExp}
          />

          {/* เส้นคั่น + ปุ่ม Toggle สลับโหมด */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, mb: 1 }}>
             <Divider sx={{ borderColor: "#444", borderStyle: "dashed", flex: 1 }} />
             
             {/* 🟢 ปุ่มสลับโหมด View (Flip Button) */}
             <Tooltip title={showDetail ? "Switch to Bars" : "Switch to Details"} placement="top">
                <IconButton 
                    onClick={() => setShowDetail(!showDetail)}
                    size="small"
                    sx={{ 
                        color: "#8d6e63", 
                        ml: 1,
                        border: "1px solid #5a3e2b",
                        borderRadius: "4px",
                        backgroundColor: "rgba(0,0,0,0.2)",
                        "&:hover": { color: "#ffca28", backgroundColor: "rgba(255,255,255,0.05)" }
                    }}
                >
                    {showDetail ? <ViewListIcon fontSize="small" /> : <ViewModuleIcon fontSize="small" />}
                </IconButton>
             </Tooltip>
          </Box>


          {/* 🟢 CONDITIONAL RENDERING: สลับการแสดงผล */}
          {showDetail ? (
             // --- VIEW 1: NUMERIC BOX (Grid) ---
             // โชว์ตัวเลขละเอียด เป็นกล่องๆ
             <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                <StatNumericBox label="HP" value={stats.hp} icon={<FavoriteIcon />} color="#ff5252" />
                <StatNumericBox label="ATK" value={stats.power} icon={<FlashOnIcon />} color="#ffca28" />
                <StatNumericBox label="SPD" value={stats.speed} icon={<SpeedIcon />} color="#00e5ff" />
                <StatNumericBox label="SLOT" value={stats.slot} icon={<BackpackIcon />} color="#d1c4e9" />
             </Box>
          ) : (
             // --- VIEW 2: VISUAL BAR (List) ---
             // โชว์หลอดพลังสวยๆ ไม่มีตัวเลขรกๆ
             <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
                <StatVisualBar label="HP" value={stats.hp} max={MAX_STATS_REF.hp} icon={<FavoriteIcon />} color="#ff5252" />
                <StatVisualBar label="ATK" value={stats.power} max={MAX_STATS_REF.power} icon={<FlashOnIcon />} color="#ffca28" />
                <StatVisualBar label="SPD" value={stats.speed} max={MAX_STATS_REF.speed} icon={<SpeedIcon />} color="#00e5ff" />
                <StatVisualBar label="SLOT" value={stats.slot} max={MAX_STATS_REF.slot} icon={<BackpackIcon />} color="#d1c4e9" />
             </Box>
          )}

        </Box>

        {/* === PART 4: BUTTON === */}
        <Box
          sx={{
            position: "absolute",
            bottom: 15,
            left: 12,
            right: 12,
            zIndex: 10,
            py: 1,
            textAlign: "center",
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
            boxShadow:
              isSelected || (!isOwned && !canBuy)
                ? "inset 0 2px 4px rgba(0,0,0,0.5)"
                : `inset 0 1px 0 rgba(71, 97, 42, 0.25), inset 0 -2px 0 rgba(0,0,0,0.35), 0 5px 0 #3a1f0b, 0 8px 14px rgba(0,0,0,0.45)`,
            "&:hover":
              !isSelected && (isOwned || canBuy)
                ? { filter: "brightness(1.05)" }
                : {},
          }}
          onClick={() => {
            if (isSelected) return;
            if (isOwned) {
              selectHero(hero.id);
              return;
            }
            if (!canBuy) return;
            setOpen(true);
          }}
        >
          {isSelected ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Box
                component="img"
                src={correct}
                sx={{
                  position: "absolute",
                  left: 80,
                  top: -13,
                  width: "42px",
                  height: "42px",
                  zIndex: 20,
                  imageRendering: "pixelated",
                  filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.8))",
                  transform: "rotate(5deg)",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 12,
                  color: "#2a160a",
                  ml: 3,
                }}
              >
                SELECTED
              </Typography>
            </Box>
          ) : (
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 12,
                color: !isOwned && !canBuy ? "#ff1744" : "#2a160a",
                textShadow: !isOwned && !canBuy ? "1px 1px 0px #000" : "none",
              }}
            >
              {isOwned ? "SELECT" : `💰 ${hero.price}`}
            </Typography>
          )}
        </Box>
      </Box>

      <GameDialog
        open={open}
        title={`BUY HERO`}
        description={`${hero.name}\nCost: ${hero.price} 💰`}
        confirmText="BUY"
        cancelText="NO"
        onConfirm={handleConfirmBuy}
        onCancel={handleCancelBuy}
      />
    </>
  );
};

export default HeroCard;
