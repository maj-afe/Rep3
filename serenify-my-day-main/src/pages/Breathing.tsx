import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BreathingPattern = {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfterExhale?: number;
  cycles: number;
};

const patterns: BreathingPattern[] = [
  {
    name: "4-7-8 Breathing",
    description: "Calming technique for stress and anxiety relief",
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
  },
  {
    name: "Box Breathing",
    description: "Used by Navy SEALs for focus and calm",
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfterExhale: 4,
    cycles: 4,
  },
  {
    name: "Deep Breathing",
    description: "Simple deep breathing for relaxation",
    inhale: 4,
    hold: 2,
    exhale: 6,
    cycles: 5,
  },
];

const Breathing = () => {
  const navigate = useNavigate();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(patterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale" | "holdAfterExhale">("inhale");
  const [timeLeft, setTimeLeft] = useState(selectedPattern.inhale);
  const [currentCycle, setCurrentCycle] = useState(1);

  useEffect(() => {
    setTimeLeft(selectedPattern.inhale);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setIsActive(false);
  }, [selectedPattern]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          if (currentPhase === "inhale") {
            setCurrentPhase("hold");
            return selectedPattern.hold;
          } else if (currentPhase === "hold") {
            setCurrentPhase("exhale");
            return selectedPattern.exhale;
          } else if (currentPhase === "exhale") {
            if (selectedPattern.holdAfterExhale) {
              setCurrentPhase("holdAfterExhale");
              return selectedPattern.holdAfterExhale;
            } else {
              // Start new cycle
              if (currentCycle >= selectedPattern.cycles) {
                setIsActive(false);
                setCurrentCycle(1);
                setCurrentPhase("inhale");
                return selectedPattern.inhale;
              }
              setCurrentCycle((c) => c + 1);
              setCurrentPhase("inhale");
              return selectedPattern.inhale;
            }
          } else {
            // holdAfterExhale -> new cycle
            if (currentCycle >= selectedPattern.cycles) {
              setIsActive(false);
              setCurrentCycle(1);
              setCurrentPhase("inhale");
              return selectedPattern.inhale;
            }
            setCurrentCycle((c) => c + 1);
            setCurrentPhase("inhale");
            return selectedPattern.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentPhase, currentCycle, selectedPattern]);

  const getPhaseText = () => {
    switch (currentPhase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "holdAfterExhale":
        return "Hold";
    }
  };

  const getCircleScale = () => {
    if (currentPhase === "inhale") return "scale-150";
    if (currentPhase === "exhale") return "scale-75";
    return "scale-100";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Breathing Exercises</h1>
        </div>

        <Tabs defaultValue="0" onValueChange={(v) => setSelectedPattern(patterns[parseInt(v)])}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="0">4-7-8</TabsTrigger>
            <TabsTrigger value="1">Box</TabsTrigger>
            <TabsTrigger value="2">Deep</TabsTrigger>
          </TabsList>

          {patterns.map((pattern, idx) => (
            <TabsContent key={idx} value={idx.toString()} className="space-y-6">
              <GradientCard variant="calm">
                <h3 className="font-semibold text-xl mb-2">{pattern.name}</h3>
                <p className="text-muted-foreground">{pattern.description}</p>
              </GradientCard>

              <GradientCard variant="default" className="text-center py-12">
                <div className="flex flex-col items-center gap-8">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <div
                      className={`absolute w-32 h-32 rounded-full bg-primary/20 transition-transform duration-1000 ease-in-out ${
                        isActive ? getCircleScale() : ""
                      }`}
                    />
                    <div className="relative z-10 text-center">
                      <div className="text-6xl font-bold">{timeLeft}</div>
                      <div className="text-sm text-muted-foreground mt-2">seconds</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl font-semibold">{getPhaseText()}</div>
                    <div className="text-sm text-muted-foreground">
                      Cycle {currentCycle} of {pattern.cycles}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={() => setIsActive(!isActive)}
                    className="w-32 rounded-full"
                  >
                    {isActive ? (
                      <>
                        <Pause className="mr-2 h-5 w-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </GradientCard>

              <GradientCard variant="warm">
                <h4 className="font-semibold mb-3">Pattern</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Inhale:</span>{" "}
                    <span className="font-semibold">{pattern.inhale}s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hold:</span>{" "}
                    <span className="font-semibold">{pattern.hold}s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Exhale:</span>{" "}
                    <span className="font-semibold">{pattern.exhale}s</span>
                  </div>
                  {pattern.holdAfterExhale && (
                    <div>
                      <span className="text-muted-foreground">Hold:</span>{" "}
                      <span className="font-semibold">{pattern.holdAfterExhale}s</span>
                    </div>
                  )}
                </div>
              </GradientCard>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Breathing;
