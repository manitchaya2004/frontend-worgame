// src/pages/AdminPage/panels/MonsterPanel.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";
import { MonsterSpriteLoop } from "../components/SpriteLoops";

const toSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // ตัดอักขระแปลก ๆ
    .replace(/\s+/g, "-")         // เว้นวรรค → -
    .replace(/-+/g, "-");         // กัน -- ซ้อน

// ✅ รายชื่อ Effect สำหรับ Deck
const DECK_EFFECTS = [
  "double-dmg",
  "double-guard",
  "double-shield",
  "mana-plus",
  "shield-plus"
];

const MonsterPanel = () => {
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ moves จาก MovePanel
  const [moves, setMoves] = useState([]);
  const [movesLoading, setMovesLoading] = useState(false);

  // ===== Sprite files (4 รูป) =====
  const [spriteFiles, setSpriteFiles] = useState({
    attack1: null,
    attack2: null,
    idle1: null,
    idle2: null,
  });

  const resetSpriteFiles = () =>
    setSpriteFiles({ attack1: null, attack2: null, idle1: null, idle2: null });

  const handleSpriteChange = (key, file) =>
    setSpriteFiles((prev) => ({ ...prev, [key]: file }));

  // ===== Form =====
  const emptyForm = useMemo(
    () => ({
      id: "",
      no: "",
      name: "",
      hp: "",
      power: "",
      speed: "",
      exp: "",
      description: "",
      isBoss: false,
      quiz_move_code: "",
      quiz_move_cost: "",
      monster_deck: [], // ✅ เพิ่มค่าเริ่มต้นของ Deck

      monster_moves: [
        {
          pattern_no: 1,
          moves: [{ pattern_order: 1, pattern_move: "" }],
        },
      ],
    }),
    []
  );

  const [formData, setFormData] = useState(emptyForm);

  const fetchMonsters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/monster`);
      if (!res.ok) throw new Error("Failed to fetch monster");
      const data = await res.json();
      setMonsters(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert("Error fetching monster (เช็ค API_URL / endpoint)");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMoves = useCallback(async () => {
    setMovesLoading(true);
    try {
      const res = await fetch(`${API_URL}/moves`);
      if (!res.ok) throw new Error("Failed to fetch moves");
      const data = await res.json();
      setMoves(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMoves([]);
    } finally {
      setMovesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoves();
    fetchMonsters();
  }, [fetchMoves, fetchMonsters]);

    // ===== Table Sorting =====
  const [sortBy, setSortBy] = useState(null); // "no" | "name" | "hp" | ...
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

  const toggleSort = (key) => {
    if (sortBy === key) {
      // คลิก column เดิม → สลับ asc/desc
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      // คลิก column ใหม่ → เริ่ม asc เสมอ
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const sortedMonsters = useMemo(() => {
    const arr = Array.isArray(monsters) ? [...monsters] : [];
    if (!sortBy) return arr;

    const dir = sortDir === "asc" ? 1 : -1;

    const getVal = (m) => {
      switch (sortBy) {
        case "no":
          return m?.no ?? null;
        case "name":
          return m?.name ?? "";
        case "hp":
          return m?.hp ?? null;
        case "power":
          return m?.power ?? null;
        case "speed":
          return m?.speed ?? null;
        case "exp":
          return m?.exp ?? null;
        case "isBoss":
          return Boolean(m?.isBoss);
        default:
          return "";
      }
    };

    const isNumberKey = ["no", "hp", "power", "speed", "exp"].includes(sortBy);
    const isBoolKey = sortBy === "isBoss";

    arr.sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);

      // null/undefined ไปท้ายเสมอ (soft)
      const aEmpty = av === null || av === undefined || av === "";
      const bEmpty = bv === null || bv === undefined || bv === "";
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;

      if (isBoolKey) {
        // false < true (asc)
        return (Number(av) - Number(bv)) * dir;
      }

      if (isNumberKey) {
        return (Number(av) - Number(bv)) * dir;
      }

      // string
      return String(av).localeCompare(String(bv), undefined, {
        numeric: true,
        sensitivity: "base",
      }) * dir;
    });

    return arr;
  }, [monsters, sortBy, sortDir]);

  // ✅ แก้ไข SortableTH ให้รองรับ data-tooltip
  const SortableTH = ({ colKey, children, tooltip }) => {
    const active = sortBy === colKey;

    return (
      <th
        onClick={() => toggleSort(colKey)}
        style={{
          cursor: "pointer",
          userSelect: "none",
          whiteSpace: "nowrap",
          color: active ? "#ffd54f" : undefined, // เหลืองอ่อน
        }}
        data-tooltip={tooltip}
      >
        {children}
        {active && (
          <span style={{ marginLeft: 6, fontSize: 12 }}>
            {sortDir === "asc" ? "↑" : "↓"}
          </span>
        )}
      </th>
    );
  };

  // ===== Helpers: moves =====
  const movesSorted = useMemo(() => {
    const arr = Array.isArray(moves) ? [...moves] : [];
    arr.sort((a, b) => String(a?.id ?? "").localeCompare(String(b?.id ?? "")));
    return arr;
  }, [moves]);

  const quizMoves = useMemo(() => {
    return movesSorted.filter((m) => Boolean(m?.is_quiz));
  }, [movesSorted]);

  // ✅ NEW: non-quiz สำหรับ pattern_move
  const nonQuizMoves = useMemo(() => {
    return movesSorted.filter((m) => !Boolean(m?.is_quiz));
  }, [movesSorted]);

  const moveNameById = useMemo(() => {
    const mp = new Map();
    for (const m of movesSorted) {
      mp.set(String(m.id), String(m.move_name ?? m.id));
    }
    return mp;
  }, [movesSorted]);

  const hasMoves = movesSorted.length > 0;

  // ===== Helpers: monster_moves UI =====
  const setField = (name, value) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const setNumberField = (name, value) =>
    setFormData((p) => ({ ...p, [name]: value === "" ? "" : Number(value) }));

  const toggleBoss = () => setFormData((p) => ({ ...p, isBoss: !p.isBoss }));

  const addPattern = () => {
    setFormData((p) => {
      const next = [...(p.monster_moves || [])];
      const nextNo =
        next.length > 0 ? Math.max(...next.map((x) => Number(x.pattern_no) || 0)) + 1 : 1;
      next.push({
        pattern_no: nextNo,
        moves: [{ pattern_order: 1, pattern_move: "" }],
      });
      return { ...p, monster_moves: next };
    });
  };

  const removePattern = (patternIndex) => {
    setFormData((p) => {
      const next = [...(p.monster_moves || [])];
      next.splice(patternIndex, 1);
      return { ...p, monster_moves: next.length ? next : emptyForm.monster_moves };
    });
  };

  const setPatternNo = (patternIndex, value) => {
    setFormData((p) => {
      const next = [...(p.monster_moves || [])];
      next[patternIndex] = { ...next[patternIndex], pattern_no: Number(value) || 1 };
      return { ...p, monster_moves: next };
    });
  };

  const addMoveRow = (patternIndex) => {
    setFormData((p) => {
      const next = [...(p.monster_moves || [])];
      const pattern = next[patternIndex];
      const mm = [...(pattern.moves || [])];

      const nextOrder =
        mm.length > 0 ? Math.max(...mm.map((m) => Number(m.pattern_order) || 0)) + 1 : 1;

      mm.push({ pattern_order: nextOrder, pattern_move: "" });
      next[patternIndex] = { ...pattern, moves: mm };
      return { ...p, monster_moves: next };
    });
  };

  const removeMoveRow = (patternIndex, moveIndex) => {
    setFormData((p) => {
      const next = [...(p.monster_moves || [])];
      const pattern = next[patternIndex];
      const mm = [...(pattern.moves || [])];
      mm.splice(moveIndex, 1);
      next[patternIndex] = {
        ...pattern,
        moves: mm.length ? mm : [{ pattern_order: 1, pattern_move: "" }],
      };
      return { ...p, monster_moves: next };
    });
  };

  const setMoveField = (patternIndex, moveIndex, key, value) => {
    setFormData((p) => {
      const next = [...(p.monster_moves || [])];
      const pattern = next[patternIndex];
      const mm = [...(pattern.moves || [])];
      const row = { ...(mm[moveIndex] || { pattern_order: 1, pattern_move: "" }) };

      if (key === "pattern_order") row.pattern_order = Number(value) || 1;
      if (key === "pattern_move") row.pattern_move = value;

      mm[moveIndex] = row;
      next[patternIndex] = { ...pattern, moves: mm };
      return { ...p, monster_moves: next };
    });
  };

  // ✅ ฟังก์ชันจัดการ Monster Deck
  const handleAddDeckItem = () => {
    setFormData((prev) => ({
      ...prev,
      monster_deck: [...(prev.monster_deck || []), { effect: "double-dmg", size: 3 }],
    }));
  };

  const handleRemoveDeckItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      monster_deck: prev.monster_deck.filter((_, i) => i !== index),
    }));
  };

  const handleDeckChange = (index, field, value) => {
    setFormData((prev) => {
      const newDeck = [...(prev.monster_deck || [])];
      newDeck[index] = { 
        ...newDeck[index], 
        [field]: field === "size" ? Number(value) : value 
      };
      return { ...prev, monster_deck: newDeck };
    });
  };

  // ===== Sprites upload =====
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
      throw new Error(err.message || "monster sprite upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: formData.id,
      no: formData.no === "" ? null : Number(formData.no),
      name: formData.name,
      hp: formData.hp === "" ? 0 : Number(formData.hp),
      power: formData.power === "" ? 0 : Number(formData.power),
      speed: formData.speed === "" ? 0 : Number(formData.speed),
      exp: formData.exp === "" ? 0 : Number(formData.exp),
      description: formData.description || null,
      isBoss: Boolean(formData.isBoss),
      quiz_move_code: formData.quiz_move_code || null,
      quiz_move_cost: formData.quiz_move_cost === "" ? null : Number(formData.quiz_move_cost),

      // ✅ แนบ monster_deck
      monster_deck: (formData.monster_deck || []).map(item => ({
        effect: item.effect,
        size: Number(item.size) || 1
      })),

      monster_moves: (formData.monster_moves || []).map((p) => ({
        pattern_no: Number(p.pattern_no) || 1,
        moves: (p.moves || [])
          .map((m) => ({
            pattern_order: Number(m.pattern_order) || 1,
            pattern_move: (m.pattern_move || "").trim(),
          }))
          .filter((m) => m.pattern_move !== ""),
      })),
    };

    try {
      let url = `${API_URL}/monster`;
      let method = "POST";

      if (isEditing) {
        url = `${API_URL}/monster/${formData.id}`;
        method = "PUT";
      }

      if (!isEditing) {
        const missing = Object.entries(spriteFiles)
          .filter(([, f]) => !f)
          .map(([k]) => k);
        if (missing.length > 0) {
          alert(`ต้องอัปโหลดรูปครบ 4 รูปก่อนสร้าง Monster (ขาด: ${missing.join(", ")})`);
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

      if (!isEditing) {
        await uploadSpritesStrict4(formData.id);
      } else {
        const all4 = Object.values(spriteFiles).every(Boolean);
        if (all4) await uploadSpritesStrict4(formData.id);
      }

      alert(isEditing ? "Monster Updated!" : "Monster Created!");

      setFormData(emptyForm);
      resetSpriteFiles();
      setIsEditing(false);
      fetchMonsters();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (m) => {
    setFormData({
      id: m.id ?? "",
      no: m.no ?? "",
      name: m.name ?? "",
      hp: m.hp ?? 0,
      power: m.power ?? 0,
      speed: m.speed ?? 0,
      exp: m.exp ?? 0,
      description: m.description ?? "",
      isBoss: Boolean(m.isBoss),
      quiz_move_code: m.quiz_move_code ?? "",
      quiz_move_cost: m.quiz_move_cost ?? "",
      monster_deck: m.monster_deck || [], // ✅ ดึงข้อมูล Deck ตอน Edit
      monster_moves: Array.isArray(m.monster_moves) && m.monster_moves.length
        ? m.monster_moves
        : emptyForm.monster_moves,
    });
    resetSpriteFiles();
    setIsEditing(true);
    document.querySelector(".form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Monster ID: ${id}?`)) return;

    try {
      const res = await fetch(`${API_URL}/monster/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Delete failed (HTTP ${res.status})`);
      }

      alert("Monster deleted!");
      fetchMonsters();
    } catch (err) {
      console.error(err);
      alert(`Error deleting monster: ${err.message}`);
    }
  };


  const handleDeleteSprites = async (id) => {
    if (!window.confirm(`Delete ALL sprites of Monster ID: ${id}?`)) return;
    try {
      const res = await fetch(`${API_URL}/monster/${id}/sprites`, { method: "DELETE" });
      if (res.ok) {
        alert("Sprites deleted");
        fetchMonsters();
      } else alert("Delete sprites failed");
    } catch {
      alert("Error deleting sprites");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    resetSpriteFiles();
  };

  return (
    <div>
      <form className="form-box monster-mode" onSubmit={handleSubmit}>
        <h3 className="form-title monster">
          {isEditing ? `EDITING MONSTER: ${formData.id}` : "NEW MONSTER"}
        </h3>

        <div className="flex-row">
          <div className="form-field flex-1" data-tooltip="รหัสอ้างอิงมอนสเตอร์ (สร้างอัตโนมัติจากชื่อ)">
            <label className="form-label required">Monster ID</label>
            <input
              className="input-field"
              name="id"
              value={formData.id}
              disabled
            />
            <span className="form-hint">
              สร้างอัตโนมัติจาก Name (ตัวพิมพ์เล็ก + เครื่องหมาย -)
            </span>
            <span className="form-hint">ใช้เป็น key หลัก</span>
          </div>

          <div className="form-field flex-1" data-tooltip="เลขลำดับมอนสเตอร์ในสมุดภาพ">
            <label className="form-label">no</label>
            <input
              className="input-field"
              type="number"
              value={formData.no}
              onChange={(e) => setNumberField("no", e.target.value)}
            />
          </div>

          <div className="form-field flex-2" data-tooltip="ชื่อของมอนสเตอร์ที่จะแสดงในเกม">
            <label className="form-label required">name</label>
            <input
              className="input-field"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;

                setFormData((p) => {
                  // ถ้าเป็นโหมด EDIT → เปลี่ยนแค่ name
                  if (isEditing) {
                    return { ...p, name };
                  }

                  // โหมด CREATE → sync id จาก name
                  const autoId = toSlug(name);
                  return {
                    ...p,
                    name,
                    id: autoId,
                  };
                });
              }}
            />
          </div>
        </div>

        <div className="flex-row flex-wrap">
          <div className="form-field" data-tooltip="พลังชีวิตเริ่มต้นของมอนสเตอร์">
            <label className="form-label required">hp</label>
            <input className="input-field" type="number" value={formData.hp} onChange={(e) => setNumberField("hp", e.target.value)} />
          </div>
          <div className="form-field" data-tooltip="พลังโจมตีพื้นฐาน (มีผลต่อความแรงสกิล)">
            <label className="form-label required">power</label>
            <input className="input-field" type="number" value={formData.power} onChange={(e) => setNumberField("power", e.target.value)} />
          </div>
          <div className="form-field" data-tooltip="ความเร็ว (กำหนดลำดับการโจมตีในแต่ละเทิร์น)">
            <label className="form-label required">speed</label>
            <input className="input-field" type="number" value={formData.speed} onChange={(e) => setNumberField("speed", e.target.value)} />
          </div>
          <div className="form-field" data-tooltip="ค่าประสบการณ์ที่จะมอบให้ผู้เล่นเมื่อชนะ">
            <label className="form-label required">exp</label>
            <input className="input-field" type="number" value={formData.exp} onChange={(e) => setNumberField("exp", e.target.value)} />
          </div>

          {/* ✅ เปลี่ยนปุ่มสลับค่าเป็น Checkbox */}
          <div className="form-field" data-tooltip="สถานะบอส (ส่งผลต่อรางวัลและ UI พิเศษ)">
            <label className="form-label">isBoss</label>
            <div style={{ display: "flex", alignItems: "center", height: "40px", gap: "10px" }}>
              <input 
                type="checkbox" 
                id="isBoss"
                checked={formData.isBoss} 
                onChange={(e) => setField("isBoss", e.target.checked)} 
                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#e53e3e" }}
              />
              <label htmlFor="isBoss" style={{ color: "#fff", cursor: "pointer", margin: 0, userSelect: "none" }}>Boss Monster</label>
            </div>
            <span className="form-hint">กดติ๊กเพื่อกำหนดเป็นบอส</span>
          </div>
        </div>

        <div className="flex-row">
          <div className="form-field flex-1" data-tooltip="สกิลที่มอนสเตอร์จะใช้เมื่อผู้เล่นตอบคำถามถูก">
            <label className="form-label">quiz_move_code</label>

            {/* ✅ dropdown: quiz:true เท่านั้น */}
            {hasMoves && (
              <select
                className="input-field"
                value={formData.quiz_move_code}
                onChange={(e) => setField("quiz_move_code", e.target.value)}
                style={{ marginBottom: 8 }}
              >
                <option value="">(none)</option>

                {/* ✅ กันเคสข้อมูลเก่า: ถ้า quiz_move_code ไปเป็น non-quiz ให้ยังแสดงไว้ */}
                {formData.quiz_move_code &&
                  nonQuizMoves.some((m) => String(m.id) === String(formData.quiz_move_code)) && (
                    <option value={formData.quiz_move_code}>
                      (non-quiz) {formData.quiz_move_code} —{" "}
                      {moveNameById.get(String(formData.quiz_move_code)) ?? formData.quiz_move_code}
                    </option>
                  )}

                {quizMoves.map((mv) => (
                  <option key={mv.id} value={mv.id}>
                    {mv.id} — {mv.move_name ?? mv.id}
                  </option>
                ))}
              </select>
            )}

            {/* 🔒 โค้ดเดิมยังอยู่ครบ (ซ่อนตอนมี dropdown) */}
            <input
              className="input-field"
              value={formData.quiz_move_code}
              onChange={(e) => setField("quiz_move_code", e.target.value)}
              placeholder="เช่น super-tackle"
              style={{ display: hasMoves ? "none" : "block" }}
            />

            {movesLoading && <span className="form-hint">กำลังโหลด moves...</span>}
            {hasMoves && <span className="form-hint">เลือกได้เฉพาะ move ที่ is_quiz=true</span>}
          </div>

          <div className="form-field flex-1" data-tooltip="ค่ามานาที่บอสต้องใช้เพื่อปล่อยสกิล Quiz">
            <label className="form-label">quiz_move_cost</label>
            <input
              className="input-field"
              type="number"
              value={formData.quiz_move_cost}
              onChange={(e) => setNumberField("quiz_move_cost", e.target.value)}
            />
          </div>
        </div>

        <div className="form-field full" data-tooltip="คำอธิบายเพิ่มเติมเกี่ยวกับมอนสเตอร์">
          <label className="form-label">description</label>
          <input
            className="input-field"
            value={formData.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="optional"
            style={{ width: "100%" }}
          />
        </div>

        {/* ===== Monster Moves (pattern) ===== */}
        <div className="moves-container">
          <div className="moves-label" data-tooltip="ชุดคำสั่งสกิลที่มอนสเตอร์จะใช้โจมตีตามลำดับปกติ">Monster Moves (monster_moves)</div>

          {(formData.monster_moves || []).map((p, pi) => (
            <div className="pattern-card" key={pi}>
              <div className="pattern-header">
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div className="form-field" data-tooltip="ชุดลำดับที่ (ID ของกลุ่มสกิล)">
                    <label className="form-label required">pattern_no</label>
                    <input
                      className="input-field"
                      type="number"
                      value={p.pattern_no}
                      onChange={(e) => setPatternNo(pi, e.target.value)}
                      style={{ width: 120 }}
                    />
                  </div>
                </div>

                <button type="button" className="btn-small btn-remove" onClick={() => removePattern(pi)} data-tooltip="ลบชุดคำสั่งนี้ทั้งหมด">
                  Remove Pattern
                </button>
              </div>

              {(p.moves || []).map((mv, mi) => (
                <div className="move-row" key={mi}>
                  <div className="form-field" data-tooltip="ลำดับการออกสกิลภายในชุดนี้">
                    <label className="form-label required">order</label>
                    <input
                      type="number"
                      value={mv.pattern_order}
                      onChange={(e) => setMoveField(pi, mi, "pattern_order", e.target.value)}
                      style={{ width: 90 }}
                    />
                  </div>

                  <div className="form-field" style={{ flex: 1 }} data-tooltip="เลือกสกิลที่จะใช้ในลำดับนี้">
                    <label className="form-label required">pattern_move</label>

                    {/* ✅ dropdown: quiz:false เท่านั้น */}
                    {hasMoves && (
                      <select
                        className="input-field"
                        value={mv.pattern_move}
                        onChange={(e) => setMoveField(pi, mi, "pattern_move", e.target.value)}
                        style={{ marginBottom: 8, width: "100%" }}
                      >
                        <option value="">(select non-quiz move)</option>

                        {/* ✅ กันเคสข้อมูลเก่า: ถ้า pattern_move เป็น quiz ให้ยังแสดงไว้ */}
                        {mv.pattern_move &&
                          quizMoves.some((m) => String(m.id) === String(mv.pattern_move)) && (
                            <option value={mv.pattern_move}>
                              (quiz) {mv.pattern_move} —{" "}
                              {moveNameById.get(String(mv.pattern_move)) ?? mv.pattern_move}
                            </option>
                          )}

                        {nonQuizMoves.map((mvv) => (
                          <option key={mvv.id} value={mvv.id}>
                            {mvv.id} — {mvv.move_name ?? mvv.id}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* 🔒 โค้ดเดิมยังอยู่ครบ (ซ่อนตอนมี dropdown) */}
                    <input
                      value={mv.pattern_move}
                      onChange={(e) => setMoveField(pi, mi, "pattern_move", e.target.value)}
                      placeholder="เช่น acid"
                      style={{ width: "100%", display: hasMoves ? "none" : "block" }}
                    />

                    {hasMoves && mv.pattern_move && (
                      <span className="form-hint">
                        เลือกแล้ว: {mv.pattern_move} ({moveNameById.get(String(mv.pattern_move)) ?? "-"})
                      </span>
                    )}
                  </div>

                  <button type="button" className="btn-small btn-remove" onClick={() => removeMoveRow(pi, mi)} data-tooltip="ลบลำดับสกิลนี้">
                    Remove
                  </button>
                </div>
              ))}

              <button type="button" className="btn-small btn-add-move" onClick={() => addMoveRow(pi)} data-tooltip="เพิ่มสกิลลงในชุดคำสั่งนี้">
                + Add Move
              </button>
            </div>
          ))}

          <button type="button" className="btn-add-pattern" onClick={addPattern} data-tooltip="สร้างชุดคำสั่ง (Pattern) ใหม่">
            + Add Pattern
          </button>
        </div>

        {/* ✅ เพิ่มส่วนจัดการ Monster Deck */}
        <div style={{ width: "100%", marginTop: "15px", padding: "15px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px dashed #555" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#e2e8f0" }} data-tooltip="การ์ดเอฟเฟกต์ที่มอนสเตอร์ตัวนี้มีในกอง">Monster Deck (Cards)</h4>
          {(formData.monster_deck || []).map((item, index) => (
            <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "center" }}>
              <div className="form-field flex-2" style={{ marginBottom: 0 }} data-tooltip="เลือกเอฟเฟกต์ของการ์ด">
                <select 
                  className="input-field" 
                  value={item.effect} 
                  onChange={(e) => handleDeckChange(index, "effect", e.target.value)}
                >
                  {DECK_EFFECTS.map(ef => (
                    <option key={ef} value={ef}>{ef}</option>
                  ))}
                </select>
              </div>
              <div className="form-field flex-1" style={{ marginBottom: 0 }} data-tooltip="จำนวนใบของการ์ดชนิดนี้ในกอง">
                <input 
                  className="input-field" 
                  type="number" 
                  placeholder="Size (e.g. 3)" 
                  value={item.size} 
                  onChange={(e) => handleDeckChange(index, "size", e.target.value)}
                  min="1"
                />
              </div>
              <button 
                type="button" 
                className="btn btn-delete" 
                onClick={() => handleRemoveDeckItem(index)}
                style={{ height: "36px", padding: "0 10px", marginTop: "20px" }}
                data-tooltip="ลบการ์ดใบนี้ออกจากกอง"
              >
                X
              </button>
            </div>
          ))}
          <button type="button" className="btn" onClick={handleAddDeckItem} style={{ background: "#c53030", marginTop: "10px" }} data-tooltip="เพิ่มการ์ดชนิดใหม่ลงในกอง">
            + Add Card
          </button>
        </div>

        {/* ===== Sprite Upload 4 ===== */}
        <div className="sprite-upload" style={{ marginTop: 15 }}>
          <div className="hint" data-tooltip="ต้องอัปโหลดให้ครบทั้ง 4 ท่าทางเพื่อให้แอนิเมชันทำงานสมบูรณ์">
            Monster Sprites (ต้องมี 4 รูป) — Attack x2, Idle x2
            {isEditing && <span className="subhint"> (แก้รูป: เลือกใหม่ให้ครบ 4 แล้วกด UPDATE)</span>}
          </div>

          {Object.keys(spriteFiles).map((k) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4 }} data-tooltip={`อัปโหลดรูปภาพสำหรับสถานะ ${k}`}>
              <label style={{ fontSize: 12, color: "#888" }}>{k}</label>
              <input
                type="file"
                accept="image/*"
                required={!isEditing}
                onChange={(e) => handleSpriteChange(k, e.target.files?.[0] || null)}
              />
            </div>
          ))}
        </div>

        <div style={{ width: "100%", display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`} style={{ flex: 1 }} data-tooltip={isEditing ? "บันทึกการแก้ไขข้อมูลมอนสเตอร์" : "สร้างมอนสเตอร์ตัวใหม่ลงในระบบ"}>
            {isEditing ? "UPDATE MONSTER" : "CREATE MONSTER"}
          </button>

          {isEditing && (
            <button type="button" className="btn btn-cancel" onClick={handleCancel} data-tooltip="ยกเลิกการแก้ไขและล้างฟอร์ม">
              CANCEL
            </button>
          )}
        </div>
      </form>

      {/* ===== Table ===== */}
      <div className="table-wrapper">
        {loading ? (
          <p className="loading-center">Loading Monsters...</p>
        ) : (
          <table className="dict-table monster-theme">
            <thead>
              <tr>
                <th data-tooltip="ภาพตัวอย่างแอนิเมชัน">Sprite</th>
                <th data-tooltip="รหัสอ้างอิงของมอนสเตอร์">ID</th>

                <SortableTH colKey="no" tooltip="เลขลำดับมอนสเตอร์">No</SortableTH>
                <SortableTH colKey="name" tooltip="ชื่อมอนสเตอร์">Name</SortableTH>
                <SortableTH colKey="hp" tooltip="พลังชีวิตสูงสุด">HP</SortableTH>
                <SortableTH colKey="power" tooltip="พลังโจมตีพื้นฐาน">Power</SortableTH>
                <SortableTH colKey="speed" tooltip="ความเร็ว (กำหนดลำดับการโจมตี)">Speed</SortableTH>
                <SortableTH colKey="exp" tooltip="EXP ที่ได้รับเมื่อชนะ">EXP</SortableTH>
                <SortableTH colKey="isBoss" tooltip="สถานะบอส (มีผลต่อเพลงและรางวัล)">isBoss</SortableTH>

                <th data-tooltip="สกิลที่ใช้เมื่อตอบคำถามถูก / มานาที่ใช้">quiz</th>
                <th data-tooltip="จำนวนประเภทการ์ดในกอง">Deck</th>
                <th data-tooltip="ลำดับการออกสกิลปกติ">monster_moves</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedMonsters.map((m) => (
                <tr key={m.id}>
                  <td><MonsterSpriteLoop id={m.id} /></td>
                  <td className="mono monster-id">{m.id}</td>
                  <td className="mono">{m.no ?? "-"}</td>
                  <td><strong>{m.name ?? "-"}</strong></td>
                  <td className="mono">{m.hp ?? "-"}</td>
                  <td className="mono">{m.power ?? "-"}</td>
                  <td className="mono">{m.speed ?? "-"}</td>
                  <td className="mono">{m.exp ?? "-"}</td>
                  
                  {/* แสดงค่าจาก boolean */}
                  <td className="mono">
                    {m.isBoss ? <span style={{ color: "#e53e3e", fontWeight: "bold" }}>TRUE</span> : "false"}
                  </td>
                  
                  <td className="cell-ddd">
                    {m.quiz_move_code ?? "-"} / {m.quiz_move_cost ?? "-"}
                  </td>

                  {/* ✅ คอลัมน์สำหรับ Cards */}
                  <td style={{ fontSize: 12, color: "#48bb78", fontWeight: "bold" }}>
                    Cards: {Array.isArray(m.monster_deck) ? m.monster_deck.length : 0}
                  </td>

                  <td className="cell-dim">
                    {Array.isArray(m.monster_moves) && m.monster_moves.length
                      ? m.monster_moves
                          .map((p) => {
                            const list = (p.moves || [])
                              .map((x) => `${x.pattern_order}:${x.pattern_move}`)
                              .join(", ");
                            return `P${p.pattern_no}[${list}]`;
                          })
                          .join(" | ")
                      : "—"}
                  </td>

                  {/* ✅ แก้ไขการเรียงปุ่มและเพิ่ม Tooltip */}
                  <td className="action-buttons">
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                      <button 
                        className="btn btn-edit" 
                        onClick={() => handleEdit(m)}
                        data-tooltip="แก้ไขข้อมูลมอนสเตอร์ตัวนี้"
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-delete" 
                        onClick={() => handleDelete(m.id)}
                        data-tooltip="ลบมอนสเตอร์ถาวร"
                      >
                        Del
                      </button>
                      <button
                        className="btn"
                        style={{ background: "#444", color: "#fff", whiteSpace: "nowrap" }}
                        onClick={() => handleDeleteSprites(m.id)}
                        data-tooltip="ลบเฉพาะไฟล์รูปภาพ Sprites"
                      >
                        Del Sprites
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {monsters.length === 0 && (
                <tr>
                  <td colSpan="13" className="center-text" style={{ padding: 20 }}>
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

export default MonsterPanel;