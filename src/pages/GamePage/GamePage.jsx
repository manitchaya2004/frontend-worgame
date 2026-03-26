import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { bgm } from "../../utils/sfx";

// --- Icons ---
import {
  GiTatteredBanner,
  GiTwoCoins,
  GiSpeaker,
  GiSpeakerOff,
  GiMusicalNotes,
} from "react-icons/gi";
import { MdMusicOff, MdFlag , MdSettings} from "react-icons/md";

// --- Store & System ---
import { useGameStore } from "../../store/useGameStore";
import { DeckManager } from "../../utils/gameSystem";
import { useAuthStore } from "../../store/useAuthStore";

// --- Components ---
import { InventorySlot } from "./features/downPanel/InventorySlot";
import { PlayerEntity } from "./features/topPanel/PlayerEntity";
import { EnemyEntity } from "./features/topPanel/EnemyEntity";
import { BossHpBar } from "./features/topPanel/BossHpBar";
import { SelectedLetterArea } from "./features/topPanel/SelectedLetterArea";
import { MeaningPopup } from "./features/topPanel/MeaningPopup";
import { QuizOverlay } from "./features/downPanel/QuizOverlay";
import { Tooltip } from "./features/topPanel/Tooltip";
import { ActionControls } from "./features/downPanel/ActionControls";
import { PlayerStatusCard } from "./features/downPanel/PlayerStatusCard";
import { TurnQueueBar } from "./features/topPanel/TurnQueueBar";
import { DamagePopup } from "./features/topPanel/DamagePopup";
import { TargetPickerOverlay } from "./features/downPanel/TargetPickerOverlay";
import { GameDialog } from "../../components/GameDialog";
import LoadingScreen from "../../components/Loading/LoadingPage";
import ErrorView from "../../components/Loading/ErrorView";

