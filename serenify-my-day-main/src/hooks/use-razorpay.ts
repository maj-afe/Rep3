import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { RazorpayOrder, RazorpayPayment, PaymentOptions } from '@/types/payment';
import { createPaymentOrder } from '@/utils/payment-backend';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setIsLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  const createOrder = async (amount: number, currency: string = 'INR') => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      // Use backend API for secure order creation
      const orderData = await createPaymentOrder(amount * 100, currency);
      
      // Store order reference in database
      const { data, error } = await supabase
        .from('razorpay_orders')
        .insert({
          user_id: user.id,
          amount: amount * 100,
          currency,
          razorpay_order_id: orderData.orderId,
          receipt: orderData.receipt,
          status: 'created',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentModal = (options: PaymentOptions) => {
    if (!isLoaded) {
      toast({
        title: 'Payment system loading',
        description: 'Please wait a moment and try again.',
        variant: 'destructive',
      });
      return;
    }

    const razorpay = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: options.currency,
      name: 'Blissy',
      description: 'Premium Subscription',
      image: '/favicon.ico',
      order_id: options.receipt,
      prefill: {
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        contact: user?.user_metadata?.phone || '',
      },
      theme: {
        color: '#8B5CF6',
      },
      handler: async (response: RazorpayPayment) => {
        await handlePaymentSuccess(response);
      },
      modal: {
        ondismiss: () => {
          toast({
            title: 'Payment cancelled',
            description: 'You can try again anytime.',
          });
        },
      },
    });

    razorpay.open();
  };

  const handlePaymentSuccess = async (payment: RazorpayPayment) => {
    if (!user) return;

    try {
      // Update order status
      await supabase
        .from('razorpay_orders')
        .update({ status: 'paid' })
        .eq('razorpay_order_id', payment.order_id);

      // Create payment record
      await supabase
        .from('payment_history')
        .insert({
          user_id: user.id,
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: 'success',
          payment_method: payment.method,
        });

      toast({
        title: 'Payment successful! 🎉',
        description: 'Welcome to Blissy Premium!',
      });
    } catch (error) {
      console.error('Error handling payment success:', error);
      toast({
        title: 'Payment verification failed',
        description: 'Please contact support if you were charged.',
        variant: 'destructive',
      });
    }
  };

  return {
    isLoaded,
    isLoading,
    createOrder,
    openPaymentModal,
  };
}
