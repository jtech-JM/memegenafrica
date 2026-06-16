export type AuthState = {
  selectedUserId: string;
  authScreen: "app" | "register" | "login";
};

export type AuthActions = {
  setSelectedUserId: (id: string) => void;
  setAuthScreen: (screen: "app" | "register" | "login") => void;
};

export function createAuthSlice(
  set: (fn: (s: any) => any) => void
): AuthState & AuthActions {
  return {
    // Restore session from localStorage if available — empty string means guest (anonymous)
    selectedUserId: localStorage.getItem("registered_user_id") || "",
    authScreen: "app",
    setSelectedUserId: (id) => set(() => ({ selectedUserId: id })),
    setAuthScreen:     (screen) => set(() => ({ authScreen: screen })),
  };
}
