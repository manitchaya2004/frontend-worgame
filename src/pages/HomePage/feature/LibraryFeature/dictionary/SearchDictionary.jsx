import { Box, TextField, InputAdornment, Typography,IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const SearchDictionary = ({
  value,
  setSearchInput,
  handleSearchChange,
  letter,
  setSearchText,
}) => {
  return (
    <Box sx={{ mb: 1 }}>
      <TextField
        fullWidth
        value={value}
        onChange={(e) => {
          const v = e.target.value.toLowerCase();
          setSearchInput(v);

          if (v.trim() === "") {
            setSearchText("");
          }
        }}
        onKeyDown={(e) => {
          // 💡 แก้ให้เช็คแค่ Enter ก็เรียกฟังก์ชันเลย (ลบเงื่อนไขแปลกๆ ออก)
          if (e.key === "Enter") {
            handleSearchChange();
          }
        }}
        placeholder="Search word..."
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {/* 💡 เปลี่ยนไอคอนเป็น IconButton ให้สามารถคลิกเพื่อค้นหาได้ */}
              <IconButton 
                onClick={handleSearchChange} 
                sx={{ p: 0.5 }}
                edge="end"
              >
                <SearchIcon
                  sx={{
                    color: "#d6b46a",
                    "@media (orientation: landscape) and (max-height: 450px)": {
                      fontSize: "20px",
                    },
                  }}
                />
              </IconButton>
            </InputAdornment>
          ),
          startAdornment: (
            <InputAdornment position="start">
              <Typography
                sx={{
                  color: "#fffbe6",
                  fontFamily: `"Press Start 2P"`,
                  fontSize: 14,
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: 10,
                  },
                }}
              >
                {letter}
              </Typography>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: "40px",
          },
          "& .MuiInputBase-root": {
            fontFamily: `"Press Start 2P"`,
            fontSize: 14,
            backgroundColor: "#1a120b",
            color: "#fffbe6",
            border: "3px solid #5a3e2b",
          },
          "& input::placeholder": {
            color: "#c9b89a",
            fontSize: 9,
            pl: 1,
            opacity: 1,
          },
          "& fieldset": {
            border: "none",
          },
          "@media (orientation: landscape) and (max-height: 450px)": {
            "& .MuiOutlinedInput-root": {
              height: "28px",
            },
            "& .MuiInputBase-root": {
              fontSize: 8,
              border: "2px solid #5a3e2b",
            },
            "& input::placeholder": {
              fontSize: 6,
            },
          },
        }}
      />
    </Box>
  );
};