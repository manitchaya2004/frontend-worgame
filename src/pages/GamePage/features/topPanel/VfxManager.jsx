import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const VfxManager = ({ gameState, isShaking }) => {
  const [showSpeedLines, setShowSpeedLines] = useState(false);

  useEffect(() => {
    if (gameState === "ADVANTURE") {
      setShowSpeedLines(true);
    } else {
      setShowSpeedLines(false);
    }
  }, [gameState]);

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
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: "110%", y: `${Math.random() * 100}%` }}
                animate={{ x: "-110%" }}
                transition={{
                  duration: 0.3 + Math.random() * 0.4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
                style={{
                  position: "absolute",
                  width: "100px",
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  boxShadow: "0 0 10px rgba(255,255,255,0.2)"
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

      {/* Screen Vignette for intensity */}
      <div style={{
        position: "absolute",
        inset: 0,
        boxShadow: "inset 0 0 150px rgba(0,0,0,0.4)",
        pointerEvents: "none"
      }} />
    </div>
  );
};
