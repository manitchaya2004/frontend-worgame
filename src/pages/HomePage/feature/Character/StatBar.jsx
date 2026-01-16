import { Typography,Box } from "@mui/material";
import { STAT_CONFIG,MAX_STAT } from "../../hook/const";
import HardwareIcon from "@mui/icons-material/Hardware";
import SpeedIcon from "@mui/icons-material/Speed";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ShieldIcon from "@mui/icons-material/Shield";
import CasinoIcon from "@mui/icons-material/Casino";
import StarIcon from "@mui/icons-material/Star";

// --- StatBar (แก้ไข: เพิ่มปุ่ม Upgrade) ---
// const StatBar = ({ label, value, onUpgrade, showUpgrade }) => {
//   const config = STAT_CONFIG[label] || {
//     color: "gray",
//     icon: null,
//     labelBg: "#eee",
//   };
//   return (
//     <Box sx={{ mb: 1 }}>
//       <Box sx={{ display: "flex", gap: 1, mb: 0.3, alignItems: "center" }}>
//         {/* LABEL Box */}
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             gap: 0.5,
//             width: "53px",
//             backgroundColor: config.labelBg,
//             boxShadow: "1px 1px 0 #6b4a2f",
//             px: 0.4,
//             py: 0.4,
//           }}
//         >
//           <Box sx={{ color: "#2b1d14", display: "flex" }}>{config.icon}</Box>
//           <Typography
//             sx={{
//               fontFamily: "'Press Start 2P'",
//               fontSize: 8.5,
//               color: "#4b2e1a",
//               textAlign: "left",
//             }}
//           >
//             {label}
//           </Typography>
//         </Box>

//         {/* BAR */}
//         <Box
//           sx={{
//             display: "flex",
//             flex: 1,
//             height: 12,
//             borderRadius: 2,
//             overflow: "hidden",
//             backgroundColor: "#4a3523",
//             border: "1px solid #2f1d12",
//           }}
//         >
//           {Array.from({ length: MAX_STAT }).map((_, index) => {
//             const active = index < value;
//             return (
//               <Box
//                 key={index}
//                 sx={{
//                   flex: 1,
//                   backgroundColor: active ? config.color : "transparent",
//                   opacity: active ? 1 : 0.15,
//                   borderRight:
//                     index !== 19 ? "1px solid rgba(0,0,0,0.25)" : "none",
//                 }}
//               />
//             );
//           })}
//         </Box>

//         {/* Value */}
//         <Typography
//           sx={{
//             fontFamily: "'Press Start 2P'",
//             fontSize: 9,
//             color: "#f5e6c8",
//             textShadow: "1px 1px 0 #3b2415",
//             width: "20px",
//             textAlign: "right",
//           }}
//         >
//           {value}
//         </Typography>

//         {/* ปุ่ม Upgrade (+ Button)
//         {showUpgrade && (
//           <Box
//             onClick={onUpgrade}
//             sx={{
//               width: 16,
//               height: 16,
//               ml: 0.5,
//               backgroundColor: "#81c784", // สีเขียว Pixel
//               border: "1px solid #2e7d32",
//               borderRadius: "4px",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               cursor: "pointer",
//               boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 0 #1b5e20",
//               "&:hover": {
//                 filter: "brightness(1.1)",
//                 backgroundColor: "#a5d6a7",
//               },
//               "&:active": {
//                 transform: "translateY(1px)",
//                 boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
//               },
//             }}
//           >
//             <Typography
//               sx={{
//                 fontSize: 10,
//                 fontWeight: "bold",
//                 color: "#003300",
//                 lineHeight: 1,
//                 mb: "1px",
//                 fontFamily: "monospace",
//               }}
//             >
//               +
//             </Typography>
//           </Box>
//         )} */}
//       </Box>
//     </Box>
//   );
// };
const StatBar = ({ label, value, icon, color, subValue }) => (
  <Box
    sx={{
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      borderRadius: "6px",
      p: 1,
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      border: "1px solid rgba(255,255,255,0.05)",
      transition: "0.2s",
      // "&:hover": {
      //   backgroundColor: "rgba(0, 0, 0, 0.6)",
      //   borderColor: color,
      // }
    }}
  >
    {/* Icon Box */}
    <Box sx={{ color: color, display: "flex", }}>
      {icon}
    </Box>

    {/* Text Info */}
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: 8,
          color: "#aaa",
          mb: 0.5,
          textTransform: "uppercase"
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Press Start 2P'",
          fontSize: 10,
          color: "#fff",
          textShadow: `1px 1px 0 ${color}`,
        }}
      >
        {value} {subValue && <span style={{fontSize:8, color:'#888'}}>{subValue}</span>}
      </Typography>
    </Box>
  </Box>
);
export default StatBar;