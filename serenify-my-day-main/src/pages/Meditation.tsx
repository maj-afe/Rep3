import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useMeditations, useMeditationSession } from "@/hooks/use-meditation";
import { useSearchParams } from "react-router-dom";
import meditationVisual from "@/assets/meditation-visual.jpg";

const Meditation = () => {
  const [searchParams] = useSearchParams();
  const meditationId = searchParams.get("id");
  const { data: meditations = [] } = useMeditations();
  const { saveSession } = useMeditationSession();
  const [selectedMeditationIndex, setSelectedMeditationIndex] = useState(0);

  useEffect(() => {
    if (meditationId && meditations.length > 0) {
      const index = meditations.findIndex((m) => m.id === meditationId);
      if (index !== -1) {
        setSelectedMeditationIndex(index);
      }
    }
  }, [meditationId, meditations]);

  const selectedMeditation = meditations[selectedMeditationIndex];

  const handleComplete = () => {
    if (selectedMeditation) {
      saveSession({
        meditationId: selectedMeditation.id,
        durationSeconds: selectedMeditation.duration_seconds,
      });
    }
  };

  if (!selectedMeditation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-secondary/10 to-accent/10 pb-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading meditation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-secondary/10 to-accent/10 pb-24">
      <div className="max-w-lg mx-auto px-6 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{selectedMeditation.title}</h1>
          <p className="text-muted-foreground">
            {selectedMeditation.description || "Find your center in this peaceful moment"}
          </p>
        </div>

        <div className="relative mb-8">
          <div className="aspect-square rounded-3xl overflow-hidden relative">
            <img
              src={meditationVisual}
              alt="Meditation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
          </div>
        </div>

        {selectedMeditation.audio_url ? (
          <AudioPlayer 
            audioUrl={selectedMeditation.audio_url} 
            onComplete={handleComplete}
          />
        ) : (
          <div className="text-center p-6 rounded-2xl bg-card">
            <p className="text-muted-foreground">No audio available for this meditation</p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Session Tips</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-card/50">
              <p className="text-sm">
                🌬️ Focus on your breath - inhale peace, exhale tension
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card/50">
              <p className="text-sm">
                🧘 Sit comfortably with your spine straight
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card/50">
              <p className="text-sm">
                💭 Let thoughts pass like clouds in the sky
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Meditation;
