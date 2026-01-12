import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Typography, Stack, Chip ,Divider} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Title } from "../../AdvantureFeature";
import BackArrow from "../../../components/BackArrow";
import StarBackground from "../../../components/StarBackground";
import { useData } from "../../../hook/useData";
import { useIdleFrame } from "../../../hook/useIdleFrame";
import { usePreloadFrames , LoadImage } from "../../../hook/usePreloadFrams";
import { THEME } from "../../../hook/const";
// const PAGE_SIZE = 15;
// const name ="img_monster"
// const monsters = Array.from({ length: 50 }, (_, i) => ({
//   id: i + 1,
//   name: `M${i + 1}`,
// }));

// const arrowBtnStyle = {
//   minWidth: 50,
//   height: 50,
//   fontSize: 20,
//   color: "#fff",
//   backgroundColor: "#5a2f1e",
//   border: "2px solid #3a1f14",
//   boxShadow: "2px 2px 0 #2b140c",
//   "&:hover": {
//     backgroundColor: "#7a4a34",
//   },
//   "&:active": {
//     boxShadow: "inset 2px 2px 0 #2b140c",
//   },
//   "&.Mui-disabled": {
//     opacity: 0.3,
//   },
// };

// const statusComponnet = (title) => {
//   return (
//     <Grid container spacing={2} alignItems="center">
//       <Grid size={{ xs: 3 }}>
//         <Typography
//           sx={{
//             fontFamily: "'Press Start 2P'",
//             fontSize: 10,
//             color: "#2b1d14",
//           }}
//         >
//           {title}
//         </Typography>
//       </Grid>
//       <Grid size={{ xs: 9 }}>
//         <Box
//           sx={{
//             height: 14,
//             backgroundColor: "#e7dcc8",
//             border: "2px solid #2b1d14",
//             boxShadow: "inset 2px 2px 0 #c9b89a",
//             position: "relative",
//           }}
//         >
//           <Box
//             sx={{
//               height: "100%",
//               width: "60%",
//               backgroundColor: "#7a4a34",
//             }}
//           />
//         </Box>
//       </Grid>
//     </Grid>
//   );
// };

// const Info = ({ monster }) => {
//   return (
//     <Box sx={{ m: 2 }}>
//       {/* header */}
//       <Box sx={{ mb: 2 }}>
//         <Typography
//           sx={{
//             fontFamily: "'Press Start 2P'",
//             fontSize: 18,
//             color: "#2b1d14",
//             mb: 1,
//           }}
//         >
//           {monster?.name}
//         </Typography>

//         <Typography
//           sx={{
//             fontSize: 12,
//             color: "#1b1b1b",
//             mb: 2,
//             fontFamily: "'Press Start 2P'",
//             fontSize: 14,
//           }}
//         >
//           {monster?.description}
//         </Typography>

//         {/* divider */}
//         <Box
//           sx={{
//             mt: 2,

//             borderBottom: "2px dashed #d6b46a",
//           }}
//         />
//       </Box>

//       <Stack spacing={1}>
//         {statusComponnet("ATK")}
//         {statusComponnet("RANGE")}
//         {statusComponnet("SPEED")}
//       </Stack>
//     </Box>
//   );
// };

// const Defense = () => {
//   return <Box>Defense</Box>;
// };

// const DetailMonster = ({ monster }) => {
//   const [tab, setTab] = useState("info");

//   const frames = usePreloadFrames(name,monster?.id, 2);
//   const frame = useIdleFrame(frames.length, 450);
//   return (
//     <Grid container spacing={2} sx={{ height: "100%" }}>
//       {/* picture monster */}
//       <Grid
//         size={{ xs: 12, sm: 5, md: 5, lg: 5 }}
//         sx={{
//           // border: "1px solid black",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <Box
//           sx={{
//             backgroundColor: "#fdf8ef",
//             border: "4px solid #2b1d14",
//             boxShadow: "6px 6px 0 #2b1d14",
//             width: "90%",
//             height: "90%",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           {frames.length > 0 ? (
//             <img
//               src={frames[frame - 1].src}
//               alt={monster?.name}
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 imageRendering: "pixelated",
//               }}
//               onError={(e) => {
//                 e.currentTarget.src = "/fallback/unknown-monster.png";
//               }}
//             />
//           ) : null}
//         </Box>
//       </Grid>

