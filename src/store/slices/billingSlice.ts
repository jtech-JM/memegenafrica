import { Transaction } from "../../types";

export type BillingState = {
  selectedPlanId: number;
  paymentGateway: "mpesa" | "stripe" | "paypal";
  phoneForMpesa: string;
  checkoutPendingTx: Transaction | null;
  checkoutRedirectUrl: string;
  currencyMode: "KES" | "USD";
};

export type BillingActions = {
  setSelectedPlanId: (n: number) => void;
  setPaymentGateway: (g: "mpesa" | "stripe" | "paypal") => void;
  setPhoneForMpesa: (s: string) => void;
  setCheckoutPendingTx: (tx: Transaction | null) => void;
  setCheckoutRedirectUrl: (s: string) => void;
  setCurrencyMode: (m: "KES" | "USD") => void;
};

export function createBillingSlice(set: (fn: (s: any) => any) => void): BillingState & BillingActions {
  return {
    selectedPlanId: 3,
    paymentGateway: "mpesa",
    phoneForMpesa: "+254712345678",
    checkoutPendingTx: null,
    checkoutRedirectUrl: "",
    currencyMode: "KES",
    setSelectedPlanId: (n) => set(() => ({ selectedPlanId: n })),
    setPaymentGateway: (g) => set(() => ({ paymentGateway: g })),
    setPhoneForMpesa: (s) => set(() => ({ phoneForMpesa: s })),
    setCheckoutPendingTx: (tx) => set(() => ({ checkoutPendingTx: tx })),
    setCheckoutRedirectUrl: (s) => set(() => ({ checkoutRedirectUrl: s })),
    setCurrencyMode: (m) => set(() => ({ currencyMode: m })),
  };
}
