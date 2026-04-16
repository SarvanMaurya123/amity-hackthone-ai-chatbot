"use client";

import { useQuery } from "@tanstack/react-query";

import { systemService } from "@/services/system-service";
import type { ApiHealthResponse, ChatHealthResponse } from "@/types/system";

export const apiHealthQueryKey = ["system", "api-health"] as const;
export const chatHealthQueryKey = ["system", "chat-health"] as const;

export function useApiHealth(enabled = true) {
  return useQuery<ApiHealthResponse>({
    queryKey: apiHealthQueryKey,
    queryFn: () => systemService.apiHealth(),
    enabled,
    retry: 1,
    staleTime: 60_000,
  });
}

export function useChatHealth(enabled = true) {
  return useQuery<ChatHealthResponse>({
    queryKey: chatHealthQueryKey,
    queryFn: () => systemService.chatHealth(),
    enabled,
    retry: 1,
    staleTime: 60_000,
  });
}