//       {/* detail monster */}
//       <Grid size={{ xs: 12, sm: 7, md: 7, lg: 7 }}>
//         <Box
//           sx={{
//             // border: "1px solid black",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Box
//             sx={{
//               backgroundColor: "#fdf8ef",
//               border: "3px solid #2b1d14",
//               boxShadow: "4px 4px 0 #2b1d14",
//               p: 2,
//               width: "100%",
//               height: "348px",
//               ml: 1,
//               mr: 2,
//               mt: "20px",
//             }}
//           >
//             <Stack direction="row" spacing={1} sx={{ p: 1 }}>
//               {["info", "defense"].map((t) => (
//                 <Button
//                   key={t}
//                   onClick={() => setTab(t)}
//                   sx={{
//                     fontFamily: "'Press Start 2P'",
//                     fontSize: 9,
//                     px: 2,
//                     backgroundColor: tab === t ? "#7a4a34" : "#e7dcc8",
//                     color: tab === t ? "#fff" : "#2b1d14",
//                     border: "2px solid #2b1d14",
//                     boxShadow:
//                       tab === t
//                         ? "inset 2px 2px 0 #2b140c"
//                         : "2px 2px 0 #2b1d14",
//                     "&:hover": {
//                       backgroundColor: "#d6b46a",
//                     },
//                   }}
//                 >
//                   {t.toUpperCase()}
//                 </Button>
//               ))}
//             </Stack>

//             {/* detail */}
//             <Box sx={{ flex: 1 }}>
//               {tab === "info" && <Info monster={monster} />}
//               {tab === "defense" && <Defense />}
//             </Box>
//           </Box>
//         </Box>
//       </Grid>
//     </Grid>
//   );
// };

// const ListMonster = ({ listMonster, onSelectMonster, selectedMonster }) => {
//   const [page, setPage] = useState(0);
//   const [direction, setDirection] = useState(1);

//   const total = listMonster.length;
//   const hasPagination = total > PAGE_SIZE;

//   const maxPage = hasPagination ? Math.ceil(total / PAGE_SIZE) - 1 : 0;

//   const visibleMonsters = hasPagination
//     ? listMonster.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
//     : listMonster;

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         height: "100%",
//         // backgroundColor: "#fdf8ef",
//         // border: "4px solid #2b1d14",
//         // boxShadow: "4px 4px 0 #2b1d14",
//         display: "flex",
//         alignItems: "center",
//         p: 1,
//         overflow: "hidden",
//         gap: 1,
//         justifyContent: "space-between",
//       }}
//     >
//       {/* ◀ */}
//       <Button
//         disabled={!hasPagination || page === 0}
//         onClick={() => {
//           setDirection(-1);
//           setPage((p) => Math.max(p - 1, 0));
//         }}
//         sx={arrowBtnStyle}
//       >
//         ◀
//       </Button>

