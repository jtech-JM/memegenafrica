import { useAppStore } from "../store/AppContext";
import { registerUser, loginUser, validateSession } from "../api/auth.api";
import { fetchDbState } from "../api/db.api";
import { fetchCreations } from "../api/creations.api";
import { useToast } from "./useToast";

export function useAuth() {
  const store = useAppStore();
  const { showToast } = useToast();

  const refreshDb = async () => {
    const data = await fetchDbState();
    store.setUsers(data.users);
    store.setSubscriptionPlans(data.subscription_plans);
    store.setUserCredits(data.user_credits);
    store.setTransactions(data.transactions);
  };

  /**
   * Called once on app boot — validates the stored user_id still exists in the DB.
   * Clears stale sessions silently if the user was deleted or DB was reset.
   */
  const validateStoredSession = async () => {
    const storedId = localStorage.getItem("registered_user_id");
    if (!storedId) return; // guest — nothing to validate

    const isValid = await validateSession(storedId);
    if (!isValid) {
      // Stale session — clear it and treat as guest
      localStorage.removeItem("registered_user_id");
      store.setSelectedUserId("");
      store.setPhoneForMpesa("");
    }
  };

  const handleRegister = async (email: string, phone: string) => {
    try {
      const user = await registerUser(email, phone);
      store.setSelectedUserId(user.user_id);
      store.setPhoneForMpesa(user.phone_number ?? "");
      localStorage.setItem("registered_user_id", user.user_id);
      store.setAuthScreen("app");
      showToast(`✓ Account Created: Signed in as ${user.email}`);
      await refreshDb();
      const creations = await fetchCreations(user.user_id);
      store.setSavedCreations(creations);
    } catch (err: any) {
      showToast(err.message || "Registration failed.");
    }
  };

  const handleLogin = async (email: string) => {
    try {
      const user = await loginUser(email);
      store.setSelectedUserId(user.user_id);
      store.setPhoneForMpesa(user.phone_number ?? "");
      localStorage.setItem("registered_user_id", user.user_id);
      store.setAuthScreen("app");
      showToast(`✓ Welcome Back: Signed in as ${user.email}`);
      await refreshDb();
      const creations = await fetchCreations(user.user_id);
      store.setSavedCreations(creations);
    } catch (err: any) {
      showToast(err.message || "Login failed.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("registered_user_id");
    store.setSelectedUserId("");      // true guest — no seeded fallback
    store.setPhoneForMpesa("");
    store.setSavedCreations([]);
    showToast("Signed out successfully.");
  };

  const handleUserSwitch = async (userId: string) => {
    store.setSelectedUserId(userId);
    const user = store.users.find((u) => u.user_id === userId);
    if (user) store.setPhoneForMpesa(user.phone_number ?? "");
    const creations = await fetchCreations(userId);
    store.setSavedCreations(creations);
    showToast(`Switched to: ${user?.email || userId}`);
  };

  return { handleRegister, handleLogin, handleSignOut, handleUserSwitch, refreshDb, validateStoredSession };
}
