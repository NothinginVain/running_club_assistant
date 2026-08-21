"use client";

import { useQuery } from "@tanstack/react-query";

import { surveysApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/types/api";
import type { SurveyRead } from "@/types";

export function useLatestSurvey(userId: string | null) {
  return useQuery<SurveyRead | null>({
    queryKey: queryKeys.latestSurvey(userId ?? "none"),
    queryFn: async () => {
      try {
        return await surveysApi.getLatestForUser(userId as string);
      } catch (error) {
        if (error instanceof ApiError && error.kind === "not_found") {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(userId),
  });
}
