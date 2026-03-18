import { Box, Typography, Divider, Button } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDictionaryStore } from "../../../../../store/useDictionaryStore";
import { SearchDictionary } from "./SearchDictionary";
import { useData } from "../../../hook/useData";
import { SelectComponent } from "../../../components/SelectComponent";
import { motion } from "framer-motion";
import StarBackground from "../../../components/StarBackground";
import { THEMES } from "../../../hook/const";

import { shortType, Lenght, Type, Level } from "../../../hook/const";
//sound
import { useGameSfx } from "../../../../../hook/useGameSfx";
import clickSFX from "../../../../../assets/sound/click1.ogg";
import clickMouse from "../../../../../assets/sound/mouserelease1.ogg";

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MotionBox = motion(Box);

const WordList = ({
  dictionary,
  hasNext,
  loading,
  onLoadMore,
  onSelect,
  selectedWord,
  playMouseClick,
}) => {
  const handleScroll = (e) => {
    const el = e.currentTarget;
    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;

    if (isBottom && hasNext && !loading) {
      onLoadMore();
    }
  };

  return (
    <Box
      onScroll={handleScroll}
      sx={{
        width: { xs: "60%", sm: "50%", md: "50%" },
        height: "100%", // 💡 ปล่อยให้สูง 100% ของกล่องแม่
        border: "3px solid #2b1d14",
        boxShadow: "inset 0 0 0 2px #e7dcc8, 4px 4px 0 #2b1d14",
        background: `
  repeating-linear-gradient(
    180deg,
    #fffaf0,
    #fffaf0 28px,
    #f3e9d8 28px,
    #f3e9d8 56px
  )
`,
        overflowY: "auto",
        backgroundAttachment: "local",
        // 💡 ย่อขนาดช่องลายทางพื้นหลัง ให้พอดีกับคำศัพท์ที่เล็กลง
        "@media (orientation: landscape) and (max-height: 450px)": {
          border: "2px solid #2b1d14",
          boxShadow: "inset 0 0 0 1px #e7dcc8, 2px 2px 0 #2b1d14",
          background: `
            repeating-linear-gradient(
              180deg,
              #fffaf0,
              #fffaf0 20px,
              #f3e9d8 20px,
              #f3e9d8 40px
            )
          `,
        },
      }}
    >
      {dictionary?.length === 0 && (
        <Typography
          sx={{
            fontSize: 12,
            color: "#aaa",
            textAlign: "center",
            mt: 2,
            fontFamily: `"Press Start 2P"`,
            height: "100%",
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {" "}
          No words{" "}
        </Typography>
      )}
      {dictionary?.map((w, i) => {
        const isActive = selectedWord?.word === w.word;
        return (
          <Box
            key={w.word}
            onClick={() => {
              playMouseClick();
              onSelect(w);
            }}
            sx={{
              p: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              fontFamily: `"Press Start 2P"`,
              fontSize: 12,
              backgroundColor: isActive ? "#d6b46a" : "transparent",
              borderLeft: isActive
                ? "6px solid #7a1f1f"
                : "6px solid transparent",
              transition: "all 0.15s",
              "&:hover": {
                backgroundColor: "#e7dcc8",
                paddingLeft: "12px",
              },
              // 💡 บีบความสูงและย่อฟอนต์ใน List ให้ถี่ขึ้น โชว์ได้เยอะขึ้น
              "@media (orientation: landscape) and (max-height: 450px)": {
                p: 0.5,
                fontSize: 9,
                borderLeft: isActive
                  ? "4px solid #7a1f1f"
                  : "4px solid transparent",
                "&:hover": {
                  backgroundColor: "#e7dcc8",
                  paddingLeft: "8px",
                },
              },
            }}
          >
            <Box sx={{ opacity: 0.7 }}>{i + 1}.</Box>
            <Box>{w.word}</Box>
          </Box>
        );
      })}
      {hasNext && !loading && (
        <Box
          sx={{
            textAlign: "center",
            fontSize: 12,
            fontFamily: `"Press Start 2P"`,
            color: "#7b4a3b",
            py: 3,
            opacity: 0.6,
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 8,
              py: 1.5,
            },
          }}
        >
          ── scroll for more ──
        </Box>
      )}
      {loading && (
        <Box
          sx={{
            py: 2,
            textAlign: "center",
            fontFamily: `"Press Start 2P"`,
            fontSize: 9,
            color: "#7b4a3b",
            animation: "blink 1s infinite",
            "@keyframes blink": {
              "0%": { opacity: 0.2 },
              "50%": { opacity: 1 },
              "100%": { opacity: 0.2 },
            },
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 6,
              py: 1,
            },
          }}
        >
          LOADING MORE WORDS...
        </Box>
      )}
    </Box>
  );
};

