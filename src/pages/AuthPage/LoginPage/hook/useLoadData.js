import { useCallback, useState } from "react";
import { useStageStore } from "../../../../store/useStageStore";
import { useShopStore } from "../../../../store/useShopStore";


export const useLoadData = () => {
  const [loading, setLoading] = useState(false);

  // 👉 ดึง function จาก zustand
  const getAllStage = useStageStore((s) => s.getAllStage);
  const getShop = useShopStore((s) => s.getShop);

  const fetchAllStage = useCallback(() => {
    return getAllStage(); // ✅ ไม่มี dispatch / unwrap
  }, [getAllStage]);

  const fetchAllShop = useCallback(() => {
    return getShop();
  }, [getShop]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAllStage(),
        fetchAllShop(),
      ]);
    } catch (error) {
      console.error("fetchAllData error:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchAllStage, fetchAllShop]);

  return {
    fetchAllStage,
    fetchAllShop,
    fetchAllData,
    loading,
  };
};
