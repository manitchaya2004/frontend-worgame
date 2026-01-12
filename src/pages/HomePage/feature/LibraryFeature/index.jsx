import {
  Box,
  Button,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackArrow from "../../components/BackArrow";
import { Title } from "../AdvantureFeature";
import StarBackground from "../../components/StarBackground";
// const libraryCardStyle = {
//   cursor: "pointer",
//   position: "relative",
//   ursor: "pointer",
//   height: "100%",
//   backgroundColor: "#fdf8ef",
//   border: "3px solid #2b1d14",
//   boxShadow: "6px 6px 0px #2b1d14",
//   transition: "all 0.15s ease",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",

//   overflow: "hidden",
//   "&:active": {
//     transform: "translate(0px, 0px)",
//     boxShadow: "4px 4px 0px #2b1d14",
//   },

//   // 📕 สันหนังสือ
//   "&::before": {
//     content: '""',
//     position: "absolute",
//     left: 0,
//     top: 0,
//     bottom: 0,
//     width: "30px",
//     background: "linear-gradient(#7a1f1f, #4b0f0f)",
//   },
// };
// const pixelCardStyle = {
//   cursor: "pointer",
//   height: "100%",
//   backgroundColor: "#fdf8ef",
//   border: "3px solid #2b1d14",
//   boxShadow: "6px 6px 0px #2b1d14",
//   transition: "all 0.15s ease",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",

//   "&:hover": {
//     transform: "translate(-2px, -2px)",
//     boxShadow: "8px 8px 0px #2b1d14",
//     backgroundColor: "#fff3d6",
//   },

//   "&:active": {
//     transform: "translate(0px, 0px)",
//     boxShadow: "4px 4px 0px #2b1d14",
//   },

// };

// const LibraryFeature = () => {
//   const navigate = useNavigate();
//   const MotionBox = motion(Box);
//   const MotionCard = motion(Card);
//   //   const;
//   return (
//     <Box sx={{ m: 2 }}>
//       <StarBackground />
//       <BackArrow onClick={() => navigate("/home")} />
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
//           top: "55%",
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
//           height: "550px",
//           padding: 2,
//         }}
//       >
//         <Title title="LIBRARY" />

//         <Grid
//           container
//           spacing={2}
//           sx={{
//             width: "100%",
//             height: "100%",
//             display: "flex",
//             alignItems: "center",
//             p: 3,
//           }}
//         >
//           {/* Monster */}
//           <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }} sx={{ height: "400px" }}>
//             <MotionCard
//               whileHover={{
//                 y: -12,
//                 scale: 1.04,
//                 rotateX: 4,
//                 boxShadow:
//                   "0 0 25px rgba(255,220,140,0.6), 0 20px 40px rgba(0,0,0,0.8)",
//               }}
//               transition={{ type: "spring", stiffness: 200, damping: 15 }}
//               sx={libraryCardStyle}
//             >
//               <CardActionArea
//                 onClick={() => navigate("/home/library/monster")}
//                 sx={{
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   height: "100%",
//                   transition: "all 0.3s ease",

//                   "&:hover .library-title": {
//                     color: "#7a1f1f",
//                     textShadow: `
//         0 0 6px rgba(214,180,106,0.8),
//         0 0 14px rgba(214,180,106,0.6)
//       `,
//                   },
                  
//                 }}
                
//               >
//                 <CardContent>
//                   <Typography
//                   className="library-title"
//                     sx={{
//                       fontFamily: "'Press Start 2P'",
//                       fontSize: "30px",
//                       textAlign: "center",
//                     }}
//                   >
//                     Monster
//                   </Typography>
//                 </CardContent>
//               </CardActionArea>
//             </MotionCard>
//           </Grid>

//           {/* Dictionary */}
//           <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }} sx={{ height: "400px" }}>
//             <MotionCard
//               whileHover={{
//                 y: -12,
//                 scale: 1.04,
//                 rotateX: 4,
//                 boxShadow:
//                   "0 0 25px rgba(255,220,140,0.6), 0 20px 40px rgba(0,0,0,0.8)",
//               }}
//               transition={{ type: "spring", stiffness: 200, damping: 15 }}
//               sx={libraryCardStyle}
//             >
//               <CardActionArea
//                 onClick={() => navigate("/home/library/dictionary")}
//                 sx={{
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   height: "100%",
//                   transition: "all 0.3s ease",

//                   "&:hover .library-title": {
//                     color: "#7a1f1f",
//                     textShadow: `
//         0 0 6px rgba(214,180,106,0.8),
//         0 0 14px rgba(214,180,106,0.6)
//       `,
//                   },
                  
//                 }}
                
//               >
//                 <CardContent>
//                   <Typography
//                   className="library-title"
//                     sx={{
//                       fontFamily: "'Press Start 2P'",
//                       fontSize: "30px",
//                       textAlign: "center",
//                     }}
//                   >
//                     Dictionary
//                   </Typography>
//                 </CardContent>
//               </CardActionArea>
//             </MotionCard>
//           </Grid>
//         </Grid>
//       </MotionBox>
//     </Box>
//   );
// };

// export default LibraryFeature;

// --- NEW THEME CONFIG (Dark Magical Wood) ---
const THEME = {
  bgMain: "#2b1d14",       // พื้นหลัง Container หลัก (สีน้ำตาลเข้มมาก)
  bgBook: "#3e2723",       // พื้นหลังปกหนังสือ
  border: "#5a3e2b",       // สีขอบทองแดง/น้ำตาล
  borderLight: "#8d6e63",  // สีขอบสว่าง
  accent: "#ffecb3",       // สีทองสำหรับ Text เด่นๆ / แสง
  textMain: "#d7ccc8",     // สีตัวหนังสือทั่วไป (ครีมอมเทา)
  magic: "#00bcd4",        // สีฟ้าเวทมนตร์ (สำหรับสันหนังสือ)
};

const libraryCardStyle = {
  cursor: "pointer",
  position: "relative",
  height: "100%",
  // พื้นหลังลายไม้สีเข้ม
  backgroundColor: THEME.bgBook,
  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))`,
  border: `3px solid ${THEME.border}`,
  // เงาแบบ Pixel สีเข้ม
  boxShadow: `6px 6px 0px #1a120b`,
  transition: "all 0.15s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  borderRadius: "4px",

  "&:active": {
    transform: "translate(3px, 3px)",
    boxShadow: `3px 3px 0px #1a120b`,
  },
  
  "&:hover": {
     transform: "translate(-2px, -2px)",
     // Hover แล้วมีแสงสีทองเรืองๆ
     boxShadow: `6px 6px 0px #1a120b, 0 0 15px ${THEME.accent}`,
     borderColor: THEME.accent,
  },

  // 📕 สันหนังสือ - เปลี่ยนเป็นแสงเวทมนตร์สีฟ้า
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "20px",
    background: `linear-gradient(90deg, ${THEME.magic}, #008ba3, ${THEME.magic})`,
    borderRight: `2px solid rgba(0,0,0,0.5)`,
    boxShadow: `0 0 10px ${THEME.magic}`,
    zIndex: 1
  },
};