//       {/* VIEWPORT */}
//       <Box
//         sx={{
//           // flex: 1,
//           display: "flex",
//           justifyContent: "flex-start",
//           width: "100%",
//           height: "100%",
//           overflow: "hidden",
//           position: "relative",
//         }}
//       >
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={page}
//             initial={{ x: direction === 1 ? 80 : -80, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: direction === 1 ? -80 : 80, opacity: 0 }}
//             transition={{
//               duration: 0.25,
//               ease: "easeOut",
//             }}
//             style={{
//               display: "flex",
//               gap: 8,
//               justifyContent: "center",
//               alignItems: "center",
//               height: "100%",
//             }}
//           >
//             {visibleMonsters.map((m) => {
//               const isActive = selectedMonster?.id === m.id;
//               return (
//                 <Box
//                   key={m.id}
//                   onClick={() => onSelectMonster(m)}
//                   sx={{
//                     width: 50,
//                     height: 50,
//                     border: "2px solid #2b1d14",
//                     backgroundColor: isActive ? "#7a4a34" : "#e7dcc8",
//                     boxShadow: isActive
//                       ? "inset 2px 2px 0 #2b140c"
//                       : "2px 2px 0 #2b1d14",
//                     cursor: "pointer",
//                   }}
//                 >
//                   <img
//                     src={LoadImage(name,m.id, 1)}
//                     alt={m.name}
//                     style={{ height: "50px" }}
//                   />
//                 </Box>
//               );
//             })}
//           </motion.div>
//         </AnimatePresence>
//       </Box>

//       {/* ▶ */}
//       <Button
//         disabled={!hasPagination || page === maxPage}
//         onClick={() => {
//           setDirection(1);
//           setPage((p) => Math.min(p + 1, maxPage));
//         }}
//         sx={arrowBtnStyle}
//       >
//         ▶
//       </Button>
//     </Box>
//   );
// };

// const MonsterLibrary = () => {
//   const { monsters, monsterState, getMonsters, clearMonster } = useData();

//   console.log(monsters);
//   const MotionBox = motion(Box);
//   const navigate = useNavigate();

//   const [selectedMonster, setSelectedMonster] = useState(null);

//   //Load monster
//   useEffect(() => {
//     getMonsters();
//   }, [getMonsters]);

//   // 👉 default เป็นตัวแรก
//   useEffect(() => {
//     if (monsters?.length && !selectedMonster) {
//       setSelectedMonster(monsters[0]);
//     }
//   }, [monsters, selectedMonster]);

//   return (
//     <Box sx={{ m: 2 }}>
//       <StarBackground />
//       <BackArrow onClick={() => navigate("/home/library")} />
//       <MotionBox
//         initial={false}
//         animate={{
//           opacity: 1,
//           scale: 1,
//           y: "-50%",
//           x: "-50%",
//         }}
//         transition={{
//           duration: 0.6,
//           ease: "easeOut",
//         }}
//         sx={{
//           position: "fixed",
//           top: "53%",
//           left: "50%",
//           transform: "translate(-50%, -50%)",
//           paddingTop: 6, // เผื่อหัว
//           background: "linear-gradient(#7b4a3b, #5a3328)",
//           border: "6px solid #7a1f1f",
//           boxShadow: `
//     inset 0 0 0 3px #d6b46a,
//     0 0 20px rgba(180,40,40,0.5),
//     0 20px 40px rgba(0,0,0,0.8)
//   `,
//           width: { xs: "90vw", sm: "90%", md: "70%" },
//           // height: "550px",
//           padding: 2,
//         }}
//       >
//         {/* <Title title="MONSTER LIBRARY" /> */}
//         <Box
//           sx={{
//             mt: 2,
//             mb: 2,
//             width: "100%",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <Typography
//             sx={{
//               fontFamily: "'Press Start 2P'",
//               color: "#fffbe6",
//               fontSize: { xs: 14, md: 28 },
//             }}
//           >
//             Monster Library
//           </Typography>
//         </Box>{" "}
//         {/* Detail Monster */}
//         <Box
//           sx={{
//             width: "100%",
//             height: "420px",
//             justifyContent: "center",
//             alignItems: "center",
//             // height: "calc(100% - 60px)",
//             // backgroundColor: "pink",
//             overflow: "hidden",
//             // p: 1,
//           }}
//         >
//           <DetailMonster monster={selectedMonster} />
//         </Box>
//         {/* tab select Monster */}
//         <Box
//           sx={{
//             mt: 1,
//             width: "100%",
//             justifyContent: "center",
//             display: "flex",
//           }}
//         >
//           <ListMonster
//             listMonster={monsters}
//             selectedMonster={selectedMonster}
//             onSelectMonster={setSelectedMonster}
//           />
//         </Box>
//       </MotionBox>
//     </Box>
//   );
// };
// export default MonsterLibrary;
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Box, Button, Grid, Typography, Stack, Divider, Chip } from "@mui/material";
// import { motion, AnimatePresence } from "framer-motion";
// import BackArrow from "../../../components/BackArrow"; // เช็ค Path อีกทีนะครับ
// import StarBackground from "../../../components/StarBackground"; // เช็ค Path อีกทีนะครับ
// import { useData } from "../../../hook/useData";
// import { useIdleFrame } from "../../../hook/useIdleFrame";
// import { usePreloadFrames, LoadImage } from "../../../hook/usePreloadFrams";



