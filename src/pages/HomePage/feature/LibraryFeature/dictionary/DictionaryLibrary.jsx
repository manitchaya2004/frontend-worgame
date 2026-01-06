import { Box, Typography, Divider, Button } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDictionaryStore } from "../../../../../store/useDictionaryStore";
import { SearchDictionary } from "./SearchDictionary";
import { useData } from "../../../hook/useData";
import { SelectComponent } from "../../../components/SelectComponent";
import BackArrow from "../../../components/BackArrow";

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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
    default:
      return type;
  }
};

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
        p: 3,
        overflowY: "auto",
      }}
    >
      {/* ===== HEADER ===== */}
      <Box
        sx={{
          mb: 2,
          pb: 1,
          borderBottom: "2px dashed #d6b46a",
        }}
      >
        <Typography
          sx={{
            fontFamily: `"Press Start 2P"`,
            fontSize: 18,
            color: "#2b1d14",
          }}
        >
          {dictionary.word}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          {/* type badge */}
          {dictionary.type && (
            <Box
              sx={{
                px: 1,
                py: 0.3,
                fontSize: 10,
                backgroundColor: "#d6b46a",
                border: "2px solid #2b1d14",
                fontFamily: `"Press Start 2P"`,
              }}
            >
              {shortType(dictionary.type)}
            </Box>
          )}

          {/* level badge */}
          {dictionary.level && (
            <Box
              sx={{
                px: 1,
                py: 0.3,
                fontSize: 10,
                backgroundColor: "#e7dcc8",
                border: "2px solid #2b1d14",
                fontFamily: `"Press Start 2P"`,
              }}
            >
              {dictionary.level}
            </Box>
          )}
        </Box>
      </Box>

      {/* ===== MEANING ===== */}
      <Box
        sx={{
          backgroundColor: "#fffaf0",
          border: "2px solid #d6b46a",
          boxShadow: "inset 2px 2px 0 #fff",
          p: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1b1b1b",
            lineHeight: 1.8,
          }}
        >
          {dictionary.meaning}
        </Typography>
      </Box>

      {/* ===== EXTRA (เผื่ออนาคต) ===== */}
      {/* 
      <Box sx={{ mt: 2, fontSize: 11, color: "#555" }}>
        Example: ...
      </Box> 
      */}
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

  const handleSearchChange = () => {
    if (searchInput === searchText) return;
    setSearchText(searchInput);
  };
  // load when select alphabet and search
  useEffect(() => {
    clearDictionary();
    fetchDictionary({
      startsWith: selectedLetter,
      contains: searchText,
      limit: 50,
      append: false,
    });
  }, [selectedLetter, searchText, clearDictionary, fetchDictionary]);

  /* ===============================
   load when clear search input
================================ */
  useEffect(() => {
    if (searchInput.trim() === "") {
      fetchDictionary({
        startsWith: selectedLetter,
        limit: 50,
        append: false,
      });
    }
  }, [searchInput, selectedLetter, fetchDictionary]);

  /* ===============================
   load more
================================ */
  const loadMore = () => {
    if (!hasNext || DictionaryState === "LOADING") return;

    fetchDictionary({
      startsWith: selectedLetter,
      limit: 50,
      lastWord,
      append: true,
    });
  };
  return (
    <Box sx={{ m: 2 }}>
      <BackArrow onClick={() => navigate("/home/library")} />
      <Box
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          paddingTop: 6, // เผื่อหัว
          background: "linear-gradient(#7b4a3b, #5a3328)",
          border: "6px solid #7a1f1f",
          boxShadow: `
    inset 0 0 0 3px #d6b46a,
    0 0 20px rgba(180,40,40,0.5),
    0 20px 40px rgba(0,0,0,0.8)
  `,
          width: { xs: "90vw", sm: "90%", md: "70%" },
          height: "550px",
          padding: 2,
          mt: 1.5,
        }}
      >
        {/* Title */}
        <Box
          sx={{
            mt: 2,
            mb: 2,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: "#fffbe6",
              fontSize: { xs: 20, md: 28 },
            }}
          >
            Dictionary Library
          </Typography>
        </Box>{" "}
        <Box sx={{ display: "flex", flexDirection: "column", height: "480px" }}>
          {/* Search 
          <SearchDictionary/> */}

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

          {/*  content */}
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
                letter={selectedLetter.toLowerCase()}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <SelectComponent />
              <SelectComponent />
              <SelectComponent />
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
            {/* <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: { xs: "60%", mb: "70%" },
              }}
            >
              <Box
                sx={{
                  p: 1,
                  backgroundColor: "#fffaf0",
                  overflowY: "hidden",
                  height: "100%",
                  border: "3px solid #2b1d14",
                  boxShadow: "inset 0 0 0 2px #e7dcc8, 4px 4px 0 #2b1d14",
                }}
              >
                <WordList
                  dictionary={dictionary}
                  hasNext={hasNext}
                  loading={DictionaryState === "LOADING"}
                  onLoadMore={loadMore}
                  onSelect={setSelectedWord}
                  selectedWord={selectedWord}

                  // searchInput={searchInput}
                />
              </Box>
            </Box> */}
            <WordList
              dictionary={dictionary}
              hasNext={hasNext}
              loading={DictionaryState === "LOADING"}
              onLoadMore={loadMore}
              onSelect={setSelectedWord}
              selectedWord={selectedWord}
              // roleAdmin={currentUser?.role}
              // searchInput={searchInput}
            />

            <WordDetail dictionary={selectedWord} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default DictionaryLibrary;
