import { motion } from "framer-motion";
import arrowWhite from "../../../assets/icons/arrowWhite.png";

const BackArrow = ({ onClick }) => {
  return (
    <motion.img
      src={arrowWhite}
      alt="Arrow"
      onClick={onClick}
      whileHover={{
        x: -8,
        scale: 1.1,
        filter: `
          drop-shadow(0 0 6px rgba(255,224,102,0.8))
          drop-shadow(0 0 14px rgba(255,224,102,0.6))
        `,
      }}
      // whileTap={{
      //   scale: 0.85,
      //   rotate: -8,
      //   filter: `
      //     drop-shadow(0 0 20px rgba(255,200,120,1))
      //   `,
      // }}
      // transition={{
      //   type: "spring",
      //   stiffness: 400,
      //   damping: 18,
      // }}
      style={{
        width: 50,
        imageRendering: "pixelated",
        cursor: "pointer",
        position: "absolute",
        top: 24,
        left: 24,
        zIndex: 10,
      }}
    />
  );
};

export default BackArrow;
