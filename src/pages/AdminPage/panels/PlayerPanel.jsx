// src/pages/AdminPage/panels/PlayerPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "../config"; // <- อยู่ที่ src/pages/config.js

export default function PlayerPanel() {
  const [players, setPlayers] = useState([]);
  const [editedRoles, setEditedRoles] = useState({}); // { username: role }
  const [loading, setLoading] = useState(false);
  const [savingUser, setSavingUser] = useState(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" }); // type: success|error|info

  const fetchPlayers = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await axios.get(`${API_URL}/getplayer`);
      if (res.data?.isSuccess) {
        setPlayers(res.data.data || []);
        setEditedRoles({});
      } else {
        setMsg({ type: "error", text: res.data?.message || "โหลดข้อมูลไม่สำเร็จ" });
      }
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => {
      return (
        (p.username || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.role || "").toLowerCase().includes(q)
      );
    });
  }, [players, search]);

  const getRoleValue = (username, currentRole) => editedRoles[username] ?? currentRole ?? "player";

  const onChangeRole = (username, role) => {
    setEditedRoles((prev) => ({ ...prev, [username]: role }));
  };

  const hasEdit = (username, currentRole) => editedRoles[username] && editedRoles[username] !== currentRole;

  const saveRole = async (username) => {
    const p = players.find((x) => x.username === username);
    const newRole = getRoleValue(username, p?.role);

    setSavingUser(username);
    setMsg({ type: "", text: "" });

    try {
      const res = await axios.patch(`${API_URL}/player-role`, { username, role: newRole });

      if (res.data?.isSuccess) {
        const updatedRole = res.data?.data?.role ?? newRole;

        setPlayers((prev) =>
          prev.map((x) => (x.username === username ? { ...x, role: updatedRole } : x))
        );

        setEditedRoles((prev) => {
          const copy = { ...prev };
          delete copy[username];
          return copy;
        });

        setMsg({ type: "success", text: `อัปเดต role ของ ${username} เป็น ${updatedRole} แล้ว` });
      } else {
        setMsg({ type: "error", text: res.data?.message || "อัปเดตไม่สำเร็จ" });
      }
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || err.message });
    } finally {
      setSavingUser(null);
    }
  };

  const roleBadgeClass = (role) => {
    if (role === "adminBoss") return "role-badge boss";
    if (role === "admin") return "role-badge admin";
    return "role-badge player";
  };

  return (
    <div>
      {/* TOOLBAR */}
      <div className="form-box" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="form-field">
            <label className="form-label">ค้นหา</label>
            <input
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="username / email / role"
              style={{ minWidth: 260 }}
            />
          </div>

          <button className="btn btn-add" onClick={fetchPlayers} disabled={loading}>
            {loading ? "Loading..." : "Reload"}
          </button>
        </div>

        <div style={{ color: "var(--muted)", fontSize: 12 }}>
          ทั้งหมด: <b style={{ color: "var(--text)" }}>{filtered.length}</b>
        </div>
      </div>

      {/* MESSAGE */}
      {msg.text ? (
        <div className={`alert ${msg.type || "info"}`} style={{ marginBottom: 14 }}>
          {msg.text}
        </div>
      ) : null}

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="dict-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th style={{ width: 160 }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const edited = hasEdit(p.username, p.role);
              const currentRole = p.role || "player";
              const selectedRole = getRoleValue(p.username, currentRole);

              return (
                <tr key={p.username}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <b>{p.username}</b>
                      <span className={roleBadgeClass(currentRole)}>{currentRole}</span>
                      {edited ? <span className="edit-pill">edited</span> : null}
                    </div>
                  </td>

                  <td>{p.email || "-"}</td>

                  <td>
                    <select
                      className="input-field role-select"
                      value={selectedRole}
                      onChange={(e) => onChangeRole(p.username, e.target.value)}
                    >
                      <option value="player">player</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>

                  <td>{p.created_at ? new Date(p.created_at).toLocaleString() : "-"}</td>

                  <td>
                    <button
                      className={`btn ${edited ? "btn-edit" : ""}`}
                      onClick={() => saveRole(p.username)}
                      disabled={!edited || savingUser === p.username}
                      style={{ width: "100%" }}
                    >
                      {savingUser === p.username ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 18, color: "var(--muted)" }}>
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}