import React, { useEffect, useState } from "react";
import { supabase } from "../../../service/supabaseClient";

const ServerControl = ({ serverId = "hell" }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchServer = async () => {
    // console.log("👉 1. กำลังเริ่มดึงข้อมูล Server...");
    try {
      // console.log("👉 2. กำลังเชื่อมต่อ Supabase...");
      let { data: serverData, error } = await supabase
        .from("server_status")
        .select("*")
        .eq("id", serverId)
        .maybeSingle(); 

      // console.log("👉 3. ผลลัพธ์จาก Supabase:", serverData, "Error:", error);

      if (error) throw error;

      if (!serverData) {
        // console.log(`👉 4. ไม่พบเซิร์ฟเวอร์ ${serverId} กำลังสร้างให้ใหม่...`);
        const { data: newData, error: insertError } = await supabase
          .from("server_status")
          .insert([{ id: serverId, online_count: 0, is_close: false }])
          .select()
          .single();
          
        if (insertError) throw insertError;
        serverData = newData;
      }

      setData(serverData);
      // console.log("👉 5. อัปเดตข้อมูลขึ้นหน้าจอสำเร็จ!");
    } catch (e) {
      // console.error("❌ ขัดข้องที่ fetchServer:", e.message || e);
      setData(null);
    } finally {
      setLoading(false);
      // console.log("👉 6. ปิดหน้าต่าง Loading (เลิกหมุนติ้ว)");
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
      const newStatus = !data.is_close;
      //console.log(`กำลังเปลี่ยนสถานะเป็น: ${newStatus ? 'ปิด' : 'เปิด'}`);
      
      const { data: updatedData, error } = await supabase
        .from("server_status")
        .update({ is_close: newStatus, updated_at: new Date().toISOString() })
        .eq("id", serverId)
        .select()
        .single();

      if (error) throw error;
      
      setData(updatedData); 
    } catch (e) {
      alert("Toggle failed: " + e.message);
    }
  };

  const isClose = !!data?.is_close;

  return (
    <div className={`server-control ${isClose ? "is-closed" : "is-open"} ${loading ? "is-loading" : ""}`}>
      <div className={`server-dot ${isClose ? "off" : "on"}`} />

      <div className="server-meta">
        <div className="server-title-row">
          <span className="server-label">SERVER</span>
          <span className="server-id mono">{serverId}</span>
        </div>

        <div className="server-sub-row">
          <span className="server-online">
            online {data?.online_count > 0 && (
              <span className="mono server-online-count">{data.online_count}</span>
            )}
          </span>

          <span className={`server-badge ${isClose ? "badge-off" : "badge-on"}`}>
            {loading && !data ? "LOADING" : isClose ? "CLOSED" : "OPEN"}
          </span>
        </div>
      </div>

      <button
        className="btn-toggle-server"
        onClick={toggleServer}
        disabled={loading}
      >
        {isClose ? "OPEN SERVER" : "CLOSE SERVER"}
      </button>
    </div>
  );
};

export default ServerControl;