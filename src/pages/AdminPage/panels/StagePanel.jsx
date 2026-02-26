// src/pages/AdminPage/panels/StagePanel.jsx
import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../config";

const StagePanel = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Spawn panel state
  const [selectedStageId, setSelectedStageId] = useState("");
  const [showSpawn, setShowSpawn] = useState(false);

  // ✅ Map file (png)
  const [mapFile, setMapFile] = useState(null);

  // Stage form state
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
      const res = await fetch(`/api/getAllStage`);
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

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

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
    setMapFile(null);
  };

  // ✅ upload map (optional)
  const uploadMap = async (stageId) => {
    if (!mapFile) return;

    const fd = new FormData();
    fd.append("map", mapFile);

    const up = await fetch(`/api/stage/${stageId}/map`, {
      method: "POST",
      body: fd,
    });

    if (!up.ok) {
      const err = await up.json().catch(() => ({}));
      throw new Error(err.message || "map upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id?.trim()) return alert("Stage ID is required");
    if (formData.orderNo === "" || formData.orderNo == null)
      return alert("OrderNo is required");

    const payload = {
      id: formData.id.trim(),
      orderNo: Number(formData.orderNo),
      name: formData.name,
      description: formData.description || null,
      money_reward: formData.money_reward === "" ? null : Number(formData.money_reward),
      distant_goal: formData.distant_goal === "" ? null : Number(formData.distant_goal),
    };

    try {
      let url = `/api/stage`;
      let method = "POST";
      if (isEditing) {
        url = `/api/stage/${formData.id}`;
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

      // ✅ ถ้ามีเลือกไฟล์ map ก็อัปโหลดต่อ
      if (mapFile) {
        await uploadMap(formData.id.trim());
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
    setMapFile(null);
    document.querySelector(".form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Stage: ${id} ?\n(จะลบ spawn ในด่านนี้ด้วย)`))
      return;

    try {
      const res = await fetch(`/api/stage/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Delete stage failed");
      }

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
    setTimeout(
      () =>
        document.getElementById("spawn-panel")?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  // Thumbnail map image: /img_map/{id}.png
  const MapThumb = ({ id }) => {
    const url = `/api/img_map/${id}.png`;
    const [hide, setHide] = useState(false);

    if (hide) return <span className="no-sprite">No Map</span>;
    return (
      <img
        className="map-thumb"
        src={url}
        alt={`${id} map`}
        onError={() => setHide(true)}
      />
    );
  };

  return (
    <div className="admin-container"> {/* ✅ เพิ่ม admin-container เพื่อให้ Tooltip ทำงาน */}
      {/* ===== Stage Form ===== */}
      <form className="form-box stage-mode" onSubmit={handleSubmit}>
        <h3 className="form-title stage">
          {isEditing ? `EDITING STAGE: ${formData.id}` : "NEW STAGE"}
        </h3>

        {/* ID + Order */}
        <div className="flex-row flex-wrap">
          <div className="form-field flex-2 minw-220" data-tooltip="รหัสอ้างอิงของด่าน (ใช้เป็นชื่อไฟล์แผนที่ด้วย)">
            <label className="form-label required">Stage ID</label>
            <input
              className="input-field"
              name="id"
              placeholder="e.g. green-grass-1"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={isEditing}
            />
            <span className="form-hint">
              ใช้เป็นชื่อไฟล์ map ด้วย → จะเซฟเป็น img_map/{`{id}`}.png
            </span>
          </div>

          <div className="form-field flex-1 minw-140" data-tooltip="ลำดับของด่านที่จะแสดงในเกม (ตัวเลข)">
            <label className="form-label required">OrderNo</label>
            <input
              className="input-field"
              type="number"
              name="orderNo"
              placeholder="1"
              value={formData.orderNo}
              onChange={handleChange}
              required
            />
            <span className="form-hint">ลำดับด่านที่แสดงในเกม</span>
          </div>
        </div>

        {/* Name */}
        <div className="form-field full" data-tooltip="ชื่อด่านที่จะแสดงให้ผู้เล่นเห็น">
          <label className="form-label required">Stage Name</label>
          <input
            className="input-field"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <span className="form-hint">ชื่อที่แสดงในหน้าเลือกด่าน</span>
        </div>

        {/* Description */}
        <div className="form-field full" data-tooltip="คำอธิบายหรือเนื้อเรื่องย่อของด่าน">
          <label className="form-label">Description</label>
          <input
            className="input-field"
            name="description"
            placeholder="optional"
            value={formData.description}
            onChange={handleChange}
          />
          <span className="form-hint">คำอธิบายสั้น ๆ (ไม่ใส่ได้)</span>
        </div>

        {/* Reward / Goal */}
        <div className="flex-row flex-wrap">
          <div className="form-field flex-1 minw-200" data-tooltip="จำนวนเงินรางวัลที่จะได้รับเมื่อผ่านด่านนี้">
            <label className="form-label">money_reward</label>
            <input
              className="input-field"
              type="number"
              name="money_reward"
              placeholder="optional"
              value={formData.money_reward}
              onChange={handleChange}
            />
            <span className="form-hint">เงินรางวัลหลังผ่านด่าน</span>
          </div>

          <div className="form-field flex-1 minw-200" data-tooltip="ระยะทางที่ผู้เล่นต้องไปให้ถึงเพื่อผ่านด่านนี้">
            <label className="form-label">distant_goal</label>
            <input
              className="input-field"
              type="number"
              name="distant_goal"
              placeholder="optional"
              value={formData.distant_goal}
              onChange={handleChange}
            />
            <span className="form-hint">
              ระยะเป้าหมาย/เงื่อนไขชนะ (ถ้ามี)
            </span>
          </div>
        </div>

        {/* ✅ Map Upload พร้อม Preview */}
        <div className="form-field full mt-10" data-tooltip="อัปโหลดรูปภาพแผนที่ของด่าน (รองรับเฉพาะไฟล์ PNG)">
          <label className="form-label">Map Image (PNG)</label>
          
          {/* ✅ แสดงภาพ Preview หากมีการเลือกไฟล์ */}
          {mapFile && (
            <div style={{ marginBottom: "10px" }}>
              <img 
                src={URL.createObjectURL(mapFile)} 
                alt="Map Preview" 
                style={{ 
                  maxWidth: "200px", 
                  maxHeight: "150px", 
                  objectFit: "contain", 
                  border: "1px solid #444", 
                  borderRadius: "4px", 
                  background: "rgba(0,0,0,0.5)" 
                }} 
              />
            </div>
          )}

          <input
            type="file"
            accept="image/png"
            onChange={(e) => setMapFile(e.target.files?.[0] || null)}
          />
          <span className="form-hint">
            อัปโหลดได้เฉพาะ PNG • ไม่เลือกไฟล์ = ไม่อัปโหลด • ถ้า Edit แล้วเลือกไฟล์ใหม่จะอัปโหลดทับ
          </span>
        </div>

        <div className="flex-row justify-center mt-20">
          <button
            type="submit"
            className={`btn ${isEditing ? "btn-edit" : "btn-add"}`}
            style={{ flex: 1 }}
            data-tooltip={isEditing ? "บันทึกการแก้ไขด่าน" : "สร้างด่านใหม่"}
          >
            {isEditing ? "UPDATE STAGE" : "CREATE STAGE"}
          </button>

          {isEditing && (
            <button type="button" className="btn btn-cancel" onClick={resetForm} data-tooltip="ยกเลิกการแก้ไขและล้างฟอร์ม">
              CANCEL
            </button>
          )}
        </div>
      </form>

      {/* ===== Stage Table ===== */}
      <div className="table-wrapper">
        {loading ? (
          <p className="loading-center">Loading Stages.</p>
        ) : (
          <table className="dict-table">
            <thead>
              <tr>
                <th data-tooltip="ภาพตัวอย่างแผนที่ของด่าน">Map</th>
                <th data-tooltip="รหัสอ้างอิงด่าน (ใช้ผูกข้อมูล)">ID</th>
                <th data-tooltip="ลำดับของด่าน">Order</th>
                <th data-tooltip="ชื่อด่าน">Name</th>
                <th data-tooltip="เงินรางวัล / ระยะทางเป้าหมาย">Reward/Goal</th>
                <th data-tooltip="คำอธิบายรายละเอียดด่าน">Description</th>
                <th data-tooltip="ปุ่มจัดการข้อมูล">Actions</th>
              </tr>
            </thead>

            <tbody>
              {stages.map((s) => (
                <tr key={s.id}>
                  <td><MapThumb id={s.id} /></td>
                  <td className="stage-id mono">{s.id}</td>
                  <td>{s.orderNo}</td>
                  <td><strong>{s.name}</strong></td>
                  <td className="cell-dim">
                    💰 {s.money_reward ?? "-"} | 🎯 {s.distant_goal ?? "-"}
                  </td>
                  <td className="desc-cell w260">{s.description ?? "-"}</td>
                  <td className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEdit(s)} data-tooltip="แก้ไขข้อมูลด่านนี้">Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(s.id)} data-tooltip="ลบด่านและมอนสเตอร์ที่เกิดในด่านนี้ทั้งหมด">Del</button>
                    <button className="btn btn-green" onClick={() => openSpawn(s.id)} data-tooltip="จัดการจุดเกิดมอนสเตอร์ (Spawns) ในด่านนี้">Spawns</button>
                  </td>
                </tr>
              ))}

              {stages.length === 0 && (
                <tr>
                  <td colSpan="7" className="center-text" style={{ padding: 20 }}>
                    No Stages Found.
                  </td>
                </tr>
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
    id: "",
    monster_id: "",
    level: "A1",
    distant_spawn: "",
  });

  const fetchMonsters = useCallback(async () => {
    try {
      const res = await fetch(`/api/monster`);
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
      const res = await fetch(`/api/spawn?stage_id=${encodeURIComponent(stageId)}`);
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

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

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
      let url = `/api/spawn`;
      let method = "POST";
      if (isEditing) {
        url = `/api/spawn/${formData.id}`;
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
      const res = await fetch(`/api/spawn/${id}`, { method: "DELETE" });
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
          <select 
            className="input-field" 
            name="monster_id" 
            value={formData.monster_id} 
            onChange={handleChange} 
            style={{ flex: 2, minWidth: 240 }}
            data-tooltip="เลือกมอนสเตอร์ที่จะให้เกิดในด่านนี้"
          >
            <option value="" disabled>-- select monster --</option>
            {monsters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>

          <input 
            className="input-field" 
            name="level" 
            placeholder="level (e.g. A1)" 
            value={formData.level} 
            onChange={handleChange} 
            style={{ flex: 1, minWidth: 140 }} 
            data-tooltip="ระดับความยากหรือรูปแบบสเตตัสของมอนสเตอร์ (เช่น A1)"
          />

          <input
            className="input-field"
            type="number"
            name="distant_spawn"
            placeholder="distant_spawn"
            value={formData.distant_spawn}
            onChange={handleChange}
            style={{ flex: 1, minWidth: 180 }}
            data-tooltip="ระยะทางในด่านที่ผู้เล่นเดินไปถึง แล้วมอนสเตอร์ตัวนี้จะเกิด"
          />
        </div>

        <div style={{ width: "100%", display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
          <button 
            type="submit" 
            className={`btn ${isEditing ? "btn-edit" : "btn-add"}`} 
            style={{ flex: 1 }}
            data-tooltip={isEditing ? "บันทึกการแก้ไขจุดเกิด" : "เพิ่มจุดเกิดมอนสเตอร์"}
          >
            {isEditing ? "UPDATE SPAWN" : "ADD SPAWN"}
          </button>
          {isEditing && (
            <button 
              type="button" 
              className="btn" 
              onClick={resetForm} 
              style={{ background: "#555", flex: 1 }}
              data-tooltip="ยกเลิกการแก้ไข"
            >
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
                <th data-tooltip="รหัสอ้างอิงของจุดเกิด (สร้างอัตโนมัติ)">ID</th>
                <th data-tooltip="ชื่อและรหัสของมอนสเตอร์">Monster</th>
                <th data-tooltip="ระดับของมอนสเตอร์ (Level)">Level</th>
                <th data-tooltip="ระยะทางที่มอนสเตอร์ตัวนี้จะเกิดในด่าน">distant_spawn</th>
                <th data-tooltip="ปุ่มจัดการข้อมูลจุดเกิด">Actions</th>
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
                    <button className="btn btn-edit" onClick={() => handleEdit(sp)} data-tooltip="แก้ไขจุดเกิดมอนสเตอร์นี้">Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(sp.id)} data-tooltip="ลบจุดเกิดมอนสเตอร์นี้">Del</button>
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

export default StagePanel;