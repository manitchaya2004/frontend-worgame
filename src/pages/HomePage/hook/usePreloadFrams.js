import { useEffect, useState } from "react";
import { API_URL } from "../../../store/const";

export const usePreloadFrames = (name = "img_hero", heroId, actionOrCount, actionName = "idle") => {
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    if (!heroId || !actionOrCount) return;

    // เช็คว่าเป็น Single Frame (มีขีด เช่น "walk-1") หรือ Multi Frames (เป็นตัวเลข)
    const isSingleFrame = typeof actionOrCount === "string" && actionOrCount.includes("-");
    const count = typeof actionOrCount === "number" ? actionOrCount : 1;
    
    let isMounted = true;
    const imgs = [];
    let loaded = 0;

    for (let i = 1; i <= count; i++) {
      const img = new Image();
      let src = "";

      if (isSingleFrame) {
        // สำหรับ DetailItem เดิมที่อาจส่ง "walk-1" มา
        src = `${API_URL}/${name}/${heroId}-${actionOrCount}.png`;
      } else {
        // สำหรับ Player/Enemy ที่ส่ง Action หลักเข้ามา
        src = `${API_URL}/${name}/${heroId}-${actionName}-${i}.png`;
      }

      img.src = src;
      img.onload = () => {
        loaded++;
        if (loaded === count && isMounted) setFrames(imgs);
      };
      img.onerror = () => {
        loaded++;
        if (loaded === count && isMounted) setFrames(imgs);
      };
      imgs.push(img);
    }
    return () => { isMounted = false; };
  }, [name, heroId, actionOrCount, actionName]);

  return frames;
};

export const LoadImage = (name = "img_monster", Id, i) => {
  return `${API_URL}/${name}/${Id}-idle-${i}.png`;
};


// export const LoadImage = (name = "img_hero", id, frame = 1, action = "idle") => {
//     // ถ้าตัวแปร action มีเลขเฟรมติดมาแล้ว (เช่น "walk-1") ให้ใช้ได้เลย
//     if (typeof action === "string" && action.includes("-")) {
//         return `${API_URL}/${name}/${id}-${action}.png`;
//     }
//     return `${API_URL}/${name}/${id}-${action}-${frame}.png`;
// }