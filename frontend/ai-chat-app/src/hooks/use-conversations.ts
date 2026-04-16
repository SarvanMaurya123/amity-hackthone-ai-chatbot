"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { conversationService } from "@/services/conversation-service";
import type { Conversation } from "@/types/conversation";

export const conversationsQueryKey = ["conversations"] as const;

export function useConversations(enabled = true) {
  return useQuery<Conversation[]>({
    queryKey: conversationsQueryKey,
    queryFn: () => conversationService.list(),
    enabled,
    staleTime: 15_000,
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => conversationService.create(title),
    onSuccess: async () => {
      await invalidate(queryClient);
    },
  });
}

export function useAddConversationMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      role,
      content,
    }: {
      conversationId: string;
      role: "user" | "assistant";
      content: string;
    }) => conversationService.addMessage(conversationId, role, content),
    onSuccess: async () => {
      await invalidate(queryClient);
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: { title?: string; pinned?: boolean };
    }) => conversationService.update(conversationId, payload),
    onSuccess: async () => {
      await invalidate(queryClient);
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => conversationService.remove(conversationId),
    onSuccess: async () => {
      await invalidate(queryClient);
    },
  });
}

export function useClearConversations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => conversationService.clear(),
    onSuccess: async () => {
      await invalidate(queryClient);
    },
  });
}
