import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CalendarBadge = () => {
  const [hasEventToday, setHasEventToday] = useState(false);

  useEffect(() => {
    async function checkEvents() {
      const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id")
        .gte("event_date", today)
        .lte("event_date", today);

      if (!error && data.length > 0) {
        setHasEventToday(true);
      }
    }

    checkEvents();
  }, []);

  if (!hasEventToday) return null;

  return (
    <span className="ml-1 inline-block bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
      ● Today
    </span>
  );
};

export default CalendarBadge;
