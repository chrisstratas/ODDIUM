import { useState } from "react";
import { Bot, X, Send, Sparkles, TrendingUp, LineChart, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/hooks/useAIChat";
import { AIMessageBubble } from "./AIMessageBubble";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  context?: any;
}

export const AIAssistant = ({ context }: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { messages, isLoading, sendMessage, clearMessages, updateContext } = useAIChat();

  // Update context when prop changes
  useState(() => {
    if (context) {
      updateContext(context);
    }
  });

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue;
    setInputValue("");
    await sendMessage(message);
  };

  const quickActions = [
    {
      icon: Sparkles,
      label: "Find edges",
      message: "Show me the best edge opportunities right now"
    },
    {
      icon: TrendingUp,
      label: "Betting strategy",
      message: "Suggest a betting strategy for today"
    },
    {
      icon: LineChart,
      label: "Analyze player",
      message: "Analyze a specific player's performance"
    },
    {
      icon: Database,
      label: "Load data",
      message: "Load fresh sports data"
    }
  ];

  const handleQuickAction = (message: string) => {
    sendMessage(message);
  };

  return (
    <>
      {/* Floating AI Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow z-50",
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
          "transition-all duration-300 hover:scale-110"
        )}
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* AI Chat Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Edge Assistant
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-6 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Hi! I'm your Edge Assistant</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    I can help you find betting edges, explain opportunities, suggest strategies, and load fresh data.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto flex flex-col gap-2 p-4"
                      onClick={() => handleQuickAction(action.message)}
                    >
                      <action.icon className="w-5 h-5" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <AIMessageBubble
                    key={index}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-75" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-150" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            {messages.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => handleQuickAction(action.message)}
                    disabled={isLoading}
                  >
                    <action.icon className="w-3 h-3 mr-1" />
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about edges..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !inputValue.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="w-full mt-2"
              >
                Clear conversation
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
