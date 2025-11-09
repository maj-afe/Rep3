import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SubscriptionPlan, UserSubscription } from '@/types/payment';

export function useSubscriptionPlans() {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  return { plans, isLoading };
}

export function useUserSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            description,
            price,
            currency,
            interval_type,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSubscription & { subscription_plans: SubscriptionPlan } | null;
    },
    enabled: !!user,
  });

  const createSubscription = useMutation({
    mutationFn: async ({ planId, startDate, endDate }: { 
      planId: string; 
      startDate: string; 
      endDate: string; 
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast({
        title: 'Subscription activated! 🎉',
        description: 'You now have access to all premium features.',
      });
    },
    onError: () => {
      toast({
        title: 'Subscription failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      if (!user || !subscription) throw new Error('No active subscription');

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          auto_renew: false,
        })
        .eq('id', subscription.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription will remain active until the end of the billing period.',
      });
    },
  });

  const isPremium = subscription?.status === 'active';
  const isExpired = subscription?.status === 'expired';
  const isCancelled = subscription?.status === 'cancelled';

  return {
    subscription,
    isLoading,
    isPremium,
    isExpired,
    isCancelled,
    createSubscription: createSubscription.mutate,
    cancelSubscription: cancelSubscription.mutate,
    isCreating: createSubscription.isPending,
    isCancelling: cancelSubscription.isPending,
  };
}

export function usePaymentHistory() {
  const { user } = useAuth();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payment-history', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return { payments, isLoading };
}
