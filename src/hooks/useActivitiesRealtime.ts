
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Enhanced real-time hook for activities
export function useActivitiesRealtime(refresh: () => void) {
  useEffect(() => {
    let isMounted = true;
    console.log('🔄 Setting up real-time activities listener');
    
    const channel = supabase
      .channel("activities-realtime-enhanced")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "activities",
        },
        (payload) => {
          console.log('🔄 Real-time activity change detected:', payload);
          if (isMounted) {
            // Add a small delay to ensure data consistency
            setTimeout(() => {
              refresh();
            }, 100);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔄 Real-time subscription status:', status);
      });

    return () => {
      console.log('🔄 Cleaning up real-time activities listener');
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [refresh]);
}
