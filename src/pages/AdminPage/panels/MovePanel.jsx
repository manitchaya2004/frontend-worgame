import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

const MovePanel = () => {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const emptyForm = {
    id: "",
    move_name: "",
    type: "ATTACK",     // ATTACK | GUARD | HEAL | WAIT
    is_quiz: false,
    is_dash: true,
    power: 0,
    debuff_code: "",
    debuff_chance: "",
    debuff_count: "",
    debuff_turn: "",
    target: "PLAYER",   // PLAYER | SELF | ALLY
  };

  const [formData, setFormData] = useState(emptyForm);

  // 1) Fetch Moves
  const fetchMoves = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/moves`);
      if (!res.ok) throw new Error("Failed to fetch moves");
      const data = await res.json();
      // id เป็น string (acid, blind, ...) ให้ sort แบบ string
      setMoves((Array.isArray(data) ? data : []).sort((a, b) => String(a.id).localeCompare(String(b.id))));
    } catch (err) {
      console.error(err);
      alert("Error fetching moves: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoves();
  }, []);

  // 2) Handle Inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // checkbox boolean
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3) Submit (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API_URL}/moves/${formData.id}` : `${API_URL}/moves`;

      // ทำ payload ให้ number เป็น number, ช่องว่าง -> null
      const payload = {
        ...formData,
        power: formData.power === "" ? null : Number(formData.power),
        debuff_chance: formData.debuff_chance === "" ? null : Number(formData.debuff_chance),
        debuff_count: formData.debuff_count === "" ? null : Number(formData.debuff_count),
        debuff_turn: formData.debuff_turn === "" ? null : Number(formData.debuff_turn),
        debuff_code: formData.debuff_code === "" ? null : formData.debuff_code,
        target: formData.target === "" ? null : formData.target,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save move");
      }

      alert(isEditing ? "แก้ไข Move สำเร็จ!" : "เพิ่ม Move สำเร็จ!");
      setFormData(emptyForm);
      setIsEditing(false);
      fetchMoves();
    } catch (err) {
      alert(err.message);
    }
  };

  // 4) Edit
  const handleEdit = (mv) => {
    setFormData({
      id: mv.id ?? "",
      move_name: mv.move_name ?? "",
      type: mv.type ?? "ATTACK",
      is_quiz: !!mv.is_quiz,
      is_dash: !!mv.is_dash,
      power: mv.power ?? 0,
      debuff_code: mv.debuff_code ?? "",
      debuff_chance: mv.debuff_chance ?? "",
      debuff_count: mv.debuff_count ?? "",
      debuff_turn: mv.debuff_turn ?? "",
      target: mv.target ?? "PLAYER",
    });
    setIsEditing(true);
    document.querySelector(".form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  // 5) Delete
  const handleDelete = async (id) => {
    if (!window.confirm(`แน่ใจหรือไม่ที่จะลบ Move ID: ${id}?`)) return;
    try {
      const res = await fetch(`${API_URL}/moves/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete");
      }
      fetchMoves();
    } catch (err) {
      alert(err.message);
    }
  };

  // 6) Cancel
  const handleCancel = () => {
    setIsEditing(false);
    setFormData(emptyForm);
  };

  return (
    <div className="admin-container"> {/* ✅ ครอบด้วย admin-container เพื่อให้ Tooltip ทำงาน */}
      <form className="form-box move-mode" onSubmit={handleSubmit}>
        <h3 style={{ width: "100%", margin: "0 0 15px 0", color: "#2196f3", textAlign: "center", fontFamily: '"Press Start 2P"' }}>
          {isEditing ? `EDIT MOVE: ${formData.id}` : "ADD NEW MOVE"}
        </h3>

        {/* ID + Name */}
        <div style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}>
          <div className="form-field" style={{ minWidth: 200, flex: 1 }} data-tooltip="รหัสอ้างอิงสกิล (ตัวพิมพ์เล็ก/ขีดกลาง)">
            <label className="form-label required">ID</label>
            <input
              className="input-field"
              name="id"
              placeholder="e.g. acid"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={isEditing}
            />
            <span className="form-hint">primary key (แนะนำ lowercase, คั่นด้วย - ได้)</span>
          </div>

          <div className="form-field" style={{ minWidth: 240, flex: 2 }} data-tooltip="ชื่อของสกิลที่จะแสดงผลในเกม">
            <label className="form-label required">move_name</label>
            <input
              className="input-field"
              name="move_name"
              placeholder="e.g. Acid"
              value={formData.move_name}
              onChange={handleChange}
              required
            />
            <span className="form-hint">ชื่อที่แสดงในเกม</span>
          </div>
        </div>

        {/* Type + Power */}
        <div style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}>
          <div className="form-field" style={{ minWidth: 180, flex: 1 }} data-tooltip="ประเภทการทำงานของสกิล (โจมตี, ป้องกัน, ฮีล, รอเทิร์น)">
            <label className="form-label required">type</label>
            <select className="input-field" name="type" value={formData.type} onChange={handleChange} required>
              <option value="ATTACK">ATTACK</option>
              <option value="GUARD">GUARD</option>
              <option value="HEAL">HEAL</option>
              <option value="WAIT">WAIT</option>
            </select>
          </div>

          <div className="form-field" style={{ minWidth: 140, flex: 1 }} data-tooltip="ค่าความรุนแรงพื้นฐานของสกิล">
            <label className="form-label">power</label>
            <input className="input-field" type="number" name="power" value={formData.power} onChange={handleChange} />
          </div>

          <div className="form-field" style={{ minWidth: 180, flex: 1 }} data-tooltip="เป้าหมายที่สกิลจะส่งผล (ผู้เล่น, ตัวเอง, หรือเพื่อนร่วมทีม)">
            <label className="form-label required">target</label>
            <select className="input-field" name="target" value={formData.target} onChange={handleChange} required>
              <option value="PLAYER">PLAYER</option>
              <option value="SELF">SELF</option>
              <option value="ALLY">ALLY</option>
            </select>
          </div>
        </div>

        {/* Flags */}
        <div style={{ display: "flex", gap: 20, width: "100%", flexWrap: "wrap", alignItems: "center" }}>
          <label className="muted" style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }} data-tooltip="สกิลนี้ใช้เฉพาะตอนที่ผู้เล่นตอบคำถาม (Quiz) หรือไม่">
            <input type="checkbox" name="is_quiz" checked={!!formData.is_quiz} onChange={handleChange} />
            is_quiz
          </label>

          <label className="muted" style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }} data-tooltip="หากติ๊ก ผู้ใช้สกิลจะพุ่ง(Dash)เข้าไปหาเป้าหมายก่อนโจมตี">
            <input type="checkbox" name="is_dash" checked={!!formData.is_dash} onChange={handleChange} />
            is_dash
          </label>
        </div>

        {/* Debuff */}
        <div style={{ width: "100%", marginTop: 10 }}>
          <div className="muted mb-8" data-tooltip="ผลกระทบด้านลบที่แถมไปพร้อมกับสกิล">Debuff (ถ้าไม่มี ปล่อยว่างได้)</div>

          <div style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}>
            <div className="form-field" style={{ minWidth: 180, flex: 1 }} data-tooltip="ประเภทของสถานะผิดปกติที่จะเกิดขึ้น">
              <label className="form-label">debuff_code</label>
              <select className="input-field" name="debuff_code" value={formData.debuff_code} onChange={handleChange}>
                <option value="">(none)</option>
                <option value="POISON">POISON</option>
                <option value="BLIND">BLIND</option>
                <option value="BLEED">BLEED</option>
                <option value="STUN">STUN</option>
              </select>
            </div>

            <div className="form-field" style={{ minWidth: 140, flex: 1 }} data-tooltip="โอกาสติดสถานะผิดปกติ (ใส่เป็นเปอร์เซ็นต์ 0-100)">
              <label className="form-label">debuff_chance</label>
              <input className="input-field" type="number" name="debuff_chance" value={formData.debuff_chance} onChange={handleChange} />
            </div>

            <div className="form-field" style={{ minWidth: 140, flex: 1 }} data-tooltip="จำนวนสแตค (Stack) ของสถานะที่จะเพิ่มให้เป้าหมาย">
              <label className="form-label">debuff_count</label>
              <input className="input-field" type="number" name="debuff_count" value={formData.debuff_count} onChange={handleChange} />
            </div>

            <div className="form-field" style={{ minWidth: 140, flex: 1 }} data-tooltip="ระยะเวลาที่เป้าหมายจะติดสถานะนี้ (จำนวนเทิร์น)">
              <label className="form-label">debuff_turn</label>
              <input className="input-field" type="number" name="debuff_turn" value={formData.debuff_turn} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
          <button type="submit" className={`btn ${isEditing ? "btn-edit" : "btn-add"}`} style={{ flex: 1 }} data-tooltip={isEditing ? "บันทึกการแก้ไขสกิล" : "สร้างสกิลใหม่"}>
            {isEditing ? "UPDATE MOVE" : "ADD MOVE"}
          </button>
          {isEditing && (
            <button type="button" className="btn" onClick={handleCancel} style={{ background: "#555", flex: 1 }} data-tooltip="ยกเลิกการแก้ไขและล้างฟอร์ม">
              CANCEL
            </button>
          )}
        </div>
      </form>

      {/* TABLE */}
      <div className="table-wrapper">
        {loading ? (
          <p className="loading-center">Loading Moves...</p>
        ) : (
          <table className="dict-table move-theme">
            <thead>
              <tr>
                <th data-tooltip="รหัสอ้างอิงของสกิล">ID</th>
                <th data-tooltip="ชื่อของสกิลที่แสดงในเกม">move_name</th>
                <th data-tooltip="ประเภทของสกิล">type</th>
                <th data-tooltip="เงื่อนไขพิเศษ (เช่น เป็นคำถาม หรือ พุ่งโจมตี)">flags</th>
                <th data-tooltip="ความรุนแรงพื้นฐานของสกิล">power</th>
                <th data-tooltip="สถานะผิดปกติที่มากับสกิลนี้">debuff</th>
                <th data-tooltip="เป้าหมายหลักของสกิล">target</th>
                <th data-tooltip="ปุ่มจัดการข้อมูล">Actions</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontFamily: "monospace" }}>{m.id}</td>
                  <td><strong>{m.move_name}</strong></td>
                  <td style={{ fontSize: 12, color: "#ddd" }}>{m.type}</td>
                  <td style={{ fontSize: 12, color: "#ccc" }}>
                    quiz: {String(!!m.is_quiz)} <br />
                    dash: {String(!!m.is_dash)}
                  </td>
                  <td>{m.power ?? "-"}</td>
                  <td style={{ fontSize: 12, color: "#ccc" }}>
                    {m.debuff_code ? (
                      <>
                        {m.debuff_code} ({m.debuff_chance ?? "-"}%)<br />
                        x{m.debuff_count ?? "-"} / {m.debuff_turn ?? "-"} turn
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: "#ddd" }}>{m.target ?? "-"}</td>
                  <td className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEdit(m)} data-tooltip="แก้ไขสกิลนี้">Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(m.id)} data-tooltip="ลบสกิลนี้ออกจากระบบถาวร">Del</button>
                  </td>
                </tr>
              ))}
              {moves.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 16 }}>No Moves Found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MovePanel;