const TopHudTooltipWrapper = ({ children, title, desc, align = "center" }) => {
  const [isHovered, setIsHovered] = useState(false);

  const xTransform = align === "center" ? "-50%" : "0%";
  const leftPos = align === "center" ? "50%" : align === "left" ? "0" : "auto";
  const rightPos = align === "right" ? "0" : "auto";

  const arrowLeft =
    align === "center" ? "50%" : align === "left" ? "20px" : "auto";
  const arrowRight = align === "right" ? "20px" : "auto";
  const arrowMarginLeft = align === "center" ? "-5px" : "0";

  return (
    <div
      style={{ position: "relative", cursor: "default" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95, x: xTransform }}
            animate={{ opacity: 1, y: 0, scale: 1, x: xTransform }}
            exit={{ opacity: 0, y: -10, scale: 0.95, x: xTransform }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 14px)",
              left: leftPos,
              right: rightPos,
              background: "rgba(15, 11, 8, 0.95)",
              border: "1px solid #d4af37",
              borderRadius: "6px",
              padding: "8px 10px",
              minWidth: "150px",
              zIndex: 9999,
              pointerEvents: "none",
              boxShadow:
                "0 6px 12px rgba(0,0,0,0.8), inset 0 0 8px rgba(212,175,55,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-6px",
                left: arrowLeft,
                right: arrowRight,
                marginLeft: arrowMarginLeft,
                width: "10px",
                height: "10px",
                background: "rgba(15, 11, 8, 0.95)",
                borderLeft: "1px solid #d4af37",
                borderTop: "1px solid #d4af37",
                transform: "rotate(45deg)",
              }}
            />
            <span
              style={{
                color: "#ffd700",
                fontSize: "12px",
                fontWeight: "bold",
                fontFamily: "'Palatino', serif",
              }}
            >
              {title}
            </span>
            <span style={{ color: "#bdc3c7", fontSize: "11px" }}>{desc}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function GameApp() {
  const store = useGameStore();
  // ==========================================
  // 💡 SETTINGS LOGIC (ลอกมาจาก GameAppBar)
  // ==========================================
  const {
    volume,
    isMuted,
    setVolume,
    toggleMute,
    sfxVolume,
    isSfxMuted,
    setSfxVolume,
    toggleSfxMute,
  } = useAuthStore();
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, selectedStage } = location.state || {};

  const [appStatus, setAppStatus] = useState("LOADING");
  const [errorMessage, setErrorMessage] = useState("");
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const MAP_BASE_URL =
    "https://qsopjsioqmqtyaocqmmx.supabase.co/storage/v1/object/public/asset/img_map/";

  const requestRef = useRef(0);
  const lastTimeRef = useRef(0);
  const constraintsRef = useRef(null);

  const BASE_WIDTH = 1200;
  const BASE_HEIGHT = 720;
  const [windowScale, setWindowScale] = useState(1);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      setViewportSize({ width: currentWidth, height: currentHeight });
      const scaleX = currentWidth / BASE_WIDTH;
      const scaleY = currentHeight / BASE_HEIGHT;
      setWindowScale(Math.min(scaleX, scaleY));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeSelectedItems = useMemo(
    () => store.selectedLetters.filter((i) => i !== null),
    [store.selectedLetters],
  );
  const currentWord = useMemo(
    () => activeSelectedItems.map((i) => i.char).join(""),
    [activeSelectedItems],
  );

  const prediction = useMemo(() => {
    let strikeTotal = 0,
      guardTotal = 0,
      healTotal = 0,
      recoilDmg = 0;
    const wordLength = activeSelectedItems.length;
    const playerPower = store.playerData?.power || 3;
    const excessLetters = wordLength - playerPower;

    activeSelectedItems.forEach((item) => {
      const base = DeckManager.getLetterDamage(item.char);
      strikeTotal += item.buff === "double-dmg" ? base * 2 : base;
      guardTotal +=
        item.buff === "double-guard" || item.buff === "double-shield"
          ? base * 2
          : base;
      if (item.buff === "heal") healTotal += Math.ceil(base);
    });

    if (excessLetters > 0) {
      recoilDmg = Math.max(1, Math.floor(strikeTotal * 0.5));
    }

    return {
      strike: { min: Math.floor(strikeTotal), max: Math.ceil(strikeTotal) },
      guard: { min: Math.floor(guardTotal), max: Math.ceil(guardTotal) },
      recoil: recoilDmg,
      heal: healTotal,
    };
  }, [activeSelectedItems, store.playerData]);

  const boss = useMemo(
    () => store.enemies.find((e) => e.isBoss),
    [store.enemies],
  );

  const executeAction = useCallback(
    async (type, targetId) => {
      const usedIndices = activeSelectedItems.map((i) => i.originalIndex);
      setPendingAction(null);
      setShowTargetPicker(false);
      await store.performPlayerAction(type, currentWord, targetId, usedIndices);
    },
    [activeSelectedItems, currentWord, store.performPlayerAction],
  );

  const handleActionClick = useCallback(
    (type) => {
      if (!store.validWordInfo) return;
      setPendingAction(type);
      const alive = store.enemies.filter((e) => e.hp > 0);
      if (type === "Guard") executeAction("Guard", null);
      else {
        if (alive.length === 1) executeAction(type, alive[0].id);
        else setShowTargetPicker(true);
      }
    },
    [store.validWordInfo, store.enemies, executeAction],
  );

  const initGameData = useCallback(async () => {
    setAppStatus("LOADING");
    try {
      await store.setupGame(currentUser, selectedStage);
      store.initSelectedLetters();
      setAppStatus("READY");
    } catch (err) {
      setErrorMessage(err.message || "Failed to load");
      setAppStatus("ERROR");
    }
  }, [currentUser, selectedStage, store.setupGame, store.initSelectedLetters]);

  useEffect(() => {
    if (!selectedStage || !currentUser) {
      navigate("/home");
      return;
    }
    initGameData();
  }, [initGameData, navigate, selectedStage, currentUser]);

  const animate = useCallback(
    (time) => {
      if (appStatus !== "READY") return;
      if (store.isMenuOpen) {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
      const dt = time - lastTimeRef.current;
      if (dt > 0 && dt < 100) store.update(dt);
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [appStatus, store.isMenuOpen, store.update],
  );

  useEffect(() => {
    if (appStatus === "READY") {
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    }
  }, [appStatus, animate]);

  useEffect(() => {
    if (store.gameState === "GAME_CLEARED") {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      bgm.stop();
      navigate("/summary", {
        state: {
          result: "WIN",
          earnedCoins: store.receivedCoin,
          stageCoins: store.stageData?.money_reward || 0,
          wordLog: store.wordLog,
          stageId: store.stageData?.id,
          hasMaxSlotUpgrade: store.isFirstClear
        },
      });
      setTimeout(() => {
        store.reset();
        store.resetSelection();
      }, 100);
    } else if (store.gameState === "OVER") {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      bgm.stop();
      const halfCoins = Math.floor((store.receivedCoin || 0) / 2);
      navigate("/summary", {
        state: {
          result: "LOSE",
          earnedCoins: halfCoins,
          wordLog: store.wordLog,
        },
      });
      setTimeout(() => {
        store.reset();
        store.resetSelection();
      }, 100);
    }
  }, [
    store.gameState,
    navigate,
    store.receivedCoin,
    store.stageData,
    store.wordLog,
  ]);

  const handleExit = useCallback(async () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    bgm.stop();
    setIsDialogOpen(false); // ปิด Dialog เพื่อเริ่มโหลดเนียนๆ
    
    // 🌟 เพียงแค่เรียกใช้ saveQuitGame ที่ตั้งค่า gameState = "LOADING" ไว้แล้วให้รอ
    // พอทำงาน API จบมันจะปรับ gameState = "OVER" และปลุก useEffect เพื่อพาไปหน้า summary เอง
    const halfCoins = Math.floor((store.receivedCoin || 0) / 2);
    await store.saveQuitGame(halfCoins);
  }, [
    store.receivedCoin,
    store.saveQuitGame,
  ]);

  const handleSaveSettings = (newSettings) => {
    if (!newSettings) return;

    setVolume(newSettings.volume);
    if (newSettings.isMuted !== isMuted) {
      toggleMute();
    }

    setSfxVolume(newSettings.sfxVolume);
    if (newSettings.isSfxMuted !== isSfxMuted) {
      toggleSfxMute();
    }

    setOpenSettings(false);
  };

  const commonHudStyle = useMemo(
    () => ({
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
    }),
    [],
  );

  const centerOffset = (activeSelectedItems.length * 65) / 2 + 5;

  // 🌟 เพิ่มเงื่อนไขให้แสดง LoadingScreen ทันทีที่ store.gameState = "LOADING" ด้วย
  if (appStatus === "LOADING" || store.gameState === "LOADING") return <LoadingScreen open={true} />;
  
  if (appStatus === "ERROR")
    return <ErrorView error={errorMessage} onRetry={initGameData} />;

  const backgroundUrl = selectedStage
    ? `${MAP_BASE_URL}${selectedStage}.png`
    : null;

  return (
    <>
      <div
        style={{
          width: `${viewportSize.width}px`,
          height: `${viewportSize.height}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#000",
          overflow: "hidden",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        {/* 🌟 Main Container พร้อม Screen Shake ถ้ามี store.isShaking */}
        <motion.div
          animate={
            store.isShaking
              ? {
                  x: [-2, 2, -2, 2, 0],
                  y: [1, -1, 1, -1, 0],
                }
              : {}
          }
          transition={{ duration: 0.2 }}
          style={{
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            transform: `scale(${windowScale})`,
            transformOrigin: "center center",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            border: "4px solid #1e1510",
            background: "#B3F1FF",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 0 50px rgba(0,0,0,1)",
          }}
        >
          {/* HUD Layer */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              zIndex: 3000,
              display: "flex",
              gap: "12px",
            }}
          >
            <div
              onClick={() => setIsDialogOpen(true)}
              style={{ ...commonHudStyle, width: "52px", cursor: "pointer" }}
            >
              <MdFlag size={26} color="#e74c3c" />
            </div>

            {/* 💡 ปุ่ม Settings ปุ่มเดียวจบ ควบคุมทุกเสียง */}
            <div
              onClick={() => setOpenSettings(true)}
              style={{ ...commonHudStyle, width: "52px", cursor: "pointer" }}
            >
              <MdSettings size={26} color="#e6c88b" />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 3000,
              display: "flex",
              gap: "10px",
            }}
          >
            <TopHudTooltipWrapper
              title="Gold Coins"
              desc="Earned by defeating enemies."
              align="right"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 4px 10px rgba(0,0,0,0.6)",
                    "0 4px 15px rgba(255,215,0,0.3)",
                    "0 4px 10px rgba(0,0,0,0.6)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ ...commonHudStyle, padding: "0 16px", gap: "8px" }}
              >
                <GiTwoCoins size={28} color="#ffd700" />
                <span
                  style={{
                    color: "#ffd700",
                    fontWeight: "bold",
                    fontSize: "22px",
                  }}
                >
                  {store.receivedCoin}
                </span>
              </motion.div>
            </TopHudTooltipWrapper>

            <TopHudTooltipWrapper
              title="Distance Covered"
              desc="How far you have traveled."
              align="right"
            >
              <motion.div
                style={{
                  ...commonHudStyle,
                  padding: "0 20px",
                  gap: "12px",
                  minWidth: "140px",
                }}
              >
                <GiTatteredBanner size={28} color="#f1c40f" />
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
                    }}
                  >
                    {Math.floor(store.distance)}
                  </span>
                  <span style={{ color: "#8c734b", fontSize: "10px" }}>
                    METERS
                  </span>
                </div>
              </motion.div>
            </TopHudTooltipWrapper>
          </div>

          {/* Game World Area */}
          <div
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              borderBottom: "4px solid #0f0a08",
              width: "100%",
              backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : "none",
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPositionY: "bottom",
              backgroundPositionX: `-${store.distance * 20}px`,
              transition: "background-position 0.1s linear",
            }}
          >
            <TurnQueueBar store={store} />
            <DamagePopup
              popups={store.damagePopups}
              removePopup={store.removePopup}
            />

            <div
              style={{
                pointerEvents:
                  showTargetPicker || store.gameState !== "PLAYERTURN"
                    ? "none"
                    : "auto",
              }}
            >
              <SelectedLetterArea
                store={store}
                constraintsRef={constraintsRef}
              />
            </div>

            <BossHpBar boss={boss} />
            <PlayerEntity store={store} />

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
                    onSelect={() => {}}
                  />
                ))}
            </AnimatePresence>

            {store.validWordInfo && (
              <MeaningPopup entries={store.validWordInfo?.entries} />
            )}

            <AnimatePresence>
              {store.validWordInfo &&
                (prediction.guard.max > 0 || prediction.heal > 0) && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "170px",
                      right: `calc(50% + ${centerOffset}px)`,
                      zIndex: 9999,
                      pointerEvents: "none",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    {prediction.heal > 0 && (
                      <PredictionBadge
                        type="HEAL"
                        value={prediction.heal}
                        color="#2ecc71"
                        side="right"
                      />
                    )}
                    {prediction.guard.max > 0 && (
                      <PredictionBadge
                        type="SHIELD"
                        value={prediction.guard}
                        color="#3498db"
                        side="right"
                      />
                    )}
                  </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
              {store.validWordInfo &&
                (prediction.strike.max > 0 || prediction.recoil > 0) && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "170px",
                      left: `calc(50% + ${centerOffset}px)`,
                      zIndex: 9999,
                      pointerEvents: "none",
                      display: "flex",
                      gap: "8px",
                      flexDirection: "row-reverse",
                    }}
                  >
                    {prediction.recoil > 0 && (
                      <PredictionBadge
                        type="RECOIL"
                        value={prediction.recoil}
                        color="#8b0000"
                        side="left"
                        isWarning={true}
                      />
                    )}
                    {prediction.strike.max > 0 && (
                      <PredictionBadge
                        type="DAMAGE"
                        value={prediction.strike}
                        color="#ff4d4d"
                        side="left"
                      />
                    )}
                  </div>
                )}
            </AnimatePresence>
          </div>

          {/* Down Panel with Turn Glow Effect */}
          <div
            style={{
              flex: 1,
              background: "#1a120b",
              borderTop: "4px solid #5c4033",
              display: "flex",
              padding: "15px 0px",
              boxSizing: "border-box",
              position: "relative",
              boxShadow:
                store.gameState === "PLAYERTURN"
                  ? "inset 0 10px 30px rgba(212,175,55,0.15)"
                  : "none",
              transition: "box-shadow 0.5s ease",
            }}
          >
            {store.gameState === "PLAYERTURN" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  position: "absolute",
                  top: -6,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "#ffd700",
                  zIndex: 3001,
                }}
              />
            )}

            <div
              style={{
                flex: 1,
                display: "flex",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {store.gameState === "QUIZ_MODE" ? (
                <QuizOverlay
                  data={store.currentQuiz}
                  onAnswer={store.resolveQuiz}
                />
              ) : showTargetPicker ? (
                <TargetPickerOverlay
                  store={store}
                  onClose={() => {
                    setShowTargetPicker(false);
                    setPendingAction(null);
                  }}
                  onSelectTarget={(id) => executeAction(pendingAction, id)}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                    width: "1160px", // 🌟 บังคับความกว้างรวมของทั้ง 3 ส่วน (Status + Inventory + Action)
                    height: "100%",
                    flexShrink: 0,    // 🌟 ห้าม Parent มาบีบพื้นที่ส่วนนี้
                    margin: "0 auto", // จัดกึ่งกลาง
                  }}
                >
                  <PlayerStatusCard
                    onHeal={() => store.usePotion("health")}
                    onCure={() => store.usePotion("cure")}
                    onReroll={() => store.usePotion("reroll")}
                  />
                  <InventorySlot />
                  <ActionControls
                    store={store}
                    onAttackClick={() => handleActionClick("Strike")}
                    onShieldClick={() => handleActionClick("Guard")}
                    onSkillClick={() => handleActionClick("Skill")}
                    onEndTurnClick={store.passTurn}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <GameDialog
        open={isDialogOpen}
        onCancel={() => setIsDialogOpen(false)}
        onConfirm={handleExit}
        title="Surrender?"
        description="You will receive half of your earned coins."
        confirmText="YES"
        cancelText="NO"
      />
      {/* ⚙️ Dialog สำหรับ "ตั้งค่าเสียง" ในเกม */}
      <GameDialog
        open={openSettings}
        title="SETTINGS"
        onConfirm={handleSaveSettings}
        onCancel={() => setOpenSettings(false)}
        confirmText="SAVE"
        showAudioSettings={true}
        volume={volume}
        isMuted={isMuted}
        sfxVolume={sfxVolume}
        isSfxMuted={isSfxMuted}
      />
    </>
  );
}

const PredictionBadge = memo(
  ({ type, value, color, side, isWarning = false }) => {
    const displayValue =
      typeof value === "number" ? { min: value, max: value } : value;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        whileHover={{ y: -5 }}
      >
        <div
          style={{
            background: isWarning
              ? "rgba(40, 10, 10, 0.95)"
              : "rgba(26, 18, 11, 0.95)",
            border: `2px solid ${isWarning ? "#e74c3c" : "#5c4033"}`,
            [side === "right" ? "borderLeft" : "borderRight"]:
              `4px solid ${color}`,
            borderRadius: "6px",
            padding: "6px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
          }}
        >
          <span
            style={{
              color,
              fontSize: "18px",
              fontWeight: "bold",
              textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
            }}
          >
            {displayValue.min === displayValue.max
              ? displayValue.min
              : `${displayValue.min}-${displayValue.max}`}
          </span>
          <span
            style={{
              color: isWarning ? "#ff9999" : "#bdc3c7",
              fontSize: "9px",
              fontWeight: "bold",
            }}
          >
            {type}
          </span>
        </div>
      </motion.div>
    );
  },
);