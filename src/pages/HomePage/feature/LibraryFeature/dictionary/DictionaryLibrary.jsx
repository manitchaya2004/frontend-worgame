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

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MotionBox = motion(Box);
const shortType = (type) => {
  if (!type) return "";
  switch (type) {
    case "verb":
      return "v.";
    case "noun":
      return "n.";
    case "adjective":
      return "adj.";
    case "adverb":
      return "adv.";
    case "preposition":
      return "prep.";
    default:
      return type;
  }
};
const Type = [
  { value: "noun", label: "Noun" },
  { value: "verb", label: "Verb" },
  { value: "adjective", label: "Adjective" },
  { value: "adverb", label: "Adverb" },
  { value: "preposition", label: "Preposition" },
];

const Level = [
  {
    value: "A1",
    label: "A1",
  },
  {
    value: "A2",
    label: "A2",
  },
  {
    value: "B1",
    label: "B1",
  },
  {
    value: "B2",
    label: "B2",
  },
];

const Lenght = [
  { value: 2, label: "2 chars" },
  { value: 3, label: "3 chars" },
  { value: 4, label: "4 chars" },
  { value: 5, label: "5 chars" },
  { value: 6, label: "6 chars" },
  { value: 7, label: "7 chars" },
  { value: 8, label: "8 chars" },
  { value: 9, label: "9 chars" },
  { value: 10, label: "10 chars" },
  { value: 11, label: "11 chars" },
  { value: 12, label: "12 chars" },
  { value: 13, label: "13 chars" },
  { value: 14, label: "14 chars" },
  { value: 15, label: "15 chars" },
];

const WordList = ({
  dictionary,
  hasNext,
  loading,
  onLoadMore,
  onSelect,
  selectedWord,
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
        height: "100%",
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
            onClick={() => onSelect(w)}
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
        py:2,
        overflowY: "auto",
      }}
    >
      {/* 1. MASTER WORD TITLE (แสดงแค่ครั้งเดียว) */}
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontFamily: `"Press Start 2P"`,
            fontSize: 24,
            color: "#2b1d14",
            textShadow: "2px 2px 0px #d6b46a", 
          }}
        >
          {dictionary.word}
        </Typography>
      </Box>

      {/* เส้นคั่นหลัก ใต้ชื่อคำศัพท์ */}
      <Divider sx={{ borderColor: "#2b1d14", borderWidth: 1.5, mb: 2 }} />

      {/* 2. LOOP ENTRIES (แสดง Type + Meaning ย่อยๆ) */}
      {dictionary.entries.map((entry, index) => (
        <Box key={index} sx={{ mb: index !== dictionary.entries.length - 1 ? 3 : 0 }}>
          
          {/* แถวแสดง Type และ Level */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1.5,
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
                  color: "#1b1b1b"
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
                  color: "#1b1b1b"
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
              }}
            >
              {entry.meaning}
            </Typography>
          </Box>

          {/* ถ้ามีคำศัพท์ประเภทถัดไป ให้คั่นด้วยเส้นประ */}
          {index !== dictionary.entries.length - 1 && (
            <Divider sx={{ borderStyle: "dashed", borderColor: "#d6b46a", mt: 2 }} />
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
    <Box sx={{ display: "flex" }}>
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
          width: { xs: "90vw", sm: "90%", md: "70%" },
          height: "570px",
          p: 1,
          display: "flex",
          flexDirection: "column",
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
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEMES.accent,
              fontSize: { xs: 16, md: 24 },
              textShadow: `3px 3px 0 #000, 0 0 10px ${THEMES.accent}`,
            }}
          >
            Dictionary Library
          </Typography>
        </Box>{" "}
        <Box sx={{ display: "flex", flexDirection: "column", height: "480px" }}>
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
            }}
          >
            <Box sx={{ width: { xs: "62%", sm: "51%", md: "51%" } }}>
              <SearchDictionary
                value={searchInput}
                setSearchInput={setSearchInput}
                setSearchText={setSearchText}
                handleSearchChange={handleSearchChange}
                letter={selectedLetter}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
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
              flex: 1,
              display: "flex",
              gap: 1,
              overflow: "hidden",
              height: "500px",
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
            />

            <WordDetail dictionary={currentActiveWord} />
          </Box>
        </Box>
      </MotionBox>
    </Box>
  );
};
export default DictionaryLibrary;