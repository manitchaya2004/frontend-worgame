import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../service/supabaseClient";

export default function PlayerPanel() {
  const [players, setPlayers] = useState([]);
  const [editedRoles, setEditedRoles] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingUser, setSavingUser] = useState(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchPlayers = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const { data, error } = await supabase
        .from("player")
        .select("username, email, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPlayers(Array.isArray(data) ? data : []);
      setEditedRoles({});
    } catch (err) {
      console.error("fetchPlayers error:", err);
      setMsg({
        type: "error",
        text: err.message || "โหลดข้อมูลไม่สำเร็จ",
      });
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

  const getRoleValue = (username, currentRole) =>
    editedRoles[username] ?? currentRole ?? "player";

  const onChangeRole = (username, role) => {
    setEditedRoles((prev) => ({ ...prev, [username]: role }));
  };

  const hasEdit = (username, currentRole) =>
    editedRoles[username] && editedRoles[username] !== currentRole;

  const saveRole = async (username) => {
    const p = players.find((x) => x.username === username);
    const newRole = getRoleValue(username, p?.role);

    setSavingUser(username);
    setMsg({ type: "", text: "" });

    try {
      const { data, error } = await supabase
        .from("player")
        .update({ role: newRole })
        .eq("username", username)
        .select("username, email, role, created_at")
        .single();

      if (error) throw error;

      const updatedRole = data?.role ?? newRole;

      setPlayers((prev) =>
        prev.map((x) =>
          x.username === username ? { ...x, role: updatedRole } : x
        )
      );

      setEditedRoles((prev) => {
        const copy = { ...prev };
        delete copy[username];
        return copy;
      });

      setMsg({
        type: "success",
        text: `อัปเดต role ของ ${username} เป็น ${updatedRole} แล้ว`,
      });
    } catch (err) {
      console.error("saveRole error:", err);
      setMsg({
        type: "error",
        text: err.message || "อัปเดตไม่สำเร็จ",
      });
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
      <div className="form-box player-toolbar">
        <div className="player-toolbar-left">
          <div
            className="form-field player-search-field"
            data-tooltip="ค้นหาจาก username, email หรือ role"
          >
            <label className="form-label">ค้นหา</label>
            <input
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="username / email / role"
            />
          </div>

          <button
            className="btn btn-add player-reload-btn"
            onClick={fetchPlayers}
            disabled={loading}
            type="button"
            data-tooltip="โหลดข้อมูลผู้เล่นใหม่อีกครั้ง"
          >
            {loading ? "Loading..." : "Reload"}
          </button>
        </div>

        <div
          className="player-toolbar-total"
          data-tooltip="จำนวนผู้เล่นที่แสดงตามผลการค้นหา"
        >
          ทั้งหมด: <b>{filtered.length}</b>
        </div>
      </div>

      {msg.text ? (
        <div
          className={`alert ${msg.type || "info"}`}
          style={{ marginBottom: 14 }}
          data-tooltip="ข้อความแจ้งผลการทำงาน"
        >
          {msg.text}
        </div>
      ) : null}

      <div className="table-wrapper">
        <table className="dict-table">
          <thead>
            <tr>
              <th data-tooltip="ชื่อผู้ใช้ของผู้เล่น">Username</th>
              <th data-tooltip="อีเมลของผู้เล่น">Email</th>
              <th data-tooltip="สิทธิ์การใช้งานของผู้เล่น">Role</th>
              <th data-tooltip="วันและเวลาที่สร้างบัญชี">Created</th>
              <th style={{ width: 160 }} data-tooltip="บันทึกการเปลี่ยนแปลง role">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const edited = hasEdit(p.username, p.role);
              const currentRole = p.role || "player";
              const selectedRole = getRoleValue(p.username, currentRole);

              return (
                <tr key={p.username}>
                  <td data-tooltip={`Username: ${p.username}`}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <b>{p.username}</b>

                      <span
                        className={roleBadgeClass(currentRole)}
                        data-tooltip={`Role ปัจจุบัน: ${currentRole}`}
                      >
                        {currentRole}
                      </span>

                      {edited ? (
                        <span
                          className="edit-pill"
                          data-tooltip="มีการแก้ไข role แต่ยังไม่ได้บันทึก"
                        >
                          edited
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td data-tooltip={p.email || "ไม่มีอีเมล"}>
                    {p.email || "-"}
                  </td>

                  <td data-tooltip="เลือก role ใหม่ให้ผู้เล่น">
                    <select
                      className="input-field role-select"
                      value={selectedRole}
                      onChange={(e) => onChangeRole(p.username, e.target.value)}
                    >
                      <option value="player">player</option>
                      <option value="admin">admin</option>
                      <option value="adminBoss">adminBoss</option>
                    </select>
                  </td>

                  <td
                    data-tooltip={
                      p.created_at
                        ? `สร้างเมื่อ: ${new Date(p.created_at).toLocaleString()}`
                        : "ไม่มีข้อมูลเวลา"
                    }
                  >
                    {p.created_at ? new Date(p.created_at).toLocaleString() : "-"}
                  </td>

                  <td data-tooltip="กดเพื่อบันทึก role ที่เปลี่ยนไว้">
                    <button
                      className={`btn ${edited ? "btn-edit" : ""}`}
                      onClick={() => saveRole(p.username)}
                      disabled={!edited || savingUser === p.username}
                      style={{ width: "100%" }}
                      type="button"
                      data-tooltip={
                        savingUser === p.username
                          ? "กำลังบันทึกข้อมูล..."
                          : edited
                          ? `บันทึก role ใหม่ของ ${p.username}`
                          : "ยังไม่มีการเปลี่ยนแปลง"
                      }
                    >
                      {savingUser === p.username ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!loading && filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: 18, color: "var(--muted)" }}
                  data-tooltip="ไม่พบผู้เล่นที่ตรงกับคำค้นหา"
                >
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