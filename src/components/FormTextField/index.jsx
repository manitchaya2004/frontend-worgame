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
}) => {
  return (
    <>
      {isPassword ? (
        <Box sx={{ width: "100%" }}>
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: "12px",
            }}
          >
            {label}
          </Typography>

          <TextField
            fullWidth
            size="small"
            type={showPassword ? "text" : "password"}
            value={value}
            name={name}
            onChange={onChange}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 46,
                borderRadius: "15px",
                ontFamily: "'Press Start 2P'",
                backgroundColor: "rgba(255, 255, 255, 1)",
                "& fieldset": {
                  border: "3px solid #8c6565ff",
                },
                "&:hover fieldset": {
                  border: "4px solid #8c6565ff", // hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#8c6565ff", // ตอน focus
                  borderWidth: 4,
                },
                "& .MuiOutlinedInput-input": {
                  fontFamily: "'Press Start 2P'",
                  fontSize: "10px",
                  padding: "12px",
                },
              },
            }}
            // sx={{
            //   backgroundColor: "white",
            //   borderRadius: "15px",
            //   "& fieldset": { borderRadius: "15px" },
            // }}

            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onClick}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={!!errorMessage}
            helperText={helperText}
          />
        </Box>
      ) : (
        <Box sx={{ width: "100%" }}>
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: "12px",
            }}
          >
            {label}
          </Typography>

          <TextField
            fullWidth
            size="small"
            value={value}
            name={name}
            onChange={onChange}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 46,
                // maxHeight:45,
                borderRadius: "15px",
                backgroundColor: "rgba(255, 255, 255, 1)",
                "& fieldset": {
                  border: "3px solid #8c6565ff",
                },
                "&:hover fieldset": {
                  border: "4px solid #8c6565ff", // hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#8c6565ff", // ตอน focus
                  borderWidth: 4,
                },
                "& .MuiOutlinedInput-input": {
                  fontFamily: "'Press Start 2P'",
                  fontSize: "10px",
                  padding: "12px",
                },
              },
            }}
            error={!!errorMessage}
            helperText={helperText}
          />
        </Box>
      )}
    </>
  );
};
