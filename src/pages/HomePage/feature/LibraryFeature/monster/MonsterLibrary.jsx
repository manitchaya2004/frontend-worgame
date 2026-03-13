import { useState, useEffect, useRef, useMemo, memo } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

// --- Icons ที่ใช้ในเกม ---
import LockIcon from "@mui/icons-material/Lock";
import StarIcon from "@mui/icons-material/Star";
import { StatTextBox } from "../../../components/StatDisplay";
import { THEME, getDeckIconData } from "../../../hook/const";
import { useAuthStore } from "../../../../../store/useAuthStore";
import { useMonsterStore } from "../../../../../store/useMonsterStore";
import { useIdleFrame } from "../../../hook/useIdleFrame";
import {
  usePreloadFrames,
  LoadImage,
  preloadImageAsync,
} from "../../../hook/usePreloadFrams";

//sound
import { useGameSfx } from "../../../../../hook/useGameSfx";
import clickSFX from "../../../../../assets/sound/click1.ogg";
import clickMouseSFX from "../../../../../assets/sound/mouserelease1.ogg";

const MotionBox = motion(Box);

// 🌟 ฟังก์ชันช่วยเติม Parameter Bypass ngrok เข้าไปใน URL
const withBypass = (url) => {
  if (!url) return "";
  // ถ้าเป็น path แบบ /api... ให้เติมพารามิเตอร์ต่อท้าย
  const connector = url.includes("?") ? "&" : "?";
  return `${url}${connector}ngrok-skip-browser-warning=69420`;
};

// 🌟 Component พิเศษ: โหลดรูปภาพแบบไม่วาร์ป และ Bypass ngrok
const SafeImageLoader = memo(({ src, alt, style, isUnlocked }) => {
  const [displayUrl, setDisplayUrl] = useState("");
  const cache = useRef({});
  const loadingPath = useRef("");

  useEffect(() => {
    if (!src) return;
    if (cache.current[src]) {
      setDisplayUrl(cache.current[src]);
      return;
    }
    if (loadingPath.current === src) return;

    let isMounted = true;
    loadingPath.current = src;

    const fetchImg = async () => {
      try {
        const response = await fetch(withBypass(src));
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        if (isMounted) {
          cache.current[src] = objectUrl;
          setDisplayUrl(objectUrl);
          loadingPath.current = "";
        }
      } catch (err) {
        if (isMounted) loadingPath.current = "";
      }
    };
    fetchImg();
    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <img
      src={displayUrl}
      alt={alt}
      style={style}
      onError={(e) => {
        e.currentTarget.src = "/fallback/unknown-monster.png";
      }}
    />
  );
});

// 3. Info Tab Content
const InfoTab = ({ monster }) => {
  const isUnlocked = monster?.isUnlocked ?? true;
  const minCoin = monster?.exp - 1;
  const maxCoin = monster?.exp + 1;

  return (
    <Box sx={{ m: 2, height: "100%", overflowY: "auto", pr: 1 }}>
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
          {isUnlocked ? monster?.name || "Unknown" : "???"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 0.5,
            mt: 1.5,
            flexWrap: "wrap",
          }}
        >
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
            {isUnlocked
              ? monster?.description || "No description available."
              : "No description available"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <StatTextBox
          label="HP"
          value={monster?.hp || 0}
          isUnlocked={isUnlocked}
        />
        <StatTextBox
          label="POWER"
          value={monster?.power || 0}
          isUnlocked={isUnlocked}
        />
        <StatTextBox
          label="SPEED"
          value={monster?.speed || 0}
          isUnlocked={isUnlocked}
        />
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

// 4. Buff Tab Content
const BuffTab = ({ monster }) => {
  const isUnlocked = monster?.isUnlocked ?? true;
  const deck = monster?.monster_deck || [];

  if (!isUnlocked) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <LockIcon sx={{ fontSize: 40, color: "#555" }} />
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: "#777",
            lineHeight: 1.5,
          }}
        >
          Explore the adventure and clear stages to unlock this monster's
          details!
        </Typography>
      </Box>
    );
  }

  if (deck.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: THEME.textMain,
          }}
        >
          No buff found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ m: 2, height: "100%", overflowY: "auto", pr: 1 }}>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          p: 1,
          flexWrap: "wrap",
        }}
      >
        {deck.map((effect, index) => {
          const deckInfo = getDeckIconData(effect.effect);
          return (
            <Tooltip
              key={index}
              title={deckInfo.desc}
              placement="top"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    fontSize: "12px",
                    fontFamily: "'Verdana', sans-serif",
                    backgroundColor: "#2a160f",
                    border: `1px solid ${deckInfo.color}`,
                    color: deckInfo.color,
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
                  width: { xs: 20, md: 30 },
                  height: { xs: 20, md: 30 },
                  borderRadius: "50%",
                  backgroundColor: deckInfo.color,
                  color: "#fff",
                  border: "1.5px solid #fff",
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.5)",
                  fontSize: { xs: 12, md: 14 },
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.2)" },
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    width: 9,
                    height: 9,
                    fontSize: 8,
                    border: "0.2px solid #fff",
                  },
                }}
              >
                {deckInfo.icon}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

