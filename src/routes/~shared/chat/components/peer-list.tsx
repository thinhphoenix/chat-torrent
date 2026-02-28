import { Crown, UserMinus, Users } from '@phosphor-icons/react';
import { selfId } from 'trystero/torrent';
import type { PeerInfo } from '@/routes/~shared/chat/types';
import { Avatar, AvatarFallback } from '@/routes/~shared/components/ui/avatar';
import { Badge } from '@/routes/~shared/components/ui/badge';
import { Button } from '@/routes/~shared/components/ui/button';
import { ScrollArea } from '@/routes/~shared/components/ui/scroll-area';
import { Separator } from '@/routes/~shared/components/ui/separator';

interface PeerListProps {
  peers: PeerInfo[];
  hostId: string;
  isHost: boolean;
  myName: string;
  onKick: (peerId: string) => void;
}

export function PeerList({
  peers,
  hostId,
  isHost,
  myName,
  onKick,
}: PeerListProps) {
  const allMembers = [
    { id: selfId, name: myName, isSelf: true },
    ...peers.map((p) => ({ ...p, isSelf: false })),
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          Members ({allMembers.length})
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {allMembers.map((member) => {
            const memberIsHost = member.id === hostId;
            return (
              <div
                key={member.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 group"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm truncate">
                      {member.name}
                      {member.isSelf && (
                        <span className="text-muted-foreground"> (you)</span>
                      )}
                    </span>
                    {memberIsHost && (
                      <Crown
                        className="h-3.5 w-3.5 text-amber-500 shrink-0"
                        weight="fill"
                      />
                    )}
                  </div>
                </div>
                {isHost && !member.isSelf && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => onKick(member.id)}
                    title={`Kick ${member.name}`}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <div className="flex items-center gap-1.5">
          {isHost && (
            <Badge variant="default" className="text-[10px]">
              <Crown className="h-3 w-3 mr-0.5" weight="fill" />
              Host
            </Badge>
          )}
          <span className="text-xs text-muted-foreground truncate">
            {myName}
          </span>
        </div>
      </div>
    </div>
  );
}
