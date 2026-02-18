import { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Stack,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { motion } from "framer-motion";

import { THEME } from "../../../hook/const";
import { useAuthStore } from "../../../../../store/useAuthStore";
import { useMonsterStore } from "../../../../../store/useMonsterStore";
import { useIdleFrame } from "../../../hook/useIdleFrame";
import {
  usePreloadFrames,
  LoadImage,
  preloadImageAsync,
} from "../../../hook/usePreloadFrams";

// --- Icons ที่เพิ่มเข้ามา ---
import FavoriteIcon from "@mui/icons-material/Favorite"; // HP
import FlashOnIcon from "@mui/icons-material/FlashOn"; // Power
import SpeedIcon from "@mui/icons-material/Speed"; // Speed
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"; // MANA
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"; // COIN
import LockIcon from "@mui/icons-material/Lock";
const MotionBox = motion(Box);

// ฟังก์ชันสำหรับเลือก Icon และสีตาม Label อัตโนมัติ
const getStatIcon = (label) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("hp"))
    return <FavoriteIcon sx={{ color: "#ff4d4d", fontSize: 16 }} />;
  if (lowerLabel.includes("power"))
    return <FlashOnIcon sx={{ color: "#ffb84d", fontSize: 16 }} />;
  if (lowerLabel.includes("speed"))
    return <SpeedIcon sx={{ color: "#00e5ff", fontSize: 16 }} />;
  if (lowerLabel.includes("mana"))
    return <AutoFixHighIcon sx={{ color: "#9933ff", fontSize: 16 }} />;
  if (lowerLabel.includes("coin"))
    return <MonetizationOnIcon sx={{ color: "#ffd700", fontSize: 16 }} />;
  return null;
};

// const PAGE_SIZE = 15;
const name = "img_monster";

// --- COMPONENTS ---

