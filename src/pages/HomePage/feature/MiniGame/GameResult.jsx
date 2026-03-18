import { Box, Typography } from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken"; 
import { THEMES } from "../../hook/const";

export const GameResult = ({ onExit, onPlayAgain, canPlayAgain }) => {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 5,
        animation: "fadeIn 0.5s ease-in-out",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        // 💡 ลดช่องไฟไม่ให้หน้าจอล้น
        "@media (orientation: landscape) and (max-height: 450px)": {
          py: 2,
          gap: 1,
        },
      }}
    >
      <FlashOnIcon
        sx={{
          fontSize: 80,
          color: "#FFD700",
          filter: "drop-shadow(0 0 15px #FFD700)",
          mb: 2,
          // 💡 ย่อไอคอนตอนชนะ
          "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 40,
            mb: 0.5,
          },
        }}
      />
      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          color: "#fff",
          fontSize: 16,
          mb: 4,
          lineHeight: 1.5,
          // 💡 ย่อฟอนต์คำอธิบาย
          "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 10,
            mb: 1.5,
          },
        }}
      >
        MINING COMPLETE!
        <br />
        YOU GOT 1 ENERGY
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Box
          onClick={onExit}
          sx={{
            display: "inline-block",
            fontFamily: "'Press Start 2P'",
            backgroundColor: "#4e342e",
            color: "#fff",
            py: 2,
            px: { xs: 2, sm: 3 },
            fontSize: 10,
            borderRadius: "4px",
            cursor: "pointer",
            boxShadow: "0 4px 0 #2e1d14",
            "&:hover": {
              backgroundColor: "#5c4033",
              transform: "translateY(2px)",
              boxShadow: "0 2px 0 #2e1d14",
            },
            // 💡 ย่อปุ่มออก
            "@media (orientation: landscape) and (max-height: 450px)": {
              py: 1,
              px: 2,
            },
          }}
        >
          {/* 💡 ถ้าเล่นต่อไม่ได้ ให้ปุ่มเปลี่ยนคำเป็น CLAIM REWARD เฉยๆ */}
          {canPlayAgain ? "CLAIM & EXIT" : "CLAIM REWARD"}
        </Box>

        {/* 💡 THE FIX: ซ่อนปุ่ม PLAY AGAIN ถ้าคำนวณแล้วว่าสายฟ้าจะเต็มหลอด */}
        {canPlayAgain && (
          <Box
            onClick={onPlayAgain}
            sx={{
              display: "inline-block",
              fontFamily: "'Press Start 2P'",
              backgroundColor: "#4caf50",
              color: "#fff",
              py: 2,
              px: { xs: 2, sm: 3 },
              fontSize: 10,
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: "0 4px 0 #2e7d32",
              "&:hover": {
                backgroundColor: "#66bb6a",
                transform: "translateY(2px)",
                boxShadow: "0 2px 0 #2e7d32",
              },
              // 💡 ย่อปุ่มเล่นใหม่
              "@media (orientation: landscape) and (max-height: 450px)": {
                py: 1,
                px: 2,
              },
            }}
          >
            PLAY AGAIN
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const GameOver = ({onClose,startNewGame}) => {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 5,
        animation: "fadeIn 0.5s ease-in-out",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        // 💡 ลดช่องไฟใน Landscape
        "@media (orientation: landscape) and (max-height: 450px)": {
          py: 2,
          gap: 1,
        },
      }}
    >
      <HeartBrokenIcon
        sx={{
          fontSize: 80,
          color: THEMES.error,
          filter: "drop-shadow(0 0 10px #f44336)",
          mb: 2,
          // 💡 ย่อไอคอนตอนแพ้
          "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 40,
            mb: 0.5,
          },
        }}
      />
      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          color: "#fff",
          fontSize: 16,
          mb: 4,
          lineHeight: 1.5,
          // 💡 ย่อฟอนต์
          "@media (orientation: landscape) and (max-height: 450px)": {
            fontSize: 10,
            mb: 1.5,
          },
        }}
      >
        MINING FAILED!
        <br />
        NO ENERGY EARNED
      </Typography>

      {/* 💡 THE FIX: เพิ่มปุ่มให้เลือก EXIT หรือ TRY AGAIN ตอนแพ้ */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Box
          onClick={onClose}
          sx={{
            display: "inline-block",
            fontFamily: "'Press Start 2P'",
            backgroundColor: "#4e342e",
            color: "#fff",
            py: 2,
            px: { xs: 2, sm: 3 },
            fontSize: 10,
            borderRadius: "4px",
            cursor: "pointer",
            boxShadow: "0 4px 0 #2e1d14",
            "&:hover": {
              backgroundColor: "#5c4033",
              transform: "translateY(2px)",
              boxShadow: "0 2px 0 #2e1d14",
            },
            // 💡 ย่อปุ่มออก
            "@media (orientation: landscape) and (max-height: 450px)": {
              py: 1,
              px: 2,
            },
          }}
        >
          EXIT
        </Box>
        <Box
          onClick={startNewGame}
          sx={{
            display: "inline-block",
            fontFamily: "'Press Start 2P'",
            backgroundColor: "#e67e22", // สีส้ม ให้ความรู้สึกกระตุ้นให้ลองใหม่
            color: "#fff",
            py: 2,
            px: { xs: 2, sm: 3 },
            fontSize: 10,
            borderRadius: "4px",
            cursor: "pointer",
            boxShadow: "0 4px 0 #d35400",
            "&:hover": {
              backgroundColor: "#f39c12",
              transform: "translateY(2px)",
              boxShadow: "0 2px 0 #d35400",
            },
            // 💡 ย่อปุ่มลองใหม่
            "@media (orientation: landscape) and (max-height: 450px)": {
              py: 1,
              px: 2,
            },
          }}
        >
          TRY AGAIN
        </Box>
      </Box>
    </Box>
  );
};