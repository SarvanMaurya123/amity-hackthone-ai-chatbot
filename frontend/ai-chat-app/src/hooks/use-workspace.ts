"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authQueryKey } from "@/hooks/use-auth";
import { workspaceService } from "@/services/workspace-service";
import type { WorkspacePreferences, WorkspaceResponse } from "@/types/workspace";

export const workspaceQueryKey = ["workspace"] as const;

export function useWorkspace(enabled = true) {
  return useQuery<WorkspaceResponse>({
    queryKey: workspaceQueryKey,
    queryFn: () => workspaceService.getWorkspace(),
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdateWorkspaceProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workspaceService.updateProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workspaceQueryKey });
      await queryClient.invalidateQueries({ queryKey: authQueryKey });
    },
  });
}

export function useUpdateWorkspacePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<WorkspacePreferences>) => workspaceService.updatePreferences(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workspaceQueryKey });
    },
  });
}