const StatTextBox = ({
  label,
  value,
  showTooltip = false,
  tooltipText = "",
  isUnlocked = true, // เพิ่ม prop เพื่อเช็คปลดล็อค
}) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
    {/* LABEL + INFO ICON */}
    <Box
      sx={{
        width: "140px", 
        display: "flex",
        alignItems: "center",
        gap: 0.8, 
        flexShrink: 0,
      }}
    >
      {getStatIcon(label)}

      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: {xs: 8, md: 10}, 
          color: isUnlocked ? THEME.accent : "#777", // สีเทาถ้ายังล็อค
          textShadow: `1px 1px 0 ${THEME.shadow}`,
          letterSpacing: "1px",
        }}
      >
        {label}
      </Typography>

      {showTooltip && isUnlocked && (
        <Tooltip title={tooltipText} arrow placement="top">
          <IconButton
            size="small"
            sx={{
              p: 0,
              color: THEME.accent,
              "&:hover": {
                color: "#ffd966", 
              },
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>

    {/* VALUE BOX */}
    <Box
      sx={{
        ml: { xs: 0, md: 3 }, 
        flex: 1,
        backgroundColor: "#1a120b",
        color: isUnlocked ? THEME.accent : "#555",
        border: `2px solid ${isUnlocked ? THEME.border : "#333"}`,
        borderRadius: "4px",
        py: 0.5,
        px: 2,
        textAlign: "center",
        boxShadow: "inset 0 2px 5px rgba(0,0,0,0.8)",
        fontFamily: "'Verdana', sans-serif",
        fontWeight: "bold",
        fontSize: 13,
      }}
    >
      {isUnlocked ? value : "???"}
    </Box>
  </Box>
);

// 3. Info Tab Content
const InfoTab = ({ monster }) => {
  const isUnlocked = monster?.isUnlocked ?? true;
  const minCoin = monster?.exp - 1;
  const maxCoin = monster?.exp + 1;

  return (
    <Box sx={{m:2,height: "100%", overflowY: "auto", pr: 1 }}>
      <Box
        sx={{
          mb: 2,
          textAlign: "center",
          borderBottom: `2px dashed ${THEME.border}`,
          pb: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 16,
            color: isUnlocked ? THEME.accent : "#777",
            mb: 0.5,
            textTransform: "uppercase",
            textShadow: `2px 2px 0 ${THEME.shadow}`,
          }}
        >
          {isUnlocked ? (monster?.name || "Unknown") : "???"}
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <StatTextBox label="HP" value={monster?.hp || 0} isUnlocked={isUnlocked} />
        <StatTextBox label="POWER" value={monster?.power || 0} isUnlocked={isUnlocked} />
        <StatTextBox label="SPEED" value={monster?.speed || 0} isUnlocked={isUnlocked} />
        <Divider sx={{ my: 2, borderColor: THEME.border, opacity: 0.9 }} />
        <StatTextBox
          label="MANA COST"
          value={monster?.quiz_move_cost || 0}
          showTooltip
          tooltipText="Mana required to use this monster’s skill"
          isUnlocked={isUnlocked}
        />
        <StatTextBox
          label="COIN DROP"
          value={`${minCoin || 0} - ${maxCoin || 0}`}
          isUnlocked={isUnlocked}
        />
      </Box>
    </Box>
  );
};

// 4. Moves Tab Content
const MovesTab = ({ monster }) => {
  const isUnlocked = monster?.isUnlocked ?? true;
  const moves = monster?.monster_moves;

  // ดักกรณีมอนสเตอร์ยังไม่ปลดล็อค
  if (!isUnlocked) {
    return (
      <Box sx={{ p: 4, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <LockIcon sx={{ fontSize: 40, color: "#555" }} />
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: "#777",
            lineHeight: 1.5,
          }}
        >
          Explore the adventure and clear stages to unlock this monster's details!
        </Typography>
      </Box>
    );
  }

  if (!moves || moves.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: THEME.textMain,
          }}
        >
          No move patterns found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ m: 2, height: "100%", overflowY: "auto", pr: 1 }}>
      {moves.map((pattern, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 10,
              color: THEME.magic, 
              mb: 1,
              borderBottom: `2px solid ${THEME.border}`,
              display: "inline-block",
              textShadow: `1px 1px 0 #000`,
            }}
          >
            PATTERN {pattern.pattern_no}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 1 }}
          >
            {pattern.moves
              .sort((a, b) => a.pattern_order - b.pattern_order)
              .map((move, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
                  <Chip
                    label={`${move.pattern_order}. ${move.pattern_move}`}
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: 10,
                      height: 24,
                      backgroundColor: THEME.bgMain, 
                      color: THEME.textMain,
                      borderRadius: "4px",
                      border: `1px solid ${THEME.border}`,
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                  {i < pattern.moves.length - 1 && (
                    <Typography
                      sx={{ mx: 0.5, color: THEME.accent, fontWeight: "bold" }}
                    >
                      →
                    </Typography>
                  )}
                </Box>
              ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

// --- MAIN COMPONENTS ---

const DetailMonster = ({ monster }) => {
  console.log("Rendering DetailMonster for:", monster);
  const [tab, setTab] = useState("info");

  const frames = usePreloadFrames("img_monster", monster?.id, 2); 
  const frame = useIdleFrame(frames.length, 450);

  const isUnlocked = monster?.isUnlocked ?? true;
  const isBoss = monster?.isBoss;

  // สีปรับตามสถานะ (Lock / Boss / Normal)
  const glowColor = !isUnlocked ? "transparent" : (isBoss ? "rgba(255, 50, 50, 0.4)" : "rgba(0,188,212,0.2)");
  const bgGradient = !isUnlocked ? "rgba(255,255,255,0.05)" : (isBoss ? "rgba(255,50,50,0.15)" : "rgba(0,188,212,0.1)");
  const borderColor = !isUnlocked ? "#333" : (isBoss ? "#ff3333" : THEME.border);

  // 💡 ตัวกำหนด Source ของรูปภาพ: 
  // ถ้า frames กำลังโหลดอยู่ (length == 0) ให้ดึงภาพนิ่งจาก LoadImage ไปโชว์พลางๆ ก่อน
  // พอโหลดเสร็จ ค่อยเช็คต่อว่าปลดล็อคหรือยัง (ถ้าปลดล็อคให้ขยับ ถ้าล็อคให้หยุดนิ่งเฟรมแรก)
  const imgSrc = frames.length > 0 
    ? (isUnlocked ? frames[frame - 1]?.src : frames[0]?.src) 
    : LoadImage("img_monster", monster?.id, 1);

  return (
    <Grid container spacing={0} sx={{ height: "100%" }}>
      {/* LEFT: Picture Monster */}
      <Grid
        size={{ xs: 5, sm: 5 }}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: !isUnlocked ? "#111" : (isBoss ? "#2a0a0a" : "#1a120b"),
            border: `4px solid ${borderColor}`,
            borderRadius: "8px",
            boxShadow: !isUnlocked ? "none" : `6px 6px 0 ${THEME.shadow}, 0 0 20px ${glowColor}`,
            width: "100%",
            height: "100%",
            maxHeight: "350px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `radial-gradient(circle, ${bgGradient} 0%, rgba(0,0,0,0) 70%)`,
            position: "relative",
          }}
        >
          {/* Badge Zone */}
          <Box sx={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 1 }}>
            <Box
              sx={{
                bgcolor: !isUnlocked ? "#333" : THEME.bgMain,
                color: !isUnlocked ? "#777" : THEME.accent,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontFamily: "'Press Start 2P'",
                fontSize: 10,
                border: `2px solid ${!isUnlocked ? "#222" : THEME.border}`,
              }}
            >
              #{monster?.no ?? "???"}
            </Box>

            {isBoss && isUnlocked && (
              <Box
                sx={{
                  bgcolor: "#ff3333",
                  color: "#fff",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontFamily: "'Press Start 2P'",
                  fontSize: 10,
                  border: `2px solid #800000`,
                  boxShadow: "0 0 5px rgba(255,0,0,0.8)",
                  animation: "pulse 1.5s infinite", 
                }}
              >
                BOSS
              </Box>
            )}
          </Box>

          {/* รูปมอนสเตอร์: เปลี่ยนมาใช้ imgSrc ที่คำนวณไว้ด้านบนแทน */}
          {monster?.id ? (
            <img
              key={monster?.id}
              src={imgSrc}
              alt={monster?.name}
              style={{
                width: "80%",
                height: "80%",
                objectFit: "contain",
                imageRendering: "pixelated",
                filter: !isUnlocked 
                  ? "brightness(0) drop-shadow(0 0 5px rgba(255,255,255,0.2))" 
                  : "drop-shadow(0 4px 4px rgba(0,0,0,0.5))",
                // เอา transition ออกเพื่อให้ดำสนิททันที
              }}
              onError={(e) => {
                e.currentTarget.src = "/fallback/unknown-monster.png";
              }}
            />
          ) : (
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 10,
                color: "#aaa",
              }}
            >
              No Image
            </Typography>
          )}

          {/* แสดงไอคอนแม่กุญแจทับรูปหากล็อค */}
          {!isUnlocked && (
             <LockIcon sx={{ position: "absolute", color: "rgba(255,255,255,0.3)", fontSize: 60 }} />
          )}
        </Box>
      </Grid>

      {/* RIGHT: Details & Tabs */}
      <Grid size={{ xs: 7, sm: 7 }}>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            p: 2,
            pl: { xs: 2, sm: 0 },
          }}
        >
          {/* Main Card Panel */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: THEME.bgPanel, 
              border: `3px solid ${THEME.border}`,
              borderRadius: "8px",
              boxShadow: `inset 0 0 20px rgba(0,0,0,0.5)`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              width: "100%",
              height: "100%", 
              maxHeight: "350px",
            }}
          >
            {/* Tab Header */}
            <Stack
              direction="row"
              sx={{
                borderBottom: `3px solid ${THEME.border}`,
                background: "#1a120b",
              }}
            >
              {["info", "moves"].map((t) => (
                <Button
                  key={t}
                  onClick={() => setTab(t)}
                  fullWidth
                  sx={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: 10,
                    borderRadius: 0,
                    py: 1.5,
                    backgroundColor: tab === t ? THEME.border : "transparent",
                    color: tab === t ? THEME.accent : THEME.textMain,
                    "&:hover": {
                      backgroundColor:
                        tab === t ? THEME.border : `rgba(90, 62, 43, 0.5)`,
                    },
                  }}
                >
                  {t.toUpperCase()}
                </Button>
              ))}
            </Stack>

            <Box sx={{ flex: 1, overflow: "hidden"}}>
              {tab === "info" && <InfoTab monster={monster} />}
              {tab === "moves" && <MovesTab monster={monster} />}
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  )};

