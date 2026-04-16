import { create } from "zustand";

interface ChatStore {
  activeConversationId: string | null;
  isStreaming: boolean;
  sidebarOpen: boolean;
  createConversation: () => void;
  setActiveConversation: (id: string | null) => void;
  setStreaming: (streaming: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  clearActiveConversation: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeConversationId: null,
  isStreaming: false,
  sidebarOpen: false,
  createConversation: () => set({ activeConversationId: null }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  clearActiveConversation: () => set({ activeConversationId: null }),
}));
