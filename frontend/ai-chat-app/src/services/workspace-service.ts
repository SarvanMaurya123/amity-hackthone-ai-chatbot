import { apiClient } from "@/lib/api/client";
import type { WorkspacePreferences, WorkspaceProfile, WorkspaceResponse } from "@/types/workspace";

export const workspaceService = {
  async getWorkspace(): Promise<WorkspaceResponse> {
    const response = await apiClient.get<WorkspaceResponse>("/workspace");
    return response.data;
  },

  async updateProfile(payload: { full_name: string; organization?: string | null }): Promise<WorkspaceProfile> {
    const response = await apiClient.patch<WorkspaceProfile>("/workspace/profile", payload);
    return response.data;
  },

  async updatePreferences(payload: Partial<WorkspacePreferences>): Promise<WorkspacePreferences> {
    const response = await apiClient.patch<WorkspacePreferences>("/workspace/preferences", payload);
    return response.data;
  },
};
