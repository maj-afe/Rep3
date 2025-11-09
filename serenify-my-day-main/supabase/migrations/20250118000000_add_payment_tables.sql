-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price integer NOT NULL, -- Price in paise (smallest currency unit)
  currency text NOT NULL DEFAULT 'INR',
  interval_type text NOT NULL CHECK (interval_type IN ('monthly', 'annual')),
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  auto_renew boolean DEFAULT true,
  razorpay_subscription_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create payment history table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  subscription_id uuid REFERENCES public.user_subscriptions(id),
  razorpay_payment_id text NOT NULL,
  razorpay_order_id text NOT NULL,
  amount integer NOT NULL, -- Amount in paise
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending', 'refunded')),
  payment_method text,
  failure_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create orders table for Razorpay order tracking
CREATE TABLE IF NOT EXISTS public.razorpay_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  razorpay_order_id text NOT NULL UNIQUE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  receipt text NOT NULL,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'attempted', 'captured')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.razorpay_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read access)
CREATE POLICY "Subscription plans are viewable by everyone" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for payment_history
CREATE POLICY "Users can view their own payment history"
ON public.payment_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment records"
ON public.payment_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for razorpay_orders
CREATE POLICY "Users can view their own orders"
ON public.razorpay_orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.razorpay_orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON public.razorpay_orders
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at
BEFORE UPDATE ON public.payment_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_razorpay_orders_updated_at
BEFORE UPDATE ON public.razorpay_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, currency, interval_type, features, is_active) VALUES
('Monthly Premium', 'Monthly access to all premium features', 9900, 'INR', 'monthly', '["Access all meditation music and tracks", "Personalized daily affirmations", "Save unlimited favorites", "Track your wellness journey with detailed analytics", "Ad-free experience", "Priority support"]', true),
('Annual Premium', 'Annual access to all premium features with 40% savings', 69900, 'INR', 'annual', '["Access all meditation music and tracks", "Personalized daily affirmations", "Save unlimited favorites", "Track your wellness journey with detailed analytics", "Ad-free experience", "Priority support", "40% savings compared to monthly"]', true);
