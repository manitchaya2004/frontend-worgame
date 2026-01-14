import { useAuthStore } from "../../../../store/useAuthStore";
import { useState} from "react";
import { Box,Typography,Tooltip , Divider} from "@mui/material";
import { usePreloadFrames } from "../../hook/usePreloadFrams";
import { useIdleFrame } from "../../hook/useIdleFrame";
import { GameDialog } from "../../../../components/GameDialog";
import StatBar from "./StatBar";
import LevelBar from "./LevelBar";
import iconic from "../../../../assets/icons/iconic.png";
import correct from "../../../../assets/icons/correct.png";

// --- ShopHeroCard (ปรับปรุง: รับ Point และรวม Stat) ---
const HeroCard = ({ hero, playerHeroes, money }) => {
  const { selectHero, buyHero, buyHeroState } = useAuthStore();
  const [open, setOpen] = useState(false);

  const frames = usePreloadFrames("img_hero", hero.id, 2);
  const frame = useIdleFrame(frames.length, 450);

  // ตรวจสอบสถานะการเป็นเจ้าของ
  const playerHero = playerHeroes?.find((h) => h.hero_id === hero.id);
  const isOwned = !!playerHero;
  const isSelected = playerHero?.is_selected === true;
  const canBuy = !isOwned && money > hero.price;

  // === เงื่อนไขข้อมูล ===
  const currentLevel = playerHero?.level || 1;
  const currentExp = isOwned ? playerHero?.current_exp || 0 : 0;
  const nextExp = playerHero?.next_exp || 100;

  // 4. Points: ถ้ายังไม่ซื้อ ให้เป็น 0 ไปเลย (ห้ามอัปเกรด)
  const availablePoints = isOwned ? playerHero?.point_for_added || 0 : 0;

  const getTotalStat = (baseValue, addedKey) => {
    if (isOwned && playerHero) {
      // ถ้าเป็นเจ้าของ: Base + Added (แปลงเป็น Number กัน Error)
      return playerHero[addedKey] || 0;
    }
    // ถ้าไม่ใช่เจ้าของ: ใช้ค่า Base เดิมๆ จาก Hero List
    return baseValue;
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
          background: "linear-gradient(180deg, #f2dfb6, #d9b97a)",
          border: "3px solid #6b3f1f",
          borderRadius: 3,
          boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.25), 0 6px 0 #4a2b16, 0 10px 20px rgba(0,0,0,0.5)`,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ... (IMAGE AREA & HEADER NAME เหมือนเดิม ไม่ต้องแก้) ... */}
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
          {frames.length > 0 ? (
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
          ) : null}
        </Box>
        <Box
          sx={{
            background: "#5d4037",
            py: 1.5,
            textAlign: "center",
            borderBottom: "2px solid #3e2723",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            position: "relative",
            bottom: "42%",
            display:'flex',
            justifyContent:'center',
            gap:1.2
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
           <Tooltip title="อีหน้าอ้วน">
            <Box
            component="img"
            src={iconic}
            sx={{
              width:'20px',
              height:'20px',
              imageRendering: "pixelated",
            }}
            />
           </Tooltip>
        </Box>

        {/* === DARK STATS PANEL === */}
        <Box
          sx={{
            flex: 1,
            background: "#3a2416",
            borderRadius: 2,
            border: "2px solid #2a160f",
            boxShadow: "inset 0 0 8px rgba(0,0,0,0.6)",
            mx: 1.5,
            mb: 1.5,
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            bottom: 60,
          }}
        >
          <Box>
            {/* Level Bar ใหม่ */}
            <LevelBar
              level={currentLevel}
              currentExp={currentExp}
              nextExp={nextExp}
            />

            <Divider
              sx={{ borderColor: "#5d4037", mb: 1, borderStyle: "dashed" }}
            />

            {/* Stat Bars (โชว์ปุ่ม Upgrade เฉพาะมี Point และเป็นเจ้าของ) */}
            <StatBar
              label="STR"
              value={getTotalStat(hero.base_str, "base_str")}
            />
            <StatBar
              label="DEX"
              value={getTotalStat(hero.base_dex, "base_dex")}
            />
            <StatBar
              label="INT"
              value={getTotalStat(hero.base_int, "base_int")}
            />
            <StatBar
              label="FTH"
              value={getTotalStat(hero.base_faith, "base_faith")}
            />
            <StatBar
              label="CON"
              value={getTotalStat(hero.base_con, "base_con")}
            />
            <StatBar
              label="LUCK"
              value={getTotalStat(hero.base_luck, "base_luck")}
              // showUpgrade={availablePoints > 0}
              // onUpgrade={() => handleUpgrade("cur_luck")}
            />
          </Box>
        </Box>

        {/* Price / Select Button (เหมือนเดิม) */}
        {/* Price / Select Button */}
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
              ? "linear-gradient(180deg, #aed2af, #427d45)" // selected
              : isOwned
              ? "linear-gradient(180deg, #81c784, #388e3c)" // owned
              : !canBuy
              ? "linear-gradient(180deg, #757575, #424242)" // เงินไม่พอ
              : "linear-gradient(180deg, #c49a3a, #8b5a1e)", // buy ได้

            cursor:
              isSelected || (!isOwned && !canBuy) ? "not-allowed" : "pointer",

            opacity: isSelected || (!isOwned && !canBuy) ? 0.7 : 1,

            border: "3px solid #5a3312",
            borderRadius: 2,
            color: "#2a160a",

            boxShadow:
              isSelected || (!isOwned && !canBuy)
                ? "inset 0 2px 4px rgba(0,0,0,0.5)"
                : `inset 0 1px 0 rgba(71, 97, 42, 0.25),
           inset 0 -2px 0 rgba(0,0,0,0.35),
           0 5px 0 #3a1f0b,
           0 8px 14px rgba(0,0,0,0.45)`,

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

            if (!canBuy) return; // 💥 เงินไม่พอ → ไม่ยิง API

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
              {/* 🟢 ไอคอนเครื่องหมายถูกที่ใหญ่ล้นปุ่ม */}
              <Box
                component="img"
                src={correct}
                sx={{
                  position: "absolute", // ใช้ absolute เพื่อให้ลอยอิสระ
                  left: 80, // ดันออกไปทางซ้ายให้ล้นขอบปุ่ม
                  top: -13, // ดันขึ้นไปข้างบนให้ล้นขอบปุ่ม
                  width: "42px", // ปรับขนาดให้ใหญ่กว่าปกติ
                  height: "42px",
                  zIndex: 20, // อยู่เหนือทุกอย่าง
                  imageRendering: "pixelated",
                  filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.8))", // เพิ่มเงาเข้มให้ดูเด้งออกมา
                  transform: "rotate(5deg)", // เอียงนิดๆ ให้ดูมีไดนามิกแบบในรูป
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 12,
                  color: "#2a160a",
                  ml: 3, // ขยับข้อความไปทางขวาหลบไอคอน
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
                // 🔴 ถ้าเงินไม่พอ ตัวอักษรจะเป็นสีแดงชัดเจน
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

export default HeroCard ;