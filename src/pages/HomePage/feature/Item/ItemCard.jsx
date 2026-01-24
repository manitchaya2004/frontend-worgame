import { Box, Typography, IconButton, Button, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import LevelBar from "../Character/LevelBar";

const ITEM_COLORS = {
  heal: "#e57373", // แดงตุ่นๆ
  cure: "#81c784", // เขียวตุ่นๆ
  reroll: "#64b5f6", // ฟ้าตุ่นๆ
};

const ItemCard = ({
  type, // 'heal', 'cure', 'reroll'
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
  const canAdd = currentTotal < maxLimit;
  const canRemove = count > 0;

  return (
    <Box
      sx={{
        width: 250,
        height: 250,
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
        
        
        
      }}
    >
      {/* Background Effect (Optional) */}
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

      {/* 1. HEADER: Icon & Name */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexDirection: "column",
        }}
      >
        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 16,
              color: color,
              textTransform: "uppercase",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 8,
              color: "#aaa",
              mt: 0.5,
            }}
          >
            Lv.{level} 
          </Typography>
          
        </Box>
        <Box
          sx={{
            width: 70,
            height: 70,
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "8px",
            // border: "2px solid #5a3e2b",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: color,
            "& svg": { fontSize: 50 },
          }}
        >
          {icon}
        </Box>
      </Box>

      {/* 2. LEVEL & UPGRADE */}
      
      <Box
        sx={{ backgroundColor: "rgba(0,0,0,0.2)", p: 1, borderRadius: "8px",mt:1.5 }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 8,
              color: "#d7ccc8",
            }}
          >
            UPGRADE
          </Typography>
          {/* Upgrade Button */}
          <Button
            size="small"
            onClick={onUpgrade}
            startIcon={<ArrowUpwardIcon sx={{ width: 14, height: 14 }} />}
            sx={{
              minWidth: "auto",
              height: 15,
              fontSize: 8,
              fontFamily: "'Press Start 2P'",
              color: "#2b1d14",
              backgroundColor: "#ffecb3",
              border: "1px solid #ffca28",
              "&:hover": { backgroundColor: "#ffca28" },
              lineHeight:1
            }}
          >
            UP
          </Button>
        </Box>

        {/* เรียกใช้ LevelBar ตัวที่คุณชอบ */}
        <LevelBar level={level} canUpgrade={false} />
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
        }}
      >
        <Typography
          sx={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: "#fff" }}
        >
          CARRY:
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => onEquip(type, -1)}
            disabled={!canRemove}
            sx={{
              backgroundColor: "#3e2723",
              color: "#fff",
              borderRadius: "4px",
              padding: "4px",
              "&:disabled": { opacity: 0.3 },
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
              }}
            >
              {count}
            </Typography>
          </Box>

          <IconButton
            onClick={() => onEquip(type, 1)}
            disabled={!canAdd}
            sx={{
              backgroundColor: canAdd ? "#4caf50" : "#856c67",
              color: "#fff",
              borderRadius: "4px",
              padding: "4px",
              // "&:disabled": { opacity: 0.3 },
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
