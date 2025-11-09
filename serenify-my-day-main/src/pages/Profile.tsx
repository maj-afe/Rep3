import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { BottomNav } from "@/components/BottomNav";
import { useMoodTracking } from "@/hooks/use-mood-tracking";
import { useMeditationHistory } from "@/hooks/use-meditation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Crown, Bell, Moon, LogOut, Clock, TrendingUp, Palette, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/hooks/use-notifications";
import { useAchievements } from "@/hooks/use-achievements";
import { AchievementBadge } from "@/components/AchievementBadge";
import { ThemePicker } from "@/components/ThemePicker";

const moods = [
  { emoji: "😔", label: "Struggling", value: 1 },
  { emoji: "😐", label: "Okay", value: 2 },
  { emoji: "🙂", label: "Good", value: 3 },
  { emoji: "😄", label: "Great", value: 4 },
  { emoji: "🥰", label: "Amazing", value: 5 },
];

const Profile = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme, themePreset, setThemePreset } = useTheme();
  const { saveMood, isSaving, getWeeklyMoods, getStreak } = useMoodTracking();
  const { data: meditationHistory = [] } = useMeditationHistory();
  const { permission, preferences, requestPermission, updatePreferences } = useNotifications();
  const { achievements, unlockedAchievements, checkAchievements } = useAchievements();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const weeklyData = getWeeklyMoods();
  const streak = getStreak();

  // Calculate meditation stats
  const totalMeditationMinutes = Math.floor(
    meditationHistory.reduce((acc, session) => acc + (session.duration_seconds || 0), 0) / 60
  );
  const totalSessions = meditationHistory.length;
  const avgSessionMinutes = totalSessions > 0 ? Math.floor(totalMeditationMinutes / totalSessions) : 0;

  // Check achievements whenever stats update
  useEffect(() => {
    checkAchievements({
      streak,
      totalSessions,
      totalMinutes: totalMeditationMinutes,
    });
  }, [streak, totalSessions, totalMeditationMinutes]);

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
    saveMood({ moodValue: value });
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/5 to-primary/10 pb-24">
      <div className="max-w-lg mx-auto px-6 pt-12">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center text-4xl">
            🌸
          </div>
          <h1 className="text-2xl font-bold mb-1">Welcome, Friend</h1>
          <p className="text-muted-foreground">{streak}-day streak 🔥</p>
        </div>

        <GradientCard variant="warm" className="mb-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">How are you feeling today?</h3>
            <div className="flex justify-between gap-2 mb-4">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  disabled={isSaving}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                    selectedMood === mood.value
                      ? "bg-primary/20 scale-110"
                      : "bg-card/50 hover:bg-card"
                  }`}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
            {selectedMood && (
              <p className="text-sm text-muted-foreground animate-fade-in">
                Thank you for sharing. Remember, all feelings are valid. 💗
              </p>
            )}
          </div>
        </GradientCard>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Analytics</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <GradientCard variant="warm">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Meditation</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Time</span>
                  <span className="font-bold">{totalMeditationMinutes}m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sessions</span>
                  <span className="font-bold">{totalSessions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Duration</span>
                  <span className="font-bold">{avgSessionMinutes}m</span>
                </div>
              </div>
            </GradientCard>

            <GradientCard variant="calm">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Streak</h4>
              </div>
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-primary mb-1">{streak}</div>
                <div className="text-sm text-muted-foreground">days</div>
              </div>
            </GradientCard>
          </div>

          <GradientCard>
            <h4 className="font-semibold mb-3">Weekly Mood</h4>
            <div className="flex justify-between items-end h-24 gap-2">
              {weeklyData.map((mood, index) => {
                const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                const height = mood ? (mood / 5) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-muted rounded-lg overflow-hidden relative h-full">
                      {mood && (
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-secondary rounded-lg transition-all"
                          style={{ height: `${height}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{days[index]}</span>
                  </div>
                );
              })}
            </div>
          </GradientCard>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </h3>
            <span className="text-sm text-muted-foreground">
              {unlockedAchievements.length}/{achievements.length}
            </span>
          </div>
          <div className="grid gap-3">
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                icon={achievement.icon}
                title={achievement.title}
                description={achievement.description}
                unlocked={unlockedAchievements.includes(achievement.id)}
              />
            ))}
          </div>
        </div>

        <GradientCard className="mb-6">
          <button
            onClick={() => navigate("/subscription")}
            className="w-full text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Upgrade to Premium</h4>
                <p className="text-sm text-muted-foreground">
                  Unlock unlimited access to all features
                </p>
              </div>
            </div>
          </button>
        </GradientCard>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Theme</h3>
          <GradientCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Color Preset</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowThemePicker(!showThemePicker)}
              >
                {showThemePicker ? "Hide" : "Customize"}
              </Button>
            </div>
            {showThemePicker && (
              <ThemePicker currentTheme={themePreset} onSelectTheme={setThemePreset} />
            )}
          </GradientCard>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          <div className="space-y-3">
            <GradientCard>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Notifications</span>
                  </div>
                  <Switch
                    checked={preferences.enabled}
                    onCheckedChange={async (enabled) => {
                      if (enabled && permission !== "granted") {
                        const granted = await requestPermission();
                        if (granted) updatePreferences({ enabled: true });
                      } else {
                        updatePreferences({ enabled });
                      }
                    }}
                  />
                </div>
              </div>
              
              {preferences.enabled && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <Label className="text-sm text-muted-foreground">Remind me about:</Label>
                  <div className="space-y-2">
                    {["meditation", "mood", "affirmations"].map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={type}
                          checked={preferences.types.includes(type)}
                          onCheckedChange={(checked) => {
                            const newTypes = checked
                              ? [...preferences.types, type]
                              : preferences.types.filter((t) => t !== type);
                            updatePreferences({ types: newTypes });
                          }}
                        />
                        <Label htmlFor={type} className="text-sm capitalize cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GradientCard>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-card">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Dark Mode</span>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-between w-full p-4 rounded-2xl bg-card hover:bg-destructive/10 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-destructive" />
                <span className="font-medium text-destructive">Log Out</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
