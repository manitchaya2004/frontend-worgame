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

// Store & Types
import { useGameStore } from "../../store/useGameStore";

// Utils & Config
import { DeckManager, InventoryUtils } from "../../utils/gameSystem";

// Components
import { InventorySlot } from "./features/downPanel/InventorySlot";
import { PlayerEntity } from "./features/topPanel/PlayerEntity";
import { EnemyEntity } from "./features/TopPanel/EnemyEntity";
import { MeaningPopup } from "./features/TopPanel/MeaningPopup";
import { QuizOverlay } from "./features/DownPanel/QuizOverlay";
import { Tooltip } from "./features/TopPanel/Tooltip";
import { BattleLog } from "./features/DownPanel/BattleLog";
import { ActionPanel } from "./features/DownPanel/ActionPanel"; 

import LoadingView from "../../components/LoadingView";
import ErrorView from "../../components/ErrorView";

// ============================================================================
// 🆕 COMPONENT: TURN QUEUE BAR
// ============================================================================
const TurnQueueBar = ({ store }) => {
  const { turnQueue, enemies, gameState, playerData } = store;

  if (!turnQueue || turnQueue.length === 0 || gameState === "ADVANTURE") return null;

  // 🔥 สำคัญ: สร้าง List ใหม่สำหรับแสดงผล โดยคัดคนที่ตาย (HP <= 0) ออกทันที
  // React จะ Re-render ทันทีที่ store.enemies อัปเดตค่า HP
  const visibleQueue = turnQueue.filter((unit) => {
    if (unit.type === "player") {
      return playerData.hp > 0; // ถ้าผู้เล่นตายก็ให้หายเหมือนกัน (หรือจะเก็บไว้ก็ได้)
    } else {
      // ค้นหาข้อมูล Enemy ตัวจริงเพื่อเช็ค HP ปัจจุบัน
      const enemyData = enemies.find((e) => e.id === unit.id);
      // "เก็บไว้" ถ้าหาเจอและ HP > 0
      return enemyData && enemyData.hp > 0;
    }
  });

  return (
    <div style={styles.queueContainer}>
      <div style={styles.queueList}>
        <AnimatePresence mode="popLayout">
          {/* ✅ ใช้ visibleQueue แทน turnQueue เดิม */}
          {visibleQueue.map((unit, index) => {
            const isCurrentTurn = index === 0; // เช็คจาก visible queue โดยตรง
            
            // Logic รูปภาพ
            let imgSrc = "";
            if (unit.type === "player") {
              imgSrc = `${ipAddress}/img_hero/${playerData.name}-idle-1.png`; 
            } else {
              const enemyData = enemies.find(e => e.id === unit.id);
              if (enemyData) {
                imgSrc = `${ipAddress}/img_monster/${enemyData.monster_id}-idle-1.png`;
              } else {
                imgSrc = "https://via.placeholder.com/40/000000/ffffff?text=X";
              }
            }

            return (
              <motion.div
                key={unit.uniqueId} // สำคัญ: uniqueId ต้องไม่เปลี่ยน
                layout // ให้เพื่อนขยับมาแทนที่
                
                initial={{ opacity: 0, scale: 0.5, x: 50 }}
                
                animate={{ 
                  opacity: 1, 
                  scale: isCurrentTurn ? 1.3 : 1, 
                  x: 0,
                  borderColor: isCurrentTurn ? "#f1c40f" : "#7f8c8d",
                  zIndex: isCurrentTurn ? 10 : 1
                }}
                
                // 🔽 Animation ตอนหายไป (ตายปุ๊บ ทำงานปั๊บ)
                exit={{ 
                  opacity: 0, 
                  scale: 0, 
                  y: 50, // จางลงล่าง
                  transition: { duration: 0.4, ease: "backIn" } 
                }}
                
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                
                style={{
                  ...styles.queueCard,
                  boxShadow: isCurrentTurn ? "0 0 15px #f1c40f, 0 4px 0 #000" : "0 3px 0 #000"
                }}
              >
                {/* Arrow Active */}
                {isCurrentTurn && (
                    <motion.div 
                      layoutId="activeArrow" // ใส่ layoutId ช่วยให้ลูกศรลอยไปหาคนถัดไปสมูทขึ้น
                      initial={{ y: -10 }} 
                      animate={{ y: 0 }} 
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
                      style={styles.activeArrow}
                    >
                      ▼
                    </motion.div>
                )}

                <div style={styles.queueImgFrame}>
                  <img 
                    src={imgSrc} 
                    alt={unit.name} 
                    style={styles.queueImg} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=?'; }}
                  />
                </div>

                <div style={{
                    ...styles.queueSpeedBadge,
                    background: isCurrentTurn ? "#e74c3c" : "#e67e22"
                }}>
                  {unit.originalInitiative}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
// ============================================================================
// 🎮 MAIN COMPONENT: GameApp
// ============================================================================
export default function GameApp() {
  const store = useGameStore();
  const location = useLocation(); // 👈 เรียก useLocation
  const navigate = useNavigate(); // 👈 เรียก useNavigate

  // 1. ดึงค่าจาก state ที่ส่งมาจากหน้าเลือกด่าน
  const { currentUser, selectedStage } = location.state || {};

  const [appStatus, setAppStatus] = useState("LOADING");
  const [errorMessage, setErrorMessage] = useState("");
  
  // State ใหม่สำหรับ Action
  const [pendingAction, setPendingAction] = useState(null); // 'ATTACK' | 'SHIELD'
  
  const [animFrame, setAnimFrame] = useState(0);
  const [validWordInfo, setValidWordInfo] = useState(null);
  const [hoveredEnemyId, setHoveredEnemyId] = useState(null);
  const [logs, setLogs] = useState([]);

  const inventory = store.playerData.inventory || [];
  
  const [selectedLetters, setSelectedLetters] = useState(
    new Array(store.playerData.unlockedSlots).fill(null)
  );

  const constraintsRef = useRef(null);
  const requestRef = useRef(0);
  const lastTimeRef = useRef(0);

  const [showTargetPicker, setShowTargetPicker] = useState(false);

  // --- COMPUTED ---
  const activeSelectedItems = useMemo(
    () => selectedLetters.filter((item) => item !== null),
    [selectedLetters]
  );

  const currentWord = useMemo(
    () => activeSelectedItems.map((l) => l.char).join("").toLowerCase(),
    [activeSelectedItems]
  );

  const hoveredEnemy = store.enemies.find((e) => e.id === hoveredEnemyId);

  // --- LOGGING ---
  const addLog = useCallback((message, type = "info", combatData) => {
    setLogs((prev) => {
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        message,
        type,
        timestamp: Date.now(),
        combat: combatData,
      };
      const newLogs = [...prev, newLog];
      return newLogs.length > 50 ? newLogs.slice(newLogs.length - 50) : newLogs;
    });
  }, []);

  // --- INIT ---
const initGameData = async () => {
    setAppStatus("LOADING");
    try {
      // ✅ ส่ง currentUser และ selectedStage เข้าไปใน store
      await store.initializeGame(currentUser, selectedStage);
      setAppStatus("READY");
    } catch (err) {
      setErrorMessage(err.message || "Failed to load game data");
      setAppStatus("ERROR");
    }
  };

  useEffect(() => {
    initGameData();
  }, []);

useEffect(() => {
    // ถ้าไม่มีข้อมูล ให้ดีดกลับ
    if (!selectedStage || !currentUser) {
       alert("ไม่พบข้อมูลด่าน กรุณาเลือกด่านก่อน");
       navigate("/home/adventure"); 
       return;
    }

    // ถ้าข้อมูลครบ ให้เริ่มเกม
    initGameData();
  }, []);

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
      const t = setInterval(() => setAnimFrame((f) => (f === 0 ? 1 : 0)), 250);
      return () => {
        cancelAnimationFrame(requestRef.current);
        clearInterval(t);
      };
    }
  }, [appStatus]);

  // --- LOGIC ---
  const resetSelection = useCallback(() => {
    setPendingAction(null);
    setShowTargetPicker(false);
  }, []);

  useEffect(() => {
    if (!currentWord) {
      setValidWordInfo(null);
      resetSelection();
      return;
    }
    const found = store.dictionary.find(
      (d) => d.word.toLowerCase() === currentWord
    );
    setValidWordInfo(found || null);
    if (!found) resetSelection();
  }, [currentWord, store.dictionary, resetSelection]);

  // คำนวณความเสียหายพื้นฐาน (Word Length * Multiplier)
  const getDamageInfo = () => {
    if (!validWordInfo) return { text: "-", value: 0 };
    
    const wordLen = currentWord.length;
    // แสดงทั้ง ATK และ SHIELD
    // ATK = len * 2
    // SHIELD = len * 3
    return {
        text: `ATK: ${wordLen * 2} | DEF: ${wordLen * 3}`,
        atkValue: wordLen * 2,
        defValue: wordLen * 3
    }
  };

  // --- INTERACTION ---
  const handleSelectLetter = (item, idx) => {
    if (store.gameState !== "PLAYERTURN") return;
    const emptyIdx = selectedLetters.findIndex((s) => s === null);
    if (emptyIdx !== -1) {
      const newSelected = [...selectedLetters];
      newSelected[emptyIdx] = item;
      setSelectedLetters(newSelected);

      const newInv = [...inventory];
      newInv[idx] = null;
      store.setInventory(newInv);
    }
  };

  const handleDeselectLetter = (idx) => {
    const item = selectedLetters[idx];
    if (item && store.gameState === "PLAYERTURN") {
      const newInv = InventoryUtils.returnItems(
        inventory,
        [item],
        store.playerData.unlockedSlots
      );
      store.setInventory(newInv);

      const newSelected = [...selectedLetters];
      newSelected[idx] = null;
      const remaining = newSelected.filter((l) => l !== null);
      setSelectedLetters([
        ...remaining,
        ...new Array(store.playerData.unlockedSlots - remaining.length).fill(null),
      ]);
    }
  };

  const handleResetLetters = useCallback(() => {
    const items = activeSelectedItems;
    if (items.length === 0) return;
    const newInv = InventoryUtils.returnItems(
      inventory,
      items,
      store.playerData.unlockedSlots
    );
    store.setInventory(newInv);
    setSelectedLetters(new Array(store.playerData.unlockedSlots).fill(null));
  }, [activeSelectedItems, inventory, store]);


  // 🔥 MAIN ACTIONS 🔥
  const onAttackClick = () => {
      if (!validWordInfo) return;
      setPendingAction("ATTACK");
      // ถ้าศัตรูเหลือตัวเดียว ตีเลย
      const alive = store.enemies.filter(e => e.hp > 0);
      if (alive.length === 1) {
          executeAction("ATTACK", alive[0].id);
      } else {
          setShowTargetPicker(true);
      }
  };

  const onShieldClick = () => {
      if (!validWordInfo) return;
      executeAction("SHIELD", null);
  };

  const onSpinClick = () => {
    if (store.playerData.rp < 1) {
        addLog("RP ไม่พอ!", "error");
        return;
    }
    const nextInv = inventory.map((item, index) => 
        item === null ? null : DeckManager.createItem(index)
    );
    store.actionSpin(nextInv);
  };

  const onEndTurnClick = () => {
      handleResetLetters();
      store.endTurn();
  };

  const handleSelectTargetFromMenu = async (enemyId) => {
    setHoveredEnemyId(null); 
    setShowTargetPicker(false);
    await executeAction("ATTACK", enemyId);
  };

  const executeAction = async (actionType, targetId) => {
    const usedIndices = activeSelectedItems.map((item) => item.originalIndex);
    
    addLog(`${actionType} using "${currentWord}"`, "success");
    setSelectedLetters(new Array(store.playerData.unlockedSlots).fill(null));
    setValidWordInfo(null);
    setPendingAction(null);

    await store.performPlayerAction(actionType, currentWord, targetId, usedIndices);
  };

  // --- RENDER ---
  if (appStatus === "LOADING") return <LoadingView progress={store.loadingProgress} />;
  if (appStatus === "ERROR") return <ErrorView error={errorMessage} onRetry={initGameData} />;

  return (
    <div style={styles.container}>
      <div style={styles.gameBoard}>
        
        <pre style={{position: 'absolute', top:0, left:0, margin:0, zIndex:0, opacity:0.3}}>
          {store.distance.toFixed(0)} {store.gameState}
        </pre>

        <div
          style={{
            ...styles.battleArea,
            backgroundPositionX:`-${store.distance * 20}px`
          }}
        >
          <TurnQueueBar store={store} />

          <div ref={constraintsRef} style={styles.reorderContainer}>
            <Reorder.Group
              axis="x"
              values={activeSelectedItems}
              onReorder={(newOrder) => {
                setSelectedLetters([
                  ...newOrder,
                  ...new Array(store.playerData.unlockedSlots - newOrder.length).fill(null),
                ]);
              }}
              style={styles.reorderGroup}
            >
              <AnimatePresence initial={false}>
                {activeSelectedItems.map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    dragConstraints={constraintsRef}
                    onTap={() => handleDeselectLetter(selectedLetters.findIndex(s => s?.id === item.id))}
                    style={styles.letterItem}
                  >
                    {item.char}
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>

          <PlayerEntity
            store={store}
            animFrame={animFrame}
            onAnimationComplete={() => store.notifyAnimationComplete()}
          />

          <AnimatePresence>
            {store.enemies.filter(en => en.hp > 0).map((en, i) => (
              <EnemyEntity
                key={en.id}
                enemy={en}
                index={i}
                animFrame={animFrame}
                gameState={store.gameState}
                isTargeted={false} 
                onSelect={() => {}} 
                onHover={(isHover) => setHoveredEnemyId(isHover ? en.id : null)}
                selectionCount={0}
              />
            ))}
          </AnimatePresence>

          {validWordInfo && <MeaningPopup meaning={validWordInfo.meaning} />}
          
          <Tooltip 
            hoveredEnemy={hoveredEnemy} 
            castingSkill={null} 
            damageInfo={getDamageInfo()} 
          />

          {store.gameState === "OVER" && (
            <div style={styles.fullOverlay}>
              <h1 style={{ color: "#ff4d4d" }}>GAME OVER</h1>
              <button onClick={() => { store.reset(); handleResetLetters(); }} style={styles.restartBtn}>RESTART</button>
            </div>
          )}
        </div>

        {/* Bottom UI Area */}
        <div style={styles.bottomUi}>
          {store.gameState === "QUIZ_MODE" && store.currentQuiz ? (
            <QuizOverlay
              data={store.currentQuiz}
              onAnswer={(ans) => store.resolveQuiz(ans)}
              onTimeout={() => store.resolveQuiz("TIMEOUT")}
            />
          ) : showTargetPicker ? (
            <div style={styles.targetPickerMenu}>
              <div style={styles.targetHeader}>
                <h3 style={styles.targetTitle}>SELECT TARGET</h3>
                <div 
                  style={styles.targetCardCancel} 
                  onClick={() => { setShowTargetPicker(false); setPendingAction(null); }}
                >
                  <span>CLOSE [X]</span>
                </div>
              </div>
              <div style={styles.targetList}>
                {store.enemies.filter(e => e.hp > 0).map((en) => {
                  const hpPercent = (en.hp / en.max_hp) * 100;
                  const monsterImg = `${ipAddress}/img_monster/${en.monster_id}-idle-${animFrame + 1}.png`;

                  return (
                    <div 
                      key={en.id} 
                      onClick={() => handleSelectTargetFromMenu(en.id)}
                      style={styles.targetCard}
                      onMouseEnter={() => setHoveredEnemyId(en.id)}
                      onMouseLeave={() => setHoveredEnemyId(null)}
                    >
                      <div style={styles.targetIconFrame}>
                        <img 
                          src={monsterImg} 
                          alt={en.name} 
                          style={styles.targetIcon}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=?'; }}
                        />
                      </div>
                      <div style={styles.targetInfo}>
                        <span style={styles.targetNameText}>{en.name}</span>
                        <div style={styles.miniHpBarContainer}>
                          <div 
                            style={{
                              ...styles.miniHpBarFill,
                              width: `${Math.max(0, hpPercent)}%`,
                              backgroundColor: hpPercent > 45 ? "#4cd137" : hpPercent > 20 ? "#eab543" : "#ff4757"
                            }} 
                          />
                        </div>
                        <div style={styles.miniHpLabelRow}>
                           <span style={styles.miniHpText}>{Math.ceil(en.hp)} / {en.max_hp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
) : (
            <>
            {/* 1. LEFT PANEL: Battle Log */}
            <div 
              style={{ 
                flex: 1, 
                maxWidth: "300px", 
                minWidth: "240px",
                display: "flex",
                flexDirection: "column" 
              }}
            >
              <BattleLog logs={logs} />
            </div>

            {/* 2. CENTER PANEL: Inventory (แก้ตรงนี้!) */}
            <div 
              style={{ 
                // ให้ flex เยอะกว่าเพื่อน เพื่อให้มันพยายามจะใหญ่
                flex: 2,  
                maxWidth: "400px", 
                width: "100%", 
                display: "flex", 
                justifyContent: "center",
              }}
            > 
              <InventorySlot
                inventory={inventory}
                onSelectLetter={handleSelectLetter}
                playerSlots={store.playerData.unlockedSlots}
                playerStats={store.playerData.stats} 
              />
            </div>

            {/* 3. RIGHT PANEL: Action Buttons */}
            <div 
              style={{ 
                flex: 1, 
                maxWidth: "300px", 
                minWidth: "240px", 
                display: "flex", 
                flexDirection: "column",
                height: "100%" 
              }}
            >
              <ActionPanel
                playerData={store.playerData}
                gameState={store.gameState}
                validWordInfo={validWordInfo}
                onAttackClick={onAttackClick}
                onShieldClick={onShieldClick}
                onSpinClick={onSpinClick}
                onEndTurnClick={onEndTurnClick}
              />
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 🎨 STYLES
// ============================================================================
const styles = {
  container: {
    width: "100vw", height: "100vh", display: "flex", justifyContent: "center",
    alignItems: "center", background: "#121212", overflow: "hidden"
  },
  gameBoard: {
    height: "95vh", aspectRatio: "10/6", width: "auto", maxWidth: "100vw",
    display: "flex", flexDirection: "column", border: "4px solid #000",
    background: "#B3F1FF", position: "relative", overflow: "hidden"
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
  reorderContainer: {
    position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)",
    zIndex: 100, width: "320px", height: "80px", display: "flex", 
    justifyContent: "center", alignItems: "center", pointerEvents: "none"
  },
  reorderGroup: {
    display: "flex", gap: "8px", listStyle: "none", padding: 0, pointerEvents: "auto"
  },
  letterItem: {
    background: "#f2a654", width: "44px", height: "44px", display: "flex",
    justifyContent: "center", alignItems: "center", border: "3px solid #000",
    fontWeight: "bold", fontSize: "22px", cursor: "grab", boxShadow: "0 4px 0 #b37400"
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
        
        // ✨ เปลี่ยนตรงนี้: ให้ทุกกล่องมากองรวมกันตรงกลาง แล้วใช้ gap แยกเอา
        // แทนที่จะใช้ space-between ที่ผลักออกข้างสุด
        justifyContent: "center", 
        alignItems: "stretch",
  },
  actionButtonContainer: {
      flex: 1,
      maxWidth: "300px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      alignContent: "center"
  },
  actionBtn: {
      border: "3px solid #fff",
      borderRadius: "10px",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
      boxShadow: "0 4px 0 rgba(0,0,0,0.5)",
      transition: "transform 0.1s"
  },
  btnIcon: {
      fontSize: "24px",
      marginBottom: "5px"
  },
  fullOverlay: {
    position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)",
    display: "flex", flexDirection: "column", justifyContent: "center",
    alignItems: "center", zIndex: 100
  },
  restartBtn: {
    padding: "12px 24px", background: "#ffeb3b", border: "4px solid #000",
    fontWeight: "bold", cursor: "pointer", marginTop: "20px"
  },
  targetPickerMenu: {
    position: "absolute", 
    inset: 0,            
    display: "flex",
    flexDirection: "column",
    background: "rgba(26, 18, 11, 0.95)", 
    padding: "20px",
    zIndex: 10,
    border: "2px solid #5c4033"
  },
  targetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "15px",
    borderBottom: "2px solid #5c4033",
    paddingBottom: "10px"
  },
  targetTitle: { 
    color: "#ffeb3b", 
    margin: 0, 
    fontSize: "1.4rem", 
    textShadow: "2px 2px 0px #000",
    letterSpacing: "2px"
  },
  targetList: { 
    display: "flex", 
    gap: "15px", 
    flexWrap: "wrap", 
    justifyContent: "flex-start", 
    alignItems: "flex-start",
    overflowY: "auto" 
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
    "&:hover": { transform: "translateY(-2px)" }
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
    justifyContent: "center"
  },
  targetIcon: { 
    width: "110%", 
    height: "110%", 
    objectFit: "contain",
    imageRendering: "pixelated" 
  },
  targetInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "5px" },
  targetNameText: { color: "#fff", fontSize: "16px", fontWeight: "bold", textTransform: "uppercase" },
  miniHpBarContainer: { 
    width: "100%", 
    height: "10px", 
    background: "#1e272e", 
    borderRadius: "5px", 
    overflow: "hidden", 
    border: "1px solid #000" 
  },
  miniHpBarFill: { height: "100%", transition: "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" },
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
    boxShadow: "0 2px 0 #000"
  },

  // Turn Queue Styles
  queueContainer: {
    position: "absolute",
    top: "15px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 50,
    background: "rgba(0,0,0,0.4)",
    padding: "5px 10px",
    borderRadius: "10px",
    border: "2px solid #000"
  },
  queueList: {
    display: "flex",
    gap: "8px",
  },
  queueCard: {
    position: "relative",
    width: "45px",
    height: "45px",
    background: "#2c3e50",
    border: "2px solid #7f8c8d",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 3px 0 #000"
  },
  queueImgFrame: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: "3px",
  },
  queueImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    imageRendering: "pixelated"
  },
  queueSpeedBadge: {
    position: "absolute",
    bottom: "-5px",
    right: "-5px",
    background: "#e67e22",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "bold",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.5)"
  },
  activeArrow: {
    position: "absolute",
    top: "-15px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "#f1c40f",
    fontSize: "12px",
    animation: "bounce 0.5s infinite"
  }
};