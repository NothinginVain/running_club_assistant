import { apiClient } from "./client";
import { RecommendationType } from "@/types";
import type { RunningPlanSurveyAnswers, SurveyRead } from "@/types";

export const surveysApi = {
  create: (answers: RunningPlanSurveyAnswers) =>
    apiClient.post<SurveyRead>("/surveys/", {
      survey_type: RecommendationType.RUNNING_PLAN,
      answers,
    }),

  list: () => apiClient.get<SurveyRead[]>("/surveys/"),

  getLatest: () => apiClient.get<SurveyRead>("/surveys/latest"),

  get: (surveyId: string) => apiClient.get<SurveyRead>(`/surveys/${surveyId}`),

  remove: (surveyId: string) => apiClient.delete<void>(`/surveys/${surveyId}`),
};
