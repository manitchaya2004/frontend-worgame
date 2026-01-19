import HardwareIcon from "@mui/icons-material/Hardware";
import SpeedIcon from "@mui/icons-material/Speed";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ShieldIcon from "@mui/icons-material/Shield";
import CasinoIcon from "@mui/icons-material/Casino";
import StarIcon from "@mui/icons-material/Star";
import { API_URL } from "../../../store/const";

export const MAX_STAT = 20;
export const MAX_LEVEL = 5;

export const THEMES = {
  bgMain: "#2b1d14", // พื้นหลังหลัก
  bgPanel: "#3e2723", // พื้นหลัง Panel ข้อมูล
  border: "#5a3e2b", // ขอบทองแดง
  accent: "#ffecb3", // สีทอง (Text/Active)
  textMain: "#d7ccc8", // สีตัวหนังสือ
  textDark: "#1a120b", // สีตัวหนังสือบนพื้นสว่าง
  magic: "#00bcd4", // สีฟ้าเวทมนตร์
  shadow: "#1a120b", // สีเงา
};

export const THEME = {
  cream: "#eaddcf", // พื้นหลังหลัก (สีครีมอุ่นๆ ไม่สว่างจ้า)
  creamDark: "#d7c6b0", // สีพื้นหลัง Element รอง
  brownDark: "#3e2723", // สีขอบและตัวหนังสือหลัก (น้ำตาลเข้มเกือบดำ)
  brownLight: "#5d4037", // สีปุ่มและ Element ตกแต่ง
  navy: "#1a237e", // สีหลอด (เข้ากับธีม Global)
  navyLight: "#534bae",
  textLight: "#fff8e1", // สีตัวหนังสือบนพื้นเข้ม
};

export const STAT_CONFIG = {
  STR: {
    color: "#c45a3c",
    icon: <HardwareIcon sx={{ fontSize: 12 }} />,
    labelBg: "#f3e5d8",
  },
  DEX: {
    color: "#7ba98b",
    icon: <SpeedIcon sx={{ fontSize: 12 }} />,
    labelBg: "#e7f0ea",
  },
  INT: {
    color: "#6a8caf",
    icon: <AutoFixHighIcon sx={{ fontSize: 12 }} />,
    labelBg: "#e6edf5",
  },
  FTH: {
    color: "#ffd700", // สีทองสำหรับ Faith
    icon: <AutoFixHighIcon sx={{ fontSize: 12 }} />, // หรือเปลี่ยน Icon ตามต้องการ
    labelBg: "#fff8e1",
  },
  CON: {
    color: "#c9a24d",
    icon: <ShieldIcon sx={{ fontSize: 12 }} />,
    labelBg: "#f6edd8",
  },
  LUCK: {
    color: "#9c7bb0",
    icon: <CasinoIcon sx={{ fontSize: 12 }} />,
    labelBg: "#efe6f3",
  },
};

export const name = "img_hero";

export const backgroundStage = () => {
  return `${API_URL}/img_map/grassland.png`;
};