// --- LIST MONSTER (Bottom) ---

const arrowBtnStyle = {
  mx: 1,
  minWidth: 40,
  height: 40,
  fontSize: 16,
  color: THEME.accent,
  backgroundColor: THEME.bgMain,
  border: `2px solid ${THEME.border}`,
  boxShadow: `2px 2px 0 ${THEME.shadow}`,
  "&:hover": { backgroundColor: THEME.border, color: THEME.accent },
  "&:active": {
    boxShadow: "inset 2px 2px 0 #000",
    transform: "translate(2px, 2px)",
  },
  "&:disabled": { opacity: 0.5, boxShadow: "none", cursor: "not-allowed" },
};

const ListMonster = ({ listMonster, onSelectMonster, selectedMonster }) => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const scrollAmount = dir === "left" ? -310 : 310;
    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", 
        py: 1,
        px: 0.5,
        gap: { xs: 1, sm: 2 },
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: "8px",
        border: `2px solid ${THEME.border}`,
      }}
    >
      <Button
        onClick={() => scroll("left")}
        sx={{
          ...arrowBtnStyle,
        }}
      >
        ◀
      </Button>

      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          display: "flex",
          gap: "12px",
          alignItems: "center",
          overflowX: "auto",
          overflowY: "hidden",
          height: 65,
          px: 1,
          maxWidth: "918px",
          margin: "0 auto", 
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {listMonster.map((m) => {
          const isActive = selectedMonster?.id === m.id;
          const isUnlocked = m.isUnlocked;
          const isBoss = m.isBoss;

          // จัดการสีกรอบ หากยังไม่ปลดล็อคให้เป็นสีเทาหม่น
          const activeBorderColor = !isUnlocked ? "#888" : (isBoss ? "#ff3333" : THEME.accent);
          const inactiveBorderColor = !isUnlocked ? "#333" : (isBoss ? "#800000" : THEME.border); 
          const activeShadow = !isUnlocked ? "0 0 10px rgba(255,255,255,0.2)" : (isBoss ? `0 0 15px #ff3333` : `0 0 15px ${THEME.accent}`);
          const boxBgColor = isActive ? (!isUnlocked ? "#222" : THEME.bgMain) : (!isUnlocked ? "#111" : (isBoss ? "#2a0a0a" : THEME.bgPanel));

          return (
            <Box
              key={m.id}
              onClick={() => onSelectMonster(m)}
              sx={{
                flexShrink: 0, 
                width: { xs: 45, sm: 50 },
                height: { xs: 45, sm: 50 },
                border: `2px solid ${isActive ? activeBorderColor : inactiveBorderColor}`,
                backgroundColor: boxBgColor,
                borderRadius: "4px",
                boxShadow: isActive ? activeShadow : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                position: "relative",
                "&:hover": {
                  transform: "scale(1.1)",
                  zIndex: 1,
                  borderColor: activeBorderColor,
                },
              }}
            >
              <img
                src={LoadImage("img_monster", m.id, 1)} 
                alt={m.name}
                style={{
                  height: "40px", 
                  imageRendering: "pixelated",
                  // ใส่ Effect เงาดำใน List หากยังไม่ปลดล็อค
                  filter: !isUnlocked ? "brightness(0) drop-shadow(0 0 2px rgba(255,255,255,0.2))" : "none",
                }}
                onError={(e) => {
                  e.currentTarget.src = "/fallback/unknown-monster.png";
                }}
              />
              {!isUnlocked && (
                 <LockIcon sx={{ position: "absolute", color: "rgba(255,255,255,0.4)", fontSize: 16 }} />
              )}
            </Box>
          );
        })}
      </Box>

      <Button
        onClick={() => scroll("right")}
        sx={{
          ...arrowBtnStyle,
        }}
      >
        ▶
      </Button>
    </Box>
  );
};

