// src/pages/AdminPage/AdminPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import "./AdminPage.css";

// ⚠️ IP ของ Backend
const API_URL = "http://26.23.130.235:3000";

// ------------------------------
// 🖼️ Sprite loop component
// ------------------------------
const MonsterSpriteLoop = ({ id }) => {
  const frames = [
    `${API_URL}/img_monster/${id}-attack-1.png`,
    `${API_URL}/img_monster/${id}-attack-2.png`,
    `${API_URL}/img_monster/${id}-idle-1.png`,
    `${API_URL}/img_monster/${id}-idle-2.png`,
  ];

  const [idx, setIdx] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setHide(false);
    setIdx(0);
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % frames.length), 250);
    return () => clearInterval(t);
  }, []);

  if (hide) return <span style={{ color: "#777", fontSize: 12 }}>No Sprite</span>;

  return (
    <img
      src={frames[idx]}
      alt={`${id} sprite`}
      style={{
        width: 64,
        height: 64,
        imageRendering: "pixelated",
        background: "#111",
        borderRadius: 6,
        border: "1px solid #333",
      }}
      onError={() => setHide(true)}
    />
  );
};

const HeroSpriteLoop = ({ id }) => {
  const frames = [
    `${API_URL}/img_hero/${id}-attack-1.png`,
    `${API_URL}/img_hero/${id}-attack-2.png`,
    `${API_URL}/img_hero/${id}-idle-1.png`,
    `${API_URL}/img_hero/${id}-idle-2.png`,
    `${API_URL}/img_hero/${id}-walk-1.png`,
    `${API_URL}/img_hero/${id}-walk-2.png`,
    `${API_URL}/img_hero/${id}-guard-1.png`,
  ];

  const [idx, setIdx] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setHide(false);
    setIdx(0);
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % frames.length), 220);
    return () => clearInterval(t);
  }, []);

  if (hide) return <span style={{ color: "#777", fontSize: 12 }}>No Sprite</span>;

  return (
    <img
      src={frames[idx]}
      alt={`${id} hero sprite`}
      style={{
        width: 64,
        height: 64,
        imageRendering: "pixelated",
        background: "#111",
        borderRadius: 6,
        border: "1px solid #333",
      }}
      onError={() => setHide(true)}
    />
  );
};


const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dictionary"); // 'dictionary' | 'monster'

  return (
    <div className="admin-container">
      {/* --- HEADER --- */}
      <div className="pokedex-header">
        <h1 className="pixel-title-small">ADMIN PANEL</h1>
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
        ) : (
          <StagePanel />
        )}
      </div>

    </div>
  );
};

