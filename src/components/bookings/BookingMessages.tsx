import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean | null;
  created_at: string;
}

interface BookingMessagesProps {
  messages: Message[];
  recipientId: string;
  recipientName: string;
  onSendMessage: (content: string, recipientId: string) => Promise<boolean>;
  onMarkAsRead: () => void;
}

export function BookingMessages({
  messages,
  recipientId,
  recipientName,
  onSendMessage,
  onMarkAsRead,
}: BookingMessagesProps) {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    onMarkAsRead();
  }, [messages, onMarkAsRead]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const success = await onSendMessage(newMessage.trim(), recipientId);
    if (success) {
      setNewMessage('');
    }
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{recipientName}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'مقدم الخدمة' : 'Service Provider'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {isRTL ? 'لا توجد رسائل بعد' : 'No messages yet'}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isMine = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isMine ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-3 py-2",
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {format(new Date(message.created_at), 'p')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRTL ? 'اكتب رسالتك...' : 'Type your message...'}
            className="min-h-[40px] max-h-[100px] resize-none"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
