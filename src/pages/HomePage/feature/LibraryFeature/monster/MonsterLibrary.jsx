import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  Typography,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "../../../../../components/Loading/LoadingPage";
import { useData } from "../../../hook/useData";
import { useIdleFrame } from "../../../hook/useIdleFrame";
import {
  usePreloadFrames,
  LoadImage,
  preloadImageAsync,
} from "../../../hook/usePreloadFrams";
const MotionBox = motion(Box);
// --- NEW THEME CONFIG (Dark Magical Wood) ---
const THEME = {
  bgMain: "#2b1d14", // พื้นหลังหลัก
  bgPanel: "#3e2723", // พื้นหลัง Panel ข้อมูล
  border: "#5a3e2b", // ขอบทองแดง
  accent: "#ffecb3", // สีทอง (Text/Active)
  textMain: "#d7ccc8", // สีตัวหนังสือ
  textDark: "#1a120b", // สีตัวหนังสือบนพื้นสว่าง
  magic: "#00bcd4", // สีฟ้าเวทมนตร์
  shadow: "#1a120b", // สีเงา
};

const PAGE_SIZE = 15;
const name = "img_monster";

// --- COMPONENTS ---

// 1. กล่อง Text สำหรับ HP / ATK (ธีมมืด)
const StatTextBox = ({ label, value }) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
    <Typography
      sx={{
        fontFamily: "'Press Start 2P'",
        fontSize: 10,
        color: THEME.accent, // Label สีทอง
        width: "130px",
        flexShrink: 0,
        textShadow: `1px 1px 0 ${THEME.shadow}`,
      }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        flex: 1,
        backgroundColor: "#1a120b", // พื้นหลังกล่องดำ
        color: THEME.accent, // ตัวเลขสีทอง
        border: `2px solid ${THEME.border}`,
        borderRadius: "4px",
        py: 0.5,
        px: 2,
        textAlign: "center",
        boxShadow: "inset 0 2px 5px rgba(0,0,0,0.8)",
        fontFamily: "'Press Start 2P'",
        fontSize: 10,
      }}
    >
      {value}
    </Box>
  </Box>
);

// 2. หลอด Bar สำหรับ EXP / SPEED (ธีมเวทมนตร์)
const StatBarBox = ({ label, value, max = 20 }) => {
  const percent = Math.min(100, (value / max) * 100);

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: 10,
          color: THEME.accent,
          width: "80px",
          flexShrink: 0,
          textShadow: `1px 1px 0 ${THEME.shadow}`,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          flex: 1,
          height: 16,
          backgroundColor: "#1a120b", // พื้นหลังหลอดดำ
          border: `2px solid ${THEME.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "inset 0 2px 5px rgba(0,0,0,1)",
        }}
      >
        <Box
          sx={{
            width: `${percent}%`,
            height: "100%",
            // หลอดสีฟ้าเวทมนตร์เรืองแสง
            background: `linear-gradient(90deg, ${THEME.magic}, #4dd0e1)`,
            boxShadow: `0 0 10px ${THEME.magic}`,
          }}
        />
        <Typography
          sx={{
            position: "absolute",
            width: "100%",
            textAlign: "center",
            top: 0,
            fontSize: 8,
            fontFamily: "'Press Start 2P'",
            color: "#fff",
            lineHeight: "14px",
            textShadow: "1px 1px 0 #000",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

// 3. Info Tab Content
const InfoTab = ({ monster }) => {
  // between coin drop
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
            color: THEME.accent, // ชื่อสีทอง
            mb: 1,
            textTransform: "uppercase",
            textShadow: `2px 2px 0 ${THEME.shadow}`,
          }}
        >
          {monster?.name || "Unknown"}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: THEME.textMain, // คำอธิบายสีครีม
            lineHeight: 1.6,
          }}
        >
          {monster?.description ||
            "No description available for this creature."}
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <StatTextBox label="HP" value={monster?.max_hp || 0} />
        <StatTextBox
          label="ATK"
          value={`${monster?.atk_power_min || 0} - ${monster?.atk_power_max || 0}`}
        />
        <StatTextBox label="SPEED" value={monster?.speed || 0} />
        <Divider sx={{ my: 2, borderColor: THEME.border, opacity: 0.9 }} />
        {/* <StatBarBox label="EXP" value={monster?.exp || 0} max={100} /> */}
        {/* <StatBarBox label="SPEED" value={monster?.speed || 0} max={20} /> */}
        <Box sx={{ mt: 3 }}>
          <StatTextBox
            label="COIN DROP"
            value={`${minCoin || 0} - ${maxCoin || 0}`}
          />
        </Box>
      </Box>
    </Box>
  );
};

