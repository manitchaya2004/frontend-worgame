import { useEffect } from "react";

const MagicCursor = () => {
  useEffect(() => {
    const handleMouseMove = (e) => {
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

  return null; // ไม่มี UI
};

export default MagicCursor;
