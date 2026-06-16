import React, { useEffect, Suspense, lazy } from "react";
import { AppProvider, useAppStore } from "./store/AppContext";
import { fetchDbState, fetchLogs } from "./api/db.api";
import { fetchCreations } from "./api/creations.api";
import { useAuth } from "./hooks/useAuth";
import Spinner from "./components/ui/Spinner";

// Lazy-load pages for code splitting
const AppShell     = lazy(() => import("./components/layout/AppShell"));
const LoginPage    = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function AppRoutes() {
  const store = useAppStore();
  const { validateStoredSession } = useAuth();

  useEffect(() => {
    const init = async () => {
      // Validate stored session before loading anything else.
      // If the user was deleted or DB was reset, this clears the stale localStorage entry.
      await validateStoredSession();

      try {
        const data = await fetchDbState();
        store.setUsers(data.users);
        store.setSubscriptionPlans(data.subscription_plans);
        store.setUserCredits(data.user_credits);
        store.setTransactions(data.transactions);
      } catch {}

      try {
        const logs = await fetchLogs();
        store.setLogs(logs);
      } catch {}

      // Only fetch creations for authenticated users
      if (store.selectedUserId) {
        try {
          const creations = await fetchCreations(store.selectedUserId);
          store.setSavedCreations(creations);
        } catch {}
      }

      // Handle payment redirect query params
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("payment_status");
      if (paymentStatus === "success") {
        store.setToastMessage("✓ Payment processed! Meme Coins added to your balance.");
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => store.setToastMessage(""), 4000);
      } else if (paymentStatus === "error") {
        const msg = params.get("message") || "Gateway error";
        store.setToastMessage(`✗ Checkout issue: ${msg}`);
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => store.setToastMessage(""), 4000);
      }
    };

    init();

    // Poll logs every 5 seconds
    const interval = setInterval(async () => {
      try {
        const logs = await fetchLogs();
        store.setLogs(logs);
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (store.authScreen === "login")    return <LoginPage />;
  if (store.authScreen === "register") return <RegisterPage />;
  return <AppShell />;
}

export default function App() {
  return (
    <AppProvider>
      <Suspense fallback={<PageLoader />}>
        <AppRoutes />
      </Suspense>
    </AppProvider>
  );
}
