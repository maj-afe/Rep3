import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_meditation",
    title: "First Steps",
    description: "Complete your first meditation",
    icon: "🧘",
    requirement: 1,
  },
  {
    id: "streak_3",
    title: "Building Habits",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    requirement: 3,
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⭐",
    requirement: 7,
  },
  {
    id: "streak_30",
    title: "Mindful Master",
    description: "Maintain a 30-day streak",
    icon: "🏆",
    requirement: 30,
  },
  {
    id: "sessions_10",
    title: "Dedicated Practitioner",
    description: "Complete 10 meditation sessions",
    icon: "💫",
    requirement: 10,
  },
  {
    id: "custom_affirmation",
    title: "Personal Touch",
    description: "Create your first custom affirmation",
    icon: "✨",
    requirement: 1,
  },
  {
    id: "mood_entries_5",
    title: "Emotion Explorer",
    description: "Log 5 mood entries in a week",
    icon: "😊",
    requirement: 5,
  },
  {
    id: "meditation_100_min",
    title: "Century Club",
    description: "Reach 100 minutes of total meditation time",
    icon: "⏱️",
    requirement: 100,
  },
];

export function useAchievements() {
  const { user } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      const { data } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      if (data) {
        setUnlockedAchievements(data.map((a) => a.achievement_id));
      }
      setLoading(false);
    };

    fetchAchievements();
  }, [user]);

  const unlockAchievement = async (achievementId: string) => {
    if (!user || unlockedAchievements.includes(achievementId)) return;

    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return;

    const { error } = await supabase.from("user_achievements").insert({
      user_id: user.id,
      achievement_id: achievementId,
    });

    if (!error) {
      setUnlockedAchievements([...unlockedAchievements, achievementId]);
      
      toast({
        title: `🎉 Achievement Unlocked!`,
        description: `${achievement.icon} ${achievement.title}`,
      });
    }
  };

  const checkAchievements = async (stats: {
    streak?: number;
    totalSessions?: number;
    totalMinutes?: number;
    customAffirmations?: number;
    weeklyMoodEntries?: number;
  }) => {
    if (stats.totalSessions === 1) unlockAchievement("first_meditation");
    if (stats.streak === 3) unlockAchievement("streak_3");
    if (stats.streak === 7) unlockAchievement("streak_7");
    if (stats.streak === 30) unlockAchievement("streak_30");
    if (stats.totalSessions === 10) unlockAchievement("sessions_10");
    if (stats.customAffirmations === 1) unlockAchievement("custom_affirmation");
    if (stats.weeklyMoodEntries === 5) unlockAchievement("mood_entries_5");
    if (stats.totalMinutes && stats.totalMinutes >= 100) unlockAchievement("meditation_100_min");
  };

  return {
    achievements: ACHIEVEMENTS,
    unlockedAchievements,
    loading,
    unlockAchievement,
    checkAchievements,
  };
}
