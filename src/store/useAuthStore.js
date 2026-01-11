import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOADED, LOADING, FAILED, INITIALIZED ,API_URL} from "./const";


export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ================= STATE (เหมือน Redux) ================= */
      registerState: INITIALIZED,
      loginState: INITIALIZED,
      authLoading: true,
      isAuthenticated: false,
      currentUser: null,

      backendRegisMessage: null,
      backendLoginMessage: null,

      errorLogin: false,
      errorRegister: false,

      /* ================= ACTIONS ================= */

      /* ===== REGISTER ===== */
      registerUser: async (userData) => {
        try {
          set({
            registerState: LOADING,
            backendRegisMessage: null,
            errorRegister: false,
          });

          const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
            credentials: "include",
          });

          if (!res.ok) {
            throw new Error("Server error, please try again");
          }

          const data = await res.json();

          if (!data.isSuccess) {
            throw new Error(data.message);
          }

          set({
            registerState: LOADED,
            currentUser: data.user ?? null, // ✅ สำคัญ
            errorRegister: false,
          });

          return data; // ✅ เหมือน thunk
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Register failed";

          set({
            registerState: FAILED,
            backendRegisMessage: message,
            errorRegister: true,
          });

          throw err; // ✅ ให้ component handle ได้
        }
      },

      /* ===== LOGIN ===== */
      loginUser: async (credentials) => {
        try {
          set({
            loginState: LOADING,
            backendLoginMessage: null,
            errorLogin: false,
          });
          console.log(JSON.stringify(credentials));

          const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            credentials: "include",
          });

          if (!res.ok) {
            throw new Error("Server error, please try again");
          }

          const data = await res.json();

          if (!data.isSuccess) {
            throw new Error(data.message);
          }

          localStorage.setItem("token", data.token);

          set({
            loginState: LOADED,
            isAuthenticated: true,
            currentUser: data.user,
            errorLogin: false,
          });
        } catch (error) {
          set({
            loginState: FAILED,
            isAuthenticated: false,
            backendLoginMessage: error.message,
            errorLogin: true,
          });
        }
      },

      /* ===== LOGOUT ===== */
      logoutUser: async () => {
        await fetch(`${API_URL}/logout`, {
          method: "GET",
          credentials: "include",
        });

        localStorage.removeItem("token");

        set({
          isAuthenticated: false,
          currentUser: null,
        });
      },

      /* ===== CHECK AUTH ===== */
      checkAuth: async () => {
        set({ authLoading: true });

        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("no token");

          const res = await fetch(`${API_URL}/checkAuth`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("unauthorized");

          const data = await res.json();

          set({
            authLoading: false,
            isAuthenticated: true,
            currentUser: data.user,
          });
        } catch {
          set({
            authLoading: false,
            isAuthenticated: false,
            currentUser: null,
          });
        }
      },

      /* ===== CLEAR STATES (เหมือน reducers) ===== */
      logout: () => {
        localStorage.removeItem("token");
        set({
          isAuthenticated: false,
          currentUser: null,
        });
      },

      clearErrorRegisMessage: () => set({ backendRegisMessage: null }),

      clearErrorLoginMessage: () => set({ backendLoginMessage: null }),

      clearLoginState: () => set({ loginState: INITIALIZED }),

      clearRegisterState: () => set({ registerState: INITIALIZED }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
      }),
    }
  )
);
