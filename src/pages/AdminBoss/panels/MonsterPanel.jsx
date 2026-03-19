import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../service/supabaseClient";
import { MonsterSpriteLoop } from "../components/SpriteLoops";

import { AnimatePresence, motion } from "framer-motion";
import {
  GiBroadsword,
  GiShield,
  GiWaterDrop,
  GiTrident,
  GiBowieKnife,
  GiFangs,
} from "react-icons/gi";
import { FaBolt, FaCloud, FaEyeSlash, FaPlus, FaSearch } from "react-icons/fa";

const toSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const MONSTER_BUCKET = "asset";
const MONSTER_FOLDER = "img_monster";

const buildMonsterSpritePath = (monsterId, key, fileName = "") => {
  const ext = fileName?.split(".").pop()?.toLowerCase() || "png";

  const map = {
    attack1: "attack-1",
    attack2: "attack-2",
    idle1: "idle-1",
    idle2: "idle-2",
  };

  return `${MONSTER_FOLDER}/${monsterId}-${map[key]}.${ext}`;
};

const DECK_EFFECTS = [
  "double-dmg",
  "double-guard",
  "double-shield",
  "mana-plus",
  "shield-plus",
  "add_bleed",
  "add_poison",
  "add_stun",
  "add_blind",
  "heal",
  "bless",
  "vampire_fang",
];

const EFFECT_META = {
  "double-dmg": { label: "Double Damage", icon: <GiBroadsword />, color: "#c0392b" },
  "double-guard": { label: "Double Guard", icon: <GiShield />, color: "#2980b9" },
  "double-shield": { label: "Double Shield", icon: <GiShield />, color: "#2980b9" },
  "mana-plus": { label: "Mana Plus", icon: <GiWaterDrop />, color: "#00bcd4" },
  "shield-plus": { label: "Shield Plus", icon: <GiTrident />, color: "#e67e22" },
  "add_bleed": { label: "Add Bleed", icon: <GiBowieKnife />, color: "#8b0000" },
  "add_poison": { label: "Add Poison", icon: <FaCloud />, color: "#27ae60" },
  "add_stun": { label: "Add Stun", icon: <FaBolt />, color: "#f39c12" },
  "add_blind": { label: "Add Blind", icon: <FaEyeSlash />, color: "#8e44ad" },
  heal: { label: "Heal", icon: <FaPlus />, color: "#2ecc71" },
  bless: { label: "Bless", icon: <FaPlus />, color: "#f1c40f" },
  vampire_fang: { label: "Vampire Fang", icon: <GiFangs />, color: "#8b0000" },
};

const emptyMonsterForm = {
  id: "",
  no: "",
  name: "",
  hp: "",
  power: "",
  speed: "",
  exp: "",
  description: "",
  isBoss: false,
  quiz_move_cost: "",
  monster_moves: [],
  monster_deck: [],
};

