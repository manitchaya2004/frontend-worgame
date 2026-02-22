// src/pages/AdminPage/panels/HeroPanel.jsx
import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../config";
import { HeroSpriteLoop } from "../components/SpriteLoops";

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

  // ✅ NEW: ทำ ID จาก name (Blue Slime -> blue-slime)
  const toHeroId = (name) => {
    const s = String(name ?? "")
      .trim()
      .toLowerCase()
      // space/underscore -> -
      .replace(/[\s_]+/g, "-")
      // ลบตัวที่ไม่ใช่ a-z 0-9 และ -
      .replace(/[^a-z0-9-]/g, "")
      // ลบ - ซ้ำ
      .replace(/-+/g, "-")
      // ลบ - หัว/ท้าย
      .replace(/^-+|-+$/g, "");
    return s;
  };

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    hp_lv: "",
    power_lv: "",
    speed_lv: "",
    slot_lv: "",
    talk_win: "",
    talk_clear_stage: "",

    // ✅ เพิ่ม ability fields
    ability_code: "",
    ability_description: "",
    ability_cost: "",
  });

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hero`);
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ NEW: name -> id lock (เฉพาะตอน CREATE)
  const handleNameChange = (value) => {
    setFormData((p) => {
      const next = { ...p, name: value };
      if (!isEditing) {
        next.id = toHeroId(value);
      }
      return next;
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
      throw new Error(err.message || "hero sprite upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ กันพลาด: ตอน CREATE ให้ derive id จาก name เสมอ
    const finalId = isEditing ? formData.id : toHeroId(formData.name);

    const payload = {
      id: finalId,
      name: formData.name,
      price: Number(formData.price),
      description: formData.description || null,
      hp_lv: Number(formData.hp_lv),
      power_lv: Number(formData.power_lv),
      speed_lv: Number(formData.speed_lv),
      slot_lv: Number(formData.slot_lv),
      talk_win: formData.talk_win || null,
      talk_clear_stage: formData.talk_clear_stage || null,

      // ✅ เพิ่ม ability fields
      ability_code: formData.ability_code || null,
      ability_description: formData.ability_description || null,
      ability_cost: formData.ability_cost === "" ? null : Number(formData.ability_cost),
    };

    try {
      let url = `/api/hero`;
      let method = "POST";

      if (isEditing) {
        url = `/api/hero/${formData.id}`;
        method = "PUT";
      }

      // ✅ Create ต้องครบ 7 รูป
      if (!isEditing) {
        const missing = Object.entries(spriteFiles)
          .filter(([, f]) => !f)
          .map(([k]) => k);
        if (missing.length > 0) {
          alert(`ต้องอัปโหลดรูปครบ 7 รูปก่อนสร้าง Hero (ขาด: ${missing.join(", ")})`);
          return;
        }

        // ✅ ถ้า name ว่างหรือ derive แล้วว่าง กัน submit
        if (!payload.id) {
          alert("กรุณากรอก Hero Name ก่อน (ID จะสร้างอัตโนมัติ)");
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
        await uploadSpritesStrict7(payload.id);
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
        hp_lv: "",
        power_lv: "",
        speed_lv: "",
        slot_lv: "",
        talk_win: "",
        talk_clear_stage: "",

        // ✅ reset ability fields
        ability_code: "",
        ability_description: "",
        ability_cost: "",
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
      hp_lv: h.hp_lv,
      power_lv: h.power_lv,
      speed_lv: h.speed_lv,
      slot_lv: h.slot_lv,
      talk_win: h.talk_win ?? "",
      talk_clear_stage: h.talk_clear_stage ?? "",

      // ✅ เติม ability fields ตอนกด edit
      ability_code: h.ability_code ?? "",
      ability_description: h.ability_description ?? "",
      ability_cost: h.ability_cost ?? "",
    });
    resetSpriteFiles();
    setIsEditing(true);
    document.querySelector(".form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Hero ID: ${id}?`)) return;
    try {
      const res = await fetch(`/api/hero/${id}`, { method: "DELETE" });
      if (res.ok) fetchHeroes();
      else alert("Delete failed");
    } catch {
      alert("Error deleting hero");
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

  // ✅ FIX: Cancel รีเซ็ต field ให้ถูก (เดิมหลุดเป็น base_str ฯลฯ)
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      name: "",
      price: "",
      description: "",
      hp_lv: "",
      power_lv: "",
      speed_lv: "",
      slot_lv: "",
      talk_win: "",
      talk_clear_stage: "",

      // ✅ reset ability fields
      ability_code: "",
      ability_description: "",
      ability_cost: "",
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
          <div className="form-field flex-1">
            <label className="form-label required">Hero ID</label>
            <input
              className="input-field"
              name="id"
              placeholder="auto from name เช่น sir-nick"
              value={formData.id}
              onChange={handleChange}
              disabled={true}
            />
            <span className="form-hint">
              ล็อคอัตโนมัติจาก Hero Name (พิมพ์เล็ก + เว้นวรรคเป็น -)
            </span>
          </div>

          <div className="form-field flex-2">
            <label className="form-label required">Hero Name</label>
            <input
              className="input-field"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            <span className="form-hint">ชื่อที่แสดงในเกม</span>
          </div>

          <div className="form-field flex-1">
            <label className="form-label required">Price</label>
            <input
              className="input-field"
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
            />
            <span className="form-hint">ราคาซื้อ Hero (หน่วยเป็นเงินในเกม)</span>
          </div>
        </div>

        <div className="form-field full">
          <label className="form-label">Description</label>
          <input
            className="input-field"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
          <span className="form-hint">คำอธิบายสั้น ๆ ของ Hero (ไม่ใส่ได้)</span>
        </div>

        <div style={{ display: "flex", gap: "10px", width: "100%", flexWrap: "wrap" }}>
          <div className="form-field">
            <label className="form-label required">HP LV</label>
            <input className="input-field" type="number" name="hp_lv" value={formData.hp_lv} onChange={handleChange} />
            <span className="form-hint">เลเวลพลังชีวิต</span>
          </div>

          <div className="form-field">
            <label className="form-label required">POWER LV</label>
            <input className="input-field" type="number" name="power_lv" value={formData.power_lv} onChange={handleChange} />
            <span className="form-hint">เลเวลพลังโจมตี</span>
          </div>

          <div className="form-field">
            <label className="form-label required">SPEED LV</label>
            <input className="input-field" type="number" name="speed_lv" value={formData.speed_lv} onChange={handleChange} />
            <span className="form-hint">เลเวลความเร็ว</span>
          </div>

          <div className="form-field">
            <label className="form-label required">SLOT LV</label>
            <input className="input-field" type="number" name="slot_lv" value={formData.slot_lv} onChange={handleChange} />
            <span className="form-hint">จำนวนช่องสกิล / ไอเทม</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <div className="form-field flex-1">
            <label className="form-label">talk_win</label>
            <input className="input-field" name="talk_win" placeholder="talk_win (optional)" value={formData.talk_win} onChange={handleChange} />
            <span className="form-hint">ข้อความพูดเมื่อชนะ (optional)</span>
          </div>

          <div className="form-field flex-1">
            <label className="form-label">talk_clear_stage</label>
            <input className="input-field" name="talk_clear_stage" placeholder="talk_clear_stage (optional)" value={formData.talk_clear_stage} onChange={handleChange} />
            <span className="form-hint">ข้อความพูดเมื่อผ่านด่าน (optional)</span>
          </div>
        </div>

        {/* ✅ Ability fields */}
        <div style={{ display: "flex", gap: "10px", width: "100%", flexWrap: "wrap" }}>
          <div className="form-field flex-1">
            <label className="form-label">ability_code</label>
            <input
              className="input-field"
              name="ability_code"
              placeholder="Ability name"
              value={formData.ability_code}
              onChange={handleChange}
            />
            <span className="form-hint">ชื่อความสามารถ</span>
          </div>

          <div className="form-field flex-2">
            <label className="form-label">ability_description</label>
            <input
              className="input-field"
              name="ability_description"
              placeholder="Ability description"
              value={formData.ability_description}
              onChange={handleChange}
            />
            <span className="form-hint">คำอธิบายความสามารถ</span>
          </div>

          <div className="form-field flex-1">
            <label className="form-label">ability_cost</label>
            <input
              className="input-field"
              type="number"
              name="ability_cost"
              placeholder="Cost"
              value={formData.ability_cost}
              onChange={handleChange}
            />
            <span className="form-hint">ค่าใช้จ่าย/คอสต์</span>
          </div>
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
                <th>Ability</th>
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
                    HP {h.hp_lv} | POWER {h.power_lv} | SPEED {h.speed_lv} | SLOT {h.slot_lv}
                  </td>
                  <td style={{ fontSize: 12, color: "#ddd" }}>
                    <div><strong>{h.ability_code ?? "-"}</strong></div>
                    <div style={{ color: "#bbb" }}>{h.ability_cost ?? "-"}</div>
                  </td>
                  <td style={{ fontSize: 12, color: "#ccc", maxWidth: 220 }}>
                    {h.ability_description ?? "-"}
                    <div style={{ marginTop: 6, color: "#aaa" }}>{h.description ?? "-"}</div>
                  </td>
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
                  <td colSpan="8" style={{ textAlign: "center", padding: 20 }}>No Heroes Found.</td>
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
