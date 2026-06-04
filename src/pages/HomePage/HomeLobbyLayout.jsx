import { Box, Typography, Button } from "@mui/material";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate , useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../../assets/icons/Logo.svg";
import { useState } from "react";
import { GameDialog } from "../../components/GameDialog";
export const HomeLobbyLayout = () => {
  const logout = useAuthStore((state)=>state.logout)
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
      logout();
      navigate("/login");
      setConfirmLogout(false);
  };

  const handleConfirmLogout = () => {
    setConfirmLogout(true);
  };

  const handleCancelLogout = () => {
    setConfirmLogout(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // gap: 5,
        height: "100%",
      }}
    >
      {/* 🪄 LOGO */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{ width: "90%", maxWidth: "400px", display: "flex", justifyContent: "center" }}
      >
        <img src={Logo} alt="Logo" style={{ width: "100%", maxWidth: "320px", height: "auto" }} />
      </motion.div>
      
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "90%", maxWidth: "380px", mt: 2 }}>
        <Button
        variant="contained"
        onClick={() => navigate("/home/adventure")}
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: { xs: 12, sm: 16 },
          width: '100%',
          backgroundColor: "#5c3a1e",
          border: "4px solid #3e2615",
          boxShadow: "4px 4px 0 #3e2615",
          "&:hover": {
            backgroundColor: "#7c4a24",
          },
        }}
      >
        START ADVENTURE
      </Button>
      <Button
        variant="contained"
        onClick={() => navigate("/home/character" , {
          state: {from : location.pathname}
        })}
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: { xs: 12, sm: 16 },
          width: '100%',
          backgroundColor: "#5c3a1e",
          border: "4px solid #3e2615",
          boxShadow: "4px 4px 0 #3e2615",
          "&:hover": {
            backgroundColor: "#7c4a24",
          },
        }}
      >
        CHARACTER
      </Button>
      <Button
        variant="contained"
        onClick={() => navigate("/home/library")}
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: { xs: 12, sm: 16 },
          width: '100%',
          backgroundColor: "#5c3a1e",
          border: "4px solid #3e2615",
          boxShadow: "4px 4px 0 #3e2615",
          "&:hover": {
            backgroundColor: "#7c4a24",
          },
        }}
      >
        LIBRARY
      </Button>
      <Button
        variant="contained"
        onClick={handleConfirmLogout}
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: { xs: 12, sm: 16 },
          width: '100%',
          backgroundColor: "#5c3a1e",
          border: "4px solid #3e2615",
          boxShadow: "4px 4px 0 #3e2615",
          "&:hover": {
            backgroundColor: "#7c4a24",
          },
        }}
      >
        EXIT GAME
      </Button>
      </Box>

      <GameDialog
        open={confirmLogout}
        title="Confirm Logout"
        description="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onCancel={handleCancelLogout}
        confirmText="Logout"
        cancelText="Cancel"
      />
    </Box>
  );
};
