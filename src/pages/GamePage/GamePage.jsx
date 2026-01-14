import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ipAddress } from "../../const";

// Store & Components
import { useGameStore } from "../../store/useGameStore";
import { DeckManager } from "../../utils/gameSystem";
import { InventorySlot } from "./features/downPanel/InventorySlot";
import { PlayerEntity } from "./features/topPanel/PlayerEntity";
import { EnemyEntity } from "./features/TopPanel/EnemyEntity";
import { MeaningPopup } from "./features/TopPanel/MeaningPopup";
import { QuizOverlay } from "./features/DownPanel/QuizOverlay";
import { Tooltip } from "./features/TopPanel/Tooltip";
import { ActionControls } from "./features/downPanel/ActionControls";
import { PlayerStatusCard } from "./features/downPanel/PlayerStatusCard";
import { TurnQueueBar } from "./features/TopPanel/TurnQueueBar";
import { DamagePopup } from "./features/TopPanel/DamagePopup";
import { SelectedLetterArea } from "./features/topPanel/SelectedLetterArea";
import { BossHpBar } from "./features/topPanel/BossHpBar";
import { TargetPickerOverlay } from "./features/downPanel/TargetPickerOverlay";

import LoadingView from "../../components/LoadingView";
import ErrorView from "../../components/ErrorView";

