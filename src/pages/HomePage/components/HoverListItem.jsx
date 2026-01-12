import { Paper, Button } from "@mui/material";



export const HoverListItem = ({ children, onClick }) => {
  return (
    <Paper
      sx={{
        cursor: "pointer",
        margin: "8px 0",
        border: "3px solid #2b1d14",
        backgroundColor: "#fdf8ef",
        boxShadow: "4px 4px 0px #2b1d14",
        transition: "all 0.15s ease",
        "&:hover": {
          transform: "translate(-2px, -2px)",
          boxShadow: "6px 6px 0px #2b1d14",
          backgroundColor: "#fff3d6",
        },
        "&:active": {
          transform: "translate(0px, 0px)",
          boxShadow: "2px 2px 0px #2b1d14",
        },
      }}
    >
      <Button
        disableRipple
        onClick={onClick}
        sx={{
          width: "100%",
          padding: "20px",
          justifyContent: "flex-start",
          textAlign: "left",
          fontSize: "18px",
          fontWeight: 600,
          fontFamily: `"Press Start 2P", monospace`,
          color: "#2b1d14",
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}
      >
        {children}
      </Button>
    </Paper>
  );
};
