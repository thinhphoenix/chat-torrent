import { Lock } from '@phosphor-icons/react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ChatHeader } from '@/routes/~shared/chat/components/chat-header';
import { MessageComposer } from '@/routes/~shared/chat/components/message-composer';
import { MessageList } from '@/routes/~shared/chat/components/message-list';
import { PeerList } from '@/routes/~shared/chat/components/peer-list';
import { ShareDialog } from '@/routes/~shared/chat/components/share-dialog';
import { useP2PChat } from '@/routes/~shared/chat/hooks/use-p2p-chat';
import {
  clearUrlParams,
  parseShareLink,
} from '@/routes/~shared/chat/room-link';
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

function getInitialRoomFromUrl() {
  const { roomId } = parseShareLink();
  if (roomId) {
    clearUrlParams();
  }
  return roomId;
}

const pendingRoomId = getInitialRoomFromUrl();

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  // If someone opened a shared link, prompt for password before joining
  const [pendingJoin, setPendingJoin] = useState<string | null>(pendingRoomId);
  const [joinPassword, setJoinPassword] = useState('');

  // Only pass initialRoomId once the user has confirmed the password prompt
  const [confirmedRoom, setConfirmedRoom] = useState<{
    roomId: string;
    password?: string;
  } | null>(pendingRoomId ? null : null);

  const [showPeers, setShowPeers] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const {
    roomId,
    password,
    myName,
    isHost,
    hostId,
    peers,
    messages,
    matchmaking,
    sendMessage,
    kickPeer,
    leaveRoom,
    joinRoomById,
    setRoomPassword,
    connectRandom,
    cancelMatchmaking,
  } = useP2PChat(
    confirmedRoom?.roomId ?? null,
    confirmedRoom?.password ?? null,
  );

  const handleJoinConfirm = () => {
    if (!pendingJoin) return;
    const pw = joinPassword.trim() || undefined;
    setConfirmedRoom({ roomId: pendingJoin, password: pw });
    setPendingJoin(null);
    setJoinPassword('');
    // joinRoomById handles switching if already in a room
    joinRoomById(pendingJoin, pw);
  };

  const handleJoinSkip = () => {
    if (!pendingJoin) return;
    setConfirmedRoom({ roomId: pendingJoin });
    setPendingJoin(null);
    setJoinPassword('');
    joinRoomById(pendingJoin);
  };

  const handleJoinCancel = () => {
    setPendingJoin(null);
    setJoinPassword('');
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader
          roomId={roomId}
          isHost={isHost}
          peerCount={peers.length}
          matchmaking={matchmaking}
          onShareClick={() => setShowShare(true)}
          onRandomConnect={connectRandom}
          onCancelMatchmaking={cancelMatchmaking}
          onLeaveRoom={leaveRoom}
          onTogglePeers={() => setShowPeers((v) => !v)}
        />

        <MessageList messages={messages} hostId={hostId} />

        <MessageComposer onSend={sendMessage} />
      </div>

      {/* Peer sidebar */}
      {showPeers && (
        <div className="w-64 border-l bg-background hidden sm:flex flex-col shrink-0">
          <PeerList
            peers={peers}
            hostId={hostId}
            isHost={isHost}
            myName={myName}
            onKick={kickPeer}
          />
        </div>
      )}

      {/* Mobile peer overlay */}
      {showPeers && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="flex-1 bg-black/40"
            onClick={() => setShowPeers(false)}
            aria-label="Close peer list"
          />
          <div className="w-72 bg-background border-l flex flex-col">
            <PeerList
              peers={peers}
              hostId={hostId}
              isHost={isHost}
              myName={myName}
              onKick={kickPeer}
            />
          </div>
        </div>
      )}

      {/* Share dialog */}
      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        roomId={roomId}
        password={password}
        isHost={isHost}
        onSetPassword={setRoomPassword}
      />

      {/* Password prompt for joining via shared link */}
      <Dialog open={!!pendingJoin} onOpenChange={() => handleJoinCancel()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Join Room
            </DialogTitle>
            <DialogDescription>
              Enter the room password to join, or skip if the room has no
              password.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label
              htmlFor="join-password"
              className="text-sm font-medium mb-1.5 block"
            >
              Password
            </label>
            <Input
              id="join-password"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJoinConfirm();
              }}
              placeholder="Enter room password..."
              type="password"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleJoinCancel}>
              Cancel
            </Button>
            <Button type="button" variant="secondary" onClick={handleJoinSkip}>
              No Password
            </Button>
            <Button type="button" onClick={handleJoinConfirm}>
              Join
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
