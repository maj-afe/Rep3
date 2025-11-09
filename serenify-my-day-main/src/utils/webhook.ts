import { supabase } from '@/integrations/supabase/client';
import crypto from 'crypto';
import { secureLogger } from './secure-logger';

// Type definitions for payment tables (missing from generated types)
interface PaymentHistoryUpdate {
  status?: 'success' | 'failed' | 'pending' | 'refunded';
  payment_method?: string;
  failure_reason?: string;
}

interface RazorpayOrdersUpdate {
  status?: 'created' | 'paid' | 'attempted' | 'captured';
}

export interface RazorpayWebhookPayload {
  event: string;
  account_id: string;
  created_at: number;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        description: string;
        created_at: number;
      };
    };
  };
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

export async function handlePaymentWebhook(payload: RazorpayWebhookPayload) {
  try {
    const { event, payload: webhookPayload } = payload;
    
    if (event === 'payment.captured') {
      const payment = webhookPayload.payment.entity;
      
      // Update payment status in database
      await supabase
        .from('payment_history' as any)
        .update({
          status: 'success',
          payment_method: payment.method,
        } as PaymentHistoryUpdate)
        .eq('razorpay_payment_id', payment.id);

      // Update order status
      await supabase
        .from('razorpay_orders' as any)
        .update({ status: 'paid' } as RazorpayOrdersUpdate)
        .eq('razorpay_order_id', payment.order_id);

      secureLogger.info('Payment webhook processed successfully:', { paymentId: payment.id });
    } else if (event === 'payment.failed') {
      const payment = webhookPayload.payment.entity;
      
      // Update payment status to failed
      await supabase
        .from('payment_history' as any)
        .update({
          // status column removed; update only failure_reason
          failure_reason: 'Payment failed',
        } as PaymentHistoryUpdate)
        .eq('razorpay_payment_id', payment.id);

      secureLogger.warn('Payment failed webhook processed:', { paymentId: payment.id });
    }
  } catch (error) {
    secureLogger.error('Error processing webhook:', error);
    throw error;
  }
}
