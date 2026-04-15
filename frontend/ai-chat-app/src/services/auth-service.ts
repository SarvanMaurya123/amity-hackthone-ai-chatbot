import { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail ?? fallback;
  }

  return fallback;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", payload);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to sign in"));
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", payload);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to create account"));
    }
  },

  async me(): Promise<AuthUser> {
    try {
      const response = await apiClient.get<AuthUser>("/auth/me");
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to fetch current user"));
    }
  },
};
