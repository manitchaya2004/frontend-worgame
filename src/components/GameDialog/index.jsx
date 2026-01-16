import React from 'react';
import { Dialog, Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// --- RpgButton Component (ตามที่คุณให้มา) ---
// ผมปรับแก้ font-family เป็น "Press Start 2P" เพื่อให้เข้ากับเกมนะครับ
const RpgButton = ({ children, onClick, color = "wood", style = {} }) => {
    const themes = {
        wood: {
            bg: "linear-gradient(to bottom, #4a3b2a, #2b2218)",
            border: "#6b543a",
            text: "#d1c4b6",
            shadow: "#1a1410"
        },
        gold: {
            bg: "linear-gradient(to bottom, #8c734b, #59452b)",
            border: "#f1c40f",
            text: "#fff",
            shadow: "#3e2f1b"
        },
        red: {
            bg: "linear-gradient(to bottom, #922b21, #641e16)",
            border: "#e74c3c",
            text: "#ffdede",
            shadow: "#4a120d"
        },
        green: {
            bg: "linear-gradient(to bottom, #27ae60, #145a32)",
            border: "#2ecc71",
            text: "#e8f8f5",
            shadow: "#0b3b24"
        }
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
                fontSize: "14px", // ปรับขนาด font ให้พอดีกับปุ่ม
                fontFamily: '"Press Start 2P", monospace', // ใช้ font pixel ให้เข้ากับเกม
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
                ...style
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

// --- GameDialog Component ที่แก้ไขแล้ว ---
export const GameDialog = ({
    open,
    title,
    description,
    confirmText = "START",
    cancelText = "BACK",
    onConfirm,
    onCancel,
}) => {
    return (
        <Dialog
            open={open}
            // ทำให้พื้นหลังของ MUI Dialog โปร่งใส เพื่อให้เห็น style ของ motion.div ที่เราสร้างเอง
            PaperProps={{
                style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'visible' // เพื่อให้เงาของกรอบไม่ถูกตัด
                }
            }}
            
        >
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{
                            // Style ของ Container ตามแบบที่ต้องการ (อ้างอิงจาก image_3.png)
                            background: "#19120e",
                            width: "400px",
                            padding: "30px 25px",
                            borderRadius: "12px",
                            // สร้างกรอบสองชั้น สีทองด้านใน สีเข้มด้านนอก
                            border: "3px solid #8c734b",
                            boxShadow: "0 0 0 5px #0f0a08, 0 20px 60px rgba(0,0,0,0.9)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "25px",
                            position: "relative",
                            alignItems: 'center'
                        }}
                    >
                        {/* หัวข้อ (Title) */}
                        <Typography
                            sx={{
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: "20px",
                                color: "#f1c40f", // สีทอง
                                textAlign: "center",
                                textShadow: "2px 2px 0 #000",
                                textTransform: "uppercase",
                                lineHeight: 1.5,
                                letterSpacing: '1px'
                            }}
                        >
                            {title}
                        </Typography>

                        {/* คำอธิบาย (Description) */}
                        {description && (
                            <Typography
                                sx={{
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: "12px",
                                    textAlign: "center",
                                    color: "#d1c4b6", // สีครีมอ่อน อ่านง่ายบนพื้นเข้ม
                                    lineHeight: 1.8,
                                    mb: 1
                                }}
                            >
                                {description}
                            </Typography>
                        )}

                        {/* ปุ่มกด (Buttons) */}
                        <Box sx={{ display: "flex", flexDirection: 'column', gap: 2, width: '100%' }}>
                            {/* ปุ่มยืนยัน ใช้สีทอง */}
                            <RpgButton onClick={onConfirm} color="gold">
                                {confirmText}
                            </RpgButton>

                            {/* ปุ่มยกเลิก ใช้สีแดง */}
                            <RpgButton onClick={onCancel} color="red">
                                {cancelText}
                            </RpgButton>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </Dialog>
    );
};