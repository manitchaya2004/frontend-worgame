import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { FormTextField } from "../../../components/FormTextField";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginPlayer } from "./hook/useLoginPlayer";
import { useAuthStore } from "../../../store/useAuthStore";
import GameSnackbar from "../../../components/Snackbar";
import PaperFrame from "../../../components/PaparFrame/PaperFrame";
import { THEMES } from "../../HomePage/hook/const";
import MagicCursor from "../../../components/Cursor";

const LoginPage = () => {
  const { currentUser } = useAuthStore();
  const {
    message,
    isLoading,
    loginPlayer,

    error,
    isFailed,
    clearStateLogin,
    clearBackendMessage,
  } = useLoginPlayer();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/"); // หรือ /home
    }
  }, [currentUser, navigate]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const goToRegister = () => {
    navigate("/auth/register");
    clearBackendMessage();
  };
  const goToHomePage = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  // state
  const [formLogin, setFormLogin] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    clearBackendMessage();

    // // ล้าง error เฉพาะ field นี้
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    setFormLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // error message from backend
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!message) return;
    setSnackbar(() => ({ open: false, message: "", type: "info" }));
    setErrors((prev) => ({
      ...prev,
      username: message.includes("username") ? message : undefined,
      password: message.includes("password") ? message : undefined,
    }));
  }, [message]);

  // useEffect(()=>{
  //   clearStateLogin();
  // },[])

  const validate = () => {
    const newErrors = {};

    if (!formLogin.username.trim()) {
      newErrors.username = "Please enter your username";
    }
    if (!formLogin.password.trim()) {
      newErrors.password = "Please enter your password";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // clear form
  const clearForm = () => {
    setFormLogin({
      username: "",
      password: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await loginPlayer({
      username: formLogin.username,
      password: formLogin.password,
    });
  };

  // //error network reject
  // useEffect(() => {
  //   if (isFailed) {
  //     setSnackbar({
  //       open: true,
  //       message: "Failed to Login",
  //       type: "error",
  //     });
  //   }
  // }, [isFailed]);

  return (
    <>
      <MagicCursor />
      <Box
        sx={{
          minHeight: "100dvh", // เปลี่ยนเป็น 100dvh เพื่อให้พอดีกับมือถือจริงๆ
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 0 },
          // ปรับโครงสร้างแค่ตอนตะแคงมือถือ (แนวนอนจอเล็ก)
          "@media (orientation: landscape) and (max-height: 450px)": {
            alignItems: "center", // ดันขึ้นบนสุดไม่ให้หัวล้น
            py: 2, // เพิ่มขอบบนล่างกันตกขอบ
     
          },
        }}
      >
        <PaperFrame title="LOGIN">
          {/* <Box sx={{ position: "absolute", top: -10, left: -10 }}>⭐</Box> */}

          <FormTextField
            label="Username"
            name="username"
            isPassword={false}
            value={formLogin.username}
            onChange={handleInputChange}
            errorMessage={errors.username}
            helperText={errors.username}
          />
          <FormTextField
            label="Password"
            name="password"
            showPassword={showPassword}
            isPassword={true}
            onClick={handleClickShowPassword}
            value={formLogin.password}
            onChange={handleInputChange}
            errorMessage={errors.password}
            helperText={errors.password}
          />

          <Button
            fullWidth
            disabled={isLoading}
            onClick={handleSubmit}
            sx={{
              mt: 2,
              mb: 2,
              bgcolor: "#694037",
              color: "#E8E9CD",
              borderRadius: "15px",
              fontSize: {
                xs: "14px",
                sm: "16px",
                md: "18px",
                lg: "20px",
              },
              py: { xs: 1, sm: 1.2 },
              fontFamily: "'Press Start 2P'",
              "&:hover": { bgcolor: "#4f2e27ff" },
              "&.Mui-disabled": {
                bgcolor: "#694037", // ไม่ให้จาง
                color: "#E8E9CD", // ฟอนต์ไม่ดำ
                opacity: 0.8, // ลดนิดเดียวพอ
              },
              // ลดระยะห่างบนล่างเฉพาะตอนตะแคงมือถือ
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: "10px",
                mt: 1,
                height: 30
              }
            }}
            startIcon={
              isLoading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isLoading ? "...Login" : "Login"}
          </Button>

          <Box
            sx={{
              display: "flex",
              // flexDirection :{ xs: "column", sm: "row" },
              justifyContent: { xs: "center", sm: "space-evenly" },
              alignItems: "center",
              width: "100%",
              mt: 1,
              gap: 1,
              // ลด margin top เฉพาะตอนตะแคงมือถือ
              "@media (orientation: landscape) and (max-height: 450px)": {
                mt: 0.5,
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: {
                  xs: "7px",
                  sm: "9px",
                },
                color: "rgb(207, 207, 207)",
              }}
            >
              Don’t have an account ?
            </Typography>

            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: {
                  xs: "8px",
                  sm: "10px",
                },
                color: "white",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={goToRegister}
            >
              register
            </Typography>
          </Box>
          {/* </Box> */}
        </PaperFrame>
      </Box>
      <GameSnackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => {
          setSnackbar(() => ({ open: false, message: "", type: "info" }));
          clearStateLogin();
        }}
      />
    </>
  );
};

export default LoginPage;