import { useNavigate } from "react-router-dom";
import { useLoginPlayer } from "../../AuthPage/LoginPage/hook/useLoginPlayer";
import { Box, Button, Typography } from "@mui/material";

// ขอทำ logout ก่อนต่อยจัด ิิิ
const SettingsFeature = ({onClose}) => {
  const navigate = useNavigate();
  const {logout}= useLoginPlayer();


  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start",
            fontFamily: "'Concert One'",
            fontSize: 16,
          }}
        >
          🚪 Logout
        </Button>
    </Box>
  );
};

export default SettingsFeature;
