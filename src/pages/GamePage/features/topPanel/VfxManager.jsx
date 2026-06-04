import React, { useEffect, useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const VfxManager = memo(({ gameState, isShaking }) => {
  const [showSpeedLines, setShowSpeedLines] = useState(false);

  useEffect(() => {
    if (gameState === "ADVANTURE") {
      setShowSpeedLines(true);
    } else {
      setShowSpeedLines(false);
    }
  }, [gameState]);

  // Pre-calculate speed line animation parameters once
  const speedLines = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      y: `${(i * 7 + Math.random() * 5) % 100}%`,
      duration: 0.3 + Math.random() * 0.4,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 1000,
      overflow: "hidden"
    }}>
      {/* Speed Lines during Adventure */}
      <AnimatePresence>
        {showSpeedLines && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0 }}
          >
            {speedLines.map((line) => (
              <motion.div
                key={line.id}
                initial={{ x: "110%", y: line.y }}
                animate={{ x: "-110%" }}
                transition={{
                  duration: line.duration,
                  repeat: Infinity,
                  delay: line.delay,
                  ease: "linear"
                }}
                style={{
                  position: "absolute",
                  width: "100px",
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  boxShadow: "0 0 10px rgba(255,255,255,0.2)",
                  willChange: "transform",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hit Flash */}
      <AnimatePresence>
        {isShaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "white",
              zIndex: 2000
            }}
          />
        )}
      </AnimatePresence>

      <div style={{
        position: "absolute",
        inset: 0,
        boxShadow: "inset 0 0 150px rgba(0,0,0,0.4)",
        pointerEvents: "none"
      }} />
    </div>
  );
});
