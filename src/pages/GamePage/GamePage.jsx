import React, {
  useEffect,
  useState,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ipAddress } from "../../const";

// 🆕 IMPORT ICONS (Game Icons Set)
import { 
  GiHamburgerMenu,  // ปุ่มเมนู
  GiTatteredBanner, // ธงระยะทาง
  GiWalk,           // ปุ่ม Continue
  GiLyre,           // เพลง (BGM On)
  GiSilence,        // ปิดเพลง (BGM Off)
  GiBroadsword,     // เสียงเอฟเฟกต์ (SFX On)
  GiBrokenShield,   // ปิดเสียงเอฟเฟกต์ (SFX Off)
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
  // 🛡️ PREVENT NAVIGATION & EXIT LOGIC (ส่วนที่เพิ่มใหม่)
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
      // ดัน History กลับมาที่เดิม เพื่อไม่ให้ URL เปลี่ยน
      window.history.pushState(null, document.title, window.location.href);
      store.setMenuOpen(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Push State 1 ครั้งเพื่อให้มี History ให้ดักจับได้
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // ฟังก์ชันออกเกมแบบทันที (ใช้ในปุ่ม Exit, Give Up, Return)
  const handleExit = () => {
    // หยุด Loop เกม
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    // ปิดเพลง
    if (store.isBgmOn) store.toggleBgm();
    
    // เปลี่ยนหน้าทันที
    navigate("/home/adventure");

    // Reset Store ตามหลัง (เพื่อให้หน้าจอเปลี่ยนไปก่อนค่อยเคลียร์ค่า)
    setTimeout(() => {
      store.reset();
      store.resetSelection();
    }, 100);
  };

  // --------------------------------------------------------------------------
  // 🟡 INITIALIZATION & GAME LOOP
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
  // 🔴 ACTIONS & HANDLERS
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

        {/* 1. ปุ่มเมนู (Menu Button) - Style เดิมของคุณ */}
        <div 
            onClick={() => store.setMenuOpen(true)}
            style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                zIndex: 1000,
                cursor: "pointer",
                background: "linear-gradient(to bottom, #3e332a, #1e1510)", // พื้นหลังมีมิติ
                border: "2px solid #8c734b",
                borderTopColor: "#bfa37c", // ขอบบนสว่าง
                borderBottomColor: "#0f0a08", // ขอบล่างมืด
                borderRadius: "6px",
                padding: "8px 12px",
                boxShadow: "0 4px 0 #0f0a08, 0 6px 6px rgba(0,0,0,0.5)", // เงาแบบปุ่มนูน
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.1s",
                color: "#e6c88b",
                fontFamily: '"Cinzel", serif',
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(3px)"; // กดแล้วยุบ
                e.currentTarget.style.boxShadow = "0 1px 0 #0f0a08, inset 0 2px 5px rgba(0,0,0,0.5)"; // เงาหาย
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 0 #0f0a08, 0 6px 6px rgba(0,0,0,0.5)";
            }}
        >
            <GiHamburgerMenu size={24} color="#f1c40f" />
        </div>

        {/* 2. ระยะทาง (Distance Badge) - Style เดิมของคุณ */}
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

        {/* 3. MENU OVERLAY */}
        {store.isMenuOpen && (
            <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0, 0, 0, 0.85)",
                zIndex: 2000,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backdropFilter: "blur(5px)"
            }}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    style={{
                        background: "#19120e",
                        width: "320px",
                        padding: "30px 20px",
                        borderRadius: "12px",
                        border: "3px solid #8c734b", // กรอบทองหนา
                        boxShadow: "0 0 0 5px #0f0a08, 0 20px 60px rgba(0,0,0,0.9)", // ขอบซ้อนเงา
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        position: "relative"
                    }}
                >
                    {/* Header */}
                    <div style={{
                        textAlign: "center",
                        borderBottom: "2px solid #3e332a",
                        paddingBottom: "15px",
                        marginBottom: "5px"
                    }}>
                        <h2 style={{ 
                            margin: 0, 
                            color: "#f1c40f", 
                            fontSize: "2rem", 
                            fontFamily: '"Cinzel", serif',
                            textShadow: "0 3px 5px rgba(0,0,0,1)",
                            letterSpacing: "2px"
                        }}>
                            PAUSED
                        </h2>
                    </div>
                    
                    {/* CONTINUE BUTTON */}
                    <RpgButton onClick={() => store.setMenuOpen(false)} color="gold">
                        <GiWalk size={26} /> <span>CONTINUE</span>
                    </RpgButton>

                    {/* BGM TOGGLE */}
                    <RpgButton onClick={() => store.toggleBgm()} color="wood">
                        {store.isBgmOn ? <GiLyre size={24} /> : <GiSilence size={24} />}
                        <span>{store.isBgmOn ? "BGM: ON" : "BGM: OFF"}</span>
                    </RpgButton>

                    {/* SFX TOGGLE */}
                    <RpgButton onClick={() => store.toggleSfx()} color="wood">
                        {store.isSfxOn ? <GiBroadsword size={24} /> : <GiBrokenShield size={24} />}
                        <span>{store.isSfxOn ? "SFX: ON" : "SFX: OFF"}</span>
                    </RpgButton>

                    <div style={{ height: "10px" }} />

                    {/* EXIT BUTTON (ใช้ handleExit) */}
                    <RpgButton 
                        onClick={() => {
                            store.setMenuOpen(false);
                            handleExit();
                        }} 
                        color="red"
                    >
                        <GiDungeonGate size={24} /> <span>EXIT GAME</span>
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
              <PlayerStatusCard store={store} />

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

        {/* ===================================================================
            3. FULL SCREEN OVERLAYS (End Game States)
           =================================================================== */}

        {/* GAME OVER */}
        {store.gameState === "OVER" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 3000,
            }}
          >
            <h1
              style={{
                color: "#c0392b",
                fontSize: "4rem",
                textShadow: "0 0 10px #000",
                fontFamily: '"Cinzel", serif',
                marginBottom: "20px"
              }}
            >
              GAME OVER
            </h1>
            <div
              style={{ color: "#d1c4b6", fontSize: "1.5rem", marginTop: "10px", fontFamily: '"Cinzel", serif' }}
            >
              Coin Gained:{" "}
              <span style={{ color: "#f1c40f", fontWeight: "bold" }}>
                {Math.floor(store.coin / 2)}
              </span>
            </div>

            <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
              <RpgButton onClick={() => { store.reset(); store.resetSelection(); initGameData(); }} color="gold">
                 RETRY
              </RpgButton>
              {/* ✅ ใช้ handleExit */}
              <RpgButton onClick={handleExit} color="wood">
                 GIVE UP
              </RpgButton>
            </div>
          </div>
        )}

        {/* MISSION COMPLETE */}
        {store.gameState === "GAME_CLEARED" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 3000,
            }}
          >
            <h1
              style={{
                color: "#f1c40f",
                fontSize: "4rem",
                textShadow: "0 0 20px #c6a664",
                fontFamily: '"Cinzel", serif',
                textAlign: "center"
              }}
            >
              MISSION COMPLETE
            </h1>
            <div
              style={{ color: "#fff", fontSize: "1.5rem", marginTop: "20px", fontFamily: '"Cinzel", serif' }}
            >
              Total Coin Reward:{" "}
              <span style={{ color: "#f1c40f", fontSize: "2rem" }}>{store.coin}</span>
            </div>
            
            <div style={{ marginTop: "40px" }}>
                {/* ✅ ใช้ handleExit */}
                <RpgButton onClick={handleExit} color="green">
                    RETURN TO MAP
                </RpgButton>
            </div>
          </div>
        )}
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
                borderBottom: `4px solid ${theme.border}`, // ขอบล่างหนาดูนูน
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
                e.currentTarget.style.transform = "translateY(4px)"; // กดลง
                e.currentTarget.style.boxShadow = `0 0 0 ${theme.shadow}, inset 0 2px 5px rgba(0,0,0,0.5)`; // เงาหาย
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