import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { passwordSchema, emailSchema } from "@/utils/validation";
import { handleError } from "@/utils/errorHandler";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  
  // Rate limiting state
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  
  const { signIn, signUp } = useAuth();

  // Check lockout status
  useEffect(() => {
    if (lockoutUntil) {
      const now = new Date();
      if (now < lockoutUntil) {
        setIsLocked(true);
        const timer = setTimeout(() => {
          setIsLocked(false);
          setLockoutUntil(null);
          setAttemptCount(0);
        }, lockoutUntil.getTime() - now.getTime());
        return () => clearTimeout(timer);
      } else {
        setIsLocked(false);
        setLockoutUntil(null);
        setAttemptCount(0);
      }
    }
  }, [lockoutUntil]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    try {
      emailSchema.parse(value);
      setEmailError("");
    } catch (error: any) {
      setEmailError(error.errors[0].message);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (isSignUp) {
      try {
        passwordSchema.parse(value);
        setPasswordError("");
      } catch (error: any) {
        setPasswordError(error.errors[0].message);
      }
    }
  };

  // Calculate lockout time
  const calculateLockoutTime = (attempts: number): number => {
    const lockoutDurations = [30, 60, 300, 900, 3600]; // 30s, 1m, 5m, 15m, 1h
    const index = Math.min(attempts - 5, lockoutDurations.length - 1);
    return lockoutDurations[Math.max(0, index)] * 1000;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if locked out
    if (isLocked && lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil.getTime() - new Date().getTime()) / 1000);
      toast({
        title: "Too many attempts",
        description: `Please wait ${remainingTime} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }

    try {
      emailSchema.parse(email);
    } catch (error: any) {
      setEmailError(error.errors[0].message);
      return;
    }

    if (isSignUp) {
      try {
        passwordSchema.parse(password);
      } catch (error: any) {
        setPasswordError(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        // Reset attempts on success
        setAttemptCount(0);
        setLockoutUntil(null);
        toast({
          title: "Welcome to Blissy! 🌸",
          description: "Your account has been created successfully.",
        });
      } else {
        await signIn(email, password);
        // Reset attempts on success
        setAttemptCount(0);
        setLockoutUntil(null);
        toast({
          title: "Welcome back! 💗",
          description: "You've successfully signed in.",
        });
      }
    } catch (error: any) {
      // Increment attempt count on failure
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      // Apply lockout after 5 failed attempts
      if (newAttemptCount >= 5) {
        const lockoutDuration = calculateLockoutTime(newAttemptCount);
        const lockoutTime = new Date(Date.now() + lockoutDuration);
        setLockoutUntil(lockoutTime);
        setIsLocked(true);
        
        toast({
          title: "Account temporarily locked",
          description: `Too many failed attempts. Please wait ${Math.ceil(lockoutDuration / 1000)} seconds.`,
          variant: "destructive",
        });
      } else {
        const message = handleError(error, "Authentication failed");
        toast({
          title: "Authentication failed",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent animate-gradient-shift bg-[length:200%_200%] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="animate-float inline-block">
            <Heart className="w-16 h-16 text-white fill-white mb-4" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {isSignUp ? "Join Blissy" : "Welcome Back"}
          </h1>
          <p className="text-white/90">
            {isSignUp
              ? "Start your mindfulness journey today"
              : "Continue your path to inner peace"}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
                className={`rounded-xl ${emailError ? 'border-destructive' : ''}`}
                disabled={isLocked}
              />
              {emailError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password{isSignUp && " (min 12 chars)"}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                minLength={isSignUp ? 12 : undefined}
                className={`rounded-xl ${passwordError ? 'border-destructive' : ''}`}
                disabled={isLocked}
              />
              {passwordError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {passwordError}
                </p>
              )}
              {isSignUp && !passwordError && password && (
                <p className="text-xs text-muted-foreground">
                  Use uppercase, lowercase, numbers, and special characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || isLocked || !!emailError || (isSignUp && !!passwordError)}
              className="w-full rounded-full bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? "Please wait..." : isLocked ? "Account Locked" : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            
            {attemptCount > 0 && attemptCount < 5 && (
              <p className="text-xs text-center text-muted-foreground">
                {5 - attemptCount} attempt(s) remaining
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
