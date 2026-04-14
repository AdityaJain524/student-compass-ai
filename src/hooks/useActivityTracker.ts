import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Tracks page visits automatically */
export function useActivityTracker() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const page = location.pathname;
    // debounce — don't log same page within 5s
    const key = `last_tracked_${page}`;
    const last = sessionStorage.getItem(key);
    if (last && Date.now() - Number(last) < 5000) return;
    sessionStorage.setItem(key, String(Date.now()));

    supabase.from("user_activity").insert({
      user_id: user.id,
      activity_type: "page_visit",
      page,
    }).then(() => {});
  }, [user, location.pathname]);
}
