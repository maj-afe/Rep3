import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { journalSchema } from "@/utils/validation";
import { sanitizeHtml } from "@/utils/sanitization";
import { handleError } from "@/utils/errorHandler";

export function useJournal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["journal-entries", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createEntry = useMutation({
    mutationFn: async (entry: { title: string; content: string; mood_value: number }) => {
      if (!user) throw new Error("Not authenticated");

      const validatedEntry = journalSchema.parse(entry);

      const sanitizedContent = sanitizeHtml(validatedEntry.content);

      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        title: validatedEntry.title,
        content: sanitizedContent,
        mood_value: validatedEntry.mood_value,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved successfully.",
      });
    },
    onError: (error) => {
      const message = handleError(error, "Failed to save journal entry.");
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async (entry: { id: string; title: string; content: string; mood_value: number }) => {
      if (!user) throw new Error("Not authenticated");

      const { id, ...rest } = entry;
      const validatedEntry = journalSchema.parse(rest);

      const sanitizedContent = sanitizeHtml(validatedEntry.content);

      const { error } = await supabase
        .from("journal_entries")
        .update({
          title: validatedEntry.title,
          content: sanitizedContent,
          mood_value: validatedEntry.mood_value,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast({
        title: "Entry updated",
        description: "Your journal entry has been updated.",
      });
    },
    onError: (error) => {
      const message = handleError(error, "Failed to update journal entry.");
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted.",
      });
    },
  });

  return {
    entries,
    isLoading,
    createEntry: createEntry.mutate,
    updateEntry: updateEntry.mutate,
    deleteEntry: deleteEntry.mutate,
    isCreating: createEntry.isPending,
    isUpdating: updateEntry.isPending,
    isDeleting: deleteEntry.isPending,
  };
}
