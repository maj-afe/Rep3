import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSecurePayment } from '@/hooks/use-secure-payment';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CreditCard, Shield, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RazorpayPaymentProps {
  planId: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function RazorpayPayment({ 
  planId, 
  amount, 
  currency = 'INR', 
  onSuccess, 
  onError 
}: RazorpayPaymentProps) {
  const { user } = useAuth();
  const { createSecureOrder, verifyPayment, isProcessing } = useSecurePayment();
  const { createSubscription } = useSubscription();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to continue with payment.',
        variant: 'destructive',
      });
      return;
    }

    if (!window.Razorpay) {
      toast({
        title: 'Payment system loading',
        description: 'Please wait a moment and try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create secure order with server-side validation
      const order = await createSecureOrder(planId, amount);
      
      // Calculate subscription dates
      const startDate = new Date().toISOString();
      const endDate = new Date();
      
      // Determine if it's annual or monthly based on amount
      if (amount >= 600) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Open payment modal with secure handler
      const razorpay = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Blissy',
        description: 'Premium Subscription',
        image: '/favicon.ico',
        order_id: order.id,
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || '',
        },
        theme: {
          color: '#8B5CF6',
        },
        handler: async (response: any) => {
          try {
            // Verify payment server-side
            await verifyPayment(response);
            
            // Create subscription only after verification
            await createSubscription({
              planId,
              startDate,
              endDate: endDate.toISOString(),
            });
            
            toast({
              title: 'Payment successful! 🎉',
              description: 'Welcome to Blissy Premium!',
            });
            
            onSuccess?.();
            
            // Redirect to success page
            window.location.href = `/payment/success?payment_id=${response.id}&order_id=${response.order_id}`;
          } catch (error) {
            console.error('Payment verification failed:', error);
            onError?.(error);
            window.location.href = `/payment/failure?error_code=verification_failed&error_description=Payment verification failed`;
          }
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

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
      onError?.(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
        <Shield className="h-5 w-5 text-green-600" />
        <div className="text-sm">
          <p className="font-medium text-green-800">Secure Payment</p>
          <p className="text-green-600">Powered by Razorpay</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-500" />
          <span>256-bit SSL encryption</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-500" />
          <span>PCI DSS compliant</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-500" />
          <span>Cancel anytime</span>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={!isLoaded || isLoading || isProcessing}
        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
      >
        {isProcessing || isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay ₹{amount}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By proceeding, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