// --- MAIN PAGE ---

const MonsterLibrary = () => {
  const { currentUser } = useAuthStore();
  const { monsters, unlockedMonsterIds, fetchUnlockedMonsters } =
    useMonsterStore();

  const [selectedMonster, setSelectedMonster] = useState(null);

  const [isMinLoading, setIsMinLoading] = useState(true);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);

  useEffect(() => {
    if (currentUser?.stages) {
      fetchUnlockedMonsters(currentUser.stages);
    }
  }, [currentUser, fetchUnlockedMonsters]);

  // LOGIC การคำนวณการ Lock / Unlock จาก unlockedMonsterIds
  const sortedMonsters = useMemo(() => {
    if (!monsters) return [];

    return [...monsters]
      .sort((a, b) => a.no - b.no)
      .map((m) => {
        // ถ้า ID มอนสเตอร์ตัวนี้ ไปอยู่ในกอง ID ที่เราไล่ดึงมาจาก API (unlockedMonsterIds) แสดงว่าปลดล็อคแล้ว!
        const isUnlocked = unlockedMonsterIds.includes(m.id);

        return { ...m, isUnlocked };
      });
  }, [monsters, unlockedMonsterIds]);

  useEffect(() => {
    if (sortedMonsters?.length && !selectedMonster) {
      setSelectedMonster(sortedMonsters[0]);
    }
  }, [sortedMonsters, selectedMonster]);

  // 💡 THE FIX: สร้างตัวแปรนี้ขึ้นมาเพื่อ "ดึงข้อมูลล่าสุด" เสมอ
  // แทนที่จะใช้ selectedMonster ตรงๆ ที่อาจจะข้อมูลเก่า เราเอา ID ของมันไปค้นหาใน sortedMonsters ที่มีค่า Lock/Unlock ล่าสุด
  const currentActiveMonster = useMemo(() => {
    if (!selectedMonster || !sortedMonsters.length) return selectedMonster;
    return sortedMonsters.find((m) => m.id === selectedMonster.id) || selectedMonster;
  }, [selectedMonster, sortedMonsters]);


  // preload image monster
  useEffect(() => {
    if (!sortedMonsters || sortedMonsters.length === 0) return;

    const preloadAssets = async () => {
      setIsLoadingAssets(true);

      const tasks = sortedMonsters.map((m) =>
        preloadImageAsync(LoadImage("img_monster", m.id, 1)),
      );

      await Promise.all(tasks);
      setIsLoadingAssets(false);
      setIsMinLoading(false);
    };

    preloadAssets();
  }, [sortedMonsters]);

  return (
    <Box sx={{ m: 2 }}>
      <MotionBox
        initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        sx={{
          position: "fixed",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",

          // Container Design: กรอบไม้สีเข้ม
          background: `linear-gradient(${THEME.bgMain}, #1a120b)`,
          border: `8px solid ${THEME.border}`,
          borderRadius: "12px",
          boxShadow: `
            0 0 0 4px #1a120b,
            0 20px 60px rgba(49, 49, 49, 0.8)
          `,
          width: { xs: "90%", sm: "80%", md: "80%", lg: "70%" },
          height: "565px",
          p: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Title */}
        <Box
          sx={{
            py: 2,
            textAlign: "center",
            background: "#1a120b",
            mx: -1,
            mt: -1,
            mb: 2,
            borderBottom: `4px solid ${THEME.border}`,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEME.accent,
              fontSize: { xs: 16, md: 24 },
              textShadow: `3px 3px 0 #000, 0 0 10px ${THEME.accent}`,
            }}
          >
            MONSTER LIBRARY
          </Typography>
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ flex: 1, mb: 1 }}>
            {/* 💡 ส่ง currentActiveMonster เข้าไปแทน selectedMonster */}
            <DetailMonster monster={currentActiveMonster} />
          </Box>

          {/* Footer List */}
          <Box sx={{ height: "80px", px: 2, mb: 1 }}>
            <ListMonster
              listMonster={sortedMonsters}
              // 💡 ส่ง currentActiveMonster เข้าไปแทน selectedMonster
              selectedMonster={currentActiveMonster} 
              onSelectMonster={setSelectedMonster}
            />
          </Box>
        </Box>
      </MotionBox>
    </Box>
  );
};

export default MonsterLibrary;