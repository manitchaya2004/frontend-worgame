import HardwareIcon from "@mui/icons-material/Hardware";
import SpeedIcon from "@mui/icons-material/Speed";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ShieldIcon from "@mui/icons-material/Shield";
import CasinoIcon from "@mui/icons-material/Casino";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// Icons สำหรับ Deck Effects
import {
  GiBroadsword,
  GiShield,
  GiWaterDrop,
  GiTrident,
  GiBowieKnife,
  GiFangs,
} from "react-icons/gi";
import { FaCloud, FaBolt, FaEyeSlash, FaPlus, FaCross } from "react-icons/fa";
// --- Icons ที่เพิ่มเข้ามา ---
import FavoriteIcon from "@mui/icons-material/Favorite"; // HP
import FlashOnIcon from "@mui/icons-material/FlashOn"; // Power
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"; // COIN
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

  success: "#4caf50",
  error: "#f44336",
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

// ฟังก์ชันแปลง Effect เป็นข้อมูล Icon, สี และ คำอธิบาย
export const getDeckIconData = (effect) => {
  switch (effect) {
    case "double-dmg":
      return {
        desc: " Double score when strike",
        color: "#e74c3c",
        icon: <GiBroadsword />,
      };
    case "double-guard":
    case "double-shield":
      return {
        desc: " Double score when guard",
        color: "#3498db",
        icon: <GiShield />,
      };
    case "mana-plus":
      return {
        desc: " Gain 5 mana",
        color: "#00bcd4",
        icon: <GiWaterDrop />,
      };
    case "shield-plus":
      return {
        desc: " Gain 1 shield on strike",
        color: "#e67e22",
        icon: <GiTrident />,
      };
    case "add_bleed":
      return {
        desc: " Apply Bleed to target",
        color: "#e74c3c",
        icon: <GiBowieKnife />,
      };
    case "add_poison":
    case "add_posion":
      return {
        desc: " Apply Poison to target",
        color: "#2ecc71",
        icon: <FaCloud />,
      };
    case "add_stun":
      return {
        desc: " Chance to Stun target",
        color: "#f1c40f",
        icon: <FaBolt />,
      };
    case "add_blind":
      return {
        desc: " Chance to Blind target",
        color: "#8e44ad",
        icon: <FaEyeSlash />,
      };
    case "heal":
      return {
        desc: " Heal HP by letter score (Guard)",
        color: "#2ecc71",
        icon: <FaPlus />,
      };
    case "bless":
      return {
        desc: " Cleanses 1 Debuff (Guard)",
        color: "#f1c40f",
        icon: <FaCross />,
      };
    case "vampire_fang":
      return {
        desc: " Chance to Lifesteal (Strike)",
        color: "#8b0000",
        icon: <GiFangs />,
      };
    default:
      return {
        desc: effect || "Unknown effect",
        color: "#95a5a6",
        icon: <InfoOutlinedIcon />,
      };
  }
};
// ฟังก์ชันสำหรับเลือก Icon และสีตาม Label อัตโนมัติ
export const getStatIcon = (label) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("hp"))
    return <FavoriteIcon sx={{ color: "#ff4d4d", fontSize: {xs:12,xl:16} }} />;
  if (lowerLabel.includes("power"))
    return <FlashOnIcon sx={{ color: "#ffb84d", fontSize: {xs:12,xl:16} }} />;
  if (lowerLabel.includes("speed"))
    return <SpeedIcon sx={{ color: "#00e5ff", fontSize: {xs:12,xl:16} }} />;
  if (lowerLabel.includes("mana"))
    return <AutoFixHighIcon sx={{ color: "#9933ff", fontSize: {xs:12,xl:16} }} />;
  if (lowerLabel.includes("coin"))
    return <MonetizationOnIcon sx={{ color: "#ffd700", fontSize: {xs:12,xl:16} }} />;
  return null;
};

export const name = "img_hero";

export const backgroundStage = (stageIDName) => {
  return `https://qsopjsioqmqtyaocqmmx.supabase.co/storage/v1/object/public/asset/img_map/${stageIDName}.png`;
};


// dictionary 
export const shortType = (type) => {
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
    case "pronoun":
      return "pron.";
    case "conjunction":
      return "conj"
    default:
      return type;
  }
};
export const Type = [
  { value: "noun", label: "Noun" },
  { value: "verb", label: "Verb" },
  { value: "adjective", label: "Adjective" },
  { value: "adverb", label: "Adverb" },
  { value: "preposition", label: "Preposition" },
  { value: "prenoun", label: "Prenoun"},
  { value: "conjunction", label: "Conjunction"}
];

export const Level = [
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

export const Lenght = [
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
