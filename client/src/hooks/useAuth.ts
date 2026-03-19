import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.token);
  const loading = useAuthStore((state) => state.loading);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);
  const changePassword = useAuthStore((state) => state.changePassword);
  const isAdmin = useAuthStore((state) => state.isAdmin());

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    changePassword,
    isAdmin,
    userRole: user?.role ?? null,
  };
}