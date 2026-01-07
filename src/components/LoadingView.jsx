import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// รูปภาพ
import walkEnemy1 from "../assets/1.png";
import walkEnemy2 from "../assets/2.png";

const LoadingView = ({ progress = 0 }) => {
  const [frame, setFrame] = useState(0);

  // สลับเฟรมทุก 200ms
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#121212",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#eebb55",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* เส้นพื้น */}
      <div
        style={{
          position: "absolute",
          bottom: "40%",
          width: "100%",
          height: "2px",
          background: "#333",
        }}
      />

      {/* ตัวละคร */}
      <div style={{ position: "relative", marginBottom: "30px" }}>
        {/* เงา */}
        <div
          style={{
            position: "absolute",
            bottom: "-5px",
            left: "10%",
            width: "80%",
            height: "10px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%",
            filter: "blur(4px)",
          }}
        />

        <motion.img
          key={frame}
          src={frame === 0 ? walkEnemy1 : walkEnemy2}
          alt="Loading..."
          style={{
            width: "64px",
            height: "64px",
            imageRendering: "pixelated",
            position: "relative",
            zIndex: 2,
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* ข้อความโหลด */}
      <h2
        style={{
          fontFamily: "monospace",
          letterSpacing: "4px",
          fontSize: "24px",
          textShadow: "0 0 10px rgba(238, 187, 85, 0.5)",
        }}
      >
        LOADING... {progress}%
      </h2>

      {/* Progress Bar */}
      <div
        style={{
          width: "300px",
          height: "10px",
          background: "#333",
          borderRadius: "5px",
          marginTop: "15px",
          overflow: "hidden",
          border: "1px solid #555",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.2 }}
          style={{
            height: "100%",
            background: "#00e676",
          }}
        />
      </div>

      <p
        style={{
          color: "#666",
          fontSize: "12px",
          marginTop: "10px",
          fontFamily: "monospace",
        }}
      >
        {progress < 20
          ? "Connecting to Dictionary..."
          : "Preloading Assets..."}
      </p>
    </div>
  );
};

export default LoadingView;
