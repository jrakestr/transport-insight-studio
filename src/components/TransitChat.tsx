import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Database, Loader2, Sparkles, X, Globe, History, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  toolsUsed?: { tool: string; args: any; resultCount: number }[];
  sources?: string[];
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check auth state and load conversations
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user) {
        loadConversations();
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
      if (session?.user) {
        loadConversations();
      } else {
        setConversations([]);
        setConversationId(null);
        setMessages([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }
    setConversations(data || []);
  };

  const loadConversation = async (convId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load conversation");
      return;
    }

    setConversationId(convId);
    setMessages(
      (data || []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        toolsUsed: m.tools_used as any,
        sources: m.sources,
      }))
    );
    setShowHistory(false);
  };

  const createConversation = async (firstMessage: string): Promise<string | null> => {
    if (!userId) return null;

    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    setConversationId(data.id);
    loadConversations();
    return data.id;
  };

  const saveMessage = async (convId: string, message: Message) => {
    if (!userId) return;

    const { error } = await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: message.role,
      content: message.content,
      tools_used: message.toolsUsed || null,
      sources: message.sources || null,
    });

    if (error) {
      console.error("Error saving message:", error);
    }

    // Update conversation timestamp
    await supabase
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", convId);

    if (error) {
      toast.error("Failed to delete conversation");
      return;
    }

    if (conversationId === convId) {
      setConversationId(null);
      setMessages([]);
    }
    loadConversations();
    toast.success("Conversation deleted");
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Create conversation if needed (for logged-in users)
      let currentConvId = conversationId;
      if (userId && !currentConvId) {
        currentConvId = await createConversation(text);
      }

      // Save user message
      if (currentConvId) {
        await saveMessage(currentConvId, userMessage);
      }

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

      // Save assistant message
      if (currentConvId) {
        await saveMessage(currentConvId, assistantMessage);
      }
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

  const startNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setShowHistory(false);
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
              {userId ? "Chat history auto-saved" : "Log in to save chats"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userId && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className={cn(showHistory && "bg-muted")}
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
              <Button variant="ghost" size="sm" onClick={startNewChat}>
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </>
          )}
          {messages.length > 0 && !showHistory && (
            <Button variant="ghost" size="sm" onClick={startNewChat}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && userId && (
        <div className="border-b bg-muted/20 p-3 max-h-[200px] overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground mb-2">Recent Conversations</p>
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved conversations yet</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted transition-colors text-sm",
                    conversationId === conv.id && "bg-muted"
                  )}
                >
                  <span className="truncate flex-1">{conv.title || "Untitled"}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-50 hover:opacity-100"
                    onClick={(e) => deleteConversation(conv.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                key={message.id || index}
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
          {userId 
            ? "Your conversations are automatically saved"
            : "Log in to save your chat history"
          }
        </p>
      </div>
    </Card>
  );
}
