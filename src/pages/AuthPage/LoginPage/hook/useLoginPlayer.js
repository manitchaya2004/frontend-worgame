import { useAuthStore } from "../../../../store/useAuthStore";
import { LOADED, LOADING, FAILED } from "../../../../store/const";

export const useLoginPlayer = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const message = useAuthStore((state) => state.backendLoginMessage);
  const state = useAuthStore((state) => state.loginState);
  const error = useAuthStore((state) => state.errorLogin);

  //state
  const isLoading = state === LOADING;
  const isLoaded = state === LOADED;
  const isFailed = state === FAILED;

  const loginPlayer = useAuthStore((state) => state.loginUser);
  const logout = useAuthStore((state) => state.logout);

  const clearBackendMessage = useAuthStore(
    (state) => state.clearErrorLoginMessage
  );
  const clearStateLogin = useAuthStore((state) => state.clearLoginState);

  return {
    currentUser,
    message,
    error,

    isLoading,
    isFailed,
    isLoaded,

    loginPlayer,
    logout,
    clearBackendMessage,
    clearStateLogin,
  };
};
