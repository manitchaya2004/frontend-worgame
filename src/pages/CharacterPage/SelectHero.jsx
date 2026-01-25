import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
const SelectHero = () => {
  const navigate = useNavigate();

  // const finishSelectHero = useAuthStore((s) => s.finishSelectHero);

  const onSelect = () => {
    // finishSelectHero(); // ✅ set isFirstTime = false
    navigate("/home"); // ✅ เข้าเกม
  };
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{ color: "white", fontFamily: "'Press Start 2P'", fontSize: 8 }}
      >
        ★ Select Character ★
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "red",
        }}
      >
        <Typography sx={{ color: "white" }}>Coming Soon na!!!!!</Typography>
        <Button onClick={onSelect}>click</Button>
      </Box>
    </Box>
  );
};

export default SelectHero;
