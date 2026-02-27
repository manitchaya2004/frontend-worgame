import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../config";

const DictionaryPanel = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedLetter, setSelectedLetter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterLength, setFilterLength] = useState("");
  const [onlyOxford, setOnlyOxford] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    word: "",
    type: "",
    meaning: "",
    level: "", // ✅ "" = No Level ใน UI
    is_oxford: false,
  });
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
      if (onlyOxford) payload.onlyOxford = true;

      const res = await fetch(`/api/dict/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      const resultData = Array.isArray(responseData) ? responseData : responseData.data || [];
      setWords(resultData);
    } catch (error) {
      console.error("Error fetching words:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedLetter, searchText, filterLevel, filterLength, onlyOxford]);

  useEffect(() => {
    fetchWordsQuery();
  }, [fetchWordsQuery]);

  const handleLetterClick = (letter) => {
    if (selectedLetter === letter) setSelectedLetter("");
    else {
      setSelectedLetter(letter);
      setSearchText("");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({ id: "", word: "", type: "", meaning: "", level: "", is_oxford: false });
    setIsEditing(false);
  };

  const normalizeLevelForApi = (lv) => {
    if (lv === "" || lv === undefined) return null; // ✅ "" => null
    return lv;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API_URL}/dict/${formData.id}` : `${API_URL}/dict`;

      const payload = {
        word: formData.word,
        type: formData.type,
        meaning: formData.meaning,
        level: normalizeLevelForApi(formData.level),
        is_oxford: Boolean(formData.is_oxford),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Operation failed");

      resetForm();
      fetchWordsQuery();
      alert(isEditing ? "แก้ไขสำเร็จ!" : "เพิ่มคำศัพท์สำเร็จ!");
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error(error);
    }
  };

  const handleEditClick = (row) => {
    setFormData({
      id: row.id || "",
      word: row.word || "",
      type: row.type || "",
      meaning: row.meaning || "",
      level: row.level ?? "",
      is_oxford: Boolean(row.is_oxford),
    });
    setIsEditing(true);
    document.querySelector(".form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (row) => {
    const label = `${row.word} (${row.type})`;
    if (!window.confirm(`แน่ใจนะว่าจะลบ "${label}" ?`)) return;

    try {
      const res = await fetch(`${API_URL}/dict/${row.id}`, { method: "DELETE" });
      if (res.ok) fetchWordsQuery();
      else alert("ลบไม่สำเร็จ");
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
      console.error(error);
    }
  };

  const filteredWords = words.filter((w) => !filterType || w.type === filterType);

// ... (ส่วนบนของไฟล์เหมือนเดิมทุกประการ)

  return (
    <div>
      <form className="form-box" onSubmit={handleSubmit}>
        {/* ... (Input Word, Type, Meaning เหมือนเดิม) */}
        <input className="input-field" type="text" name="word" placeholder="Word" value={formData.word} onChange={handleChange} required />
        <select className="input-field" name="type" value={formData.type} onChange={handleChange} required>
          <option value="" disabled>Select Type...</option>
          <option value="noun">noun</option>
          <option value="verb">verb</option>
          <option value="adjective">adjective</option>
          <option value="adverb">adverb</option>
          <option value="preposition">preposition</option>
          <option value="conjunction">conjunction</option>
          <option value="pronoun">pronoun</option>
        </select>
        <input className="input-field" type="text" name="meaning" placeholder="Meaning" value={formData.meaning} onChange={handleChange} required />

        {/* ✅ Tooltip สำหรับ Select Level */}
        <div data-tooltip="Select language difficulty level">
          <select className="input-field" name="level" value={formData.level ?? ""} onChange={handleChange}>
            <option value="">No Level</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </select>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#ddd" }} data-tooltip="Check if this is an Oxford 3000 word">
          <input type="checkbox" name="is_oxford" checked={Boolean(formData.is_oxford)} onChange={handleChange} />
          Oxford
        </label>

        {/* ✅ Tooltip สำหรับปุ่ม Add/Update */}
        <button 
          type="submit" 
          className={`btn ${isEditing ? "btn-edit" : "btn-add"}`}
          data-tooltip={isEditing ? "Save changes to database" : "Create new word entry"}
        >
          {isEditing ? "Update Word" : "Add Word"}
        </button>

        {isEditing && (
          <button 
            type="button" 
            className="btn" 
            onClick={resetForm} 
            style={{ backgroundColor: "#666" }}
            data-tooltip="Discard all changes"
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
              type="button"
              data-tooltip={`Filter: Words starting with ${letter}`}
            >
              {letter}
            </button>
          ))}
          <button
            className={`letter-btn ${selectedLetter === "" ? "active" : ""}`}
            onClick={() => setSelectedLetter("")}
            style={{ gridColumn: "span 2" }}
            type="button"
            data-tooltip="Clear filter and show all"
          >
            ALL
          </button>
        </div>

        <div className="search-controls">
          <span className="search-icon">🔍</span>
          <input type="text" className="search-input" placeholder="Search word..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />

          <div data-tooltip="Filter by Part of Speech">
            <select className="filter-select" onChange={(e) => setFilterType(e.target.value)} value={filterType}>
              <option value="">All Types</option>
              <option value="noun">noun</option>
              <option value="verb">verb</option>
              <option value="adjective">adjective</option>
              <option value="adverb">adverb</option>
              <option value="preposition">preposition</option>
              <option value="conjunction">conjunction</option>
              <option value="pronoun">pronoun</option>
            </select>
          </div>

          <div data-tooltip="Filter by CEFR Level">
            <select className="filter-select" onChange={(e) => setFilterLevel(e.target.value)} value={filterLevel}>
              <option value="">All Levels</option>
              <option value="A1">Level A1</option>
              <option value="A2">Level A2</option>
              <option value="B1">Level B1</option>
              <option value="B2">Level B2</option>
            </select>
          </div>

          <div data-tooltip="Filter by number of characters">
            <select className="filter-select" onChange={(e) => setFilterLength(e.target.value)} value={filterLength}>
              <option value="">Any Length</option>
              <option value="3">3 Chars</option>
              <option value="4">4 Chars</option>
              <option value="5">5 Chars</option>
              <option value="6">6 Chars</option>
              <option value="7">7+ Chars</option>
            </select>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#ddd" }} data-tooltip="Show only Oxford 3000 vocabulary">
            <input type="checkbox" checked={onlyOxford} onChange={(e) => setOnlyOxford(e.target.checked)} />
            Oxford only
          </label>
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
                <th data-tooltip="Language Difficulty Level (CEFR)">Level ⓘ</th>
                <th data-tooltip="Is this an Oxford 3000 core word?">Oxford ⓘ</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredWords.map((item) => (
                <tr key={item.id}>
                  {/* ... (ข้อมูลในตารางคงเดิม) */}
                  <td><strong>{item.word}</strong></td>
                  <td><span style={{ color: "#aaa" }}>{item.type}</span></td>
                  <td>{item.meaning}</td>
                  <td>{item.level && String(item.level).trim() !== "" ? item.level : "-"}</td>
                  <td style={{ textAlign: "center" }}>{item.is_oxford ? "✅" : "-"}</td>
                  
                  <td className="action-buttons">
                    <button 
                      className="btn btn-edit" 
                      onClick={() => handleEditClick(item)} 
                      type="button"
                      data-tooltip="Edit this word entry"
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-delete" 
                      onClick={() => handleDelete(item)} 
                      type="button"
                      data-tooltip="Delete this word permanently"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {/* ... (No words found case) */}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DictionaryPanel;