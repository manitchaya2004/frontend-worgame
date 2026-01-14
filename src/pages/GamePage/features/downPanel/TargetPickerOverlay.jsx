import React, { useEffect } from "react";

// ===============================
// Styles
// ===============================
const defaultStyles = {
  targetCard: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    background: "rgba(0,0,0,0.5)",
    borderRadius: "8px",
    cursor: "pointer",
    border: "2px solid #5c4033",
    width: "200px",
    transition: "transform 0.1s ease",
  },
};

// ===============================
// Component
// ===============================
export const TargetPickerOverlay = ({
  store,
  ipAddress,
  onClose,
  onSelectTarget,
}) => {
  // ⭐ เรียงศัตรูตามตำแหน่งในฉาก (ซ้าย → ขวา)
  const sortedEnemies = [...store.enemies]
    .filter((e) => e.hp > 0)
    .sort((a, b) => a.x - b.x);

  // ✅ เคลียร์ hover ตอน overlay ถูกถอด
  useEffect(() => {
    return () => {
      store.setHoveredEnemyId(null);
    };
  }, []);

  return (
    // ===== Overlay ครอบทั้ง bottom panel =====
    <div
      style={{
        position: "relative",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(26, 18, 11, 0.95)",
        zIndex: 10,
        width: "100%",
      }}
      // 🔥 FIX หลัก: เช็คเมาส์ทุกครั้งที่ขยับ
      onPointerMove={(e) => {
        const el = document.elementFromPoint(e.clientX, e.clientY);

        if (!el || !el.closest("[data-enemy-card]")) {
          store.setHoveredEnemyId(null);
        }
      }}
    >
      {/* ===== กล่องหลัก (Modal Box) ===== */}
      <div
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "705px",
          maxHeight: "85%",
          background: "#1a120b",
          border: "2px solid #5c4033",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "10px",
          boxShadow: "0 8px 0 #000",
        }}
      >
        {/* ===== Header ===== */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
            borderBottom: "2px solid #5c4033",
            paddingBottom: "10px",
          }}
        >
          <h3
            style={{
              color: "#ffeb3b",
              margin: 0,
              fontSize: "1.4rem",
              textShadow: "2px 2px 0px #000",
              letterSpacing: "2px",
            }}
          >
            SELECT TARGET
          </h3>

          <div
            style={{
              background: "#ff4757",
              color: "#fff",
              border: "2px solid #fff",
              borderRadius: "6px",
              padding: "5px 15px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "12px",
              boxShadow: "0 2px 0 #000",
            }}
            onClick={() => {
              store.setHoveredEnemyId(null);
              onClose();
            }}
          >
            CLOSE [X]
          </div>
        </div>

        {/* ===== Enemy List ===== */}
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            overflowY: "auto",
            paddingRight: "5px",
          }}
        >
          {sortedEnemies.map((en) => (
            <div
              key={en.id}
              data-enemy-card
              onClick={() => onSelectTarget(en.id)}
              style={defaultStyles.targetCard}
              onPointerEnter={() => store.setHoveredEnemyId(en.id)}
            >
              {/* Enemy Image */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "6px",
                  marginRight: "12px",
                  overflow: "hidden",
                  border: "2px solid #57606f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={`${ipAddress}/img_monster/${en.monster_id}-idle-${store.animFrame}.png`}
                  alt={en.name}
                  style={{
                    width: "110%",
                    height: "110%",
                    objectFit: "contain",
                    imageRendering: "pixelated",
                  }}
                />
              </div>

              {/* Enemy Info */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {en.name}
                </span>

                {/* HP Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    background: "#1e272e",
                    borderRadius: "5px",
                    overflow: "hidden",
                    border: "1px solid #000",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(en.hp / en.max_hp) * 100}%`,
                      transition:
                        "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      backgroundColor:
                        (en.hp / en.max_hp) * 100 > 45
                          ? "#4cd137"
                          : "#ff4757",
                    }}
                  />
                </div>

                <span
                  style={{
                    color: "#ced6e0",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  {Math.ceil(en.hp)} / {en.max_hp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
