import HardwareIcon from "@mui/icons-material/Hardware";
import SpeedIcon from "@mui/icons-material/Speed";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ShieldIcon from "@mui/icons-material/Shield";
import CasinoIcon from "@mui/icons-material/Casino";
import StarIcon from "@mui/icons-material/Star";
import { API_URL } from "../../../store/const";

export const MAX_STAT = 20;
export const MAX_LEVEL = 10;

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
  bgMain: "#2b1d14", // พื้นหลังหลัก
  bgPanel: "#3e2723", // พื้นหลัง Panel ข้อมูล
  border: "#5a3e2b", // ขอบทองแดง
  accent: "#ffecb3", // สีทอง (Text/Active)
  textMain: "#d7ccc8", // สีตัวหนังสือ
  textDark: "#1a120b", // สีตัวหนังสือบนพื้นสว่าง
  magic: "#00bcd4", // สีฟ้าเวทมนตร์
  shadow: "#1a120b", // สีเงา
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

export const backgroundStage = (stageIDName) => {
  return `/api/img_map/${stageIDName}.png`;
};
