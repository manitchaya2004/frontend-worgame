import {
  TextField,
  Typography,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export const FormTextField = ({
  label,
  name,
  showPassword,
  isPassword,
  onClick,
  value,
  onChange,
  errorMessage,
  helperText,
  maxLength ,
}) => {
  // 1. สร้างตัวแปรเก็บ Style ของ Label ไว้ที่เดียว
  const labelStyles = {
    color: "white",
    fontFamily: "'Press Start 2P'",
    fontSize: { xs: "10px", sm: "12px" },
    mb: 0.4,
    "@media (orientation: landscape) and (max-height: 450px)": {
      mb: 0.2,
      fontSize: "7px",
    },
  };

  // 2. สร้างตัวแปรเก็บ Style ของ TextField ไว้ที่เดียว
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      height: {
        xs: 42, // ปรับให้เท่ากันทั้งรหัสผ่านและข้อความธรรมดา
        sm: 46,
      },
      "@media (orientation: landscape) and (max-height: 450px)": {
        height: 30,
        borderRadius: "13px",
      },
      borderRadius: "15px",
      fontFamily: "'Press Start 2P'",
      backgroundColor: "rgba(255, 255, 255, 1)",
      "& fieldset": {
        border: "3px solid #8c6565ff",
      },
      "&:hover fieldset": {
        border: "4px solid #8c6565ff",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#8c6565ff",
        borderWidth: 4,
      },
      "& .MuiOutlinedInput-input": {
        fontFamily: "'Press Start 2P'",
        fontSize: "10px",
        padding: {
          xs: "10px",
          sm: "12px",
        },
        "&:-webkit-autofill": {
          transition: "background-color 5000s ease-in-out 0s",
        },
        "@media (orientation: landscape) and (max-height: 450px)": {
          fontSize: "7px",
        },
      },
    },
    // ---- ปรับแต่งขนาดฟอนต์ของ HelperText ตรงนี้ครับ ----
    "& .MuiFormHelperText-root": {
      fontFamily: "'Press Start 2P'", // ให้ฟอนต์เข้ากัน
      fontSize: "8px", // ขนาดฟอนต์ error ปกติ
      marginTop: "4px", // ระยะห่างจากช่องกรอก
      marginLeft: "4px",
      "@media (orientation: landscape) and (max-height: 450px)": {
        fontSize: "6px", // ถ้าแนวนอนก็ให้เล็กลงด้วย
        marginTop: "2px",
      },
    },
  };

  const isCounter = !errorMessage && maxLength && typeof value === "string";

  const helperContent = isCounter ? (
    <Box sx={{ textAlign: "right" }}>
      <Typography
        sx={{
          color: "white",
          fontFamily: "'Press Start 2P'", // ให้ฟอนต์เข้ากัน
          fontSize: "8px",
        }}
      >
        {value.length}/{maxLength}
      </Typography>
    </Box>
  ) : (
    <Box sx={{ textAlign: "left" }}>{errorMessage || helperText}</Box>
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={labelStyles}>{label}</Typography>

      {/* เรียกใช้ TextField แค่รอบเดียว */}
      <TextField
        fullWidth
        size="small"
        // ถ้าเป็นพาสเวิร์ดให้เช็ค showPassword ถ้าไม่ใช่พาสเวิร์ดก็เป็น text ธรรมดา
        type={isPassword ? (showPassword ? "text" : "password") : "text"}
        value={value}
        name={name}
        onChange={onChange}
        variant="outlined"
        sx={textFieldStyles} // โยนตัวแปร Style ที่เขียนไว้ด้านบนมาใส่
        inputProps={{ maxLength }}
        InputProps={
          // ถ้าเป็นพาสเวิร์ด ถึงจะใส่ลูกตา ถ้าไม่ใช่ก็ใส่ undefined (ไม่แสดงอะไร)

          isPassword
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={onClick}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : undefined
        }
        error={!!errorMessage}
        helperText={helperContent}
      />
    </Box>
  );
};
