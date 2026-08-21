export interface FeedbackCreate {
  feedback: string;
}

export interface FeedbackRead {
  id: string;
  feedback: string;
  user_id: string;
  recommendation_id: string;
  created_at: string;
}

export const FEEDBACK_MAX_LENGTH = 2000;
