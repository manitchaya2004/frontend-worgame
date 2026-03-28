import {
  Box,
  Typography,
  Tooltip,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "../../hook/const";
import { useAuthStore } from "../../../../store/useAuthStore";
import ItemCard from "./ItemCard";

import BackpackIcon from "@mui/icons-material/Backpack";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { FaSuitcase } from "react-icons/fa";
import {
  GiHealthPotion,
  GiMagicPotion,
  GiBubblingFlask,
  GiStandingPotion,
} from "react-icons/gi";

import { useGameSfx } from "../../../../hook/useGameSfx";
import clickSfx from "../../../../assets/sound/click1.ogg";

const MotionBox = motion(Box);
const ItemFeature = () => {
  const { currentUser, updateResources, resourceStatus } = useAuthStore();

  const playClickSound = useGameSfx(clickSfx);
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

  // สถานะสำหรับโชว์ Animation อัปเกรดกระเป๋า
  const [showUpgradeAnim, setShowUpgradeAnim] = useState(false);
  // สถานะสำหรับโชว์ Animation ตอนบันทึกสำเร็จ
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    setInventoryPotions({
      health,
      cure,
      reroll,
    });
  }, [health, cure, reroll]);

  // useEffect สำหรับเช็คว่ามีการอัปเกรด max_slot ไหม
  useEffect(() => {
    const storageKey = `last_seen_max_slot_${currentUser?.id || "guest"}`;
    const lastSeen = localStorage.getItem(storageKey);

    if (lastSeen) {
      if (parseInt(lastSeen) < max_slot) {
        setShowUpgradeAnim(true);
        localStorage.setItem(storageKey, max_slot.toString());
      }
    } else {
      localStorage.setItem(storageKey, max_slot.toString());
    }
  }, [max_slot, currentUser?.id]); // อิงตาม id แทนเพื่อป้องกันการลูปเวลา state ย่อยอัปเดต

  // แยก useEffect สำหรับนับเวลาปิด Upgrade Animation ให้ทำงานอิสระ ป้องกันบั๊กค้าง
  useEffect(() => {
    if (showUpgradeAnim) {
      const timer = setTimeout(() => {
        setShowUpgradeAnim(false);
      }, 3000); // 3 วินาทีแล้วหายไป
      return () => clearTimeout(timer);
    }
  }, [showUpgradeAnim]);

  const currentUsed =
    inventoryPotions.health + inventoryPotions.cure + inventoryPotions.reroll;

  const isEdit =
    inventoryPotions.health !== health ||
    inventoryPotions.cure !== cure ||
    inventoryPotions.reroll !== reroll;

  const handleEquip = (type, changeAmount) => {
    setInventoryPotions((prev) => {
      let newData = { ...prev };

      if (type === "heal") newData.health += changeAmount;
      if (type === "clean") newData.cure += changeAmount;
      if (type === "reroll") newData.reroll += changeAmount;

      const newTotal = newData.health + newData.cure + newData.reroll;
      if (newTotal > max_slot) return prev;
      if (newData.health < 0 || newData.cure < 0 || newData.reroll < 0)
        return prev;

      return newData;
    });
  };

  const handleReset = () => {
    setInventoryPotions({ health, cure, reroll });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateResources({
        heal: inventoryPotions.health,
        cure: inventoryPotions.cure,
        reroll: inventoryPotions.reroll,
      });

      // เมื่อบันทึกสำเร็จ ให้เปิดโชว์ Animation
      setShowSaveSuccess(true);

      // ตั้งเวลาให้ป๊อปอัปหายไปเองใน 2 วินาที
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to update resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (type) => {
    //console.log(`Upgrade ${type}`);
  };

  return (
    <Box className="ItemFeature" sx={{ height: "100vh" }}>
      <MotionBox
        className="background-item"
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
          background: `linear-gradient(${THEMES.bgMain}, #1a120b)`,
          border: `8px solid ${THEMES.border}`,
          borderRadius: "12px",
          boxShadow: `
            0 0 0 4px #1a120b,
            0 20px 60px rgba(49, 49, 49, 0.8)
          `,
          width: { xs: "90%", sm: "80%", md: "80%" },
          height: { xs: "70%", sm: "70%", md: "570px", xl: "82%" },
          p: 1,
          display: "flex",
          flexDirection: "column",
          "@media (orientation: landscape) and (max-height: 450px)": {
            top: "55%",
            transform: "translate(-50%, -50%)",
            height: "80%",
            border: `4px solid ${THEMES.border}`,
            borderRadius: "6px",
          },
        }}
      >
        {/* === 💡 อนิเมชั่น Save Success เด้งขึ้นมากลางจอ === */}
        <AnimatePresence>
          {showSaveSuccess && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.5, y: "-50%", x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, scale: 0.8, y: "-50%", x: "-50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                zIndex: 999, // ให้อยู่บนสุด
                background: "rgba(76, 175, 80, 0.95)", // สีเขียวโปร่งแสงนิดๆ
                border: "4px solid #fff",
                borderRadius: "16px",
                padding: "20px 40px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.5), inset 0 0 15px rgba(255,255,255,0.3)",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 60, color: "#fff" }} />
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  color: "#fff",
                  fontSize: { xs: 12, md: 16 },
                  textShadow: "2px 2px 0 #000",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                EQUIPMENT
                <br />
                SAVED!
              </Typography>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Header Title */}
        <Box
          className="Title-Item"
          sx={{
            flexShrink: 0, 
            py: 2,
            textAlign: "center",
            background: "#1a120b",
            mx: -1,
            mt: -1,
            borderBottom: `4px solid ${THEMES.border}`,
            "@media (orientation: landscape) and (max-height: 450px)": {
              py: 1,
              mb: 1,
              borderBottom: `2px solid ${THEMES.border}`,
            },
          }}
        >
          <Typography
            id="Support Item"
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEMES.accent,
              fontSize: { xs: 16, md: 26 },
              letterSpacing: "2px",
              textTransform: "uppercase",
              textShadow: `3px 3px 0 #000, 0 0 10px ${THEMES.accent}`,
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 12,
                textShadow: `2px 2px 0 #000, 0 0 6px ${THEMES.accent}`,
              },
            }}
          >
            Support Item
          </Typography>
        </Box>

        {/* เนื้อหารายละเอียดที่จะใส่  ItemCard+Detail */}
        <Box
          sx={{
            flexShrink: 0, 
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
            gap: 2,
            position: "relative",
            overflow: "hidden",
            "@media (orientation: landscape) and (max-height: 450px)": {
              borderRadius: "6px",
              border: "1px solid #5d4037",
              mt: 0,
              mb: 0.5,
              py: 0.5, // 🌟 รีดไขมัน
              px: 1.5,
              gap: 1, // 🌟 รีดไขมัน
            },
          }}
        >
          {/* === 💡 อนิเมชั่น Upgrade ความจุกระเป๋า เด้งขึ้นมาตรงกลางจอ === */}
          <AnimatePresence>
            {showUpgradeAnim && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255, 215, 0, 0.3)",
                  backdropFilter: "blur(3px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  boxShadow: "inset 0 0 20px rgba(255, 215, 0, 0.8)",
                  border: "2px solid #ffd700",
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    border: "1px solid #ffd700",
                  },
                }}
              >
                <MotionBox
                  initial={{ y: 20, scale: 0.5, opacity: 0 }}
                  animate={{
                    y: 0,
                    scale: [1, 1.1, 1],
                    opacity: 1,
                  }}
                  transition={{
                    y: { type: "spring", stiffness: 300, damping: 20 },
                    scale: {
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut",
                    },
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      color: "#ffd700",
                      fontSize: { xs: 12, md: 18 },
                      textShadow: "2px 2px 0 #000, 0 0 10px #ffd700",
                      "@media (orientation: landscape) and (max-height: 450px)":
                        {
                          fontSize: 8,
                          textShadow: "1px 1px 0 #000, 0 0 10px #ffd700",
                        },
                    }}
                  >
                    ✨ CAPACITY UPGRADED! ✨
                  </Typography>
                </MotionBox>
              </MotionBox>
            )}
          </AnimatePresence>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexShrink: 0,
              "#icon-bag": {
                color: "#d7ccc8",
                fontSize: 28,

                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 14, // 🌟 รีดไขมันไอคอน
                },
              },
            }}
          >
            <FaSuitcase id="icon-bag" />
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 10,
                  color: "#aaa",
                  mb: 0.5,
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: 7,
                    mb: 0,
                  },
                }}
              >
                CAPACITY
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 16,
                  color: "#fff",
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: 9, // 🌟 รีดไขมันฟอนต์
                  },
                }}
              >
                {currentUsed} / {max_slot}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              flex: 1,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              maxHeight: "35px",
              overflowY: "auto",
              p: 0.5,
              borderRadius: 1,
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#5d4037",
                borderRadius: "4px",
              },
            }}
          >
            {Array.from({ length: max_slot }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: { xs: 12, md: 16 },
                  height: { xs: 20, md: 24 },
                  flexShrink: 0,
                  backgroundColor: i < currentUsed ? "#ffca28" : "#2b1d14",
                  border:
                    i < currentUsed ? "2px solid #ff6f00" : "2px solid #4e342e",
                  borderRadius: "2px",
                  boxShadow:
                    i < currentUsed ? "0 0 4px #ffb300" : "inset 0 0 4px #000",
                  transition: "all 0.3s ease",
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    height: 14, // 🌟 ย่อหลอดเหลืองให้เตี้ยลง
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* === ITEM GRID === */}
        <Box
          sx={{
            mt: 1,
            width: "100%",
            flexGrow: 1, // ยืดกินพื้นที่ที่เหลือ
            minHeight: 0, // บังคับไม่ให้ล้นออกนอกจอ
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            "@media (orientation: landscape) and (max-height: 450px)": {
              mt: 0.5,
            },
          }}
        >
          <Box
            sx={{
              gap: { xs: 1, sm: 5, xl: 2 },
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              flexDirection: "row",
              height: "100%", 
              maxHeight: { xs: "320px", sm: "400px", md: "100%" }, 
              mx: 2,
              "@media (orientation: landscape) and (max-height: 450px)": {
                height: "100%", 
                maxHeight: "100%",
                gap: 1.5, 
              },
            }}
          >
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
              description="Restores 1 HP"
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
              description="Cleanses 1 random negative status."
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
              description="Rerolls all brain slots."
            />
          </Box>
        </Box>

        <Box
          sx={{
            flexShrink: 0, 
            mt: 1,
            p: 2,
            borderTop: `2px dashed ${THEMES.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            backgroundColor: "rgba(0,0,0,0.2)",
            "@media (orientation: landscape) and (max-height: 450px)": {
              mt: 0.5,
              p: 0.5, // 🌟 รีดไขมัน
            },
          }}
        >
          {/* RESET BUTTON */}
          <Button
            disabled={!isEdit || isLoading}
            onClick={() => {
              playClickSound();
              handleReset();
            }}
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
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 8,
                py: 0.5,
              },
            }}
          >
            RESET
          </Button>

          {/* SAVE BUTTON */}
          <Button
            disabled={!isEdit || isLoading}
            onClick={() => {
              playClickSound();
              handleSave();
            }}
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
              backgroundColor: isEdit ? "#4caf50" : "#5d4037",
              color: isEdit ? "#fff" : "#aaa",
              border: "2px solid rgba(0,0,0,0.2)",
              boxShadow: isEdit ? "0 4px 0 #1b5e20" : "none",
              transform: isEdit ? "translateY(0)" : "translateY(2px)",
              "&:hover": { backgroundColor: isEdit ? "#66bb6a" : "#5d4037" },
              "&:active": { transform: "translateY(4px)", boxShadow: "none" },
              "&:disabled": { color: "#2e1f1a" },
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 8,
                py: 0.5,
              },
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