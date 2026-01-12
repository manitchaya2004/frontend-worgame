import { useCallback } from "react";
import { useStageStore } from "../../../store/useStageStore";
import { useShopStore } from "../../../store/useShopStore";
import { useDictionaryStore } from "../../../store/useDictionaryStore";
import { useMonsterStore } from "../../../store/useMonsterStore";
import { useHeroStore } from "../../../store/useHeroStroe";
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

  /* ================= MONSTER ================= */
  const monsters = useMonsterStore((state) => state.monsters);
  const monsterState = useMonsterStore((state) => state.loading);

  const getMonsters = useMonsterStore((state) => state.getMonsters);
  const clearMonster = useMonsterStore((state) => state.clearListMonster);

  /* ================= HERO CHARACTER ================= */
  const heros = useHeroStore((state)=> state.heros);
  const heroState = useHeroStore((state)=> state.loading);

  const getAllHeros = useHeroStore((state)=> state.getAllHeros);

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

    /* monster */
    monsters,
    monsterState,
    getMonsters,
    clearMonster,

    /* hero character */
    heros,
    heroState,
    getAllHeros,
  };
};
