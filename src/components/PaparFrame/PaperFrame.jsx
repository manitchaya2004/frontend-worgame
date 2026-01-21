import { Box, Typography } from "@mui/material";
import { THEMES } from "../../pages/HomePage/hook/const";

export default function PaperFrame({ title, children }) {
  return (
    <Box
      sx={{
        borderRadius: "22px",
        backgroundColor: THEMES.border,
        p: "10px",
        boxShadow: `
            0 0 0 4px #1a120b,
            0 20px 60px rgba(49, 49, 49, 0.8)
          `,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(${THEMES.bgMain}, #1a120b)`,
          borderRadius: "14px",
          width: "560px",
          // minHeight: "280px",
          p: 3,
          gap: 2,
        }}
      >
        {title && (
          <Box
            sx={{
              
              textAlign: "center",
              borderBottom: `3px solid ${THEMES.border}`,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: "50px",
                color:  THEMES.accent,
                letterSpacing: "2px",
                textShadow: `2px 2px 0 ${THEMES.shadow}`,
              }}
            >
              {title}
            </Typography>
          </Box>
        )}

        {children}
      </Box>
    </Box>
  );
}
