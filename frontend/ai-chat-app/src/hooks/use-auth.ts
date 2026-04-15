"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/token-storage";
import { authService } from "@/services/auth-service";
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

export const authQueryKey = ["auth", "me"] as const;

export function useAuthUser() {
  return useQuery<AuthUser | null>({
    queryKey: authQueryKey,
    queryFn: async () => {
      if (!getAccessToken()) {
        return null;
      }

      try {
        return await authService.me();
      } catch {
        clearAccessToken();
        return null;
      }
    },
  });
}

function useAuthMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<AuthResponse>,
  options?: { persistSession?: boolean }
) {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, TPayload>({
    mutationFn,
    onSuccess: (data) => {
      if (options?.persistSession ?? true) {
        setAccessToken(data.access_token);
        queryClient.setQueryData(authQueryKey, data.user);
      }
    },
  });
}

export function useLogin() {
  return useAuthMutation<LoginPayload>((payload) => authService.login(payload));
}

export function useRegister() {
  return useAuthMutation<RegisterPayload>((payload) => authService.register(payload), {
    persistSession: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    clearAccessToken();
    queryClient.setQueryData(authQueryKey, null);
    void queryClient.invalidateQueries({ queryKey: authQueryKey });
  };
}
