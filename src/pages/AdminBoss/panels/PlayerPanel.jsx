import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "../config"; // ถ้า path ไม่ตรงโปรเจกต์ทิว ให้แก้ให้ถูก

export default function PlayerPanel() {
  const [players, setPlayers] = useState([]);
  const [editedRoles, setEditedRoles] = useState({}); // { username: role }
  const [loading, setLoading] = useState(false);
  const [savingUser, setSavingUser] = useState(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const fetchPlayers = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.get(`${API_URL}/getplayer`);
      if (res.data?.isSuccess) {
        setPlayers(res.data.data || []);
        setEditedRoles({});
      } else {
        setMsg(res.data?.message || "โหลดข้อมูลไม่สำเร็จ");
      }
    } catch (err) {
      setMsg(err.response?.data?.message || err.message);
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

  const getRoleValue = (username, currentRole) => {
    return editedRoles[username] ?? currentRole ?? "player";
  };

  const onChangeRole = (username, role) => {
    setEditedRoles((prev) => ({ ...prev, [username]: role }));
  };

  const hasEdit = (username, currentRole) => {
    return editedRoles[username] && editedRoles[username] !== currentRole;
  };

  const saveRole = async (username) => {
    const p = players.find((x) => x.username === username);
    const newRole = getRoleValue(username, p?.role);

    setSavingUser(username);
    setMsg("");
    try {
      const res = await axios.patch(`${API_URL}/player-role`, {
        username,
        role: newRole,
      });

      if (res.data?.isSuccess) {
        setPlayers((prev) =>
          prev.map((x) =>
            x.username === username ? { ...x, role: res.data.data.role } : x
          )
        );

        setEditedRoles((prev) => {
          const copy = { ...prev };
          delete copy[username];
          return copy;
        });

        setMsg(`อัปเดต role ของ ${username} เป็น ${newRole} แล้ว`);
      } else {
        setMsg(res.data?.message || "อัปเดตไม่สำเร็จ");
      }
    } catch (err) {
      setMsg(err.response?.data?.message || err.message);
    } finally {
      setSavingUser(null);
    }
  };

  return (
    <div>
      {/* แถบค้นหา / รีโหลด (ใช้สไตล์เดียวกับ filter-section) */}
      <div className="filter-section">
        <div className="search-controls">
          <span className="search-icon">🔍</span>

          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา username / email / role"
          />

          <button className="btn btn-neutral" onClick={fetchPlayers} disabled={loading}>
            {loading ? "Loading..." : "Reload"}
          </button>
        </div>

        {msg ? (
          <div className="mt-14 muted" style={{ whiteSpace: "pre-wrap" }}>
            {msg}
          </div>
        ) : null}
      </div>

      {/* ตาราง (ใช้ dict-table + table-wrapper เหมือน DictionaryPanel) */}
      <div className="table-wrapper">
        <table className="dict-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.username}>
                <td className="mono">{p.username}</td>
                <td>{p.email}</td>

                <td>
                  <div className="flex-row align-center">
                    <select
                      className="input-field minw-140"
                      value={getRoleValue(p.username, p.role)}
                      onChange={(e) => onChangeRole(p.username, e.target.value)}
                    >
                      <option value="player">player</option>
                      <option value="admin">admin</option>
                      <option value="adminBoss">adminBoss</option>
                    </select>

                    {hasEdit(p.username, p.role) ? (
                      <span className="muted small">*edited</span>
                    ) : null}
                  </div>
                </td>

                <td className="cell-dim">
                  {p.created_at ? new Date(p.created_at).toLocaleString() : "-"}
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-edit"
                      onClick={() => saveRole(p.username)}
                      disabled={savingUser === p.username || !hasEdit(p.username, p.role)}
                      title="บันทึก role"
                    >
                      {savingUser === p.username ? "Saving..." : "Save"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="loading-center muted">
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