// WordDetail รับค่าคำศัพท์และวนลูปแสดงรายละเอียดตาม Type ที่มี
const WordDetail = ({ dictionary }) => {
  if (!dictionary) {
    return (
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#fdf8ef",
          border: "3px solid #2b1d14",
          boxShadow: "4px 4px 0 #2b1d14",
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: `"Press Start 2P"`,
          fontSize: 10,
          color: "#504f4fff",
          height: "100%", // 💡 เพิ่มให้กินพื้นที่ 100%
          "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 7,
            border: "2px solid #2b1d14",
            boxShadow: "2px 2px 0 #2b1d14",
          },
        }}
      >
        Choose a word from the list
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: "#fdf8ef",
        border: "3px solid #2b1d14",
        boxShadow: "4px 4px 0 #2b1d14",
        px: 3,
        py: 2,
        overflowY: "auto",
        height: "100%", // 💡 เพิ่มให้กินพื้นที่ 100% เพื่อให้ Scroll ภายในทำงาน
        // 💡 ลด Padding กรอบนอกสุดของ Detail
        "@media (orientation: landscape) and (max-height: 450px)": {
          px: 1.5,
          py: 1,
          border: "2px solid #2b1d14",
          boxShadow: "2px 2px 0 #2b1d14",
        },
      }}
    >
      {/* 1. MASTER WORD TITLE (แสดงแค่ครั้งเดียว) */}
      <Box
        sx={{
          mb: 2,
          "@media (orientation: landscape) and (max-height: 450px)": {
            mb: 0.5,
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: `"Press Start 2P"`,
            fontSize: 24,
            color: "#2b1d14",
            textShadow: "2px 2px 0px #d6b46a",
            // 💡 ย่อขนาดชื่อคำศัพท์
            "@media (orientation: landscape) and (max-height: 450px)": {
              fontSize: 14,
              textShadow: "1px 1px 0px #d6b46a",
            },
          }}
        >
          {dictionary.word}
        </Typography>
      </Box>

      {/* เส้นคั่นหลัก ใต้ชื่อคำศัพท์ */}
      <Divider
        sx={{
          borderColor: "#2b1d14",
          borderWidth: 1.5,
          mb: 2,
          // 💡 ย่อระยะห่างของเส้นแบ่ง
          "@media (orientation: landscape) and (max-height: 450px)": {
            mb: 0.5,
            borderWidth: 1,
          },
        }}
      />

      {/* 2. LOOP ENTRIES (แสดง Type + Meaning ย่อยๆ) */}
      {dictionary.entries.map((entry, index) => (
        <Box
          key={index}
          sx={{
            mb: index !== dictionary.entries.length - 1 ? 3 : 0,
            // 💡 ลดช่องว่างระหว่างแต่ละความหมาย (Meaning)
            "@media (orientation: landscape) and (max-height: 450px)": {
              mb: index !== dictionary.entries.length - 1 ? 1 : 0,
            },
          }}
        >
          {/* แถวแสดง Type และ Level */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1.5,
              // 💡 ลดช่องว่างใต้ Type/Level
              "@media (orientation: landscape) and (max-height: 450px)": {
                gap: 0.5,
                mb: 0.5,
              },
            }}
          >
            {entry.type && (
              <Box
                sx={{
                  px: 1,
                  py: 0.4,
                  fontSize: 10,
                  backgroundColor: "#d6b46a",
                  border: "2px solid #2b1d14",
                  fontFamily: `"Press Start 2P"`,
                  color: "#1b1b1b",
                  // 💡 ย่อปุ่ม Type
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    px: 0.5,
                    py: 0.2,
                    fontSize: 6,
                    border: "1px solid #2b1d14",
                  },
                }}
              >
                {shortType(entry.type)}
              </Box>
            )}

            {entry.level && (
              <Box
                sx={{
                  display: "inline-block",
                  px: 1,
                  py: 0.4,
                  fontSize: 9,
                  backgroundColor: "#e7dcc8",
                  border: "2px solid #2b1d14",
                  fontFamily: `"Press Start 2P"`,
                  color: "#1b1b1b",
                  // 💡 ย่อปุ่ม Level
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    px: 0.5,
                    py: 0.2,
                    fontSize: 6,
                    border: "1px solid #2b1d14",
                  },
                }}
              >
                Level {entry.level}
              </Box>
            )}
          </Box>

          {/* ===== MEANING ===== */}
          <Box
            sx={{
              backgroundColor: "#fffaf0",
              border: "2px solid #d6b46a",
              boxShadow: "inset 2px 2px 0 #fff",
              p: 2,
              position: "relative",
              // 💡 ย่อกล่องคำแปล
              "@media (orientation: landscape) and (max-height: 450px)": {
                p: 1,
                border: "1px solid #d6b46a",
                boxShadow: "inset 1px 1px 0 #fff",
              },
            }}
          >
            {/* label */}
            <Typography
              sx={{
                position: "absolute",
                top: -10,
                left: 12,
                backgroundColor: "#fdf8ef",
                px: 1,
                fontSize: 9,
                fontFamily: `"Press Start 2P"`,
                color: "#7b4a3b",
                // 💡 ย่อ Label ของคำแปล
                "@media (orientation: landscape) and (max-height: 450px)": {
                  top: -6,
                  left: 6,
                  px: 0.5,
                  fontSize: 6,
                },
              }}
            >
              Meaning
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1b1b1b",
                lineHeight: 1.8,
                mt: 1,
                // 💡 ย่อ Text คำแปลให้ชิดกัน โชว์ข้อมูลเยอะขึ้น
                "@media (orientation: landscape) and (max-height: 450px)": {
                  fontSize: 9,
                  lineHeight: 1.4,
                  mt: 0.2,
                },
              }}
            >
              {entry.meaning}
            </Typography>
          </Box>

          {/* ถ้ามีคำศัพท์ประเภทถัดไป ให้คั่นด้วยเส้นประ */}
          {index !== dictionary.entries.length - 1 && (
            <Divider
              sx={{
                borderStyle: "dashed",
                borderColor: "#d6b46a",
                mt: 2,
                // 💡 ย่อเส้นประ
                "@media (orientation: landscape) and (max-height: 450px)": {
                  mt: 1,
                },
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

const DictionaryLibrary = () => {
  const navigate = useNavigate();
  const clearDictionary = useDictionaryStore((state) => state.clearDictionary);
  const fetchDictionary = useDictionaryStore((state) => state.fetchDictionary);

  const { dictionary, DictionaryState, hasNext, lastWord } = useData();

  const [selectedLetter, setSelectedLetter] = useState("A");
  const [selectedWord, setSelectedWord] = useState(null);

  const [searchInput, setSearchInput] = useState(""); // สิ่งที่พิมพ์
  const [searchText, setSearchText] = useState(""); // สิ่งที่ใช้ค้นจริง

  const [selectLevel, setSelectLevel] = useState("");
  const [selectType, setSelectType] = useState("");
  const [selectLength, setSelectLength] = useState("");

  const playClickSFX = useGameSfx(clickSFX);
  const playMouseClick = useGameSfx(clickMouse);

  const handleSearchChange = () => {
    if (searchInput === searchText) return;
    setSearchText(searchInput);
  };

  // load when select alphabet and search
  useEffect(() => {
    clearDictionary();
    fetchDictionary({
      startsWith: selectedLetter,
      contains: searchText || undefined,
      level: selectLevel || undefined,
      length: selectLength || undefined,
      limit: 50,
      append: false,
    });
  }, [
    selectedLetter,
    searchText,
    clearDictionary,
    fetchDictionary,
    selectLevel,
    selectLength,
  ]);

  // load when clear search input
  useEffect(() => {
    if (searchInput.trim() === "") {
      setSearchText("");
    }
  }, [searchInput]);

  // 💡 THE FIX 1: เอา selectType ออกจากวงเล็บนี้!
  // เพื่อให้เวลาเปลี่ยน Filter Type คำศัพท์ที่กำลังเปิดดูอยู่ไม่หายไป
  useEffect(() => {
    setSelectedWord(null);
  }, [selectLength, selectLevel]);

  // load more
  const loadMore = () => {
    if (!hasNext || DictionaryState === "LOADING") return;

    fetchDictionary({
      startsWith: selectedLetter,
      level: selectLevel,
      length: selectLength,
      limit: 50,
      lastWord,
      append: true,
    });
  };

  // filter type
  const filteredDictionary = useMemo(() => {
    return dictionary.filter((item) => {
      if (selectType && item.type !== selectType) return false;
      return true;
    });
  }, [dictionary, selectType]);

  // นำข้อมูลที่ถูกฟิลเตอร์แล้ว มาจัดกลุ่ม (Group) ด้วยตัวคำศัพท์ (word)
  const groupedDictionary = useMemo(() => {
    const map = new Map();
    filteredDictionary.forEach((item) => {
      if (!map.has(item.word)) {
        map.set(item.word, { word: item.word, entries: [] });
      }
      map.get(item.word).entries.push(item);
    });
    return Array.from(map.values());
  }, [filteredDictionary]);

  // 💡 THE FIX 2: ดึงข้อมูลคำศัพท์ที่อัปเดตล่าสุด (หลังโดน Filter) ออกมาเสมอ
  const currentActiveWord = useMemo(() => {
    if (!selectedWord) return null;
    return groupedDictionary.find((w) => w.word === selectedWord.word) || null;
  }, [selectedWord, groupedDictionary]);

  return (
    <Box sx={{ height: "100vh" }}>
      <MotionBox
        initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        sx={{
          position: "fixed",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",

          background: `linear-gradient(${THEMES.bgMain}, #1a120b)`,
          border: `8px solid ${THEMES.border}`,
          borderRadius: "12px",
          boxShadow: `
            0 0 0 4px #1a120b,
            0 20px 60px rgba(49, 49, 49, 0.8)
          `,
          width: { xs: "90%", sm: "80%", md: "80%" },
          height: { xs: "70%", sm: "70%", md: "570px", xl: "80%" },
          p: 1,
          display: "flex",
          flexDirection: "column",

          "@media (orientation: landscape) and (max-height: 450px)": {
            top: "55%",
            transform: "translate(-50%, -50%)",
            height: "80%",
            border: `4px solid ${THEMES.border}`,
            borderRadius: "6px",
          },
        }}
      >
        {/* Title */}
        <Box
          sx={{
            py: 2,
            textAlign: "center",
            background: "#1a120b",
            mx: -1,
            mt: -1,
            mb: 2,
            borderBottom: `4px solid ${THEMES.border}`,
             "@media (orientation: landscape) and (max-height: 450px)": {
              py: 1, // ลดให้บางที่สุด
              mb: 0.5,
              borderBottom: `2px solid ${THEMES.border}`,
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEMES.accent,
              fontSize: { xs: 16, md: 24 },
              textShadow: `3px 3px 0 #000, 0 0 10px ${THEMES.accent}`,
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 10, // ย่อฟอนต์
                textShadow: `2px 2px 0 #000, 0 0 6px ${THEMES.accent}`,
              },
            }}
          >
            Dictionary Library
          </Typography>
        </Box>{" "}
        {/* 💡 แก้ไขจุดนี้: เปลี่ยนจาก height: '100%' เป็น flex: 1 และ overflow: 'hidden' */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* Alphabet Selector */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(13, 1fr)",
              gap: 0.5,
              mb: 1,
            }}
          >
            {ALPHABETS.map((l) => (
              <Box
                key={l}
                onClick={() => {
                  playClickSFX();
                  setSelectedLetter(l);
                  setSearchText("");
                  setSearchInput("");
                  setSelectedWord(null);
                  setSelectLength("");
                  setSelectLevel("");
                  setSelectType("");
                }}
                sx={{
                  cursor: "pointer",
                  textAlign: "center",
                  fontFamily: `"Press Start 2P"`,
                  fontSize: 10,
                  py: 0.6,
                  backgroundColor: selectedLetter === l ? "#d6b46a" : "#e7dcc8",
                  color: selectedLetter === l ? "#1b1b1b" : "#2b1d14",
                  border: "2px solid #2b1d14",
                  boxShadow:
                    selectedLetter === l
                      ? "inset 2px 2px 0 #fff"
                      : "2px 2px 0 #2b1d14",
                  "&:hover": {
                    backgroundColor: "#fff",
                  },
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    fontSize: 7,
                    border: "1px solid #2b1d14",
                  boxShadow:
                    selectedLetter === l
                      ? "inset 1px 1px 0 #fff"
                      : "1px 1px 0 #2b1d14",
                  },
                }}
              >
                {l}
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor: "#d6b46a", mb: 1 }} />

          {/* content */}
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1, // 💡 เพิ่ม margin bottom ให้มีระยะห่างกับรายการด้านล่าง
              "@media (orientation: landscape) and (max-height: 450px)": {
                mb: 0,
              },
            }}
          >
            <Box
              sx={{
                width: { xs: "62%", sm: "51%", md: "51%" },
                "@media (orientation: landscape) and (max-height: 450px)": {
                  width: "100%",
                },
              }}
            >
              <SearchDictionary
                value={searchInput}
                setSearchInput={setSearchInput}
                setSearchText={setSearchText}
                handleSearchChange={handleSearchChange}
                letter={selectedLetter}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                "@media (orientation: landscape) and (max-height: 450px)": {
                  gap: 0.6,
                },
              }}
            >
              <SelectComponent
                label="Type"
                value={selectType}
                onChange={setSelectType}
                options={Type}
              />
              <SelectComponent
                label="Level"
                value={selectLevel}
                onChange={setSelectLevel}
                options={Level}
              />
              <SelectComponent
                label="Lenght"
                value={selectLength}
                onChange={setSelectLength}
                options={Lenght}
              />
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1, // 💡 ทำให้ส่วนรายการดึงพื้นที่ที่เหลือทั้งหมด
              display: "flex",
              gap: 1,
              overflow: "hidden", // 💡 ป้องกันไม่ให้ทะลุกรอบ
            }}
          >
            {/* 💡 ส่งค่า currentActiveWord ไปทำงานแทน selectedWord เสมอ */}
            <WordList
              dictionary={groupedDictionary}
              hasNext={hasNext}
              loading={DictionaryState === "LOADING"}
              onLoadMore={loadMore}
              onSelect={setSelectedWord}
              selectedWord={currentActiveWord}
              playMouseClick={playMouseClick}
            />

            <WordDetail dictionary={currentActiveWord} />
          </Box>
        </Box>
      </MotionBox>
    </Box>
  );
};
export default DictionaryLibrary;
