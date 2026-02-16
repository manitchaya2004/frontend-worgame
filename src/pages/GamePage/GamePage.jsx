import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ipAddress } from "../../const";

// --- Icons ---
import {
  GiTatteredBanner, // ธงระยะทาง
  GiTwoCoins, // ไอคอนเงิน
  GiSpeaker, // ลำโพงเปิด (SFX On)
  GiSpeakerOff, // ลำโพงปิด (SFX Off)
  GiMusicalNotes, // ดนตรีเปิด (BGM On)
} from "react-icons/gi";

// Import ไอคอนจาก Material Design
import { MdMusicOff, MdFlag } from "react-icons/md";

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
import {GameDialog} from "../../components/GameDialog";

// --- Components: System Views ---
import LoadingView from "../../components/LoadingView";
import LoadingScreen from "../../components/Loading/LoadingPage";
import ErrorView from "../../components/Loading/ErrorView";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

    // 2. ป้องกันปุ่ม Back
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, document.title, window.location.href);
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
  // 🧭 GAME OVER / CLEAR NAVIGATION LOGIC
  // --------------------------------------------------------------------------
  useEffect(() => {
    // กรณีแพ้ (LOSE)
  if (store.gameState === "OVER") {
      if (store.isBgmOn) store.toggleBgm();

      const halfCoins = Math.floor(store.receivedCoin / 2);
      
      store.saveQuitGame(halfCoins); 

      navigate("/summary", {
        state: {
          result: "LOSE",
          earnedCoins: halfCoins,
          stageCoins: 0,
          wordLog: store.wordLog,
        },
      });
    }

    // กรณีชนะ (WIN)
    if (store.gameState === "GAME_CLEARED") {
      if (store.isBgmOn) store.toggleBgm();

      const currentStageId = store.stageData?.id;
      const stageRecord = currentUser?.stages?.find(
        (s) => s.stage_id === currentStageId,
      );
      const isFirstClear = !stageRecord || !stageRecord.is_completed;

      navigate("/summary", {
        state: {
          result: "WIN",
          earnedCoins: store.receivedCoin,
          stageCoins: isFirstClear ? store.stageData?.money_reward || 0 : 0,
          wordLog: store.wordLog,
        },
      });
    }
  }, [
    store.gameState,
    navigate,
    store.receivedCoin,
    store.wordLog,
    store.isBgmOn,
    store.stageData,
    currentUser,
  ]);

  const handleExit = async () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (store.isBgmOn) store.toggleBgm();

    const halfCoins = Math.floor(store.receivedCoin / 2);
    await store.saveQuitGame(halfCoins);

    navigate("/summary", {
      state: {
        result: "LOSE",
        earnedCoins: halfCoins,
        stageCoins: 0,
        wordLog: store.wordLog,
      },
    });

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
      await store.setupGame(currentUser, selectedStage);
      store.initSelectedLetters();
      setAppStatus("READY");
    } catch (err) {
      setErrorMessage(err.message || "Failed to load");
      setAppStatus("ERROR");
    }
  };

  useEffect(() => {
    if (!selectedStage || !currentUser) {
      navigate("/home");
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
    if (type === "Guard") {
      executeAction("Guard", null);
    } else {
      if (alive.length === 1) executeAction("Strike", alive[0].id);
      else setShowTargetPicker(true);
    }
  };

  const handleSelectTargetFromMenu = (enemyId) => {
    store.setHoveredEnemyId(null);
    setShowTargetPicker(false);

    if (pendingAction === "Strike") {
      executeAction("Strike", enemyId);
    } else if (pendingAction === "SKILL") {
      store.performPlayerSkill(enemyId);
    }
    setPendingAction(null);
  };

  const handleSkillClick = async () => {
    const abilityCode = store.playerData.ability.code;
    if (!abilityCode) return;

    if (abilityCode === "Expolsion") {
      await store.performPlayerSkill(null);
      return;
    }

    const alive = store.enemies.filter((e) => e.hp > 0);
    if (alive.length === 1) {
      await store.performPlayerSkill(alive[0].id);
    } else {
      setPendingAction("SKILL");
      setShowTargetPicker(true);
    }
  };

  const handleHeal = () => {
    const { potions, hp, max_hp } = store.playerData;
    if (potions.health <= 0 || hp >= max_hp) return;
    store.usePotion("health", 30);
  };

  const handlePotionCure = () => {
    const { potions } = store.playerData;
    if (potions.cure <= 0) return;
    store.usePotion("cure");
  };

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

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // ⭐ STYLES
  const commonHudStyle = {
    background: "rgba(20, 14, 10, 0.9)",
    border: "2px solid #ffd700",
    borderBottom: "4px solid #b8860b",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "52px",
    boxSizing: "border-box",
    transition: "all 0.1s",
  };

  // Style ปุ่มกด
  const hudButtonStyle = {
    ...commonHudStyle,
    width: "52px",
    cursor: "pointer",
    color: "#e6c88b",
  };

  // Animation กดปุ่ม
  const handleHudButtonDown = (e) => {
    e.currentTarget.style.transform = "translateY(2px)";
    e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.6)";
    e.currentTarget.style.borderBottomWidth = "2px";
  };

  const handleHudButtonUp = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.6)";
    e.currentTarget.style.borderBottomWidth = "4px";
  };

  // --------------------------------------------------------------------------
  // 🔵 RENDER
  // --------------------------------------------------------------------------

  if (appStatus === "LOADING") return <LoadingScreen open={true} />;
  if (appStatus === "ERROR")
    return <ErrorView error={errorMessage} onRetry={initGameData} />;

