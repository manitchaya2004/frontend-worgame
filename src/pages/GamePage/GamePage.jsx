import React, {
  useEffect,
  useState,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ipAddress } from "../../const";

import { 
  GiHamburgerMenu,  // ปุ่มเมนู
  GiTatteredBanner, // ธงระยะทาง
  GiDungeonGate     // ปุ่มออกเกม
} from "react-icons/gi";

// --- Store & System ---
import { useGameStore } from "../../store/useGameStore";
import { DeckManager } from "../../utils/gameSystem";

// --- Components: Panels & Entities ---
import { InventorySlot } from "./features/downPanel/InventorySlot";
import { PlayerEntity } from "./features/topPanel/PlayerEntity";
import { EnemyEntity } from "./features/TopPanel/EnemyEntity";
import { BossHpBar } from "./features/topPanel/BossHpBar";
import { SelectedLetterArea } from "./features/topPanel/SelectedLetterArea";

// --- Components: UI & Overlays ---
import { MeaningPopup } from "./features/TopPanel/MeaningPopup";
import { QuizOverlay } from "./features/DownPanel/QuizOverlay";
import { Tooltip } from "./features/TopPanel/Tooltip";
import { ActionControls } from "./features/downPanel/ActionControls";
import { PlayerStatusCard } from "./features/downPanel/PlayerStatusCard";
import { TurnQueueBar } from "./features/TopPanel/TurnQueueBar";
import { DamagePopup } from "./features/TopPanel/DamagePopup";
import { TargetPickerOverlay } from "./features/downPanel/TargetPickerOverlay";

// --- Components: System Views ---
import LoadingView from "../../components/LoadingView";
import ErrorView from "../../components/ErrorView";

