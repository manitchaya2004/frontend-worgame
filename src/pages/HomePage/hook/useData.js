import { useCallback } from "react";
import { useStageStore } from "../../../store/useStageStore";
import { useShopStore } from "../../../store/useShopStore";
import { useDictionaryStore } from "../../../store/useDictionaryStore";

export const useData = () => {
  /* ================= STAGE ================= */
  const stages = useStageStore((s) => s.stages);
  const loadingStage = useStageStore((s) => s.loading);

  /* ================= SHOP ================= */
  const shops = useShopStore((s) => s.allShops);
  const item = useShopStore((s) => s.items);
  const loading = useShopStore((s) => s.loading);

  const searchShopItems = useShopStore((s) => s.searchShop);
  const ClearShopItems = useShopStore((s) => s.clearShop);

  const searchItems = (searchTerm) => {
    searchShopItems(searchTerm);
  };

  const resetItems = () => {
    ClearShopItems();
  };

  /* ================= DICTIONARY ================= */
  const dictionary = useDictionaryStore((s) => s.words);
  const DictionaryState = useDictionaryStore((s) => s.loading);
  const hasNext = useDictionaryStore((s) => s.hasNext);
  const lastWord = useDictionaryStore((s) => s.lastWord);

  const fetchDictionary = useDictionaryStore((s) => s.fetchDictionary);
  const clearDictionary = useDictionaryStore((s) => s.clearDictionary);

  const fetchDictionarys = useCallback(
    (letter, limit) => {
      fetchDictionary({ startsWith: letter, limit });
    },
    [fetchDictionary]
  );

  return {
    /* shop */
    shops,
    item,
    loading,
    searchItems,
    resetItems,

    /* stages */
    stages,
    loadingStage,

    /* dictionary */
    dictionary,
    DictionaryState,
    hasNext,
    lastWord,
    fetchDictionarys,
    clearDictionary,
  };
};
