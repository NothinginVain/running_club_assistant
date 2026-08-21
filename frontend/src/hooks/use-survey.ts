"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { surveysApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/types/api";
import type { SurveyRead } from "@/types";

export function useLatestSurvey(enabled = true) {
  return useQuery<SurveyRead | null>({
    queryKey: queryKeys.latestSurvey,
    queryFn: async () => {
      try {
        return await surveysApi.getLatest();
      } catch (error) {
        if (error instanceof ApiError && error.kind === "not_found") {
          return null;
        }
        throw error;
      }
    },
    enabled,
  });
}

export function useSurveys() {
  return useQuery({
    queryKey: queryKeys.surveys,
    queryFn: () => surveysApi.list(),
  });
}

export function useSurvey(surveyId: string | null) {
  return useQuery({
    queryKey: queryKeys.survey(surveyId ?? "none"),
    queryFn: () => surveysApi.get(surveyId as string),
    enabled: Boolean(surveyId),
  });
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (surveyId: string) => surveysApi.remove(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys });
      queryClient.invalidateQueries({ queryKey: queryKeys.latestSurvey });
    },
  });
}
