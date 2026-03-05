import { useCallback, useState } from "react";
import { useStageStore } from "../../../../store/useStageStore";
import { useShopStore } from "../../../../store/useShopStore";


export const useLoadData = () => {
  const [loading, setLoading] = useState(false);

  // 👉 ดึง function จาก zustand
  const getAllStage = useStageStore((s) => s.getAllStage);
  const getShop = useShopStore((s) => s.getShop);


  return {
    fetchAllData,
    loading,
  };
};
