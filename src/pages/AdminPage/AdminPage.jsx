// src/pages/AdminPage/AdminPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import "./AdminPage.css";

// ⚠️ IP ของ Backend
const API_URL = "http://26.23.130.235:3000";

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
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="content-area">
        {activeTab === "dictionary" ? <DictionaryPanel /> : <MonsterPanel />}
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
    document.querySelector('.form-box')?.scrollIntoView({ behavior: 'smooth' });
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

  const filteredWords = words.filter(word => !filterType || word.type === filterType);

  return (
    <div>
      <form className="form-box" onSubmit={handleSubmit}>
        <input className="input-field" type="text" name="word" placeholder="Word" value={formData.word} onChange={handleChange} required disabled={isEditing} />
        <select className="input-field" name="type" value={formData.type} onChange={handleChange} required>
            <option value="" disabled>Select Type...</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
        </select>
        <input className="input-field" type="text" name="meaning" placeholder="Meaning" value={formData.meaning} onChange={handleChange} required />
        <select className="input-field" name="level" value={formData.level} onChange={handleChange} required>
            <option value="" disabled>Select Level...</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
        </select>
        <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`}>{isEditing ? "Update Word" : "Add Word"}</button>
        {isEditing && <button type="button" className="btn" onClick={() => {setIsEditing(false); setFormData({word:"",type:"",meaning:"",level:""})}} style={{backgroundColor: '#666'}}>Cancel</button>}
      </form>

      <div className="filter-section">
        <div className="alphabet-grid">
          {alphabet.map((letter) => (
            <button key={letter} className={`letter-btn ${selectedLetter === letter ? "active" : ""}`} onClick={() => handleLetterClick(letter)}>{letter}</button>
          ))}
          <button className={`letter-btn ${selectedLetter === "" ? "active" : ""}`} onClick={() => setSelectedLetter("")} style={{gridColumn: "span 2"}}>ALL</button>
        </div>
        <div className="search-controls">
          <span className="search-icon">🔍</span>
          <input type="text" className="search-input" placeholder="Search word..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
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
        {loading ? <p style={{textAlign: "center"}}>Loading...</p> : (
          <table className="dict-table">
            <thead>
              <tr><th>Word</th><th>Type</th><th>Meaning</th><th>Level</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredWords.map((item) => (
                <tr key={item.word}>
                  <td><strong>{item.word}</strong></td>
                  <td><span style={{color: '#aaa'}}>{item.type}</span></td>
                  <td>{item.meaning}</td>
                  <td>LV. {item.level}</td>
                  <td className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEditClick(item)}>Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(item.word)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filteredWords.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No words found.</td></tr>}
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

  // ค่า Default ของ Moves (เป็น Object Array ไม่ใช่ String แล้ว)
  const defaultMoves = [
    {
      pattern_no: 1,
      moves: [
        { pattern_order: 1, pattern_move: "attack" },
        { pattern_order: 2, pattern_move: "attack" }
      ]
    }
  ];

  // State Form
  const [formData, setFormData] = useState({
    id: "", name: "", max_hp: "", atk_power_min: "", atk_power_max: "",
    armor: "", exp: "", speed: "", description: "", 
    monster_moves: defaultMoves // เก็บเป็น Array โดยตรง
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

  // Handle Input ทั่วไป
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- ฟังก์ชันจัดการ Moves UI ---
  
  // 1. เปลี่ยนค่าใน Move (เช่น เปลี่ยนจาก attack เป็น heal)
  const handleMoveChange = (patternIndex, moveIndex, field, value) => {
    const newMoves = [...formData.monster_moves];
    newMoves[patternIndex].moves[moveIndex][field] = value;
    setFormData({ ...formData, monster_moves: newMoves });
  };

  // 2. เพิ่มท่าโจมตีใหม่ใน Pattern นั้นๆ
  const addMove = (patternIndex) => {
    const newMoves = [...formData.monster_moves];
    const currentMoves = newMoves[patternIndex].moves;
    // Auto Gen Order ถัดไป
    const nextOrder = currentMoves.length > 0 ? currentMoves[currentMoves.length - 1].pattern_order + 1 : 1;
    
    currentMoves.push({ pattern_order: nextOrder, pattern_move: "attack" });
    setFormData({ ...formData, monster_moves: newMoves });
  };

  // 3. ลบท่าโจมตี
  const removeMove = (patternIndex, moveIndex) => {
    const newMoves = [...formData.monster_moves];
    newMoves[patternIndex].moves.splice(moveIndex, 1);
    setFormData({ ...formData, monster_moves: newMoves });
  };

  // 4. เพิ่ม Pattern ใหม่
  const addPattern = () => {
    const newMoves = [...formData.monster_moves];
    const nextPatternNo = newMoves.length > 0 ? newMoves[newMoves.length - 1].pattern_no + 1 : 1;
    
    newMoves.push({
      pattern_no: nextPatternNo,
      moves: [{ pattern_order: 1, pattern_move: "attack" }]
    });
    setFormData({ ...formData, monster_moves: newMoves });
  };

  // 5. ลบ Pattern
  const removePattern = (patternIndex) => {
    const newMoves = [...formData.monster_moves];
    newMoves.splice(patternIndex, 1);
    setFormData({ ...formData, monster_moves: newMoves });
  };
  // ------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    // เตรียม Payload (ไม่ต้อง JSON.parse แล้ว เพราะเป็น Object อยู่แล้ว)
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
        monster_moves: formData.monster_moves // ส่งไปได้เลย
    };

    try {
      let url = `${API_URL}/monster`;
      let method = "POST";
      
      if (isEditing) {
        url = `${API_URL}/monster/${formData.id}`;
        method = "PUT";
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

      alert(isEditing ? "Monster Updated!" : "Monster Created!");
      
      setFormData({
        id: "", name: "", max_hp: "", atk_power_min: "", atk_power_max: "",
        armor: "", exp: "", speed: "", description: "", monster_moves: defaultMoves
      });
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
      // ใช้ข้อมูล Array ตรงๆ ไม่ต้อง Stringify
      monster_moves: m.monster_moves && m.monster_moves.length > 0 ? m.monster_moves : defaultMoves
    });
    setIsEditing(true);
    document.querySelector('.form-box')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if(!window.confirm(`Delete Monster ID: ${id}?`)) return;
    try {
      const res = await fetch(`${API_URL}/monster/${id}`, { method: "DELETE" });
      if(res.ok) fetchMonsters();
      else alert("Delete failed");
    } catch(err) {
      alert("Error deleting monster");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
        id: "", name: "", max_hp: "", atk_power_min: "", atk_power_max: "",
        armor: "", exp: "", speed: "", description: "", monster_moves: defaultMoves
      });
  }

  return (
    <div>
      <form className="form-box monster-mode" onSubmit={handleSubmit}>
        <h3 style={{width:'100%', margin:'0 0 15px 0', color:'#d32f2f', textAlign:'center', fontFamily: '"Press Start 2P"'}}>
            {isEditing ? `EDITING: ${formData.id}` : "NEW MONSTER"}
        </h3>
        
        {/* Basic Stats Inputs (เหมือนเดิม) */}
        <div style={{display:'flex', gap:'10px', width: '100%'}}>
             <input className="input-field" name="id" placeholder="ID (e.g. goblin)" value={formData.id} onChange={handleChange} required disabled={isEditing} style={{flex:1}} />
             <input className="input-field" name="name" placeholder="Name (e.g. Rob Goblin)" value={formData.name} onChange={handleChange} required style={{flex:2}} />
        </div>

        <div style={{display:'flex', gap:'10px', width: '100%', flexWrap: 'wrap'}}>
            <input className="input-field" type="number" name="max_hp" placeholder="Max HP" value={formData.max_hp} onChange={handleChange} required style={{flex:1}} />
            <input className="input-field" type="number" name="atk_power_min" placeholder="Min ATK" value={formData.atk_power_min} onChange={handleChange} required style={{flex:1}} />
            <input className="input-field" type="number" name="atk_power_max" placeholder="Max ATK" value={formData.atk_power_max} onChange={handleChange} required style={{flex:1}} />
            <input className="input-field" type="number" name="armor" placeholder="Armor" value={formData.armor} onChange={handleChange} required style={{flex:1}} />
            <input className="input-field" type="number" name="exp" placeholder="EXP Drop" value={formData.exp} onChange={handleChange} required style={{flex:1}} />
            <input className="input-field" type="number" name="speed" placeholder="Speed" value={formData.speed} onChange={handleChange} style={{flex:1}} />
        </div>

        <input className="input-field" name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={{width: '100%'}} />

        {/* --- 🟢 ส่วน Monster Moves แบบ Dynamic UI --- */}
        <div className="moves-container">
            <label style={{color:'#aaa', fontSize:'14px'}}>Monster Attack Patterns:</label>
            
            {formData.monster_moves.map((pattern, pIndex) => (
                <div key={pIndex} className="pattern-card">
                    <div className="pattern-header">
                        <span style={{fontWeight:'bold', color:'#fca311'}}>Pattern #{pattern.pattern_no}</span>
                        <button type="button" className="btn-small btn-remove" onClick={() => removePattern(pIndex)}>Remove Pattern</button>
                    </div>

                    {pattern.moves.map((move, mIndex) => (
                        <div key={mIndex} className="move-row">
                            <label style={{fontSize:'12px', color:'#888'}}>Order:</label>
                            <input 
                                type="number" 
                                style={{width:'50px'}}
                                value={move.pattern_order}
                                onChange={(e) => handleMoveChange(pIndex, mIndex, 'pattern_order', Number(e.target.value))}
                            />
                            
                            <label style={{fontSize:'12px', color:'#888'}}>Move:</label>
                            <select 
                                value={move.pattern_move} 
                                onChange={(e) => handleMoveChange(pIndex, mIndex, 'pattern_move', e.target.value)}
                                style={{flex:1}}
                            >
                                <option value="attack">Attack</option>
                                <option value="defend">Defend</option>
                                <option value="heal">Heal</option>
                                <option value="special">Special</option>
                            </select>

                            <button type="button" className="btn-small btn-remove" onClick={() => removeMove(pIndex, mIndex)}>X</button>
                        </div>
                    ))}

                    <button type="button" className="btn-small btn-add-move" onClick={() => addMove(pIndex)}>+ Add Move</button>
                </div>
            ))}

            <button type="button" className="btn btn-add-pattern" onClick={addPattern}>+ ADD NEW PATTERN</button>
        </div>
        {/* ------------------------------------------- */}

        <div style={{width: '100%', display:'flex', gap: '10px', justifyContent:'center', marginTop: '20px'}}>
            <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`} style={{flex:1}}>{isEditing ? "UPDATE DATA" : "SPAWN MONSTER"}</button>
            {isEditing && <button type="button" className="btn" onClick={handleCancel} style={{background:'#555', flex:1}}>CANCEL</button>}
        </div>
      </form>

      {/* Table Section (เหมือนเดิม) */}
      <div className="table-wrapper">
        {loading ? <p style={{textAlign:"center"}}>Loading Monsters...</p> : (
          <table className="dict-table monster-theme">
            <thead>
              <tr>
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
                  <td style={{fontFamily:'monospace', color:'#ff9999'}}>{m.id}</td>
                  <td><strong>{m.name}</strong></td>
                  <td>
                     <div style={{fontSize:'12px'}}>
                        <span style={{color:'#ff5555'}}>❤ {m.max_hp}</span> | 
                        <span style={{color:'#ffaa00'}}> ⚔ {m.atk_power_min}-{m.atk_power_max}</span> | 
                        <span style={{color:'#55aaff'}}> 🛡 {m.armor}</span>
                     </div>
                  </td>
                  <td>
                      <div style={{fontSize:'12px'}}>
                        <span style={{color:'#ffd700'}}>✨ {m.exp}</span> <br/>
                        <span style={{color:'#888'}}>👟 {m.speed ?? "-"}</span>
                      </div>
                  </td>
                  <td style={{fontSize:'12px', color:'#ccc', maxWidth:'200px'}}>{m.description ?? "-"}</td>
                  <td className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEdit(m)}>Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(m.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {monsters.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No Monsters Found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPage;