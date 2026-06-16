import React, { createContext, useContext, useReducer, useRef, ReactNode } from "react";
import { User, SubscriptionPlan, UserCredit, Transaction, LogMessage } from "../types";
import { Creation } from "../api/creations.api";
import { createAuthSlice, AuthState, AuthActions } from "./slices/authSlice";
import { createMemeSlice, MemeState, MemeActions } from "./slices/memeSlice";
import { createImageSlice, ImageState, ImageActions } from "./slices/imageSlice";
import { createVideoSlice, VideoState, VideoActions } from "./slices/videoSlice";
import { createCaptionSlice, CaptionState, CaptionActions } from "./slices/captionSlice";
import { createBillingSlice, BillingState, BillingActions } from "./slices/billingSlice";
import { createCoachSlice, CoachState, CoachActions } from "./slices/coachSlice";

// ── DB / shared state (not slice-managed) ───────────────────────────────────
type SharedState = {
  users: User[];
  subscriptionPlans: SubscriptionPlan[];
  userCredits: UserCredit[];
  transactions: Transaction[];
  logs: LogMessage[];
  savedCreations: Creation[];
  searchText: string;
  toastMessage: string;
  // SQL explorer
  customSQLQuery: string;
  sqlResultRows: any[] | null;
  sqlMessage: string;
  sqlError: string;
  sqlSuccessMsg: string;
};

type SharedActions = {
  setUsers: (u: User[]) => void;
  setSubscriptionPlans: (p: SubscriptionPlan[]) => void;
  setUserCredits: (c: UserCredit[]) => void;
  setTransactions: (t: Transaction[]) => void;
  setLogs: (l: LogMessage[]) => void;
  setSavedCreations: (c: Creation[]) => void;
  setSearchText: (s: string) => void;
  setToastMessage: (s: string) => void;
  setCustomSQLQuery: (s: string) => void;
  setSqlResultRows: (r: any[] | null) => void;
  setSqlMessage: (s: string) => void;
  setSqlError: (s: string) => void;
  setSqlSuccessMsg: (s: string) => void;
};

// ── Full store type ───────────────────────────────────────────────────────────
export type AppStore =
  AuthState & AuthActions &
  MemeState & MemeActions &
  ImageState & ImageActions &
  VideoState & VideoActions &
  CaptionState & CaptionActions &
  BillingState & BillingActions &
  CoachState & CoachActions &
  SharedState & SharedActions;

// ── Build initial state from slices ─────────────────────────────────────────
function buildInitialState(): AppStore {
  const set = (fn: (s: any) => any) => {
    // placeholder — replaced in provider
  };
  return {
    ...createAuthSlice(set),
    ...createMemeSlice(set),
    ...createImageSlice(set),
    ...createVideoSlice(set),
    ...createCaptionSlice(set),
    ...createBillingSlice(set),
    ...createCoachSlice(set),
    // shared state
    users: [],
    subscriptionPlans: [],
    userCredits: [],
    transactions: [],
    logs: [],
    savedCreations: [],
    searchText: "",
    toastMessage: "",
    customSQLQuery: "SELECT * FROM user_credits LIMIT 10;",
    sqlResultRows: null,
    sqlMessage: "",
    sqlError: "",
    sqlSuccessMsg: "",
    // shared actions (stubs — replaced in provider)
    setUsers: () => {},
    setSubscriptionPlans: () => {},
    setUserCredits: () => {},
    setTransactions: () => {},
    setLogs: () => {},
    setSavedCreations: () => {},
    setSearchText: () => {},
    setToastMessage: () => {},
    setCustomSQLQuery: () => {},
    setSqlResultRows: () => {},
    setSqlMessage: () => {},
    setSqlError: () => {},
    setSqlSuccessMsg: () => {},
  };
}

const AppContext = createContext<AppStore>(buildInitialState());

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    (prev: AppStore, patch: Partial<AppStore>) => ({ ...prev, ...patch }),
    undefined,
    () => {
      const set = (fn: (s: any) => any) =>
        dispatch(fn(storeRef.current) as Partial<AppStore>);

      const slices: AppStore = {
        ...createAuthSlice(set),
        ...createMemeSlice(set),
        ...createImageSlice(set),
        ...createVideoSlice(set),
        ...createCaptionSlice(set),
        ...createBillingSlice(set),
        ...createCoachSlice(set),
        users: [],
        subscriptionPlans: [],
        userCredits: [],
        transactions: [],
        logs: [],
        savedCreations: [],
        searchText: "",
        toastMessage: "",
        customSQLQuery: "SELECT * FROM user_credits LIMIT 10;",
        sqlResultRows: null,
        sqlMessage: "",
        sqlError: "",
        sqlSuccessMsg: "",
        setUsers: (u) => dispatch({ users: u }),
        setSubscriptionPlans: (p) => dispatch({ subscriptionPlans: p }),
        setUserCredits: (c) => dispatch({ userCredits: c }),
        setTransactions: (t) => dispatch({ transactions: t }),
        setLogs: (l) => dispatch({ logs: l }),
        setSavedCreations: (c) => dispatch({ savedCreations: c }),
        setSearchText: (s) => dispatch({ searchText: s }),
        setToastMessage: (s) => dispatch({ toastMessage: s }),
        setCustomSQLQuery: (s) => dispatch({ customSQLQuery: s }),
        setSqlResultRows: (r) => dispatch({ sqlResultRows: r }),
        setSqlMessage: (s) => dispatch({ sqlMessage: s }),
        setSqlError: (s) => dispatch({ sqlError: s }),
        setSqlSuccessMsg: (s) => dispatch({ sqlSuccessMsg: s }),
      };
      return slices;
    }
  );

  // Keep a ref so slice setters can always read latest state
  const storeRef = useRef(state);
  storeRef.current = state;

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useAppStore(): AppStore {
  return useContext(AppContext);
}
