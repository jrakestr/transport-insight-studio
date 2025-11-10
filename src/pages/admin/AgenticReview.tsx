import { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
  tool_calls?: any[];
};

const AgenticReview = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI assistant for reviewing pending articles. I can help you:\n\n• Show pending articles with their AI-extracted entities\n• Approve or reject articles\n• Search the web for additional context using Exa\n• Explain AI decisions and verify information\n\nWhat would you like to do?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("agentic-review", {
        body: {
          messages: [...messages, userMessage],
        },
      });

      if (error) throw error;

      // Handle tool calls if present
      if (data.tool_results) {
        // Add assistant message with tool calls
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message.content || "Processing...",
            tool_calls: data.message.tool_calls,
          },
        ]);

        // Make a follow-up call with tool results
        const { data: followUpData, error: followUpError } = await supabase.functions.invoke(
          "agentic-review",
          {
            body: {
              messages: [
                ...messages,
                userMessage,
                data.message,
                ...data.tool_results,
              ],
            },
          }
        );

        if (followUpError) throw followUpError;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: followUpData.message.content,
          },
        ]);
      } else {
        // Simple response without tool calls
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message.content,
          },
        ]);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Agentic Article Review</h1>
          </div>
          <p className="text-muted-foreground">
            Chat with AI to review articles, search for context, and make publishing decisions
          </p>
        </div>

        {/* Messages */}
        <Card className="flex-1 overflow-hidden flex flex-col mb-4">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.tool_calls && (
                    <div className="mt-2 space-y-1">
                      {message.tool_calls.map((call: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          🔧 {call.function.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about pending articles..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AgenticReview;
