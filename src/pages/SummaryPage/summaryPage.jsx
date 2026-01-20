// SummaryPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import RpgButton ...

export default function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 📥 รับค่าแค่ 3 ตัวนี้พอ
  const { result, earnedCoins, wordLog } = location.state || {};

  // ถ้าไม่มีข้อมูล ให้ดีดกลับหน้าเลือกด่าน
  if (!result) {
    navigate("/home/adventure");
    return null;
  }

  // ฟังก์ชันเดียวที่มี: กลับหน้าเลือกด่าน
  const handleExit = () => {
    navigate("/home/adventure");
  };

  return (
    <div style={{
      width: "100vw", height: "100vh",
      display: "flex", justifyContent: "center", alignItems: "center",
      background: "#000",
      flexDirection: "column",
      gap: "20px"
    }}>
      
      {/* =======================
          HEADER: WIN / LOSE
      ======================= */}
      <h1 style={{
          color: result === "WIN" ? "#f1c40f" : "#c0392b", // ทอง หรือ แดง
          fontSize: "4rem",
          textShadow: "0 0 20px rgba(0,0,0,0.8)",
          fontFamily: '"Cinzel", serif',
          textAlign: "center",
          margin: 0
      }}>
          {result === "WIN" ? "MISSION COMPLETE" : "GAME OVER"}
      </h1>

      {/* =======================
          REWARD INFO
      ======================= */}
      <div style={{ 
          color: "#fff", 
          fontSize: "1.5rem", 
          fontFamily: '"Cinzel", serif',
          background: "rgba(255,255,255,0.1)",
          padding: "20px 40px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.2)"
      }}>
          Coin Earned: <span style={{ color: "#f1c40f", fontSize: "2rem", fontWeight: "bold" }}>+{earnedCoins}</span>
      </div>

      {/* =======================
          (Optional) WORD LOG STATS
          เอาไว้ดูว่าใช้คำว่าอะไรไปบ้าง
      ======================= */}
      {wordLog && Object.keys(wordLog).length > 0 && (
         <div style={{ color: "#aaa", fontSize: "0.9rem" }}>
            Words Used: {Object.keys(wordLog).length} words
         </div>
      )}

      {/* =======================
          EXIT BUTTON
      ======================= */}
      <div style={{ marginTop: "20px", width: "220px" }}>
          {/* ปุ่มนี้ปุ่มเดียว จบ */}
          <button 
            onClick={handleExit} 
            style={{ 
                padding: "15px", 
                width: "100%", 
                fontSize: "20px", 
                cursor: "pointer",
                background: "#4a3b2a",
                color: "#d1c4b6",
                border: "2px solid #6b543a",
                fontFamily: '"Cinzel", serif'
            }}
          >
             RETURN TO MAP
          </button>
      </div>

    </div>
  );
}