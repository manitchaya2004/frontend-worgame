import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Typography, Stack, Chip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Title } from "../../AdvantureFeature";
import BackArrow from "../../../components/BackArrow";
import StarBackground from "../../../components/StarBackground";
const monsters = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `M${i + 1}`,
}));
const arrowBtnStyle = {
  minWidth: 40,
  height: 40,
  fontSize: 20,
  color: "#fff",
  backgroundColor: "#5a2f1e",
  border: "2px solid #3a1f14",
  boxShadow: "2px 2px 0 #2b140c",
  "&:hover": {
    backgroundColor: "#7a4a34",
  },
  "&:active": {
    boxShadow: "inset 2px 2px 0 #2b140c",
  },
  "&.Mui-disabled": {
    opacity: 0.3,
  },
};

const statusComponnet = (title: string) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 3 }}>
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: "#2b1d14",
          }}
        >
          {title}
        </Typography>
      </Grid>
      <Grid size={{ xs: 9 }}>
        <Box
          sx={{
            height: 14,
            backgroundColor: "#e7dcc8",
            border: "2px solid #2b1d14",
            boxShadow: "inset 2px 2px 0 #c9b89a",
            position: "relative",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: "60%",
              backgroundColor: "#7a4a34",
            }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

const Info = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#fdf8ef",
        border: "3px solid #2b1d14",
        boxShadow: "4px 4px 0 #2b1d14",
        p: 2,
        // height: "100%",
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: 14,
          color: "#2b1d14",
          mb: 1,
        }}
      >
        Monster
      </Typography>

      <Typography
        sx={{
          fontSize: 12,
          color: "#1b1b1b",
          mb: 2,
        }}
      >
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry.
      </Typography>

      <Stack spacing={1}>
        {statusComponnet("ATK")}
        {statusComponnet("RANGE")}
        {statusComponnet("SPEED")}
      </Stack>
    </Box>
  );
};

const Defense = () => {
  return <Box>Defense</Box>;
};
const DetailMonster = () => {
  const [tab, setTab] = useState<"info" | "defense">("info");

  return (
    <Grid container spacing={2} sx={{ height: "100%" }}>
      {/* picture monster */}
      <Grid
        size={{ xs: 12, sm: 5, md: 5, lg: 5 }}
        sx={{
          // border: "1px solid black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fdf8ef",
            border: "4px solid #2b1d14",
            boxShadow: "6px 6px 0 #2b1d14",
            width: "80%",
            height: "90%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          picture monster
        </Box>
      </Grid>

      {/* detail monster */}
      <Grid size={{ xs: 12, sm: 7, md: 7, lg: 7 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            // border: "1px solid black",
            // width: "100%",
          }}
        >
          {/* button tab */}
          {/* <Stack direction="row" spacing={2} sx={{ mt: 1, ml: 2 }}>
            <Chip
              label="Info"
              clickable
              color={tab === "info" ? "primary" : "default"}
              variant={tab === "info" ? "filled" : "outlined"}
              onClick={() => setTab("info")}
            />
            <Chip
              label="Defense"
              clickable
              color={tab === "defense" ? "primary" : "default"}
              variant={tab === "defense" ? "filled" : "outlined"}
              onClick={() => setTab("defense")}
            />
          </Stack> */}
          <Stack direction="row" spacing={1} sx={{ p: 1 }}>
            {["info", "defense"].map((t) => (
              <Button
                key={t}
                onClick={() => setTab(t as any)}
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 10,
                  px: 2,
                  backgroundColor: tab === t ? "#7a4a34" : "#e7dcc8",
                  color: tab === t ? "#fff" : "#2b1d14",
                  border: "2px solid #2b1d14",
                  boxShadow:
                    tab === t ? "inset 2px 2px 0 #2b140c" : "2px 2px 0 #2b1d14",
                  "&:hover": {
                    backgroundColor: "#d6b46a",
                  },
                }}
              >
                {t.toUpperCase()}
              </Button>
            ))}
          </Stack>

          {/* detail */}
          <Box sx={{ flex: 1 }}>
            {tab === "info" && <Info />}
            {tab === "defense" && <Defense />}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

const PAGE_SIZE = 10;

const ListMonster = () => {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const maxPage = Math.ceil(monsters.length / PAGE_SIZE) - 1;

  const visibleMonsters = monsters.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <Box
      sx={{
        // width: "100%",
        height: 64,
        backgroundColor: "#fdf8ef",
        border: "4px solid #2b1d14",
        boxShadow: "4px 4px 0 #2b1d14",
        display: "flex",
        alignItems: "center",
        px: 1,
        overflow: "hidden",
      }}
    >
      {/* ◀ */}
      <Button
        onClick={() => {
          setDirection(-1);
          setPage((p) => Math.max(p - 1, 0));
        }}
        disabled={page === 0}
        sx={arrowBtnStyle}
      >
        ◀
      </Button>

      {/* VIEWPORT */}
      <Box
        sx={{
          flex: 1,
          height: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ x: direction === 1 ? 80 : -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === 1 ? -80 : 80, opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            {visibleMonsters.map((m) => (
              <Box
                key={m.id}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#e7dcc8",
                  border: "2px solid #2b1d14",
                  boxShadow: "2px 2px 0 #2b1d14",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#fff",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    boxShadow: "inset 2px 2px 0 #2b1d14",
                    transform: "translateY(0)",
                  },
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* ▶ */}
      <Button
        onClick={() => {
          setDirection(1);
          setPage((p) => Math.min(p + 1, maxPage));
        }}
        disabled={page === maxPage}
        sx={arrowBtnStyle}
      >
        ▶
      </Button>
    </Box>
  );
};

const MonsterLibrary = () => {
  const MotionBox = motion(Box);
  const navigate = useNavigate();
  return (
    <Box sx={{ m: 2 }}>
      <StarBackground />
      <BackArrow onClick={()=>navigate('/home/library')}/>
      <MotionBox
        initial={
          //   {
          //   opacity: 0,
          //   scale: 0.85,
          //   y: "-45%",
          //   x: "-50%",
          // }
          false
        }
        animate={{
          opacity: 1,
          scale: 1,
          y: "-50%",
          x: "-50%",
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        sx={{
          position: "fixed",
          top: "53%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          paddingTop: 6, // เผื่อหัว
          background: "linear-gradient(#7b4a3b, #5a3328)",
          border: "6px solid #7a1f1f",
          boxShadow: `
    inset 0 0 0 3px #d6b46a,
    0 0 20px rgba(180,40,40,0.5),
    0 20px 40px rgba(0,0,0,0.8)
  `,
          width: { xs: "90vw", sm: "90%", md: "70%" },
          height: "550px",
          padding: 2,
        }}
      >
        {/* <Title title="MONSTER LIBRARY" /> */}
        <Box
          sx={{
            mt: 2,
            mb: 2,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: "#fffbe6",
              fontSize: { xs: 14, md: 28 },
            }}
          >
            Monster Library
          </Typography>
        </Box>{" "}
        {/* Detail Monster */}
        <Box
          sx={{
            width: "100%",
            height: "420px",
            // height: "calc(100% - 60px)",
            // backgroundColor: "pink",
            overflow: "hidden",
            // p: 1,
          }}
        >
          <DetailMonster />
        </Box>
        {/* tab select Monster */}
        <Box sx={{ mt: 1, width: "100%" }}>
          <ListMonster />
        </Box>
      </MotionBox>
    </Box>
  );
};
export default MonsterLibrary;
