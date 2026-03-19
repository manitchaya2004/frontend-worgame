import { Select, FormControl, InputLabel, MenuItem } from "@mui/material";
import { useGameSfx } from "../../../hook/useGameSfx";
import clickSFX from "../../../assets/sound/click1.ogg";
import clickMouseSFX from "../../../assets/sound/mouserelease1.ogg";

export const SelectComponent = ({ label, value, onChange, options, sx }) => {
  const playClickSound = useGameSfx(clickSFX);
  const playMouseClickSound = useGameSfx(clickMouseSFX);

  const handleChange = (e) => {
    playMouseClickSound();
    onChange(e.target.value ? String(e.target.value) : null);
  };

  return (
    <FormControl
      sx={{
        minWidth: 0, // 💡 รีเซ็ตเพื่อให้บีบเล็กลงได้สุดๆ
        width: "100%", // ให้กินเต็มพื้นที่กล่อง flex ของตัวเอง
        ...sx, // นำ flex: 1 ที่ส่งมาจาก parent มาใช้งาน
      }}
      size="small"
    >
      <Select
        value={value ?? ""}
        displayEmpty
        onChange={handleChange}
        onOpen={() => playClickSound()}
        renderValue={(selected) => {
          if (!selected) {
            return <span style={{ opacity: 0.6 }}>{label}</span>;
          }
          return selected;
        }}
        sx={{
          fontFamily: `"Press Start 2P"`,
          fontSize: 10,
          height: 40, // 💡 ปรับให้สูงเท่า Search bar (40px) จะได้เป๊ะ
          backgroundColor: "#e7dcc8",
          border: "2px solid #2b1d14",
          boxShadow: "2px 2px 0 #2b1d14",

          "& .MuiSelect-select": {
            display: "block", // 💡 เปลี่ยนเป็น block เพื่อให้ ellipsis ทำงานได้ตอนโดนบีบ
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            padding: "8px", // ปรับ padding นิดหน่อยให้เข้ากับจอ
          },

          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },

          "& svg": {
            color: "#2b1d14",
          },
          "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 8,
            height: 28, // สูงเท่า Search bar แนวนอน
            "& .MuiSelect-select": {
              padding: "4px 6px",
            },
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: "#fdf8ef",
              border: "2px solid #2b1d14",
              boxShadow: "3px 3px 0 #2b1d14",

              maxHeight: 200, // ⭐ คุมความสูง
              "@media (orientation: landscape) and (max-height: 450px)": {
                 border: "1px solid #2b1d14",
              boxShadow: "2px 2px 0 #2b1d14",

              maxHeight: 150, // ⭐ คุมความสูง
                },
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
