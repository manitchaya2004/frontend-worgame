// src/pages/AdminPage/panels/HeroPanel.jsx
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { API_URL } from "../config";
import { HeroSpriteLoop } from "../components/SpriteLoops";

// รายชื่อ Effect อ้างอิงจากระบบเกม
const DECK_EFFECTS = [
  "double-dmg",
  "double-guard",
  "double-shield",
  "mana-plus",
  "shield-plus"
];

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
    setSpriteFiles({
      attack1: null,
      attack2: null,
      idle1: null,
      idle2: null,
      walk1: null,
      walk2: null,
      guard1: null,
    });

  const handleSpriteChange = (key, file) =>
    setSpriteFiles((prev) => ({ ...prev, [key]: file }));

  const toHeroId = (name = "") =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    hp: "",
    power: "",
    speed: "",
    ability_cost: "",
    description: "",
    hero_deck: [],
  });

  const setField = (name, value) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const setNumberField = (name, value) =>
    setFormData((p) => ({ ...p, [name]: value === "" ? "" : Number(value) }));

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hero`);
      if (!res.ok) throw new Error("Failed to fetch heroes");
      const data = await res.json();
      setHeroes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert("Error fetching heroes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  // ===== Table Sorting =====
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const sortedHeroes = useMemo(() => {
    const arr = Array.isArray(heroes) ? [...heroes] : [];
    if (!sortBy) return arr;

    const dir = sortDir === "asc" ? 1 : -1;

    const getVal = (h) => {
      switch (sortBy) {
        case "id":
          return h?.id ?? "";
        case "name":
          return h?.name ?? "";
        case "hp":
          return h?.hp ?? null;
        case "power":
          return h?.power ?? null;
        case "speed":
          return h?.speed ?? null;
        case "ability_cost":
          return h?.ability_cost ?? null;
        default:
          return "";
      }
    };

    const isNumberKey = ["hp", "power", "speed", "ability_cost"].includes(sortBy);

    arr.sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);

      const aEmpty = av === null || av === undefined || av === "";
      const bEmpty = bv === null || bv === undefined || bv === "";
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;

      if (isNumberKey) {
        return (Number(av) - Number(bv)) * dir;
      }

      return String(av).localeCompare(String(bv), undefined, {
        numeric: true,
        sensitivity: "base",
      }) * dir;
    });

    return arr;
  }, [heroes, sortBy, sortDir]);

  // ✅ SortableTH component สำหรับ Header ของตาราง
  const SortableTH = ({ colKey, children, tooltip }) => {
    const active = sortBy === colKey;

    return (
      <th
        onClick={() => toggleSort(colKey)}
        style={{
          cursor: "pointer",
          userSelect: "none",
          whiteSpace: "nowrap",
          color: active ? "#ffd54f" : undefined,
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

  const handleAddDeckItem = () => {
    setFormData((prev) => ({
      ...prev,
      hero_deck: [...(prev.hero_deck || []), { effect: "double-dmg", size: 3 }],
    }));
  };

  const handleRemoveDeckItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      hero_deck: prev.hero_deck.filter((_, i) => i !== index),
    }));
  };

  const handleDeckChange = (index, field, value) => {
    setFormData((prev) => {
      const newDeck = [...(prev.hero_deck || [])];
      newDeck[index] = { 
        ...newDeck[index], 
        [field]: field === "size" ? Number(value) : value 
      };
      return { ...prev, hero_deck: newDeck };
    });
  };

  const uploadSpritesStrict7 = async (heroId) => {
    const fd = new FormData();
    fd.append("attack1", spriteFiles.attack1);
    fd.append("attack2", spriteFiles.attack2);
    fd.append("idle1", spriteFiles.idle1);
    fd.append("idle2", spriteFiles.idle2);
    fd.append("walk1", spriteFiles.walk1);
    fd.append("walk2", spriteFiles.walk2);
    fd.append("guard1", spriteFiles.guard1);

    const up = await fetch(`/api/hero/${heroId}/sprites`, {
      method: "POST",
      body: fd,
    });
    if (!up.ok) {
      const err = await up.json().catch(() => ({}));
      throw new Error(err.message || "Hero sprites upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: formData.id,
      name: formData.name,
      hp: formData.hp === "" ? 0 : Number(formData.hp),
      power: formData.power === "" ? 0 : Number(formData.power),
      speed: formData.speed === "" ? 0 : Number(formData.speed),
      ability_cost: formData.ability_cost === "" ? null : Number(formData.ability_cost),
      description: formData.description || null,
      hero_deck: (formData.hero_deck || []).map(item => ({
        effect: item.effect,
        size: Number(item.size) || 1
      })),
    };

    try {
      let url = `/api/hero`;
      let method = "POST";
      if (isEditing) {
        url = `/api/hero/${formData.id}`;
        method = "PUT";
      }

      if (!isEditing) {
        const missing = Object.entries(spriteFiles)
          .filter(([, f]) => !f)
          .map(([k]) => k);
        if (missing.length > 0) {
          alert(`ต้องอัปโหลดรูปครบ 7 รูปก่อนสร้าง Hero\nขาด: ${missing.join(", ")}`);
          return;
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Save failed");
      }

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
        hp: "",
        power: "",
        speed: "",
        ability_cost: "",
        description: "",
        hero_deck: [],
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
      id: h.id ?? "",
      name: h.name ?? "",
      hp: h.hp ?? "",
      power: h.power ?? "",
      speed: h.speed ?? "",
      ability_cost: h.ability_cost ?? "",
      description: h.description ?? "",
      hero_deck: h.hero_deck || [],
    });
    resetSpriteFiles();
    setIsEditing(true);
    document.querySelector(".form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Hero ID: ${id}?`)) return;
    try {
      const res = await fetch(`${API_URL}/hero/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Delete failed");
      }
      alert("Hero deleted!");
      fetchHeroes();
    } catch (err) {
      console.error(err);
      alert(`Error deleting hero: ${err.message}`);
    }
  };

  const handleDeleteSprites = async (id) => {
    if (!window.confirm(`Delete ALL sprites of Hero ID: ${id}?`)) return;
    try {
      const res = await fetch(`/api/hero/${id}/sprites`, { method: "DELETE" });
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
      hp: "",
      power: "",
      speed: "",
      ability_cost: "",
      description: "",
      hero_deck: [],
    });
    resetSpriteFiles();
  };

  return (
    <div className="admin-container">
      <form className="form-box hero-mode" onSubmit={handleSubmit}>
        <h3 className="form-title hero">
          {isEditing ? `EDITING HERO: ${formData.id}` : "NEW HERO"}
        </h3>

        <div className="flex-row">
          <div className="form-field flex-1" data-tooltip="รหัสอ้างอิงฮีโร่ (สร้างอัตโนมัติจากชื่อ)">
            <label className="form-label required">Hero ID</label>
            <input className="input-field" value={formData.id} disabled />
            <span className="form-hint">สร้างอัตโนมัติจาก Name</span>
          </div>

          <div className="form-field flex-2" data-tooltip="ชื่อของฮีโร่ที่จะแสดงในเกม">
            <label className="form-label required">Name</label>
            <input
              className="input-field"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData((p) => {
                  if (isEditing) return { ...p, name };
                  return { ...p, name, id: toHeroId(name) };
                });
              }}
            />
          </div>
        </div>

        <div className="flex-row flex-wrap">
          <div className="form-field" data-tooltip="พลังชีวิตเริ่มต้นของฮีโร่">
            <label className="form-label required">hp</label>
            <input className="input-field" type="number" value={formData.hp} onChange={(e) => setNumberField("hp", e.target.value)} />
          </div>
          <div className="form-field" data-tooltip="พลังโจมตีพื้นฐาน">
            <label className="form-label required">power</label>
            <input className="input-field" type="number" value={formData.power} onChange={(e) => setNumberField("power", e.target.value)} />
          </div>
          <div className="form-field" data-tooltip="ความเร็ว (กำหนดลำดับการโจมตี)">
            <label className="form-label required">speed</label>
            <input className="input-field" type="number" value={formData.speed} onChange={(e) => setNumberField("speed", e.target.value)} />
          </div>
        </div>

        <div className="flex-row">
          <div className="form-field flex-1" data-tooltip="ค่ามานาที่ใช้สำหรับสกิลนี้">
            <label className="form-label">ability_cost</label>
            <input
              className="input-field"
              type="number"
              value={formData.ability_cost}
              onChange={(e) => setNumberField("ability_cost", e.target.value)}
            />
          </div>
        </div>

        <div className="form-field full" data-tooltip="คำอธิบายเพิ่มเติมเกี่ยวกับฮีโร่">
          <label className="form-label">description</label>
          <input
            className="input-field"
            value={formData.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </div>

        {/* จัดการ Hero Deck */}
        <div style={{ width: "100%", marginTop: "15px", padding: "15px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px dashed #555" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#e2e8f0" }} data-tooltip="การ์ดเอฟเฟกต์เริ่มต้นที่ฮีโร่มีในกอง">Hero Deck (Cards)</h4>
          {(formData.hero_deck || []).map((item, index) => (
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
          <button type="button" className="btn" onClick={handleAddDeckItem} style={{ background: "#2b6cb0", marginTop: "10px" }} data-tooltip="เพิ่มการ์ดชนิดใหม่ลงในกอง">
            + Add Card
          </button>
        </div>

        {/* Sprites Upload 7 รูป */}
        <div className="sprite-upload" style={{ marginTop: 15 }}>
          <div className="hint" data-tooltip="อัปโหลดภาพแอนิเมชันให้ครบทั้ง 7 ท่าทาง">
            Hero Sprites (ต้องมี 7 รูป) — Attack x2, Idle x2, Walk x2, Guard x1
            {isEditing && <span className="subhint"> (แก้รูป: เลือกใหม่ให้ครบ 7 แล้วกด UPDATE)</span>}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "10px" }}>
            {Object.keys(spriteFiles).map((k) => (
              <div key={k} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start", padding: "10px", border: "1px dashed #555", borderRadius: "8px" }} data-tooltip={`อัปโหลดรูปภาพสำหรับสถานะ ${k}`}>
                <label style={{ fontSize: 12, color: "#888", fontWeight: "bold", textTransform: "capitalize" }}>{k}</label>
                
                {spriteFiles[k] && (
                  <img 
                    src={URL.createObjectURL(spriteFiles[k])} 
                    alt={`Preview ${k}`} 
                    style={{ width: "80px", height: "80px", objectFit: "contain", border: "1px solid #444", borderRadius: "4px", background: "rgba(0,0,0,0.5)" }} 
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  required={!isEditing}
                  onChange={(e) => handleSpriteChange(k, e.target.files?.[0] || null)}
                  style={{ fontSize: "12px", width: "180px" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`} style={{ flex: 1 }} data-tooltip={isEditing ? "บันทึกการแก้ไข" : "สร้างฮีโร่ตัวใหม่"}>
            {isEditing ? "UPDATE HERO" : "CREATE HERO"}
          </button>
          {isEditing && (
            <button type="button" className="btn btn-cancel" onClick={handleCancel} data-tooltip="ยกเลิกการแก้ไขและล้างฟอร์ม">
              CANCEL
            </button>
          )}
        </div>
      </form>

      {/* Table Section */}
      <div className="table-wrapper">
        {loading ? (
          <p className="loading-center">Loading Heroes...</p>
        ) : (
          <table className="dict-table hero-theme">
            <thead>
              <tr>
                <th data-tooltip="ภาพตัวอย่างแอนิเมชัน">Sprite</th>
                <SortableTH colKey="id" tooltip="รหัสอ้างอิงของฮีโร่">ID</SortableTH>
                <SortableTH colKey="name" tooltip="ชื่อของฮีโร่">Name</SortableTH>
                <SortableTH colKey="hp" tooltip="พลังชีวิตสูงสุด">HP</SortableTH>
                <SortableTH colKey="power" tooltip="พลังโจมตีพื้นฐาน">Power</SortableTH>
                <SortableTH colKey="speed" tooltip="ความเร็ว">Speed</SortableTH>
                <SortableTH colKey="ability_cost" tooltip="ค่าคอสท์ (มานา) สำหรับกดใช้สกิล">Cost</SortableTH>
                <th data-tooltip="จำนวนการ์ดเอฟเฟกต์ในกอง">Deck</th>
                <th data-tooltip="คำอธิบายฮีโร่">Descriptions</th>
                <th data-tooltip="ปุ่มจัดการข้อมูล">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedHeroes.map((h) => (
                <tr key={h.id}>
                  <td>
                    <HeroSpriteLoop id={h.id} />
                  </td>
                  <td className="mono hero-id">{h.id}</td>
                  <td>
                    <strong>{h.name ?? "-"}</strong>
                  </td>
                  <td className="mono">{h.hp ?? "-"}</td>
                  <td className="mono">{h.power ?? "-"}</td>
                  <td className="mono">{h.speed ?? "-"}</td>
                  <td className="mono">{h.ability_cost ?? "-"}</td>
                  <td style={{ fontSize: 12, color: "#48bb78", fontWeight: "bold" }}>
                    Cards: {Array.isArray(h.hero_deck) ? h.hero_deck.length : 0}
                  </td>
                  <td style={{ fontSize: 12, color: "#ccc", maxWidth: 220 }}>
                    {h.description ?? "-"}
                  </td>
                  <td className="action-buttons">
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                      <button className="btn btn-edit" onClick={() => handleEdit(h)} data-tooltip="แก้ไขข้อมูลฮีโร่ตัวนี้">Edit</button>
                      <button className="btn btn-delete" onClick={() => handleDelete(h.id)} data-tooltip="ลบฮีโร่ถาวร">Del</button>
                      <button className="btn" style={{ background: "#444", color: "#fff", whiteSpace: "nowrap" }} onClick={() => handleDeleteSprites(h.id)} data-tooltip="ลบเฉพาะไฟล์รูปภาพ Sprites">
                        Del Sprites
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {heroes.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: 20 }}>No Heroes Found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HeroPanel;