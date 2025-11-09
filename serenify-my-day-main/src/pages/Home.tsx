import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { BottomNav } from "@/components/BottomNav";
import { useMoodTracking } from "@/hooks/use-mood-tracking";
import { Heart, RefreshCw, Play, Library, Wind, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAffirmations } from "@/hooks/use-affirmations";
import { useFavoriteAffirmations } from "@/hooks/use-favorite-affirmations";

// Home page component

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: affirmations = [] } = useAffirmations();
  const { getStreak } = useMoodTracking();
  const { addFavorite, removeFavorite, isFavorite: checkIsFavorite, getFavoriteId } = useFavoriteAffirmations();
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  
  const streak = getStreak();

  const currentAffirmation = affirmations[currentAffirmationIndex];
  const isCurrentFavorite = currentAffirmation ? checkIsFavorite(currentAffirmation.text) : false;

  const handleNewAffirmation = () => {
    if (affirmations.length > 1) {
      let newIndex = Math.floor(Math.random() * affirmations.length);
      while (newIndex === currentAffirmationIndex) {
        newIndex = Math.floor(Math.random() * affirmations.length);
      }
      setCurrentAffirmationIndex(newIndex);
    }
  };

  const handleFavoriteToggle = () => {
    if (!currentAffirmation) return;
    
    const favoriteId = getFavoriteId(currentAffirmation.text);
    if (favoriteId) {
      removeFavorite(favoriteId);
    } else {
      addFavorite(currentAffirmation.text);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-accent/10 pb-24">
      <div className="max-w-lg mx-auto px-6 pt-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, Friend 🌞
          </h1>
          <p className="text-muted-foreground">
            Take a moment to breathe and center yourself
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <GradientCard variant="calm" className="p-6 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <p className="text-2xl font-bold mb-1">{streak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </GradientCard>
          <GradientCard variant="warm" className="p-6 text-center">
            <div className="text-3xl mb-2">🌸</div>
            <p className="text-2xl font-bold mb-1">Peace</p>
            <p className="text-sm text-muted-foreground">Your Goal</p>
          </GradientCard>
        </div>

        <GradientCard variant="calm" className="mb-6">
          <div className="text-center py-8">
            <p className="text-sm font-medium text-muted-foreground mb-4">
              Today's Affirmation
            </p>
            <h2 className="text-2xl font-semibold mb-8 leading-relaxed min-h-[60px] flex items-center justify-center">
              {currentAffirmation?.text || "Loading affirmations..."}
            </h2>
            {currentAffirmation && (
              <div className="mb-6">
                <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {currentAffirmation.category}
                </span>
              </div>
            )}
            {affirmations.length > 0 && (
              <div className="flex gap-3 justify-center">
                <Button
                  variant={isCurrentFavorite ? "default" : "outline"}
                  size="lg"
                  onClick={handleFavoriteToggle}
                  className="rounded-full"
                >
                  <Heart
                    className={`w-5 h-5 mr-2 ${isCurrentFavorite ? "fill-current" : ""}`}
                  />
                  {isCurrentFavorite ? "Saved" : "Save"}
                </Button>
                <Button
                  size="lg"
                  onClick={handleNewAffirmation}
                  className="rounded-full bg-primary hover:bg-primary/90"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  New Affirmation
                </Button>
              </div>
            )}
          </div>
        </GradientCard>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Relaxation Zone</h3>
          <GradientCard variant="warm">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Mind Relax Session</h4>
                <p className="text-sm text-muted-foreground">
                  10 minutes of calming meditation
                </p>
              </div>
              <Button
                onClick={() => navigate("/meditation")}
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                Start
              </Button>
            </div>
          </GradientCard>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/affirmations")}
              className="p-6 rounded-2xl bg-card hover:bg-card/80 transition-colors text-left shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Affirmations</h4>
              <p className="text-sm text-muted-foreground">
                Browse library
              </p>
            </button>
            <button
              onClick={() => navigate("/meditation-library")}
              className="p-6 rounded-2xl bg-card hover:bg-card/80 transition-colors text-left shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/30 flex items-center justify-center mb-3">
                <Library className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Library</h4>
              <p className="text-sm text-muted-foreground">
                Meditations
              </p>
            </button>
            <button
              onClick={() => navigate("/breathing")}
              className="p-6 rounded-2xl bg-card hover:bg-card/80 transition-colors text-left shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/30 flex items-center justify-center mb-3">
                <Wind className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Breathing</h4>
              <p className="text-sm text-muted-foreground">
                Guided exercises
              </p>
            </button>
            <button
              onClick={() => navigate("/journal")}
              className="p-6 rounded-2xl bg-card hover:bg-card/80 transition-colors text-left shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Journal</h4>
              <p className="text-sm text-muted-foreground">
                Reflect & grow
              </p>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
