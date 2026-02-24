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
          animate={{ opacity: 0.95, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{
            background: "rgba(244, 228, 188, 0.95)", 
            border: "2px solid #5c4033",
            padding: "5px 12px 14px 12px",
            borderRadius: "4px", 
            textAlign: "center",
            boxShadow: "0 3px 0 rgba(92, 64, 51, 0.3)", 
            width: "fit-content", 
            minWidth: "200px",
            maxWidth: "400px",
            minHeight: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <span style={{ 
            fontSize: "9px",
            color: "#8d6e63", 
            fontWeight: "900", 
            textTransform: "uppercase", 
            marginBottom: "3px",
            letterSpacing: "1px",
            borderBottom: "1px dashed rgba(92, 64, 51, 0.3)",
            paddingBottom: "2px",
            width: "80%",
            flexShrink: 0 
          }}>
            — {currentTypeName} —
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
                  background: "#e8d5b5", 
                  border: "1px solid #b89768",
                  padding: "2px 6px",
                  borderRadius: "2px", 
                  fontSize: "12px",
                  color: "#4a2c11", 
                  fontWeight: "bold",
                  boxShadow: "0 1px 0 rgba(92, 64, 51, 0.2)", 
                  whiteSpace: "nowrap"
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
  background: "#5c4033",
  color: "#f4e4bc",
  border: "2px solid #3a251c", 
  borderRadius: "3px",
  width: "24px",
  height: "28px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 0 rgba(92, 64, 51, 0.4)", 
  zIndex: 10
};