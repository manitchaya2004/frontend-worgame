import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";

import { useAuthStore } from "../../../../store/useAuthStore";
import { useDictionaryStore } from "../../../../store/useDictionaryStore";

import { THEME } from "../../hook/const";
import { SearchAndFilterBar } from "../../components/SearchAndFilterBar";

const MotionBox = motion(Box);

// 🌟 Component สำหรับกระดาษคำศัพท์แต่ละแผ่น (ไม่มีเสียงแล้วเพื่อลดอาการหน่วง)
const WordNote = ({ wordText, count, index }) => {
  // ตั้งเป็น 0 เพื่อให้แปะตรงๆ เป็นระเบียบเรียบร้อย
  const randomRotation = 0;

  // ลูกเล่น: ถ้าเจอบ่อยเกิน 10 ครั้ง ให้ถือว่าเป็นระดับ Mastered! (เทปทอง + มีดาว)
  const isMastered = count >= 10;
  const tapeColor = isMastered
    ? "rgba(255, 215, 0, 0.8)"
    : "rgba(255, 255, 255, 0.7)";
  const tapeBorder = isMastered
    ? "2px solid rgba(200, 150, 0, 0.5)"
    : "2px solid rgba(0,0,0,0.2)";

  // ปรับเงาให้เป็นสไตล์ Pixel Art (Solid Shadow) ให้เข้ากับเกม
  const normalShadow = isMastered
    ? `4px 4px 0px rgba(0,0,0,0.4), 0 0 8px rgba(255, 215, 0, 0.4)` // มีออร่าสีทองนิดๆ
    : "4px 4px 0px rgba(0,0,0,0.4)";

  const hoverShadow = `6px 6px 0px rgba(0,0,0,0.5), 0 0 0 2px ${THEME.accent}`;

  return (
    <MotionBox
      // ลูกเล่นแจกการ์ด: โผล่มาจากด้านล่าง (y: 30) และมี delay ตามลำดับ (index)
      initial={{ opacity: 0, scale: 0.5, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: randomRotation }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: index * 0.03, // ทำให้เด้งต่อกันตับๆๆ เหมือนแจกไพ่
      }}
      whileHover={{
        scale: 1.1,
        rotate: 0,
        zIndex: 50,
        boxShadow: hoverShadow,
      }}
      // ลูกเล่นคลิก: เวลากดเมาส์ค้าง กระดาษจะยุบตัวลงไปและเอียงนิดนึง
      whileTap={{
        scale: 0.95,
        rotate: index % 2 === 0 ? -2 : 2, // สุ่มเอียงซ้ายขวานิดนึงตอนจิ้ม
        boxShadow: "2px 2px 0px rgba(0,0,0,0.6)",
      }}
      sx={{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fbf8cc",
        border: `2px solid #3e2723`,
        borderRadius: "2px",
        padding: `18px 24px`,
        minWidth: "85px",
        cursor: "pointer",
        boxShadow: normalShadow,
        position: "relative",

        // รอยเทปแปะกระดาษด้านบน
        "&::before": {
          content: '""',
          position: "absolute",
          top: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: "32px",
          height: "12px",
          backgroundColor: tapeColor,
          border: tapeBorder,
          boxShadow: "2px 2px 0px rgba(0,0,0,0.1)",
          zIndex: 2,
        },
      }}
    >
      {/* ลูกเล่นดาวกระพริบ สำหรับคำที่ใช้บ่อย */}
      {isMastered && (
        <MotionBox
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          sx={{
            position: "absolute",
            top: -8,
            right: -8,
            fontSize: 14,
            color: "#ffd700",
            textShadow: "1px 1px 0 #000",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          ★
        </MotionBox>
      )}

      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: { xs: 10, md: 12 },
          color: "#2a160f",
          textTransform: "lowercase",
        }}
      >
        {wordText}
      </Typography>

      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: 8,
          color: isMastered ? "#d4af37" : "#8c6b5d",
          position: "absolute",
          bottom: 4,
          right: 6,
        }}
      >
        x{count}
      </Typography>
    </MotionBox>
  );
};

// --- MAIN PAGE ---

