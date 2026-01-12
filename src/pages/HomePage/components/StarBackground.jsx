import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useMemo } from "react";

const STAR_COUNT = 70;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function StarBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }).map((_, i) => ({
        id: i,
        char: LETTERS[Math.floor(Math.random() * LETTERS.length)], // 👈 เพิ่มแค่นี้
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1 + 7,   // ❌ ไม่แก้
        opacity: Math.random() * 0.4 + 0.3,
        duration: Math.random() * 8 + 6,

        floatX: Math.random() * 40 - 20,
        floatY: Math.random() * 40 - 20,
      })),
    []
  );

  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          animate={{
            x: star.floatX,
            y: star.floatY,
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,

            /* ❌ เอาของดาวออก */
            width: star.size,
            height: star.size,

            /* ✅ แทนด้วยตัวอักษร */
            fontSize: star.size,              // ใช้ size เดิม
            fontFamily: "'Press Start 2P', monospace",
            color: "#CFAFB0",
            // textShadow: "0 0 14px rgba(255,200,200,0.9)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {star.char}
        </motion.div>
      ))}
    </Box>
  );
}