// 4. Moves Tab Content
const MovesTab = ({ moves }) => {
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
              color: THEME.magic, // หัวข้อ Pattern สีฟ้า
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
                      fontSize: 9,
                      height: 24,
                      backgroundColor: THEME.bgMain, // Chip สีเข้ม
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
  const [tab, setTab] = useState("info");

  const frames = usePreloadFrames(name, monster?.id, 2);
  const frame = useIdleFrame(frames.length, 450);

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
            // กรอบรูปสีเข้ม มีแสงเรือง
            backgroundColor: "#1a120b",
            border: `4px solid ${THEME.border}`,
            borderRadius: "8px",
            boxShadow: `6px 6px 0 ${THEME.shadow}, 0 0 20px rgba(0,188,212,0.2)`,
            width: "100%",
            height: "100%",
            maxHeight: "350px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // พื้นหลังแสงเวทมนตร์หลังมอนสเตอร์
            backgroundImage: `radial-gradient(circle, rgba(0,188,212,0.1) 0%, rgba(0,0,0,0) 70%)`,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: THEME.bgMain,
              color: THEME.accent,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontFamily: "'Press Start 2P'",
              fontSize: 10,
              border: `2px solid ${THEME.border}`,
            }}
          >
            #{monster?.id}
          </Box>

          {frames.length > 0 ? (
            <img
              src={frames[frame - 1].src}
              alt={monster?.name}
              style={{
                width: "80%",
                height: "80%",
                objectFit: "contain",
                imageRendering: "pixelated",
                filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.5))",
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
              backgroundColor: THEME.bgPanel, // พื้นหลัง Panel สีน้ำตาลเข้ม
              border: `3px solid ${THEME.border}`,
              borderRadius: "8px",
              boxShadow: `inset 0 0 20px rgba(0,0,0,0.5)`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              width: "100%",
              height: "100%", // เต็มพื้นที่
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
                    // Active Tab สีทอง, Inactive สีเข้ม
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
              {tab === "moves" && <MovesTab moves={monster?.monster_moves} />}
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

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
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = listMonster.length;
  const hasPagination = total > PAGE_SIZE;
  const maxPage = hasPagination ? Math.ceil(total / PAGE_SIZE) - 1 : 0;
  const visibleMonsters = hasPagination
    ? listMonster.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
    : listMonster;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        py: 1,
        px: 0.5,
        gap: 2,
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: "8px",
        border: `2px solid ${THEME.border}`,
      }}
    >
      <Button
        disabled={!hasPagination || page === 0}
        onClick={() => {
          setDirection(-1);
          setPage((p) => Math.max(p - 1, 0));
        }}
        sx={arrowBtnStyle}
      >
        ◀
      </Button>

      <Box sx={{ flex: 1, overflow: "hidden", height: 60 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ x: direction === 1 ? 50 : -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === 1 ? -50 : 50, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "start",
              alignItems: "center",
              height: "100%",
            }}
          >
            {visibleMonsters.map((m) => {
              const isActive = selectedMonster?.id === m.id;
              return (
                <Box
                  key={m.id}
                  onClick={() => onSelectMonster(m)}
                  sx={{
                    width: 50,
                    height: 50,
                    // Active: ขอบทอง+มีแสง, Inactive: ขอบเข้ม
                    border: `2px solid ${isActive ? THEME.accent : THEME.border}`,
                    backgroundColor: isActive ? THEME.bgMain : THEME.bgPanel,
                    borderRadius: "4px",
                    boxShadow: isActive ? `0 0 15px ${THEME.accent}` : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "scale(1.1)",
                      borderColor: THEME.accent,
                    },
                  }}
                >
                  <img
                    src={LoadImage(name, m.id, 1)}
                    alt={m.name}
                    style={{ height: "40px", imageRendering: "pixelated" }}
                    onError={(e) => {
                      e.currentTarget.src = "/fallback/unknown-monster.png";
                    }}
                  />
                </Box>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Button
        disabled={!hasPagination || page === maxPage}
        onClick={() => {
          setDirection(1);
          setPage((p) => Math.min(p + 1, maxPage));
        }}
        sx={arrowBtnStyle}
      >
        ▶
      </Button>
    </Box>
  );
};

// --- MAIN PAGE ---

const MonsterLibrary = () => {
  const { monsters, getMonsters, monsterState } = useData();
  const navigate = useNavigate();
  const [selectedMonster, setSelectedMonster] = useState(null);

  const [isMinLoading, setIsMinLoading] = useState(true);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);

  useEffect(() => {
    getMonsters();
  }, [getMonsters]);

  useEffect(() => {
    if (monsters?.length && !selectedMonster) {
      setSelectedMonster(monsters[0]);
    }
  }, [monsters, selectedMonster]);

  // preload image monster
  useEffect(() => {
    if (!monsters || monsters.length === 0) return;

    const preloadAssets = async () => {
      setIsLoadingAssets(true);

      const tasks = monsters.map((m) =>
        preloadImageAsync(LoadImage("img_monster", m.id, 1)),
      );

      await Promise.all(tasks);
      setIsLoadingAssets(false);
    };

    preloadAssets();
  }, [monsters]);

  if (monsterState === "LOADING" || isLoadingAssets ) {
    return <LoadingScreen open={true} />;
  }

  return (
    <Box sx={{ m: 2 }}>
      {/* <StarBackground /> */}

      <MotionBox
        initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
        transition={{ duration: 0.5, type: "spring" }}
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
          height: "550px",
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
            <DetailMonster monster={selectedMonster} />
          </Box>

          {/* Footer List */}
          <Box sx={{ height: "80px", px: 2, mb: 1 }}>
            <ListMonster
              listMonster={monsters}
              selectedMonster={selectedMonster}
              onSelectMonster={setSelectedMonster}
            />
          </Box>
        </Box>
      </MotionBox>
    </Box>
  );
};

export default MonsterLibrary;
