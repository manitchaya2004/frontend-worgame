import { motion } from "framer-motion";
import arrowWhite from "../../../assets/icons/arrowWhite.png";

const BackArrow = ({ onClick }) => {
  return (
    <motion.img
      src={arrowWhite}
      alt="Arrow"
      onClick={onClick}
      whileHover={{
        x: -6,
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.9,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 18,
      }}
      style={{
        width: 40,
        imageRendering: "pixelated",
        cursor: "pointer",
        opacity: 0.9,
      }}
    />
  );
};

export default BackArrow;