// ============================================
// 📖 PART 1: Dictionary Panel
// ============================================
const DictionaryPanel = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedLetter, setSelectedLetter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterLength, setFilterLength] = useState("");

  // Form
  const [formData, setFormData] = useState({ word: "", type: "", meaning: "", level: "" });
  const [isEditing, setIsEditing] = useState(false);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const fetchWordsQuery = useCallback(async () => {
    setLoading(true);
    try {
      const payload = { limit: 100 };
      if (searchText) payload.startsWith = searchText;
      else if (selectedLetter) payload.startsWith = selectedLetter;
      if (filterLevel) payload.level = filterLevel;
      if (filterLength) payload.length = Number(filterLength);

      const res = await fetch(`${API_URL}/dict/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json();
      let resultData = Array.isArray(responseData) ? responseData : (responseData.data || []);
      setWords(resultData);
    } catch (error) {
      console.error("Error fetching words:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedLetter, searchText, filterLevel, filterLength]);

  useEffect(() => {
    fetchWordsQuery();
  }, [fetchWordsQuery]);

  const handleLetterClick = (letter) => {
    if (selectedLetter === letter) {
      setSelectedLetter("");
    } else {
      setSelectedLetter(letter);
      setSearchText("");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API_URL}/dict/${formData.word}` : `${API_URL}/dict`;

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Operation failed");

      setFormData({ word: "", type: "", meaning: "", level: "" });
      setIsEditing(false);
      fetchWordsQuery();
      alert(isEditing ? "แก้ไขสำเร็จ!" : "เพิ่มคำศัพท์สำเร็จ!");
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleEditClick = (wordObj) => {
    setFormData({ ...wordObj });
    setIsEditing(true);
    document.querySelector(".form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (wordToDelete) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบคำว่า "${wordToDelete}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/dict/${wordToDelete}`, { method: "DELETE" });
      if (res.ok) fetchWordsQuery();
      else alert("ลบไม่สำเร็จ");
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const filteredWords = words.filter((word) => !filterType || word.type === filterType);

  return (
    <div>
      <form className="form-box" onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="text"
          name="word"
          placeholder="Word"
          value={formData.word}
          onChange={handleChange}
          required
          disabled={isEditing}
        />
        <select className="input-field" name="type" value={formData.type} onChange={handleChange} required>
          <option value="" disabled>
            Select Type...
          </option>
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adjective">Adjective</option>
          <option value="adverb">Adverb</option>
        </select>
        <input
          className="input-field"
          type="text"
          name="meaning"
          placeholder="Meaning"
          value={formData.meaning}
          onChange={handleChange}
          required
        />
        <select className="input-field" name="level" value={formData.level} onChange={handleChange} required>
          <option value="" disabled>
            Select Level...
          </option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
        </select>
        <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`}>
          {isEditing ? "Update Word" : "Add Word"}
        </button>
        {isEditing && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setIsEditing(false);
              setFormData({ word: "", type: "", meaning: "", level: "" });
            }}
            style={{ backgroundColor: "#666" }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="filter-section">
        <div className="alphabet-grid">
          {alphabet.map((letter) => (
            <button
              key={letter}
              className={`letter-btn ${selectedLetter === letter ? "active" : ""}`}
              onClick={() => handleLetterClick(letter)}
            >
              {letter}
            </button>
          ))}
          <button
            className={`letter-btn ${selectedLetter === "" ? "active" : ""}`}
            onClick={() => setSelectedLetter("")}
            style={{ gridColumn: "span 2" }}
          >
            ALL
          </button>
        </div>
        <div className="search-controls">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search word..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select className="filter-select" onChange={(e) => setFilterType(e.target.value)} value={filterType}>
            <option value="">All Types</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
          </select>
          <select className="filter-select" onChange={(e) => setFilterLevel(e.target.value)} value={filterLevel}>
            <option value="">All Levels</option>
            <option value="A1">Level A1</option>
            <option value="A2">Level A2</option>
            <option value="B1">Level B1</option>
            <option value="B2">Level B2</option>
          </select>
          <select className="filter-select" onChange={(e) => setFilterLength(e.target.value)} value={filterLength}>
            <option value="">Any Length</option>
            <option value="3">3 Chars</option>
            <option value="4">4 Chars</option>
            <option value="5">5 Chars</option>
            <option value="6">6 Chars</option>
            <option value="7">7+ Chars</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : (
          <table className="dict-table">
            <thead>
              <tr>
                <th>Word</th>
                <th>Type</th>
                <th>Meaning</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((item) => (
                <tr key={item.word}>
                  <td>
                    <strong>{item.word}</strong>
                  </td>
                  <td>
                    <span style={{ color: "#aaa" }}>{item.type}</span>
                  </td>
                  <td>{item.meaning}</td>
                  <td>LV. {item.level}</td>
                  <td className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEditClick(item)}>
                      Edit
                    </button>
                    <button className="btn btn-delete" onClick={() => handleDelete(item.word)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredWords.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    No words found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ============================================
// 👹 PART 2: Monster Panel
// ============================================
const MonsterPanel = () => {
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ ไฟล์รูป 4 รูป
  const [spriteFiles, setSpriteFiles] = useState({
    attack1: null,
    attack2: null,
    idle1: null,
    idle2: null,
  });

  const handleSpriteChange = (key, file) => {
    setSpriteFiles((prev) => ({ ...prev, [key]: file }));
  };

  const resetSpriteFiles = () => {
    setSpriteFiles({ attack1: null, attack2: null, idle1: null, idle2: null });
  };

  // ค่า Default ของ Moves
  const defaultMoves = [
    {
      pattern_no: 1,
      moves: [
        { pattern_order: 1, pattern_move: "attack" },
        { pattern_order: 2, pattern_move: "wait" },
      ],
    },
  ];

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    max_hp: "",
    atk_power_min: "",
    atk_power_max: "",
    armor: "",
    exp: "",
    speed: "",
    description: "",
    monster_moves: defaultMoves,
  });

  const fetchMonsters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/monster`);
      if (!res.ok) throw new Error("Failed to fetch monsters");
      const data = await res.json();
      setMonsters(data);
    } catch (error) {
      console.error("Error fetching monsters:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonsters();
  }, [fetchMonsters]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMoveChange = (patternIndex, moveIndex, field, value) => {
    const newMoves = [...formData.monster_moves];
    newMoves[patternIndex].moves[moveIndex][field] = value;
    setFormData({ ...formData, monster_moves: newMoves });
  };

  const addMove = (patternIndex) => {
    const newMoves = [...formData.monster_moves];
    const currentMoves = newMoves[patternIndex].moves;
    const nextOrder = currentMoves.length > 0 ? currentMoves[currentMoves.length - 1].pattern_order + 1 : 1;

    currentMoves.push({ pattern_order: nextOrder, pattern_move: "wait" });
    setFormData({ ...formData, monster_moves: newMoves });
  };

  const removeMove = (patternIndex, moveIndex) => {
    const newMoves = [...formData.monster_moves];
    newMoves[patternIndex].moves.splice(moveIndex, 1);
    setFormData({ ...formData, monster_moves: newMoves });
  };

  const addPattern = () => {
    const newMoves = [...formData.monster_moves];
    const nextPatternNo = newMoves.length > 0 ? newMoves[newMoves.length - 1].pattern_no + 1 : 1;

    newMoves.push({
      pattern_no: nextPatternNo,
      moves: [{ pattern_order: 1, pattern_move: "wait" }],
    });
    setFormData({ ...formData, monster_moves: newMoves });
  };

  const removePattern = (patternIndex) => {
    const newMoves = [...formData.monster_moves];
    newMoves.splice(patternIndex, 1);
    setFormData({ ...formData, monster_moves: newMoves });
  };

  // ✅ upload sprites (ต้องครบ 4 รูป)
  const uploadSpritesStrict4 = async (monsterId) => {
    const fd = new FormData();
    fd.append("attack1", spriteFiles.attack1);
    fd.append("attack2", spriteFiles.attack2);
    fd.append("idle1", spriteFiles.idle1);
    fd.append("idle2", spriteFiles.idle2);

    const up = await fetch(`${API_URL}/monster/${monsterId}/sprites`, {
      method: "POST",
      body: fd,
    });

    if (!up.ok) {
      const err = await up.json().catch(() => ({}));
      throw new Error(err.message || "sprite upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: formData.id,
      name: formData.name,
      max_hp: Number(formData.max_hp),
      atk_power_min: Number(formData.atk_power_min),
      atk_power_max: Number(formData.atk_power_max),
      armor: Number(formData.armor),
      exp: Number(formData.exp),
      speed: formData.speed ? Number(formData.speed) : null,
      description: formData.description || null,
      monster_moves: formData.monster_moves,
    };

    try {
      let url = `${API_URL}/monster`;
      let method = "POST";

      if (isEditing) {
        url = `${API_URL}/monster/${formData.id}`;
        method = "PUT";
      }

      // ✅ ตอน Create ต้องมีรูปครบ 4
      if (!isEditing) {
        const missing = Object.entries(spriteFiles)
          .filter(([, f]) => !f)
          .map(([k]) => k);
        if (missing.length > 0) {
          alert(`ต้องอัปโหลดรูปครบ 4 รูปก่อนสร้างมอนสเตอร์ (ขาด: ${missing.join(", ")})`);
          return;
        }
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Save failed");
      }

      // ✅ อัปโหลด sprites: ตอน Create จะส่งเสมอ (ครบ 4)
      // ตอน Edit: ถ้าคุณอยากให้แก้รูปได้ ก็ให้เลือกไฟล์ใหม่ครบ 4 แล้วกด Update
      if (!isEditing) {
        await uploadSpritesStrict4(formData.id);
      } else {
        // โหมดแก้ไข: ถ้าคุณเลือกไฟล์ครบ 4 ค่อยอัปโหลด (ถ้าไม่ครบ ไม่ทำ)
        const all4 = Object.values(spriteFiles).every(Boolean);
        if (all4) await uploadSpritesStrict4(formData.id);
      }

      alert(isEditing ? "Monster Updated!" : "Monster Created!");

      setFormData({
        id: "",
        name: "",
        max_hp: "",
        atk_power_min: "",
        atk_power_max: "",
        armor: "",
        exp: "",
        speed: "",
        description: "",
        monster_moves: defaultMoves,
      });
      resetSpriteFiles();
      setIsEditing(false);
      fetchMonsters();
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEdit = (m) => {
    setFormData({
      id: m.id,
      name: m.name,
      max_hp: m.max_hp,
      atk_power_min: m.atk_power_min,
      atk_power_max: m.atk_power_max,
      armor: m.armor,
      exp: m.exp,
      speed: m.speed ?? "",
      description: m.description ?? "",
      monster_moves: m.monster_moves && m.monster_moves.length > 0 ? m.monster_moves : defaultMoves,
    });
    resetSpriteFiles(); // ให้ผู้ใช้เลือกไฟล์ใหม่ (ถ้าจะอัปเดต sprite)
    setIsEditing(true);
    document.querySelector(".form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Monster ID: ${id}?`)) return;
    try {
      const res = await fetch(`${API_URL}/monster/${id}`, { method: "DELETE" });
      if (res.ok) fetchMonsters();
      else alert("Delete failed");
    } catch (err) {
      alert("Error deleting monster");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      name: "",
      max_hp: "",
      atk_power_min: "",
      atk_power_max: "",
      armor: "",
      exp: "",
      speed: "",
      description: "",
      monster_moves: defaultMoves,
    });
    resetSpriteFiles();
  };

  return (
    <div>
      <form className="form-box monster-mode" onSubmit={handleSubmit}>
        <h3
          style={{
            width: "100%",
            margin: "0 0 15px 0",
            color: "#d32f2f",
            textAlign: "center",
            fontFamily: '"Press Start 2P"',
          }}
        >
          {isEditing ? `EDITING: ${formData.id}` : "NEW MONSTER"}
        </h3>

        {/* Basic Stats */}
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <input
            className="input-field"
            name="id"
            placeholder="ID (e.g. goblin)"
            value={formData.id}
            onChange={handleChange}
            required
            disabled={isEditing}
            style={{ flex: 1 }}
          />
          <input
            className="input-field"
            name="name"
            placeholder="Name (e.g. Rob Goblin)"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ flex: 2 }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", width: "100%", flexWrap: "wrap" }}>
          <input className="input-field" type="number" name="max_hp" placeholder="Max HP" value={formData.max_hp} onChange={handleChange} required style={{ flex: 1 }} />
          <input className="input-field" type="number" name="atk_power_min" placeholder="Min ATK" value={formData.atk_power_min} onChange={handleChange} required style={{ flex: 1 }} />
          <input className="input-field" type="number" name="atk_power_max" placeholder="Max ATK" value={formData.atk_power_max} onChange={handleChange} required style={{ flex: 1 }} />
          <input className="input-field" type="number" name="armor" placeholder="Armor" value={formData.armor} onChange={handleChange} required style={{ flex: 1 }} />
          <input className="input-field" type="number" name="exp" placeholder="EXP Drop" value={formData.exp} onChange={handleChange} required style={{ flex: 1 }} />
          <input className="input-field" type="number" name="speed" placeholder="Speed" value={formData.speed} onChange={handleChange} style={{ flex: 1 }} />
        </div>

        <input className="input-field" name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={{ width: "100%" }} />

        {/* ✅ Sprite Upload 4 รูป */}
        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          <div style={{ width: "100%", color: "#aaa", fontSize: 14 }}>
            Monster Sprites (ต้องมี 4 รูป) — Attack x2, Idle x2
            {isEditing && <span style={{ color: "#777" }}> (แก้รูป: เลือกใหม่ให้ครบ 4 แล้วกด UPDATE)</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "#888" }}>attack1</label>
            <input type="file" accept="image/*" required={!isEditing} onChange={(e) => handleSpriteChange("attack1", e.target.files?.[0] || null)} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "#888" }}>attack2</label>
            <input type="file" accept="image/*" required={!isEditing} onChange={(e) => handleSpriteChange("attack2", e.target.files?.[0] || null)} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "#888" }}>idle1</label>
            <input type="file" accept="image/*" required={!isEditing} onChange={(e) => handleSpriteChange("idle1", e.target.files?.[0] || null)} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "#888" }}>idle2</label>
            <input type="file" accept="image/*" required={!isEditing} onChange={(e) => handleSpriteChange("idle2", e.target.files?.[0] || null)} />
          </div>
        </div>

        {/* Moves */}
        <div className="moves-container">
          <label style={{ color: "#aaa", fontSize: "14px" }}>Monster Attack Patterns:</label>

          {formData.monster_moves.map((pattern, pIndex) => (
            <div key={pIndex} className="pattern-card">
              <div className="pattern-header">
                <span style={{ fontWeight: "bold", color: "#fca311" }}>Pattern #{pattern.pattern_no}</span>
                <button type="button" className="btn-small btn-remove" onClick={() => removePattern(pIndex)}>
                  Remove Pattern
                </button>
              </div>

              {pattern.moves.map((move, mIndex) => (
                <div key={mIndex} className="move-row">
                  <label style={{ fontSize: "12px", color: "#888" }}>Order:</label>
                  <input
                    type="number"
                    style={{ width: "50px" }}
                    value={move.pattern_order}
                    onChange={(e) => handleMoveChange(pIndex, mIndex, "pattern_order", Number(e.target.value))}
                  />

                  <label style={{ fontSize: "12px", color: "#888" }}>Move:</label>
                  <select
                    value={move.pattern_move}
                    onChange={(e) => handleMoveChange(pIndex, mIndex, "pattern_move", e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="attack">Attack</option>
                    <option value="wait">Wait</option>
                    <option value="guard">Guard</option>
                    <option value="skill">Skill</option>
                  </select>

                  <button type="button" className="btn-small btn-remove" onClick={() => removeMove(pIndex, mIndex)}>
                    X
                  </button>
                </div>
              ))}

              <button type="button" className="btn-small btn-add-move" onClick={() => addMove(pIndex)}>
                + Add Move
              </button>
            </div>
          ))}

          <button type="button" className="btn btn-add-pattern" onClick={addPattern}>
            + ADD NEW PATTERN
          </button>
        </div>

        <div style={{ width: "100%", display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
          <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`} style={{ flex: 1 }}>
            {isEditing ? "UPDATE DATA" : "SPAWN MONSTER"}
          </button>
          {isEditing && (
            <button type="button" className="btn" onClick={handleCancel} style={{ background: "#555", flex: 1 }}>
              CANCEL
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading Monsters...</p>
        ) : (
          <table className="dict-table monster-theme">
            <thead>
              <tr>
                <th>Sprite</th>
                <th>ID</th>
                <th>Name</th>
                <th>Stats (HP / ATK / DEF)</th>
                <th>EXP / SPD</th>
                <th>Desc</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {monsters.map((m) => (
                <tr key={m.id}>
                  <td>
                    <MonsterSpriteLoop id={m.id} />
                  </td>
                  <td style={{ fontFamily: "monospace", color: "#ff9999" }}>{m.id}</td>
                  <td>
                    <strong>{m.name}</strong>
                  </td>
                  <td>
                    <div style={{ fontSize: "12px" }}>
                      <span style={{ color: "#ff5555" }}>❤ {m.max_hp}</span> |{" "}
                      <span style={{ color: "#ffaa00" }}> ⚔ {m.atk_power_min}-{m.atk_power_max}</span> |{" "}
                      <span style={{ color: "#55aaff" }}> 🛡 {m.armor}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "12px" }}>
                      <span style={{ color: "#ffd700" }}>✨ {m.exp}</span> <br />
                      <span style={{ color: "#888" }}>👟 {m.speed ?? "-"}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: "12px", color: "#ccc", maxWidth: "200px" }}>{m.description ?? "-"}</td>
                  <td className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEdit(m)}>
                      Edit
                    </button>
                    <button className="btn btn-delete" onClick={() => handleDelete(m.id)}>
                      Del
                    </button>
                  </td>
                </tr>
              ))}
              {monsters.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                    No Monsters Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
const HeroPanel = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [spriteFiles, setSpriteFiles] = useState({
    attack1: null,
    attack2: null,
    idle1: null,
    idle2: null,
    walk1: null,
    walk2: null,
    guard1: null,
  });

  const resetSpriteFiles = () =>
    setSpriteFiles({ attack1: null, attack2: null, idle1: null, idle2: null, walk1: null, walk2: null, guard1: null });

  const handleSpriteChange = (key, file) => setSpriteFiles((prev) => ({ ...prev, [key]: file }));

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    base_str: "",
    base_dex: "",
    base_int: "",
    base_con: "",
    base_faith: "",
    base_luck: "",
    talk_win: "",
    talk_clear_stage: "",
  });

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/hero`);
      if (!res.ok) throw new Error("Failed to fetch heroes");
      const data = await res.json();
      setHeroes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const uploadSpritesStrict7 = async (heroId) => {
    const fd = new FormData();
    fd.append("attack1", spriteFiles.attack1);
    fd.append("attack2", spriteFiles.attack2);
    fd.append("idle1", spriteFiles.idle1);
    fd.append("idle2", spriteFiles.idle2);
    fd.append("walk1", spriteFiles.walk1);
    fd.append("walk2", spriteFiles.walk2);
    fd.append("guard1", spriteFiles.guard1);

    const up = await fetch(`${API_URL}/hero/${heroId}/sprites`, { method: "POST", body: fd });
    if (!up.ok) {
      const err = await up.json().catch(() => ({}));
      throw new Error(err.message || "hero sprite upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: formData.id,
      name: formData.name,
      price: Number(formData.price),
      description: formData.description || null,
      base_str: Number(formData.base_str),
      base_dex: Number(formData.base_dex),
      base_int: Number(formData.base_int),
      base_con: Number(formData.base_con),
      base_faith: Number(formData.base_faith),
      base_luck: formData.base_luck === "" ? null : Number(formData.base_luck),
      talk_win: formData.talk_win || null,
      talk_clear_stage: formData.talk_clear_stage || null,
    };

    try {
      let url = `${API_URL}/hero`;
      let method = "POST";

      if (isEditing) {
        url = `${API_URL}/hero/${formData.id}`;
        method = "PUT";
      }

      // ✅ Create ต้องครบ 7 รูป
      if (!isEditing) {
        const missing = Object.entries(spriteFiles).filter(([, f]) => !f).map(([k]) => k);
        if (missing.length > 0) {
          alert(`ต้องอัปโหลดรูปครบ 7 รูปก่อนสร้าง Hero (ขาด: ${missing.join(", ")})`);
          return;
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Save failed");
      }

      // ✅ Create: upload เสมอ (ครบ 7)
      // ✅ Edit: ถ้าเลือกไฟล์ครบ 7 ค่อยอัปโหลดทับ
      if (!isEditing) {
        await uploadSpritesStrict7(formData.id);
      } else {
        const all7 = Object.values(spriteFiles).every(Boolean);
        if (all7) await uploadSpritesStrict7(formData.id);
      }

      alert(isEditing ? "Hero Updated!" : "Hero Created!");

      setFormData({
        id: "",
        name: "",
        price: "",
        description: "",
        base_str: "",
        base_dex: "",
        base_int: "",
        base_con: "",
        base_faith: "",
        base_luck: "",
        talk_win: "",
        talk_clear_stage: "",
      });
      resetSpriteFiles();
      setIsEditing(false);
      fetchHeroes();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (h) => {
    setFormData({
      id: h.id,
      name: h.name,
      price: h.price,
      description: h.description ?? "",
      base_str: h.base_str,
      base_dex: h.base_dex,
      base_int: h.base_int,
      base_con: h.base_con,
      base_faith: h.base_faith,
      base_luck: h.base_luck ?? "",
      talk_win: h.talk_win ?? "",
      talk_clear_stage: h.talk_clear_stage ?? "",
    });
    resetSpriteFiles();
    setIsEditing(true);
    document.querySelector(".form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Hero ID: ${id}?`)) return;
    try {
      const res = await fetch(`${API_URL}/hero/${id}`, { method: "DELETE" });
      if (res.ok) fetchHeroes();
      else alert("Delete failed");
    } catch {
      alert("Error deleting hero");
    }
  };

  const handleDeleteSprites = async (id) => {
    if (!window.confirm(`Delete ALL sprites of Hero ID: ${id}?`)) return;
    try {
      const res = await fetch(`${API_URL}/hero/${id}/sprites`, { method: "DELETE" });
      if (res.ok) {
        alert("Sprites deleted");
        fetchHeroes();
      } else alert("Delete sprites failed");
    } catch {
      alert("Error deleting sprites");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      name: "",
      price: "",
      description: "",
      base_str: "",
      base_dex: "",
      base_int: "",
      base_con: "",
      base_faith: "",
      base_luck: "",
      talk_win: "",
      talk_clear_stage: "",
    });
    resetSpriteFiles();
  };

  return (
    <div>
      <form className="form-box" onSubmit={handleSubmit} style={{ borderColor: "#2b6cb0" }}>
        <h3
          style={{
            width: "100%",
            margin: "0 0 15px 0",
            color: "#2b6cb0",
            textAlign: "center",
            fontFamily: '"Press Start 2P"',
          }}
        >
          {isEditing ? `EDITING HERO: ${formData.id}` : "NEW HERO"}
        </h3>

        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <input className="input-field" name="id" placeholder="ID (e.g. sir-nick)" value={formData.id} onChange={handleChange} required disabled={isEditing} style={{ flex: 1 }} />
          <input className="input-field" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required style={{ flex: 2 }} />
          <input className="input-field" type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required style={{ flex: 1 }} />
        </div>

        <input className="input-field" name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={{ width: "100%" }} />

        <div style={{ display: "flex", gap: "10px", width: "100%", flexWrap: "wrap" }}>
          <input className="input-field" type="number" name="base_str" placeholder="STR" value={formData.base_str} onChange={handleChange} required />
          <input className="input-field" type="number" name="base_dex" placeholder="DEX" value={formData.base_dex} onChange={handleChange} required />
          <input className="input-field" type="number" name="base_int" placeholder="INT" value={formData.base_int} onChange={handleChange} required />
          <input className="input-field" type="number" name="base_con" placeholder="CON" value={formData.base_con} onChange={handleChange} required />
          <input className="input-field" type="number" name="base_faith" placeholder="FAITH" value={formData.base_faith} onChange={handleChange} required />
          <input className="input-field" type="number" name="base_luck" placeholder="LUCK (optional)" value={formData.base_luck} onChange={handleChange} />
        </div>

        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <input className="input-field" name="talk_win" placeholder="talk_win (optional)" value={formData.talk_win} onChange={handleChange} style={{ flex: 1 }} />
          <input className="input-field" name="talk_clear_stage" placeholder="talk_clear_stage (optional)" value={formData.talk_clear_stage} onChange={handleChange} style={{ flex: 1 }} />
        </div>

        {/* ✅ Sprite Upload 7 */}
        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          <div style={{ width: "100%", color: "#aaa", fontSize: 14 }}>
            Hero Sprites (ต้องมี 7 รูป) — Attack x2, Idle x2, Walk x2, Guard x1
            {isEditing && <span style={{ color: "#777" }}> (แก้รูป: เลือกใหม่ให้ครบ 7 แล้วกด UPDATE)</span>}
          </div>

          {Object.keys(spriteFiles).map((k) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, color: "#888" }}>{k}</label>
              <input type="file" accept="image/*" required={!isEditing} onChange={(e) => handleSpriteChange(k, e.target.files?.[0] || null)} />
            </div>
          ))}
        </div>

        <div style={{ width: "100%", display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
          <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`} style={{ flex: 1 }}>
            {isEditing ? "UPDATE HERO" : "CREATE HERO"}
          </button>
          {isEditing && (
            <button type="button" className="btn" onClick={handleCancel} style={{ background: "#555", flex: 1 }}>
              CANCEL
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading Heroes...</p>
        ) : (
          <table className="dict-table">
            <thead>
              <tr>
                <th>Sprite</th>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Base Stats</th>
                <th>Desc</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {heroes.map((h) => (
                <tr key={h.id}>
                  <td><HeroSpriteLoop id={h.id} /></td>
                  <td style={{ fontFamily: "monospace", color: "#9ad0ff" }}>{h.id}</td>
                  <td><strong>{h.name}</strong></td>
                  <td>{h.price}</td>
                  <td style={{ fontSize: 12, color: "#ccc" }}>
                    STR {h.base_str} | DEX {h.base_dex} | INT {h.base_int} | CON {h.base_con} | FAITH {h.base_faith} | LUCK {h.base_luck ?? "-"}
                  </td>
                  <td style={{ fontSize: 12, color: "#ccc", maxWidth: 200 }}>{h.description ?? "-"}</td>
                  <td className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEdit(h)}>Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(h.id)}>Del</button>
                    <button className="btn" style={{ background: "#444", color: "#fff" }} onClick={() => handleDeleteSprites(h.id)}>
                      Del Sprites
                    </button>
                  </td>
                </tr>
              ))}
              {heroes.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>No Heroes Found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ============================================
// 🗺️ PART 4: Stage + Spawn Panel (CRUD ครบ)
// ============================================

const StagePanel = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // spawn panel
  const [selectedStageId, setSelectedStageId] = useState("");
  const [showSpawn, setShowSpawn] = useState(false);

  // stage form
  const [formData, setFormData] = useState({
    id: "",
    orderNo: "",
    name: "",
    description: "",
    money_reward: "",
    distant_goal: "",
  });

  const fetchStages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/getAllStage`);
      if (!res.ok) throw new Error("Failed to fetch stages");
      const data = await res.json();
      setStages(data);
    } catch (e) {
      console.error(e);
      alert("Fetch stages failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      orderNo: "",
      name: "",
      description: "",
      money_reward: "",
      distant_goal: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: formData.id,
      orderNo: Number(formData.orderNo),
      name: formData.name,
      description: formData.description || null,
      money_reward: formData.money_reward === "" ? null : Number(formData.money_reward),
      distant_goal: formData.distant_goal === "" ? null : Number(formData.distant_goal),
    };

    try {
      let url = `${API_URL}/stage`;
      let method = "POST";
      if (isEditing) {
        url = `${API_URL}/stage/${formData.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Save stage failed");
      }

      alert(isEditing ? "Stage Updated!" : "Stage Created!");
      resetForm();
      fetchStages();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (s) => {
    setIsEditing(true);
    setFormData({
      id: s.id,
      orderNo: s.orderNo ?? "",
      name: s.name ?? "",
      description: s.description ?? "",
      money_reward: s.money_reward ?? "",
      distant_goal: s.distant_goal ?? "",
    });
    document.querySelector(".form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Stage: ${id} ?\n(จะลบ spawn ในด่านนี้ด้วย)`)) return;

    try {
      const res = await fetch(`${API_URL}/stage/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Delete stage failed");
      }

      // ถ้าลบด่านที่กำลังเลือกอยู่ ปิด spawn panel
      if (selectedStageId === id) {
        setSelectedStageId("");
        setShowSpawn(false);
      }

      alert("Stage Deleted!");
      fetchStages();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const openSpawn = (stageId) => {
    setSelectedStageId(stageId);
    setShowSpawn(true);
    setTimeout(() => document.getElementById("spawn-panel")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // (optional) แสดงรูป map ถ้าคุณมีไฟล์ใน img_map เช่น green-grass-1.png
  const MapThumb = ({ id }) => {
    const url = `${API_URL}/img_map/${id}.png`;
    const [hide, setHide] = useState(false);
    if (hide) return <span style={{ color: "#777", fontSize: 12 }}>No Map</span>;
    return (
      <img
        src={url}
        alt={`${id} map`}
        style={{ width: 120, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #333" }}
        onError={() => setHide(true)}
      />
    );
  };

  return (
    <div>
      {/* ===== Stage Form ===== */}
      <form className="form-box" onSubmit={handleSubmit} style={{ borderColor: "#2f855a" }}>
        <h3
          style={{
            width: "100%",
            margin: "0 0 15px 0",
            color: "#2f855a",
            textAlign: "center",
            fontFamily: '"Press Start 2P"',
          }}
        >
          {isEditing ? `EDITING STAGE: ${formData.id}` : "NEW STAGE"}
        </h3>

        <div style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}>
          <input
            className="input-field"
            name="id"
            placeholder="ID (e.g. green-grass-1)"
            value={formData.id}
            onChange={handleChange}
            required
            disabled={isEditing}
            style={{ flex: 2, minWidth: 220 }}
          />
          <input
            className="input-field"
            type="number"
            name="orderNo"
            placeholder="OrderNo"
            value={formData.orderNo}
            onChange={handleChange}
            required
            style={{ flex: 1, minWidth: 140 }}
          />
        </div>

        <input className="input-field" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required style={{ width: "100%" }} />
        <input className="input-field" name="description" placeholder="Description (optional)" value={formData.description} onChange={handleChange} style={{ width: "100%" }} />

        <div style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}>
          <input
            className="input-field"
            type="number"
            name="money_reward"
            placeholder="money_reward (optional)"
            value={formData.money_reward}
            onChange={handleChange}
            style={{ flex: 1, minWidth: 200 }}
          />
          <input
            className="input-field"
            type="number"
            name="distant_goal"
            placeholder="distant_goal (optional)"
            value={formData.distant_goal}
            onChange={handleChange}
            style={{ flex: 1, minWidth: 200 }}
          />
        </div>

        <div style={{ width: "100%", display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`} style={{ flex: 1 }}>
            {isEditing ? "UPDATE STAGE" : "CREATE STAGE"}
          </button>
          {isEditing && (
            <button type="button" className="btn" onClick={resetForm} style={{ background: "#555", flex: 1 }}>
              CANCEL
            </button>
          )}
        </div>
      </form>

      {/* ===== Stage Table ===== */}
      <div className="table-wrapper">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading Stages...</p>
        ) : (
          <table className="dict-table">
            <thead>
              <tr>
                <th>Map</th>
                <th>ID</th>
                <th>Order</th>
                <th>Name</th>
                <th>Reward/Goal</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((s) => (
                <tr key={s.id}>
                  <td><MapThumb id={s.id} /></td>
                  <td style={{ fontFamily: "monospace", color: "#9ae6b4" }}>{s.id}</td>
                  <td>{s.orderNo}</td>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ fontSize: 12, color: "#ccc" }}>
                    💰 {s.money_reward ?? "-"} | 🎯 {s.distant_goal ?? "-"}
                  </td>
                  <td style={{ fontSize: 12, color: "#ccc", maxWidth: 260 }}>{s.description ?? "-"}</td>
                  <td className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEdit(s)}>Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(s.id)}>Del</button>
                    <button className="btn" style={{ background: "#2f855a", color: "#fff" }} onClick={() => openSpawn(s.id)}>
                      Spawns
                    </button>
                  </td>
                </tr>
              ))}
              {stages.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: 20 }}>No Stages Found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== Spawn Panel ===== */}
      {showSpawn && selectedStageId && (
        <div id="spawn-panel" style={{ marginTop: 18 }}>
          <SpawnPanel stageId={selectedStageId} />
        </div>
      )}
    </div>
  );
};

