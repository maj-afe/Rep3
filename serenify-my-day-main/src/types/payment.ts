export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string;
  created_at: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'annual';
  features: string[];
  isPopular?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  subscription_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  payment_method: string;
  created_at: string;
}

export interface RazorpayConfig {
  key_id: string;
  key_secret: string;
  currency: string;
}

export interface PaymentOptions {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
  callback_url?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}
