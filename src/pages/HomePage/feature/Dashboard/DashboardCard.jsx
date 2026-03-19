import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useDictionaryStore } from "../../../../store/useDictionaryStore";

import { motion } from "framer-motion";
import { THEME } from "../../hook/const";

import { SearchAndFilterBar } from "../../components/SearchAndFilterBar";

const MotionBox = motion(Box);

// 🌟 Component แถวจัดอันดับใน Dashboard
const RankingRow = ({ item, index, maxCount }) => {
  // คำนวณความยาวของหลอดกราฟ (เปรียบเทียบกับคำที่ใช้เยอะสุด)
  const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

  // กำหนดสีให้อันดับ Top 3 โดยเช็คจาก item.rank
  let rankColor = "#8c6b5d"; // สีอันดับทั่วไป
  if (item.rank === 1)
    rankColor = "#ffd700"; // ทอง
  else if (item.rank === 2)
    rankColor = "#c0c0c0"; // เงิน
  else if (item.rank === 3) rankColor = "#cd7f32"; // ทองแดง

  return (
    <MotionBox
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor:
          index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
        borderBottom: `1px dashed ${THEME.border}`,
        py: 1.5,
        px: 2,
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.05)",
        },
      }}
    >
      {/* อันดับ (Rank) */}
      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: { xs: 10, md: 14 },
          color: rankColor,
          width: { xs: "60px", md: "75px" },
          flexShrink: 0,
          textShadow: item.rank <= 3 ? "1px 1px 0 #000" : "none",
        }}
      >
        #{item.rank}
      </Typography>

      {/* คำศัพท์ (Word) */}
      <Box sx={{ width: "120px", flexShrink: 0 }}>
        <Typography
          sx={{
            fontFamily: "'Press Start 2P'",
            fontSize: { xs: 10, md: 12 },
            color: item.rank <= 3 ? "#fff" : THEME.textMain,
            textTransform: "lowercase",
          }}
        >
          {item.wordText}
        </Typography>
      </Box>

      {/* กราฟแท่ง (Bar) */}
      <Box
        sx={{
          flex: 1,
          mx: 2,
          height: "14px",
          backgroundColor: "rgba(0,0,0,0.5)",
          border: `1px solid ${THEME.border}`,
          position: "relative",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{
            duration: 0.8,
            delay: 0.2 + index * 0.02,
            ease: "easeOut",
          }}
          style={{
            height: "100%",
            backgroundColor:
              item.rank === 1
                ? "#ffd700"
                : item.rank === 2
                  ? "#c0c0c0"
                  : item.rank === 3
                    ? "#cd7f32"
                    : THEME.accent,
            boxShadow: "inset 0px -4px 0px rgba(0,0,0,0.2)",
          }}
        />
      </Box>

      {/* จำนวนครั้ง (Count) */}
      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: { xs: 10, md: 12 },
          color: "#fff",
          width: "60px",
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {item.count}
      </Typography>
    </MotionBox>
  );
};

// --- MAIN PAGE ---

const DashboardCard = () => {
  // 🌟 ดึงข้อมูลจาก Store แทนการใช้ useState ของเดิม
  const { topWords, topWordsLoading, fetchTopWords } = useDictionaryStore();

  // States สำหรับ Search, Filter และ Limit
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [topLimit, setTopLimit] = useState(20);

  // 🌟 เรียกใช้ฟังก์ชันทันทีที่เปิดหน้านี้ (ดึงข้อมูลล่าสุดเสมอ)
  useEffect(() => {
    fetchTopWords();
  }, [fetchTopWords]);

  const availableTypes = useMemo(() => {
    const types = new Set();
    topWords.forEach((dict) => {
      if (dict && dict.type) types.add(dict.type);
    });
    return Array.from(types).sort();
  }, [topWords]);

  // ระบบ Grouping, Filtering, Sorting และคำนวณ Rank
  const processedLogs = useMemo(() => {
    if (!topWords.length) return [];

    const groupedMap = {};
    topWords.forEach((item) => {
      const wordStr = item.word || "";
      const wordKey = wordStr.toLowerCase();
      const typeStr = item.type || "unknown";
      const useCount = item.use_count || 0;

      if (!groupedMap[wordKey]) {
        groupedMap[wordKey] = {
          id: wordKey,
          wordText: wordStr,
          count: useCount,
          types: new Set([typeStr]),
        };
      } else {
        groupedMap[wordKey].count += useCount;
        groupedMap[wordKey].types.add(typeStr);
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

    // 1. Sort เรียงจาก count มากไปน้อย
    result.sort((a, b) => b.count - a.count);

    // 2. คำนวณอันดับร่วม (Tie Ranking)
    let currentRank = 1;
    for (let i = 0; i < result.length; i++) {
      if (i > 0 && result[i].count < result[i - 1].count) {
        currentRank++;
      }
      result[i].rank = currentRank;
    }

    // 3. หั่นเอาเฉพาะ Top จำนวนที่ผู้เล่นเลือก
    return result.slice(0, topLimit);
  }, [topWords, searchQuery, filterType, topLimit]);

  // หาค่าสูงสุดเพื่อเอาไปคำนวณหลอดกราฟ (ความยาว 100%)
  const maxWordCount = useMemo(() => {
    if (processedLogs.length === 0) return 0;
    return processedLogs[0].count;
  }, [processedLogs]);

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
          height: { xs: "75%", sm: "80%", md: "650px", xl: "80%" },
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
            TOP WORDS USED
          </Typography>
        </Box>

        <SearchAndFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          availableTypes={availableTypes}
          secondSelectValue={topLimit}
          setSecondSelectValue={setTopLimit}
          secondSelectOptions={[
            { value: 10, label: "TOP 10" },
            { value: 20, label: "TOP 20" },
            { value: 50, label: "TOP 50" },
            { value: 100, label: "TOP 100" },
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
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.2)" },
            "&::-webkit-scrollbar-thumb": {
              background: THEME.border,
              borderRadius: "4px",
            },
          }}
        >
          {/* Header ของ Table */}
          {!topWordsLoading && processedLogs.length > 0 && (
            <Box
              sx={{
                display: "flex",
                px: 2,
                pb: 1,
                borderBottom: `2px solid ${THEME.border}`,
                mb: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 8,
                  color: "#888",
                  width: { xs: "60px", md: "75px" },
                  flexShrink: 0,
                }}
              >
                RANK
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 8,
                  color: "#888",
                  width: "120px",
                  flexShrink: 0,
                }}
              >
                WORD
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 8,
                  color: "#888",
                  flex: 1,
                  mx: 2,
                }}
              >
                USAGE METER
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 8,
                  color: "#888",
                  width: "60px",
                  flexShrink: 0,
                  textAlign: "right",
                }}
              >
                COUNT
              </Typography>
            </Box>
          )}

          {topWordsLoading ? (
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
              <RankingRow
                key={item.id}
                item={item}
                index={index}
                maxCount={maxWordCount}
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
                NO DATA AVAILABLE.
              </Typography>
            </Box>
          )}
        </Box>
      </MotionBox>
    </Box>
  );
};

export default DashboardCard;
