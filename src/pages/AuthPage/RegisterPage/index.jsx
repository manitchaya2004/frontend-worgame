import { useState, useEffect } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useRegisPlayer } from "./hook/useRegisPlayer";
import PaperFrame from "../../../components/PaparFrame/PaperFrame";
import GameSnackbar from "../../../components/Snackbar";
import MagicCursor from "../../../components/Cursor";
import { useAuthStore } from "../../../store/useAuthStore";
import { FormTextField } from "../../../components/FormTextField";

const RegisterPage = () => {
  const {
    message,

    isLoading,
    isLoaded,
    isFailed,

    clearStateRegister,
    clearBackendMessage,
  } = useRegisPlayer();
  const registerUser = useAuthStore((state)=> state.registerUser)
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmsPassword, setConfirmPassword] = useState(false);

  // state สำหรับเก็บค่าฟอร์ม
  const [formRegister, setFormRegister] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  //errior state
  const [errors, setErrors] = useState({});

  //error message from backend
  useEffect(() => {
    if (!message) return;

    setErrors((prev) => ({
      ...prev,
      username: message.includes("username") ? message : undefined,
      email: message.includes("email") ? message : undefined,
    }));
  }, [message]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleClickConfirmPassword = () => {
    setConfirmPassword(!confirmsPassword);
  };

  //input change function
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    clearBackendMessage();

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    setFormRegister((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // validate function
  const validate = () => {
    const newErrors = {};

    if (!formRegister.username.trim()) {
      newErrors.username = "Please enter your username";
    }

    if (!formRegister.email.trim()) {
      newErrors.email = "Please enter your email";
    }

    if (!formRegister.password) {
      newErrors.password = "Please enter your password";
    } else if (formRegister.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องอย่างน้อย 6 ตัว";
    }

    if (formRegister.password !== formRegister.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // clear form function
  const clearForm = () => {
    setFormRegister({
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
  };

  // submit function
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    registerUser(
     {email: formRegister.email,
      username : formRegister.username,
      password : formRegister.password}
    );

    // clearForm();
    navigate("/auth/login");
  };

  // error for network reject and when regis pass
  useEffect(() => {
    if (isFailed) {
      setSnackbar({
        open: true,
        message: "Failed to Register",
        type: "error",
      });
    }

    if (isLoaded) {
      setSnackbar({
        open: true,
        message: "Register success!!!",
        type: "success",
      });
    }
  }, [isFailed, isLoaded]);

  return (
    <>
      <MagicCursor />
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography
          align="center"
          sx={{
            fontSize: "79px",
            // fontWeight: "bold",
            fontFamily: "'Press Start 2P'",
            color: "#E8E9CD",
            letterSpacing: "2px",
          }}
        >
          Register
        </Typography>
        <PaperFrame>
          <FormTextField
            label="Username"
            name="username"
            isPassword={false}
            value={formRegister.username}
            onChange={handleInputChange}
            errorMessage={errors.username}
            helperText={errors.username}
          />
          <FormTextField
            label="Email"
            name="email"
            isPassword={false}
            value={formRegister.email}
            onChange={handleInputChange}
            errorMessage={errors.email}
            helperText={errors.email}
          />
          <FormTextField
            label="Password"
            name="password"
            showPassword={showPassword}
            isPassword={true}
            onClick={handleClickShowPassword}
            value={formRegister.password}
            onChange={handleInputChange}
            errorMessage={errors.password}
            helperText={errors.password}
          />
          <FormTextField
            label="Confirm Password"
            name="confirmPassword"
            showPassword={confirmsPassword}
            isPassword={true}
            onClick={handleClickConfirmPassword}
            value={formRegister.confirmPassword}
            onChange={handleInputChange}
            errorMessage={errors.confirmPassword}
            helperText={errors.confirmPassword}
          />

          <Button
            fullWidth
            disabled={isLoading}
            onClick={handleSubmit}
            sx={{
              mt: 2,
              bgcolor: "#694037",
              color: "#E8E9CD",

              borderRadius: "15px",
              fontSize: "18px",
              fontFamily: "'Press Start 2P'",
              "&:hover": { bgcolor: "#4f2e27ff" },
              "&.Mui-disabled": {
                bgcolor: "#694037", // ไม่ให้จาง
                color: "#E8E9CD", // ฟอนต์ไม่ดำ
                opacity: 0.8, // ลดนิดเดียวพอ
              },
            }}
            startIcon={
              isLoading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isLoading ? "...Register" : "Register"}
          </Button>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
              width: "100%",
              mt: 2,
            }}
          >
            <Typography
              sx={{ fontFamily: "'Press Start 2P'", fontSize: "10px" }}
            >
              Don’t have an account ?
            </Typography>

            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: "10px",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => {
                navigate("/auth/login"), clearBackendMessage();
              }}
            >
              Login
            </Typography>
          </Box>
        </PaperFrame>
      </Box>

      <GameSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => {
          setSnackbar(() => ({ open: false, message: "", type: "info" }));
          clearStateRegister();
        }}
        type={snackbar.type}
      />
    </>
  );
};

export default RegisterPage;
