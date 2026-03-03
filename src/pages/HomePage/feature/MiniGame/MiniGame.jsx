import React, { useState, useEffect, useCallback } from "react";
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
import FavoriteIcon from "@mui/icons-material/Favorite";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
import { useAnimation } from "framer-motion";
import { motion } from "framer-motion";

// นำเข้า Components ที่เราแยกไว้
import { LOADING, LOADED } from "../../../../store/const";
import { THEMES } from "../../hook/const";
import { GameResult, GameOver } from "./GameResult";
import { WordSlots } from "./WordSlot";
import { LetterPool } from "./LetterPool";

import { useDictionaryStore } from "../../../../store/useDictionaryStore";
import { useAuthStore } from "../../../../store/useAuthStore";

export const getRandomLetters = (count) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < count; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
};

export const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const MiniGame = ({ open, onClose, currentStamina, maxStamina }) => {
  const { updateStamina } = useAuthStore();
  const {
    fetchMiniGameDictionary,
    clearMiniGameDictionary,
    wordsForMiniGame,
    loading: dictLoading,
  } = useDictionaryStore();

  const [gameWords, setGameWords] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [poolLetters, setPoolLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [hintsRemaining, setHintsRemaining] = useState(2);
  const [lives, setLives] = useState(5);

  const [status, setStatus] = useState("fetching");
  const controls = useAnimation();
  const canPlayAgain = currentStamina + 1 < maxStamina;

  // 💡 THE FIX: สร้างฟังก์ชันสำหรับเริ่มเกมใหม่โดยเฉพาะ
  const startNewGame = useCallback(() => {
    setStatus("fetching");
    setCurrentRound(0);
    setHintsRemaining(2);
    setLives(5);
    setGameWords([]);

    const safeLetters = "ABCDEFGHIJKLMNOPRSTW";
    const randomLetter = safeLetters.charAt(
      Math.floor(Math.random() * safeLetters.length),
    );

    clearMiniGameDictionary();
    fetchMiniGameDictionary({
      startsWith: randomLetter,
      limit: 10000,
      append: false,
    });
  }, [clearMiniGameDictionary, fetchMiniGameDictionary]);

  // เรียกใช้ startNewGame เมื่อเปิด Modal ขึ้นมา
  useEffect(() => {
    if (open) {
      startNewGame();
    }
  }, [open, startNewGame]);

  useEffect(() => {
    if (open && status === "fetching" && dictLoading === LOADED) {
      if (wordsForMiniGame && wordsForMiniGame.length > 0) {
        let wordPoolToUse = wordsForMiniGame.filter((item) => {
          const wordText = item.word || "";
          return (
            item.is_oxford === true &&
            wordText.length >= 3 &&
            wordText.length <= 8
          );
        });

        if (wordPoolToUse.length < 3) {
          wordPoolToUse = wordsForMiniGame.filter((item) => {
            const wordText = item.word || "";
            return wordText.length >= 3 && wordText.length <= 5;
          });
        }

        if (wordPoolToUse.length < 3) {
          wordPoolToUse = wordsForMiniGame.filter(
            (item) => item.word && item.word.length > 0,
          );
        }

        const uniqueWordsMap = new Map();
        for (const item of wordPoolToUse) {
          const w = (item.word || "").toUpperCase();
          if (!uniqueWordsMap.has(w) && w.length > 0) {
            uniqueWordsMap.set(w, item);
          }
        }
        const uniqueWordList = Array.from(uniqueWordsMap.values());

        const shuffledWords = shuffleArray([...uniqueWordList]).slice(0, 3);

        const formattedWords = shuffledWords.map((item) => {
          const rawMeaning = item.meaning || "No meaning";
          const shortMeaning =
            rawMeaning.split(/[, ]+/).filter(Boolean)[0] || rawMeaning;

          return {
            word: item.word || "",
            meaning: shortMeaning,
          };
        });

        if (formattedWords.length > 0 && formattedWords[0].word !== "") {
          setGameWords(formattedWords);
          setupRound(formattedWords[0]);
        }
      } else {
        // ถ้าหาคำไม่เจอ ให้สุ่มใหม่เลย
        startNewGame();
      }
    }
  }, [open, status, wordsForMiniGame, dictLoading, startNewGame]);

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

    const char1 = wordUpper.charAt(0);
    const idx1 = shuffled.findIndex(
      (item) => item.char === char1 && !item.isUsed,
    );
    if (idx1 !== -1) {
      shuffled[idx1].isUsed = true;
      shuffled[idx1].isHint = true;
      initialSelected[0] = shuffled[idx1];
    }

    if (wordUpper.length >= 4) {
      const char2 = wordUpper.charAt(1);
      const idx2 = shuffled.findIndex(
        (item) => item.char === char2 && !item.isUsed,
      );
      if (idx2 !== -1) {
        shuffled[idx2].isUsed = true;
        shuffled[idx2].isHint = true;
        initialSelected[1] = shuffled[idx2];
      }
    }

    setSelectedLetters(initialSelected);
    setPoolLetters(shuffled);

    setHintsRemaining(2);
    setLives(5);
    setStatus("playing");
  }, []);

  const handleSelectLetter = (item) => {
    if (status !== "playing" || item.isUsed) return;

    const firstEmptyIdx = selectedLetters.findIndex((s) => s === null);
    if (firstEmptyIdx === -1) return;

    setPoolLetters((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isUsed: true } : p)),
    );

    const newSelected = [...selectedLetters];
    newSelected[firstEmptyIdx] = item;
    setSelectedLetters(newSelected);

    const targetWord = gameWords[currentRound].word.toUpperCase();

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

  const checkAnswer = async (selected, targetWord) => {
    const currentWord = selected.map((s) => s?.char || "").join("");

    if (currentWord === targetWord) {
      setStatus("success");
      setTimeout(() => {
        if (currentRound + 1 < 3) {
          setCurrentRound((prev) => prev + 1);
          setupRound(gameWords[currentRound + 1]);
        } else {
          setStatus("finished");
        }
      }, 1500);
    } else {
      const newLives = lives - 1;
      setLives(newLives);

      setStatus("error");
      await controls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      });

      setTimeout(() => {
        if (newLives <= 0) {
          setStatus("gameover");
        } else {
          const resetSelected = selectedLetters.map((item) =>
            item && item.isHint ? item : null,
          );

          const resetPool = poolLetters.map((p) => {
            const isStillSelected = resetSelected.some(
              (s) => s && s.id === p.id,
            );
            return { ...p, isUsed: isStillSelected };
          });

          setSelectedLetters(resetSelected);
          setPoolLetters(resetPool);
          setStatus("playing");
        }
      }, 800);
    }
  };

  const handleHint = () => {
    if (status !== "playing" || hintsRemaining <= 0) return;
    const targetWord = gameWords[currentRound].word.toUpperCase();

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

  // 💡 THE FIX: แยกฟังก์ชันเคลมรางวัลเป็น "เคลมแล้วออก" กับ "เคลมแล้วเล่นต่อ"
  const handleClaimAndExit = async () => {
    await updateStamina(1);
    onClose();
  };

  const handleClaimAndPlayAgain = async () => {
    await updateStamina(1);
    startNewGame(); // รีสตาร์ทเกมใหม่ทันทีหลังรับของ!
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
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
            width: { xs: "95%", sm: "450px" },
            minHeight: "450px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#1a100c",
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              radial-gradient(circle at center, #352115 0%, #100a06 100%)
            `,
            backgroundSize: "20px 20px, 20px 20px, 100% 100%",
            border: `4px solid #5A3A2E`,
            borderRadius: "16px",
            boxShadow: `0 10px 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.8)`,
            p: 3,
            outline: "none",
            position: "relative",
          }}
        >
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  position: "relative",
                  height: "32px",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Press Start 2P'",
                    color: THEMES.accent,
                    fontSize: { xs: 10, sm: 12 },
                    textShadow: "1px 1px 0px #000",
                  }}
                >
                  ROUND {currentRound + 1}/3
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  {[...Array(5)].map((_, i) => (
                    <FavoriteIcon
                      key={i}
                      sx={{
                        color: i < lives ? THEMES.error : "#3e2723",
                        fontSize: { xs: 14, sm: 18 },
                        filter:
                          i < lives
                            ? "drop-shadow(0 0 3px rgba(244, 67, 54, 0.6))"
                            : "none",
                        transition: "all 0.3s",
                      }}
                    />
                  ))}
                </Box>

                <IconButton
                  onClick={onClose}
                  sx={{
                    color: "#888",
                    p: 0,
                    transition: "all 0.2s",
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
                // 💡 THE FIX: ส่ง Props ให้ GameResult ตามที่เพิ่มไว้ใหม่
                <GameResult
                  onExit={handleClaimAndExit}
                  onPlayAgain={handleClaimAndPlayAgain}
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
                  <Box
                    sx={{
                      backgroundColor: "rgba(10, 5, 2, 0.6)",
                      border: "2px solid #5c4033",
                      borderRadius: "8px",
                      padding: "12px 20px",
                      display: "inline-block",
                      margin: "0 auto",
                      boxShadow:
                        "0 4px 6px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.8)",
                    }}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: "#ffecb3",
                        fontSize: { xs: 20, sm: 24 },
                        fontWeight: "bold",
                        letterSpacing: "1px",
                        textShadow: "2px 2px 0px #000",
                      }}
                    >
                      {gameWords[currentRound]?.meaning}
                    </Typography>
                  </Box>

                  <WordSlots
                    targetLength={gameWords[currentRound]?.word.length || 0}
                    selectedLetters={selectedLetters}
                    status={status}
                    onRemoveLetter={handleRemoveLetter}
                    controls={controls}
                  />

                  <LetterPool
                    poolLetters={poolLetters}
                    onSelectLetter={handleSelectLetter}
                    onHint={handleHint}
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

export default MiniGame;
