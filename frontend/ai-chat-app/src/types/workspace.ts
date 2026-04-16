export interface WorkspaceProfile {
  full_name: string;
  email: string;
  organization?: string | null;
}

export interface WorkspacePreferences {
  calm_theme: boolean;
  annotation_sounds: boolean;
  auto_save_review_sessions: boolean;
}

export interface WorkspaceInfoItem {
  key: string;
  label: string;
  description: string;
  value: string;
}

export interface WorkspaceResource {
  title: string;
  description: string;
  href: string;
}

export interface WorkspaceStats {
  saved_sessions: number;
  reviewed_messages: number;
  pinned_sessions: number;
  storage_usage: string;
}

export interface WorkspaceResponse {
  profile: WorkspaceProfile;
  preferences: WorkspacePreferences;
  stats: WorkspaceStats;
  account_items: WorkspaceInfoItem[];
  privacy_items: WorkspaceInfoItem[];
  dataset_items: WorkspaceInfoItem[];
  resources: WorkspaceResource[];
}
