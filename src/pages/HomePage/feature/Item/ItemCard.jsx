import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

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
          border: `1px solid ${color}`,
          borderRadius: "6px",
          p: 1, 
          gap: 0.5,
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

      {/* 1. HEADER & ICON BOX (🌟 ครอบรวมกันเพื่อให้ยืดหดได้) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          flexGrow: 1, 
          justifyContent: "center", // 🌟 เพิ่มบรรทัดนี้: จัดให้อยู่ตรงกลางการ์ดเสมอเมื่อจอสูงหรือโดน Zoom out
          minHeight: 0, 
          gap: { xs: 2, md: 3, xl: 4 }, // 🌟 ให้ช่องว่างขยายตามหน้าจอใหญ่
          "@media (orientation: landscape) and (max-height: 450px)": {
            gap: 0.5,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            flexShrink: 0, 
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
                  fontSize: 9,
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
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: 12,
                  },
                }}
              />
            </Tooltip>
          </Box>
        </Box>

        {/* ไอคอนโพชั่น */}
        <Box
          sx={{
            width: { xs: 120, sm: 140, md: "60%", xl: "70%" }, // 🌟 ปรับให้กว้างขึ้นตามสัดส่วนจอใหญ่
            flexGrow: 1, 
            minHeight: 0, 
            maxHeight: { xs: "120px", md: "200px", xl: "60%" }, // 🌟 เปลี่ยนจากการล็อคตายตัว ให้สามารถขยายได้สูงสุด 60% ของพื้นที่
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: color,
            "& svg": { fontSize: { xs: 50, sm: 100, md: 120, xl: 160 } }, // 🌟 ไอคอนจะขยายใหญ่ขึ้นเมื่อจอใหญ่
            "@media (orientation: landscape) and (max-height: 450px)": {
              width: "100%", 
              maxHeight: "100%", 
              "& svg": { fontSize: 40 }, 
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
          flexShrink: 0, 
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
                padding: "2px",
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
                padding: "2px",
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