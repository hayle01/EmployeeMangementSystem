import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/api/authApi";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (
    username: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ error: string | null }>;
  isAdmin: () => boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      setLoading: (loading: boolean) => set({ loading }),

      signIn: async (username: string, password: string) => {
        try {
          set({ loading: true });

          const data = await authApi.login({ username, password });

          set({
            user: data.user,
            token: data.token,
            loading: false,
          });

          return { error: null };
        } catch (error: unknown) {
          set({ loading: false });

          const message =
            error instanceof Error ? error.message : "Login failed";

          return { error: message };
        }
      },

      signOut: () => {
        set({
          user: null,
          token: null,
          loading: false,
        });
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          await authApi.changePassword({ currentPassword, newPassword });
          return { error: null };
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to change password";

          return { error: message };
        }
      },

      isAdmin: () => get().user?.role === "admin",
    }),
    {
      name: "employeeconnect-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);