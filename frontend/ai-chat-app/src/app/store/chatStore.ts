import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
}

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  sidebarOpen: boolean;

  // Actions
  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (conversationId: string, messageId: string, content: string, isStreaming?: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  deleteConversation: (id: string) => void;
  togglePin: (id: string) => void;
  clearConversations: () => void;
  getActiveConversation: () => Conversation | null;
}

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isStreaming: false,
      sidebarOpen: false,

      createConversation: () => {
        const id = generateId();
        const conversation: Conversation = {
          id,
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (conversationId, message) => {
        const id = generateId();
        const newMessage: ChatMessage = {
          ...message,
          id,
          timestamp: new Date(),
        };
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id !== conversationId) return conv;
            const updated = { ...conv, messages: [...conv.messages, newMessage], updatedAt: new Date() };
            // Auto-title from first user message
            if (updated.messages.length === 1 && message.role === "user") {
              updated.title = message.content.slice(0, 60) + (message.content.length > 60 ? "…" : "");
            }
            return updated;
          }),
        }));
        return id;
      },

      updateMessage: (conversationId, messageId, content, isStreaming) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id !== conversationId) return conv;
            return {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, content, isStreaming: isStreaming ?? false } : msg
              ),
            };
          }),
        }));
      },

      setStreaming: (streaming) => set({ isStreaming: streaming }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      deleteConversation: (id) => {
        set((state) => {
          const remaining = state.conversations.filter((c) => c.id !== id);
          return {
            conversations: remaining,
            activeConversationId:
              state.activeConversationId === id
                ? remaining[0]?.id ?? null
                : state.activeConversationId,
          };
        });
      },

      togglePin: (id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c
          ),
        }));
      },

      clearConversations: () =>
        set({
          conversations: [],
          activeConversationId: null,
        }),

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId) ?? null;
      },
    }),
    {
      name: "luminous-ai-chat",
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);
