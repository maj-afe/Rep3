import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { Check, Crown, ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscriptionPlans, useUserSubscription } from "@/hooks/use-subscription";
import { RazorpayPayment } from "@/components/RazorpayPayment";
import { useAuth } from "@/contexts/AuthContext";

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { subscription, isPremium, isLoading: subscriptionLoading } = useUserSubscription();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");

  const benefits = [
    "Access all meditation music and tracks",
    "Personalized daily affirmations",
    "Save unlimited favorites",
    "Track your wellness journey with detailed analytics",
    "Ad-free experience",
    "Priority support",
  ];

  const getSelectedPlanData = () => {
    if (selectedPlan === "annual") {
      return plans.find(p => p.interval_type === "annual");
    }
    return plans.find(p => p.interval_type === "monthly");
  };

  const selectedPlanData = getSelectedPlanData();
  const price = selectedPlanData ? selectedPlanData.price / 100 : 0; // Convert from paise to rupees

  // Show loading state
  if (plansLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  // Show premium user message
  if (isPremium && subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
        <div className="max-w-lg mx-auto px-6 pt-12 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-green-600">
              You're Premium! 🎉
            </h1>
            <p className="text-muted-foreground">
              Enjoy all premium features
            </p>
          </div>

          <GradientCard variant="calm" className="mb-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Current Plan</h3>
              <p className="text-2xl font-bold text-primary mb-1">
                {subscription.subscription_plans?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Valid until {new Date(subscription.end_date).toLocaleDateString()}
              </p>
            </div>
          </GradientCard>

          <Button
            onClick={() => navigate("/home")}
            className="w-full h-12 text-lg font-semibold"
          >
            Continue to App
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
      <div className="max-w-lg mx-auto px-6 pt-12 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Unlock Full Blissy Experience
          </h1>
          <p className="text-muted-foreground">
            Choose a plan that works for you
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`flex-1 p-6 rounded-2xl transition-all ${
              selectedPlan === "monthly"
                ? "bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary"
                : "bg-card/80 border-2 border-transparent"
            }`}
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Monthly Plan</p>
              <div className="mb-2">
                <span className="text-3xl font-bold">₹{plans.find(p => p.interval_type === "monthly")?.price ? (plans.find(p => p.interval_type === "monthly")!.price / 100) : 99}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">Cancel anytime</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan("annual")}
            className={`flex-1 p-6 rounded-2xl transition-all relative ${
              selectedPlan === "annual"
                ? "bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary"
                : "bg-card/80 border-2 border-transparent"
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              Best Value
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Annual Plan</p>
              <div className="mb-2">
                <span className="text-3xl font-bold">₹{plans.find(p => p.interval_type === "annual")?.price ? (plans.find(p => p.interval_type === "annual")!.price / 100) : 699}</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-xs text-muted-foreground">Save 40%</p>
            </div>
          </button>
        </div>

        <GradientCard variant="calm" className="mb-6">
          <h3 className="font-semibold mb-4">Premium includes:</h3>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm">{benefit}</p>
              </div>
            ))}
          </div>
        </GradientCard>

        {selectedPlanData && (
          <RazorpayPayment
            planId={selectedPlanData.id}
            amount={price}
            onSuccess={() => {
              // Refresh subscription data
              window.location.reload();
            }}
            onError={(error) => {
              console.error('Payment error:', error);
            }}
          />
        )}

        <p className="text-center text-sm text-muted-foreground mt-4">
          Secure payment powered by Razorpay
          <br />
          Cancel anytime. No commitment required.
        </p>
      </div>
    </div>
  );
};

export default Subscription;
