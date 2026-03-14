import React, { useEffect, useState, useRef } from "react";
import { API_URL } from "../config";

// --- Sub-Component สำหรับจัดการการโหลดรูปทีละเฟรมแบบมี Cache ---
const SpriteFrame = ({ url, className, alt, onError }) => {
  const [displayUrl, setDisplayUrl] = useState("");
  const cache = useRef({});

  useEffect(() => {
    // 1. ถ้ามีใน Cache แล้ว ใช้ทันที
    if (cache.current[url]) {
      setDisplayUrl(cache.current[url]);
      return;
    }

    let isMounted = true;
    const fetchSprite = async () => {
      try {
        const response = await fetch(url, {
          headers: { "ngrok-skip-browser-warning": "69420" },
        });
        if (!response.ok) throw new Error("Fetch failed");
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        if (isMounted) {
          cache.current[url] = objectUrl;
          setDisplayUrl(objectUrl);
        }
      } catch (err) {
        if (isMounted) onError();
      }
    };

    fetchSprite();
    return () => { isMounted = false; };
  }, [url, onError]);

  return displayUrl ? (
    <img className={className} src={displayUrl} alt={alt} />
  ) : null; // หรือใส่ Loading เล็กๆ ตรงนี้ได้
};

export const MonsterSpriteLoop = ({ id }) => {
  const frames = [
    `${API_URL}/img_monster/${id}-attack-1.png`,
    `${API_URL}/img_monster/${id}-attack-2.png`,
    `${API_URL}/img_monster/${id}-idle-1.png`,
    `${API_URL}/img_monster/${id}-idle-2.png`,
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
    `${API_URL}/img_hero/${id}-attack-1.png`,
    `${API_URL}/img_hero/${id}-attack-2.png`,
    `${API_URL}/img_hero/${id}-idle-1.png`,
    `${API_URL}/img_hero/${id}-idle-2.png`,
    `${API_URL}/img_hero/${id}-walk-1.png`,
    `${API_URL}/img_hero/${id}-walk-2.png`,
    `${API_URL}/img_hero/${id}-guard-1.png`,
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