const PAGE_SIZE = 15;
const name = "img_monster";

// --- COMPONENTS ---

// 1. กล่อง Text สำหรับ HP / ATK
const StatTextBox = ({ label, value }) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
    <Typography
      sx={{
        fontFamily: "'Press Start 2P'",
        fontSize: 10,
        color: THEME.brownDark,
        width: "80px", // Fixed width for label
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        flex: 1,
        backgroundColor: THEME.brownDark, // กล่องสีเข้ม
        color: THEME.textLight,           // ตัวหนังสือสีสว่าง
        border: `2px solid ${THEME.brownLight}`,
        borderRadius: "4px",
        py: 0.5,
        px: 2,
        textAlign: "center",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
        fontFamily: "'Press Start 2P'",
        fontSize: 10,
      }}
    >
      {value}
    </Box>
  </Box>
);

// 2. หลอด Bar สำหรับ EXP / SPEED
const StatBarBox = ({ label, value, max = 20 }) => { // สมมติ max bar เป็น 20 ช่อง หรือ 100%
  // คำนวณ % ความยาวหลอด (ปรับ logic ได้ตาม data จริง)
  const percent = Math.min(100, (value / max) * 100); 
  
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: 10,
          color: THEME.brownDark,
          width: "80px",
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          flex: 1,
          height: 16,
          backgroundColor: "#bcaaa4", // สีพื้นหลังหลอด (เทาอมน้ำตาล)
          border: `2px solid ${THEME.brownDark}`,
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
            sx={{
                width: `${percent}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${THEME.navyLight}, ${THEME.navy})`, // ไล่สีน้ำเงิน
                boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.3)"
            }}
        />
        {/* ตัวเลขบนหลอด (Optional) */}
        <Typography sx={{
            position: 'absolute', width: '100%', textAlign: 'center', top: 0, 
            fontSize: 8, fontFamily: "'Press Start 2P'", color: '#fff', lineHeight: '14px', textShadow: '1px 1px 0 #000'
        }}>
            {value}
        </Typography>
      </Box>
    </Box>
  );
};

// 3. Info Tab Content
const InfoTab = ({ monster }) => {
  return (
    <Box sx={{ m: 2, height: '100%', overflowY: 'auto', pr: 1 }}>
      {/* Header Name & Desc */}
      <Box sx={{ mb: 2, textAlign: 'center', borderBottom: `2px dashed ${THEME.brownDark}`, pb: 2 }}>
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 16,
            color: THEME.brownDark,
            mb: 1,
            textTransform: 'uppercase'
          }}
        >
          {monster?.name || "Unknown"}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
            color: "#5d4037",
            lineHeight: 1.6,
          }}
        >
          {monster?.description || "No description available for this creature."}
        </Typography>
      </Box>

      {/* Stats Section */}
      <Box sx={{ mt: 3 }}>
        {/* Group 1: Text Boxes */}
        <StatTextBox label="HP" value={monster?.max_hp || 0} />
        <StatTextBox 
            label="ATK" 
            value={`${monster?.atk_power_min || 0} - ${monster?.atk_power_max || 0}`} 
        />

        <Divider sx={{ my: 2, borderColor: THEME.brownDark, opacity: 0.3 }} />

        {/* Group 2: Bars */}
        <StatBarBox label="EXP" value={monster?.exp || 0} max={100} />
        <StatBarBox label="SPEED" value={monster?.speed || 0} max={20} />
      </Box>
    </Box>
  );
};

