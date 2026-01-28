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

  const sortIcon = (key) => {
    if (sortBy !== key) return "";
    return sortDir === "asc" ? "↑" : "↓";
  };

  const SortableTH = ({ colKey, children }) => {
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
        title="Click to sort"
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
          <div className="form-field flex-1">
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

          <div className="form-field flex-1">
            <label className="form-label">no</label>
            <input
              className="input-field"
              type="number"
              value={formData.no}
              onChange={(e) => setNumberField("no", e.target.value)}
            />
          </div>

          <div className="form-field flex-2">
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
          <div className="form-field">
            <label className="form-label required">hp</label>
            <input className="input-field" type="number" value={formData.hp} onChange={(e) => setNumberField("hp", e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label required">power</label>
            <input className="input-field" type="number" value={formData.power} onChange={(e) => setNumberField("power", e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label required">speed</label>
            <input className="input-field" type="number" value={formData.speed} onChange={(e) => setNumberField("speed", e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label required">exp</label>
            <input className="input-field" type="number" value={formData.exp} onChange={(e) => setNumberField("exp", e.target.value)} />
          </div>

          <div className="form-field">
            <label className="form-label">isBoss</label>
            <button type="button" className="btn btn-neutral" onClick={toggleBoss}>
              {formData.isBoss ? "TRUE" : "FALSE"}
            </button>
            <span className="form-hint">กดสลับค่า</span>
          </div>
        </div>

        <div className="flex-row">
          <div className="form-field flex-1">
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

          <div className="form-field flex-1">
            <label className="form-label">quiz_move_cost</label>
            <input
              className="input-field"
              type="number"
              value={formData.quiz_move_cost}
              onChange={(e) => setNumberField("quiz_move_cost", e.target.value)}
            />
          </div>
        </div>

        <div className="form-field full">
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
          <div className="moves-label">Monster Moves (monster_moves)</div>

          {(formData.monster_moves || []).map((p, pi) => (
            <div className="pattern-card" key={pi}>
              <div className="pattern-header">
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div className="form-field">
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

                <button type="button" className="btn-small btn-remove" onClick={() => removePattern(pi)}>
                  Remove Pattern
                </button>
              </div>

              {(p.moves || []).map((mv, mi) => (
                <div className="move-row" key={mi}>
                  <div className="form-field">
                    <label className="form-label required">order</label>
                    <input
                      type="number"
                      value={mv.pattern_order}
                      onChange={(e) => setMoveField(pi, mi, "pattern_order", e.target.value)}
                      style={{ width: 90 }}
                    />
                  </div>

                  <div className="form-field" style={{ flex: 1 }}>
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

                  <button type="button" className="btn-small btn-remove" onClick={() => removeMoveRow(pi, mi)}>
                    Remove
                  </button>
                </div>
              ))}

              <button type="button" className="btn-small btn-add-move" onClick={() => addMoveRow(pi)}>
                + Add Move
              </button>
            </div>
          ))}

          <button type="button" className="btn-add-pattern" onClick={addPattern}>
            + Add Pattern
          </button>
        </div>

        {/* ===== Sprite Upload 4 ===== */}
        <div className="sprite-upload">
          <div className="hint">
            Monster Sprites (ต้องมี 4 รูป) — Attack x2, Idle x2
            {isEditing && <span className="subhint"> (แก้รูป: เลือกใหม่ให้ครบ 4 แล้วกด UPDATE)</span>}
          </div>

          {Object.keys(spriteFiles).map((k) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
          <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`} style={{ flex: 1 }}>
            {isEditing ? "UPDATE MONSTER" : "CREATE MONSTER"}
          </button>

          {isEditing && (
            <button type="button" className="btn btn-cancel" onClick={handleCancel}>
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
                <th>Sprite</th>
                <th>ID</th>

                <SortableTH colKey="no">No</SortableTH>
                <SortableTH colKey="name">Name</SortableTH>
                <SortableTH colKey="hp">HP</SortableTH>
                <SortableTH colKey="power">Power</SortableTH>
                <SortableTH colKey="speed">Speed</SortableTH>
                <SortableTH colKey="exp">EXP</SortableTH>
                <SortableTH colKey="isBoss">isBoss</SortableTH>

                <th>quiz</th>
                <th>monster_moves</th>
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
                  <td className="mono">{String(Boolean(m.isBoss))}</td>
                  <td className="cell-ddd">
                    {m.quiz_move_code ?? "-"} / {m.quiz_move_cost ?? "-"}
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

                  <td className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEdit(m)}>Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(m.id)}>Del</button>
                    <button
                      className="btn"
                      style={{ background: "#444", color: "#fff" }}
                      onClick={() => handleDeleteSprites(m.id)}
                    >
                      Del Sprites
                    </button>
                  </td>
                </tr>
              ))}

              {monsters.length === 0 && (
                <tr>
                  <td colSpan="12" className="center-text" style={{ padding: 20 }}>
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
