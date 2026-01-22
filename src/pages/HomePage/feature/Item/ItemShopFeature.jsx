import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { THEMES } from "../../hook/const";
const MotionBox = motion(Box);
const ItemShopFeature = () => {
  return (
    <Box sx={{ mt: 2 }}>
      <MotionBox
        initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
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

          // Container Design (Book/Panel style)
          background: `linear-gradient(${THEMES.bgMain}, #1a120b)`,
          border: `8px solid ${THEMES.border}`,
          borderRadius: "12px",
          boxShadow: `
            0 0 0 4px #1a120b,
            0 20px 60px rgba(49, 49, 49, 0.8)
          `,
          width: { xs: "90%", sm: "80%", md: "80%", lg: "80%" },
          height: "570px",
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

            borderBottom: `4px solid ${THEMES.border}`,
          }}
        >
          {/* Title กลางจริง */}
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEMES.accent,
              fontSize: { xs: 16, md: 26 },
              letterSpacing: "2px",
              textTransform: "uppercase",
              textShadow: `3px 3px 0 #000, 0 0 10px ${THEMES.accent}`,
            }}
          >
            ITEM HEAL
          </Typography>
        </Box>
      </MotionBox>
    </Box>
  );
};

export default ItemShopFeature;
