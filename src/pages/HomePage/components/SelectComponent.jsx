import { Select, FormControl, InputLabel, MenuItem } from "@mui/material";

export const SelectComponent = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <FormControl
      sx={{ mb: 1, minWidth: { xs: 52, sm: 109, md: 121, lg: 170 } }}
      size="small"
    >
      <Select
        value={value ?? ""}
        displayEmpty
        onChange={(e) =>
          onChange(e.target.value ? String(e.target.value) : null)
        }
        renderValue={(selected) => {
          if (!selected) {
            return <span style={{ opacity: 0.6 }}>{label}</span>;
          }
          return selected;
        }}
        sx={{
          fontFamily: `"Press Start 2P"`,
          fontSize: 10,
          height: 36,
          backgroundColor: "#e7dcc8",
          border: "2px solid #2b1d14",
          boxShadow: "2px 2px 0 #2b1d14",

          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            padding: "6px 8px",
          },

          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },

          "& svg": {
            color: "#2b1d14",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: "#fdf8ef",
              border: "2px solid #2b1d14",
              boxShadow: "3px 3px 0 #2b1d14",

              maxHeight: 200, // ⭐ คุมความสูง
            },
          },
        }}
      >
        <MenuItem
          value=""
          sx={{
            fontFamily: `"Press Start 2P"`,
            fontSize: 10,
            opacity: 0.6,
          }}
        >
          ALL
        </MenuItem>

        {options?.map((opt) => (

          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{
              fontFamily: `"Press Start 2P"`,
              fontSize: 10,
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
