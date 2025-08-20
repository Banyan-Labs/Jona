"use-client"
import { useUserContext } from "@/hooks/useUserContext";
import type { JobStatusPayload } from "@/types/application";
import { supabase } from "@/lib/supabaseClient";
export const useJobStatusWriter = () => {
  const { user } = useUserContext();

  const upsertStatus = async (payload: JobStatusPayload) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("user_job_status")
      .upsert([{ ...payload, user_id: user.id }]);

    if (error) {
      console.error("❌ Error writing job status:", error.message);
    }
  };

  return { upsertStatus };
};

import { useEffect, useState } from "react";
import type { UserJobStatus } from "@/types/application";

export const useUserJobStatus = () => {
  const { user } = useUserContext();
  const [statusMap, setStatusMap] = useState<Map<string, UserJobStatus>>(new Map());

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("user_job_status")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("❌ Error fetching job status:", error.message);
        return;
      }

      const map = new Map<string, UserJobStatus>();
      data?.forEach((status) => {
        map.set(status.job_id, status);
      });

      setStatusMap(map);
    };

    fetchStatus();
  }, [user?.id]);

  return statusMap;
};