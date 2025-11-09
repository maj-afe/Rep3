import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useFavoriteAffirmations() {
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorite-affirmations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_affirmations")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_favorite", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (affirmationText: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_affirmations")
        .insert({
          user_id: user.id,
          text: affirmationText,
          is_favorite: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-affirmations"] });
      toast({
        title: "Added to Favorites",
        description: "Affirmation saved to your favorites.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add to favorites.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (affirmationId: string) => {
      const { error } = await supabase
        .from("user_affirmations")
        .delete()
        .eq("id", affirmationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-affirmations"] });
      toast({
        title: "Removed from Favorites",
        description: "Affirmation removed from your favorites.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const createCustomMutation = useMutation({
    mutationFn: async ({ text, category }: { text: string; category?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_affirmations")
        .insert({
          user_id: user.id,
          text,
          is_favorite: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-affirmations"] });
      queryClient.invalidateQueries({ queryKey: ["custom-affirmations"] });
      toast({
        title: "Affirmation Created",
        description: "Your custom affirmation has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create affirmation.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const isFavorite = (affirmationText: string) => {
    return favorites.some((fav) => fav.text === affirmationText);
  };

  const getFavoriteId = (affirmationText: string) => {
    return favorites.find((fav) => fav.text === affirmationText)?.id;
  };

  return {
    favorites,
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
    createCustom: createCustomMutation.mutate,
    isFavorite,
    getFavoriteId,
    isLoading: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
  };
}

export function useCustomAffirmations() {
  return useQuery({
    queryKey: ["custom-affirmations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_affirmations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}
