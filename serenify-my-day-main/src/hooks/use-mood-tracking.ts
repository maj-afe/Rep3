import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { moodSchema } from "@/utils/validation";
import { sanitizeHtml } from "@/utils/sanitization";
import { handleError } from "@/utils/errorHandler";

export function useMoodTracking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: moodEntries = [], isLoading } = useQuery({
    queryKey: ["mood-entries", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const saveMood = useMutation({
    mutationFn: async ({ moodValue, note }: { moodValue: number; note?: string }) => {
      if (!user) throw new Error("Not authenticated");

      try {
        const validatedMood = moodSchema.parse({ mood_value: moodValue, note });
        const sanitizedNote = validatedMood.note ? sanitizeHtml(validatedMood.note) : undefined;

        const { error } = await supabase.from("mood_entries").insert({
          user_id: user.id,
          mood_value: validatedMood.mood_value,
          note: sanitizedNote,
        });

        if (error) throw error;
      } catch (error) {
        handleError(error, "Failed to save mood.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mood-entries"] });
      toast({
        title: "Mood saved",
        description: "Thank you for sharing how you feel 💗",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getWeeklyMoods = () => {
    const today = new Date();
    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const mood = moodEntries.find((entry) => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= date && entryDate < nextDay;
      });

      weeklyData.push(mood?.mood_value || null);
    }

    return weeklyData;
  };

  const getStreak = () => {
    if (moodEntries.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < moodEntries.length; i++) {
      const entryDate = new Date(moodEntries[i].created_at);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  return {
    moodEntries,
    isLoading,
    saveMood: saveMood.mutate,
    isSaving: saveMood.isPending,
    getWeeklyMoods,
    getStreak,
  };
}
