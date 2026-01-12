import { Snackbar, Box } from "@mui/material";
import { motion } from "framer-motion";

const typeStyle = {
  error: {
    bg: "#2a1f3f",
    border: "#8c6565",
    glow: "rgba(255, 120, 120, 0.6)",
    icon: "❌",
  },
  success: {
    bg: "#1f3f2a",
    border: "#65a18c",
    glow: "rgba(120, 255, 180, 0.6)",
    icon: "✅",
  },
  info: {
    bg: "#1f2a3f",
    border: "#658ca1",
    glow: "rgba(120, 180, 255, 0.6)",
    icon: "ℹ️",
  },
};

const GameSnackbar = ({ open, message, onClose, type = "error" }) => {
  if (!open) return null;
  const style = typeStyle[type];

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <Box
          sx={{
            bgcolor: style.bg,
            color: "#fff",
            px: 3,
            py: 2,
            border: `4px solid ${style.border}`,
            borderRadius: "14px",
            fontFamily: "'Press Start 2P'",
            fontSize: "12px",
            boxShadow: `0 0 20px ${style.glow}`,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <span>{style.icon}</span>
          <span>{message}</span>
        </Box>
      </motion.div>
    </Snackbar>
  );
};

export default GameSnackbar;
