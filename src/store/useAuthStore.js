import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOADED, LOADING, FAILED, INITIALIZED } from "./const";

const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

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
            currentUser: data,
            errorRegister: false,
          });
        } catch (error) {
          set({
            registerState: FAILED,
            backendRegisMessage: error.message,
            errorRegister: true,
          });
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

      clearErrorRegisMessage: () =>
        set({ backendRegisMessage: null }),

      clearErrorLoginMessage: () =>
        set({ backendLoginMessage: null }),

      clearLoginState: () =>
        set({ loginState: INITIALIZED }),

      clearRegisterState: () =>
        set({ registerState: INITIALIZED }),
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
