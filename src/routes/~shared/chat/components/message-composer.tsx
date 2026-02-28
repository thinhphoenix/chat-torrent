import { PaperPlaneTilt } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button } from '@/routes/~shared/components/ui/button';
import { Input } from '@/routes/~shared/components/ui/input';

interface MessageComposerProps {
  onSend: (content: string) => void;
}

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState('');

  const handleSendText = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="border-t bg-background p-3">
      <div className="flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSendText}
          disabled={!text.trim()}
          className="shrink-0 rounded-full"
          title="Send message"
        >
          <PaperPlaneTilt className="h-5 w-5" weight="fill" />
        </Button>
      </div>
    </div>
  );
}
