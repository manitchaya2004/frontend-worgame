import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

const ServerControl = ({ serverId = "hell" }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchServer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/server/${serverId}`);
      if (!res.ok) throw new Error("Failed to fetch server");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServer();
    const t = setInterval(fetchServer, 3000);
    return () => clearInterval(t);
  }, [serverId]);

  const toggleServer = async () => {
    if (!data) return;
    try {
      const res = await fetch(`${API_URL}/server/${serverId}/toggle`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Toggle failed");
      }

      const updated = await res.json();
      setData(updated);
    } catch (e) {
      alert(e.message);
    }
  };

  const isClose = !!data?.is_close;

  return (
    <div className="server-control">
      <div className={`server-dot ${isClose ? "off" : "on"}`} />

      <div className="server-meta">
        <div className="server-title">
          SERVER: <span className="mono">{serverId}</span>
        </div>

        <div className="server-sub">
          online: <span className="mono">{data?.online_count ?? 0}</span>
          <span className={`server-badge ${isClose ? "badge-off" : "badge-on"}`}>
            {loading && !data ? "..." : isClose ? "CLOSED" : "OPEN"}
          </span>
        </div>
      </div>

      <button
        className={`server-btn ${isClose ? "open" : "close"}`}
        onClick={toggleServer}
        disabled={!data}
        title="สลับสถานะ true/false เท่านั้น"
      >
        {isClose ? "OPEN SERVER" : "CLOSE SERVER"}
      </button>
    </div>
  );
};

export default ServerControl;
