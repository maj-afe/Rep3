import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface NotificationPreferences {
  enabled: boolean;
  time: string;
  types: string[];
}

export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    time: "09:00",
    types: ["meditation", "mood", "affirmations"],
  });

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("notification_enabled, notification_time, reminder_types")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setPreferences({
          enabled: data.notification_enabled || false,
          time: data.notification_time || "09:00",
          types: data.reminder_types || ["meditation", "mood", "affirmations"],
        });
      }
    };

    fetchPreferences();
  }, [user]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      });
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      toast({
        title: "Notifications enabled",
        description: "You'll receive mindfulness reminders",
      });
      return true;
    } else {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings",
        variant: "destructive",
      });
      return false;
    }
  };

  const scheduleNotification = (title: string, body: string, delay: number = 0) => {
    if (permission !== "granted") return;

    setTimeout(() => {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }, delay);
  };

  const updatePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
    if (!user) return;

    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        notification_enabled: updated.enabled,
        notification_time: updated.time,
        reminder_types: updated.types,
      });

    toast({
      title: "Preferences saved",
      description: "Your notification settings have been updated",
    });
  };

  return {
    permission,
    preferences,
    requestPermission,
    scheduleNotification,
    updatePreferences,
  };
}
