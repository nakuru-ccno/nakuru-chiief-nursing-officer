
import { useEffect, useState } from "react";

// Returns device Date + a greeting string ("Good Morning" etc)
export function useLiveTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  let greeting = "Good Night";
  if (hour >= 5 && hour < 12) greeting = "Good Morning";
  else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17 && hour < 22) greeting = "Good Evening";

  return {
    currentTime,
    greeting,
  };
}
