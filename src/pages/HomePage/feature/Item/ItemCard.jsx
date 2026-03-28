import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"; // เพิ่ม icon info

// sound
import { useGameSfx } from "../../../../hook/useGameSfx";
import equipSfx from "../../../../assets/sound/click3.ogg";

const ITEM_COLORS = {
  heal: "#e57373", // แดงตุ่นๆ
  clean: "#ffffff", // ขาว
  reroll: "#64b5f6", // ฟ้าตุ่นๆ
};

// ข้อมูลสำหรับ Tooltip
const ITEM_DESCRIPTIONS = {
  heal: "Restores 1 HP",
  clean: "Cleanses 1 random negative status.",
  reroll: "Rerolls all brain slots.",
};

const ItemCard = ({
  type, // 'heal', 'clean', 'reroll'
  label,
  icon,
  level,
  count, // จำนวนที่เลือกพกไป
  maxLimit, // Max Slot รวม (เพื่อเช็คว่าเพิ่มได้มั้ย)
  currentTotal, // จำนวนที่พกไปทั้งหมดตอนนี้
  onEquip, // function เพิ่ม/ลด
  onUpgrade, // function อัปเกรด
}) => {
  const color = ITEM_COLORS[type] || "#fff";
  const description = ITEM_DESCRIPTIONS[type] || "";
  const canAdd = currentTotal < maxLimit;
  const canRemove = count > 0;

  const playEquipSound = useGameSfx(equipSfx);

  return (
    <Box
      sx={{
        width: { xs: 200, sm: 250, xl: "100%" },
        height: "100%", 
        backgroundColor: "#2b1d14",
        border: `3px solid ${color}`,
        borderRadius: "12px",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        boxShadow: "0 4px 0 rgba(0,0,0,0.5)",
        position: "relative",
        overflow: "hidden",
        "@media (orientation: landscape) and (max-height: 450px)": {
          height: "100%",
          border: `1px solid ${color}`, // 🌟 ลดความหนาเส้นขอบ
          borderRadius: "6px",
          
        },
      }}
    >
      {/* Background Effect */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          background: color,
          filter: "blur(40px)",
          opacity: 0.2,
        }}
      />

      {/* 1. HEADER: Icon & Name & Tooltip */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexDirection: "column",
          height: "100%",
          justifyContent: "",
          "@media (orientation: landscape) and (max-height: 450px)": {
            gap: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: { xs: 10, sm: 16, xl: 18 },
                color: color,
                textTransform: "uppercase",
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 10,
                },
              }}
            >
              {label}
            </Typography>

            {/* Tooltip section */}
            <Tooltip
              title={description}
              arrow
              placement="top"
              enterTouchDelay={0} 
              slotProps={{
                tooltip: {
                  sx: {
                    fontSize: { sm: "12px", xl: "16px" },
                    fontFamily: "'Verdana', sans-serif",
                    backgroundColor: "#2a160f",
                    border: `1px solid black`,
                    color: "gray",
                  },
                },
                arrow: { sx: { color: "#000000" } },
              }}
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: { xs: 14, sm: 18, xl: 22 },
                  color: "#aaa",
                  cursor: "help",
                  "&:hover": { color: color },
                }}
              />
            </Tooltip>
          </Box>
        </Box>

        <Box
          sx={{
            width: { xs: 120, sm: 140 },
            height: "70%",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: color,
            "& svg": { fontSize: { xs: 50, sm: 100, xl: 150 } },
           "@media (orientation: landscape) and (max-height: 450px)": {
              width: 50, // 🌟 บีบให้แคบสุดๆ
              height: 35, // 🌟 ความลับอยู่ที่ตรงนี้! ย่อกล่องสีดำลงให้เตี้ยที่สุด
              "& svg": { fontSize: 22 }, // 🌟 ย่อไอคอนให้พอดีกล่อง
            },
          }}
        >
          {icon}
        </Box>
      </Box>

      {/* 3. EQUIP CONTROLS (Slot Management) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: "auto",
          pt: 1,
          borderTop: "2px dashed #3e2723",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 0 },
          "@media (orientation: landscape) and (max-height: 450px)": {
             pt: 0.5,
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: { xs: 8, sm: 10 },
            color: "#fff",
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 7,
            },
          }}
        >
          CARRY:
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => {
              playEquipSound();
              onEquip(type, -1);
            }}
            disabled={!canRemove}
            sx={{
              backgroundColor: "#3e2723",
              color: "#fff",
              borderRadius: "4px",
              padding: "4px",
              "&:disabled": { opacity: 0.3 },
              "@media (orientation: landscape) and (max-height: 450px)": {
                borderRadius: "2px",
                padding: "2px", // 🌟 รีดไขมันปุ่มกด
              },
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>

          <Box sx={{ width: 30, textAlign: "center" }}>
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: 14,
                color: count > 0 ? "#fff" : "#555",
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 8,
                },
              }}
            >
              {count}
            </Typography>
          </Box>

          <IconButton
            onClick={() => {
              playEquipSound();
              onEquip(type, 1);
            }}
            disabled={!canAdd}
            sx={{
              backgroundColor: canAdd ? "#4caf50" : "#856c67",
              color: "#fff",
              borderRadius: "4px",
              padding: "4px",
              "@media (orientation: landscape) and (max-height: 450px)": {
                borderRadius: "2px",
                padding: "2px", // 🌟 รีดไขมันปุ่มกด
              },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ItemCard;