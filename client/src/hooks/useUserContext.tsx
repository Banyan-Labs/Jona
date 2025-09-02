// client\src\hooks\useUserContext.tsx
'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const useUserContext = () => {
  const [authUser, setAuthUser] = useState<{ id: string | null }>({ id: null });

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      setAuthUser({ id: user?.id ?? null });
    };

    getSession();
  }, []);

  return authUser;
};