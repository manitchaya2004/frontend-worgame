import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

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
    <img
      className="sprite"
      src={frames[idx]}
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
    <img
      className="sprite"
      src={frames[idx]}
      alt={`${id} hero sprite`}
      onError={() => setHide(true)}
    />
  );
};
