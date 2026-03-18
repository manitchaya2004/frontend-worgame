import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Stack
} from '@mui/material';
import { motion } from 'framer-motion';

// TODO: รบกวนตรวจสอบและแก้ไข path ของ import ให้ตรงกับโครงสร้างโปรเจกต์ของคุณ
import { supabase } from '../../../../service/supabaseClient'; 
import { useAuthStore } from '../../../../store/useAuthStore';

// --- ค่าสีจำลอง (Fallback Theme) เผื่อในกรณีที่คุณไม่ได้ดึง THEME มา ---
const THEME = {
  bgMain: "#2a160f",
  bgPanel: "#3e2723",
  border: "#8c6b5d",
  accent: "#f4a261",
  textMain: "#d7ccc8",
  shadow: "rgba(0,0,0,0.5)",
};

const MotionBox = motion(Box);

// 🌟 Component สำหรับกระดาษคำศัพท์แต่ละแผ่น (ไม่มีเสียงแล้วเพื่อลดอาการหน่วง)
const WordNote = ({ wordText, count, index }) => {
  // ตั้งเป็น 0 เพื่อให้แปะตรงๆ เป็นระเบียบเรียบร้อย
  const randomRotation = 0; 

  // ลูกเล่น: ถ้าเจอบ่อยเกิน 10 ครั้ง ให้ถือว่าเป็นระดับ Mastered! (เทปทอง + มีดาว)
  const isMastered = count >= 10;
  const tapeColor = isMastered ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 255, 255, 0.7)';
  const tapeBorder = isMastered ? '2px solid rgba(200, 150, 0, 0.5)' : '2px solid rgba(0,0,0,0.2)';

  // ปรับเงาให้เป็นสไตล์ Pixel Art (Solid Shadow) ให้เข้ากับเกม
  const normalShadow = isMastered 
    ? `4px 4px 0px rgba(0,0,0,0.4), 0 0 8px rgba(255, 215, 0, 0.4)` // มีออร่าสีทองนิดๆ
    : '4px 4px 0px rgba(0,0,0,0.4)';
  
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
        delay: index * 0.03 // ทำให้เด้งต่อกันตับๆๆ เหมือนแจกไพ่
      }}
      whileHover={{ 
        scale: 1.1, 
        rotate: 0, 
        zIndex: 50,
        boxShadow: hoverShadow
      }}
      // ลูกเล่นคลิก: เวลากดเมาส์ค้าง กระดาษจะยุบตัวลงไปและเอียงนิดนึง
      whileTap={{ 
        scale: 0.95, 
        rotate: (index % 2 === 0) ? -2 : 2, // สุ่มเอียงซ้ายขวานิดนึงตอนจิ้ม
        boxShadow: '2px 2px 0px rgba(0,0,0,0.6)' 
      }}
      sx={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fbf8cc', 
        border: `2px solid #3e2723`, 
        borderRadius: '2px', 
        padding: `18px 24px`, 
        minWidth: '85px', 
        cursor: 'pointer',
        boxShadow: normalShadow, 
        position: 'relative',
        
        // รอยเทปแปะกระดาษด้านบน
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '32px',
          height: '12px',
          backgroundColor: tapeColor, 
          border: tapeBorder,
          boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
          zIndex: 2,
        }
      }}
    >
      {/* ลูกเล่นดาวกระพริบ สำหรับคำที่ใช้บ่อย */}
      {isMastered && (
        <MotionBox
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            fontSize: 14,
            color: '#ffd700',
            textShadow: '1px 1px 0 #000',
            zIndex: 10,
            pointerEvents: 'none' 
          }}
        >
          ★
        </MotionBox>
      )}

      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: { xs: 10, md: 12 }, 
          color: '#2a160f', 
          textTransform: 'lowercase',
        }}
      >
        {wordText}
      </Typography>

      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: 8, 
          color: isMastered ? '#d4af37' : '#8c6b5d', 
          position: 'absolute',
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

