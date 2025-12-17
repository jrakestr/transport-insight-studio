import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Database, Loader2, Sparkles, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: { tool: string; args: any; resultCount: number }[];
  sources?: string[];
}

const SUGGESTED_QUESTIONS = [
  "What are the largest transit agencies in California?",
  "Compare MTA New York with LA Metro",
  "Which agencies have the biggest fleets?",
  "What service providers operate in Texas?",
  "Show me statistics about transit agencies by state",
];

export default function TransitChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("transit-chat", {
        body: {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
        toolsUsed: data.toolsUsed,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Card className="flex flex-col h-[600px] md:h-[700px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Transit Intelligence Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Powered by your agency & provider database
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-lg font-medium mb-2">
              Ask anything about transit agencies
            </h4>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              I can search through {">"}2,000 transit agencies, service providers,
              and contracts to answer your questions with real data.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSend(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>

                  {/* Tool usage badges */}
                  {message.toolsUsed && message.toolsUsed.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        {message.toolsUsed.some(t => t.tool === "web_search") ? (
                          <Globe className="h-3 w-3" />
                        ) : (
                          <Database className="h-3 w-3" />
                        )}
                        <span>Data sources used:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {message.toolsUsed.map((tool, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {tool.tool.replace(/_/g, " ")} ({tool.resultCount})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">Sources:</span>{" "}
                      {message.sources.join(", ")}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching database...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about transit agencies, providers, or statistics..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[44px] w-[44px] flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Responses are generated from your transit agency database
        </p>
      </div>
    </Card>
  );
}
