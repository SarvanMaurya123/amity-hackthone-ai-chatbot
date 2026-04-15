"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { useChatStore } from "@/app/store/chatStore";
import { ChatHistoryItem, streamGeminiResponse } from "@/app/lib/gemini";
import ChatArea from "@/app/components/ChatArea";
import ChatInput from "@/app/components/ChatInput";

export default function ChatPage() {
  const {
    activeConversationId,
    getActiveConversation,
    createConversation,
    addMessage,
    updateMessage,
    isStreaming,
    setStreaming,
  } = useChatStore();

  const conversations = useChatStore((state) => state.conversations);
  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;
  const [composerValue, setComposerValue] = useState("");
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      getActiveConversation();
      initialized.current = true;
    }
  }, [getActiveConversation]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      let convId = activeConversationId;

      if (!convId) {
        convId = createConversation();
      }

      addMessage(convId, { role: "user", content });
      setStreaming(true);
      setShowTypingIndicator(true);

      try {
        const conversation = useChatStore.getState().conversations.find((c) => c.id === convId);
        if (!conversation) return;

        const history: ChatHistoryItem[] = conversation.messages.map((message) => ({
          role: message.role === "user" ? "user" : "model",
          parts: [{ text: message.content }],
        }));

        let assistantMessageId = "";
        let fullContent = "";

        const stream = streamGeminiResponse(content, history);

        for await (const chunk of stream) {
          if (!assistantMessageId) {
            assistantMessageId = addMessage(convId, {
              role: "assistant",
              content: "",
              isStreaming: true,
            });
            setShowTypingIndicator(false);
          }

          fullContent += chunk;
          updateMessage(convId, assistantMessageId, fullContent, true);
        }

        updateMessage(convId, assistantMessageId, fullContent, false);
      } catch (error) {
        console.error("Failed to get AI response:", error);
        if (showTypingIndicator) {
          addMessage(convId, {
            role: "assistant",
            content: "I encountered an error while processing your request. Please try again.",
          });
          setShowTypingIndicator(false);
        }
      } finally {
        setStreaming(false);
      }
    },
    [activeConversationId, createConversation, addMessage, updateMessage, setStreaming, showTypingIndicator]
  );

  const handlePromptSelect = (prompt: string) => {
    setComposerValue(prompt);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <div className="mx-auto flex min-h-0 w-full max-w-[1120px] flex-1 flex-col px-2.5 pb-3 pt-14 sm:px-4 sm:pb-4 sm:pt-5 lg:px-5">
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

        <div className="min-h-0 flex-1 overflow-hidden rounded-[1.45rem] bg-transparent sm:rounded-[1.7rem]">
          <ChatArea
            conversationId={activeConversationId}
            onSelectPrompt={handlePromptSelect}
            showTypingIndicator={showTypingIndicator}
          />
        </div>

        <div className="pt-3 sm:pt-3.5">
          <ChatInput
            onSend={handleSendMessage}
            onValueChange={setComposerValue}
            value={composerValue}
            disabled={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
