import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ai-elements/../ui/button";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { Copy, RefreshCw, Trash2, Bot } from "lucide-react";
import { toast } from "sonner";
import { loadChat, saveChat, clearChat, loadSettings } from "@/lib/storage";
import masonLogo from "@/assets/mason-logo.png";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ask Mason — AI Assistant" },
      { name: "description", content: "Chat with Mason, your AI workplace assistant." },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "Write a resignation letter",
  "Summarize meeting notes",
  "Generate project ideas",
  "Draft an HR email",
  "Improve this paragraph",
  "Create a weekly work plan",
  "Generate interview questions",
  "Explain Excel formulas",
];

function ChatPage() {
  const [hydrated, setHydrated] = useState(false);
  const initialMessages = useMemo<UIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    return loadChat() as UIMessage[];
  }, []);

  useEffect(() => setHydrated(true), []);

  const settings = typeof window !== "undefined" ? loadSettings() : { personality: "professional", responseLength: "detailed" };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { personality: settings.personality, length: settings.responseLength },
      }),
    [settings.personality, settings.responseLength],
  );

  const { messages, sendMessage, status, setMessages, regenerate, stop } = useChat({
    id: "mason-single",
    messages: initialMessages,
    transport,
    onError: (err) => toast.error(err.message || "Something went wrong."),
  });

  useEffect(() => {
    if (hydrated) saveChat(messages);
  }, [messages, hydrated]);

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === "ready") inputRef.current?.focus();
  }, [status]);

  async function submit(text?: string) {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput("");
    await sendMessage({ text: value });
  }

  function reset() {
    setMessages([]);
    clearChat();
    toast.success("Conversation cleared");
  }

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-4xl flex-col px-3 md:px-6">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <img src={masonLogo} alt="" width={32} height={32} className="h-8 w-8 rounded-lg shadow" />
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight">Mason</h1>
            <p className="text-[11px] text-muted-foreground">Your AI workplace assistant</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button size="sm" variant="ghost" onClick={reset} className="gap-1.5 text-muted-foreground">
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        )}
      </header>

      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<img src={masonLogo} alt="" width={72} height={72} className="h-18 w-18 rounded-2xl shadow-lg" />}
              title="Hi! I'm Mason."
              description="How can I help improve your work today?"
            >
              <img src={masonLogo} alt="" width={80} height={80} className="h-20 w-20 rounded-2xl shadow-lg" />
              <div className="space-y-1">
                <h3 className="font-display text-xl font-semibold">Hi! I'm Mason.</h3>
                <p className="text-sm text-muted-foreground">
                  Your AI Workplace Assistant. How can I help improve your work today?
                </p>
              </div>
              <div className="mt-2 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return message.role === "assistant" ? (
                        <MessageResponse key={i}>{part.text}</MessageResponse>
                      ) : (
                        <div key={i} className="whitespace-pre-wrap">{part.text}</div>
                      );
                    }
                    return null;
                  })}
                  {message.role === "assistant" && (
                    <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                          const text = message.parts
                            .filter((p) => p.type === "text")
                            .map((p) => (p as { text: string }).text)
                            .join("");
                          navigator.clipboard.writeText(text);
                          toast.success("Copied");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => regenerate()}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bot className="h-4 w-4 animate-pulse text-primary" />
                  <TextShimmer>Mason is thinking…</TextShimmer>
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="pb-4 pt-2">
        <PromptInput
          onSubmit={(msg) => {
            submit(msg.text);
          }}
        >
          <PromptInputTextarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Mason anything about your work…"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={!input.trim() && !isLoading} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
        {messages.length > 0 && <ResponsibleAINotice />}
      </div>
    </div>
  );
}
