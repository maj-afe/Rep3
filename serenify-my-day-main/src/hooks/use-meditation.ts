import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useMeditations() {
  return useQuery({
    queryKey: ["meditations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meditations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useMeditationSession() {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async ({ meditationId, durationSeconds }: { meditationId?: string; durationSeconds: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("meditation_sessions")
        .insert({
          user_id: user.id,
          meditation_id: meditationId,
          duration_seconds: durationSeconds,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meditation-sessions"] });
      toast({
        title: "Session Completed! 🎉",
        description: "Great job on completing your meditation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save meditation session.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  return {
    saveSession: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}

export function useMeditationHistory() {
  return useQuery({
    queryKey: ["meditation-sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("meditation_sessions")
        .select("*, meditations(*)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}
