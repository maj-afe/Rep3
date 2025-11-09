import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { validatePaymentAmount, validatePaymentResponse, generateSecureReceipt } from '@/utils/security';

export function useSecurePayment() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const createSecureOrder = async (planId: string, amount: number) => {
    if (!user) throw new Error('Authentication required');

    // Validate payment amount on server-side
    const validation = await validatePaymentAmount(planId, amount);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Payment validation failed');
    }

    setIsProcessing(true);
    try {
      // Create order in database first
      const receipt = generateSecureReceipt(user.id, planId);
      
      const { data: orderData, error } = await supabase
        .from('razorpay_orders')
        .insert({
          user_id: user.id,
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          receipt,
          status: 'created'
        })
        .select()
        .single();

      if (error) throw error;

      // In production, this should call your backend API
      // For now, we'll simulate the Razorpay order creation
      const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      await supabase
        .from('razorpay_orders')
        .update({ razorpay_order_id: razorpayOrderId })
        .eq('id', orderData.id);

      return {
        id: razorpayOrderId,
        amount: amount * 100,
        currency: 'INR',
        receipt
      };
    } catch (error) {
      console.error('Secure order creation failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
    if (!validatePaymentResponse(paymentResponse)) {
      throw new Error('Invalid payment response');
    }

    try {
      // Verify payment with Razorpay API (should be done server-side)
      // For now, we'll do basic validation
      const { data: orderData, error } = await supabase
        .from('razorpay_orders')
        .select('*')
        .eq('razorpay_order_id', paymentResponse.order_id)
        .eq('user_id', user?.id)
        .single();

      if (error || !orderData) {
        throw new Error('Order not found or unauthorized');
      }

      // Update order status
      await supabase
        .from('razorpay_orders')
        .update({ status: 'paid' })
        .eq('id', orderData.id);

      // Create payment record
      await supabase
        .from('payment_history')
        .insert({
          user_id: user!.id,
          razorpay_payment_id: paymentResponse.id,
          razorpay_order_id: paymentResponse.order_id,
          amount: paymentResponse.amount,
          currency: paymentResponse.currency,
          status: 'success',
          payment_method: paymentResponse.method || 'card'
        });

      return true;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  };

  return {
    createSecureOrder,
    verifyPayment,
    isProcessing
  };
}
