// Security utilities for payment validation
import { supabase } from '@/integrations/supabase/client';

// Type definitions for subscription_plans table (missing from generated types)
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval_type: 'monthly' | 'annual';
  features: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentValidationResult {
  isValid: boolean;
  error?: string;
  planData?: any;
}

export async function validatePaymentAmount(
  planId: string, 
  amount: number
): Promise<PaymentValidationResult> {
  try {
    // Fetch plan data from server
    const { data: plan, error } = await supabase
      .from('subscription_plans' as any)
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single() as { data: SubscriptionPlan | null; error: any };

    if (error || !plan) {
      return {
        isValid: false,
        error: 'Invalid plan selected'
      };
    }

    // Validate amount matches plan price
    const expectedAmount = plan.price; // Amount in paise
    if (amount * 100 !== expectedAmount) {
      return {
        isValid: false,
        error: 'Amount mismatch detected'
      };
    }

    return {
      isValid: true,
      planData: plan
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Validation failed'
    };
  }
}

export function sanitizePaymentData(data: any) {
  // Remove any potentially sensitive data
  const sanitized = { ...data };
  delete sanitized.razorpay_key_secret;
  delete sanitized.webhook_secret;
  return sanitized;
}

export function validatePaymentResponse(response: any): boolean {
  // Basic validation of payment response
  if (!response || typeof response !== 'object') {
    return false;
  }

  const requiredFields = ['id', 'order_id', 'amount', 'currency', 'status'];
  return requiredFields.every(field => response.hasOwnProperty(field));
}

export function generateSecureReceipt(userId: string, planId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `receipt_${userId}_${planId}_${timestamp}_${random}`;
}