const wordLogCard = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  console.log("Player ID in WordLogCard:", currentUser); 
  
  const [wordLogs, setWordLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dictionaryData, setDictionaryData] = useState({});

  // States สำหรับ Search, Filter และ Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOption, setSortOption] = useState("newest"); 

  useEffect(() => {
    const fetchWordLogs = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('player_word_log')
          .select('*')
          .eq('player_id', currentUser.username)
          .order('update_at', { ascending: false });

        if (error) {
          console.error('Error fetching word logs:', error);
        } else {
          setWordLogs(data);

          if (data && data.length > 0) {
            const wordIds = data.map(log => log.word_id);
            
            const { data: dictData, error: dictError } = await supabase
              .from('dictionary')
              .select('*')
              .in('id', wordIds); 

            if (dictError) {
              console.error('Error fetching dictionary:', dictError);
            } else {
              const dictMap = {};
              dictData.forEach(item => {
                dictMap[item.id] = item; 
              });
              setDictionaryData(dictMap);
            }
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWordLogs();
  }, [currentUser]);

  const availableTypes = useMemo(() => {
    const types = new Set();
    Object.values(dictionaryData).forEach(dict => {
      if (dict && dict.type) types.add(dict.type);
    });
    return Array.from(types).sort();
  }, [dictionaryData]);

  // 🌟 ระบบ Grouping, Filtering และ Sorting
  const processedLogs = useMemo(() => {
    if (!wordLogs.length) return [];

    // 1. Group คำศัพท์ที่ซ้ำกัน (เช่น fly_noun กับ fly_verb รวมเป็น fly)
    const groupedMap = {};
    wordLogs.forEach(log => {
      const dictInfo = dictionaryData[log.word_id];
      // ใช้คำจาก Dictionary ถ้ามี ถ้าไม่มีเอา word_id มาตัดส่วนที่ต่อท้ายด้วย _ ออก
      const wordStr = dictInfo ? dictInfo.word : log.word_id.split('_')[0]; 
      const wordKey = wordStr.toLowerCase();
      const typeStr = dictInfo ? dictInfo.type : 'unknown';

      if (!groupedMap[wordKey]) {
        groupedMap[wordKey] = {
          id: wordKey, // ใช้เป็น Unique Key
          wordText: wordStr,
          count: log.count,
          types: new Set([typeStr]), // เก็บประเภทคำไว้เผื่อ Filter
          update_at: new Date(log.update_at).getTime() // เก็บเวลาอัปเดตล่าสุด
        };
      } else {
        // ถ้าระบบเคยเจอคำนี้แล้ว ให้บวก count เพิ่ม และรวมประเภทคำเข้าไป
        groupedMap[wordKey].count += log.count;
        groupedMap[wordKey].types.add(typeStr);
        groupedMap[wordKey].update_at = Math.max(groupedMap[wordKey].update_at, new Date(log.update_at).getTime());
      }
    });

    // แปลงกลับเป็น Array
    let result = Object.values(groupedMap);

    // 2. Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => item.wordText.toLowerCase().includes(lowerQuery));
    }

    // 3. Filter (ตรวจดูว่าแผ่นนี้มีประเภทคำที่ค้นหาผสมอยู่ด้วยไหม)
    if (filterType !== "all") {
      result = result.filter(item => item.types.has(filterType));
    }

    // 4. Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest": return b.update_at - a.update_at;
        case "oldest": return a.update_at - b.update_at;
        case "most_used": return b.count - a.count;
        case "least_used": return a.count - b.count;
        case "a_z": return a.wordText.localeCompare(b.wordText);
        case "z_a": return b.wordText.localeCompare(a.wordText);
        default: return 0;
      }
    });

    return result;
  }, [wordLogs, dictionaryData, searchQuery, filterType, sortOption]);

  const controlStyle = {
    fontFamily: "'Press Start 2P'",
    fontSize: { xs: '8px', md: '10px' },
    color: THEME.textMain,
    backgroundColor: '#1a120b',
    borderRadius: '4px',
    border: `2px solid ${THEME.border}`,
    height: '40px', 
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSvgIcon-root': { color: THEME.accent },
  };

  return (
    <Box sx={{ height: "100vh", position: "relative" }}>
      <MotionBox
        initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `linear-gradient(${THEME.bgMain}, #1a120b)`,
          border: `8px solid ${THEME.border}`,
          borderRadius: "12px",
          boxShadow: `0 0 0 4px #1a120b, 0 20px 60px rgba(0, 0, 0, 0.8)`,
          width: { xs: "90%", sm: "85%", md: "80%", lg: "70%" },
          height: { xs: "75%", sm: "80%", md: "650px", xl: "80%" },
          p: { xs: 2, md: 3 }, 
          display: "flex",
          flexDirection: "column",
          "@media (orientation: landscape) and (max-height: 450px)": {
            top: "55%",
            height: "85%",
            border: `4px solid ${THEME.border}`,
            borderRadius: "6px",
            p: 1.5,
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
          {/* หัวเรื่องอยู่นิ่งๆ ไม่ลอยขึ้นลงแล้ว */}
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

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ mb: { xs: 2, md: 3 } }} 
          justifyContent="space-between"
          alignItems="center"
        >
          <TextField
            placeholder="SEARCH..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            sx={{ ...controlStyle, flex: 1, width: '100%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: THEME.accent }}>
                    &gt;
                  </Typography>
                </InputAdornment>
              ),
              style: { fontFamily: "'Press Start 2P'", fontSize: '10px', color: THEME.textMain, paddingLeft: '8px' }
            }}
          />

          <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
              }}
              sx={{ ...controlStyle, minWidth: '130px', flex: { xs: 1, sm: 'none' } }}
              MenuProps={{ PaperProps: { sx: { backgroundColor: '#1a120b', border: `2px solid ${THEME.border}`, borderRadius: 0 } } }}
            >
              <MenuItem value="all" sx={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: THEME.textMain }}>ALL TYPES</MenuItem>
              {availableTypes.map(type => (
                <MenuItem key={type} value={type} sx={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: THEME.textMain }}>
                  {type.toUpperCase()}
                </MenuItem>
              ))}
            </Select>

            <Select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
              }}
              sx={{ ...controlStyle, minWidth: '150px', flex: { xs: 1, sm: 'none' } }}
              MenuProps={{ PaperProps: { sx: { backgroundColor: '#1a120b', border: `2px solid ${THEME.border}`, borderRadius: 0 } } }}
            >
              <MenuItem value="newest" sx={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: THEME.textMain }}>LATEST</MenuItem>
              <MenuItem value="oldest" sx={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: THEME.textMain }}>OLDEST</MenuItem>
              <MenuItem value="most_used" sx={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: THEME.textMain }}>MOST USED</MenuItem>
              <MenuItem value="least_used" sx={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: THEME.textMain }}>LEAST USED</MenuItem>
              <MenuItem value="a_z" sx={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: THEME.textMain }}>A - Z</MenuItem>
              <MenuItem value="z_a" sx={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: THEME.textMain }}>Z - A</MenuItem>
            </Select>
          </Stack>
        </Stack>

        <Box
          sx={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: `3px inset ${THEME.border}`,
            borderRadius: '8px',
            overflowY: 'auto',
            overflowX: 'hidden', 
            p: 3, 
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            justifyContent: 'center',
            alignItems: 'flex-start', 
            gap: 1.5, 
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.2)" },
            "&::-webkit-scrollbar-thumb": { background: THEME.border, borderRadius: "4px" },
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <Typography sx={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: '#777', textAlign: 'center', lineHeight: 1.5 }}>
                NO WORDS FOUND.<br/>KEEP EXPLORING!
              </Typography>
            </Box>
          )}
        </Box>
      </MotionBox>
    </Box>
  );
}       

export default wordLogCard;