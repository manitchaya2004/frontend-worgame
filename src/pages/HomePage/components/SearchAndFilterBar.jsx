import {
  Stack,
  TextField,
  InputAdornment,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { THEME } from "../hook/const";

import { useGameSfx } from "../../../hook/useGameSfx";
import clickSFX from "../../../assets/sound/click1.ogg";
import clickMouseSFX from "../../../assets/sound/mouserelease1.ogg";

const controlStyle = {
  fontFamily: "'Press Start 2P'",
  fontSize: { xs: "8px", md: "10px" },
  color: THEME.textMain,
  backgroundColor: "#1a120b",
  borderRadius: "4px",
  border: `2px solid ${THEME.border}`,
  height: "40px",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiSvgIcon-root": { color: THEME.accent },
};

export const SearchAndFilterBar = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  availableTypes = [],
  secondSelectValue,
  setSecondSelectValue,
  secondSelectOptions = [], // รับค่า option ของ dropdown ตัวขวาสุด
}) => {
  const playClickSound = useGameSfx(clickSFX);
  const playMouseClickSound = useGameSfx(clickMouseSFX);

  const handleChange = (e) => {
    playMouseClickSound();
    setFilterType(e.target.value);
  };
  
  const handleChangeSecond = (e)=>{
     playMouseClickSound();
     setSecondSelectValue(e.target.value)
  }
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ mb: { xs: 2, md: 3 } }}
      justifyContent="space-between"
      alignItems="center"
    >
      <TextField
        placeholder="SEARCH WORD..."
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          ...controlStyle,
          flex: 1,
          width: "100%",
          "& .MuiOutlinedInput-root": {
            display: "flex",
            alignItems: "center",
            height: "40px",
            padding: 2,
          },
          "& .MuiOutlinedInput-input": {
            padding: "0 8px",
            display: "flex",
            alignItems: "center",
          },
          "& .MuiInputAdornment-root": {
            alignSelf: "center",
          },
           "@media (orientation: landscape) and (max-height: 450px)": {
            "& .MuiInputBase-root": {
              fontSize: 12,
             
            },
            "& input::placeholder": {
              fontSize: 9,
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon
                sx={{
                  color: "#d6b46a",
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: "20px",
                  },
                }}
              />
            </InputAdornment>
          ),
          startAdornment: (
            <InputAdornment position="start">
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: "10px",
                  color: THEME.accent,
                }}
              >
                &gt;
              </Typography>
            </InputAdornment>
          ),
          style: {
            fontFamily: "'Press Start 2P'",
            fontSize: "10px",
            color: THEME.textMain,
          },
        }}
      />

      <Stack
        direction="row"
        spacing={2}
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        {/* Dropdown 1: Filter Type */}
        <Select
          value={filterType}
          onChange={handleChange}
          onOpen={() => playClickSound()}
          sx={{
            ...controlStyle,
            minWidth: "130px",
            flex: { xs: 1, sm: "none" },
            backgroundColor: "#e7dcc8",
            color: "#2b1d14",
            "& .MuiSelect-icon": {
              color: "#2b1d14",
            },
            "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 8,
            
          },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "#fdf8ef",
                border: "2px solid #2b1d14",
                boxShadow: "3px 3px 0 #2b1d14",
                borderRadius: 0,
              },
            },
          }}
        >
          <MenuItem
            value="all"
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: "10px",
              opacity: 0.6,
            }}
          >
            ALL
          </MenuItem>
          {availableTypes.map((type) => (
            <MenuItem
              key={type}
              value={type}
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: "10px",
                color: THEME.textDark,
              }}
            >
              {type.toUpperCase()}
            </MenuItem>
          ))}
        </Select>

        {/* Dropdown 2: Dynamic (Limit / Sort) */}
        <Select
          value={secondSelectValue}
          onChange={handleChangeSecond}
          onOpen={() => playClickSound()}
          sx={{
            ...controlStyle,
            minWidth: "120px",
            flex: { xs: 1, sm: "none" },
            backgroundColor: "#e7dcc8",
            color: "#2b1d14",
            "& .MuiSelect-icon": {
              color: "#2b1d14",
            },
            "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 8,
            
          },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "#fdf8ef",
                border: "2px solid #2b1d14",
                boxShadow: "3px 3px 0 #2b1d14",
                borderRadius: 0,
              },
            },
          }}
        >
          {secondSelectOptions.map((opt) => (
            <MenuItem
              key={opt.value}
              value={opt.value}
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: "10px",
                color: THEME.textDark,
              }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Stack>
    </Stack>
  );
};
