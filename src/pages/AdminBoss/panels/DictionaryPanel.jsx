import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../config";

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

export default DictionaryPanel;
