import React, { useCallback, useEffect, useState, useRef } from "react";
import { supabase } from "../../../service/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";

const STAGE_BUCKET = "asset";
const MAP_FOLDER = "img_map";
const MONSTER_FOLDER = "img_monster";

const getMapPublicUrl = (id) => {
  const { data } = supabase.storage
    .from(STAGE_BUCKET)
    .getPublicUrl(`${MAP_FOLDER}/${id}.png`);
  return data?.publicUrl || "";
};

const getMonsterPublicUrl = (monsterId, fileName = "attack-1.png") => {
  if (!monsterId) return "";
  const { data } = supabase.storage
    .from(STAGE_BUCKET)
    .getPublicUrl(`${MONSTER_FOLDER}/${monsterId}-${fileName}`);
  return data?.publicUrl || "";
};

const emptyStageForm = {
  id: "",
  orderNo: "",
  name: "",
  description: "",
  money_reward: "",
  distant_goal: "",
};

const StageFormFields = ({
  formData,
  handleChange,
  isEditing,
  mapFile,
  setMapFile,
}) => {
  return (
    <>
      <div className="flex-row flex-wrap">
        <div
          className="form-field flex-2 minw-220"
          data-tooltip="รหัสอ้างอิงของด่าน (ใช้เป็นชื่อไฟล์แผนที่ด้วย)"
        >
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
            ใช้เป็นชื่อไฟล์ map ด้วย → จะเซฟเป็น img_map/{"{id}"}.png
          </span>
        </div>

        <div
          className="form-field flex-1 minw-140"
          data-tooltip="ลำดับของด่านที่จะแสดงในเกม (ตัวเลข)"
        >
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

      <div
        className="form-field full"
        data-tooltip="ชื่อด่านที่จะแสดงให้ผู้เล่นเห็น"
      >
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

      <div
        className="form-field full"
        data-tooltip="คำอธิบายหรือเนื้อเรื่องย่อของด่าน"
      >
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

      <div className="flex-row flex-wrap">
        <div
          className="form-field flex-1 minw-200"
          data-tooltip="จำนวนเงินรางวัลที่จะได้รับเมื่อผ่านด่านนี้"
        >
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

        <div
          className="form-field flex-1 minw-200"
          data-tooltip="ระยะทางที่ผู้เล่นต้องไปให้ถึงเพื่อผ่านด่านนี้"
        >
          <label className="form-label">distant_goal</label>
          <input
            className="input-field"
            type="number"
            name="distant_goal"
            placeholder="optional"
            value={formData.distant_goal}
            onChange={handleChange}
          />
          <span className="form-hint">ระยะเป้าหมาย/เงื่อนไขชนะ (ถ้ามี)</span>
        </div>
      </div>

      <div
        className="form-field full mt-10"
        data-tooltip="อัปโหลดรูปภาพแผนที่ของด่าน (รองรับเฉพาะไฟล์ PNG)"
      >
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
        <span className="form-hint">
          อัปโหลดได้เฉพาะ PNG • ไม่เลือกไฟล์ = ไม่อัปโหลด • ถ้า Edit แล้วเลือกไฟล์ใหม่จะอัปโหลดทับ
        </span>
      </div>
    </>
  );
};

