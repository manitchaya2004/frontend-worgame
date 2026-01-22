import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ipAddress } from "../../const";

import {
  GiHamburgerMenu, // ปุ่มเมนู
  GiTatteredBanner, // ธงระยะทาง
  GiDungeonGate, // ปุ่มออกเกม
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
import { GameMenu } from "./features/TopPanel/Menu";

// --- Components: System Views ---
import LoadingView from "../../components/LoadingView";
import LoadingScreen from "../../components/Loading/LoadingPage";
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
          earnedCoins: Math.floor(store.receivedCoin / 2), // ได้เงินครึ่งเดียว
          wordLog: store.wordLog, // 📦 ส่ง Log คำศัพท์ไปด้วย
        },
      });
    }
    const currentStageRecord = currentUser?.stages?.find(
      (userStage) => userStage.stage_id === store.stageData?.id,
    );

    // เช็คว่าเล่นไปยาง 
    const isReplay = currentStageRecord?.is_completed === true;

    // กรณีชนะ (WIN)
    if (store.gameState === "GAME_CLEARED") {
      if (store.isBgmOn) store.toggleBgm(); // ปิดเพลง

      navigate("/summary", {
        state: {
          result: "WIN",
          earnedCoins: store.receivedCoin, // ได้เงินเต็ม
          stageCoins: store.stageData?.id ? 0 : store.stageData?.money_reward,
          wordLog: store.wordLog, // ส่ง Log คำศัพท์ไปด้วย
        },
      });
    }
  }, [
    store.gameState,
    navigate,
    store.receivedCoin,
    store.wordLog,
    store.isBgmOn,
    store.stageData?.money_reward,
  ]);

  // ฟังก์ชันออกเกมแบบทันที (ใช้ในปุ่ม Exit ใน Pause Menu)
  const handleExit = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (store.isBgmOn) store.toggleBgm();

    navigate("/home");

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

    if (pendingAction === "ATTACK") {
      executeAction("ATTACK", enemyId);
    } else if (pendingAction === "SKILL") {
      // ถ้าเป็นการกดเลือกจากเมนูสกิล ให้ส่ง enemyId ไปที่ฟังก์ชันสกิล
      store.castHeroAbility(enemyId);
    }
    setPendingAction(null);
  };

  const handleSkillClick = async () => {
    // ดึงชื่อสกิลมาเช็ค
    const abilityCode = store.playerData.ability.code; 
    
    // ตรวจสอบเบื้องต้น (กันเหนียว)
    if (!abilityCode) return;

    // A. กรณีท่าหมู่ (AOE) : ไม่ต้องเลือกเป้า
    if (abilityCode === "Expolsion") {
       await store.castHeroAbility(null); // ส่ง null ไปเพราะยิงหมด
       return;
    }

    // B. กรณีท่าเดี่ยว (Single Target) : ต้องเลือกเป้า
    const alive = store.enemies.filter((e) => e.hp > 0);
    
    if (alive.length === 1) {
       // ถ้าศัตรูเหลือตัวเดียว ใส่ตัวนั้นเลย ไม่ต้องเปิดเมนู
       await store.castHeroAbility(alive[0].id);
    } else {
       // ถ้ามีหลายตัว ให้เปิด Target Picker
       setPendingAction("SKILL"); // บอกระบบว่า "ฉันกำลังจะใช้สกิลนะ"
       setShowTargetPicker(true);
    }
  };

  // 1. ฟังก์ชันกดใช้ยาเพิ่มเลือด
  const handleHeal = () => {
    const { potions, hp, max_hp } = store.playerData;
    if (potions.health <= 0 || hp >= max_hp) return;
    store.usePotion("health", 30);
  };

  // 2. เพิ่มฟังก์ชันกดใช้ยาแก้สถานะ (Cure)
  const handlePotionCure = () => {
    const { potions } = store.playerData;
    if (potions.cure <= 0) return;
    store.usePotion("cure"); 
  };

  // 3. ฟังก์ชันกดใช้ยาสุ่มของใหม่ (Reroll)
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
    return <LoadingScreen open={true}/>;
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
          boxShadow: "0 0 20px rgba(0,0,0,0.8)",
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

        {/* 2. ระยะทาง  */}
        <div
          style={{
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
            boxShadow: "0 4px 10px rgba(0,0,0,0.6)",
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

        {/* 3. MENU OVERLAY (Pause Menu) */}
        <GameMenu onExit={handleExit} />

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
          }}
        >
          {store.gameState === "QUIZ_MODE" && store.currentQuiz ? (
            <QuizOverlay
              data={store.currentQuiz}
              onAnswer={store.resolveQuiz}
            />
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
                onCure={handlePotionCure}
                onReroll={handlePotionRoll}
              />

              <InventorySlot />

              <ActionControls
                store={store}
                onAttackClick={() => handleActionClick("ATTACK")}
                onShieldClick={() => handleActionClick("SHIELD")}
                // ⭐ เปลี่ยนจาก onSpinClick เป็น onSkillClick
                onSkillClick={handleSkillClick}
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