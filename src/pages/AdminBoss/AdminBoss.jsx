// src/pages/AdminPage/AdminBoss.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminBoss.css";

import ServerControl from "./components/ServerControl";

import DictionaryPanel from "./panels/DictionaryPanel";
import MonsterPanel from "./panels/MonsterPanel";
import HeroPanel from "./panels/HeroPanel";
import StagePanel from "./panels/StagePanel";
import PlayerPanel from "./panels/PlayerPanel";

import { useAuthStore } from "../../store/useAuthStore";

const AdminBoss = () => {
  const [activeTab, setActiveTab] = useState("dictionary");
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();

  console.log("AdminBoss rendered", currentUser);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleGoGamePage = () => {
    navigate("/ ");
  };

  return (
    <div className="admin-container">
      <div className="pokedex-header">
        <div className="header-brand">
          <h1 className="pixel-title-small">ADMIN BOSS</h1>
        </div>

        <div className="header-server">
          <ServerControl serverId="hell" />

          <button
            className="server-mini-btn"
            onClick={handleGoGamePage}
            type="button"
            title="Go to Game Page"
          >
            🎮 GAME
          </button>
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
                className={`tab-btn ${activeTab === "players" ? "active" : ""}`}
                onClick={() => setActiveTab("players")}
              >
                👤 PLAYERS
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
          <PlayerPanel />
        )}
      </div>
    </div>
  );
};

export default AdminBoss;