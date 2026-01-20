// src/pages/GamePage/features/Menu.jsx
import { motion } from "framer-motion";
import { GiHamburgerMenu, GiDungeonGate } from "react-icons/gi";
import { useGameStore } from "../../../../store/useGameStore";

export const GameMenu = ({ onExit }) => {
  const store = useGameStore();

  return (
    <>
      {/* 1. ปุ่มเมนู (Menu Button) */}
      <div
        onClick={() => store.setMenuOpen(true)}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          cursor: "pointer",
          background: "linear-gradient(to bottom, #2b2b2b, #0a0a0a)",
          border: "2px solid #333",
          borderTopColor: "#555",
          borderBottomColor: "#000",
          borderRadius: "6px",
          padding: "8px 12px",
          boxShadow: "0 4px 0 #0f0a08, 0 6px 6px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.1s",
          color: "#e6c88b",
          fontFamily: '"Cinzel", serif',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "translateY(3px)";
          e.currentTarget.style.boxShadow =
            "0 1px 0 #0f0a08, inset 0 2px 5px rgba(0,0,0,0.5)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 4px 0 #0f0a08, 0 6px 6px rgba(0,0,0,0.5)";
        }}
      >
        <GiHamburgerMenu size={24} color="#f1c40f" />
      </div>

      {/* 2. MENU OVERLAY (Pause Menu) */}
      {store.isMenuOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(3px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: "rgba(20, 20, 20, 0.95)",
              width: "320px",
              padding: "25px 20px",
              borderRadius: "12px",
              border: "1px solid #4d3a2b",
              boxShadow: "0 0 30px rgba(0,0,0,1)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                borderBottom: "1px solid #4d3a2b",
                paddingBottom: "15px",
                marginBottom: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#f1c40f",
                  fontSize: "2rem",
                  fontFamily: '"Cinzel", serif',
                  textShadow: "0 2px 5px rgba(0,0,0,1)",
                  letterSpacing: "3px",
                  fontWeight: "900",
                }}
              >
                PAUSED
              </h2>
            </div>

            {/* CONTINUE BUTTON */}
            <RpgButton onClick={() => store.setMenuOpen(false)} color="gold">
              <span>CONTINUE</span>
            </RpgButton>

            {/* BGM TOGGLE */}
            <RpgButton onClick={() => store.toggleBgm()} color="wood">
              <span>{store.isBgmOn ? "BGM: ON" : "BGM: OFF"}</span>
            </RpgButton>

            {/* SFX TOGGLE */}
            <RpgButton onClick={() => store.toggleSfx()} color="wood">
              <span>{store.isSfxOn ? "SFX: ON" : "SFX: OFF"}</span>
            </RpgButton>

            <div
              style={{
                height: "10px",
                borderTop: "1px solid #4d3a2b",
                marginTop: "5px",
              }}
            />

            {/* EXIT BUTTON */}
            <RpgButton
              onClick={() => {
                store.setMenuOpen(false);
                if (onExit) onExit();
              }}
              color="red"
            >
              <GiDungeonGate size={22} /> <span>EXIT GAME</span>
            </RpgButton>
          </motion.div>
        </div>
      )}
    </>
  );
};

const RpgButton = ({ children, onClick, color = "wood", style = {} }) => {
    // Color Schemes
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
                fontSize: "18px",
                fontFamily: '"Cinzel", serif',
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