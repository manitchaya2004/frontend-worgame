// src/pages/AdminPage/AdminPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminBoss.css";

import ServerControl from "./components/ServerControl";

import DictionaryPanel from "./panels/DictionaryPanel";
import MonsterPanel from "./panels/MonsterPanel";
import HeroPanel from "./panels/HeroPanel";
import StagePanel from "./panels/StagePanel";
import MovePanel from "./panels/MovePanel";

const AdminBoss = () => {
  const [activeTab, setActiveTab] = useState("dictionary");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <div className="admin-container">
      {/* --- HEADER --- */}
      <div className="pokedex-header">
        <div className="header-left">
          <h1 className="pixel-title-small">ADMIN BOSS</h1>
          <ServerControl serverId="hell" />
        </div>

        <div className="header-right">
          <div className="tab-group">
            <button
              className={`tab-btn ${activeTab === "dictionary" ? "active" : ""}`}
              onClick={() => setActiveTab("dictionary")}
            >
              📖 DICTIONARY
            </button>
            <button
              className={`tab-btn ${activeTab === "monster" ? "active" : ""}`}
              onClick={() => setActiveTab("monster")}
            >
              👹 MONSTERS
            </button>
            <button
              className={`tab-btn ${activeTab === "hero" ? "active" : ""}`}
              onClick={() => setActiveTab("hero")}
            >
              🧙 HEROES
            </button>
            <button
              className={`tab-btn ${activeTab === "stage" ? "active" : ""}`}
              onClick={() => setActiveTab("stage")}
            >
              🗺️ STAGES
            </button>
            <button
              className={`tab-btn move-tab ${activeTab === "move" ? "active" : ""}`}
              onClick={() => setActiveTab("move")}
            >
              ⚔️ MOVES
            </button>
          </div>

          {/* Logout */}
          <button className="tab-btn logout-btn" onClick={handleLogout}>
            🚪 LOGOUT
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="content-area">
        {activeTab === "dictionary" ? (
          <DictionaryPanel />
        ) : activeTab === "monster" ? (
          <MonsterPanel />
        ) : activeTab === "hero" ? (
          <HeroPanel />
        ) : activeTab === "stage" ? (
          <StagePanel />
        ) : (
          <MovePanel />
        )}
      </div>
    </div>
  );
};

export default AdminBoss;