// 4. Moves Tab Content (New!)
const MovesTab = ({ moves }) => {
    if (!moves || moves.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography sx={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: THEME.brownDark }}>
                    No move patterns found.
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ m: 2, overflowY: 'auto', height: '280px', pr: 1 }}>
            {moves.map((pattern, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                    <Typography sx={{ 
                        fontFamily: "'Press Start 2P'", 
                        fontSize: 10, 
                        color: THEME.navy, 
                        mb: 1, 
                        borderBottom: `2px solid ${THEME.brownDark}`,
                        display: 'inline-block'
                    }}>
                        PATTERN {pattern.pattern_no}
                    </Typography>
                    
                    {/* Move Sequence Flow */}
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        {pattern.moves
                            .sort((a, b) => a.pattern_order - b.pattern_order)
                            .map((move, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
                                {/* Move Box */}
                                <Chip 
                                    label={`${move.pattern_order}. ${move.pattern_move}`}
                                    sx={{
                                        fontFamily: "'Press Start 2P'",
                                        fontSize: 9,
                                        height: 24,
                                        backgroundColor: THEME.brownLight,
                                        color: '#fff',
                                        borderRadius: '4px',
                                        border: '1px solid #000',
                                        '& .MuiChip-label': { px: 1 }
                                    }}
                                />
                                {/* Arrow (ยกเว้นตัวสุดท้าย) */}
                                {i < pattern.moves.length - 1 && (
                                    <Typography sx={{ mx: 0.5, color: THEME.brownDark, fontWeight: 'bold' }}>
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
  const [tab, setTab] = useState("info"); // 'info' | 'moves'

  const frames = usePreloadFrames(name, monster?.id, 2);
  const frame = useIdleFrame(frames.length, 450);

  return (
    <Grid container spacing={0} sx={{ height: "100%" }}>
      {/* LEFT: Picture Monster */}
      <Grid
        size={{ xs: 12, sm: 5 }}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff", // พื้นหลังรูปขาว/ครีมอ่อนสุด
            border: `4px solid ${THEME.brownDark}`,
            borderRadius: "8px",
            boxShadow: `6px 6px 0 ${THEME.brownDark}`,
            width: "100%",
            height: "100%", // เต็มพื้นที่
            maxHeight: "350px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: "radial-gradient(#d7ccc8 10%, transparent 11%), radial-gradient(#d7ccc8 10%, transparent 11%)",
            backgroundSize: "20px 20px",
            position: 'relative'
          }}
        >
             {/* ID Badge */}
             <Box sx={{
                 position: 'absolute', top: 8, left: 8, 
                 bgcolor: THEME.navy, color: '#fff', 
                 px: 1, py: 0.5, borderRadius: 1, 
                 fontFamily: "'Press Start 2P'", fontSize: 10,
                 border: '2px solid #fff'
             }}>
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
                filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.3))"
              }}
              onError={(e) => {
                e.currentTarget.src = "/fallback/unknown-monster.png";
              }}
            />
          ) : (
             <Typography sx={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: '#aaa' }}>No Image</Typography>
          )}
        </Box>
      </Grid>

      {/* RIGHT: Details & Tabs */}
      <Grid size={{ xs: 12, sm: 7 }}>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            p: 2,
            pl: { xs: 2, sm: 0 }, // ลด padding ซ้ายในจอกว้าง
          }}
        >
          {/* Main Card */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: THEME.cream,
              border: `3px solid ${THEME.brownDark}`,
              borderRadius: "8px",
              boxShadow: `inset 0 0 20px ${THEME.creamDark}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Tab Header */}
            <Stack direction="row" sx={{ borderBottom: `3px solid ${THEME.brownDark}` }}>
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
                    backgroundColor: tab === t ? THEME.brownDark : THEME.creamDark,
                    color: tab === t ? "#fff" : THEME.brownDark,
                    "&:hover": {
                      backgroundColor: tab === t ? THEME.brownDark : "#dccbb5",
                    },
                  }}
                >
                  {t.toUpperCase()}
                </Button>
              ))}
            </Stack>

            {/* Tab Content */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
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
  minWidth: 40,
  height: 40,
  fontSize: 16,
  color: THEME.cream,
  backgroundColor: THEME.brownLight,
  border: `2px solid ${THEME.brownDark}`,
  boxShadow: `2px 2px 0 ${THEME.brownDark}`,
  "&:hover": { backgroundColor: "#7a4a34" },
  "&:active": { boxShadow: "inset 2px 2px 0 #2b140c", transform: 'translate(2px, 2px)' },
  "&:disabled": { opacity: 0.5, boxShadow: 'none', cursor: 'not-allowed' },
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
        p: 1.5,
        gap: 2,
        backgroundColor: "rgba(0,0,0,0.2)", // พื้นหลังจางๆ รองรับ List
        borderRadius: "8px",
        border: `2px solid ${THEME.brownDark}`
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
              justifyContent: "center",
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
                    border: `2px solid ${isActive ? '#fff' : THEME.brownDark}`, // Active สีขาวให้เด่น
                    backgroundColor: isActive ? THEME.navy : THEME.cream,
                    borderRadius: '4px',
                    boxShadow: isActive ? `0 0 10px ${THEME.navy}` : "none",
                    cursor: "pointer",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    "&:hover": { transform: 'scale(1.1)' }
                  }}
                >
                  <img
                    src={LoadImage(name, m.id, 1)}
                    alt={m.name}
                    style={{ height: "40px", imageRendering: 'pixelated' }}
                    onError={(e) => { e.currentTarget.src = "/fallback/unknown-monster.png"; }}
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
  const { monsters, getMonsters } = useData();
  const MotionBox = motion(Box);
  const navigate = useNavigate();
  const [selectedMonster, setSelectedMonster] = useState(null);

  useEffect(() => {
    getMonsters();
  }, [getMonsters]);

  useEffect(() => {
    if (monsters?.length && !selectedMonster) {
      setSelectedMonster(monsters[0]);
    }
  }, [monsters, selectedMonster]);

  return (
    <Box sx={{ m: 2 }}>
      <StarBackground />
      <BackArrow onClick={() => navigate("/home/library")} />
      
      <MotionBox
        initial={false}
        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
        transition={{ duration: 0.5, type: "spring" }}
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          
          // Container Design (Book/Panel style)
          background: THEME.cream,
          border: `8px solid ${THEME.brownLight}`,
          borderRadius: "12px",
          boxShadow: `
            0 0 0 4px ${THEME.brownDark},
            0 20px 60px rgba(0,0,0,0.8)
          `,
          width: { xs: "90%", sm: "80%", md: "80%", lg: "70%" },
          height: "550px",
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          height:'550px',
        }}
      >
        {/* Header Title */}
        <Box sx={{ 
            py: 2, 
            textAlign: 'center', 
            background: THEME.brownDark, 
            mx: -1, mt: -1, 
            mb: 2,
            borderBottom: `4px solid ${THEME.brownLight}`
        }}>
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEME.textLight,
              fontSize: { xs: 16, md: 24 },
              textShadow: "2px 2px 0 #000"
            }}
          >
            MONSTER LIBRARY
          </Typography>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, mb: 1 }}>
                <DetailMonster monster={selectedMonster} />
            </Box>
            
            {/* Footer List */}
            <Box sx={{ height: '80px', px: 2, mb: 1 }}>
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