const SpawnPanel = ({ stageId }) => {
  const [spawns, setSpawns] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // spawn form
  const [formData, setFormData] = useState({
    id: "", // spawn id (ตอน edit)
    monster_id: "",
    level: "A1",
    distant_spawn: "",
  });

  const fetchMonsters = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/monster`);
      if (!res.ok) throw new Error("Failed to fetch monsters");
      const data = await res.json();
      setMonsters(data);
      if (!formData.monster_id && data?.[0]?.id) {
        setFormData((p) => ({ ...p, monster_id: data[0].id }));
      }
    } catch (e) {
      console.error(e);
      alert("Fetch monsters failed");
    }
  }, [formData.monster_id]);

  const fetchSpawns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/spawn?stage_id=${encodeURIComponent(stageId)}`);
      if (!res.ok) throw new Error("Failed to fetch spawns");
      const data = await res.json();
      setSpawns(data);
    } catch (e) {
      console.error(e);
      alert("Fetch spawns failed");
    } finally {
      setLoading(false);
    }
  }, [stageId]);

  useEffect(() => {
    fetchMonsters();
  }, [fetchMonsters]);

  useEffect(() => {
    fetchSpawns();
    setIsEditing(false);
    setFormData({ id: "", monster_id: "", level: "A1", distant_spawn: "" });
  }, [fetchSpawns, stageId]);

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setIsEditing(false);
    setFormData((p) => ({ ...p, id: "", level: "A1", distant_spawn: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.monster_id) return alert("กรุณาเลือก monster");
    if (formData.distant_spawn === "") return alert("กรุณาใส่ distant_spawn");

    const payload = {
      stage_id: stageId,
      monster_id: formData.monster_id,
      level: formData.level,
      distant_spawn: Number(formData.distant_spawn),
    };

    try {
      let url = `${API_URL}/spawn`;
      let method = "POST";
      if (isEditing) {
        url = `${API_URL}/spawn/${formData.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Save spawn failed");
      }

      alert(isEditing ? "Spawn Updated!" : "Spawn Created!");
      resetForm();
      fetchSpawns();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (sp) => {
    setIsEditing(true);
    setFormData({
      id: sp.id,
      monster_id: sp.monster_id,
      level: sp.level ?? "A1",
      distant_spawn: sp.distant_spawn ?? "",
    });
    document.getElementById("spawn-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Spawn ID: ${id}?`)) return;
    try {
      const res = await fetch(`${API_URL}/spawn/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Delete spawn failed");
      }
      fetchSpawns();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const monsterNameById = (id) => {
    const m = monsters.find((x) => x.id === id);
    return m ? `${m.name} (${m.id})` : id;
  };

  return (
    <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12, background: "#0f1012" }}>
      <h3 style={{ margin: "0 0 10px 0", color: "#68d391", fontFamily: '"Press Start 2P"', fontSize: 12 }}>
        MONSTER SPAWNS — STAGE: {stageId}
      </h3>

      {/* Spawn Form */}
      <form id="spawn-form" onSubmit={handleSubmit} className="form-box" style={{ borderColor: "#68d391" }}>
        <div style={{ width: "100%", color: "#aaa", fontSize: 12, marginBottom: 8 }}>
          {isEditing ? `Editing Spawn ID: ${formData.id}` : "Add Spawn"}
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}>
          <select className="input-field" name="monster_id" value={formData.monster_id} onChange={handleChange} style={{ flex: 2, minWidth: 240 }}>
            <option value="" disabled>
              -- select monster --
            </option>
            {monsters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>

          <input className="input-field" name="level" placeholder="level (e.g. A1)" value={formData.level} onChange={handleChange} style={{ flex: 1, minWidth: 140 }} />

          <input
            className="input-field"
            type="number"
            name="distant_spawn"
            placeholder="distant_spawn"
            value={formData.distant_spawn}
            onChange={handleChange}
            style={{ flex: 1, minWidth: 180 }}
          />
        </div>

        <div style={{ width: "100%", display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
          <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`} style={{ flex: 1 }}>
            {isEditing ? "UPDATE SPAWN" : "ADD SPAWN"}
          </button>
          {isEditing && (
            <button type="button" className="btn" onClick={resetForm} style={{ background: "#555", flex: 1 }}>
              CANCEL
            </button>
          )}
        </div>
      </form>

      {/* Spawn Table */}
      <div className="table-wrapper">
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading Spawns...</p>
        ) : (
          <table className="dict-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Monster</th>
                <th>Level</th>
                <th>distant_spawn</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {spawns.map((sp) => (
                <tr key={sp.id}>
                  <td style={{ fontFamily: "monospace", color: "#9ad0ff" }}>{sp.id}</td>
                  <td style={{ fontSize: 12, color: "#ddd" }}>{monsterNameById(sp.monster_id)}</td>
                  <td>{sp.level}</td>
                  <td>{sp.distant_spawn}</td>
                  <td className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEdit(sp)}>Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(sp.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {spawns.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 16 }}>No Spawns in this Stage.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
