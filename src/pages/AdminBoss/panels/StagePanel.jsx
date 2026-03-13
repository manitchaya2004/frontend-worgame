import React, { useCallback, useEffect, useState, useRef } from "react";
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
      // 🌟 เพิ่ม Header Bypass ngrok
      const res = await fetch(`/api/getAllStage`, {
        headers: { "ngrok-skip-browser-warning": "69420" },
      });
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

  const closeSpawn = () => {
    setSelectedStageId("");
    setShowSpawn(false);
  };

  // ✅ upload map
  const uploadMap = async (stageId) => {
    if (!mapFile) return;

    const fd = new FormData();
    fd.append("map", mapFile);

    const up = await fetch(`/api/stage/${stageId}/map`, {
      method: "POST",
      body: fd,
      // 🌟 สำหรับ POST FormData ปกติ Browser จัดการ Header ให้ แต่ใส่เผื่อไว้ถ้าติด
      headers: { "ngrok-skip-browser-warning": "69420" },
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
      money_reward:
        formData.money_reward === "" ? null : Number(formData.money_reward),
      distant_goal:
        formData.distant_goal === "" ? null : Number(formData.distant_goal),
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
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420", // 🌟 เพิ่ม Header
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Save stage failed");
      }

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
      const res = await fetch(`/api/stage/${id}`, {
        method: "DELETE",
        headers: { "ngrok-skip-browser-warning": "69420" },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Delete stage failed");
      }

      if (selectedStageId === id) {
        closeSpawn();
      }

      alert("Stage Deleted!");
      fetchStages();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const openSpawn = (stageId) => {
    if (selectedStageId === stageId && showSpawn) {
      closeSpawn();
      return;
    }
    setSelectedStageId(stageId);
    setShowSpawn(true);

    setTimeout(() => {
      document
        .getElementById(`spawn-inline-${stageId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  // 🌟 Thumbnail map image แบบ Bypass ngrok
  const MapThumb = ({ id }) => {
    const url = `/api/img_map/${id}.png`;
    const [displayUrl, setDisplayUrl] = useState("");
    const [hide, setHide] = useState(false);
    const cache = useRef({});

    useEffect(() => {
      if (cache.current[url]) {
        setDisplayUrl(cache.current[url]);
        return;
      }
      let isMounted = true;
      const fetchThumb = async () => {
        try {
          const res = await fetch(url, {
            headers: { "ngrok-skip-browser-warning": "69420" },
          });
          if (!res.ok) throw new Error();
          const blob = await res.blob();
          const bUrl = URL.createObjectURL(blob);
          if (isMounted) {
            cache.current[url] = bUrl;
            setDisplayUrl(bUrl);
          }
        } catch (e) {
          if (isMounted) setHide(true);
        }
      };
      fetchThumb();
      return () => {
        isMounted = false;
      };
    }, [url]);

    if (hide) return <span className="no-sprite">No Map</span>;
    return <img className="map-thumb" src={displayUrl} alt={`${id} map`} />;
  };

  const sortedStages = [...stages].sort((a, b) => a.orderNo - b.orderNo);

  return (
    <div className="admin-container">
      {/* ... (ส่วน Form เหมือนเดิม) ... */}
      <form className="form-box stage-mode" onSubmit={handleSubmit}>
        <h3 className="form-title stage">
          {isEditing ? `EDITING STAGE: ${formData.id}` : "NEW STAGE"}
        </h3>
        {/* ... (Input Fields ต่างๆ เหมือนเดิม) ... */}
        <div className="flex-row flex-wrap">
          <div className="form-field flex-2 minw-220">
            <label className="form-label required">Stage ID</label>
            <input
              className="input-field"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={isEditing}
            />
          </div>
          <div className="form-field flex-1 minw-140">
            <label className="form-label required">OrderNo</label>
            <input
              className="input-field"
              type="number"
              name="orderNo"
              value={formData.orderNo}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-field full">
          <label className="form-label required">Stage Name</label>
          <input
            className="input-field"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field full">
          <label className="form-label">Description</label>
          <input
            className="input-field"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="flex-row flex-wrap">
          <div className="form-field flex-1 minw-200">
            <label className="form-label">money_reward</label>
            <input
              className="input-field"
              type="number"
              name="money_reward"
              value={formData.money_reward}
              onChange={handleChange}
            />
          </div>
          <div className="form-field flex-1 minw-200">
            <label className="form-label">distant_goal</label>
            <input
              className="input-field"
              type="number"
              name="distant_goal"
              value={formData.distant_goal}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-field full mt-10">
          <label className="form-label">Map Image (PNG)</label>
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
                  background: "rgba(0,0,0,0.5)",
                }}
              />
            </div>
          )}
          <input
            type="file"
            accept="image/png"
            onChange={(e) => setMapFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex-row justify-center mt-20">
          <button
            type="submit"
            className={`btn ${isEditing ? "btn-edit" : "btn-add"}`}
            style={{ flex: 1 }}
          >
            {isEditing ? "UPDATE STAGE" : "CREATE STAGE"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn btn-cancel"
              onClick={resetForm}
            >
              CANCEL
            </button>
          )}
        </div>
      </form>

      <div className="table-wrapper">
        {loading ? (
          <p className="loading-center">Loading Stages.</p>
        ) : (
          <table className="dict-table">
            <thead>
              <tr>
                <th>Map</th>
                <th>ID</th>
                <th>Order</th>
                <th>Name</th>
                <th>Reward/Goal</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStages.map((s) => (
                <React.Fragment key={s.id}>
                  <tr>
                    <td>
                      <MapThumb id={s.id} />
                    </td>
                    <td className="stage-id mono">{s.id}</td>
                    <td>{s.orderNo}</td>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td className="cell-dim">
                      💰 {s.money_reward ?? "-"} | 🎯 {s.distant_goal ?? "-"}
                    </td>
                    <td className="desc-cell w260">{s.description ?? "-"}</td>
                    <td className="actions-cell stage-actions-cell">
                      <div className="action-buttons stage-action-buttons">
                        <button
                          type="button"
                          className="btn btn-edit"
                          onClick={() => handleEdit(s)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-delete"
                          onClick={() => handleDelete(s.id)}
                        >
                          Del
                        </button>
                        <button
                          type="button"
                          className="btn btn-green btn-spawns"
                          onClick={() => openSpawn(s.id)}
                        >
                          {showSpawn && selectedStageId === s.id
                            ? "Close"
                            : "Spawns"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {showSpawn && selectedStageId === s.id && (
                    <tr id={`spawn-inline-${s.id}`}>
                      <td colSpan="7" className="stage-inline-spawn-cell">
                        <SpawnPanel
                          stageId={selectedStageId}
                          onClose={closeSpawn}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const SpawnPanel = ({ stageId, onClose }) => {
  const [spawns, setSpawns] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    monster_id: "",
    level: "A1",
    distant_spawn: "",
  });

  const fetchMonsters = useCallback(async () => {
    try {
      const res = await fetch(`/api/monster`, {
        headers: { "ngrok-skip-browser-warning": "69420" },
      });
      if (!res.ok) throw new Error("Failed to fetch monsters");
      const data = await res.json();
      setMonsters(data);
      if (!formData.monster_id && data?.[0]?.id) {
        setFormData((p) => ({ ...p, monster_id: data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  }, [formData.monster_id]);

  const fetchSpawns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/spawn?stage_id=${encodeURIComponent(stageId)}`,
        {
          headers: { "ngrok-skip-browser-warning": "69420" },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch spawns");
      const data = await res.json();
      setSpawns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [stageId]);

  useEffect(() => {
    fetchMonsters();
  }, [fetchMonsters]);
  useEffect(() => {
    fetchSpawns();
  }, [fetchSpawns, stageId]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save spawn failed");
      alert(isEditing ? "Spawn Updated!" : "Spawn Created!");
      setIsEditing(false);
      setFormData({ id: "", monster_id: "", level: "A1", distant_spawn: "" });
      fetchSpawns();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await fetch(`/api/spawn/${id}`, {
        method: "DELETE",
        headers: { "ngrok-skip-browser-warning": "69420" },
      });
      fetchSpawns();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: 10,
        padding: 12,
        background: "#0f1012",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#68d391",
            fontFamily: '"Press Start 2P"',
            fontSize: 12,
          }}
        >
          MONSTER SPAWNS — STAGE: {stageId}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="btn"
          style={{ minWidth: "34px", background: "#2d3748", color: "#fff" }}
        >
          ✕
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="form-box"
        style={{ borderColor: "#68d391" }}
      >
        <div
          style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}
        >
          <select
            className="input-field"
            name="monster_id"
            value={formData.monster_id}
            onChange={handleChange}
            style={{ flex: 2, minWidth: 240 }}
          >
            <option value="" disabled>
              -- select monster --
            </option>
            {monsters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>
          <input
            className="input-field"
            name="level"
            placeholder="level"
            value={formData.level}
            onChange={handleChange}
            style={{ flex: 1 }}
          />
          <input
            className="input-field"
            type="number"
            name="distant_spawn"
            placeholder="dist"
            value={formData.distant_spawn}
            onChange={handleChange}
            style={{ flex: 1 }}
          />
        </div>
        <button
          type="submit"
          className={`btn ${isEditing ? "btn-edit" : "btn-add"}`}
          style={{ marginTop: 10, width: "100%" }}
        >
          {isEditing ? "UPDATE SPAWN" : "ADD SPAWN"}
        </button>
      </form>

      <div className="table-wrapper">
        <table className="dict-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Monster</th>
              <th>Level</th>
              <th>Dist</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {spawns.map((sp) => (
              <tr key={sp.id}>
                <td style={{ fontFamily: "monospace", color: "#9ad0ff" }}>
                  {sp.id}
                </td>
                <td style={{ fontSize: 12, color: "#ddd" }}>
                  {monsters.find((m) => m.id === sp.monster_id)?.name ||
                    sp.monster_id}
                </td>
                <td>{sp.level}</td>
                <td>{sp.distant_spawn}</td>
                <td className="actions-cell">
                  <button
                    className="btn btn-edit"
                    onClick={() => {
                      setIsEditing(true);
                      setFormData(sp);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(sp.id)}
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StagePanel;
