// src/pages/AdminPage/AdminPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";

import ServerControl from "./components/ServerControl";

import DictionaryPanel from "./panels/DictionaryPanel";
import MonsterPanel from "./panels/MonsterPanel";
import HeroPanel from "./panels/HeroPanel";
import StagePanel from "./panels/StagePanel";
import MovePanel from "./panels/MovePanel";

import VisionHelper from "./components/VisionHelper";


const AdminPage = () => {
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
          <h1 className="pixel-title-small">ADMIN PANEL</h1>
          <ServerControl serverId="hell" />
          {/* --- Ai Read Image --- */}
          <VisionHelper />
        </div>

        <div className="header-right">
          <div className="header-actions">
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

              <button
                className="tab-btn logout-tab"
                onClick={handleLogout}
                type="button"
                title="Logout"
              >
                <span className="logout-dot" />
                LOGOUT
              </button>
              
            </div>
          </div>
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

export default AdminPage;
