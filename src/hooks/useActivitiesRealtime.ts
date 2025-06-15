
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Usage: useActivitiesRealtime(refreshFn)
export function useActivitiesRealtime(refresh: () => void) {
  useEffect(() => {
    let isMounted = true;
    const channel = supabase
      .channel("activities-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
        },
        () => {
          if (isMounted) {
            refresh(); // reload data when activities change
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [refresh]);
}