export default function GameApp() {
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

  // --- INIT ---
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
      alert("No Data");
      navigate("/home/adventure");
      return;
    }
    initGameData();
  }, []);

  // --- ANIMATION LOOP ---
  const animate = (time) => {
    if (appStatus !== "READY") return;
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

  // --- HELPERS ---
  const activeSelectedItems = store.selectedLetters.filter((i) => i !== null);
  const currentWord = activeSelectedItems.map((i) => i.char).join("");

  const getDamageInfo = () => {
    if (!store.validWordInfo) return { text: "-", value: 0 };
    const len = currentWord.length;
    return {
      text: `ATK: ${len * 2} | DEF: ${len * 3}`,
      atkValue: len * 2,
      defValue: len * 3,
    };
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

  const executeAction = async (type, targetId) => {
    store.addLog(`${type} with "${currentWord}"`, "success");
    const usedIndices = activeSelectedItems.map((i) => i.originalIndex);

    setPendingAction(null);
    setShowTargetPicker(false);
    store.initSelectedLetters();

    await store.performPlayerAction(type, currentWord, targetId, usedIndices);
  };

  if (appStatus === "LOADING")
    return <LoadingView progress={store.loadingProgress} />;
  if (appStatus === "ERROR")
    return <ErrorView error={errorMessage} onRetry={initGameData} />;

  const hoveredEnemy = store.enemies.find((e) => e.id === store.hoveredEnemyId);

  return (
    <div style={styles.container}>
      <div style={styles.gameBoard}>
        {/* --- TOP PANEL (Battle Area) --- */}
        <div
          style={{
            ...styles.battleArea,
            backgroundPositionX: `-${store.distance * 20}px`,
          }}
        >
          <TurnQueueBar store={store} />
          <DamagePopup
            popups={store.damagePopups}
            removePopup={store.removePopup}
          />

          <SelectedLetterArea store={store} constraintsRef={constraintsRef} />

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
                  onHover={(isHover) =>
                    store.setHoveredEnemyId(isHover ? en.id : null)
                  }
                />
              ))}
          </AnimatePresence>
          <BossHpBar boss={boss} />

          {store.validWordInfo && (
            <MeaningPopup meaning={store.validWordInfo.meaning} />
          )}
          <Tooltip
            hoveredEnemy={hoveredEnemy}
            castingSkill={null}
            damageInfo={getDamageInfo()}
          />
        </div>

        {/* --- BOTTOM PANEL (UI) --- */}
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
            <>
              <div
                style={{
                  flex: 1.5,
                  display: "flex",
                  justifyContent: "center", // ทั้งก้อนอยู่กลาง
                  alignItems: "center",
                  gap: "12px", // ระยะห่างระหว่าง Inventory กับ Action (ปรับได้)
                }}
              >
                <PlayerStatusCard store={store} />
                <InventorySlot
                  inventory={store.playerData.inventory}
                  onSelectLetter={(item, idx) => store.selectLetter(item, idx)}
                  playerSlots={store.playerData.unlockedSlots}
                  playerStats={store.playerData.stats}
                  gameState={store.gameState}
                />

                <ActionControls
                  store={store}
                  onAttackClick={() => handleActionClick("ATTACK")}
                  onShieldClick={() => handleActionClick("SHIELD")}
                  onSpinClick={() => {
                    const currentInv = store.playerData.inventory;
                    const unlockedSlots = store.playerData.unlockedSlots;
                    let tempInvForLogic = [...currentInv];

                    const nextInv = currentInv.map((item, index) => {
                      if (!item) return null;
                      const char = DeckManager.draw(
                        tempInvForLogic,
                        unlockedSlots
                      );
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
                  }}
                  onEndTurnClick={() => {
                    store.resetSelection();
                    store.endTurn();
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* GAME OVER OVERLAY */}
        {store.gameState === "OVER" && (
          <div style={styles.fullOverlay}>
            <h1
              style={{
                color: "#ff4d4d",
                fontSize: "3rem",
                textShadow: "4px 4px 0 #000",
              }}
            >
              GAME OVER
            </h1>
            <div
              style={{ color: "#fff", fontSize: "1.5rem", marginTop: "10px" }}
            >
              EXP Gained:{" "}
              <span style={{ color: "#f1c40f" }}>
                {Math.floor(store.accumulatedExp / 2)}
              </span>
            </div>
            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
              <button
                onClick={() => {
                  store.reset();
                  store.resetSelection();
                  initGameData(); // โหลดใหม่
                }}
                style={styles.restartBtn}
              >
                RETRY
              </button>
              <button
                onClick={() => {
                  navigate("/home/adventure");
                }}
                style={{
                  ...styles.restartBtn,
                  background: "#bdc3c7",
                  color: "#2c3e50",
                }}
              >
                GIVE UP
              </button>
            </div>
          </div>
        )}

        {/* MISSION COMPLETE OVERLAY */}
        {store.gameState === "GAME_CLEARED" && (
          <div style={styles.fullOverlay}>
            <h1
              style={{
                color: "#2ecc71",
                fontSize: "3rem",
                textShadow: "4px 4px 0 #000",
              }}
            >
              MISSION COMPLETE!
            </h1>
            <div
              style={{ color: "#fff", fontSize: "1.5rem", marginTop: "10px" }}
            >
              Total EXP:{" "}
              <span style={{ color: "#f1c40f" }}>{store.accumulatedExp}</span>
            </div>
            <button
              onClick={() => {
                store.reset();
                navigate("/home/adventure");
              }}
              style={{
                ...styles.restartBtn,
                background: "#2ecc71",
                color: "#fff",
                borderColor: "#fff",
              }}
            >
              RETURN TO MAP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#121212",
    overflow: "hidden",
  },
  gameBoard: {
    height: "95vh",
    aspectRatio: "10/6",
    width: "auto",
    maxWidth: "100vw",
    display: "flex",
    flexDirection: "column",
    border: "4px solid #000",
    background: "#B3F1FF",
    position: "relative", // 👈 สำคัญ! เพื่อให้ fullOverlay อ้างอิงขนาดจากตรงนี้
    overflow: "hidden",
  },
  battleArea: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    borderBottom: "4px solid #000",
    width: "100%",
    backgroundImage: `url(${ipAddress}/img_map/grassland.png)`,
    backgroundRepeat: "repeat-x",
    backgroundSize: "auto 100%",
    backgroundPositionY: "bottom",
  },
  // ... styles อื่นๆ เหมือนเดิม
  fullOverlay: {
    position: "absolute", // 👈 จะทับทุกอย่างใน gameBoard
    inset: 0, // ทับเต็มพื้นที่ บน ล่าง ซ้าย ขวา
    background: "rgba(0,0,0,0.85)", // สีดำโปร่งแสง
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100, // อยู่บนสุด
  },
  restartBtn: {
    padding: "12px 24px",
    background: "#ffeb3b",
    border: "4px solid #000",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
  },
  // ... styles อื่นๆ (queue, targetPicker ฯลฯ) คงเดิม
  reorderGroup: {
    display: "flex",
    gap: "8px", // ระยะห่างระหว่างตัวอักษรที่เลือก
    padding: "10px",
    listStyle: "none",
    margin: 0,
  },
  letterItem: {
    flexShrink: 0, // ป้องกันตัวอักษรบีบตัว
  },
  reorderContainer: {
    position: "absolute",
    top: "25%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    // width: "auto" หรือ "max-content" จะดีกว่าการล็อค 320px หากคำยาว
    width: "max-content",
    height: "80px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },

  targetCard: {
    display: "flex",
    alignItems: "center",
    background: "#2f3542",
    border: "3px solid #f1f2f6",
    borderRadius: "10px",
    padding: "12px",
    width: "220px",
    cursor: "pointer",
    boxShadow: "0 4px 0 #000",
    transition: "transform 0.1s ease",
  },
};
