import { useAuthStore } from "../../../../store/useAuthStore";
import { useCallback } from "react";

import { INITIALIZED, LOADING, LOADED, FAILED } from "../../../../store/const";

export const useRegisPlayer = () => {
  const message = useAuthStore((state) => state.backendRegisMessage);
  const state = useAuthStore((state) => state.registerState);
  const error = useAuthStore((state) => state.errorRegister);

  // state
  const isLoading = state === LOADING;
  const isLoaded = state === LOADED;
  const isFailed = state === FAILED;


  const clearBackendMessage = useAuthStore((s) => s.clearErrorRegisMessage);

  const clearStateRegister = useAuthStore((s) => s.clearRegisterState);

  return {
    message,
    error,

    isLoading,
    isLoaded,
    isFailed,

    clearStateRegister,
    clearBackendMessage
  };
};
