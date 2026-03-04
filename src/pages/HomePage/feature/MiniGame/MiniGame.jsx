import React, { useState, useEffect, useCallback, useRef,memo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Modal,
  Backdrop,
  Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import TimerIcon from "@mui/icons-material/Timer";
import { useAnimation, AnimatePresence, motion } from "framer-motion";

// นำเข้า Components ที่เราแยกไว้
import { LOADING, LOADED } from "../../../../store/const";
import { THEMES } from "../../hook/const";
import { GameResult, GameOver } from "./GameResult";
import { WordSlots } from "./WordSlot";
import { LetterPool } from "./LetterPool";

import { useStaminaTimer } from "../../../../hook/useStaminaTimer";
import { useDictionaryStore } from "../../../../store/useDictionaryStore";
import { useAuthStore } from "../../../../store/useAuthStore";
import { useGameSfx } from "../../../../hook/useGameSfx";
import click from "../../../../assets/sound/click2.ogg";


let audioCtx = null;

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const InGameTimer = ({ stamina }) => {
  const { timeLeft, isFull, timerStatus } = useStaminaTimer(stamina);
  const currentStamina = stamina?.current || 0;
  const maxStamina = stamina?.max || 3;

  const controls = useAnimation();

  useEffect(() => {
    if (timerStatus === "reduced") {
      controls.start({
        scale: [1, 1.4, 1],
        transition: { duration: 0.5 },
      });
    }
  }, [timerStatus, controls]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgba(43, 29, 20, 0.8)",
        border: "2px solid #5A3A2E",
        boxShadow: "0 2px 0 #2b1a12",
        borderRadius: "12px",
        height: "28px",
        px: 1,
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
        {[...Array(maxStamina)].map((_, index) => {
          const isActive = index < currentStamina;
          return (
            <FlashOnIcon
              key={index}
              sx={{
                fontSize: 16,
                color: isActive ? "#ffd000" : "#3e2615",
                filter: isActive
                  ? isFull
                    ? "drop-shadow(0 0 4px #FFD700)"
                    : "drop-shadow(1px 1px 0px #B8860B)"
                  : "none",
                stroke: "#B8860B",
                strokeWidth: 1.5,
                paintOrder: "stroke fill",
                transition: "all 0.3s",
              }}
            />
          );
        })}
      </Box>

      {!isFull && (
        <Box sx={{ minWidth: "35px", textAlign: "center" }}>
          <Typography
            component={motion.span}
            animate={controls}
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: 8,
              opacity: 0.9,
              color: timerStatus === "reduced" ? "#69f0ae" : "#E8E9CD",
              letterSpacing: "-0.5px",
              transition: "color 0.3s ease",
              display: "inline-block",
            }}
          >
            {formatTime(timeLeft)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const MiniGame = ({ open, onClose }) => {
  const { sfxVolume, isSfxMuted, reduceStaminaTimer, currentUser } =
    useAuthStore();
  const {
    fetchMiniGameDictionary,
    clearMiniGameDictionary,
    wordsForMiniGame,
    loading: dictLoading,
  } = useDictionaryStore();

  const [gameWords, setGameWords] = useState([]);
  const [poolLetters, setPoolLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);

  const [status, setStatus] = useState("fetching");
  const [floatingTexts, setFloatingTexts] = useState([]);

  const [wordLength, setWordLength] = useState(2); 
  const [correctStreak, setCorrectStreak] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);

  const currentStaminaValue = currentUser?.stamina?.current || 0;
  const maxStaminaValue = currentUser?.stamina?.max || 3;
  const canPlayAgain = currentStaminaValue < maxStaminaValue;

  const controls = useAnimation();
  const playClickLetter = useGameSfx(click);

  const getLevelConfig = (length) => {
    switch (length) {
      case 2:
        return { reward: 2, target: 1 };
      case 3:
        return { reward: 5, target: 1 };
      case 4:
        return { reward: 8, target: 1 };
      case 5:
        return { reward: 12, target: 1 };
      case 6:
        return { reward: 15, target: 1 };
      case 7:
        return { reward: 18, target: 1 };
      default:
        return { reward: 20, target: 1 }; 
    }
  };

  const levelConfig = getLevelConfig(wordLength);

  const playSfx = useCallback(
    (type) => {
      if (isSfxMuted || sfxVolume <= 0) return;
      try {
        if (!audioCtx) {
          const AudioContextClass =
            window.AudioContext || window["webkitAudioContext"];
          audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === "suspended") audioCtx.resume();

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        const targetVol = (type === "success" ? 0.1 : 0.15) * sfxVolume;

        if (type === "success") {
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(523.25, now);
          oscillator.frequency.setValueAtTime(783.99, now + 0.1);
          oscillator.frequency.setValueAtTime(1046.5, now + 0.2);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(targetVol, now + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          oscillator.start(now);
          oscillator.stop(now + 0.4);
        } else if (type === "error") {
          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(150, now);
          oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.3);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(targetVol, now + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
        }
      } catch (error) {
        console.error("Web Audio API Error:", error);
      }
    },
    [sfxVolume, isSfxMuted],
  );

  const unlockAudio = useCallback(() => {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext || window["webkitAudioContext"];
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
  }, []);

  const fetchWordsByLength = useCallback(
    (targetLength) => {
      setStatus("fetching");
      clearMiniGameDictionary();

      const safeLetters = "ABCDEFGHIJKLMNOPRSTW";
      const randomLetter = safeLetters.charAt(
        Math.floor(Math.random() * safeLetters.length),
      );

      fetchMiniGameDictionary({
        startsWith: randomLetter,
        length: targetLength,
        limit: 50,
        append: false,
      });
    },
    [clearMiniGameDictionary, fetchMiniGameDictionary],
  );

  const startNewGame = useCallback(() => {
    setWordLength(2); 
    setCorrectStreak(0);
    setHintsRemaining(3);
    fetchWordsByLength(2);
  }, [fetchWordsByLength]);

  useEffect(() => {
    if (open) startNewGame();
  }, [open, startNewGame]);

  useEffect(() => {
    if (open && status === "fetching" && dictLoading === LOADED) {
      if (wordsForMiniGame && wordsForMiniGame.length > 0) {
        let matchedWords = wordsForMiniGame.filter(
          (item) =>
            item.is_oxford === true && (item.word || "").length === wordLength,
        );

        if (matchedWords.length === 0) {
          matchedWords = wordsForMiniGame.filter(
            (item) => (item.word || "").length === wordLength,
          );
        }

        const uniqueWordsMap = new Map();
        for (const item of matchedWords) {
          const w = (item.word || "").toUpperCase();
          if (!uniqueWordsMap.has(w)) uniqueWordsMap.set(w, item);
        }

        const shuffledWords = shuffleArray(Array.from(uniqueWordsMap.values()));
        const formattedWords = shuffledWords.map((item) => {
          const rawMeaning = item.meaning || "No meaning";
          const shortMeaning =
            rawMeaning.split(/[, ]+/).filter(Boolean)[0] || rawMeaning;
          return { word: item.word || "", meaning: shortMeaning };
        });

        if (formattedWords.length > 0) {
          setGameWords(formattedWords);
          setupRound(formattedWords[0]); 
        } else {
          fetchWordsByLength(wordLength);
        }
      } else {
        fetchWordsByLength(wordLength);
      }
    }
  }, [
    open,
    status,
    wordsForMiniGame,
    dictLoading,
    wordLength,
    fetchWordsByLength,
  ]);

  const setupRound = useCallback((targetData) => {
    if (!targetData || !targetData.word) return;

    const wordUpper = targetData.word.toUpperCase();
    const allChars = wordUpper.split("");

    const shuffled = shuffleArray(allChars).map((char, index) => ({
      id: `char-${index}-${char}`,
      char: char,
      isUsed: false,
      isHint: false,
    }));

    let initialSelected = Array(wordUpper.length).fill(null);

    if (wordUpper.length >= 4) {
      const char1 = wordUpper.charAt(0);
      const idx1 = shuffled.findIndex(
        (item) => item.char === char1 && !item.isUsed,
      );
      if (idx1 !== -1) {
        shuffled[idx1].isUsed = true;
        shuffled[idx1].isHint = true;
        initialSelected[0] = shuffled[idx1];
      }
    }

    setSelectedLetters(initialSelected);
    setPoolLetters(shuffled);
    setStatus("playing");
  }, []);

  const handleNextWord = useCallback(
    async (isCorrect) => {
      let earnedEnergy = false;

      if (isCorrect && reduceStaminaTimer) {
        const res = await reduceStaminaTimer(levelConfig.reward);
        if (res?.earnedStamina) earnedEnergy = true;

        // 💡 THE FIX: ย้ายมาเช็คตรงนี้เป็นอันดับแรกสุด! ถ้าได้สายฟ้า ให้ทิ้งทุกอย่างแล้วไปหน้า finished ทันที
        if (earnedEnergy) {
          setStatus("finished");
          return;
        }

        // ถ้ายังไม่ได้สายฟ้า ค่อยไปคำนวณเรื่องการเลื่อนระดับต่อไป
        const newStreak = correctStreak + 1;
        if (newStreak >= levelConfig.target) {
          const nextLevel = wordLength + 1;
          setWordLength(nextLevel); 
          setCorrectStreak(0);
          fetchWordsByLength(nextLevel); 
          return;
        } else {
          setCorrectStreak(newStreak);
        }
      }

      // โหลดคำถัดไป
      setGameWords((prev) => {
        const nextWords = [...prev].slice(1);
        if (nextWords.length > 0) {
          setupRound(nextWords[0]);
          return nextWords;
        } else {
          fetchWordsByLength(wordLength);
          return [];
        }
      });
    },
    [
      correctStreak,
      levelConfig,
      reduceStaminaTimer,
      wordLength,
      fetchWordsByLength,
      setupRound,
    ],
  );

  const handleSelectLetter = (item) => {
    unlockAudio();
    playClickLetter();
    if (status !== "playing" || item.isUsed) return;

    const firstEmptyIdx = selectedLetters.findIndex((s) => s === null);
    if (firstEmptyIdx === -1) return;

    setPoolLetters((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isUsed: true } : p)),
    );

    const newSelected = [...selectedLetters];
    newSelected[firstEmptyIdx] = item;
    setSelectedLetters(newSelected);

    const targetWord = gameWords[0].word.toUpperCase();

    if (!newSelected.includes(null)) {
      checkAnswer(newSelected, targetWord);
    }
  };

  const handleRemoveLetter = (itemToRemove) => {
    if (status !== "playing" || itemToRemove.isHint) return;
    setSelectedLetters((prev) =>
      prev.map((item) => (item?.id === itemToRemove.id ? null : item)),
    );
    setPoolLetters((prev) =>
      prev.map((p) => (p.id === itemToRemove.id ? { ...p, isUsed: false } : p)),
    );
  };

  const performRevealAnimation = async (currentSelectedState, currentPoolState, targetWord, isGameOverAfter) => {
    setStatus("revealing"); 
    
    let currentSelected = [...currentSelectedState];
    let currentPool = [...currentPoolState];
    
    currentSelected = currentSelected.map(item => item?.isHint ? item : null);
    currentPool = currentPool.map(p => p.isHint ? p : { ...p, isUsed: false });
    
    setSelectedLetters([...currentSelected]);
    setPoolLetters([...currentPool]);
    
    await delay(500); 

    const chars = targetWord.split("");
    
    for (let i = 0; i < chars.length; i++) {
        if (currentSelected[i] && currentSelected[i].char === chars[i] && currentSelected[i].isHint) {
            continue; 
        }
        
        const poolIdx = currentPool.findIndex(p => p.char === chars[i] && !p.isUsed);
        if (poolIdx !== -1) {
            currentPool[poolIdx] = { ...currentPool[poolIdx], isUsed: true, isHint: true };
            currentSelected[i] = currentPool[poolIdx];
            
            setSelectedLetters([...currentSelected]);
            setPoolLetters([...currentPool]);
            
            playClickLetter(); 
            await delay(150); 
        }
    }

    await delay(300);
    playSfx("success");
    setStatus("success");

    await delay(isGameOverAfter ? 2000 : 1200);

    if (isGameOverAfter) {
        setStatus("gameover");
    } else {
        setWordLength(2);
        setCorrectStreak(0);
        setHintsRemaining(3);
        fetchWordsByLength(2);
    }
  };

  const checkAnswer = async (selected, targetWord) => {
    const currentWord = selected.map((s) => s?.char || "").join("");

    if (currentWord === targetWord) {
      playSfx("success");
      setStatus("success");

      const newPopupId = Date.now();
      setFloatingTexts((prev) => [
        ...prev,
        { id: newPopupId, text: `⏳ -${levelConfig.reward} MINS!` },
      ]);
      setTimeout(
        () =>
          setFloatingTexts((prev) => prev.filter((t) => t.id !== newPopupId)),
        1500,
      );

      setTimeout(() => handleNextWord(true), 1200);
    } else {
      playSfx("error");
      setStatus("error");
      
      await controls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      });

      performRevealAnimation(selectedLetters, poolLetters, targetWord, true);
    }
  };

  const handleHint = () => {
    if (status !== "playing" || hintsRemaining <= 0) return;
    const targetWord = gameWords[0].word.toUpperCase();

    const firstEmptyIdx = selectedLetters.findIndex((s) => s === null);

    if (firstEmptyIdx !== -1) {
      const nextTargetChar = targetWord[firstEmptyIdx];
      const hintItem = poolLetters.find(
        (p) => p.char === nextTargetChar && !p.isUsed,
      );

      if (hintItem) {
        setHintsRemaining((prev) => prev - 1);
        const itemToInsert = { ...hintItem, isHint: true };
        setPoolLetters((prev) =>
          prev.map((p) =>
            p.id === hintItem.id ? { ...p, isUsed: true, isHint: true } : p,
          ),
        );

        const newSelected = [...selectedLetters];
        newSelected[firstEmptyIdx] = itemToInsert;
        setSelectedLetters(newSelected);

        if (!newSelected.includes(null)) {
          checkAnswer(newSelected, targetWord);
        }
      }
    }
  };

  const handleReveal = () => {
    if (status !== "playing") return;

    playSfx("error");
    setStatus("error"); 
    const targetWord = gameWords[0].word.toUpperCase();
    
    performRevealAnimation(selectedLetters, poolLetters, targetWord, false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      keepMounted
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            width: { xs: "95%", sm: "500px" },
            minHeight: "450px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#1a100c",
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px), radial-gradient(circle at center, #352115 0%, #100a06 100%)`,
            backgroundSize: "20px 20px, 20px 20px, 100% 100%",
            border: `4px solid ${status === "success" ? "#69f0ae" : "#5A3A2E"}`,
            borderRadius: "16px",
            boxShadow:
              status === "success"
                ? `0 0 30px rgba(105, 240, 174, 0.4), inset 0 0 30px rgba(105, 240, 174, 0.2)`
                : `0 10px 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.8)`,
            p: { xs: 2, sm: 3 },
            outline: "none",
            position: "relative",
            transition: "all 0.3s ease",
          }}
        >
          <AnimatePresence>
            {floatingTexts.map((popup) => (
              <motion.div
                key={popup.id}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -60, scale: 1.2 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: "40%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 100,
                  pointerEvents: "none",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: { xs: 20, sm: 26 },
                    color: "#69f0ae",
                    textShadow:
                      "3px 3px 0 #000, 0 0 10px rgba(105,240,174,0.8)",
                  }}
                >
                  {popup.text}
                </Typography>
              </motion.div>
            ))}
          </AnimatePresence>

          {status === "fetching" || gameWords.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <FlashOnIcon
                sx={{
                  fontSize: 40,
                  color: "#aaa",
                  mb: 2,
                  animation: "pulse 1.5s infinite",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 10,
                  color: THEMES.accent,
                }}
              >
                MINING RUNES...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent:
                  status === "finished" ? "start" : "space-between",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                  position: "relative",
                }}
              >
                <InGameTimer stamina={currentUser?.stamina} />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Press Start 2P'",
                      color: THEMES.accent,
                      fontSize: { xs: 12, sm: 14 },
                      textShadow: "1px 1px 0px #000",
                    }}
                  >
                    LEVEL {wordLength - 1}
                  </Typography>

                  <Box
                    component={motion.div}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "rgba(105, 240, 174, 0.1)",
                      border: "1px solid rgba(105, 240, 174, 0.5)",
                      borderRadius: "12px",
                      px: 1,
                      py: 0.5,
                      boxShadow: "0 0 8px rgba(105, 240, 174, 0.2)",
                    }}
                  >
                    <TimerIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: "#69f0ae", 
                        mr: 0.5, 
                        filter: "drop-shadow(0 0 2px #69f0ae)" 
                      }} 
                    />
                    <Typography
                      sx={{
                        fontFamily: "'Press Start 2P'",
                        color: "#69f0ae",
                        fontSize: 8,
                        textShadow: "0 0 4px rgba(105,240,174,0.5)",
                      }}
                    >
                      -{levelConfig.reward} MIN
                    </Typography>
                  </Box>
                </Box>

                <IconButton
                  onClick={onClose}
                  sx={{
                    color: "#888",
                    p: 0,
                    "&:hover": {
                      color: "#ff4c4c",
                      transform: "scale(1.1) rotate(90deg)",
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {status === "finished" ? (
                <GameResult
                  onExit={onClose}
                  onPlayAgain={startNewGame}
                  canPlayAgain={canPlayAgain}
                />
              ) : status === "gameover" ? (
                <GameOver onClose={onClose} startNewGame={startNewGame} />
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    mt: 3,
                    gap: 3,
                  }}
                >
                  {/* กล่องโชว์คำแปล */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: "rgba(10, 5, 2, 0.6)",
                        border: "2px solid #5c4033",
                        borderRadius: "8px",
                        padding: "12px 20px",
                        display: "inline-block",
                        boxShadow:
                          "0 4px 6px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.8)",
                      }}
                    >
                      <Typography
                        sx={{
                          textAlign: "center",
                          color: "#ffecb3",
                          fontSize: { xs: 18, sm: 22 },
                          fontWeight: "bold",
                          letterSpacing: "1px",
                          textShadow: "2px 2px 0px #000",
                        }}
                      >
                        {gameWords[0]?.meaning}
                      </Typography>
                    </Box>
                  </Box>

                  <WordSlots
                    targetLength={gameWords[0]?.word.length || 0}
                    selectedLetters={selectedLetters}
                    status={status}
                    onRemoveLetter={handleRemoveLetter}
                    controls={controls}
                  />

                  <LetterPool
                    poolLetters={poolLetters}
                    onSelectLetter={handleSelectLetter}
                    onHint={handleHint}
                    onReveal={handleReveal}
                    hintsRemaining={hintsRemaining}
                    status={status}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

export default React.memo(MiniGame);