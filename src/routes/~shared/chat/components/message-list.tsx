import { useEffect, useRef } from 'react';
import { selfId } from 'trystero/torrent';
import type { ChatMessage } from '@/routes/~shared/chat/types';
import { Avatar, AvatarFallback } from '@/routes/~shared/components/ui/avatar';
import { Badge } from '@/routes/~shared/components/ui/badge';
import { ScrollArea } from '@/routes/~shared/components/ui/scroll-area';
import { cn } from '@/routes/~shared/lib/cn';

interface MessageListProps {
  messages: ChatMessage[];
  hostId: string;
}

export function MessageList({ messages, hostId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        No messages yet. Start chatting!
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="space-y-3 py-4">
        {messages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }

          const isSelf = msg.senderId === selfId;
          const isHost = msg.senderId === hostId;

          return (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2 max-w-[85%]',
                isSelf ? 'ml-auto flex-row-reverse' : '',
              )}
            >
              {!isSelf && (
                <Avatar className="h-8 w-8 shrink-0 mt-1">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {msg.senderName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'flex flex-col',
                  isSelf ? 'items-end' : 'items-start',
                )}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {isSelf ? 'You' : msg.senderName}
                  </span>
                  {isHost && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1 py-0 h-4"
                    >
                      Host
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground/60">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div
                  className={cn(
                    'rounded-2xl px-3 py-2 text-sm break-words',
                    isSelf
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm',
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
