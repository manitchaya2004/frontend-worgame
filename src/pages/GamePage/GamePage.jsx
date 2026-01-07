import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Reorder, AnimatePresence } from "framer-motion";

import { ipAddress } from "../../const";

// Store & Types (ถ้าใช้ JSX ไม่ต้อง import type)
import { useGameStore } from "../../store/useGameStore";

// Utils & Config
import { DeckManager, InventoryUtils } from "../../utils/gameSystem";

// Components
import { InventorySlot } from "./features/downPanel/InventorySlot";
import { SkillBar } from "./features/DownPanel/SkillBar";
import { PlayerEntity } from "./features/TopPanel/PlayerEntity";
import { EnemyEntity } from "./features/TopPanel/EnemyEntity";
import { MeaningPopup } from "./features/TopPanel/MeaningPopup";
import { QuizOverlay } from "./features/DownPanel/QuizOverlay";
import { Tooltip } from "./features/TopPanel/Tooltip";
import { BattleLog } from "./features/DownPanel/BattleLog";

import LoadingView from "../../components/LoadingView";
import ErrorView from "../../components/ErrorView";

export default function GameApp() {
  const store = useGameStore();

  // --- LOCAL UI STATE ---
  const [appStatus, setAppStatus] = useState("LOADING");
  const [errorMessage, setErrorMessage] = useState("");
  const [castingSkill, setCastingSkill] = useState(null);
  const [selectedTargets, setSelectedTargets] = useState([]);

  const [animFrame, setAnimFrame] = useState(0);
  const [validWordInfo, setValidWordInfo] = useState(null);
  const [hoveredEnemyId, setHoveredEnemyId] = useState(null);
  const [logs, setLogs] = useState([]);

  // ✅ ดึง Inventory จาก Store มาใช้
  const inventory = store.playerData.inventory || [];
  
  // ✅ เก็บตัวอักษรที่ถูกเลือกมาวางเป็นคำ (Local State เพราะต้องใช้ Reorder)
  const [selectedLetters, setSelectedLetters] = useState(
    new Array(store.playerData.unlockedSlots).fill(null)
  );

  const previousGameState = useRef(store.gameState);

  const constraintsRef = useRef(null);
  const requestRef = useRef(0);
  const lastTimeRef = useRef(0);

  // เพิ่ม State สำหรับคุมการเปิด/ปิดเมนูเลือกเป้าหมาย
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

  // --- GAME LOOP & INIT ---
  const initGameData = async () => {
    setAppStatus("LOADING");
    try {
      await store.initializeGame();
      setAppStatus("READY");
    } catch (err) {
      setErrorMessage(err.message || "Failed to load game data");
      setAppStatus("ERROR");
    }
  };

  useEffect(() => {
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

  // --- GAME LOGIC HANDLERS ---
  
  // รีเซ็ตการร่ายสกิล
  const resetCasting = useCallback(() => {
    setCastingSkill(null);
    setSelectedTargets([]);
  }, []);

  // ตรวจสอบคำศัพท์จาก Dictionary ใน Store
  useEffect(() => {
    if (!currentWord) {
      setValidWordInfo(null);
      resetCasting();
      return;
    }
    const found = store.dictionary.find(
      (d) => d.word.toLowerCase() === currentWord
    );
    setValidWordInfo(found || null);
    if (!found) resetCasting();
  }, [currentWord, store.dictionary, resetCasting]);

  // คำนวณความเสียหายเบื้องต้นเพื่อแสดงผลใน Tooltip
  const getDamageInfo = () => {
    if (!castingSkill) return { text: "0", value: 0, isWeak: false };
    const isBasic = (castingSkill.mpCost || 0) === 0;

    if (castingSkill.effectType === "DAMAGE") {
      if (isBasic) {
        let weightedScore = 0;
        let hasWeakness = false;
        if (hoveredEnemy?.weakness_list) {
          for (const char of currentWord) {
            const weakData = hoveredEnemy.weakness_list.find(
              (w) => w.alphabet.toLowerCase() === char
            );
            if (weakData) {
              weightedScore += weakData.multiplier;
              hasWeakness = true;
            } else {
              weightedScore += 1;
            }
          }
        } else {
          weightedScore = currentWord.length;
        }
        const finalDmg = (weightedScore * (castingSkill.basePower || 1)).toFixed(1);
        return { text: `${finalDmg}`, value: parseFloat(finalDmg), isWeak: hasWeakness };
      }
      return { text: `${castingSkill.damageMin || 0}`, value: castingSkill.damageMin || 0, isWeak: false };
    }
    
    if (castingSkill.effectType === "SHIELD") {
      const shieldVal = isBasic ? currentWord.length * (castingSkill.basePower || 1) : (castingSkill.basePower || 0);
      return { text: `+${shieldVal}`, value: shieldVal, isWeak: false };
    }
    return { text: "-", value: 0, isWeak: false };
  };

  // --- INTERACTION HANDLERS ---

  const handleSelectLetter = (item, idx) => {
    if (store.gameState !== "PLAYERTURN") return;
    const emptyIdx = selectedLetters.findIndex((s) => s === null);
    if (emptyIdx !== -1) {
      const newSelected = [...selectedLetters];
      newSelected[emptyIdx] = item;
      setSelectedLetters(newSelected);

      // นำออกจาก Inventory ใน Store
      const newInv = [...inventory];
      newInv[idx] = null;
      store.setInventory(newInv);
    }
  };

  const handleDeselectLetter = (idx) => {
    const item = selectedLetters[idx];
    if (item && store.gameState === "PLAYERTURN") {
      // คืนเข้า Inventory ใน Store
      const newInv = InventoryUtils.returnItems(
        inventory,
        [item],
        store.playerData.unlockedSlots
      );
      store.setInventory(newInv);

      // เอาออกจากแถบคำศัพท์ และเลื่อนตัวที่เหลือมาข้างหน้า
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

    const handleSkillClick = (skill) => {
      if (store.playerData.mp < (skill.mpCost || 0)) {
        addLog("MP ไม่พอ!", "info");
        return;
      }

      if (skill.targetType === "SELF") {
        executeSkill(skill, currentWord, ["PLAYER"]); // ส่ง ID พิเศษสำหรับตัวเอง
      } else if (skill.targetType === "ALL") {
        // เลือกศัตรูที่ยังมีชีวิตอยู่ทั้งหมด
        const allAliveIds = store.enemies.filter(e => e.hp > 0).map(e => e.id);
        executeSkill(skill, currentWord, allAliveIds);
      } else if (skill.targetType === "SINGLE") {
        // เปิด UI เลือกเป้าหมาย
        setCastingSkill(skill);
        setShowTargetPicker(true);
      }
    };

  const handleSelectTargetFromMenu = async (enemyId) => {
    // 1. ล้างสถานะ Hover ทันที เพื่อไม่ให้ศัตรูสว่างค้าง
    setHoveredEnemyId(null); 
    
    // 2. ปิดเมนูเลือกเป้าหมาย
    setShowTargetPicker(false);
    
    // 3. เริ่มการทำงานของสกิล
    await executeSkill(castingSkill, currentWord, [enemyId]);
  };

  const executeSkill = async (skill, word, targets) => {
    const usedIndices = activeSelectedItems.map((item) => item.originalIndex);

    // Log & Clear
    addLog(`${skill.effectType === "DAMAGE" ? "⚔️" : "🛡️"} ใช้สกิล "${skill.name}"`, "success");
    setSelectedLetters(new Array(store.playerData.unlockedSlots).fill(null));
    setValidWordInfo(null);

    // ✅ ส่งคำสั่งไปที่ Store
    await store.castSkill(skill, word, targets, usedIndices);
    resetCasting();
  };

  const handleEnemyClick = async (id) => {
    if (!castingSkill || id === null) return;
    const newTargets = [...selectedTargets, id];
    if (newTargets.length >= castingSkill.maxTargets) {
      await executeSkill(castingSkill, currentWord, newTargets);
    } else {
      setSelectedTargets(newTargets);
    }
  };

  const handleSpin = () => {
    if (store.playerData.rp < 1) {
      addLog("RP ไม่พอ!", "info");
      return;
    }
    addLog("🎲 Reroll ตัวอักษรใหม่", "info");
    const nextInv = inventory.map((item, index) => 
      item === null ? null : DeckManager.createItem(index)
    );
    store.actionSpin(nextInv);
  };

  const handleEndTurn = () => {
    handleResetLetters();
    store.runEnemyTurn();
  };

  // --- RENDER ---
  if (appStatus === "LOADING") return <LoadingView progress={store.loadingProgress} />;
  if (appStatus === "ERROR") return <ErrorView error={errorMessage} onRetry={initGameData} />;

  return (
    <div style={styles.container}>
      <div style={styles.gameBoard}>

        <pre>{store.distance.toFixed(0)}</pre>

        {/* Top Battle Area */}
        <div style={styles.battleArea}>
          {/* Word Construction (Reorder) */}
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
                isTargeted={selectedTargets.includes(en.id)}
                onSelect={handleEnemyClick}
                onHover={(isHover) => setHoveredEnemyId(isHover ? en.id : null)}
                selectionCount={selectedTargets.filter(id => id === en.id).length}
              />
            ))}
          </AnimatePresence>

          {/* {store.projectiles.map((p) => <ProjectileEntity key={p.id} data={p} />)} */}
          
          {validWordInfo && <MeaningPopup meaning={validWordInfo.meaning} />}
          
          <Tooltip 
            hoveredEnemy={hoveredEnemy} 
            castingSkill={castingSkill} 
            damageInfo={getDamageInfo()} 
          />


          {/* Game Over / Clear Screens */}
          {store.gameState === "OVER" && (
            <div style={styles.fullOverlay}>
              <h1 style={{ color: "#ff4d4d" }}>GAME OVER</h1>
              <button onClick={() => { store.reset(); handleResetLetters(); }} style={styles.restartBtn}>RESTART</button>
            </div>
          )}
        </div>

 {/* Bottom UI Area */}
{/* Bottom UI Area */}
<div style={styles.bottomUi}>
  {store.gameState === "QUIZ_MODE" && store.currentQuiz ? (
    <QuizOverlay
      data={store.currentQuiz}
      onAnswer={(ans) => store.resolveQuiz(ans)}
      onTimeout={() => store.resolveQuiz("TIMEOUT")}
    />
  ) : showTargetPicker ? (
    /* --- ส่วนเลือกเป้าหมายใหม่ (Monster Cards) --- */
    <div style={styles.targetPickerMenu}>
      <div style={styles.targetHeader}>
        <h3 style={styles.targetTitle}>SELECT TARGET</h3>
        <div 
          style={styles.targetCardCancel} 
          onClick={() => { setShowTargetPicker(false); resetCasting(); }}
        >
          <span>CLOSE [X]</span>
        </div>
      </div>
      
      <div style={styles.targetList}>
        {store.enemies.filter(e => e.hp > 0).map((en) => {
          const hpPercent = (en.hp / en.max_hp) * 100;
          // ดึงรูปจาก Server ตาม Monster ID และ Frame ปัจจุบัน
          const monsterImg = `${ipAddress}/img_monster/${en.monster_id}-idle-${animFrame + 1}.png`;

          return (
            <div 
              key={en.id} 
              onClick={() => handleSelectTargetFromMenu(en.id)}
              style={styles.targetCard}
              onMouseEnter={() => setHoveredEnemyId(en.id)}
              onMouseLeave={() => setHoveredEnemyId(null)}
            >
              {/* รูปมอนสเตอร์จริงๆ จาก URL */}
              <div style={styles.targetIconFrame}>
                <img 
                  src={monsterImg} 
                  alt={en.name} 
                  style={styles.targetIcon}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=?'; }}
                />
              </div>

              {/* ข้อมูลมอนสเตอร์และหลอดเลือด */}
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
      <div style={{ flex: 1, maxWidth: "300px" }}>
        <BattleLog logs={logs} />
      </div>
      <InventorySlot
        inventory={inventory}
        onSelectLetter={handleSelectLetter}
        playerSlots={store.playerData.unlockedSlots}
      />
      <div style={{ flex: 1, maxWidth: "300px" }}>
        <SkillBar
          playerData={store.playerData}
          gameState={store.gameState}
          validWordInfo={validWordInfo}
          currentWordLength={activeSelectedItems.length}
          targetingMode={!!castingSkill}
          onSkillClick={handleSkillClick}
          onSpin={handleSpin}
          onEndTurn={handleEndTurn}
        />
      </div>
    </>
  )}
</div>
      </div>
    </div>
  );
}

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
    flex: 1, position: "relative", overflow: "hidden", borderBottom: "4px solid #000",
    background: "#000", width: "100%"
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
    flex: 1, // หรือความสูงที่กำหนด
    background: "#1a120b",
    borderTop: "4px solid #5c4033",
    display: "flex",
    padding: "15px",
    gap: "15px",
    height: "280px",
    position: "relative", // ✅ สำคัญมาก: เพื่อให้ลูกที่เป็น Absolute อยู่แค่ในนี้
    overflow: "hidden"    // ✅ ป้องกันส่วนเกินแลบออกมา
},
  targetOverlay: {
    position: "absolute", top: 20, width: "100%", textAlign: "center", zIndex: 999
  },
  targetToast: {
    background: "rgba(0,0,0,0.85)", color: "#ff9f43", padding: "8px 24px",
    borderRadius: 20, border: "2px solid #fff", fontWeight: "bold"
  },
  cancelContainer: {
    position: "absolute", bottom: 30, width: "100%", textAlign: "center", zIndex: 999
  },
  cancelBtn: {
    padding: "10px 30px", borderRadius: "30px", background: "#ff4757",
    color: "#fff", border: "3px solid #fff", fontWeight: "bold", cursor: "pointer"
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
    position: "absolute", // ให้ทับส่วนอื่นใน bottomUi ทั้งหมด
    inset: 0,            // เต็มพื้นที่
    display: "flex",
    flexDirection: "column",
    background: "rgba(26, 18, 11, 0.95)", // พื้นหลังเข้มเข้ากับโทนเดิม
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
    overflowY: "auto" // เผื่อกรณีมอนสเตอร์เยอะ
  },
  targetCard: {
    display: "flex",
    alignItems: "center",
    background: "#2f3542",
    border: "3px solid #f1f2f6",
    borderRadius: "10px",
    padding: "12px",
    width: "220px", // เพิ่มขนาดนิดหน่อยให้เห็นรูปชัดขึ้น
    cursor: "pointer",
    boxShadow: "0 4px 0 #000",
    transition: "transform 0.1s ease",
    "&:hover": { transform: "translateY(-2px)" }
  },
  targetIconFrame: {
    width: "60px",  // ใหญ่ขึ้น
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
    width: "110%", // ขยายเผื่อ crop นิดๆ ให้เห็นตัวชัด
    height: "110%", 
    objectFit: "contain",
    imageRendering: "pixelated" // ถ้าเป็น Pixel Art จะคมชัดมาก
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
};