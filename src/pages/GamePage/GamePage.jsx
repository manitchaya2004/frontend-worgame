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
import { DeckManager, InventoryUtils } from "../../utils/gameSystem";
import { InventorySlot } from "./features/downPanel/InventorySlot";
import { PlayerEntity } from "./features/topPanel/PlayerEntity";
import { EnemyEntity } from "./features/TopPanel/EnemyEntity";
import { MeaningPopup } from "./features/TopPanel/MeaningPopup";
import { QuizOverlay } from "./features/DownPanel/QuizOverlay";
import { Tooltip } from "./features/TopPanel/Tooltip";
import { BattleLog } from "./features/DownPanel/BattleLog";
import { ActionPanel } from "./features/DownPanel/ActionPanel";
import { TurnQueueBar } from "./features/TopPanel/TurnQueueBar"; 
import { DamagePopup } from "./features/TopPanel/DamagePopup"

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

          <div ref={constraintsRef} style={styles.reorderContainer}>
            <Reorder.Group
              axis="x"
              values={activeSelectedItems}
              onReorder={(newOrder) => store.reorderLetters(newOrder)}
              style={styles.reorderGroup}
            >
              <AnimatePresence initial={false}>
                {activeSelectedItems.map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    dragConstraints={constraintsRef}
                    onTap={() => store.deselectLetter(item)}
                    style={styles.letterItem}
                  >
                    {item.char}
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>

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

          {store.validWordInfo && (
            <MeaningPopup meaning={store.validWordInfo.meaning} />
          )}
          <Tooltip
            hoveredEnemy={hoveredEnemy}
            castingSkill={null}
            damageInfo={getDamageInfo()}
          />

          {/* ❌ เอา Overlay ออกจากตรงนี้ (Battle Area) เพื่อไม่ให้ถูกจำกัดแค่จอบน */}
        </div>

        {/* --- BOTTOM PANEL (UI) --- */}
        <div style={styles.bottomUi}>
          {store.gameState === "QUIZ_MODE" && store.currentQuiz ? (
            <QuizOverlay
              data={store.currentQuiz}
              onAnswer={store.resolveQuiz}
            />
          ) : showTargetPicker ? (
            <div style={styles.targetPickerMenu}>
              <div style={styles.targetHeader}>
                <h3 style={styles.targetTitle}>SELECT TARGET</h3>
                <div
                  style={styles.targetCardCancel}
                  onClick={() => {
                    setShowTargetPicker(false);
                    setPendingAction(null);
                  }}
                >
                  <span>CLOSE [X]</span>
                </div>
              </div>
              <div style={styles.targetList}>
                {store.enemies
                  .filter((e) => e.hp > 0)
                  .map((en) => (
                    <div
                      key={en.id}
                      onClick={() => handleSelectTargetFromMenu(en.id)}
                      style={styles.targetCard}
                      onMouseEnter={() => store.setHoveredEnemyId(en.id)}
                      onMouseLeave={() => store.setHoveredEnemyId(null)}
                    >
                      <div style={styles.targetIconFrame}>
                        <img
                          src={`${ipAddress}/img_monster/${
                            en.monster_id
                          }-idle-${store.animFrame + 1}.png`}
                          alt={en.name}
                          style={styles.targetIcon}
                        />
                      </div>
                      <div style={styles.targetInfo}>
                        <span style={styles.targetNameText}>{en.name}</span>
                        <div style={styles.miniHpBarContainer}>
                          <div
                            style={{
                              ...styles.miniHpBarFill,
                              width: `${(en.hp / en.max_hp) * 100}%`,
                              backgroundColor:
                                (en.hp / en.max_hp) * 100 > 45
                                  ? "#4cd137"
                                  : "#ff4757",
                            }}
                          />
                        </div>
                        <span style={styles.miniHpText}>
                          {Math.ceil(en.hp)} / {en.max_hp}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <>
              <div style={{ flex: 1 }}>
                <BattleLog logs={store.logs} />
              </div>

              <div
                style={{ flex: 2, justifyContent: "center", display: "flex" }}
              >
                <InventorySlot
                  inventory={store.playerData.inventory}
                  onSelectLetter={(item, idx) => store.selectLetter(item, idx)}
                  playerSlots={store.playerData.unlockedSlots}
                  playerStats={store.playerData.stats}
                  gameState={store.gameState} 
                />
              </div>

              <div style={{ flex: 1}}>
                <ActionPanel
                  playerData={store.playerData}
                  gameState={store.gameState}
                  validWordInfo={store.validWordInfo}
                  onAttackClick={() => handleActionClick("ATTACK")}
                  onShieldClick={() => handleActionClick("SHIELD")}
                  onSpinClick={() => {
                    const currentInv = store.playerData.inventory;
                    const unlockedSlots = store.playerData.unlockedSlots;
                    let tempInvForLogic = [...currentInv]; 
                    const nextInv = currentInv.map((item, index) => {
                      if (item === null) return null;
                      const char = DeckManager.draw(tempInvForLogic, unlockedSlots);
                      const newItem = {
                        id: Math.random(),
                        char: char,
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
                  store.reset();
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
  reorderContainer: {
    position: "absolute",
    top: "25%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    width: "320px",
    height: "80px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  reorderGroup: {
    display: "flex",
    gap: "8px",
    listStyle: "none",
    padding: 0,
    pointerEvents: "auto",
  },
  letterItem: {
    background: "#f2a654",
    width: "44px",
    height: "44px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "3px solid #000",
    fontWeight: "bold",
    fontSize: "22px",
    cursor: "grab",
    boxShadow: "0 4px 0 #b37400",
  },
  bottomUi: {
    flex: 1,
    background: "#1a120b",
    borderTop: "4px solid #5c4033",
    display: "flex",
    padding: "15px",
    gap: "20px",
    height: "280px",
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "stretch",
  },
  targetPickerMenu: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    background: "rgba(26, 18, 11, 0.95)",
    padding: "20px",
    zIndex: 10,
    border: "2px solid #5c4033",
  },
  targetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "15px",
    borderBottom: "2px solid #5c4033",
    paddingBottom: "10px",
  },
  targetTitle: {
    color: "#ffeb3b",
    margin: 0,
    fontSize: "1.4rem",
    textShadow: "2px 2px 0px #000",
    letterSpacing: "2px",
  },
  targetList: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    overflowY: "auto",
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
  targetIconFrame: {
    width: "60px",
    height: "60px",
    background: "rgba(0,0,0,0.3)",
    borderRadius: "6px",
    marginRight: "12px",
    overflow: "hidden",
    border: "2px solid #57606f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  targetIcon: {
    width: "110%",
    height: "110%",
    objectFit: "contain",
    imageRendering: "pixelated",
  },
  targetInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "5px" },
  targetNameText: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  miniHpBarContainer: {
    width: "100%",
    height: "10px",
    background: "#1e272e",
    borderRadius: "5px",
    overflow: "hidden",
    border: "1px solid #000",
  },
  miniHpBarFill: {
    height: "100%",
    transition: "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
  miniHpLabelRow: { display: "flex", justifyContent: "flex-end" },
  miniHpText: { color: "#ced6e0", fontSize: "11px", fontWeight: "bold" },
  targetCardCancel: {
    background: "#ff4757",
    color: "#fff",
    border: "2px solid #fff",
    borderRadius: "6px",
    padding: "5px 15px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
    boxShadow: "0 2px 0 #000",
  },
};
