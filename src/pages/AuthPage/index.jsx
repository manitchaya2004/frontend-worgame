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
    <motion.div 
      whileHover={{ scale: 1.05 }} 
      whileTap={{ scale: 0.95 }}
      style={{ flex: 1, display: "flex", width: "100%" }} // ให้ Button Container ขยายเต็มพื้นที่ที่แบ่งกัน
    >
      <Box
        onClick={onClick}
        sx={{
          px: { xs: 1, sm: 2, md: 4 }, // ลด padding ขอบซ้ายขวาบนมือถือ
          py: { xs: 1.5, sm: 1.5 },
          fontFamily: "'Press Start 2P'",
          width: "100%", // ให้กว้าง 100% ของ flex box แทนการล็อก size
          textAlign: "center",
          fontSize: { xs: "9px", sm: "12px", md: "14px", lg: "16px" }, // ย่อฟอนต์ลงเมื่อจอเล็ก เพื่อไม่ให้ปุ่มแตก
          backgroundColor: "#E8E9CD",
          border: { xs: "3px solid #3e2615", sm: "4px solid #3e2615" },
          borderRadius: "10px",
          cursor: "pointer",
          boxShadow: { xs: "3px 3px 0 #3e2615", sm: "4px 4px 0 #3e2615" },
          userSelect: "none",
          display: 'flex',
          justifyContent:'center',
          alignItems: 'center',
          whiteSpace: "nowrap", // ป้องกันตัวหนังสือตกบรรทัด
          // ปรับความสูงและฟอนต์เฉพาะตอนตะแคงมือถือ
          "@media (orientation: landscape) and (max-height: 450px)": {
            py: 1.2,
            fontSize: "10px", // ปรับฟอนต์ให้พอดี ไม่เล็กไม่ใหญ่ไป
          }
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
        justifyContent: "center", // เพิ่มกึ่งกลางแนวตั้ง
        minHeight: "100dvh", // ให้คอนเทนเนอร์หลักสูงอย่างน้อยเต็มจอเสมอ
        gap: { xs: 3, sm: 4 },
        width: { xs:'90%', sm:'70%', md:'50%', lg:'40%', xl: '30%' },
        maxWidth: "600px", // ป้องกันไม่ให้ใหญ่เกินไปบนจอ Desktop
        margin: "0 auto", // ดึงเข้ากึ่งกลางจอ
        padding: { xs: 2, sm: 0 },
        // ถ้าตะแคงมือถือ ให้เลื่อนของขึ้นไปข้างบนนิดนึง และจำกัดความกว้างไม่ให้มันยืดเกินไป
        "@media (orientation: landscape) and (max-height: 450px)": {
          justifyContent: "center",
          py: 3,
          gap: 2,
          maxWidth: "380px", // บังคับไม่ให้กล่องและปุ่มยืดเกิน 380px ในแนวนอน
        }
      }}
    >
      {/* 🪄 LOGO */}
      <motion.div
        animate={{ scale: [1, 1.03, 1] }} // ลดแรงเด้งลงนิดนึงเพื่อไม่ให้ scrollbar กระตุกบนมือถือ
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Box 
          component="img" 
          src={Logo} 
          alt="Logo" 
          sx={{ 
            width: "100%", // สำคัญมาก: เปลี่ยนจาก 500px เป็น 100% เพื่อให้หดตามกล่อง
            maxWidth: { xs: "280px", sm: "400px", md: "500px" }, // ตั้งเพดานความกว้างแทน
            height: "auto",
            "@media (orientation: landscape) and (max-height: 450px)": {
              maxWidth: "200px", // ตะแคงจอเมื่อไหร่ บีบโลโก้ให้เล็กลงทันที
            }
          }} 
        />
      </motion.div>

      {/* 🎮 BUTTON GROUP */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: { xs: 1.5, sm: 3 }, // ลดช่องว่างระหว่างปุ่มบนมือถือ
          px: { xs: 1.5, sm: 4 }, // ลด padding กรอบด้านใน
          py: { xs: 2, sm: 3 },
          borderRadius: "16px",
          border: "4px solid #5c3a1e",
          backgroundColor: "#2a2438",
          boxShadow: { xs: "4px 4px 0 #3e2615", sm: "6px 6px 0 #3e2615" },
          width: "100%", // ใช้ 100% ชัวร์กว่า -webkit-fill-available
          justifyContent: "center",
          alignItems: "center",
          "@media (orientation: landscape) and (max-height: 450px)": {
            py: 1.5,
          }
        }}
      >
        <PixelButton label="Login" onClick={() => navigate("/auth/login")} />
        <PixelButton label="Register" onClick={() => navigate("/auth/register")} />
      </Box>
    </Box>
  );
};

export default AuthPage;