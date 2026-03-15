import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../service/supabaseClient";

const HERO_BUCKET = "asset";
const HERO_FOLDER = "img_hero";
const MONSTER_BUCKET = "asset";
const MONSTER_FOLDER = "img_monster";

const tryExts = ["png", "jpg", "jpeg", "webp"];

const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || "";
};

const SpriteFrame = ({ url, className, alt, onError }) => {
  return <img className={className} src={url} alt={alt} onError={onError} />;
};

export const HeroSpriteLoop = ({ id }) => {
  const candidates = useMemo(
    () => [
      [`${HERO_FOLDER}/${id}-attack-1`, "attack-1"],
      [`${HERO_FOLDER}/${id}-attack-2`, "attack-2"],
      [`${HERO_FOLDER}/${id}-idle-1`, "idle-1"],
      [`${HERO_FOLDER}/${id}-idle-2`, "idle-2"],
      [`${HERO_FOLDER}/${id}-walk-1`, "walk-1"],
      [`${HERO_FOLDER}/${id}-walk-2`, "walk-2"],
      [`${HERO_FOLDER}/${id}-guard-1`, "guard-1"],
    ],
    [id]
  );

  const [frames, setFrames] = useState([]);
  const [idx, setIdx] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadFrames = async () => {
      const urls = [];

      for (const [basePath] of candidates) {
        let found = "";
        for (const ext of tryExts) {
          const url = getPublicUrl(HERO_BUCKET, `${basePath}.${ext}`);
          found = url;
          break;
        }
        if (found) urls.push(found);
      }

      if (!cancelled) {
        setFrames(urls);
        setIdx(0);
        setHide(urls.length === 0);
      }
    };

    loadFrames();
    return () => {
      cancelled = true;
    };
  }, [candidates]);

  useEffect(() => {
    if (frames.length <= 1) return;
    const t = setInterval(() => {
      setIdx((v) => (v + 1) % frames.length);
    }, 220);
    return () => clearInterval(t);
  }, [frames]);

  if (hide || frames.length === 0) return <span className="no-sprite">No Sprite</span>;

  return (
    <SpriteFrame
      url={frames[idx]}
      className="sprite"
      alt={`${id} hero sprite`}
      onError={() => setHide(true)}
    />
  );
};

export const MonsterSpriteLoop = ({ id }) => {
  const candidates = useMemo(
    () => [
      [`${MONSTER_FOLDER}/${id}-attack-1`, "attack-1"],
      [`${MONSTER_FOLDER}/${id}-attack-2`, "attack-2"],
      [`${MONSTER_FOLDER}/${id}-idle-1`, "idle-1"],
      [`${MONSTER_FOLDER}/${id}-idle-2`, "idle-2"],
    ],
    [id]
  );

  const [frames, setFrames] = useState([]);
  const [idx, setIdx] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadFrames = async () => {
      const urls = [];

      for (const [basePath] of candidates) {
        let found = "";
        for (const ext of tryExts) {
          const url = getPublicUrl(MONSTER_BUCKET, `${basePath}.${ext}`);
          found = url;
          break;
        }
        if (found) urls.push(found);
      }

      if (!cancelled) {
        setFrames(urls);
        setIdx(0);
        setHide(urls.length === 0);
      }
    };

    loadFrames();
    return () => {
      cancelled = true;
    };
  }, [candidates]);

  useEffect(() => {
    if (frames.length <= 1) return;
    const t = setInterval(() => {
      setIdx((v) => (v + 1) % frames.length);
    }, 250);
    return () => clearInterval(t);
  }, [frames]);

  if (hide || frames.length === 0) return <span className="no-sprite">No Sprite</span>;

  return (
    <SpriteFrame
      url={frames[idx]}
      className="sprite"
      alt={`${id} monster sprite`}
      onError={() => setHide(true)}
    />
  );
};