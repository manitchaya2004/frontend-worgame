import { useState, useEffect } from "react";
export const useIdleFrame = (frameCount, interval = 250) => {
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    if (!frameCount || frameCount <= 1) return;

    const timer = setInterval(() => {
      setFrame((f) => (f >= frameCount ? 1 : f + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [frameCount, interval]);

  return frame;
};
