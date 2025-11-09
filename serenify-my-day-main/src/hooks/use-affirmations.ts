import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAffirmations(category?: string) {
  return useQuery({
    queryKey: ["affirmations", category],
    queryFn: async () => {
      let query = supabase
        .from("affirmations")
        .select("*")
        .order("created_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}
