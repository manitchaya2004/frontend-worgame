import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../../service/supabaseClient";

const VALID_TYPES = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "pronoun",
];

const VALID_LEVELS = ["A1", "A2", "B1", "B2"];

const DictionaryPanel = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);

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
    level: "",
    is_oxford: false,
  });
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef(null);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const normalizeLevelForApi = (lv) => {
    if (lv === "" || lv === undefined || lv === null) return null;
    return lv;
  };

  const normalizeWord = (text = "") => String(text).trim().toLowerCase();
  const normalizeType = (text = "") => String(text).trim().toLowerCase();

  const normalizeBoolean = (value) => {
    const v = String(value ?? "")
      .trim()
      .toLowerCase();

    if (["true", "1", "yes", "y", "on"].includes(v)) return true;
    if (["false", "0", "no", "n", "off", ""].includes(v)) return false;
    return false;
  };

  const normalizeTypeSafe = (value) => {
    const v = normalizeType(value);
    return VALID_TYPES.includes(v) ? v : "";
  };

  const normalizeLevelSafe = (value) => {
    const raw = String(value ?? "").trim().toUpperCase();
    if (!raw || raw === "NULL" || raw === "NONE" || raw === "-") return "";
    return VALID_LEVELS.includes(raw) ? raw : "";
  };

  const fetchWordsQuery = useCallback(async () => {
    setLoading(true);
    try {
      const startsWith = searchText || selectedLetter || null;
      const level = filterLevel || null;

      const lengthValue =
        filterLength === "7"
          ? 0
          : filterLength
          ? Number(filterLength)
          : 0;

      const { data, error } = await supabase.rpc("query_dictionary", {
        p_starts_with: startsWith,
        p_contains: null,
        p_length: lengthValue,
        p_level: level,
        p_limit: 100,
        p_last_word: null,
        p_only_oxford: onlyOxford,
      });

      if (error) throw error;

      let resultData = Array.isArray(data) ? data : [];

      // เดิม UI ใช้ "7+ Chars"
      if (filterLength === "7") {
        resultData = resultData.filter((item) => String(item.word || "").length >= 7);
      }

      setWords(resultData);
    } catch (error) {
      console.error("Error fetching words:", error);
      setWords([]);
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      id: "",
      word: "",
      type: "",
      meaning: "",
      level: "",
      is_oxford: false,
    });
    setIsEditing(false);
  };

  const splitLooseLine = (line) => {
    const rawParts = line.split(",").map((part) => part.trim());

    if (rawParts.length >= 5) {
      return {
        word: rawParts[0] ?? "",
        type: rawParts[1] ?? "",
        meaning: rawParts.slice(2, rawParts.length - 2).join(", ").trim(),
        level: rawParts[rawParts.length - 2] ?? "",
        isOxford: rawParts[rawParts.length - 1] ?? "",
      };
    }

    if (rawParts.length === 4) {
      return {
        word: rawParts[0] ?? "",
        type: rawParts[1] ?? "",
        meaning: rawParts[2] ?? "",
        level: "",
        isOxford: rawParts[3] ?? "",
      };
    }

    if (rawParts.length === 3) {
      return {
        word: rawParts[0] ?? "",
        type: rawParts[1] ?? "",
        meaning: rawParts[2] ?? "",
        level: "",
        isOxford: "",
      };
    }

    if (rawParts.length === 2) {
      const first = rawParts[0] ?? "";
      const second = rawParts[1] ?? "";

      const firstTokens = first.split(/\s+/).filter(Boolean);
      let word = firstTokens[0] ?? "";
      let type = firstTokens[1] ?? "";
      let meaning = "";

      const remainingFromFirst = firstTokens.slice(2).join(" ").trim();
      const secondTokens = second.split(/\s+/).filter(Boolean);

      let level = "";
      let isOxford = "";

      if (secondTokens.length > 0) {
        const lastToken = secondTokens[secondTokens.length - 1];
        const secondLastToken =
          secondTokens.length > 1 ? secondTokens[secondTokens.length - 2] : "";

        if (
          ["true", "false", "1", "0", "yes", "no", "y", "n", "on", "off"].includes(
            String(lastToken).toLowerCase()
          )
        ) {
          isOxford = lastToken;
          if (VALID_LEVELS.includes(String(secondLastToken).toUpperCase())) {
            level = secondLastToken;
            meaning = secondTokens.slice(0, -2).join(" ");
          } else {
            meaning = secondTokens.slice(0, -1).join(" ");
          }
        } else {
          meaning = second;
        }
      }

      if (remainingFromFirst) {
        meaning = `${remainingFromFirst} ${meaning}`.trim();
      }

      return { word, type, meaning, level, isOxford };
    }

    return {
      word: "",
      type: "",
      meaning: "",
      level: "",
      isOxford: "",
    };
  };

  const sanitizeParsedEntry = (raw) => {
    const cleanWord = String(raw.word ?? "").trim();
    const cleanType = normalizeTypeSafe(raw.type);
    const cleanMeaning = String(raw.meaning ?? "").trim();
    const cleanLevel = normalizeLevelSafe(raw.level);
    const cleanOxford = normalizeBoolean(raw.isOxford);

    return {
      word: cleanWord,
      type: cleanType,
      meaning: cleanMeaning,
      level: cleanLevel,
      is_oxford: cleanOxford,
    };
  };

  const isDuplicateWordType = (targetWord = formData.word, targetType = formData.type) => {
    const currentWord = normalizeWord(targetWord);
    const currentType = normalizeType(targetType);

    return words.some((item) => {
      const sameWord = normalizeWord(item.word) === currentWord;
      const sameType = normalizeType(item.type) === currentType;
      const isSameRow = isEditing && String(item.id) === String(formData.id);

      return sameWord && sameType && !isSameRow;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDuplicateWordType()) {
      alert(`มีคำว่า "${formData.word}" ใน type "${formData.type}" อยู่แล้ว`);
      return;
    }

    try {
      if (isEditing) {
        const { error } = await supabase.rpc("update_dictionary_word", {
          p_id: formData.id,
          p_word: formData.word.trim(),
          p_type: formData.type.trim(),
          p_meaning: formData.meaning.trim(),
          p_level: normalizeLevelForApi(formData.level),
          p_is_oxford: Boolean(formData.is_oxford),
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.rpc("add_dictionary_word", {
          p_word: formData.word.trim(),
          p_type: formData.type.trim(),
          p_meaning: formData.meaning.trim(),
          p_level: normalizeLevelForApi(formData.level),
          p_is_oxford: Boolean(formData.is_oxford),
        });

        if (error) throw error;
      }

      resetForm();
      await fetchWordsQuery();
      alert(isEditing ? "แก้ไขสำเร็จ!" : "เพิ่มคำศัพท์สำเร็จ!");
    } catch (error) {
      console.error(error);
      alert(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleBulkUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleTextFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBulkUploading(true);
      const text = await file.text();

      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));

      if (lines.length === 0) {
        alert("อัปโหลดไม่สำเร็จ: ไฟล์ว่าง หรือไม่มีข้อมูลที่ใช้เพิ่มคำศัพท์");
        return;
      }

      const existingSet = new Set(
        words.map((item) => `${normalizeWord(item.word)}__${normalizeType(item.type)}`)
      );

      const localSeen = new Set();
      const rowsToCreate = [];
      const skippedReasons = [];

      lines.forEach((line, index) => {
        const rowNo = index + 1;
        const parsed = sanitizeParsedEntry(splitLooseLine(line));

        const safeWord = parsed.word?.trim() || "";
        const safeType = parsed.type || "";
        const safeMeaning = parsed.meaning?.trim() || "";
        const safeLevel = parsed.level || "";
        const safeOxford = Boolean(parsed.is_oxford);

        if (!safeWord) {
          skippedReasons.push(`บรรทัด ${rowNo}: ไม่มี word`);
          return;
        }

        if (!safeType) {
          skippedReasons.push(
            `บรรทัด ${rowNo}: type ไม่ถูกต้องหรือไม่มีค่า (ต้องเป็น noun, verb, adjective, adverb, preposition, conjunction, pronoun)`
          );
          return;
        }

        if (!safeMeaning) {
          skippedReasons.push(`บรรทัด ${rowNo}: meaning ว่าง`);
          return;
        }

        if (safeLevel && !VALID_LEVELS.includes(String(safeLevel).toUpperCase())) {
          skippedReasons.push(`บรรทัด ${rowNo}: level ไม่ถูกต้อง (${safeLevel})`);
          return;
        }

        const dedupeKey = `${normalizeWord(safeWord)}__${normalizeType(safeType)}`;

        if (existingSet.has(dedupeKey)) {
          skippedReasons.push(`บรรทัด ${rowNo}: คำซ้ำในระบบ (${safeWord} / ${safeType})`);
          return;
        }

        if (localSeen.has(dedupeKey)) {
          skippedReasons.push(`บรรทัด ${rowNo}: คำซ้ำภายในไฟล์ (${safeWord} / ${safeType})`);
          return;
        }

        localSeen.add(dedupeKey);
        rowsToCreate.push({
          rowNo,
          payload: {
            p_word: safeWord,
            p_type: safeType,
            p_meaning: safeMeaning,
            p_level: normalizeLevelForApi(safeLevel),
            p_is_oxford: safeOxford,
          },
        });
      });

      if (rowsToCreate.length === 0) {
        alert(
          `อัปโหลดไม่สำเร็จ: ไม่มีข้อมูลที่เพิ่มได้\n\nเหตุผล:\n- ${skippedReasons.join("\n- ")}`
        );
        return;
      }

      let successCount = 0;
      const failedReasons = [...skippedReasons];

      for (const row of rowsToCreate) {
        try {
          const { error } = await supabase.rpc("add_dictionary_word", row.payload);

          if (error) {
            failedReasons.push(`บรรทัด ${row.rowNo}: ${error.message || "บันทึกข้อมูลไม่สำเร็จ"}`);
          } else {
            successCount += 1;
          }
        } catch (err) {
          console.error("Bulk insert failed:", err);
          failedReasons.push(
            `บรรทัด ${row.rowNo}: ${err.message || "เชื่อมต่อ Supabase ไม่สำเร็จ"}`
          );
        }
      }

      await fetchWordsQuery();

      if (failedReasons.length > 0) {
        alert(
          `อัปโหลดเสร็จ: เพิ่มสำเร็จ ${successCount} รายการ\nไม่สำเร็จ ${failedReasons.length} รายการ\n\nสาเหตุ:\n- ${failedReasons.join(
            "\n- "
          )}`
        );
      } else {
        alert(`อัปโหลดเสร็จ: เพิ่มสำเร็จ ${successCount} รายการ`);
      }
    } catch (error) {
      console.error(error);
      alert(`เกิดข้อผิดพลาดในการอ่านไฟล์ข้อความ: ${error.message || "unknown error"}`);
    } finally {
      setBulkUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      const { data, error } = await supabase.rpc("delete_dictionary_word", {
        p_id: row.id,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("ลบไม่สำเร็จ");
        return;
      }

      await fetchWordsQuery();
    } catch (error) {
      alert(error.message || "เกิดข้อผิดพลาด");
      console.error(error);
    }
  };

  const filteredWords =
    filterLength === "7"
      ? words.filter((w) => (!filterType || w.type === filterType) && String(w.word || "").length >= 7)
      : words.filter((w) => !filterType || w.type === filterType);

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
        />

        <select
          className="input-field"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Type...</option>
          <option value="noun">noun</option>
          <option value="verb">verb</option>
          <option value="adjective">adjective</option>
          <option value="adverb">adverb</option>
          <option value="preposition">preposition</option>
          <option value="conjunction">conjunction</option>
          <option value="pronoun">pronoun</option>
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

        <div data-tooltip="Select language difficulty level">
          <select
            className="input-field"
            name="level"
            value={formData.level ?? ""}
            onChange={handleChange}
          >
            <option value="">No Level</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </select>
        </div>

        <div className="dict-upload-group">
          <label
            className="dict-oxford-check"
            data-tooltip="Check if this is an Oxford 3000 word"
          >
            <input
              type="checkbox"
              name="is_oxford"
              checked={Boolean(formData.is_oxford)}
              onChange={handleChange}
            />
            <span>Oxford</span>
          </label>

          <button
            type="button"
            className="btn dict-text-upload-btn dict-help-tooltip"
            onClick={handleBulkUploadClick}
            disabled={bulkUploading || isEditing}
            data-tooltip={`รูปแบบ:
          word, type, meaning, level, is_oxford

          ตัวอย่าง:
          apple, noun, แอปเปิล, A1, true
          book, noun, หนังสือ, , false

          ถ้าว่างให้ปล่อยว่างได้`}
          >
            {bulkUploading ? "..." : "Text File"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            onChange={handleTextFileUpload}
            style={{ display: "none" }}
          />
        </div>

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
          <input
            type="text"
            className="search-input"
            placeholder="Search word..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <div data-tooltip="Filter by Part of Speech">
            <select
              className="filter-select"
              onChange={(e) => setFilterType(e.target.value)}
              value={filterType}
            >
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
            <select
              className="filter-select"
              onChange={(e) => setFilterLevel(e.target.value)}
              value={filterLevel}
            >
              <option value="">All Levels</option>
              <option value="A1">Level A1</option>
              <option value="A2">Level A2</option>
              <option value="B1">Level B1</option>
              <option value="B2">Level B2</option>
            </select>
          </div>

          <div data-tooltip="Filter by number of characters">
            <select
              className="filter-select"
              onChange={(e) => setFilterLength(e.target.value)}
              value={filterLength}
            >
              <option value="">Any Length</option>
              <option value="3">3 Chars</option>
              <option value="4">4 Chars</option>
              <option value="5">5 Chars</option>
              <option value="6">6 Chars</option>
              <option value="7">7+ Chars</option>
            </select>
          </div>

          <label
            style={{ display: "flex", alignItems: "center", gap: 8, color: "#ddd" }}
            data-tooltip="Show only Oxford 3000 vocabulary"
          >
            <input
              type="checkbox"
              checked={onlyOxford}
              onChange={(e) => setOnlyOxford(e.target.checked)}
            />
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
              {filteredWords.length > 0 ? (
                filteredWords.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.word}</strong></td>
                    <td><span style={{ color: "#aaa" }}>{item.type}</span></td>
                    <td className="meaning-cell">{item.meaning}</td>
                    <td>{item.level && String(item.level).trim() !== "" ? item.level : "-"}</td>
                    <td style={{ textAlign: "center" }}>{item.is_oxford ? "✅" : "-"}</td>

                    <td className="actions-cell">
                      <div className="action-buttons">
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
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#aaa" }}>
                    No words found
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