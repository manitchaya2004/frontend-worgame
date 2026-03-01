import React from "react";
import {
  Dialog,
  Box,
  Typography,
  Slide,
  IconButton,
  Slider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// 💡 Import ไอคอนสำหรับแถบปรับเสียง
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

// --- RpgButton Component ---
const RpgButton = ({ children, onClick, color = "wood", style = {} }) => {
  const themes = {
    wood: {
      bg: "linear-gradient(to bottom, #4a3b2a, #2b2218)",
      border: "#6b543a",
      text: "#d1c4b6",
      shadow: "#1a1410",
    },
    gold: {
      bg: "linear-gradient(to bottom, #8c734b, #59452b)",
      border: "#f1c40f",
      text: "#fff",
      shadow: "#3e2f1b",
    },
    red: {
      bg: "linear-gradient(to bottom, #922b21, #641e16)",
      border: "#e74c3c",
      text: "#ffdede",
      shadow: "#4a120d",
    },
    green: {
      bg: "linear-gradient(to bottom, #27ae60, #145a32)",
      border: "#2ecc71",
      text: "#e8f8f5",
      shadow: "#0b3b24",
    },
  };

  const theme = themes[color] || themes.wood;

  return (
    <button
      onClick={onClick}
      style={{
        background: theme.bg,
        border: `2px solid ${theme.border}`,
        borderBottom: `4px solid ${theme.border}`,
        borderRadius: "6px",
        color: theme.text,
        padding: "12px 20px",
        fontSize: "12px", // 💡 ขนาดตัวอักษรปุ่มพอดีๆ
        fontFamily: '"Press Start 2P", monospace',
        fontWeight: "bold",
        cursor: "pointer",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        textShadow: "0 2px 2px rgba(0,0,0,0.8)",
        boxShadow: `0 4px 0 ${theme.shadow}, 0 5px 10px rgba(0,0,0,0.4)`,
        transition: "all 0.1s",
        textTransform: "uppercase",
        position: "relative",
        ...style,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(4px)";
        e.currentTarget.style.boxShadow = `0 0 0 ${theme.shadow}, inset 0 2px 5px rgba(0,0,0,0.5)`;
        e.currentTarget.style.borderBottomWidth = "2px";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 0 ${theme.shadow}, 0 5px 10px rgba(0,0,0,0.4)`;
        e.currentTarget.style.borderBottomWidth = "4px";
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = "brightness(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "brightness(1)";
      }}
    >
      {children}
    </button>
  );
};

// --- GameDialog Component ---
export const GameDialog = ({
  open,
  title,
  description,
  confirmText = "START",
  cancelText = "BACK",
  confirmColor = "gold", 
  cancelColor = "red",
  onConfirm,
  onCancel,

  // 💡 Props สำหรับเสียง (เอากลับมาแล้ว!)
  showAudioSettings = false, 
  volume = 0.5,
  isMuted = false,
  onVolumeChange,
  onToggleMute,
}) => {
  return (
    <Dialog
      open={open}
      PaperProps={{
        style: {
          backgroundColor: "transparent",
          boxShadow: "none",
          overflow: "visible",
        },
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{
              background: "#19120e",
              width: "420px", // ขยายความกว้างนิดนึง
              padding: "30px 25px",
              borderRadius: "12px",
              border: "3px solid #8c734b",
              boxShadow: "0 0 0 5px #0f0a08, 0 20px 60px rgba(0,0,0,0.9)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "relative",
              alignItems: "center",
            }}
          >
            {/* หัวข้อ (Title) */}
            <Typography
              sx={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: "18px",
                color: "#f1c40f",
                textAlign: "center",
                textShadow: "2px 2px 0 #000",
                textTransform: "uppercase",
                lineHeight: 1.5,
                letterSpacing: "1px",
              }}
            >
              {title}
            </Typography>

            {/* 🔊 THE FIX: คืนชีพแถบปรับเสียง! จะแสดงเฉพาะตอนส่ง showAudioSettings=true มา */}
            {showAudioSettings && (
              <Box sx={{ width: "100%", mb: 1 }}>
                <Typography
                  sx={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 10,
                    color: "#8c734b",
                    mb: 1,
                    textAlign: "left",
                  }}
                >
                  AUDIO SETTINGS
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    p: 2,
                    borderRadius: 2,
                    border: "2px solid #2b2218",
                  }}
                >
                  <IconButton
                    onClick={onToggleMute}
                    sx={{
                      color: isMuted ? "#e74c3c" : "#f1c40f",
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </IconButton>

                  <Slider
                    value={isMuted ? 0 : volume}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={onVolumeChange}
                    disabled={isMuted}
                    sx={{
                      color: "#f1c40f",
                      "& .MuiSlider-thumb": {
                        width: 20,
                        height: 20,
                        backgroundColor: "#8c734b",
                        border: `2px solid #f1c40f`,
                        borderRadius: "4px", 
                        boxShadow: "0 2px 0 #000",
                      },
                      "& .MuiSlider-track": {
                        border: "none",
                        height: 8,
                      },
                      "& .MuiSlider-rail": {
                        opacity: 0.5,
                        backgroundColor: "#000",
                        height: 8,
                      },
                    }}
                  />
                </Box>
              </Box>
            )}
            
            {/* คำอธิบาย (เปลี่ยนฟอนต์ให้อ่านง่ายตาแตก) */}
            {description && (
              <Box
                sx={{
                  width: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid #3a2a18",
                  borderRadius: "6px",
                  padding: "16px",
                  boxSizing: "border-box",
                  boxShadow: "inset 0 2px 5px rgba(0,0,0,0.5)",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Prompt', 'Kanit', 'Arial', sans-serif",
                    fontSize: "15px",
                    textAlign: "center",
                    color: "#e8dcc4",
                    lineHeight: 1.6,
                  }}
                >
                  {description}
                </Typography>
              </Box>
            )}

            {/* ปุ่มกดซ้าย-ขวา */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row", // 💡 วางแนวนอน
                gap: 2,
                width: "100%",
                mt: 1,
              }}
            >
              <RpgButton onClick={onCancel} color={cancelColor} style={{ flex: 1 }}>
                {cancelText}
              </RpgButton>
              <RpgButton onClick={onConfirm} color={confirmColor} style={{ flex: 1 }}>
                {confirmText}
              </RpgButton>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};