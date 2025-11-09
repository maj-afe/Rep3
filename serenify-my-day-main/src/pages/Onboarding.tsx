import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import onboarding1 from "@/assets/onboarding-1.jpg";

const GOALS = [
  { id: "stress", label: "Reduce Stress", icon: "😌" },
  { id: "sleep", label: "Better Sleep", icon: "😴" },
  { id: "focus", label: "Improve Focus", icon: "🎯" },
  { id: "peace", label: "Find Peace", icon: "🕊️" },
];

const MEDITATION_TIMES = [
  { id: "morning", label: "Morning", time: "07:00" },
  { id: "afternoon", label: "Afternoon", time: "14:00" },
  { id: "evening", label: "Evening", time: "19:00" },
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const slides = [
    {
      title: "Welcome to Blissy 🌸",
      description: "Your personal companion for mental wellness and mindfulness",
      image: onboarding1,
      type: "intro",
    },
    {
      title: "What brings you here?",
      description: "Select your primary goal",
      image: onboarding1,
      type: "goal",
    },
    {
      title: "When do you want to meditate?",
      description: "Choose your preferred time",
      image: onboarding1,
      type: "time",
    },
    {
      title: "You're all set! 🎉",
      description: "Let's begin your mindfulness journey",
      image: onboarding1,
      type: "complete",
    },
  ];

  const savePreferences = async () => {
    if (!user) return;
    
    await supabase.from("user_preferences").upsert({
      user_id: user.id,
      primary_goal: selectedGoal || "Peace",
      preferred_meditation_time: selectedTime || "morning",
      notification_time: MEDITATION_TIMES.find(t => t.id === selectedTime)?.time || "09:00",
    });
  };

  const handleNext = async () => {
    const currentType = slides[currentSlide].type;
    
    // Validate selections
    if (currentType === "goal" && !selectedGoal) return;
    if (currentType === "time" && !selectedTime) return;
    
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await savePreferences();
      navigate(user ? "/home" : "/auth");
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="relative aspect-video mb-8 rounded-3xl overflow-hidden">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              {slides[currentSlide].title}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {slides[currentSlide].description}
            </p>

            {/* Goal Selection */}
            {slides[currentSlide].type === "goal" && (
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <Card
                    key={goal.id}
                    className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                      selectedGoal === goal.id
                        ? "ring-2 ring-primary bg-primary/10"
                        : ""
                    }`}
                    onClick={() => setSelectedGoal(goal.id)}
                  >
                    <div className="text-3xl mb-2">{goal.icon}</div>
                    <div className="text-sm font-medium">{goal.label}</div>
                  </Card>
                ))}
              </div>
            )}

            {/* Time Selection */}
            {slides[currentSlide].type === "time" && (
              <div className="space-y-3">
                {MEDITATION_TIMES.map((time) => (
                  <Card
                    key={time.id}
                    className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                      selectedTime === time.id
                        ? "ring-2 ring-primary bg-primary/10"
                        : ""
                    }`}
                    onClick={() => setSelectedTime(time.id)}
                  >
                    <div className="text-sm font-medium">{time.label}</div>
                    <div className="text-xs text-muted-foreground">{time.time}</div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-primary/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="max-w-md mx-auto flex gap-4">
          {currentSlide > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrev}
              className="flex-1 rounded-full"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}
          <Button
            size="lg"
            onClick={handleNext}
            className="flex-1 rounded-full bg-primary hover:bg-primary/90"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
            {currentSlide < slides.length - 1 && (
              <ChevronRight className="w-5 h-5 ml-2" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
