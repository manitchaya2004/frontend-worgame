import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "../../../service/supabaseClient";
import { HeroSpriteLoop } from "../components/SpriteLoops";

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

const HERO_BUCKET = "asset";
const HERO_FOLDER = "img_hero";

const buildHeroSpritePath = (heroId, key, fileName = "") => {
  const ext = fileName?.split(".").pop()?.toLowerCase() || "png";

  const map = {
    attack1: "attack-1",
    attack2: "attack-2",
    idle1: "idle-1",
    idle2: "idle-2",
    walk1: "walk-1",
    walk2: "walk-2",
    guard1: "guard-1",
  };

  return `${HERO_FOLDER}/${heroId}-${map[key]}.${ext}`;
};

const toHeroId = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const DECK_EFFECTS = [
  "double-dmg",
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
  "double-shield": { label: "Double Shield", icon: <GiShield />, color: "#2980b9" },
  "mana-plus": { label: "Mana Plus", icon: <GiWaterDrop />, color: "#00bcd4" },
  "shield-plus": { label: "Shield Plus", icon: <GiTrident />, color: "#e67e22" },
  "add_bleed": { label: "Add Bleed", icon: <GiBowieKnife />, color: "#8b0000" },
  "add_poison": { label: "Add Poison", icon: <FaCloud />, color: "#27ae60" },
  "add_stun": { label: "Add Stun", icon: <FaBolt />, color: "#f39c12" },
  "add_blind": { label: "Add Blind", icon: <FaEyeSlash />, color: "#8e44ad" },
  "heal": { label: "Heal", icon: <FaPlus />, color: "#2ecc71" },
  "bless": { label: "Bless", icon: <FaPlus />, color: "#f1c40f" },
  "vampire_fang": { label: "Vampire Fang", icon: <GiFangs />, color: "#8b0000" },
};

const emptyForm = {
  id: "",
  name: "",
  hp: "",
  power: "",
  speed: "",
  ability_cost: "",
  description: "",
  hero_deck: [],
};

const createEmptySpriteFiles = () => ({
  attack1: null,
  attack2: null,
  idle1: null,
  idle2: null,
  walk1: null,
  walk2: null,
  guard1: null,
});

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
            title={current.label}
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

