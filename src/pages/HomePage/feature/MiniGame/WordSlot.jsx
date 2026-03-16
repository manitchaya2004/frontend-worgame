import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { THEMES } from "../../hook/const"; // เช็ค path ด้วยนะครับว่าตรงตามที่คุณใช้จริงมั้ย

export const WordSlots = ({ targetLength, selectedLetters, status, onRemoveLetter, controls }) => {
  return (
    <motion.div animate={controls}>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
        {[...Array(targetLength)].map((_, idx) => {
          const selectedItem = selectedLetters[idx];
          const isSuccess = status === "success";
          const isError = status === "error";
          
          // เช็คว่าตัวอักษรในช่องนี้เป็น Hint หรือไม่ (ถ้าใช่จะได้กรอบทอง)
          const isHintLetter = selectedItem ? selectedItem.isHint : false;

          return (
            <motion.div
              key={idx}
              animate={isSuccess ? { y: [0, -10, 0] } : {}}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <Box
                onClick={() => {
                  // ถ้าไม่ใช่ตัวใบ้ และมีตัวอักษรอยู่ ถึงจะอนุญาตให้กดลบได้
                  if (!isHintLetter && selectedItem) {
                    onRemoveLetter(selectedItem);
                  }
                }}
                sx={{
                  width: { xs: 40, sm: 50 },
                  height: { xs: 40, sm: 50 },
                  // 💡 THE FIX: ให้ตัวใบ้เป็นขอบสีทองเด่นๆ ตัวที่กดเองเป็นสีปกติ
                  border: `3px solid ${
                    isHintLetter 
                      ? THEMES.accent 
                      : (isSuccess ? THEMES.success : isError ? THEMES.error : "#555")
                  }`,
                  backgroundColor: selectedItem ? THEMES.bgMain : "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  cursor: (isHintLetter || !selectedItem) ? "default" : "pointer",
                  boxShadow: selectedItem ? `inset 0 -4px 0 rgba(0,0,0,0.2)` : "none",
                  // 💡 ย่อขนาดช่องใส่คำตอบเพื่อประหยัดพื้นที่
                  "@media (orientation: landscape) and (max-height: 450px)": {
                    width: 35,
                    height: 35,
                    borderWidth: "2px",
                  },
                }}
              >
                <Typography 
                  sx={{ 
                    fontFamily: "'Press Start 2P'", 
                    fontSize: 18, 
                    color: isHintLetter ? "#b71c1c" : THEMES.textMain,
                    // 💡 ย่อฟอนต์ในช่อง
                    "@media (orientation: landscape) and (max-height: 450px)": {
                      fontSize: 14,
                    },
                  }}
                >
                  {selectedItem?.char || ""}
                </Typography>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </motion.div>
  );
};