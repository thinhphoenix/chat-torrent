import {
  Crown,
  DoorOpen,
  DotsThreeVertical,
  ShareNetwork,
  Shuffle,
  Spinner,
  UsersThree,
} from '@phosphor-icons/react';
import { Badge } from '@/routes/~shared/components/ui/badge';
import { Button } from '@/routes/~shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/routes/~shared/components/ui/dropdown-menu';

interface ChatHeaderProps {
  roomId: string;
  isHost: boolean;
  peerCount: number;
  matchmaking: boolean;
  onShareClick: () => void;
  onRandomConnect: () => void;
  onCancelMatchmaking: () => void;
  onLeaveRoom: () => void;
  onTogglePeers: () => void;
}

export function ChatHeader({
  roomId,
  isHost,
  peerCount,
  matchmaking,
  onShareClick,
  onRandomConnect,
  onCancelMatchmaking,
  onLeaveRoom,
  onTogglePeers,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold truncate">Room: {roomId}</h1>
            {isHost && (
              <Badge
                variant="default"
                className="text-[10px] px-1.5 py-0 h-4 shrink-0"
              >
                <Crown className="h-2.5 w-2.5 mr-0.5" weight="fill" />
                Host
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {peerCount + 1} member{peerCount !== 0 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {matchmaking && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancelMatchmaking}
            className="text-xs gap-1.5"
          >
            <Spinner className="h-3.5 w-3.5 animate-spin" />
            Searching...
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePeers}
          title="Toggle peer list"
        >
          <UsersThree className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <DotsThreeVertical className="h-5 w-5" weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onShareClick}>
              <ShareNetwork className="h-4 w-4" />
              Share Room
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRandomConnect} disabled={matchmaking}>
              <Shuffle className="h-4 w-4" />
              Talk to Random
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLeaveRoom}
              className="text-destructive focus:text-destructive"
            >
              <DoorOpen className="h-4 w-4" />
              {isHost ? 'Close Room' : 'Leave Room'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
