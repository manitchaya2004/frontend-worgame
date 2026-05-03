import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../../../store/useGameStore";

export const MeaningPopup = ({ entries }) => {
  // ✅ ดึงสถานะปัจจุบันจาก Store
  const { validWordInfo, setWordDisplayIndex } = useGameStore();

  if (!validWordInfo || !entries) return null;

  const types = validWordInfo.displayTypes || [];
  const currentIndex = validWordInfo.currentDisplayIndex || 0;
  const currentTypeName = types[currentIndex] || "";
  const currentMeanings = entries[currentTypeName] || [];

  if (types.length === 0) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % types.length;
    setWordDisplayIndex(nextIdx);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + types.length) % types.length;
    setWordDisplayIndex(prevIdx);
  };

  const customScrollbar = `
    .retro-scroll::-webkit-scrollbar {
      width: 3px;
    }
    .retro-scroll::-webkit-scrollbar-track {
      background: rgba(92, 64, 51, 0.05);
      border-radius: 4px;
    }
    .retro-scroll::-webkit-scrollbar-thumb {
      background: #b89768;
      border-radius: 4px;
    }
    .retro-scroll::-webkit-scrollbar-thumb:hover {
      background: #5c4033;
    }
  `;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "150px",
        left: 0,
        width: "100%",
        zIndex: 999,
        pointerEvents: "none",
      }}
    >
      <style>{customScrollbar}</style>

      <div style={{ 
        position: "absolute", 
        top: 0, 
        left: "50%", 
        transform: "translateX(-50%)", 
        pointerEvents: "auto", 
        display: "flex", 
        alignItems: "center" 
      }}>
        
        {types.length > 1 && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev} 
            style={{ ...outerArrowStyle, left: "-30px" }}
          >
            {"<"}
          </motion.button>
        )}

        <motion.div
          key={currentTypeName}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{
            background: "var(--color-panel-light)", 
            border: "2px solid var(--color-primary)",
            padding: "8px 16px 16px 16px",
            borderRadius: "12px", 
            textAlign: "center",
            boxShadow: "var(--shadow-lg), inset 0 0 20px rgba(212,175,55,0.1)", 
            width: "fit-content", 
            minWidth: "220px",
            maxWidth: "450px",
            minHeight: "50px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            backdropFilter: "blur(12px)",
          }}
        >
          <span style={{ 
            fontSize: "11px",
            color: "var(--color-primary)", 
            fontWeight: "900", 
            textTransform: "uppercase", 
            marginBottom: "6px",
            letterSpacing: "2px",
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "4px",
            width: "100%",
            flexShrink: 0,
            fontFamily: "var(--font-game)"
          }}>
            {currentTypeName}
          </span>

          <div 
            className="retro-scroll"
            style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "4px",
              justifyContent: "center", 
              alignItems: "center",     
              width: "100%",
              maxHeight: "75px",
              overflowY: "auto",
              margin: "0 auto",        
              padding: "0 2px"
            }}
          >
            {currentMeanings.map((m, idx) => (
              <span 
                key={idx}
                style={{
                  background: "rgba(255,255,255,0.05)", 
                  border: "1px solid var(--color-border)",
                  padding: "4px 10px",
                  borderRadius: "6px", 
                  fontSize: "13px",
                  color: "var(--color-text-bright)", 
                  fontWeight: "bold",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.3)", 
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-main)"
                }}
              >
                {m}
              </span>
            ))}
          </div>

          {types.length > 1 && (
            <div style={{ position: "absolute", bottom: "1px", right: "4px", fontSize: "7px", color: "#8d6e63", fontWeight: "bold" }}>
              {currentIndex + 1}/{types.length}
            </div>
          )}
        </motion.div>

        {types.length > 1 && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext} 
            style={{ ...outerArrowStyle, right: "-30px" }}
          >
            {">"}
          </motion.button>
        )}
      </div>
    </div>
  );
};

const outerArrowStyle = {
  position: "absolute",
  background: "var(--color-panel-light)",
  color: "var(--color-primary)",
  border: "1.5px solid var(--color-primary)", 
  borderRadius: "50%",
  width: "32px",
  height: "32px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 0 rgba(92, 64, 51, 0.4)", 
  zIndex: 10
};