import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { CheckCircle, Crown, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (paymentId && orderId) {
      toast({
        title: "Payment Successful! 🎉",
        description: "Welcome to Blissy Premium!",
      });
    }
  }, [paymentId, orderId]);

  const handleContinue = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <GradientCard variant="calm" className="text-center p-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-green-600">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Welcome to Blissy Premium
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <Crown className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-800">Premium Activated</p>
                <p className="text-sm text-green-600">You now have access to all features</p>
              </div>
            </div>

            {paymentId && (
              <div className="text-sm text-muted-foreground">
                <p>Payment ID: {paymentId}</p>
                {orderId && <p>Order ID: {orderId}</p>}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              Continue to App
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
              className="w-full"
            >
              View Subscription Details
            </Button>
          </div>
        </GradientCard>
      </div>
    </div>
  );
};

export default PaymentSuccess;