const EffectSelect = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const current = EFFECT_META[value] || { label: value, icon: null, color: "#666" };

  useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input-field"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          cursor: "pointer",
          paddingRight: 10,
          userSelect: "none",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: current.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 11,
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
              flex: "0 0 auto",
            }}
          >
            {current.icon}
          </span>
          <span style={{ color: "#ddd", fontWeight: 800 }}>{current.label}</span>
        </span>

        <span style={{ color: "#999", fontWeight: 900 }}>{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              zIndex: 999,
              top: "calc(100% + 6px)",
              left: 0,
              width: "100%",
              maxHeight: 260,
              overflowY: "auto",
              background: "rgba(15, 11, 8, 0.96)",
              border: "1px solid #d4af37",
              borderRadius: 8,
              boxShadow: "0 10px 24px rgba(0,0,0,0.65)",
              padding: 6,
            }}
          >
            {options.map((ef) => {
              const meta = EFFECT_META[ef] || { label: ef, icon: null, color: "#666" };
              const active = ef === value;

              return (
                <div
                  key={ef}
                  onClick={() => {
                    onChange(ef);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: active ? "rgba(212,175,55,0.12)" : "transparent",
                    border: active
                      ? "1px solid rgba(212,175,55,0.35)"
                      : "1px solid transparent",
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: meta.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 11,
                      border: "1px solid rgba(255,255,255,0.8)",
                      flex: "0 0 auto",
                    }}
                  >
                    {meta.icon}
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                    <span style={{ color: "#eee", fontWeight: 900, fontSize: 13 }}>
                      {meta.label}
                    </span>
                    <span style={{ color: "#888", fontSize: 11 }}>{ef}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MonsterFormFields = ({
  formData,
  setFormData,
  spriteFiles,
  handleSpriteChange,
  handleAddDeckItem,
  handleRemoveDeckItem,
  handleDeckChange,
  isEditing,
}) => {
  const setField = (name, value) => setFormData((p) => ({ ...p, [name]: value }));
  const setNumberField = (name, value) =>
    setFormData((p) => ({ ...p, [name]: value === "" ? "" : Number(value) }));

  return (
    <>
      <div className="flex-row">
        <div className="form-field flex-1" data-tooltip="รหัสอ้างอิงมอนสเตอร์">
          <label className="form-label required">Monster ID</label>
          <input className="input-field" name="id" value={formData.id} disabled />
          <span className="form-hint">สร้างอัตโนมัติจาก Name</span>
        </div>

        <div className="form-field flex-1">
          <label className="form-label">No</label>
          <input
            className="input-field"
            type="number"
            value={formData.no}
            onChange={(e) => setNumberField("no", e.target.value)}
          />
        </div>

        <div className="form-field flex-2">
          <label className="form-label required">Name</label>
          <input
            className="input-field"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData((p) => {
                if (isEditing) return { ...p, name };
                return { ...p, name, id: toSlug(name) };
              });
            }}
          />
        </div>
      </div>

      <div className="flex-row flex-wrap">
        <div className="form-field">
          <label className="form-label required">HP</label>
          <input
            className="input-field"
            type="number"
            value={formData.hp}
            onChange={(e) => setNumberField("hp", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label required">Power</label>
          <input
            className="input-field"
            type="number"
            value={formData.power}
            onChange={(e) => setNumberField("power", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label required">Speed</label>
          <input
            className="input-field"
            type="number"
            value={formData.speed}
            onChange={(e) => setNumberField("speed", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label required">EXP</label>
          <input
            className="input-field"
            type="number"
            value={formData.exp}
            onChange={(e) => setNumberField("exp", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Quiz Move Cost</label>
          <input
            className="input-field"
            type="number"
            value={formData.quiz_move_cost}
            onChange={(e) => setNumberField("quiz_move_cost", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">isBoss</label>
          <div style={{ display: "flex", alignItems: "center", height: "40px", gap: "10px" }}>
            <input
              type="checkbox"
              id={`isBoss-${isEditing ? "edit" : "create"}`}
              checked={formData.isBoss}
              onChange={(e) => setField("isBoss", e.target.checked)}
              style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#e53e3e" }}
            />
            <label
              htmlFor={`isBoss-${isEditing ? "edit" : "create"}`}
              style={{ color: "#fff", cursor: "pointer", margin: 0, userSelect: "none" }}
            >
              Boss Monster
            </label>
          </div>
        </div>
      </div>

      <div className="form-field full">
        <label className="form-label">Description</label>
        <input
          className="input-field"
          value={formData.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="optional"
          style={{ width: "100%" }}
        />
      </div>

      <div
        style={{
          width: "100%",
          marginTop: "15px",
          padding: "15px",
          background: "rgba(0,0,0,0.2)",
          borderRadius: "8px",
          border: "1px dashed #555",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#e2e8f0" }}>Monster Deck (Cards)</h4>

        {(formData.monster_deck || []).map((item, index) => (
          <div
            key={index}
            style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "center" }}
          >
            <div className="form-field flex-2" style={{ marginBottom: 0 }}>
              <EffectSelect
                value={item.effect}
                options={DECK_EFFECTS}
                onChange={(ef) => handleDeckChange(index, "effect", ef)}
              />
            </div>

            <div className="form-field flex-1" style={{ marginBottom: 0 }}>
              <input
                className="input-field"
                type="number"
                placeholder="Size"
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
            >
              X
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn"
          onClick={handleAddDeckItem}
          style={{ background: "#c53030", marginTop: "10px" }}
        >
          + Add Card
        </button>
      </div>

      <div className="sprite-upload" style={{ marginTop: 15 }}>
        <div className="hint">
          Monster Sprites (ต้องมี 4 รูป) — Attack x2, Idle x2
          {isEditing && (
            <span className="subhint"> (แก้รูป: เลือกใหม่ให้ครบ 4 แล้วกด UPDATE)</span>
          )}
        </div>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>
          {Object.keys(spriteFiles).map((k) => (
            <div
              key={k}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "flex-start",
                padding: "10px",
                border: "1px dashed #555",
                borderRadius: "8px",
                minWidth: 130,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  color: "#888",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                {k}
              </label>

              {spriteFiles[k] && (
                <img
                  src={URL.createObjectURL(spriteFiles[k])}
                  alt={`Preview ${k}`}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    border: "1px solid #444",
                    borderRadius: "4px",
                    background: "rgba(0,0,0,0.5)",
                  }}
                />
              )}

              <input
                type="file"
                accept="image/*"
                required={!isEditing}
                onChange={(e) => handleSpriteChange(k, e.target.files?.[0] || null)}
                style={{ fontSize: "12px" }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const EditMonsterModal = ({
  open,
  formData,
  setFormData,
  spriteFiles,
  handleSpriteChange,
  handleAddDeckItem,
  handleRemoveDeckItem,
  handleDeckChange,
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
            width: "min(1100px, 96vw)",
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 16,
            background: "linear-gradient(180deg, #1a1612 0%, #120f0c 100%)",
            border: "1px solid rgba(212,175,55,0.35)",
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
              background: "linear-gradient(180deg, #1a1612 0%, #1a1612 100%)",
              padding: "8px 0 12px",
              zIndex: 2,
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: 24 }}>
                Edit Monster
              </h3>
              <div style={{ color: "#c9a227", marginTop: 4, fontSize: 13 }}>
                Editing: {formData.id || "-"}
              </div>
            </div>
          </div>

          <form className="form-box monster-mode" onSubmit={handleSubmit} style={{ margin: 0 }}>
            <MonsterFormFields
              formData={formData}
              setFormData={setFormData}
              spriteFiles={spriteFiles}
              handleSpriteChange={handleSpriteChange}
              handleAddDeckItem={handleAddDeckItem}
              handleRemoveDeckItem={handleRemoveDeckItem}
              handleDeckChange={handleDeckChange}
              isEditing={true}
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
                UPDATE MONSTER
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const MonsterPanel = () => {
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createForm, setCreateForm] = useState(emptyMonsterForm);
  const [createSpriteFiles, setCreateSpriteFiles] = useState({
    attack1: null,
    attack2: null,
    idle1: null,
    idle2: null,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyMonsterForm);
  const [editSpriteFiles, setEditSpriteFiles] = useState({
    attack1: null,
    attack2: null,
    idle1: null,
    idle2: null,
  });

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const resetCreateForm = () => {
    setCreateForm(emptyMonsterForm);
    setCreateSpriteFiles({ attack1: null, attack2: null, idle1: null, idle2: null });
  };

  const resetEditForm = () => {
    setEditForm(emptyMonsterForm);
    setEditSpriteFiles({ attack1: null, attack2: null, idle1: null, idle2: null });
    setEditOpen(false);
  };

  const fetchMonsters = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_monsters", {});
      if (error) throw error;
      setMonsters(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert(`Error fetching monster: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonsters();
  }, [fetchMonsters]);

  const toggleSort = (key) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const filteredMonsters = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return monsters;

    return monsters.filter((m) =>
      [m.id, m.name, m.no, m.description]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [monsters, searchText]);

  const sortedMonsters = useMemo(() => {
    const arr = Array.isArray(filteredMonsters) ? [...filteredMonsters] : [];
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

      const aEmpty = av === null || av === undefined || av === "";
      const bEmpty = bv === null || bv === undefined || bv === "";
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;

      if (isBoolKey) return (Number(av) - Number(bv)) * dir;
      if (isNumberKey) return (Number(av) - Number(bv)) * dir;

      return (
        String(av).localeCompare(String(bv), undefined, {
          numeric: true,
          sensitivity: "base",
        }) * dir
      );
    });

    return arr;
  }, [filteredMonsters, sortBy, sortDir]);

  const SortableTH = ({ colKey, children }) => {
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
      >
        {children}
        {active && <span style={{ marginLeft: 6, fontSize: 12 }}>{sortDir === "asc" ? "↑" : "↓"}</span>}
      </th>
    );
  };

  const handleCreateDeckAdd = () => {
    setCreateForm((prev) => ({
      ...prev,
      monster_deck: [...(prev.monster_deck || []), { effect: "double-dmg", size: 3 }],
    }));
  };

  const handleCreateDeckRemove = (index) => {
    setCreateForm((prev) => ({
      ...prev,
      monster_deck: prev.monster_deck.filter((_, i) => i !== index),
    }));
  };

  const handleCreateDeckChange = (index, field, value) => {
    setCreateForm((prev) => {
      const newDeck = [...(prev.monster_deck || [])];
      newDeck[index] = {
        ...newDeck[index],
        [field]: field === "size" ? Number(value) : value,
      };
      return { ...prev, monster_deck: newDeck };
    });
  };

  const handleEditDeckAdd = () => {
    setEditForm((prev) => ({
      ...prev,
      monster_deck: [...(prev.monster_deck || []), { effect: "double-dmg", size: 3 }],
    }));
  };

  const handleEditDeckRemove = (index) => {
    setEditForm((prev) => ({
      ...prev,
      monster_deck: prev.monster_deck.filter((_, i) => i !== index),
    }));
  };

  const handleEditDeckChange = (index, field, value) => {
    setEditForm((prev) => {
      const newDeck = [...(prev.monster_deck || [])];
      newDeck[index] = {
        ...newDeck[index],
        [field]: field === "size" ? Number(value) : value,
      };
      return { ...prev, monster_deck: newDeck };
    });
  };

  const uploadSpritesStrict4 = async (monsterId, spriteFiles) => {
    const requiredKeys = ["attack1", "attack2", "idle1", "idle2"];
    const missing = requiredKeys.filter((k) => !spriteFiles[k]);

    if (missing.length > 0) {
      throw new Error(`ต้องอัปโหลดรูปให้ครบ 4 รูป (${missing.join(", ")})`);
    }

    for (const key of requiredKeys) {
      const file = spriteFiles[key];
      const path = buildMonsterSpritePath(monsterId, key, file.name);

      const { error } = await supabase.storage.from(MONSTER_BUCKET).upload(path, file, {
        upsert: true,
        contentType: file.type || "image/png",
      });

      if (error) throw new Error(`upload ${key} failed: ${error.message}`);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      p_id: createForm.id,
      p_no: createForm.no === "" ? null : Number(createForm.no),
      p_name: createForm.name || null,
      p_hp: createForm.hp === "" ? 0 : Number(createForm.hp),
      p_power: createForm.power === "" ? 0 : Number(createForm.power),
      p_speed: createForm.speed === "" ? 0 : Number(createForm.speed),
      p_exp: createForm.exp === "" ? 0 : Number(createForm.exp),
      p_description: createForm.description || null,
      p_isboss: Boolean(createForm.isBoss),
      p_quiz_move_cost:
        createForm.quiz_move_cost === "" ? null : Number(createForm.quiz_move_cost),
      p_monster_deck: (createForm.monster_deck || []).map((item) => ({
        effect: item.effect,
        size: Number(item.size) || 1,
      })),
    };

    try {
      const missing = Object.entries(createSpriteFiles)
        .filter(([, f]) => !f)
        .map(([k]) => k);

      if (missing.length > 0) {
        alert(`ต้องอัปโหลดรูปครบ 4 รูปก่อนสร้าง Monster (ขาด: ${missing.join(", ")})`);
        return;
      }

      const { error } = await supabase.rpc("create_monster", payload);
      if (error) throw error;

      await uploadSpritesStrict4(createForm.id, createSpriteFiles);

      alert("Monster Created!");
      resetCreateForm();
      fetchMonsters();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      p_id: editForm.id,
      p_no: editForm.no === "" ? null : Number(editForm.no),
      p_name: editForm.name || null,
      p_hp: editForm.hp === "" ? 0 : Number(editForm.hp),
      p_power: editForm.power === "" ? 0 : Number(editForm.power),
      p_speed: editForm.speed === "" ? 0 : Number(editForm.speed),
      p_exp: editForm.exp === "" ? 0 : Number(editForm.exp),
      p_description: editForm.description || null,
      p_isboss: Boolean(editForm.isBoss),
      p_quiz_move_cost:
        editForm.quiz_move_cost === "" ? null : Number(editForm.quiz_move_cost),
      p_monster_deck: (editForm.monster_deck || []).map((item) => ({
        effect: item.effect,
        size: Number(item.size) || 1,
      })),
    };

    try {
      const { error } = await supabase.rpc("update_monster", payload);
      if (error) throw error;

      const anySelected = Object.values(editSpriteFiles).some(Boolean);
      if (anySelected) {
        const all4 = Object.values(editSpriteFiles).every(Boolean);
        if (!all4) throw new Error("ถ้าจะแก้รูป ต้องเลือกใหม่ให้ครบทั้ง 4 รูป");
        await uploadSpritesStrict4(editForm.id, editSpriteFiles);
      }

      alert("Monster Updated!");
      resetEditForm();
      fetchMonsters();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const openEditModal = (m) => {
    setEditForm({
      id: m.id ?? "",
      no: m.no ?? "",
      name: m.name ?? "",
      hp: m.hp ?? 0,
      power: m.power ?? 0,
      speed: m.speed ?? 0,
      exp: m.exp ?? 0,
      description: m.description ?? "",
      isBoss: Boolean(m.isBoss),
      quiz_move_cost: m.quiz_move_cost ?? "",
      monster_moves: [],
      monster_deck: m.monster_deck || [],
    });
    setEditSpriteFiles({ attack1: null, attack2: null, idle1: null, idle2: null });
    setEditOpen(true);
  };

const deleteMonsterSpritesById = async (id) => {
  const paths = [
    `${MONSTER_FOLDER}/${id}-attack-1.png`,
    `${MONSTER_FOLDER}/${id}-attack-2.png`,
    `${MONSTER_FOLDER}/${id}-idle-1.png`,
    `${MONSTER_FOLDER}/${id}-idle-2.png`,

    `${MONSTER_FOLDER}/${id}-attack-1.jpg`,
    `${MONSTER_FOLDER}/${id}-attack-2.jpg`,
    `${MONSTER_FOLDER}/${id}-idle-1.jpg`,
    `${MONSTER_FOLDER}/${id}-idle-2.jpg`,

    `${MONSTER_FOLDER}/${id}-attack-1.jpeg`,
    `${MONSTER_FOLDER}/${id}-attack-2.jpeg`,
    `${MONSTER_FOLDER}/${id}-idle-1.jpeg`,
    `${MONSTER_FOLDER}/${id}-idle-2.jpeg`,

    `${MONSTER_FOLDER}/${id}-attack-1.webp`,
    `${MONSTER_FOLDER}/${id}-attack-2.webp`,
    `${MONSTER_FOLDER}/${id}-idle-1.webp`,
    `${MONSTER_FOLDER}/${id}-idle-2.webp`,
  ];

  const { data, error } = await supabase.storage.from(MONSTER_BUCKET).remove(paths);

  if (error) {
    throw new Error(`delete sprites failed: ${error.message}`);
  }

  return data;
};

const handleDelete = async (id) => {
  if (!window.confirm(`Delete Monster ID: ${id}?\nThis will delete database row and sprite files too.`)) {
    return;
  }

  try {
    // 1) ลบไฟล์ใน Supabase Storage ก่อน
    await deleteMonsterSpritesById(id);

    // 2) ลบข้อมูลใน database
    const { error } = await supabase.rpc("delete_monster", { p_id: id });
    if (error) throw error;

    alert("Monster and sprites deleted!");
    fetchMonsters();
  } catch (err) {
    console.error(err);
    alert(`Error deleting monster: ${err.message}`);
  }
};

  const handleDeleteSprites = async (id) => {
    if (!window.confirm(`Delete ALL sprites of Monster ID: ${id}?`)) return;

    try {
      const paths = [
        `${MONSTER_FOLDER}/${id}-attack-1.png`,
        `${MONSTER_FOLDER}/${id}-attack-2.png`,
        `${MONSTER_FOLDER}/${id}-idle-1.png`,
        `${MONSTER_FOLDER}/${id}-idle-2.png`,
        `${MONSTER_FOLDER}/${id}-attack-1.jpg`,
        `${MONSTER_FOLDER}/${id}-attack-2.jpg`,
        `${MONSTER_FOLDER}/${id}-idle-1.jpg`,
        `${MONSTER_FOLDER}/${id}-idle-2.jpg`,
        `${MONSTER_FOLDER}/${id}-attack-1.jpeg`,
        `${MONSTER_FOLDER}/${id}-attack-2.jpeg`,
        `${MONSTER_FOLDER}/${id}-idle-1.jpeg`,
        `${MONSTER_FOLDER}/${id}-idle-2.jpeg`,
        `${MONSTER_FOLDER}/${id}-attack-1.webp`,
        `${MONSTER_FOLDER}/${id}-attack-2.webp`,
        `${MONSTER_FOLDER}/${id}-idle-1.webp`,
        `${MONSTER_FOLDER}/${id}-idle-2.webp`,
      ];

      const { error } = await supabase.storage.from(MONSTER_BUCKET).remove(paths);
      if (error) throw error;

      alert("Sprites deleted");
      fetchMonsters();
    } catch (err) {
      console.error(err);
      alert(`Error deleting sprites: ${err.message}`);
    }
  };

  return (
    <div>
      <form className="form-box monster-mode" onSubmit={handleCreateSubmit}>
        <h3 className="form-title monster">NEW MONSTER</h3>

        <MonsterFormFields
          formData={createForm}
          setFormData={setCreateForm}
          spriteFiles={createSpriteFiles}
          handleSpriteChange={(key, file) =>
            setCreateSpriteFiles((prev) => ({ ...prev, [key]: file }))
          }
          handleAddDeckItem={handleCreateDeckAdd}
          handleRemoveDeckItem={handleCreateDeckRemove}
          handleDeckChange={handleCreateDeckChange}
          isEditing={false}
        />

        <div
          style={{ width: "100%", display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}
        >
          <button type="submit" className="btn btn-add" style={{ flex: 1 }}>
            CREATE MONSTER
          </button>
          <button type="button" className="btn btn-cancel" onClick={resetCreateForm}>
            RESET
          </button>
        </div>
      </form>

      <div
        style={{
          marginTop: 18,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          maxWidth: 360,
        }}
      >
        <FaSearch style={{ color: "#999" }} />
        <input
          className="input-field"
          type="text"
          placeholder="Search monster..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

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
                <th>Deck</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedMonsters.map((m) => (
                <tr key={m.id}>
                  <td>
                    <MonsterSpriteLoop id={m.id} />
                  </td>
                  <td className="mono monster-id">{m.id}</td>
                  <td className="mono">{m.no ?? "-"}</td>
                  <td>
                    <strong>{m.name ?? "-"}</strong>
                  </td>
                  <td className="mono">{m.hp ?? "-"}</td>
                  <td className="mono">{m.power ?? "-"}</td>
                  <td className="mono">{m.speed ?? "-"}</td>
                  <td className="mono">{m.exp ?? "-"}</td>
                  <td className="mono">
                    {m.isBoss ? (
                      <span style={{ color: "#e53e3e", fontWeight: "bold" }}>TRUE</span>
                    ) : (
                      "false"
                    )}
                  </td>

                  <td style={{ fontSize: 12 }}>
                    <div style={{ color: "#48bb78", fontWeight: "bold" }}>
                      Cards: {Array.isArray(m.monster_deck) ? m.monster_deck.length : 0}
                    </div>

                    {Array.isArray(m.monster_deck) && m.monster_deck.length > 0 && (
                      <div style={{ marginTop: 4, maxHeight: 120, overflowY: "auto", paddingRight: 6 }}>
                        {m.monster_deck.map((card, idx) => {
                          const meta = EFFECT_META[card.effect];
                          return (
                            <div key={idx} style={{ color: "#ccc", fontSize: 11, whiteSpace: "normal" }}>
                              {meta ? meta.label : card.effect} (x{card.size})
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>

                  <td className="actions-cell monster-actions-cell">
                    <div className="action-buttons monster-action-buttons">
                      <button type="button" className="btn btn-edit" onClick={() => openEditModal(m)}>
                        Edit
                      </button>

                      <button type="button" className="btn btn-delete" onClick={() => handleDelete(m.id)}>
                        Del
                      </button>

                      <button
                        type="button"
                        className="btn btn-sprites"
                        onClick={() => handleDeleteSprites(m.id)}
                      >
                        Del Sprites
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {sortedMonsters.length === 0 && (
                <tr>
                  <td colSpan="11" className="center-text" style={{ padding: 20 }}>
                    No Monsters Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <EditMonsterModal
        open={editOpen}
        formData={editForm}
        setFormData={setEditForm}
        spriteFiles={editSpriteFiles}
        handleSpriteChange={(key, file) =>
          setEditSpriteFiles((prev) => ({ ...prev, [key]: file }))
        }
        handleAddDeckItem={handleEditDeckAdd}
        handleRemoveDeckItem={handleEditDeckRemove}
        handleDeckChange={handleEditDeckChange}
        handleSubmit={handleEditSubmit}
        handleClose={resetEditForm}
      />
    </div>
  );
};

export default MonsterPanel;