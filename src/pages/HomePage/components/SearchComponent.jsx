import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const SearchComponent = ({ value, onChange, onSearch  }) => {
  return (
    <TextField
      placeholder="Search spell..."
      variant="outlined"
      value={value}
      onChange={onChange}
      onKeyDown={
        (e) => {
          if (e.key === "Enter" && onSearch) {
            onSearch();
          }
        }
      }
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="start">
            <IconButton
              onClick={onSearch}
              sx={{
                p: 0.5,
                color: "#5c3a1e",
                "&:hover": {
                  backgroundColor: "rgba(92,58,30,0.15)",
                },
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: 42,
          fontSize: "14px",
          backgroundColor: "#f5e6c8", // สีไม้สว่าง
          borderRadius: "6px",

          /* 🌲 WOOD FRAME */
          border: "3px solid #5c3a1e",
          boxShadow: "inset 0 2px 0 #e7d3a1, 0 4px 0 #3e2615",

          transition: "all 0.15s ease-out",

          "& fieldset": {
            border: "none", // ใช้ border เอง
          },

          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "inset 0 2px 0 #e7d3a1, 0 6px 0 #3e2615",
          },

          "&.Mui-focused": {
            transform: "translateY(-2px)",
            boxShadow:
              "inset 0 2px 0 #fff1c1, 0 6px 0 #3e2615, 0 0 0 2px #c99a3a",
          },
        },

        "& input": {
          fontWeight: "bold",
          color: "#3e2615",
        },

        "& input::placeholder": {
          color: "#6b4a2d",
          opacity: 0.8,
        },
      }}
    />
  );
};