const WordLogCard = () => {
  const currentUser = useAuthStore((state) => state.currentUser);

  // 🌟 ดึงข้อมูลจาก Store แทน
  const { myWords, myDictMap, myWordsLoading, fetchMyWords } =
    useDictionaryStore();

  // States สำหรับ Search, Filter และ Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    // 💡 โหลดข้อมูลแค่ตอนที่ยังไม่มีข้อมูลใน Store เท่านั้น (โหลดครั้งแรก)
    if (currentUser?.username && myWords.length === 0) {
      fetchMyWords(currentUser.username);
    }
  }, [currentUser, myWords.length, fetchMyWords]);

  const availableTypes = useMemo(() => {
    const types = new Set();
    Object.values(myDictMap).forEach((dict) => {
      if (dict && dict.type) types.add(dict.type);
    });
    return Array.from(types).sort();
  }, [myDictMap]);

  // 🌟 ระบบ Grouping, Filtering และ Sorting
  const processedLogs = useMemo(() => {
    if (!myWords.length) return [];

    const groupedMap = {};
    myWords.forEach((log) => {
      const dictInfo = myDictMap[log.word_id];
      const wordStr = dictInfo ? dictInfo.word : log.word_id.split("_")[0];
      const wordKey = wordStr.toLowerCase();
      const typeStr = dictInfo ? dictInfo.type : "unknown";

      if (!groupedMap[wordKey]) {
        groupedMap[wordKey] = {
          id: wordKey,
          wordText: wordStr,
          count: log.count,
          types: new Set([typeStr]),
          update_at: new Date(log.update_at).getTime(),
        };
      } else {
        groupedMap[wordKey].count += log.count;
        groupedMap[wordKey].types.add(typeStr);
        groupedMap[wordKey].update_at = Math.max(
          groupedMap[wordKey].update_at,
          new Date(log.update_at).getTime(),
        );
      }
    });

    let result = Object.values(groupedMap);

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.wordText.toLowerCase().includes(lowerQuery),
      );
    }

    if (filterType !== "all") {
      result = result.filter((item) => item.types.has(filterType));
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return b.update_at - a.update_at;
        case "oldest":
          return a.update_at - b.update_at;
        case "most_used":
          return b.count - a.count;
        case "least_used":
          return a.count - b.count;
        case "a_z":
          return a.wordText.localeCompare(b.wordText);
        case "z_a":
          return b.wordText.localeCompare(a.wordText);
        default:
          return 0;
      }
    });

    return result;
  }, [myWords, myDictMap, searchQuery, filterType, sortOption]);

  return (
    <Box sx={{ height: "100vh", position: "relative" }}>
      <MotionBox
        initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        sx={{
          position: "fixed",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `linear-gradient(${THEME.bgMain}, #1a120b)`,
          border: `8px solid ${THEME.border}`,
          borderRadius: "12px",
          boxShadow: `0 0 0 4px #1a120b, 0 20px 60px rgba(0, 0, 0, 0.8)`,
          width: { xs: "90%", sm: "85%", md: "80%" },
          height: { xs: "75%", sm: "80%", md: "570px", xl: "82%" },
          p: { xs: 2, md: 3 },
          display: "flex",
          flexDirection: "column",
          "@media (orientation: landscape) and (max-height: 450px)": {
            top: "55%",
            height: "80%",
            border: `4px solid ${THEME.border}`,
            borderRadius: "6px",
          },
        }}
      >
        <Box
          sx={{
            py: 2,
            textAlign: "center",
            background: "#1a120b",
            mx: { xs: -2, md: -3 },
            mt: { xs: -2, md: -3 },
            mb: { xs: 2, md: 3 },
            borderBottom: `4px solid ${THEME.border}`,
            "@media (orientation: landscape) and (max-height: 450px)": {
              py: 1,
              mx: -1.5,
              mt: -1.5,
              mb: 1.5,
              borderBottom: `2px solid ${THEME.border}`,
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              color: THEME.accent,
              fontSize: { xs: 16, md: 24 },
              textShadow: `3px 3px 0 #000, 0 0 10px ${THEME.accent}`,
              "@media (orientation: landscape) and (max-height: 450px)": {
                fontSize: 10,
                textShadow: `2px 2px 0 #000, 0 0 6px ${THEME.accent}`,
              },
            }}
          >
            MY WORD
          </Typography>
        </Box>

        <SearchAndFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          availableTypes={availableTypes}
          secondSelectValue={sortOption}
          setSecondSelectValue={setSortOption}
          secondSelectOptions={[
            { value: "newest", label: "LATEST" },
            { value: "oldest", label: "OLDEST" },
            { value: "most_used", label: "MOST USED" },
            { value: "least_used", label: "LEAST USED" },
            { value: "a_z", label: "A - Z" },
            { value: "z_a", label: "Z - A" },
          ]}
        />

        <Box
          sx={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            border: `3px inset ${THEME.border}`,
            borderRadius: "8px",
            overflowY: "auto",
            overflowX: "hidden",
            p: 3,
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 1.5,
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.2)" },
            "&::-webkit-scrollbar-thumb": {
              background: THEME.border,
              borderRadius: "4px",
            },
          }}
        >
          {myWordsLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <CircularProgress sx={{ color: THEME.accent }} />
            </Box>
          ) : processedLogs.length > 0 ? (
            processedLogs.map((item, index) => (
              <WordNote
                key={item.id}
                wordText={item.wordText}
                count={item.count}
                index={index}
              />
            ))
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 10,
                  color: "#777",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                NO WORDS FOUND.
                <br />
                KEEP EXPLORING!
              </Typography>
            </Box>
          )}
        </Box>
      </MotionBox>
    </Box>
  );
};

export default WordLogCard;
