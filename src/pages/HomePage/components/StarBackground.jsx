import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useMemo, memo } from "react";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const StarBackground = memo(() => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const starCount = isMobile ? 35 : 70;

  const stars = useMemo(() => {
    return Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      char: LETTERS[Math.floor(Math.random() * LETTERS.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1 + 7,
      opacity: Math.random() * 0.4 + 0.3,
      duration: Math.random() * 8 + 6,
      floatX: Math.random() * 40 - 20,
      floatY: Math.random() * 40 - 20,
      animDuration: 3 + Math.random() * 2,
    }));
  }, []);

  const visibleStars = useMemo(() => stars.slice(0, starCount), [starCount, stars]);

  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
      {visibleStars.map((star) => (
        <motion.div
          key={star.id}
          animate={{
            x: star.floatX,
            y: star.floatY,
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: star.animDuration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            fontSize: star.size,
            fontFamily: "'Press Start 2P', monospace",
            color: "#CFAFB0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            userSelect: "none",
            willChange: "transform",
          }}
        >
          {star.char}
        </motion.div>
      ))}
    </Box>
  );
});

export default StarBackground;

