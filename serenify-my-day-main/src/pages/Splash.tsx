import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent animate-gradient-shift bg-[length:200%_200%]">
      <div className="animate-float">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-breathe" />
          <Heart className="w-24 h-24 text-white relative z-10 fill-white" />
        </div>
      </div>
      
      <h1 className="mt-8 text-5xl font-bold text-white tracking-tight">
        Blissy
      </h1>
      
      <p className="mt-4 text-lg text-white/90 font-light">
        Find your calm, one breath at a time
      </p>
    </div>
  );
};

export default Splash;
