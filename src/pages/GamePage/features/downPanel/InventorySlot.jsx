import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCloud, 
  FaBolt, 
  FaEyeSlash, 
  FaPlus, 
  FaCross,
  FaLock, 
  FaSkullCrossbones, 
  FaTint, 
  FaInfoCircle
} from "react-icons/fa";
import {
  GiCheckedShield,
  GiHealthPotion,
  GiMagicPotion,
  GiStandingPotion,
  GiVisoredHelm,
  GiHearts,
  GiBroadsword,
  GiLeatherBoot,
  GiShield,
  GiWaterDrop,
  GiTrident,
  GiBowieKnife,
  GiFangs,
  GiStarsStack,
  GiBrain
} from "react-icons/gi";
import { useGameStore } from "../../../../store/useGameStore";
import { DeckManager } from "../../../../utils/gameSystem";

// ==========================================
// 🔮 BUFF HELPER
// ==========================================

const BUFF_DEFINITION_MAP = {
  "double-dmg": { icon: <GiBroadsword />, color: "#c0392b" },
  "double-guard": { icon: <GiShield />, color: "#2980b9" },
  "double-shield": { icon: <GiShield />, color: "#2980b9" },
  "mana-plus": { icon: <GiWaterDrop />, color: "#00bcd4" },
  "shield-plus": { icon: <GiTrident />, color: "#e67e22" },
  "add_bleed": { icon: <GiBowieKnife />, color: "#8b0000" },
  "add_poison": { icon: <FaCloud />, color: "#27ae60" },
  "add_posion": { icon: <FaCloud />, color: "#27ae60" },
  "add_stun": { icon: <FaBolt />, color: "#f39c12" },
  "add_blind": { icon: <FaEyeSlash />, color: "#8e44ad" },
  "heal": { icon: <FaPlus />, color: "#2ecc71" },
  "bless": { icon: <FaCross />, color: "#f1c40f" },
  "vampire_fang": { icon: <GiFangs />, color: "#8b0000" },
};

const defaultBuffDef = { icon: <GiStarsStack />, color: "#95a5a6" };

const canHover = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
};