return (
    <>
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
            boxShadow: "0 0 20px rgba(0,0,0,0.8)",
          }}
        >
          {/* ===================================================================
            🆕 UI: HUD (HEADS-UP DISPLAY)
            =================================================================== */}

          {/* 1. ปุ่มควบคุมมุมซ้ายบน */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              zIndex: 1000,
              display: "flex",
              gap: "12px",
            }}
          >
            {/* ปุ่มออก */}
            <div
              onClick={handleOpenDialog}
              style={hudButtonStyle}
              onMouseDown={handleHudButtonDown}
              onMouseUp={handleHudButtonUp}
              title="Surrender"
            >
              <MdFlag size={26} color="#e74c3c" />
            </div>

            {/* ปุ่ม SFX */}
            <div
              onClick={store.toggleSfx}
              style={hudButtonStyle}
              onMouseDown={handleHudButtonDown}
              onMouseUp={handleHudButtonUp}
              title="Toggle SFX"
            >
              {store.isSfxOn ? (
                <GiSpeaker size={26} />
              ) : (
                <GiSpeakerOff size={26} color="#9e9e9e" />
              )}
            </div>

            {/* ปุ่ม BGM */}
            <div
              onClick={store.toggleBgm}
              style={hudButtonStyle}
              onMouseDown={handleHudButtonDown}
              onMouseUp={handleHudButtonUp}
              title="Toggle Music"
            >
              {store.isBgmOn ? (
                <GiMusicalNotes size={26} />
              ) : (
                <MdMusicOff size={26} color="#9e9e9e" />
              )}
            </div>
          </div>

          {/* ⭐ Wrapper ขวาบน: รวม Coin และ Distance เพื่อจัดชิดกัน ⭐ */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* 2. แสดงเงิน (Coin) */}
            <div
              style={{
                ...commonHudStyle,
                padding: "0 16px",
                gap: "8px",
              }}
            >
              <GiTwoCoins
                size={28}
                color="#ffd700"
                style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.8))" }}
              />
              <span
                style={{
                  color: "#ffd700",
                  fontWeight: "bold",
                  fontSize: "22px",
                  fontFamily: '"Cinzel", serif',
                  textShadow: "0 2px 4px #000",
                  lineHeight: 1,
                }}
              >
                {store.receivedCoin}
              </span>
            </div>

            {/* 3. ระยะทาง (Distance) */}
            <div
              style={{
                ...commonHudStyle,
                padding: "0 20px",
                gap: "12px",
                minWidth: "140px",
              }}
            >
              <GiTatteredBanner
                size={28}
                color="#f1c40f"
                style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.8))" }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    color: "#f1c40f",
                    fontWeight: "bold",
                    fontSize: "20px",
                    fontFamily: '"Cinzel", serif',
                    textShadow: "0 2px 4px #000",
                  }}
                >
                  {Math.floor(store.distance)}
                </span>
                <span
                  style={{
                    color: "#8c734b",
                    fontSize: "10px",
                    fontFamily: "sans-serif",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                  }}
                >
                  METERS
                </span>
              </div>
            </div>
          </div>

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
              backgroundImage: `url(${ipAddress}/img_map/${selectedStage}.png)`,
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPositionY: "bottom",
              backgroundPositionX: `-${store.distance * 20}px`,
            }}
          >
            {/* UI Elements */}
            <TurnQueueBar store={store} />
            <DamagePopup
              popups={store.damagePopups}
              removePopup={store.removePopup}
            />
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
              boxSizing: "border-box",
              overflow: "hidden",
              position: "relative" // เพิ่มเพื่อให้เนื้อหาข้างในอิงตำแหน่งได้แม่นยำ
            }}
          >
            {/* Main Content Wrapper: บังคับให้ขนาดคงที่เสมอ */}
            <div style={{ flex: 1, display: "flex", width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
              
              {store.gameState === "QUIZ_MODE" && store.currentQuiz ? (
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <QuizOverlay
                    data={store.currentQuiz}
                    onAnswer={store.resolveQuiz}
                  />
                </div>
              ) : showTargetPicker ? (
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <TargetPickerOverlay
                    store={store}
                    ipAddress={ipAddress}
                    onClose={() => {
                      setShowTargetPicker(false);
                      setPendingAction(null);
                    }}
                    onSelectTarget={(enemyId) =>
                      handleSelectTargetFromMenu(enemyId)
                    }
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    height: "100%"
                  }}
                >
                  <PlayerStatusCard
                    onHeal={handleHeal}
                    onCure={handlePotionCure}
                    onReroll={handlePotionRoll}
                  />

                  <InventorySlot />

                  <ActionControls
                    store={store}
                    onAttackClick={() => handleActionClick("Strike")}
                    onShieldClick={() => handleActionClick("Guard")}
                    onSkillClick={handleSkillClick}
                    onEndTurnClick={() => {
                      store.passTurn();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <GameDialog
        open={isDialogOpen}
        onCancel={handleCloseDialog}
        onConfirm={handleExit}
        confirmText="Accept"
        cancelText="Cancel"
        title="Surrender?"
        description="Your progress will be saved and you will receive half of your earned coins."
      />
    </>
  );
}
