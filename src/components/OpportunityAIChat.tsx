import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIMessageBubble } from '@/components/AIMessageBubble';
import { Bot, Send, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OpportunityAIChatProps {
  opportunity: any;
  category: any;
  open: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const OpportunityAIChat: React.FC<OpportunityAIChatProps> = ({
  opportunity,
  category,
  open,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      // Send initial context message
      const initialMessage = `I'm analyzing the ${opportunity.title} opportunity. This is a ${category.title} edge. ${category.whyItWorks}`;
      handleSendMessage(initialMessage, true);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (message?: string, isInitial = false) => {
    const messageText = message || inputValue;
    if (!messageText.trim() || isLoading) return;

    if (!isInitial) {
      setInputValue('');
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: messageText, 
        timestamp: new Date() 
      }]);
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-explain-edge', {
        body: {
          message: messageText,
          opportunity,
          category,
          context: {
            edge: opportunity.edge,
            confidence: opportunity.confidence,
            reasoning: opportunity.reasoning,
            urgency: opportunity.urgency
          }
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'I encountered an issue analyzing this opportunity.',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('Failed to get AI response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Ask AI About This Edge
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {opportunity.title} • {category.title}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
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
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about risks, strategy, timing..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={() => handleSendMessage()} 
            disabled={isLoading || !inputValue.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