const LibraryFeature = () => {
  const navigate = useNavigate();
  const MotionBox = motion(Box);
  const MotionCard = motion(Card);

  return (
    <Box sx={{ m: 2 }}>
      <StarBackground />
      <BackArrow onClick={() => navigate("/home")} />
      
      <MotionBox
        initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
        transition={{ duration: 0.5, type: "spring" }}
        sx={{
          position: "fixed",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          
          // Container Design: กรอบไม้สีเข้มสไตล์ RPG
          background: `linear-gradient(${THEME.bgMain}, #1a120b)`,
          border: `6px solid ${THEME.border}`,
          borderRadius: "12px",
          boxShadow: `
            inset 0 0 20px rgba(0,0,0,0.8),
            0 0 0 4px #1a120b,
            0 20px 60px rgba(0,0,0,1)
          `,
          width: { xs: "90vw", sm: "80%", md: "70%" },
          height: "550px",
          display: 'flex',
          flexDirection: 'column',
          p: 1
        }}
      >
        {/* Header Title */}
        <Box sx={{ 
            py: 2, 
            textAlign: 'center', 
            // หัวข้อสีเข้ม ขอบทอง
            background: `#1a120b`, 
            mx: -1, mt: -1, 
            mb: 2,
            borderBottom: `4px solid ${THEME.border}`,
            boxShadow: `0 5px 10px rgba(0,0,0,0.5)`
        }}>
            <Typography
                sx={{
                fontFamily: "'Press Start 2P'",
                color: THEME.accent, // ตัวหนังสือสีทอง
                fontSize: { xs: 18, md: 28 },
                textShadow: `3px 3px 0 #000, 0 0 10px ${THEME.accent}`,
                letterSpacing: "2px"
                }}
            >
                LIBRARY
            </Typography>
        </Box>

        {/* Content Grid */}
        <Grid
          container
          spacing={4}
          sx={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 2, md: 6 },
            ml: 0,
            mt: 0
          }}
        >
          {/* 1. Monster Book */}
          <Grid size={{ xs: 12, sm: 6 }} sx={{ height: "100%", maxHeight: "350px" }}>
            <MotionCard
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              sx={libraryCardStyle}
            >
              <CardActionArea
                onClick={() => navigate("/home/library/monster")}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  pl: 4,
                  "&:hover .library-title": {
                    color: THEME.accent,
                    textShadow: `0 0 10px ${THEME.accent}`
                  },
                }}
              >
                <CardContent>
                  <Typography
                    className="library-title"
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: { xs: "20px", md: "24px" },
                      textAlign: "center",
                      color: THEME.textMain,
                      transition: "all 0.2s",
                      textShadow: "2px 2px 0 rgba(0,0,0,0.8)"
                    }}
                  >
                    MONSTERS
                  </Typography>
                  <Typography sx={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: THEME.borderLight, textAlign: 'center', mt: 1 }}>
                      Bestiary & Stats
                  </Typography>
                </CardContent>
              </CardActionArea>
            </MotionCard>
          </Grid>

          {/* 2. Dictionary Book */}
          <Grid size={{ xs: 12, sm: 6 }} sx={{ height: "100%", maxHeight: "350px" }}>
            <MotionCard
               whileHover={{ scale: 1.05 }}
               transition={{ type: "spring", stiffness: 300 }}
               sx={libraryCardStyle}
            >
              <CardActionArea
                onClick={() => navigate("/home/library/dictionary")}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  pl: 4,
                  "&:hover .library-title": {
                    color: THEME.accent,
                    textShadow: `0 0 10px ${THEME.accent}`
                  },
                }}
              >
                <CardContent>
                  <Typography
                    className="library-title"
                    sx={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: { xs: "20px", md: "24px" },
                        textAlign: "center",
                        color: THEME.textMain,
                        transition: "all 0.2s",
                        textShadow: "2px 2px 0 rgba(0,0,0,0.8)"
                    }}
                  >
                    DICTIONARY
                  </Typography>
                  <Typography sx={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: THEME.borderLight, textAlign: 'center', mt: 1 }}>
                      Words & Vocabs
                  </Typography>
                </CardContent>
              </CardActionArea>
            </MotionCard>
          </Grid>
        </Grid>
      </MotionBox>
    </Box>
  );
};

export default LibraryFeature;

