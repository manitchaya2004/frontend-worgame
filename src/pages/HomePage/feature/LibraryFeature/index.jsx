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

const libraryCardStyle = {
  cursor: "pointer",
  position: "relative",
  ursor: "pointer",
  height: "100%",
  backgroundColor: "#fdf8ef",
  border: "3px solid #2b1d14",
  boxShadow: "6px 6px 0px #2b1d14",
  transition: "all 0.15s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  overflow: "hidden",
  "&:active": {
    transform: "translate(0px, 0px)",
    boxShadow: "4px 4px 0px #2b1d14",
  },

  // 📕 สันหนังสือ
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "30px",
    background: "linear-gradient(#7a1f1f, #4b0f0f)",
  },
};
const pixelCardStyle = {
  cursor: "pointer",
  height: "100%",
  backgroundColor: "#fdf8ef",
  border: "3px solid #2b1d14",
  boxShadow: "6px 6px 0px #2b1d14",
  transition: "all 0.15s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  "&:hover": {
    transform: "translate(-2px, -2px)",
    boxShadow: "8px 8px 0px #2b1d14",
    backgroundColor: "#fff3d6",
  },

  "&:active": {
    transform: "translate(0px, 0px)",
    boxShadow: "4px 4px 0px #2b1d14",
  },

};

const LibraryFeature = () => {
  const navigate = useNavigate();
  const MotionBox = motion(Box);
  const MotionCard = motion(Card);
  //   const;
  return (
    <Box sx={{ m: 2 }}>
      <BackArrow onClick={() => navigate("/home")} />
      <MotionBox
        initial={false}
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
          top: "55%",
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
        <Title title="LIBRARY" />

        <Grid
          container
          spacing={2}
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            p: 3,
          }}
        >
          {/* Monster */}
          <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }} sx={{ height: "400px" }}>
            <MotionCard
              whileHover={{
                y: -12,
                scale: 1.04,
                rotateX: 4,
                boxShadow:
                  "0 0 25px rgba(255,220,140,0.6), 0 20px 40px rgba(0,0,0,0.8)",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              sx={libraryCardStyle}
            >
              <CardActionArea
                onClick={() => navigate("/home/library/monster")}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  transition: "all 0.3s ease",

                  "&:hover .library-title": {
                    color: "#7a1f1f",
                    textShadow: `
        0 0 6px rgba(214,180,106,0.8),
        0 0 14px rgba(214,180,106,0.6)
      `,
                  },
                  
                }}
                
              >
                <CardContent>
                  <Typography
                  className="library-title"
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: "30px",
                      textAlign: "center",
                    }}
                  >
                    Monster
                  </Typography>
                </CardContent>
              </CardActionArea>
            </MotionCard>
          </Grid>

          {/* Dictionary */}
          <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }} sx={{ height: "400px" }}>
            <MotionCard
              whileHover={{
                y: -12,
                scale: 1.04,
                rotateX: 4,
                boxShadow:
                  "0 0 25px rgba(255,220,140,0.6), 0 20px 40px rgba(0,0,0,0.8)",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              sx={libraryCardStyle}
            >
              <CardActionArea
                onClick={() => navigate("/home/library/dictionary")}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  transition: "all 0.3s ease",

                  "&:hover .library-title": {
                    color: "#7a1f1f",
                    textShadow: `
        0 0 6px rgba(214,180,106,0.8),
        0 0 14px rgba(214,180,106,0.6)
      `,
                  },
                  
                }}
                
              >
                <CardContent>
                  <Typography
                  className="library-title"
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: "30px",
                      textAlign: "center",
                    }}
                  >
                    Dictionary
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