const EditStageModal = ({
  open,
  formData,
  handleChange,
  mapFile,
  setMapFile,
  handleSubmit,
  handleClose,
}) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(980px, 96vw)",
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 16,
            background: "linear-gradient(180deg, #161915 0%, #10130f 100%)",
            border: "1px solid rgba(34,197,94,0.28)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            padding: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
              position: "sticky",
              top: -22,
              background: "linear-gradient(180deg, #161915 0%, #161915 100%)",
              padding: "8px 0 12px",
              zIndex: 2,
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: 24 }}>Edit Stage</h3>
              <div style={{ color: "#68d391", marginTop: 4, fontSize: 13 }}>
                Editing: {formData.id || "-"}
              </div>
            </div>
          </div>

          <form className="form-box stage-mode" onSubmit={handleSubmit} style={{ margin: 0 }}>
            <StageFormFields
              formData={formData}
              handleChange={handleChange}
              isEditing={true}
              mapFile={mapFile}
              setMapFile={setMapFile}
            />

            <div
              style={{
                width: "100%",
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button type="button" className="btn btn-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-edit">
                UPDATE STAGE
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const MonsterThumb = ({ id, size = 64 }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [hide, setHide] = useState(false);

  const frames = [
    getMonsterPublicUrl(id, "attack-1.png"),
    getMonsterPublicUrl(id, "attack-2.png"),
    getMonsterPublicUrl(id, "idle-1.png"),
    getMonsterPublicUrl(id, "idle-2.png"),
  ].filter(Boolean);

  useEffect(() => {
    setHide(false);
    setFrameIndex(0);
  }, [id]);

  useEffect(() => {
    if (frames.length <= 1) return;
    const t = setInterval(() => {
      setFrameIndex((v) => (v + 1) % frames.length);
    }, 280);
    return () => clearInterval(t);
  }, [frames.length]);

  if (!id || hide || frames.length === 0) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          border: "1px dashed #555",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#777",
          fontSize: 11,
          background: "rgba(255,255,255,0.02)",
          flex: "0 0 auto",
        }}
      >
        No Img
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        border: "1px solid rgba(212,175,55,0.35)",
        background: "rgba(0,0,0,0.35)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
      }}
    >
      <img
        src={frames[frameIndex]}
        alt={`${id} monster`}
        onError={() => setHide(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};

const StagePanel = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStageId, setSelectedStageId] = useState("");
  const [showSpawn, setShowSpawn] = useState(false);

  const [createMapFile, setCreateMapFile] = useState(null);
  const [createForm, setCreateForm] = useState(emptyStageForm);

  const [editOpen, setEditOpen] = useState(false);
  const [editMapFile, setEditMapFile] = useState(null);
  const [editForm, setEditForm] = useState(emptyStageForm);

  const fetchStages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_stages");
      if (error) throw error;
      setStages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchStages error:", e);
      alert(`Fetch stages failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const handleCreateChange = (e) =>
    setCreateForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleEditChange = (e) =>
    setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const resetCreateForm = () => {
    setCreateForm(emptyStageForm);
    setCreateMapFile(null);
  };

  const resetEditForm = () => {
    setEditForm(emptyStageForm);
    setEditMapFile(null);
    setEditOpen(false);
  };

  const closeSpawn = () => {
    setSelectedStageId("");
    setShowSpawn(false);
  };

  const uploadMap = async (stageId, mapFile) => {
    if (!mapFile) return;

    const ext = mapFile.name?.split(".").pop()?.toLowerCase();
    if (ext !== "png") {
      throw new Error("อัปโหลดได้เฉพาะไฟล์ PNG");
    }

    const { error } = await supabase.storage
      .from(STAGE_BUCKET)
      .upload(`${MAP_FOLDER}/${stageId}.png`, mapFile, {
        upsert: true,
        contentType: mapFile.type || "image/png",
      });

    if (error) {
      throw new Error(error.message || "map upload failed");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!createForm.id?.trim()) return alert("Stage ID is required");
    if (createForm.orderNo === "" || createForm.orderNo == null) {
      return alert("OrderNo is required");
    }

    const payload = {
      p_id: createForm.id.trim(),
      p_orderno: Number(createForm.orderNo),
      p_name: createForm.name,
      p_description: createForm.description || null,
      p_money_reward:
        createForm.money_reward === "" ? null : Number(createForm.money_reward),
      p_distant_goal:
        createForm.distant_goal === "" ? null : Number(createForm.distant_goal),
    };

    try {
      const { error } = await supabase.rpc("create_stage", payload);
      if (error) throw error;

      if (createMapFile) {
        await uploadMap(createForm.id.trim(), createMapFile);
      }

      alert("Stage Created!");
      resetCreateForm();
      fetchStages();
    } catch (err) {
      console.error("handleCreateSubmit error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editForm.id?.trim()) return alert("Stage ID is required");
    if (editForm.orderNo === "" || editForm.orderNo == null) {
      return alert("OrderNo is required");
    }

    const payload = {
      p_id: editForm.id.trim(),
      p_orderno: Number(editForm.orderNo),
      p_name: editForm.name,
      p_description: editForm.description || null,
      p_money_reward:
        editForm.money_reward === "" ? null : Number(editForm.money_reward),
      p_distant_goal:
        editForm.distant_goal === "" ? null : Number(editForm.distant_goal),
    };

    try {
      const { error } = await supabase.rpc("update_stage", payload);
      if (error) throw error;

      if (editMapFile) {
        await uploadMap(editForm.id.trim(), editMapFile);
      }

      alert("Stage Updated!");
      resetEditForm();
      fetchStages();
    } catch (err) {
      console.error("handleEditSubmit error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const openEditModal = (s) => {
    setEditForm({
      id: s.id,
      orderNo: s.orderNo ?? "",
      name: s.name ?? "",
      description: s.description ?? "",
      money_reward: s.money_reward ?? "",
      distant_goal: s.distant_goal ?? "",
    });
    setEditMapFile(null);
    setEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Stage: ${id} ?\n(จะลบ spawn ในด่านนี้ด้วย)`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc("delete_stage", { p_id: id });
      if (error) throw error;

      const { error: mapError } = await supabase.storage
        .from(STAGE_BUCKET)
        .remove([`${MAP_FOLDER}/${id}.png`]);

      if (mapError) {
        console.warn("delete map warning:", mapError.message);
      }

      if (selectedStageId === id) {
        closeSpawn();
      }

      alert("Stage Deleted!");
      fetchStages();
    } catch (err) {
      console.error("handleDelete error:", err);
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

  const MapThumb = ({ id }) => {
    const url = getMapPublicUrl(id);
    const [hide, setHide] = useState(false);
    const cache = useRef({});

    if (cache.current[id] == null) {
      cache.current[id] = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
    }

    if (hide || !url) return <span className="no-sprite">No Map</span>;

    return (
      <img
        className="map-thumb"
        src={cache.current[id]}
        alt={`${id} map`}
        onError={() => setHide(true)}
      />
    );
  };

  const sortedStages = [...stages].sort(
    (a, b) => Number(a.orderNo ?? 0) - Number(b.orderNo ?? 0)
  );

  return (
    <div className="admin-container">
      <form className="form-box stage-mode" onSubmit={handleCreateSubmit}>
        <h3 className="form-title stage">NEW STAGE</h3>

        <StageFormFields
          formData={createForm}
          handleChange={handleCreateChange}
          isEditing={false}
          mapFile={createMapFile}
          setMapFile={setCreateMapFile}
        />

        <div className="flex-row justify-center mt-20">
          <button
            type="submit"
            className="btn btn-add"
            style={{ flex: 1 }}
            data-tooltip="สร้างด่านใหม่"
          >
            CREATE STAGE
          </button>

          <button
            type="button"
            className="btn btn-cancel"
            onClick={resetCreateForm}
          >
            RESET
          </button>
        </div>
      </form>

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
                <th data-tooltip="เงินรางวัล / ระยะทางเป้าหมาย">
                  Reward/Goal
                </th>
                <th data-tooltip="คำอธิบายรายละเอียดด่าน">Description</th>
                <th data-tooltip="ปุ่มจัดการข้อมูล">Actions</th>
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
                          onClick={() => openEditModal(s)}
                          data-tooltip="แก้ไขข้อมูลด่านนี้"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-delete"
                          onClick={() => handleDelete(s.id)}
                          data-tooltip="ลบด่านและมอนสเตอร์ที่เกิดในด่านนี้ทั้งหมด"
                        >
                          Del
                        </button>

                        <button
                          type="button"
                          className="btn btn-green btn-spawns"
                          onClick={() => openSpawn(s.id)}
                          data-tooltip="จัดการจุดเกิดมอนสเตอร์ (Spawns) ในด่านนี้"
                        >
                          {showSpawn && selectedStageId === s.id ? "Close" : "Spawns"}
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

      <EditStageModal
        open={editOpen}
        formData={editForm}
        handleChange={handleEditChange}
        mapFile={editMapFile}
        setMapFile={setEditMapFile}
        handleSubmit={handleEditSubmit}
        handleClose={resetEditForm}
      />
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
      const { data, error } = await supabase
        .from("monster")
        .select("id, name, no")
        .order("no", { ascending: true });

      if (error) throw error;

      const list = Array.isArray(data) ? data : [];
      setMonsters(list);

      if (!formData.monster_id && list?.[0]?.id) {
        setFormData((p) => ({ ...p, monster_id: list[0].id }));
      }
    } catch (e) {
      console.error("fetchMonsters error:", e);
      alert(`Fetch monsters failed: ${e.message}`);
    }
  }, [formData.monster_id]);

  const fetchSpawns = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_stage_spawns", {
        p_stage_id: stageId,
      });

      if (error) throw error;
      setSpawns(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchSpawns error:", e);
      alert(`Fetch spawns failed: ${e.message}`);
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

    try {
      const { error } = isEditing
        ? await supabase.rpc("update_spawn", {
            p_id: formData.id,
            p_monster_id: formData.monster_id,
            p_level: formData.level,
            p_distant_spawn: Number(formData.distant_spawn),
          })
        : await supabase.rpc("create_spawn", {
            p_stage_id: stageId,
            p_monster_id: formData.monster_id,
            p_level: formData.level,
            p_distant_spawn: Number(formData.distant_spawn),
          });

      if (error) throw error;

      alert(isEditing ? "Spawn Updated!" : "Spawn Created!");
      resetForm();
      fetchSpawns();
    } catch (err) {
      console.error("handleSubmit spawn error:", err);
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
    document
      .getElementById("spawn-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Spawn ID: ${id}?`)) return;
    try {
      const { error } = await supabase.rpc("delete_spawn", { p_id: id });
      if (error) throw error;
      fetchSpawns();
    } catch (err) {
      console.error("handleDelete spawn error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const monsterNameById = (id) => {
    const m = monsters.find((x) => x.id === id);
    return m ? `${m.name} (${m.id})` : id;
  };

  const monsterById = (id) => monsters.find((x) => x.id === id);
  const selectedMonster = monsters.find((m) => m.id === formData.monster_id);

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
          gap: 12,
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
          style={{
            minWidth: "34px",
            height: "30px",
            padding: "0 10px",
            background: "#2d3748",
            color: "#fff",
            lineHeight: 1,
          }}
          data-tooltip="ปิดหน้าต่างจัดการ Spawn"
        >
          ✕
        </button>
      </div>

      <form
        id="spawn-form"
        onSubmit={handleSubmit}
        className="form-box"
        style={{ borderColor: "#68d391" }}
      >
        <div style={{ width: "100%", color: "#aaa", fontSize: 12, marginBottom: 8 }}>
          {isEditing ? `Editing Spawn ID: ${formData.id}` : "Add Spawn"}
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              width: "100%",
              flexWrap: "wrap",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flex: 2,
                minWidth: 320,
                padding: 10,
                border: "1px solid rgba(104,211,145,0.35)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <MonsterThumb id={formData.monster_id} size={72} />

              <div style={{ flex: 1, minWidth: 220 }}>
                <select
                  className="input-field"
                  name="monster_id"
                  value={formData.monster_id}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                  data-tooltip="เลือกมอนสเตอร์ที่จะให้เกิดในด่านนี้"
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

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#b7c9b9",
                    lineHeight: 1.4,
                  }}
                >
                  {selectedMonster ? (
                    <>
                      <div>
                        <strong style={{ color: "#fff" }}>{selectedMonster.name}</strong>
                      </div>
                      <div style={{ color: "#8fb996" }}>ID: {selectedMonster.id}</div>
                      <div style={{ color: "#8fb996" }}>No: {selectedMonster.no ?? "-"}</div>
                    </>
                  ) : (
                    <span style={{ color: "#777" }}>ยังไม่ได้เลือก monster</span>
                  )}
                </div>
              </div>
            </div>

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
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginTop: 14,
          }}
        >
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
                <th data-tooltip="ระยะทางที่มอนสเตอร์ตัวนี้จะเกิดในด่าน">
                  distant_spawn
                </th>
                <th data-tooltip="ปุ่มจัดการข้อมูลจุดเกิด">Actions</th>
              </tr>
            </thead>
            <tbody>
              {spawns.map((sp) => (
                <tr key={sp.id}>
                  <td style={{ fontFamily: "monospace", color: "#9ad0ff" }}>
                    {sp.id}
                  </td>
                  <td style={{ fontSize: 12, color: "#ddd" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <MonsterThumb id={sp.monster_id} size={46} />
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700 }}>
                          {monsterById(sp.monster_id)?.name || sp.monster_id}
                        </div>
                        <div style={{ color: "#8fb996", fontSize: 11 }}>
                          {sp.monster_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{sp.level}</td>
                  <td>{sp.distant_spawn}</td>
                  <td className="actions-cell spawn-actions-cell">
                    <div className="action-buttons spawn-action-buttons">
                      <button
                        type="button"
                        className="btn btn-edit"
                        onClick={() => handleEdit(sp)}
                        data-tooltip="แก้ไขจุดเกิดมอนสเตอร์นี้"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-delete"
                        onClick={() => handleDelete(sp.id)}
                        data-tooltip="ลบจุดเกิดมอนสเตอร์นี้"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {spawns.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: 16 }}>
                    No Spawns in this Stage.
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

export default StagePanel;