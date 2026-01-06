import { Box } from "@mui/material";

export default function PaperFrame({
  children,
}) {
  return (
    <Box
      sx={{
        borderRadius: "20px",
        backgroundColor: "#694037", // สีกรอบ
        p: "15px",
      }}
    >
      <Box
        sx={{
          display:'flex',
          flexDirection:'column',
          backgroundColor: "#E8E9CD",
          borderRadius: "12px",
          width:"560px",
          minHeight:'280px',
          justifyContent:'center',
          p: 5,
          gap:1,
        }}
      >
        {children}
      </Box>
    </Box>
    // {/* SVG กระดาษ
    // <svg
    //   viewBox="0 0 560 420"
    //   width="100%"
    //   height="auto"
    //   style={{ display: "block" }}
    // >
    //   <path
    //     d="
    //       M30 20
    //       Q10 50 30 80
    //       L25 120
    //       Q10 150 30 190
    //       L20 300
    //       Q40 380 80 390
    //       L480 390
    //       Q510 390 540 300
    //       L550 80
    //       Q570 5 470 30
    //       L80 30
    //       Q50 20 30 20
    //     "
    //     fill="#f5ecd8"
    //     stroke="#6b4a2d"
    //     strokeWidth="6"
    //   />
    // </svg> */}

    // {/* Content */}
    // {/* <Box
    //   sx={{
    //     position: "absolute",
    //     inset: 0,
    //     p: 6,
    //     display: "flex",
    //     flexDirection: "column",
    //     alignItems: "center",
    //     justifyContent: "center",
    //   }}
    // > */}
  );
}
