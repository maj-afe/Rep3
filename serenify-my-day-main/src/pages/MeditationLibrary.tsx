import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { GradientCard } from "@/components/ui/gradient-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMeditations } from "@/hooks/use-meditation";
import { Play, Search, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MeditationLibrary = () => {
  const { data: meditations = [], isLoading } = useMeditations();
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const navigate = useNavigate();

  const filteredMeditations = meditations.filter((meditation) => {
    const matchesSearch = meditation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meditation.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDuration = 
      durationFilter === "all" ||
      (durationFilter === "short" && meditation.duration_seconds <= 300) ||
      (durationFilter === "medium" && meditation.duration_seconds > 300 && meditation.duration_seconds <= 900) ||
      (durationFilter === "long" && meditation.duration_seconds > 900);

    return matchesSearch && matchesDuration;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const handlePlayMeditation = (meditationId: string) => {
    navigate(`/meditation?id=${meditationId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-secondary/10 to-accent/10 pb-24">
      <div className="max-w-lg mx-auto px-6 pt-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meditation Library</h1>
          <p className="text-muted-foreground">
            Choose a meditation to begin your practice
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search meditations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>

        {/* Duration Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { label: "All", value: "all" },
            { label: "Short (5 min)", value: "short" },
            { label: "Medium (10-15 min)", value: "medium" },
            { label: "Long (15+ min)", value: "long" },
          ].map((filter) => (
            <Button
              key={filter.value}
              variant={durationFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setDurationFilter(filter.value)}
              className="rounded-full whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Meditation Cards */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading meditations...</p>
          </div>
        ) : filteredMeditations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No meditations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeditations.map((meditation) => (
              <GradientCard key={meditation.id} variant="calm" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{meditation.title}</h3>
                    {meditation.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {meditation.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(meditation.duration_seconds)}</span>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => handlePlayMeditation(meditation.id)}
                    className="rounded-full w-16 h-16 p-0 flex-shrink-0"
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>
              </GradientCard>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MeditationLibrary;
