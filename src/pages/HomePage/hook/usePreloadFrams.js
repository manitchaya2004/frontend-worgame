import { useEffect, useState } from "react";
import { API_URL } from "../../../store/const";
export const usePreloadFrames = (name="img_hero",heroId, frameCount) => {
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    if (!frameCount) return;

    const imgs = [];
    let loaded = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `${API_URL}/${name}/${heroId}-idle-${i}.png`;
      img.onload = () => {
        loaded++;
        if (loaded === frameCount) {
          setFrames(imgs);
        }
      };
      imgs.push(img);
    }
  }, [API_URL, heroId, frameCount]);

  return frames; // array ของ Image
};

export const LoadImage = (name="img_monster",Id,i)=>{
    return`${API_URL}/${name}/${Id}-idle-${i}.png`
}