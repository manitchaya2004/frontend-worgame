import {
  Box,
  Typography,
  Grid,
  Tooltip,
  Button,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { THEMES } from "../../hook/const";
import { useAuthStore } from "../../../../store/useAuthStore";
import ItemCard from "./ItemCard";

import BackpackIcon from "@mui/icons-material/Backpack";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";

import { GiHealthPotion, GiMagicPotion, GiBubblingFlask,GiStandingPotion } from "react-icons/gi";

const MotionBox = motion(Box);
const ItemFeature = () => {
  const { currentUser, updateResources, resourceStatus } = useAuthStore();

  // const isLoading = resourceStatus === "LOADING";
  const [isLoading, setIsLoading] = useState(false);
  const potions = currentUser?.potion || {};
  const {
    health = 0,
    heal_lv = 1,
    cure = 0,
    cure_lv = 1,
    reroll = 0,
    reroll_lv = 1,
    max_slot = 3,
  } = potions;

  // state
  const [inventoryPotions, setInventoryPotions] = useState({
    health: health,
    cure: cure,
    reroll: reroll,
  });

  useEffect(() => {
    setInventoryPotions({
      health,
      cure,
      reroll,
    });
  }, [health, cure, reroll]);

  const currentUsed =
    inventoryPotions.health + inventoryPotions.cure + inventoryPotions.reroll;

  // เช็คว่ามีการแก้ไขหรือไม่? (เพื่อเปิด/ปิดปุ่ม Save)
  const isEdit =
    inventoryPotions.health !== health ||
    inventoryPotions.cure !== cure ||
    inventoryPotions.reroll !== reroll;

  const handleEquip = (type, changeAmount) => {
    // แก้ไขแค่ใน Local State ไม่ยิง API
    setInventoryPotions((prev) => {
      let newData = { ...prev };

      // คำนวณค่าใหม่
      if (type === "heal") newData.health += changeAmount;
      if (type === "cure") newData.cure += changeAmount;
      if (type === "reroll") newData.reroll += changeAmount;

      // Validate
      const newTotal = newData.health + newData.cure + newData.reroll;
      if (newTotal > max_slot) return prev; // เกิน Slot
      if (newData.health < 0 || newData.cure < 0 || newData.reroll < 0)
        return prev; // ต่ำกว่า 0

      return newData;
    });
  };

  const handleReset = () => {
    setInventoryPotions({ health, cure, reroll });
  };

  //save  บันทึกลง api
  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateResources({
        heal: inventoryPotions.health,
        cure: inventoryPotions.cure,
        reroll: inventoryPotions.reroll,
      });
    } catch (error) {
      console.error("Failed to update resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (type) => {
    console.log(`Upgrade ${type}`);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <MotionBox
        initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
        animate={{
          opacity: 1,
          scale: 1,
          y: "-50%",
          x: "-50%",
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        sx={{
          position: "fixed",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",

          // Container Design (Book/Panel style)
          background: `linear-gradient(${THEMES.bgMain}, #1a120b)`,
          border: `8px solid ${THEMES.border}`,
          borderRadius: "12px",
          boxShadow: `
            0 0 0 4px #1a120b,
            0 20px 60px rgba(49, 49, 49, 0.8)
          `,
          width: { xs: "90%", sm: "80%", md: "80%", lg: "65%" },
          height: "550px",
          p: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Title */}
        <Box
          sx={{
            py: 2,
            textAlign: "center",
            background: "#1a120b",
            mx: -1,
            mt: -1,

            borderBottom: `4px solid ${THEMES.border}`,
          }}
        >
          {/* Title กลางจริง */}
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEMES.accent,
              fontSize: { xs: 16, md: 26 },
              letterSpacing: "2px",
              textTransform: "uppercase",
              textShadow: `3px 3px 0 #000, 0 0 10px ${THEMES.accent}`,
            }}
          >
            Support Item
          </Typography>
        </Box>

        {/* เนื้อหารายละเอียดที่จะใส่  ItemCard+Detail */}
        <Box
          sx={{
            backgroundColor: "#3e2723",
            mx: 2,
            mt: 2,
            mb: 1,
            p: 2,
            borderRadius: "12px",
            border: "2px solid #5d4037",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "inset 0 0 8px rgba(0,0,0,0.6)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <BackpackIcon sx={{ color: "#d7ccc8", fontSize: 28 }} />
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 10,
                  color: "#aaa",
                  mb: 0.5,
                }}
              >
                CAPACITY
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 16,
                  color: "#fff",
                }}
              >
                {currentUsed} / {max_slot}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {Array.from({ length: max_slot }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 24,
                  height: 36,
                  backgroundColor: i < currentUsed ? "#ffca28" : "#2b1d14",
                  border:
                    i < currentUsed ? "2px solid #ff6f00" : "2px solid #4e342e",
                  borderRadius: "4px",
                  boxShadow:
                    i < currentUsed ? "0 0 8px #ffb300" : "inset 0 0 4px #000",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* === ITEM GRID === */}
        <Box
          sx={{
            mt:1,
            width: "100%",
            height: "100%",
          }}
        >
          <Box sx={{ gap: 5, alignItems: "center", justifyContent: "center", display: "flex",mr:2, ml:2 }}>
            <ItemCard
              type="heal"
              label="HEAL"
              icon={<GiHealthPotion />}
              level={heal_lv}
              count={inventoryPotions.health}
              maxLimit={max_slot}
              currentTotal={currentUsed}
              onEquip={handleEquip}
              onUpgrade={() => handleUpgrade("heal")}
            />

            <ItemCard
              type="clean"
              label="CLEAN"
              icon={<GiStandingPotion />}
              level={cure_lv}
              count={inventoryPotions.cure}
              maxLimit={max_slot}
              currentTotal={currentUsed}
              onEquip={handleEquip}
              onUpgrade={() => handleUpgrade("cure")}
            />

            <ItemCard
              type="reroll"
              label="REROLL"
              icon={<GiMagicPotion />}
              level={reroll_lv}
              count={inventoryPotions.reroll}
              maxLimit={max_slot}
              currentTotal={currentUsed}
              onEquip={handleEquip}
              onUpgrade={() => handleUpgrade("reroll")}
            />
          </Box>
        </Box>

        <Box
          sx={{
            mt: 1,
            p: 2,
            borderTop: `2px dashed ${THEMES.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          {/* RESET BUTTON */}
          <Button
            disabled={!isEdit || isLoading} // กดได้เฉพาะตอนมีการแก้
            onClick={handleReset}
            startIcon={<RestoreIcon />}
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 10,
              color: isEdit ? "#d7ccc8" : "#aaa",
              "&:hover": {
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
              "&:disabled": { color: "#605e5e" },
            }}
          >
            RESET
          </Button>

          {/* SAVE BUTTON */}
          <Button
            disabled={!isEdit || isLoading} // กดได้เฉพาะตอนมีการแก้
            onClick={handleSave}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 10,
              backgroundColor: isEdit ? "#4caf50" : "#5d4037", // สีเขียวถ้าแก้แล้ว / สีน้ำตาลถ้ายัง
              color: isEdit ? "#fff" : "#aaa",
              border: "2px solid rgba(0,0,0,0.2)",
              boxShadow: isEdit ? "0 4px 0 #1b5e20" : "none",
              transform: isEdit ? "translateY(0)" : "translateY(2px)",
              "&:hover": { backgroundColor: isEdit ? "#66bb6a" : "#5d4037" },
              "&:active": { transform: "translateY(4px)", boxShadow: "none" },
              "&:disabled": { color: "#2e1f1a" },
            }}
          >
            {isLoading ? "... SAVING" : "SAVE CHANGES"}
          </Button>
        </Box>
      </MotionBox>
    </Box>
  );
};

export default ItemFeature;