export default function GameApp() {
  // --------------------------------------------------------------------------
  // 🟢 STATE & HOOKS
  // --------------------------------------------------------------------------
  const store = useGameStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, selectedStage } = location.state || {};

  const [appStatus, setAppStatus] = useState("LOADING");
  const [errorMessage, setErrorMessage] = useState("");
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const requestRef = useRef(0);
  const lastTimeRef = useRef(0);
  const constraintsRef = useRef(null);

  const boss = store.enemies.find((e) => e.isBoss);
  const activeSelectedItems = store.selectedLetters.filter((i) => i !== null);
  const currentWord = activeSelectedItems.map((i) => i.char).join("");

  // --------------------------------------------------------------------------
  // 🛠️ TOOLTIP LOGIC
  // --------------------------------------------------------------------------
  let tooltipTarget = null;
  if (store.hoveredEnemyId === "PLAYER") {
    tooltipTarget = {
      id: "player",
      x: store.playerX + 4.5,
      isPlayer: true,
      name: store.playerData.name,
    };
  } else if (store.hoveredEnemyId) {
    tooltipTarget = store.enemies.find((e) => e.id === store.hoveredEnemyId);
  }

  // --------------------------------------------------------------------------
  // 🛡️ PREVENT NAVIGATION & EXIT LOGIC
  // --------------------------------------------------------------------------
  
  useEffect(() => {
    // 1. ป้องกัน Refresh / ปิด Tab
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; 
      return "";
    };

    // 2. ป้องกันปุ่ม Back -> ให้เปิดเมนู Pause แทน
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, document.title, window.location.href);
      store.setMenuOpen(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // --------------------------------------------------------------------------
  // 🧭 GAME OVER / CLEAR NAVIGATION LOGIC (ส่วนที่เพิ่มใหม่)
  // --------------------------------------------------------------------------
  // พั้นแก้
  useEffect(() => {
    // กรณีแพ้ (LOSE)
    if (store.gameState === "OVER") {
       if (store.isBgmOn) store.toggleBgm(); // ปิดเพลง

       navigate("/summary", { 
         state: {
           result: "LOSE",
           earnedCoins: Math.floor(store.coin / 2), // ได้เงินครึ่งเดียว
           wordLog: store.wordLog // 📦 ส่ง Log คำศัพท์ไปด้วย
         }
       });
    }

    // กรณีชนะ (WIN)
    if (store.gameState === "GAME_CLEARED") {
       if (store.isBgmOn) store.toggleBgm(); // ปิดเพลง

       navigate("/summary", {
         state: {
           result: "WIN",
           earnedCoins: store.coin, // ได้เงินเต็ม
           wordLog: store.wordLog // 📦 ส่ง Log คำศัพท์ไปด้วย
         }
       });
    }
  }, [store.gameState, navigate, store.coin, store.wordLog, store.isBgmOn]);


  // ฟังก์ชันออกเกมแบบทันที (ใช้ในปุ่ม Exit ใน Pause Menu)
  const handleExit = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (store.isBgmOn) store.toggleBgm();
    
    navigate("/home/adventure");

    setTimeout(() => {
      store.reset();
      store.resetSelection();
    }, 100);
  };

  // --------------------------------------------------------------------------
  // INITIALIZATION & GAME LOOP
  // --------------------------------------------------------------------------

  const initGameData = async () => {
    setAppStatus("LOADING");
    try {
      await store.initializeGame(currentUser, selectedStage);
      store.initSelectedLetters();
      setAppStatus("READY");
    } catch (err) {
      setErrorMessage(err.message || "Failed to load");
      setAppStatus("ERROR");
    }
  };

  useEffect(() => {
    if (!selectedStage || !currentUser) {
      navigate("/home/adventure");
      return;
    }
    initGameData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animate = (time) => {
    if (appStatus !== "READY") return;

    if (store.isMenuOpen) {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
        return;
    }

    if (lastTimeRef.current !== undefined) {
      const dt = time - lastTimeRef.current;
      if (dt < 100) store.update(dt);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (appStatus === "READY") {
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    }
  }, [appStatus]);

  // --------------------------------------------------------------------------
  // ACTIONS & HANDLERS
  // --------------------------------------------------------------------------

  const executeAction = async (type, targetId) => {
    const usedIndices = activeSelectedItems.map((i) => i.originalIndex);
    setPendingAction(null);
    setShowTargetPicker(false);
    store.initSelectedLetters();
    await store.performPlayerAction(type, currentWord, targetId, usedIndices);
  };

  const handleActionClick = (type) => {
    if (!store.validWordInfo) return;
    setPendingAction(type);
    const alive = store.enemies.filter((e) => e.hp > 0);
    if (type === "SHIELD") {
      executeAction("SHIELD", null);
    } else {
      if (alive.length === 1) executeAction("ATTACK", alive[0].id);
      else setShowTargetPicker(true);
    }
  };

  const handleSelectTargetFromMenu = (enemyId) => {
    store.setHoveredEnemyId(null);
    setShowTargetPicker(false);
    executeAction("ATTACK", enemyId);
  };

  const handleSpinClick = () => {
    const currentInv = store.playerData.inventory;
    const unlockedSlots = store.playerData.unlockedSlots;
    let tempInvForLogic = [...currentInv];

    const nextInv = currentInv.map((item, index) => {
      if (!item) return null;
      const char = DeckManager.draw(tempInvForLogic, unlockedSlots);
      const newItem = {
        id: Math.random(),
        char,
        status: item.status || null,
        statusDuration: item.statusDuration || 0,
        visible: true,
        originalIndex: index,
      };
      tempInvForLogic[index] = newItem;
      return newItem;
    });

    store.actionSpin(nextInv);
  };

  // 1. ฟังก์ชันกดใช้ยาเพิ่มเลือด
  const handleHeal = () => {
    const { potions, hp, max_hp } = store.playerData;
    if (potions.health <= 0 || hp >= max_hp) return;
    store.usePotion("health", 30);
  };

  // 2. ฟังก์ชันกดใช้ยาสุ่มของใหม่ (Reroll)
  const handlePotionRoll = () => {
    const { potions } = store.playerData;
    if (potions.reroll <= 0) return;

    store.usePotion("reroll");

    const currentInv = store.playerData.inventory;
    const unlockedSlots = store.playerData.unlockedSlots;
    let tempInvForLogic = [...currentInv];

    const nextInv = currentInv.map((item, index) => {
      if (!item) return null;
      const char = DeckManager.draw(tempInvForLogic, unlockedSlots);
      const newItem = {
        id: Math.random(),
        char,
        status: item.status || null,
        statusDuration: item.statusDuration || 0,
        visible: true,
        originalIndex: index,
      };
      tempInvForLogic[index] = newItem;
      return newItem;
    });

    store.actionSpin(nextInv);
  };

  // --------------------------------------------------------------------------
  // 🔵 RENDER
  // --------------------------------------------------------------------------

  if (appStatus === "LOADING")
    return <LoadingView progress={store.loadingProgress} />;
  if (appStatus === "ERROR")
    return <ErrorView error={errorMessage} onRetry={initGameData} />;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#121212",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "95vh",
          aspectRatio: "10/6",
          width: "auto",
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "column",
          border: "4px solid #1e1510",
          background: "#B3F1FF",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0,0,0,0.8)"
        }}
      >
        {/* ===================================================================
            🆕 UI: HUD (HEADS-UP DISPLAY) & MENU
           =================================================================== */}

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
                e.currentTarget.style.boxShadow = "0 1px 0 #0f0a08, inset 0 2px 5px rgba(0,0,0,0.5)";
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 0 #0f0a08, 0 6px 6px rgba(0,0,0,0.5)";
            }}
        >
            <GiHamburgerMenu size={24} color="#f1c40f" />
        </div>

        {/* 2. ระยะทาง  */}
        <div style={{
             position: "absolute",
             top: "20px",
             right: "20px",
             zIndex: 1000,
             background: "rgba(20, 14, 10, 0.9)",
             border: "2px solid #5e4b35",
             borderBottom: "4px solid #5e4b35",
             borderRadius: "8px",
             padding: "8px 20px",
             display: "flex",
             alignItems: "center",
             gap: "12px",
             boxShadow: "0 4px 10px rgba(0,0,0,0.6)"
        }}>
             <GiTatteredBanner size={28} color="#f1c40f" style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.8))" }} />
             
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1 }}>
                 <span style={{ 
                     color: "#f1c40f", 
                     fontWeight: "bold", 
                     fontSize: "20px", 
                     fontFamily: '"Cinzel", serif',
                     textShadow: "0 2px 4px #000"
                 }}>
                     {Math.floor(store.distance)} 
                 </span>
                 <span style={{ 
                     color: "#8c734b", 
                     fontSize: "10px", 
                     fontFamily: "sans-serif",
                     textTransform: "uppercase",
                     fontWeight: "bold",
                     letterSpacing: "1px"
                 }}>
                     METERS
                 </span>
             </div>
        </div>

        {/* 3. MENU OVERLAY (Pause Menu) */}
        {store.isMenuOpen && (
            <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0, 0, 0, 0.85)", 
                zIndex: 2000,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backdropFilter: "blur(3px)"
            }}>
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
                    <div style={{
                        textAlign: "center",
                        borderBottom: "1px solid #4d3a2b", 
                        paddingBottom: "15px",
                        marginBottom: "5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px"
                    }}>
                        <h2 style={{ 
                            margin: 0, 
                            color: "#f1c40f", 
                            fontSize: "2rem", 
                            fontFamily: '"Cinzel", serif',
                            textShadow: "0 2px 5px rgba(0,0,0,1)",
                            letterSpacing: "3px",
                            fontWeight: "900"
                        }}>
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

                    <div style={{ height: "10px", borderTop: "1px solid #4d3a2b", marginTop: "5px" }} />

                    {/* EXIT BUTTON */}
                    <RpgButton 
                        onClick={() => {
                            store.setMenuOpen(false);
                            handleExit();
                        }} 
                        color="red"
                    >
                        <GiDungeonGate size={22} /> <span>EXIT GAME</span>
                    </RpgButton>

                </motion.div>
            </div>
        )}

        {/* ===================================================================
            1. TOP PANEL (BATTLE AREA)
           =================================================================== */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            borderBottom: "4px solid #0f0a08",
            width: "100%",
            backgroundImage: `url(${ipAddress}/img_map/grassland.png)`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            backgroundPositionY: "bottom",
            backgroundPositionX: `-${store.distance * 20}px`, 
          }}
        >
          {/* UI Elements */}
          <TurnQueueBar store={store} />
          <DamagePopup popups={store.damagePopups} removePopup={store.removePopup} />
          <SelectedLetterArea store={store} constraintsRef={constraintsRef} />
          <BossHpBar boss={boss} />

          {/* Entities */}
          <PlayerEntity store={store} animFrame={store.animFrame} />

          <AnimatePresence>
            {store.enemies
              .filter((en) => en.hp > 0)
              .map((en, i) => (
                <EnemyEntity
                  key={en.id}
                  enemy={en}
                  index={i}
                  animFrame={store.animFrame}
                  gameState={store.gameState}
                  isTargeted={false}
                  onSelect={() => {}}
                />
              ))}
          </AnimatePresence>

          {/* Info Popups */}
          {store.validWordInfo && (
            <MeaningPopup meaning={store.validWordInfo.meaning} />
          )}

          <Tooltip target={tooltipTarget} />
        </div>

        {/* ===================================================================
            2. BOTTOM PANEL (CONTROLS & INVENTORY)
           =================================================================== */}
        <div
          style={{
            flex: 1,
            background: "#1a120b",
            borderTop: "4px solid #5c4033",
            display: "flex",
            padding: "15px 0px 15px 0px",
          }}
        >
          {store.gameState === "QUIZ_MODE" && store.currentQuiz ? (
            <QuizOverlay data={store.currentQuiz} onAnswer={store.resolveQuiz} />
          ) : showTargetPicker ? (
            <TargetPickerOverlay
              store={store}
              ipAddress={ipAddress}
              onClose={() => {
                setShowTargetPicker(false);
                setPendingAction(null);
              }}
              onSelectTarget={(enemyId) => handleSelectTargetFromMenu(enemyId)}
            />
          ) : (
            <div
              style={{
                flex: 1.5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <PlayerStatusCard 
                onHeal={handleHeal} 
                onReroll={handlePotionRoll} 
              />

              <InventorySlot />

              <ActionControls
                store={store}
                onAttackClick={() => handleActionClick("ATTACK")}
                onShieldClick={() => handleActionClick("SHIELD")}
                onSpinClick={handleSpinClick}
                onEndTurnClick={() => {
                  store.resetSelection();
                  store.endTurn();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================================================================
// 🎨 CUSTOM RPG BUTTON COMPONENT (Solid Style)
// ==================================================================
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