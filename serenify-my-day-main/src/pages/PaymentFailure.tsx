import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  const handleRetry = () => {
    navigate("/subscription");
  };

  const handleGoBack = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <GradientCard variant="warm" className="text-center p-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 mb-4">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-red-600">
              Payment Failed
            </h1>
            <p className="text-muted-foreground">
              We couldn't process your payment
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
              <div className="text-left">
                <p className="font-medium text-red-800">Payment Unsuccessful</p>
                <p className="text-sm text-red-600">
                  {errorDescription || "Please try again or contact support"}
                </p>
              </div>
            </div>

            {errorCode && (
              <div className="text-sm text-muted-foreground">
                <p>Error Code: {errorCode}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Don't worry, you haven't been charged.</p>
              <p>You can try again anytime.</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back Home
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team at support@blissy.app
            </p>
          </div>
        </GradientCard>
      </div>
    </div>
  );
};

export default PaymentFailure;
