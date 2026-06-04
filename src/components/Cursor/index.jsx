import { useEffect } from "react";

const MagicCursor = () => {
  useEffect(() => {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouch) return;

    let lastTime = 0;
    const throttleDelay = 35; // ms

    const handleMouseMove = (e) => {
      const now = performance.now();
      if (now - lastTime < throttleDelay) return;
      lastTime = now;

      const particle = document.createElement("div");
      particle.className = "magic-particle";

      particle.style.left = e.clientX - 6 + "px";
      particle.style.top = e.clientY - 6 + "px";

      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 800);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return null; 
};

export default MagicCursor;

