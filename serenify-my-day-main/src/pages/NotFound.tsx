import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
      <div className="text-center px-6">
        <div className="mb-6 text-8xl">🌿</div>
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-2 text-2xl font-semibold">Lost in the clouds?</p>
        <p className="mb-8 text-muted-foreground">This page doesn't exist in your mindfulness journey</p>
        <a 
          href="/" 
          className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg transition-all"
        >
          Return to Peace
        </a>
      </div>
    </div>
  );
};

export default NotFound;
