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
        width: {
          xs: "100%",
          sm: 600,
        },
        
        "@media (orientation: landscape) and (max-height: 450px)": {
          width: 400,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(${THEMES.bgMain}, #1a120b)`,
          borderRadius: "14px",

          // minHeight: "280px",
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 4 },
          gap: 0.3,
          // บีบ padding และ gap เฉพาะตอนตะแคงมือถือ
          "@media (orientation: landscape) and (max-height: 450px)": {
            py: 1.5,
            gap: 1.2,
          },
        }}
      >
        {title && (
          <Box
            sx={{
              textAlign: "center",
              borderBottom: `3px solid ${THEMES.border}`,
              mb:1
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: {
                  xs: "35px",
                  sm: "50px",
                },
                color: THEMES.accent,
                letterSpacing: "2px",
                textShadow: `2px 2px 0 ${THEMES.shadow}`,
                // ลดขนาดคำว่า LOGIN ลงนิดนึงเฉพาะตอนตะแคง
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: "20px",
                },
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