// --- MAIN COMPONENTS ---

const DetailMonster = ({ monster, playClickSound }) => {
  const [tab, setTab] = useState("info");
  const frames = usePreloadFrames("img_monster", monster?.id, 2);
  const frame = useIdleFrame(frames.length, 450);

  const isUnlocked = monster?.isUnlocked ?? true;
  const isBoss = monster?.isBoss;

  const glowColor = !isUnlocked
    ? "transparent"
    : isBoss
      ? "rgba(255, 50, 50, 0.4)"
      : "rgba(0,188,212,0.2)";
  const bgGradient = !isUnlocked
    ? "rgba(255,255,255,0.05)"
    : isBoss
      ? "rgba(255,50,50,0.15)"
      : "rgba(0,188,212,0.1)";
  const borderColor = !isUnlocked ? "#333" : isBoss ? "#ff3333" : THEME.border;

  // ดึงภาพนิ่งเฟรมแรกมาโชว์ (ผ่านระบบ Safe Image)
  const staticPath = LoadImage("img_monster", monster?.id, 1);
  // ถ้าโหลดเฟรมขยับมาแล้ว (frames.length > 0) ให้สลับไปใช้เฟรมขยับ
  const activeSrc =
    frames.length > 0 && isUnlocked
      ? frames[frame - 1]?.src
      : frames.length > 0
        ? frames[0]?.src
        : staticPath;

  return (
    <Grid container spacing={0} sx={{ height: "100%" }}>
      <Grid
        item
        xs={5}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: !isUnlocked
              ? "#111"
              : isBoss
                ? "#2a0a0a"
                : "#1a120b",
            border: `4px solid ${borderColor}`,
            borderRadius: "8px",
            boxShadow: !isUnlocked
              ? "none"
              : `6px 6px 0 ${THEME.shadow}, 0 0 20px ${glowColor}`,
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
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              display: "flex",
              gap: 1,
            }}
          >
            <Box
              sx={{
                bgcolor: !isUnlocked ? "#333" : THEME.bgMain,
                color: !isUnlocked ? "#777" : THEME.accent,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontFamily: "'Press Start 2P'",
                fontSize: 10,
                border: `2px solid ${THEME.border}`,
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
                }}
              >
                BOSS
              </Box>
            )}
          </Box>

          {monster?.id ? (
            <SafeImageLoader
              src={activeSrc}
              alt={monster?.name}
              isUnlocked={isUnlocked}
              style={{
                width: "80%",
                height: "80%",
                objectFit: "contain",
                imageRendering: "pixelated",
                filter: !isUnlocked
                  ? "brightness(0) drop-shadow(0 0 5px rgba(255,255,255,0.2))"
                  : "drop-shadow(0 4px 4px rgba(0,0,0,0.5))",
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

          {!isUnlocked && (
            <LockIcon
              sx={{
                position: "absolute",
                color: "rgba(255,255,255,0.3)",
                fontSize: 60,
              }}
            />
          )}
        </Box>
      </Grid>

      <Grid item xs={7}>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            p: 2,
            pl: { xs: 2, sm: 0 },
          }}
        >
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
            <Stack
              direction="row"
              sx={{
                borderBottom: `3px solid ${THEME.border}`,
                background: "#1a120b",
              }}
            >
              {["info", "buff"].map((t) => (
                <Button
                  key={t}
                  onClick={() => {
                    playClickSound();
                    setTab(t);
                  }}
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
            <Box sx={{ flex: 1, overflow: "hidden" }}>
              {tab === "info" && <InfoTab monster={monster} />}
              {tab === "buff" && <BuffTab monster={monster} />}
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

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
};

const ListMonster = ({
  listMonster,
  onSelectMonster,
  selectedMonster,
  playClickSound,
}) => {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -310 : 310,
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
      <Button onClick={() => scroll("left")} sx={arrowBtnStyle}>
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
        }}
      >
        {listMonster.map((m) => {
          const isActive = selectedMonster?.id === m.id;
          const isUnlocked = m.isUnlocked;
          return (
            <Box
              key={m.id}
              onClick={() => {
                playClickSound();
                onSelectMonster(m);
              }}
              sx={{
                flexShrink: 0,
                width: { xs: 45, sm: 50 },
                height: { xs: 45, sm: 50 },
                border: `2px solid ${isActive ? (isUnlocked ? THEME.accent : "#888") : isUnlocked ? THEME.border : "#333"}`,
                backgroundColor: isActive
                  ? isUnlocked
                    ? THEME.bgMain
                    : "#222"
                  : isUnlocked
                    ? THEME.bgPanel
                    : "#111",
                borderRadius: "4px",
                boxShadow: isActive
                  ? `0 0 15px ${isUnlocked ? THEME.accent : "rgba(255,255,255,0.2)"}`
                  : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                "&:hover": { transform: "scale(1.1)", zIndex: 1 },
              }}
            >
              <SafeImageLoader
                src={LoadImage("img_monster", m.id, 1)}
                alt={m.name}
                isUnlocked={isUnlocked}
                style={{
                  height: "40px",
                  imageRendering: "pixelated",
                  filter: !isUnlocked
                    ? "brightness(0) drop-shadow(0 0 2px rgba(255,255,255,0.2))"
                    : "none",
                }}
              />
              {!isUnlocked && (
                <LockIcon
                  sx={{
                    position: "absolute",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 16,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
      <Button onClick={() => scroll("right")} sx={arrowBtnStyle}>
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
  const playClickSound = useGameSfx(clickSFX);
  const playMouseReleaseSound = useGameSfx(clickMouseSFX);

  useEffect(() => {
    if (currentUser?.stages) {
      const completedStages = currentUser.stages.filter(
        (s) => s.is_completed === true,
      );
      fetchUnlockedMonsters(completedStages);
    }
  }, [currentUser, fetchUnlockedMonsters]);

  const sortedMonsters = useMemo(() => {
    if (!monsters) return [];
    return [...monsters]
      .sort((a, b) => a.no - b.no)
      .map((m) => ({ ...m, isUnlocked: unlockedMonsterIds.includes(m.id) }));
  }, [monsters, unlockedMonsterIds]);

  useEffect(() => {
    if (sortedMonsters?.length && !selectedMonster) {
      setSelectedMonster(sortedMonsters[0]);
    }
  }, [sortedMonsters, selectedMonster]);

  const currentActiveMonster = useMemo(() => {
    if (!selectedMonster || !sortedMonsters.length) return selectedMonster;
    return (
      sortedMonsters.find((m) => m.id === selectedMonster.id) || selectedMonster
    );
  }, [selectedMonster, sortedMonsters]);

  return (
    <Box sx={{ m: 2 }}>
      <MotionBox
        initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        sx={{
          position: "fixed",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `linear-gradient(${THEME.bgMain}, #1a120b)`,
          border: `8px solid ${THEME.border}`,
          borderRadius: "12px",
          boxShadow: `0 0 0 4px #1a120b, 0 20px 60px rgba(49, 49, 49, 0.8)`,
          width: { xs: "90%", sm: "80%", md: "80%", lg: "70%" },
          height: "565px",
          p: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
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

        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ flex: 1, mb: 1 }}>
            <DetailMonster
              monster={currentActiveMonster}
              playClickSound={playMouseReleaseSound}
            />
          </Box>
          <Box sx={{ height: "80px", px: 2, mb: 1 }}>
            <ListMonster
              listMonster={sortedMonsters}
              selectedMonster={currentActiveMonster}
              onSelectMonster={setSelectedMonster}
              playClickSound={playClickSound}
            />
          </Box>
        </Box>
      </MotionBox>
    </Box>
  );
};

export default MonsterLibrary;
