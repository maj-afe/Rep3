import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, RefreshCw, Plus, BadgeCheck } from "lucide-react";
import { useAffirmations } from "@/hooks/use-affirmations";
import { useFavoriteAffirmations, useCustomAffirmations } from "@/hooks/use-favorite-affirmations";

const categories = ["All", "Confidence", "Peace", "Focus", "Gratitude"];

const Affirmations = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"all" | "favorites" | "custom">("all");
  const { data: publicAffirmations = [], isLoading } = useAffirmations(selectedCategory);
  const { favorites, addFavorite, removeFavorite, isFavorite, getFavoriteId } = useFavoriteAffirmations();
  const { data: customAffirmations = [] } = useCustomAffirmations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customText, setCustomText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { createCustom } = useFavoriteAffirmations();

  // Combine affirmations based on view mode
  const affirmations = 
    viewMode === "favorites" ? favorites :
    viewMode === "custom" ? customAffirmations :
    [...publicAffirmations, ...customAffirmations];

  const currentAffirmation = affirmations[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % affirmations.length);
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

  const handleCreateCustom = () => {
    if (customText.trim()) {
      createCustom({ text: customText.trim() });
      setCustomText("");
      setDialogOpen(false);
    }
  };

  const isCurrentFavorite = currentAffirmation ? isFavorite(currentAffirmation.text) : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-secondary/10 to-accent/10 pb-24">
      <div className="max-w-lg mx-auto px-6 pt-12">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Daily Affirmations</h1>
          <p className="text-muted-foreground">
            Positive words to inspire your day
          </p>
        </div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
            <TabsTrigger value="custom" className="flex-1">My Custom</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Category Tabs (only for "All" view) */}
        {viewMode === "all" && (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="rounded-full">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Create Custom Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mb-6 rounded-full">
              <Plus className="w-5 h-5 mr-2" />
              Create Custom Affirmation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Your Affirmation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Textarea
                placeholder="I am confident and capable..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <Button 
                onClick={handleCreateCustom} 
                className="w-full rounded-full"
                disabled={!customText.trim()}
              >
                Create Affirmation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <GradientCard variant="calm" className="mb-6">
          <div className="text-center py-12">
            {isLoading ? (
              <p className="text-muted-foreground">Loading affirmations...</p>
            ) : affirmations.length === 0 ? (
              <div>
                <p className="text-muted-foreground mb-4">
                  {viewMode === "favorites" ? "No favorites yet. Tap the heart to add some!" :
                   viewMode === "custom" ? "No custom affirmations yet. Create your first one!" :
                   "No affirmations in this category yet."}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-center gap-2">
                  <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {"category" in currentAffirmation ? currentAffirmation.category : "Custom"}
                  </span>
                  {customAffirmations.some(ca => ca.id === currentAffirmation?.id) && (
                    <BadgeCheck className="w-5 h-5 text-secondary" />
                  )}
                </div>
                <h2 className="text-2xl font-semibold mb-8 leading-relaxed px-4 min-h-[80px] flex items-center justify-center">
                  {currentAffirmation?.text}
                </h2>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant={isCurrentFavorite ? "default" : "outline"}
                    size="lg"
                    onClick={handleFavoriteToggle}
                    className="rounded-full"
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isCurrentFavorite ? "fill-current" : ""}`} />
                    {isCurrentFavorite ? "Favorited" : "Favorite"}
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleNext}
                    className="rounded-full bg-primary hover:bg-primary/90"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </GradientCard>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {viewMode === "favorites" ? "Your Favorites" :
             viewMode === "custom" ? "Your Custom Affirmations" :
             "All Affirmations"}
          </h3>
          {affirmations.map((affirmation, index) => {
            const isCustom = customAffirmations.some(ca => ca.id === affirmation.id);
            const isFav = isFavorite(affirmation.text);
            
            return (
              <button
                key={affirmation.id}
                onClick={() => setCurrentIndex(index)}
                className={`w-full text-left p-5 rounded-2xl transition-all ${
                  index === currentIndex
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-card hover:bg-card/80 border-2 border-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <span className="text-2xl">{isFav ? "❤️" : "💗"}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <p className="font-medium mb-1 flex-1">{affirmation.text}</p>
                      {isCustom && <BadgeCheck className="w-4 h-4 text-secondary flex-shrink-0 mt-1" />}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {"category" in affirmation ? affirmation.category : "Custom"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Affirmations;
