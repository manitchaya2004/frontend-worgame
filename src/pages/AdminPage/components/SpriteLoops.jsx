import React, { useEffect, useState, useRef, memo } from "react";

// --- Sub-Component สำหรับจัดการการโหลดรูปทีละเฟรมพร้อม Bypass ngrok ---
const SpriteFrame = memo(({ url, className, alt, onError }) => {
  const [displayUrl, setDisplayUrl] = useState("");
  const cache = useRef({}); // ใช้เก็บ Blob URL ที่โหลดแล้ว
  const loadingPath = useRef("");

  // 🌟 ฟังก์ชันเติม Parameter Bypass ngrok เข้าไปใน URL
  const withBypass = (targetUrl) => {
    const connector = targetUrl.includes("?") ? "&" : "?";
    return `${targetUrl}${connector}ngrok-skip-browser-warning=69420`;
  };

  useEffect(() => {
    // 1. ถ้ามีใน Cache แล้ว ใช้จาก Cache ทันที (แก้รูปวาร์ป)
    if (cache.current[url]) {
      setDisplayUrl(cache.current[url]);
      return;
    }

    // 2. ป้องกันการโหลดซ้ำถ้ากำลังโหลด Path นี้อยู่
    if (loadingPath.current === url) return;

    let isMounted = true;
    loadingPath.current = url;

    const fetchSprite = async () => {
      try {
        // 🌟 แก้ไข: ใช้ URL Parameter แทนการใส่ Header ใน fetch
        const response = await fetch(withBypass(url));
        
        if (!response.ok) throw new Error("Fetch failed");
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        if (isMounted) {
          cache.current[url] = objectUrl;
          // สลับรูปใหม่เมื่อโหลดเสร็จสมบูรณ์เท่านั้น เพื่อให้รูปเก่าค้างไว้ก่อน (ป้องกันกะพริบ)
          setDisplayUrl(objectUrl);
          loadingPath.current = "";
        }
      } catch (err) {
        if (isMounted) {
          console.error("Sprite load error:", err);
          loadingPath.current = "";
          onError();
        }
      }
    };

    fetchSprite();
    return () => {
      isMounted = false;
    };
  }, [url, onError]);

  // ล้าง Memory เมื่อ Component ถูกทำลาย
  useEffect(() => {
    return () => {
      Object.values(cache.current).forEach(u => URL.revokeObjectURL(u));
    };
  }, []);

  // ถ้ายังไม่มี URL แสดงผล ให้คืนค่าว่างไปก่อน (หรือจะใส่ Placeholder เล็กๆ ก็ได้)
  if (!displayUrl) return <div className={className} style={{ visibility: 'hidden' }} />;

  return <img className={className} src={displayUrl} alt={alt} />;
});

export const MonsterSpriteLoop = ({ id }) => {
  const frames = [
    `/api/img_monster/${id}-attack-1.png`,
    `/api/img_monster/${id}-attack-2.png`,
    `/api/img_monster/${id}-idle-1.png`,
    `/api/img_monster/${id}-idle-2.png`,
  ];

  const [idx, setIdx] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setHide(false);
    setIdx(0);
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % frames.length), 250);
    return () => clearInterval(t);
  }, [frames.length]);

  if (hide) return <span className="no-sprite">No Sprite</span>;

  return (
    <SpriteFrame
      url={frames[idx]}
      className="sprite"
      alt={`${id} sprite`}
      onError={() => setHide(true)}
    />
  );
};

export const HeroSpriteLoop = ({ id }) => {
  const frames = [
    `/api/img_hero/${id}-attack-1.png`,
    `/api/img_hero/${id}-attack-2.png`,
    `/api/img_hero/${id}-idle-1.png`,
    `/api/img_hero/${id}-idle-2.png`,
    `/api/img_hero/${id}-walk-1.png`,
    `/api/img_hero/${id}-walk-2.png`,
    `/api/img_hero/${id}-guard-1.png`,
  ];

  const [idx, setIdx] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setHide(false);
    setIdx(0);
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % frames.length), 220);
    return () => clearInterval(t);
  }, [frames.length]);

  if (hide) return <span className="no-sprite">No Sprite</span>;

  return (
    <SpriteFrame
      url={frames[idx]}
      className="sprite"
      alt={`${id} hero sprite`}
      onError={() => setHide(true)}
    />
  );
};