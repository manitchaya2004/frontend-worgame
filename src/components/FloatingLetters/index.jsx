import { motion } from "framer-motion";
import { useMemo } from "react";
import { Box } from "@mui/material";
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const FloatingLetters = () => {
  const items = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const letter = letters[Math.floor(Math.random() * letters.length)];
      return {
        id: i,
        letter,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 8,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.2,
      };
    });
  }, []);

  return (
    <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: item.opacity }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            left: `${item.x}vw`,
            fontSize: item.size,
            fontFamily: "'Press Start 2P'",
            color: "#eaeaea",
            textShadow: "0 0 6px rgba(180,160,255,0.6)",
            pointerEvents: "none",
          }}
        >
          {item.letter}
        </motion.div>
      ))}
    </Box>
  );
};
