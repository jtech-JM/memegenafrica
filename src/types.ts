export type User = {
  user_id: string;
  email: string;
  phone_number: string | null;
  created_at: string;
};

export type SubscriptionPlan = {
  plan_id: number;
  name: string;
  price_usd: number;
  price_kes: number;
  total_credit_allocation: number;
};

export type UserCredit = {
  user_id: string;
  plan_id: number;
  remaining_credits: number;
  period_reset_date: string;
};

export type Transaction = {
  transaction_id: string;
  user_id: string;
  payment_gateway: "mpesa" | "stripe" | "paypal";
  gateway_reference: string;
  amount: number;
  currency: string;
  status: "Pending" | "Completed" | "Failed";
  created_at: string;
};

export type MemeTemplate = {
  id: string;
  name: string;
  localName: string;
  imageUrl: string;
  description: string;
  defaultTop: string;
  defaultBottom: string;
};

export type LogMessage = {
  timestamp: string;
  level: string;
  component: string;
  message: string;
};
