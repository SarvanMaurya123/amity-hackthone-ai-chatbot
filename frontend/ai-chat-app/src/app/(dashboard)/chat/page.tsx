"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Languages, Workflow } from "lucide-react";
import { useChatStore } from "@/app/store/chatStore";
import ChatArea from "@/app/components/ChatArea";
import ChatInput from "@/app/components/ChatInput";
import { conversationsQueryKey, useConversations } from "@/hooks/use-conversations";
import { useChatHealth } from "@/hooks/use-system";
import { ChatApiError, sendChatMessage } from "@/services/chat-service";

export default function ChatPage() {
  const {
    activeConversationId,
    isStreaming,
    setStreaming,
    setActiveConversation,
  } = useChatStore();
  const queryClient = useQueryClient();
  const { data: conversations = [] } = useConversations(true);
  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;
  const [composerValue, setComposerValue] = useState("");
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [latestReplyMeta, setLatestReplyMeta] = useState<{
    source: "pkl_model" | "llm" | "rule_based";
    detectedLanguage: string;
    languageStyle: string;
  } | null>(null);
  const initialized = useRef(false);
  const chatHealth = useChatHealth(true);

  useEffect(() => {
    if (!initialized.current && conversations.length > 0 && !activeConversationId) {
      setActiveConversation(conversations[0].id);
      initialized.current = true;
    }
  }, [activeConversationId, conversations, setActiveConversation]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      setStreaming(true);
      setShowTypingIndicator(true);

      try {
        const response = await sendChatMessage(content, activeConversationId);
        await queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
        setActiveConversation(response.conversation.id);
        setLatestReplyMeta({
          source: response.source,
          detectedLanguage: response.detected_language,
          languageStyle: response.language_style,
        });
        setShowTypingIndicator(false);
      } catch (error: unknown) {
        console.error("Failed to get AI response:", error);
        const fallbackMessage =
          error instanceof ChatApiError
            ? error.message
            : "I encountered an error while processing your request. Please check the backend API and try again.";
        console.error(fallbackMessage);
        setShowTypingIndicator(false);
      } finally {
        setStreaming(false);
      }
    },
    [
      activeConversationId,
      queryClient,
      setActiveConversation,
      setStreaming,
    ]
  );

  const handlePromptSelect = (prompt: string) => {
    setComposerValue(prompt);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <div className="mx-auto flex min-h-0 w-full max-w-[1120px] flex-1 flex-col px-2.5 pb-3 pt-14 sm:px-4 sm:pb-4 sm:pt-5 lg:px-5">
        {chatHealth.error && (
          <div className="mb-3 rounded-[1.2rem] border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            Backend chat API is unavailable right now. Check the FastAPI server and sign-in token, then try again.
          </div>
        )}

        {chatHealth.data && !chatHealth.data.llm_configured && (
          <div className="mb-3 rounded-[1.2rem] border border-sky-300/15 bg-sky-300/10 px-4 py-3 text-sm text-sky-100">
            The backend is running in local fallback mode. Add a valid Mistral API key to enable LangChain LLM responses.
          </div>
        )}

        {!activeConversation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 rounded-[1.4rem] border border-emerald-300/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(56,189,248,0.08),transparent)] px-4 py-3.5 sm:rounded-[1.6rem] sm:px-4.5"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-300/10 p-2 text-emerald-100 sm:rounded-2xl">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-100">Your mental health dataset workspace is ready.</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Open a previous review session or start a new one to inspect support dialogues, response quality, and training patterns.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {latestReplyMeta && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex flex-wrap items-center gap-2 rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-xs text-slate-300"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-300/10 px-3 py-1 text-emerald-100">
              <Workflow className="h-3.5 w-3.5" />
              Source: {latestReplyMeta.source}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-300/10 px-3 py-1 text-sky-100">
              <Languages className="h-3.5 w-3.5" />
              Language: {latestReplyMeta.detectedLanguage}
            </span>
            <span className="rounded-full bg-white/[0.04] px-3 py-1 text-slate-300">
              Style: {latestReplyMeta.languageStyle}
            </span>
          </motion.div>
        )}

        <div className="min-h-0 flex-1 overflow-hidden rounded-[1.45rem] bg-transparent sm:rounded-[1.7rem]">
          <ChatArea
            conversation={activeConversation}
            onSelectPrompt={handlePromptSelect}
            showTypingIndicator={showTypingIndicator}
          />
        </div>

        <div className="pt-3 sm:pt-3.5">
          <ChatInput
            onSend={handleSendMessage}
            onValueChange={setComposerValue}
            value={composerValue}
            disabled={isStreaming || chatHealth.isLoading || !!chatHealth.error}
          />
        </div>
      </div>
    </div>
  );
}
