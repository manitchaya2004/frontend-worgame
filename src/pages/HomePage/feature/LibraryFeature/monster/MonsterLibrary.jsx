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
    <Box
      sx={{
        m: 2,
        height: "-webkit-fill-available",
        overflowY: "auto",
        pr: 1,
        // เพิ่มเฉพาะจอใหญ่
        "@media (min-width: 1800px)": {
          height: "100%",
          display: "flex",
          flexDirection: "column",
        },
        // ปรับสำหรับ Mobile Landscape
        "@media (orientation: landscape) and (max-height: 450px)": {
          m: 0.5,
          pr: 0.5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          borderBottom: `2px dashed ${THEME.border}`,
          pb: 2,
          // ปรับ Padding ด้านล่างสำหรับ Mobile Landscape
          "@media (orientation: landscape) and (max-height: 450px)": {
            pb: 0.5,
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: { xs: 10, xl: 14 },
            color: isUnlocked ? THEME.accent : "#777",
            mb: 0.5,
            textTransform: "uppercase",
            textShadow: `2px 2px 0 ${THEME.shadow}`,
            // ย่อฟอนต์ใน Mobile Landscape
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 8,
              mb: 0.2,
            },
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
            // ลด Margin Top ใน Mobile Landscape
            "@media (orientation: landscape) and (max-height: 450px)": {
              mt: 0.2,
            },
          }}
        >
          {isUnlocked ? (
            <Typography
              sx={{
                fontFamily: "'Verdana', sans-serif",
                fontSize: { xs: 9, md: 11, xl: 13 },
                color: "#d7ccc8",
                lineHeight: 1.2,
                textAlign: "center",
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 7,
                },
              }}
            >
              {monster?.description || "No description available."}
            </Typography>
          ) : (
            <Typography
              sx={{
                fontFamily: "'Verdana', sans-serif",
                fontSize: { xs: 9, md: 11, xl: 15 },
                color: "#d7ccc8",
                lineHeight: 1.2,
                textAlign: "center",
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 7,
                },
              }}
            >
              No description available
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 1,

          // เพิ่มระยะห่างเฉพาะจอใหญ่
          "@media (min-width: 1800px)": {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 1,
          },
          // ใช้ Flex จัดการช่องว่างอัตโนมัติใน Mobile Landscape
          "@media (orientation: landscape) and (max-height: 450px)": {
            my: 0.8,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly", // ให้ห่างเท่าๆ กัน
            gap: 0,
          },
          // "@media (min-width:1200px)": {
          //   display: "flex",
          //   flexDirection: "column",
          //   gap:1
          // },
        }}
      >
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
        <Divider
          sx={{
            my: 2,
            borderColor: THEME.border,
            opacity: 0.9,
            // ลดความห่างเส้นแบ่งใน Mobile Landscape
            "@media (orientation: landscape) and (max-height: 450px)": {
              my: 0.2,
            },
          }}
        />
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
        <LockIcon
          sx={{
            fontSize: 40,
            color: "#555",
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 24,
            },
          }}
        />
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: "#777",
            lineHeight: 1.5,
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 7,
            },
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
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          "@media (orientation: landscape) and (max-height: 450px)": { p: 1 },
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: THEME.textMain,
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 7,
            },
          }}
        >
          No buff found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        m: 2,
        height: "100%",
        overflowY: "auto",
        pr: 1,
        "@media (orientation: landscape) and (max-height: 450px)": { m: 1 },
      }}
    >
      {/* 💡 เปลี่ยนจาก Stack เป็น Grid เพื่อให้แสดง 2 คอลัมน์ */}
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
                    width: 14,
                    height: 14,
                    fontSize: 7,
                    justifyContent: "center",
                    border: "0.5px solid #fff",
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
        size={{ xs: 5, sm: 5 }}
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          // ลด Padding ลงใน Mobile Landscape
          "@media (orientation: landscape) and (max-height: 450px)": {
            p: 0.5,
          },
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `radial-gradient(circle, ${bgGradient} 0%, rgba(0,0,0,0) 70%)`,
            position: "relative",
            // ให้ยืดหยุ่นตามความสูงใน Mobile Landscape
            "@media (orientation: landscape) and (max-height: 450px)": {
              height: "100%", // ใช้พื้นที่ 100% ของ Grid
              border: `2px solid ${borderColor}`,
              borderRadius: "4px",
              boxShadow: !isUnlocked
                ? "none"
                : `3px 3px 0 ${THEME.shadow}, 0 0 20px ${glowColor}`,
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              display: "flex",
              gap: 1,
              "@media (orientation: landscape) and (max-height: 450px)": {
                top: 4,
                left: 4,
                gap: 0.5,
              },
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
                border: `2px solid ${!isUnlocked ? "#222" : THEME.border}`,
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 6,
                  px: 0.5,
                  py: 0.2,
                  border: `1px solid ${!isUnlocked ? "#222" : THEME.border}`,
                },
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
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: 6,
                    px: 0.5,
                    py: 0.2,
                    border: `1px solid #800000`,
                  },
                }}
              >
                BOSS
              </Box>
            )}
          </Box>

          {monster?.id ? (
            <img
              key={monster?.id}
              src={activeSrc}
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

          {!isUnlocked && (
            <LockIcon
              sx={{
                position: "absolute",
                color: "rgba(255,255,255,0.3)",
                fontSize: 60,
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 30,
                },
              }}
            />
          )}
        </Box>
      </Grid>

      <Grid size={{ xs: 7, sm: 7 }}>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 2,
            pl: { xs: 2, sm: 0 },
            "@media (orientation: landscape) and (max-height: 450px)": {
              p: 0.5,
              pl: 0,
            },
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
              height: { xs: "100px", sm: "150px", md: "250px", xl: "100%" },
              // ให้ยืดหยุ่นใน Mobile Landscape
              "@media (orientation: landscape) and (max-height: 450px)": {
                height: "100%",
                border: `2px solid ${THEME.border}`,
                borderRadius: "4px",
              },
            }}
          >
            <Stack
              direction="row"
              sx={{
                borderBottom: `3px solid ${THEME.border}`,
                background: "#1a120b",
                "@media (orientation: landscape) and (max-height: 450px)": {
                  borderBottom: `1px solid ${THEME.border}`,
                },
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
                    // ย่อขนาดและ Padding แถบ Tab
                    "@media (orientation: landscape) and (max-height: 450px)": {
                      fontSize: 7,
                      py: 0.5,
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
  "&:disabled": { opacity: 0.5, boxShadow: "none", cursor: "not-allowed" },
  // ย่อปุ่มลูกศรใน Mobile Landscape
  "@media (orientation: landscape) and (max-height: 450px)": {
    minWidth: 24,
    height: 24,
    mx: 0.5,
    fontSize: 10,
    border: `1px solid ${THEME.border}`,
    boxShadow: `1px 1px 0 ${THEME.shadow}`,
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
        // ย่อ Padding ใน Mobile Landscape
        "@media (orientation: landscape) and (max-height: 450px)": {
          py: 1,
          px: 0.2,
          gap: 0.5,
          border: `1px solid ${THEME.border}`,
          borderRadius: "4px",
        },
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
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          // ลดความสูงแถบ Scroll Box ลง
          "@media (orientation: landscape) and (max-height: 450px)": {
            height: 35,
            gap: "6px",
          },
        }}
      >
        {listMonster.map((m) => {
          const isActive = selectedMonster?.id === m.id;
          const isUnlocked = m.isUnlocked;
          const isBoss = m.isBoss;

          // จัดการสีกรอบ หากยังไม่ปลดล็อคให้เป็นสีเทาหม่น
          const activeBorderColor = !isUnlocked
            ? "#888"
            : isBoss
              ? "#ff3333"
              : THEME.accent;
          const inactiveBorderColor = !isUnlocked
            ? "#333"
            : isBoss
              ? "#800000"
              : THEME.border;
          const activeShadow = !isUnlocked
            ? "0 0 10px rgba(255,255,255,0.2)"
            : isBoss
              ? `0 0 15px #ff3333`
              : `0 0 15px ${THEME.accent}`;
          const boxBgColor = isActive
            ? !isUnlocked
              ? "#222"
              : THEME.bgMain
            : !isUnlocked
              ? "#111"
              : isBoss
                ? "#2a0a0a"
                : THEME.bgPanel;
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
                // ย่อขนาดกล่องมอนสเตอร์ใน List
                "@media (orientation: landscape) and (max-height: 450px)": {
                  width: 35,
                  height: 35,
                  border: `1px solid ${isActive ? activeBorderColor : inactiveBorderColor}`,
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
                  filter: !isUnlocked
                    ? "brightness(0) drop-shadow(0 0 2px rgba(255,255,255,0.2))"
                    : "none",
                }}
                onError={(e) => {
                  e.currentTarget.src = "/fallback/unknown-monster.png";
                }}
              />
              {!isUnlocked && (
                <LockIcon
                  sx={{
                    position: "absolute",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 16,
                    "@media (orientation: landscape) and (max-height: 450px)": {
                      fontSize: 12,
                    },
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
    <Box sx={{ height: "100vh" }}>
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
          height: { xs: "70%", sm: "70%", md: "570px", xl: "80%" },
          p: 1,
          display: "flex",
          flexDirection: "column",

          "@media (orientation: landscape) and (max-height: 450px)": {
            top: "55%",
            transform: "translate(-50%, -50%)",
            height: "80%",
            border: `4px solid ${THEME.border}`,
            borderRadius: "6px",
          },
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
            "@media (orientation: landscape) and (max-height: 450px)": {
              py: 1, // ลดให้บางที่สุด
              mb: 0.5,
              borderBottom: `2px solid ${THEME.border}`,
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEME.accent,
              fontSize: { xs: 16, md: 24 },
              textShadow: `3px 3px 0 #000, 0 0 10px ${THEME.accent}`,
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 10, // ย่อฟอนต์
                textShadow: `2px 2px 0 #000, 0 0 6px ${THEME.accent}`,
              },
            }}
          >
            MONSTER LIBRARY
          </Typography>
        </Box>

        <Box
          id="Content-Area"
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            // backgroundColor:'white'
            // height:'100%',
            justifyContent: "space-between", // ดันเนื้อหาให้กระจายตัว
            // alignItems:'center'
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              mb: 0.5,
              "@media (orientation: landscape) and (max-height: 450px)": {
                mt: 1,
                flex: 0,
                height: "220px",
              },
            }}
          >
            {/* 💡 ส่ง currentActiveMonster เข้าไปแทน selectedMonster */}
            <DetailMonster
              monster={currentActiveMonster}
              playClickSound={playMouseReleaseSound}
            />
          </Box>

          {/* Footer List */}
          <Box
            sx={{
              px: 2,
              pb: 0.5,
              "@media (orientation: landscape) and (max-height: 450px)": {
                px: 1,
                pb: 0,
              },
            }}
          >
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
