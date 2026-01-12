import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StarBackground from "../HomePage/components/StarBackground";
import Logo  from "../../assets/icons/Logo.svg"
import "./style.css";
const PixelButton = ({
  label,
  onClick,
}) => {
  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Box
        onClick={onClick}
        sx={{
          px: 4,
          py: 1.5,
          fontFamily: "'Press Start 2P'",
          width: { xs: '100px',sm:'120px', md: '110px' ,lg:'120px'},
          textAlign: "center",
          fontSize: 16,
          backgroundColor: "#E8E9CD",
          border: "4px solid #3e2615",
          borderRadius: "10px",
          cursor: "pointer",
          boxShadow: "4px 4px 0 #3e2615",
          userSelect: "none",
                   justifyContent:'center',
        }}
      >
        {label}
      </Box>
    </motion.div>
  );
};

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        width:{ xs:'90%',sm:'70%',md:'50%',lg:'30%'  },
        
        
      }}
    >
      {/* 🪄 LOGO */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <img src={Logo} alt="Logo" style={{ width: "500px", }} />

      </motion.div>

      {/* 🎮 BUTTON GROUP */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          px: 4,
          py: 3,
          borderRadius: "16px",
          border: "4px solid #5c3a1e",
          backgroundColor: "#2a2438",
          boxShadow: "6px 6px 0 #3e2615",
          width: "-webkit-fill-available",
          justifyContent: "center",
        
        }}
      >
        <PixelButton label="Login" onClick={() => navigate("/auth/login")} />
        <PixelButton
          label="Register"
          onClick={() => navigate("/auth/register")}
        />
      </Box>
    </Box>
  );
};

export default AuthPage;