/* ===== Reusable Pixel Bar ===== */
const PixelBar = ({
  current,
  max,
  color,
  height = "18px",
  labelColor = "#fff",
  labelText = "",
  tooltipTitle = "",
  tooltipDesc = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const allowHover = useMemo(() => canHover(), []);
  const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;

  return (
    <div
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={allowHover ? () => setIsHovered(true) : undefined}
      onMouseLeave={allowHover ? () => setIsHovered(false) : undefined}
      onTouchStart={() => setIsHovered(false)}
    >
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", gap: "4px", cursor: "default" }}>
        <span style={{ fontSize: "14px", fontWeight: "900", color: color, textShadow: "1px 1px 0 #000", fontFamily: "monospace", minWidth: "22px", textAlign: "left", lineHeight: 1 }}>
          {labelText}
        </span>
        <div style={{ position: "relative", flex: 1, height: height, background: "#1a1a1a", border: "1px solid #3d2e24", borderRadius: "4px", overflow: "hidden", boxShadow: "inset 0 0 5px rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${percent}%`, background: color, transition: "width 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }} />
          <span style={{ position: "relative", fontSize: "10px", fontWeight: "900", color: labelColor, textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000", zIndex: 5, lineHeight: 1, fontFamily: "monospace, sans-serif" }}>
            {Number.isInteger(current) ? current : parseFloat(current.toFixed(1))} / {max}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {allowHover && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              background: "rgba(15, 11, 8, 0.95)",
              border: "1px solid #d4af37",
              borderRadius: "6px",
              padding: "8px 10px",
              minWidth: "140px",
              zIndex: 100,
              pointerEvents: "none",
              boxShadow: "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              whiteSpace: "nowrap"
            }}
          >
            <div style={{ position: "absolute", bottom: "-5px", left: "50%", marginLeft: "-5px", width: "10px", height: "10px", background: "rgba(15, 11, 8, 0.95)", borderRight: "1px solid #d4af37", borderBottom: "1px solid #d4af37", transform: "rotate(45deg)" }} />
            <span style={{ color: color, fontSize: "12px", fontWeight: "bold", fontFamily: "'Palatino', serif" }}>{tooltipTitle}</span>
            <span style={{ color: "#bdc3c7", fontSize: "11px" }}>{tooltipDesc}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ===== Mini Stat Box ===== */
const MiniStatBox = ({ icon, value, label, color, tooltipDesc }) => {
  const [isHovered, setIsHovered] = useState(false);
  const allowHover = useMemo(() => canHover(), []);

  return (
    <div
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={allowHover ? () => setIsHovered(true) : undefined}
      onMouseLeave={allowHover ? () => setIsHovered(false) : undefined}
      onTouchStart={() => setIsHovered(false)}
    >
      <div style={{ background: "rgba(20,20,20,0.6)", border: "1px solid #3d2e24", borderRadius: "4px", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "default", boxShadow: "inset 0 0 5px rgba(0,0,0,0.8)" }}>
        <div style={{ color: color, fontSize: "18px", display: "flex" }}>{icon}</div>
        <span style={{ color: "#fff", fontSize: "14px", fontWeight: "900", fontFamily: "monospace" }}>{value}</span>
      </div>

      <AnimatePresence>
        {allowHover && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.15 }}
            style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", background: "rgba(15, 11, 8, 0.95)", border: "1px solid #d4af37", borderRadius: "6px", padding: "6px 8px", minWidth: "100px", zIndex: 100, pointerEvents: "none", boxShadow: "0 4px 8px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", whiteSpace: "nowrap" }}
          >
            <div style={{ position: "absolute", bottom: "-4px", left: "50%", marginLeft: "-4px", width: "8px", height: "8px", background: "rgba(15, 11, 8, 0.95)", borderRight: "1px solid #d4af37", borderBottom: "1px solid #d4af37", transform: "rotate(45deg)" }} />
            <span style={{ color: color, fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>{label}</span>
            <span style={{ color: "#bdc3c7", fontSize: "10px" }}>{tooltipDesc}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ===== Potion Slot ===== */
const PotionSlot = ({ icon, count, color, label, description, onClick, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);
  const allowHover = useMemo(() => canHover(), []);
  const isDisabled = count <= 0 || disabled;

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseEnter={allowHover ? () => setIsHovered(true) : undefined}
      onMouseLeave={allowHover ? () => setIsHovered(false) : undefined}
      onTouchStart={() => setIsHovered(false)}
    >
      <motion.div
        onClick={!isDisabled ? onClick : undefined}
        whileHover={!isDisabled && allowHover ? { scale: 1.02, filter: "brightness(1.15)" } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        style={{ position: "relative", background: isDisabled ? "rgba(20,20,20,0.6)" : "linear-gradient(180deg, rgba(30,30,30,0.5) 0%, rgba(10,10,10,0.9) 100%)", border: `1px solid #3d2e24`, borderRadius: "8px", height: "90px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: isDisabled ? "default" : "pointer", boxShadow: isDisabled ? "none" : "inset 0 0 10px rgba(0,0,0,0.8)", transition: "border 0.2s", opacity: isDisabled ? 0.6 : 1 }}
      >
        <div style={{ position: "absolute", top: "6px", fontSize: "9px", color: "#8b7355", fontWeight: "bold", letterSpacing: "1px" }}>{label}</div>
        <div style={{ fontSize: "45px", color: !isDisabled ? color : "#444", filter: !isDisabled ? "drop-shadow(0px 0px 8px rgba(255,255,255,0.2))" : "grayscale(100%) opacity(0.5)", transform: "translateY(5px)" }}>{icon}</div>
        <div style={{ position: "absolute", bottom: "4px", right: "6px", background: count > 0 ? "#c0392b" : "#555", color: "#fff", fontSize: "12px", fontWeight: "900", borderRadius: "4px", padding: "2px 6px", boxShadow: "0 2px 4px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)" }}>x{count}</div>
      </motion.div>

      <AnimatePresence>
        {allowHover && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.15 }}
            style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", background: "rgba(15, 11, 8, 0.95)", border: "1px solid #d4af37", borderRadius: "6px", padding: "8px 10px", minWidth: "120px", zIndex: 100, pointerEvents: "none", boxShadow: "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)", display: "flex", flexDirection: "column", gap: "4px", whiteSpace: "nowrap" }}
          >
            <div style={{ position: "absolute", bottom: "-5px", left: "50%", marginLeft: "-5px", width: "10px", height: "10px", background: "rgba(15, 11, 8, 0.95)", borderRight: "1px solid #d4af37", borderBottom: "1px solid #d4af37", transform: "rotate(45deg)" }} />
            <span style={{ color: color, fontSize: "12px", fontWeight: "bold", fontFamily: "'Palatino', serif" }}>{label} POTION</span>
            <span style={{ color: "#bdc3c7", fontSize: "11px" }}>{description}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ===== 🟢 Mini Buff Icon ===== */
const MiniBuffIcon = ({ effectName, isActive }) => {
  const buff = BUFF_DEFINITION_MAP[effectName] || defaultBuffDef;
  return (
    <div style={{
      width: "24px", 
      height: "24px",
      backgroundColor: isActive ? buff.color : "#333", 
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: isActive ? "#fff" : "#777", 
      fontSize: "14px",
      border: isActive ? "1.5px solid #fff" : "1px solid #555",
      boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.5)" : "none",
      filter: isActive ? "none" : "grayscale(80%)", 
      transition: "all 0.3s ease"
    }}>
      {buff.icon}
    </div>
  );
};

export const PlayerStatusCard = ({ onHeal, onCure, onReroll }) => {
  const { playerData, username, gameState } = useGameStore();
  const [isShieldHovered, setIsShieldHovered] = useState(false);
  const [isDeckHovered, setIsDeckHovered] = useState(false);
  const allowHover = useMemo(() => canHover(), []);

  if (!playerData) return null;

  const {
    name = "Hero", hp = 0, max_hp = 0, mana = 0, max_mana = 0, shield = 0, potions = { health: 0, reroll: 0, cure: 0 },
    power = 0, speed = 0,
    deck_list = [], draw_pile = [] 
  } = playerData;

  const isActionDisabled = gameState !== "PLAYERTURN";

  const deckIconsToRender = useMemo(() => {
    if (!deck_list || deck_list.length === 0) return [];

    const totalCounts = {};
    deck_list.forEach(card => {
      if (!card || !card.effect) return;
      totalCounts[card.effect] = (totalCounts[card.effect] || 0) + 1;
    });

    const remainingCounts = {};
    draw_pile.forEach(card => {
      if (!card || !card.effect) return;
      remainingCounts[card.effect] = (remainingCounts[card.effect] || 0) + 1;
    });

    const icons = [];
    Object.entries(totalCounts).forEach(([effect, totalAmount]) => {
      const remainingAmount = remainingCounts[effect] || 0;
      
      for (let i = 0; i < totalAmount; i++) {
        icons.push({
          effectName: effect,
          isActive: i < remainingAmount 
        });
      }
    });

    return icons;
  }, [deck_list, draw_pile]);

  return (
    <div style={{ 
      width: "25%", background: "#0c0a09", border: "2px solid #3d2e24", borderRadius: "8px",
      padding: "12px", display: "flex", flexDirection: "column", gap: "8px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.6), inset 0 0 15px rgba(61,46,36,0.1)",
      height: "fit-content", justifyContent: "space-between"
    }}>
      {/* HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #3d2e24", paddingBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <GiVisoredHelm style={{ fontSize: "24px", color: "#d4af37" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "10px", color: "#8b7355", fontWeight: "bold", textTransform: "uppercase" }}>{username || "PLAYER"}</span>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#f5d76e", textShadow: "0 2px 0 #000" }}>{name || "UNKNOWN"}</div>
          </div>
        </div>

        <div
          style={{ position: "relative" }}
          onMouseEnter={allowHover ? () => setIsShieldHovered(true) : undefined}
          onMouseLeave={allowHover ? () => setIsShieldHovered(false) : undefined}
          onTouchStart={() => setIsShieldHovered(false)}
        >
          <div style={{ position: "relative", width: "32px", height: "32px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "default" }}>
            <GiCheckedShield style={{ fontSize: "32px", color: shield > 0 ? "#3498db" : "#444" }} />
            <span style={{ position: "absolute", fontSize: "12px", fontWeight: "900", color: "#fff", zIndex: 2, marginTop: "2px", textShadow: "0px 0px 3px #000" }}>{shield}</span>
          </div>

          <AnimatePresence>
            {allowHover && isShieldHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                transition={{ duration: 0.15 }}
                style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", background: "rgba(15, 11, 8, 0.95)", border: "1px solid #d4af37", borderRadius: "6px", padding: "8px 10px", minWidth: "120px", zIndex: 100, pointerEvents: "none", boxShadow: "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)", display: "flex", flexDirection: "column", gap: "4px", whiteSpace: "nowrap" }}
              >
                <div style={{ position: "absolute", bottom: "-5px", left: "50%", marginLeft: "-5px", width: "10px", height: "10px", background: "rgba(15, 11, 8, 0.95)", borderRight: "1px solid #d4af37", borderBottom: "1px solid #d4af37", transform: "rotate(45deg)" }} />
                <span style={{ color: "#3498db", fontSize: "12px", fontWeight: "bold", fontFamily: "'Palatino', serif" }}>SHIELD: {shield}</span>
                <span style={{ color: "#bdc3c7", fontSize: "11px" }}>Absorbs incoming damage.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* HP & MANA BARS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
        <PixelBar labelText="HP" current={hp} max={max_hp} color="#4dff8b" height="14px" tooltipTitle={`Health: ${hp}/${max_hp}`} tooltipDesc="Your life points." />
        <PixelBar labelText="MP" current={mana} max={max_mana} color="#4dcdff" height="14px" tooltipTitle={`Mana: ${mana}/${max_mana}`} tooltipDesc="Used to cast special skills." />
      </div>

      {/* 3 STATS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginTop: "2px" }}>
        <MiniStatBox icon={<GiHearts />} label="HP" value={max_hp} color="#ff4d4d" tooltipDesc="Maximum health points." />
        <MiniStatBox icon={<GiBroadsword />} label="ATK" value={power} color="#e67e22" tooltipDesc="Letter limit. Exceeding this causes recoil damage." />
        <MiniStatBox icon={<GiLeatherBoot />} label="SPEED" value={speed} color="#f1c40f" tooltipDesc="Determines turn order in battle." />
      </div>

      {/* Potions Grid */}
      <div style={{ marginTop: "4px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
        <PotionSlot label="HEAL" icon={<GiHealthPotion />} color="#e74c3c" count={potions.health || 0} description="Restores 1 HP." onClick={onHeal} disabled={isActionDisabled} />
        <PotionSlot label="CLEAN" icon={<GiStandingPotion />} color="#ffffff" count={potions.cure || 0} description="Cleanses 1 random negative status." onClick={onCure} disabled={isActionDisabled} />
        <PotionSlot label="ROLL" icon={<GiMagicPotion />} color="#3498db" count={potions.reroll || 0} description="Rerolls all brain slots." onClick={onReroll} disabled={isActionDisabled} />
      </div>

      {/* DECK STATUS */}
      <div
        style={{ position: "relative", width: "100%", marginTop: "4px" }}
        onMouseEnter={allowHover ? () => setIsDeckHovered(true) : undefined}
        onMouseLeave={allowHover ? () => setIsDeckHovered(false) : undefined}
        onTouchStart={() => setIsDeckHovered(false)}
      >
        <div style={{
          background: "rgba(20,20,20,0.6)",
          border: "1px solid #3d2e24",
          borderRadius: "6px",
          padding: "4px", 
          display: "flex",
          justifyContent: "center", 
          alignItems: "center",
          boxShadow: "inset 0 0 5px rgba(0,0,0,0.8)",
          cursor: "default",
          minHeight: "44px" 
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px", width: "100%" }}>
            {deckIconsToRender.map((item, idx) => (
              <MiniBuffIcon key={`deck-buff-${idx}`} effectName={item.effectName} isActive={item.isActive} />
            ))}
          </div>
        </div>

        {/* Tooltip ของ Deck */}
        <AnimatePresence>
          {allowHover && isDeckHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
              transition={{ duration: 0.15 }}
              style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", background: "rgba(15, 11, 8, 0.95)", border: "1px solid #d4af37", borderRadius: "6px", padding: "8px 10px", minWidth: "160px", zIndex: 100, pointerEvents: "none", boxShadow: "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)", display: "flex", flexDirection: "column", gap: "4px", whiteSpace: "nowrap" }}
            >
              <div style={{ position: "absolute", bottom: "-5px", left: "50%", marginLeft: "-5px", width: "10px", height: "10px", background: "rgba(15, 11, 8, 0.95)", borderRight: "1px solid #d4af37", borderBottom: "1px solid #d4af37", transform: "rotate(45deg)" }} />
              <span style={{ color: "#9b59b6", fontSize: "12px", fontWeight: "bold", fontFamily: "'Palatino', serif" }}>BUFF DECK</span>
              <span style={{ color: "#bdc3c7", fontSize: "11px", whiteSpace: "normal" }}>Bright icons are remaining in draw pile.<br />Dim icons are currently on the board or used.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SingleSlot = ({ index, maxSlot }) => {
  const store = useGameStore();
  const [isHovered, setIsHovered] = useState(false);
  const allowHover = useMemo(() => canHover(), []);

  const inventory = store.playerData.inventory;
  const isPlayerTurn = store.gameState === "PLAYERTURN";

  const item = inventory[index] ?? null;
  const isLocked = index >= maxSlot; 
  const isDisabled = !isPlayerTurn;

  let displayDamage = 0;
  if (item) {
    displayDamage = DeckManager.getLetterDamage(item.char);
  }

  const isStunned = item?.status === "stun";
  const isPoisoned = item?.status === "poison";
  const isBlind = item?.status === "blind";
  const isBleed = item?.status === "bleed";
  const duration = item?.statusDuration || 0;
  const buffType = item?.buff || null;

  const isVowel = item ? ['A', 'E', 'I', 'O', 'U'].includes(item.char.toUpperCase()) : false;
  const letterType = isBlind ? "Unknown" : (isVowel ? "Vowel" : "Consonant");

  const getBuffBadgeData = () => {
    if (isBlind || !buffType) return null;
    switch (buffType) {
      case "double-dmg": return { icon: <GiBroadsword />, bgColor: "#c0392b" };
      case "double-guard":
      case "double-shield": return { icon: <GiShield />, bgColor: "#2980b9" }; 
      case "mana-plus": return { icon: <GiWaterDrop />, bgColor: "#00bcd4" };
      case "shield-plus": return { icon: <GiTrident />, bgColor: "#e67e22" };
      case "add_bleed": return { icon: <GiBowieKnife />, bgColor: "#8b0000" }; 
      case "add_poison":
      case "add_posion": return { icon: <FaCloud />, bgColor: "#27ae60" }; 
      case "add_stun": return { icon: <FaBolt />, bgColor: "#f39c12" }; 
      case "add_blind": return { icon: <FaEyeSlash />, bgColor: "#8e44ad" }; 
      case "heal": return { icon: <FaPlus />, bgColor: "#2ecc71" }; 
      case "bless": return { icon: <FaCross />, bgColor: "#f1c40f" }; 
      case "vampire_fang": return { icon: <GiFangs />, bgColor: "#8b0000" }; 
      default: return null;
    }
  };

  const buffBadge = getBuffBadgeData();

  const getSlotBackground = () => {
    if (isBlind) return "linear-gradient(145deg,#2c003e,#000000)";
    if (isStunned) return "linear-gradient(145deg,#f39c12,#e67e22)"; // ⚡ Stunned Background: สีส้ม-เหลือง
    if (isPoisoned) return "linear-gradient(145deg,#d4fcd4,#a2e0a2)";
    if (isBleed) return "linear-gradient(145deg,#e74c3c,#922b21)";
    return "linear-gradient(145deg,#ffffff,#e8dcc4)";
  };

  const onSelect = () => {
    if (isDisabled || isStunned || isLocked || !item) return;
    store.selectLetter(item, index);
  };

  const getTooltipBuffInfo = () => {
    switch (buffType) {
      case "double-dmg": return { desc: " Double score on strike", color: "#e74c3c", icon: <GiBroadsword /> };
      case "double-guard":
      case "double-shield": return { desc: " Double score on guard", color: "#3498db", icon: <GiShield /> };
      case "mana-plus": return { desc: " Gain 5 mana", color: "#00bcd4", icon: <GiWaterDrop /> };
      case "shield-plus": return { desc: " Gain 1 shield on strike", color: "#e67e22", icon: <GiTrident /> };
      case "add_bleed": return { desc: " 100% Chance to Bleed target (stack based)", color: "#e74c3c", icon: <GiBowieKnife /> };
      case "add_poison":
      case "add_posion": return { desc: " 100% Chance to Poison target (stack based)", color: "#2ecc71", icon: <FaCloud /> };
      case "add_stun": return { desc: " 100% Chance to Stun target (stack based)", color: "#f1c40f", icon: <FaBolt /> };
      case "add_blind": return { desc: " 100% Chance to Blind target (stack based)", color: "#8e44ad", icon: <FaEyeSlash /> };
      case "heal": return { desc: " Heal 1 HP on guard", color: "#2ecc71", icon: <FaPlus /> };
      case "bless": return { desc: " Cleanses 1 Debuff on guard", color: "#f1c40f", icon: <FaCross /> };
      case "vampire_fang": return { desc: " 100% Chance to Lifesteal 50% dmg", color: "#8b0000", icon: <GiFangs /> };
      default: return null;
    }
  };

  const getTooltipDebuffInfo = () => {
    if (isStunned) return { desc: ` Stunned for ${duration} turn(s)`, color: "#f39c12", icon: <FaBolt /> };
    if (isPoisoned) return { desc: ` Takes damage (${duration} turns left)`, color: "#2ecc71", icon: <FaSkullCrossbones /> };
    if (isBlind) return { desc: ` Blinded (${duration} turns left)`, color: "#8e44ad", icon: <FaEyeSlash /> };
    if (isBleed) return { desc: ` Bleeding (${duration} turns left)`, color: "#e74c3c", icon: <FaTint /> };
    return null;
  };

  const tooltipBuff = getTooltipBuffInfo();
  const tooltipDebuff = getTooltipDebuffInfo();
  const hasSpecialEffect = tooltipBuff || tooltipDebuff;

  return (
    <div
      style={{ position: "relative", padding: "2px", width: "100%", height: "100%", boxSizing: "border-box" }}
      onMouseEnter={allowHover ? () => setIsHovered(true) : undefined}
      onMouseLeave={allowHover ? () => setIsHovered(false) : undefined}
      onTouchStart={() => setIsHovered(false)}
    >
      <div style={{
          width: "100%", height: "100%",
          background: isLocked ? "rgba(10,10,10,0.8)" : "rgba(30,30,30,0.3)",
          border: `1px solid ${isLocked ? "#333" : "#5c4033"}`,
          borderRadius: "6px", display: "flex", justifyContent: "center",
          alignItems: "center", position: "relative", overflow: "visible", 
      }}>
        <AnimatePresence mode="popLayout">
          {item && !isLocked && (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                filter: isStunned ? "brightness(1.1) drop-shadow(0 0 4px rgba(243, 156, 18, 0.4))" : "none" 
              }}
              exit={{ opacity: 0, scale: 0.2 }}
              whileHover={!isDisabled && !isStunned && allowHover ? { scale: 1.05 } : {}}
              onClick={onSelect}
              style={{
                width: "92%", height: "94%", background: getSlotBackground(),
                borderRadius: "5px", display: "flex", justifyContent: "center",
                alignItems: "center", position: "relative", boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                cursor: (isDisabled || isStunned) ? "not-allowed" : "pointer"
              }}
            >
              <span style={{ 
                zIndex: 1, fontWeight: 900, fontSize: isBlind ? "32px" : "24px",
                fontFamily: "'Palatino', serif",
                color: isBlind ? "#fff" : (isPoisoned ? "#1b5e20" : isBleed ? "#fadbd8" : isStunned ? "rgba(44, 62, 80, 0.4)" : "#3e2723"),
                textShadow: isBlind ? "0px 0px 8px rgba(255,255,255,0.4)" : "0.5px 1px 0px rgba(255,255,255,0.5)", lineHeight: 1,
                opacity: isStunned ? 0.4 : 1 // ⚡ จางลงเพื่อให้ดูเหมือนโดนช็อตจนใช้งานไม่ได้
              }}>
                {isBlind ? "?" : item.char}
              </span>

              <AnimatePresence>
                {buffBadge && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                      position: "absolute", bottom: "-6px", left: "-6px",   
                      width: "18px", height: "18px", backgroundColor: buffBadge.bgColor,
                      borderRadius: "50%", display: "flex", alignItems: "center",
                      justifyContent: "center", color: "#fff", fontSize: "11px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.5)", border: "1.5px solid #fff", zIndex: 10, 
                    }}
                  >
                    {buffBadge.icon}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {item.status && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                      position: "absolute", top: "-2px", left: "-2px", width: "14px", height: "14px",
                      background: isBlind ? "#8e44ad" : (isPoisoned ? "#2ecc71" : (isBleed ? "#c0392b" : "#f39c12")),
                      borderRadius: "50%", fontSize: "8px", color: "#fff", fontWeight: "bold",
                      display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid #fff", zIndex: 11,
                    }}
                  >
                    {duration}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(isPoisoned || isStunned || isBlind || isBleed) && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }} style={{ position: "absolute", top: "3px", right: "3px", zIndex: 2 }}
                  >
                    {isPoisoned && !isBlind && !isBleed && <FaSkullCrossbones style={{ color: "#27ae60", fontSize: "11px" }} />}
                    {isStunned && <FaBolt style={{ color: "#fff", fontSize: "11px" }} />}
                    {isBlind && <FaEyeSlash style={{ color: "#bdc3c7", fontSize: "12px" }} />}
                    {isBleed && <FaTint style={{ color: "#922b21", fontSize: "11px" }} />}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isBlind && (
                <div style={{ 
                  position: "absolute", bottom: "1px", right: "3px", fontSize: "10px", fontWeight: 800, 
                  opacity: isStunned ? 0.1 : 0.6, zIndex: 2, color: "#3e2723" 
                }}>
                  {displayDamage}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {isLocked && <div style={{ opacity: 0.3, color: "#555", fontSize: "12px" }}><FaLock /></div>}
      </div>

      <AnimatePresence>
        {allowHover && isHovered && item && !isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: "50%", background: "rgba(15, 11, 8, 0.95)", 
              border: "1px solid #d4af37", borderRadius: "6px", padding: "8px 10px", minWidth: "160px",
              zIndex: 100, pointerEvents: "none", boxShadow: "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)",
              display: "flex", flexDirection: "column", gap: "6px", whiteSpace: "nowrap"
            }}
          >
            <div style={{
              position: "absolute", bottom: "-5px", left: "50%", marginLeft: "-5px", width: "10px", height: "10px",
              background: "rgba(15, 11, 8, 0.95)", borderRight: "1px solid #d4af37", borderBottom: "1px solid #d4af37", transform: "rotate(45deg)",
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(212,175,55,0.3)", paddingBottom: "4px" }}>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: "bold", fontFamily: "'Palatino', serif" }}>{isBlind ? "?" : `${item.char} - ${letterType}`}</span>
              <span style={{ color: "#d4af37", fontSize: "12px", fontWeight: "900" }}>Score: {isBlind ? "?" : displayDamage}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {tooltipBuff && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ color: tooltipBuff.color, fontSize: "12px" }}>{tooltipBuff.icon}</div>
                  <span style={{ color: "#bdc3c7", fontSize: "11px", fontWeight: "bold" }}>{tooltipBuff.desc}</span>
                </div>
              )}
              {tooltipDebuff && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ color: tooltipDebuff.color, fontSize: "12px" }}>{tooltipDebuff.icon}</div>
                  <span style={{ color: "#bdc3c7", fontSize: "11px", fontWeight: "bold" }}>{tooltipDebuff.desc}</span>
                </div>
              )}
              {!hasSpecialEffect && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ color: "#7f8c8d", fontSize: "12px" }}><FaInfoCircle /></div>
                  <span style={{ color: "#bdc3c7", fontSize: "11px" }}>Standard letter</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const InventorySlot = () => {
  const store = useGameStore();
  const isPlayerTurn = store.gameState === "PLAYERTURN";
  const isEnemyTurn = store.gameState === "ENEMYTURN";
  const isAction = store.gameState === "ACTION";
  
  const isBoardActive = isPlayerTurn || isEnemyTurn || isAction;
  
  // 🌟 Logic ใหม่: คำนวณ Slot ที่ปลดล็อคจาก Power (8 + power) แต่ไม่เกิน 20
  const playerPower = store.playerData?.power || 0;
  const calculatedMaxSlot = Math.min(8 + playerPower, 20);

  return (
    <div style={{
        width: "30%", height: "95%", background: "rgba(0,0,0,0.4)", 
        border: isEnemyTurn ? "2px solid #e74c3c" : "1px solid #4d3a2b", 
        boxShadow: isEnemyTurn ? "0 0 15px rgba(231, 76, 60, 0.4)" : "none",
        borderRadius: "10px",
        display: "flex", flexDirection: "column", padding: "10px", 
        filter: isBoardActive ? "none" : "grayscale(0.6) brightness(0.7)", 
        transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", borderBottom: isEnemyTurn ? "1px solid #e74c3c" : "1px solid #4d3a2b", paddingBottom: "8px", marginBottom: "10px" }}>
        <GiBrain style={{ color: isEnemyTurn ? "#e74c3c" : "#d4af37", fontSize: "18px" }} />
        <div style={{ color: isEnemyTurn ? "#e74c3c" : "#d4af37", fontSize: "15px", fontWeight: "900", letterSpacing: "2px", textTransform: "uppercase", textShadow: "0 2px 0 #000" }}>
          {isEnemyTurn ? "ENEMY TURN" : "PLAYER TURN"}
        </div>
        <GiBrain style={{ color: isEnemyTurn ? "#e74c3c" : "#d4af37", fontSize: "18px", transform: "scaleX(-1)" }} />
      </div>
      
      <div style={{ 
        flex: 1, 
        display: "grid", 
        gridTemplateColumns: "repeat(5, 1fr)", 
        gridTemplateRows: "repeat(4, 1fr)", 
        gap: "6px", 
        padding: "4px", 
        background: "rgba(0,0,0,0.2)", 
        borderRadius: "8px", 
        border: "1px solid #333" 
      }}>
        {/* เรนเดอร์ 20 ช่องเสมอ แต่ส่ง calculatedMaxSlot ไปควบคุมการล็อค */}
        {Array.from({ length: 20 }).map((_, index) => (
          <SingleSlot key={index} index={index} maxSlot={calculatedMaxSlot} />
        ))}
      </div>
    </div>
  );
};