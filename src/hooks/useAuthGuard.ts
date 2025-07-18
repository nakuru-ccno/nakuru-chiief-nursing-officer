import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAuthGuard = () => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        setIsAllowed(false);
        return navigate("/login");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("email", user.email)
        .maybeSingle();

      if (!profile || profile.status !== "active") {
        await supabase.auth.signOut();
        setIsAllowed(false);
        return navigate("/login");
      }

      setIsAllowed(true);
    };

    checkAuth();
  }, [navigate]);

  return isAllowed;
};
