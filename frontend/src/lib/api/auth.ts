import { apiClient } from "./client";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from "@/types";

export const authApi = {
  register: (data: RegisterRequest) => apiClient.post<User>("/auth/register", data),

  login: (data: LoginRequest) => apiClient.post<User>("/auth/login", data),

  logout: () => apiClient.post<MessageResponse>("/auth/logout"),

  me: () => apiClient.get<User>("/auth/me"),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<MessageResponse>("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<MessageResponse>("/auth/reset-password", data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<MessageResponse>("/auth/change-password", data),
};
