import { Check, Copy, Lock, ShareNetwork } from '@phosphor-icons/react';
import { useState } from 'react';
import { buildShareLink } from '@/routes/~shared/chat/room-link';
import { Button } from '@/routes/~shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/routes/~shared/components/ui/dialog';
import { Input } from '@/routes/~shared/components/ui/input';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  password?: string;
  isHost?: boolean;
  onSetPassword?: (password: string) => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  roomId,
  password,
  isHost,
  onSetPassword,
}: ShareDialogProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPw, setCopiedPw] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const shareLink = buildShareLink(roomId);

  const copyToClipboard = async (text: string, type: 'link' | 'pw') => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedPw(true);
      setTimeout(() => setCopiedPw(false), 2000);
    }
  };

  const handleSetPassword = () => {
    const pw = newPassword.trim();
    if (!pw || !onSetPassword) return;
    onSetPassword(pw);
    setNewPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShareNetwork className="h-5 w-5" />
            Share Chat Room
          </DialogTitle>
          <DialogDescription>
            Share the link to invite others. Send the password separately for
            security.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="share-link"
              className="text-sm font-medium mb-1.5 block"
            >
              Invite Link
            </label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareLink}
                readOnly
                className="bg-muted text-xs"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(shareLink, 'link')}
                className="shrink-0"
                title="Copy link"
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {password && (
            <div>
              <label
                htmlFor="share-pw"
                className="text-sm font-medium mb-1.5 flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" />
                Password
              </label>
              <div className="flex gap-2">
                <Input
                  id="share-pw"
                  value={password}
                  readOnly
                  className="bg-muted text-xs font-mono"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(password, 'pw')}
                  className="shrink-0"
                  title="Copy password"
                >
                  {copiedPw ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Share this password separately — never in the link.
              </p>
            </div>
          )}
          {isHost && onSetPassword && (
            <div>
              <label
                htmlFor="set-pw"
                className="text-sm font-medium mb-1.5 flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" />
                {password ? 'Change Password' : 'Set Password'}
              </label>
              <div className="flex gap-2">
                <Input
                  id="set-pw"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSetPassword();
                  }}
                  placeholder="Enter new password..."
                  type="text"
                  className="text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={handleSetPassword}
                  disabled={!newPassword.trim()}
                >
                  {password ? 'Update' : 'Set'}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {password
                  ? 'Changing the password will reconnect all peers.'
                  : 'Set a password to encrypt the room.'}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
