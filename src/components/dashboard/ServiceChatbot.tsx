
import { useState, FormEvent } from "react";
import { Send, Bot } from "lucide-react";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessageList } from "@/components/ui/chat-message-list";

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export const ServiceChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    role: 'assistant',
    content: "¡Hola! Soy el asistente virtual de SERGEN. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre el programa y los datos mostrados."
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulated response - In a real implementation, this would call an AI service
    setTimeout(() => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: "Por el momento soy un chatbot de demostración. Pronto podré ayudarte con tus dudas sobre el programa y los datos mostrados."
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="relative">
      <ExpandableChat
        size="lg"
        position="bottom-right"
        icon={<Bot className="h-6 w-6" />}
      >
        <ExpandableChatHeader className="flex-col text-center justify-center">
          <h1 className="text-xl font-semibold">Asistente Virtual SERGEN ✨</h1>
          <p className="text-sm text-muted-foreground">
            ¿En qué puedo ayudarte hoy?
          </p>
        </ExpandableChatHeader>

        <ExpandableChatBody>
          <ChatMessageList>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.role === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={message.role === "user" ? undefined : "/lovable-uploads/c9da053f-d6d7-4371-bc94-66f8f73b3933.png"}
                  fallback={message.role === "user" ? "TÚ" : "AI"}
                />
                <ChatBubbleMessage
                  variant={message.role === "user" ? "sent" : "received"}
                >
                  {message.content}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src="/lovable-uploads/c9da053f-d6d7-4371-bc94-66f8f73b3933.png"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
          </ChatMessageList>
        </ExpandableChatBody>

        <ExpandableChatFooter>
          <form
            onSubmit={handleSubmit}
            className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
          >
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex items-center p-3 pt-0 justify-end">
              <button
                type="submit"
                className="bg-sergen-500 hover:bg-sergen-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                Enviar
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </ExpandableChatFooter>
      </ExpandableChat>
    </div>
  );
};