const HeroFormFields = ({
  formData,
  setFormData,
  spriteFiles,
  handleSpriteChange,
  handleAddDeckItem,
  handleRemoveDeckItem,
  handleDeckChange,
  isEditing,
}) => {
  const setField = (name, value) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const setNumberField = (name, value) =>
    setFormData((p) => ({ ...p, [name]: value === "" ? "" : Number(value) }));

  return (
    <>
      <div className="flex-row">
        <div
          className="form-field flex-1"
          data-tooltip="รหัสอ้างอิงฮีโร่ (สร้างอัตโนมัติจากชื่อ)"
        >
          <label className="form-label required">Hero ID</label>
          <input className="input-field" value={formData.id} disabled />
          <span className="form-hint">สร้างอัตโนมัติจาก Name</span>
        </div>

        <div
          className="form-field flex-2"
          data-tooltip="ชื่อของฮีโร่ที่จะแสดงในเกม"
        >
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
          <input
            className="input-field"
            type="number"
            value={formData.hp}
            onChange={(e) => setNumberField("hp", e.target.value)}
          />
        </div>

        <div className="form-field" data-tooltip="พลังโจมตีพื้นฐาน">
          <label className="form-label required">power</label>
          <input
            className="input-field"
            type="number"
            value={formData.power}
            onChange={(e) => setNumberField("power", e.target.value)}
          />
        </div>

        <div className="form-field" data-tooltip="ความเร็ว (กำหนดลำดับการโจมตี)">
          <label className="form-label required">speed</label>
          <input
            className="input-field"
            type="number"
            value={formData.speed}
            onChange={(e) => setNumberField("speed", e.target.value)}
          />
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
        <h4
          style={{ margin: "0 0 10px 0", color: "#e2e8f0" }}
          data-tooltip="การ์ดเอฟเฟกต์เริ่มต้นที่ฮีโร่มีในกอง"
        >
          Hero Deck (Cards)
        </h4>

        {(formData.hero_deck || []).map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "8px",
              alignItems: "center",
            }}
          >
            <div
              className="form-field flex-2"
              style={{ marginBottom: 0 }}
              data-tooltip="เลือกเอฟเฟกต์ของการ์ด"
            >
              <EffectSelect
                value={item.effect}
                options={DECK_EFFECTS}
                onChange={(ef) => handleDeckChange(index, "effect", ef)}
              />
            </div>

            <div
              className="form-field flex-1"
              style={{ marginBottom: 0 }}
              data-tooltip="จำนวนใบของการ์ดชนิดนี้ในกอง"
            >
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

        <button
          type="button"
          className="btn"
          onClick={handleAddDeckItem}
          style={{ background: "#2b6cb0", marginTop: "10px" }}
          data-tooltip="เพิ่มการ์ดชนิดใหม่ลงในกอง"
        >
          + Add Card
        </button>
      </div>

      <div className="sprite-upload" style={{ marginTop: 15 }}>
        <div className="hint" data-tooltip="อัปโหลดภาพแอนิเมชันให้ครบทั้ง 7 ท่าทาง">
          Hero Sprites (ต้องมี 7 รูป) — Attack x2, Idle x2, Walk x2, Guard x1
          {isEditing && (
            <span className="subhint">
              {" "}
              (แก้รูป: เลือกใหม่ให้ครบ 7 แล้วกด UPDATE)
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "10px" }}>
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
              }}
              data-tooltip={`อัปโหลดรูปภาพสำหรับสถานะ ${k}`}
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
                style={{ fontSize: "12px", width: "180px" }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const EditHeroModal = ({
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
            background: "linear-gradient(180deg, #131922 0%, #0e131b 100%)",
            border: "1px solid rgba(59,130,246,0.35)",
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
              background: "linear-gradient(180deg, #131922 0%, #131922 100%)",
              padding: "8px 0 12px",
              zIndex: 2,
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: 24 }}>
                Edit Hero
              </h3>
              <div style={{ color: "#60a5fa", marginTop: 4, fontSize: 13 }}>
                Editing: {formData.id || "-"}
              </div>
            </div>
          </div>

          <form className="form-box hero-mode" onSubmit={handleSubmit} style={{ margin: 0 }}>
            <HeroFormFields
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
                UPDATE HERO
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const HeroPanel = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createForm, setCreateForm] = useState(emptyForm);
  const [createSpriteFiles, setCreateSpriteFiles] = useState(createEmptySpriteFiles());

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSpriteFiles, setEditSpriteFiles] = useState(createEmptySpriteFiles());

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const resetCreateForm = () => {
    setCreateForm(emptyForm);
    setCreateSpriteFiles(createEmptySpriteFiles());
  };

  const resetEditForm = () => {
    setEditForm(emptyForm);
    setEditSpriteFiles(createEmptySpriteFiles());
    setEditOpen(false);
  };

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_heroes");
      if (error) throw error;
      setHeroes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchHeroes error:", e);
      alert(`Error fetching heroes: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const filteredHeroes = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return heroes;

    return heroes.filter((h) =>
      [h.id, h.name, h.description, h.hp, h.power, h.speed, h.ability_cost]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [heroes, searchText]);

  const sortedHeroes = useMemo(() => {
    const arr = Array.isArray(filteredHeroes) ? [...filteredHeroes] : [];
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

      return (
        String(av).localeCompare(String(bv), undefined, {
          numeric: true,
          sensitivity: "base",
        }) * dir
      );
    });

    return arr;
  }, [filteredHeroes, sortBy, sortDir]);

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

  const handleCreateDeckAdd = () => {
    setCreateForm((prev) => ({
      ...prev,
      hero_deck: [...(prev.hero_deck || []), { effect: "double-dmg", size: 3 }],
    }));
  };

  const handleCreateDeckRemove = (index) => {
    setCreateForm((prev) => ({
      ...prev,
      hero_deck: prev.hero_deck.filter((_, i) => i !== index),
    }));
  };

  const handleCreateDeckChange = (index, field, value) => {
    setCreateForm((prev) => {
      const newDeck = [...(prev.hero_deck || [])];
      newDeck[index] = {
        ...newDeck[index],
        [field]: field === "size" ? Number(value) : value,
      };
      return { ...prev, hero_deck: newDeck };
    });
  };

  const handleEditDeckAdd = () => {
    setEditForm((prev) => ({
      ...prev,
      hero_deck: [...(prev.hero_deck || []), { effect: "double-dmg", size: 3 }],
    }));
  };

  const handleEditDeckRemove = (index) => {
    setEditForm((prev) => ({
      ...prev,
      hero_deck: prev.hero_deck.filter((_, i) => i !== index),
    }));
  };

  const handleEditDeckChange = (index, field, value) => {
    setEditForm((prev) => {
      const newDeck = [...(prev.hero_deck || [])];
      newDeck[index] = {
        ...newDeck[index],
        [field]: field === "size" ? Number(value) : value,
      };
      return { ...prev, hero_deck: newDeck };
    });
  };

  const uploadSpritesStrict7 = async (heroId, spriteFiles) => {
    const requiredKeys = ["attack1", "attack2", "idle1", "idle2", "walk1", "walk2", "guard1"];
    const missing = requiredKeys.filter((k) => !spriteFiles[k]);

    if (missing.length > 0) {
      throw new Error(`ต้องอัปโหลดรูปให้ครบ 7 รูป (${missing.join(", ")})`);
    }

    for (const key of requiredKeys) {
      const file = spriteFiles[key];
      const path = buildHeroSpritePath(heroId, key, file.name);

      const { error } = await supabase.storage
        .from(HERO_BUCKET)
        .upload(path, file, {
          upsert: true,
          contentType: file.type || "image/png",
        });

      if (error) {
        throw new Error(`upload ${key} failed: ${error.message}`);
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      p_id: createForm.id,
      p_name: createForm.name || null,
      p_hp: createForm.hp === "" ? 0 : Number(createForm.hp),
      p_power: createForm.power === "" ? 0 : Number(createForm.power),
      p_speed: createForm.speed === "" ? 0 : Number(createForm.speed),
      p_ability_cost: createForm.ability_cost === "" ? null : Number(createForm.ability_cost),
      p_description: createForm.description || null,
      p_hero_deck: (createForm.hero_deck || []).map((item) => ({
        effect: item.effect,
        size: Number(item.size) || 1,
      })),
    };

    try {
      if (!createForm.id || !createForm.name) {
        throw new Error("กรุณากรอกชื่อ Hero");
      }

      const missing = Object.entries(createSpriteFiles)
        .filter(([, f]) => !f)
        .map(([k]) => k);

      if (missing.length > 0) {
        alert(`ต้องอัปโหลดรูปครบ 7 รูปก่อนสร้าง Hero\nขาด: ${missing.join(", ")}`);
        return;
      }

      const { error } = await supabase.rpc("create_hero", payload);
      if (error) throw error;

      await uploadSpritesStrict7(createForm.id, createSpriteFiles);

      alert("Hero Created!");
      resetCreateForm();
      fetchHeroes();
    } catch (err) {
      console.error("handleCreateSubmit error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      p_id: editForm.id,
      p_name: editForm.name || null,
      p_hp: editForm.hp === "" ? 0 : Number(editForm.hp),
      p_power: editForm.power === "" ? 0 : Number(editForm.power),
      p_speed: editForm.speed === "" ? 0 : Number(editForm.speed),
      p_ability_cost: editForm.ability_cost === "" ? null : Number(editForm.ability_cost),
      p_description: editForm.description || null,
      p_hero_deck: (editForm.hero_deck || []).map((item) => ({
        effect: item.effect,
        size: Number(item.size) || 1,
      })),
    };

    try {
      if (!editForm.id || !editForm.name) {
        throw new Error("กรุณากรอกชื่อ Hero");
      }

      const { error } = await supabase.rpc("update_hero", payload);
      if (error) throw error;

      const anySelected = Object.values(editSpriteFiles).some(Boolean);
      if (anySelected) {
        const all7 = Object.values(editSpriteFiles).every(Boolean);
        if (!all7) {
          throw new Error("ถ้าจะแก้รูป ต้องเลือกใหม่ให้ครบทั้ง 7 รูป");
        }
        await uploadSpritesStrict7(editForm.id, editSpriteFiles);
      }

      alert("Hero Updated!");
      resetEditForm();
      fetchHeroes();
    } catch (err) {
      console.error("handleEditSubmit error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const openEditModal = (h) => {
    setEditForm({
      id: h.id ?? "",
      name: h.name ?? "",
      hp: h.hp ?? "",
      power: h.power ?? "",
      speed: h.speed ?? "",
      ability_cost: h.ability_cost ?? "",
      description: h.description ?? "",
      hero_deck: Array.isArray(h.hero_deck) ? h.hero_deck : [],
    });

    setEditSpriteFiles(createEmptySpriteFiles());
    setEditOpen(true);
  };

const deleteHeroSpritesById = async (id) => {
  const paths = [
    `${HERO_FOLDER}/${id}-attack-1.png`,
    `${HERO_FOLDER}/${id}-attack-2.png`,
    `${HERO_FOLDER}/${id}-idle-1.png`,
    `${HERO_FOLDER}/${id}-idle-2.png`,
    `${HERO_FOLDER}/${id}-walk-1.png`,
    `${HERO_FOLDER}/${id}-walk-2.png`,
    `${HERO_FOLDER}/${id}-guard-1.png`,

    `${HERO_FOLDER}/${id}-attack-1.jpg`,
    `${HERO_FOLDER}/${id}-attack-2.jpg`,
    `${HERO_FOLDER}/${id}-idle-1.jpg`,
    `${HERO_FOLDER}/${id}-idle-2.jpg`,
    `${HERO_FOLDER}/${id}-walk-1.jpg`,
    `${HERO_FOLDER}/${id}-walk-2.jpg`,
    `${HERO_FOLDER}/${id}-guard-1.jpg`,

    `${HERO_FOLDER}/${id}-attack-1.jpeg`,
    `${HERO_FOLDER}/${id}-attack-2.jpeg`,
    `${HERO_FOLDER}/${id}-idle-1.jpeg`,
    `${HERO_FOLDER}/${id}-idle-2.jpeg`,
    `${HERO_FOLDER}/${id}-walk-1.jpeg`,
    `${HERO_FOLDER}/${id}-walk-2.jpeg`,
    `${HERO_FOLDER}/${id}-guard-1.jpeg`,

    `${HERO_FOLDER}/${id}-attack-1.webp`,
    `${HERO_FOLDER}/${id}-attack-2.webp`,
    `${HERO_FOLDER}/${id}-idle-1.webp`,
    `${HERO_FOLDER}/${id}-idle-2.webp`,
    `${HERO_FOLDER}/${id}-walk-1.webp`,
    `${HERO_FOLDER}/${id}-walk-2.webp`,
    `${HERO_FOLDER}/${id}-guard-1.webp`,
  ];

  const { data, error } = await supabase.storage.from(HERO_BUCKET).remove(paths);

  if (error) {
    throw new Error(`delete hero sprites failed: ${error.message}`);
  }

  return data;
  };

const handleDelete = async (id) => {
  if (
    !window.confirm(
      `Delete Hero ID: ${id}?\nThis will delete database row and sprite files too.`
    )
  ) {
    return;
  }

  try {
    // 1) ลบไฟล์ sprite ก่อน
    await deleteHeroSpritesById(id);

    // 2) ค่อยลบข้อมูลใน database
    const { error } = await supabase.rpc("delete_hero", { p_id: id });
    if (error) throw error;

    alert("Hero and sprites deleted!");
    fetchHeroes();
  } catch (err) {
    console.error("handleDelete error:", err);
    alert(`Error deleting hero: ${err.message}`);
  }
};

  const handleDeleteSprites = async (id) => {
    if (!window.confirm(`Delete ALL sprites of Hero ID: ${id}?`)) return;

    try {
      const paths = [
        `${HERO_FOLDER}/${id}-attack-1.png`,
        `${HERO_FOLDER}/${id}-attack-2.png`,
        `${HERO_FOLDER}/${id}-idle-1.png`,
        `${HERO_FOLDER}/${id}-idle-2.png`,
        `${HERO_FOLDER}/${id}-walk-1.png`,
        `${HERO_FOLDER}/${id}-walk-2.png`,
        `${HERO_FOLDER}/${id}-guard-1.png`,

        `${HERO_FOLDER}/${id}-attack-1.jpg`,
        `${HERO_FOLDER}/${id}-attack-2.jpg`,
        `${HERO_FOLDER}/${id}-idle-1.jpg`,
        `${HERO_FOLDER}/${id}-idle-2.jpg`,
        `${HERO_FOLDER}/${id}-walk-1.jpg`,
        `${HERO_FOLDER}/${id}-walk-2.jpg`,
        `${HERO_FOLDER}/${id}-guard-1.jpg`,

        `${HERO_FOLDER}/${id}-attack-1.jpeg`,
        `${HERO_FOLDER}/${id}-attack-2.jpeg`,
        `${HERO_FOLDER}/${id}-idle-1.jpeg`,
        `${HERO_FOLDER}/${id}-idle-2.jpeg`,
        `${HERO_FOLDER}/${id}-walk-1.jpeg`,
        `${HERO_FOLDER}/${id}-walk-2.jpeg`,
        `${HERO_FOLDER}/${id}-guard-1.jpeg`,

        `${HERO_FOLDER}/${id}-attack-1.webp`,
        `${HERO_FOLDER}/${id}-attack-2.webp`,
        `${HERO_FOLDER}/${id}-idle-1.webp`,
        `${HERO_FOLDER}/${id}-idle-2.webp`,
        `${HERO_FOLDER}/${id}-walk-1.webp`,
        `${HERO_FOLDER}/${id}-walk-2.webp`,
        `${HERO_FOLDER}/${id}-guard-1.webp`,
      ];

      const { error } = await supabase.storage.from(HERO_BUCKET).remove(paths);
      if (error) throw error;

      alert("Sprites deleted");
      fetchHeroes();
    } catch (err) {
      console.error("handleDeleteSprites error:", err);
      alert(`Error deleting sprites: ${err.message}`);
    }
  };

  return (
    <div className="admin-container">
      <form className="form-box hero-mode" onSubmit={handleCreateSubmit}>
        <h3 className="form-title hero">NEW HERO</h3>

        <HeroFormFields
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

        <div style={{ width: "100%", display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          <button
            type="button"
            className="btn btn-cancel"
            onClick={resetCreateForm}
          >
            RESET
          </button>

          <button
            type="submit"
            className="btn btn-add"
            style={{ flex: 1 }}
            data-tooltip="สร้างฮีโร่ตัวใหม่"
          >
            CREATE HERO
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
          placeholder="Search hero..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <p className="loading-center">Loading Heroes...</p>
        ) : (
          <table className="dict-table hero-theme">
            <thead>
              <tr>
                <th data-tooltip="ภาพตัวอย่างแอนิเมชัน">Sprite</th>
                <SortableTH colKey="id" tooltip="รหัสอ้างอิงของฮีโร่">
                  ID
                </SortableTH>
                <SortableTH colKey="name" tooltip="ชื่อของฮีโร่">
                  Name
                </SortableTH>
                <SortableTH colKey="hp" tooltip="พลังชีวิตสูงสุด">
                  HP
                </SortableTH>
                <SortableTH colKey="power" tooltip="พลังโจมตีพื้นฐาน">
                  Power
                </SortableTH>
                <SortableTH colKey="speed" tooltip="ความเร็ว">
                  Speed
                </SortableTH>
                <SortableTH colKey="ability_cost" tooltip="ค่าคอสท์ (มานา) สำหรับกดใช้สกิล">
                  Cost
                </SortableTH>
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

                  <td className="hero-deck-cell">
                    <div
                      style={{
                        color: "#48bb78",
                        fontWeight: "bold",
                        fontSize: 15,
                        marginBottom: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span>Cards:</span>
                      <span>{Array.isArray(h.hero_deck) ? h.hero_deck.length : 0}</span>
                    </div>

                    {Array.isArray(h.hero_deck) && h.hero_deck.length > 0 && (
                      <div className="hero-deck-scroll">
                        {h.hero_deck.map((card, idx) => {
                          const meta = EFFECT_META[card.effect];
                          return (
                            <div
                              key={idx}
                              style={{
                                color: "#ddd",
                                fontSize: 13,
                                lineHeight: 1.3,
                                padding: "3px 0",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                              }}
                            >
                              {meta ? meta.label : card.effect} (x{card.size})
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>

                  <td className="hero-desc-cell">
                    {h.description ?? "-"}
                  </td>

                  <td className="actions-cell hero-actions-cell">
                    <div className="action-buttons hero-action-buttons">
                      <button
                        type="button"
                        className="btn btn-edit"
                        onClick={() => openEditModal(h)}
                        data-tooltip="แก้ไขข้อมูลฮีโร่ตัวนี้"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-delete"
                        onClick={() => handleDelete(h.id)}
                        data-tooltip="ลบฮีโร่ถาวร"
                      >
                        Del
                      </button>

                      <button
                        type="button"
                        className="btn btn-sprites"
                        onClick={() => handleDeleteSprites(h.id)}
                        data-tooltip="ลบเฉพาะไฟล์รูปภาพ Sprites"
                      >
                        Del Sprites
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {sortedHeroes.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: 20 }}>
                    No Heroes Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <EditHeroModal
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

export default HeroPanel;